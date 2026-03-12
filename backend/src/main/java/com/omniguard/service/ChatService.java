package com.omniguard.service;

import com.omniguard.model.ChatMessage;
import com.omniguard.model.ChatSession;
import com.omniguard.repository.ChatSessionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatSessionRepository chatSessionRepository;
    private final WebClient webClient;

    @Value("${groq.api.key:}")
    private String groqApiKey;

    @Value("${groq.api.url}")
    private String groqApiUrl;

    @Value("${groq.api.model}")
    private String groqModel;

    private static final String USGS_URL =
            "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";

    /**
     * Main chat handler: saves history to MongoDB, calls Groq, returns response.
     */
    public Map<String, Object> chat(String sessionId, String message, List<Map<String, String>> clientHistory) {
        // 1. Validate input
        if (message == null || message.isBlank()) {
            return Map.of("reply", "Malformed request: message payload missing");
        }
        String safeMessage = message.trim().substring(0, Math.min(message.length(), 500));

        // 2. Find or create session
        ChatSession session = chatSessionRepository.findBySessionId(sessionId)
                .orElseGet(() -> {
                    ChatSession newSession = ChatSession.builder()
                            .sessionId(sessionId != null ? sessionId : UUID.randomUUID().toString())
                            .build();
                    return chatSessionRepository.save(newSession);
                });

        // 3. Fetch live USGS context for AI
        String liveContext = fetchLiveContext();

        // 4. Build history string from DB or client-provided history
        String historyStr = session.getMessages().stream()
                .skip(Math.max(0, session.getMessages().size() - 10))
                .map(m -> m.getRole().toUpperCase() + ": " + m.getContent().substring(0, Math.min(m.getContent().length(), 300)))
                .collect(Collectors.joining("\n"));

        if (historyStr.isBlank() && clientHistory != null) {
            historyStr = clientHistory.stream()
                    .map(m -> m.getOrDefault("role", "user").toUpperCase() + ": " + m.getOrDefault("content", ""))
                    .collect(Collectors.joining("\n"));
        }

        // 5. Build system prompt
        String systemPrompt = buildSystemPrompt(safeMessage, historyStr, liveContext);

        // 6. Call Groq API
        String aiReply;
        try {
            aiReply = callGroqApi(systemPrompt);
        } catch (Exception e) {
            log.error("Groq API error: {}", e.getMessage());
            aiReply = "AI service temporarily unavailable. Please try again. For emergencies, call 112.";
        }

        // 7. Persist messages to MongoDB
        session.getMessages().add(ChatMessage.builder()
                .role("user").content(safeMessage).timestamp(Instant.now()).build());
        session.getMessages().add(ChatMessage.builder()
                .role("assistant").content(aiReply).timestamp(Instant.now()).build());
        chatSessionRepository.save(session);

        return Map.of("reply", aiReply, "sessionId", session.getSessionId());
    }

    /**
     * Get full history for a session.
     */
    public List<ChatMessage> getHistory(String sessionId) {
        return chatSessionRepository.findBySessionId(sessionId)
                .map(ChatSession::getMessages)
                .orElse(Collections.emptyList());
    }

    private String fetchLiveContext() {
        try {
            Map<?, ?> data = webClient.get()
                    .uri(USGS_URL)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            if (data == null) return "No current live data available.";

            @SuppressWarnings("unchecked")
            List<Map<?, ?>> features = (List<Map<?, ?>>) data.get("features");
            if (features == null || features.isEmpty()) return "No earthquake data available.";

            StringBuilder sb = new StringBuilder("Current live earthquake events:\n");
            features.stream().limit(5).forEach(f -> {
                @SuppressWarnings("unchecked")
                Map<?, ?> props = (Map<?, ?>) f.get("properties");
                if (props != null) {
                    sb.append("- Magnitude ").append(props.get("mag"))
                      .append(" near ").append(props.get("place"))
                      .append("\n");
                }
            });
            return sb.toString();
        } catch (Exception e) {
            log.warn("Failed to fetch live USGS context: {}", e.getMessage());
            return "Live data temporarily unavailable.";
        }
    }

    private String buildSystemPrompt(String message, String history, String liveContext) {
        return """
            You are OmniGuard AI, a high-level strategic disaster preparedness and emergency assessment AI.
            You advise citizens, first responders, and civic authorities.

            Application Context:
            OmniGuard AI is a comprehensive real-time disaster preparedness and emergency monitoring dashboard.
            It provides live interactive maps tracking earthquakes, forest fires, and floods dynamically.
            It also provides immediate safety guidelines, contextual alerts, and interactive AI response.

            CRITICAL DIRECTIVES:
            1. Provide extremely clear, immediately actionable, bulleted data for disaster protocols.
            2. Prioritize absolute life-safety over asset protection.
            3. If a severe medical or physical threat is imminent, command the user to DIAL 112 (or local equivalent).
            4. Output Markdown exclusively: Use bolding (**) for critical paths and bullet points for items.
            5. If the user asks about the application, explain its features clearly.
            6. HANDLING IRRELEVANT INPUT: If the user inputs gibberish or asks completely unrelated topics, politely say:
               "Please enter a valid query related to disaster safety, emergency guidelines, or ask about this application."

            LIVE SITUATIONAL INTEGRATION:
            %s

            Conversation History:
            %s

            New Query: %s

            Provide your strategic response below:
            """.formatted(liveContext, history, message);
    }

    @SuppressWarnings("unchecked")
    private String callGroqApi(String prompt) {
        Map<String, Object> body = Map.of(
                "model", groqModel,
                "messages", List.of(Map.of("role", "user", "content", prompt)),
                "temperature", 0.15,
                "max_tokens", 600,
                "top_p", 0.8
        );

        Map<?, ?> response = webClient.post()
                .uri(groqApiUrl)
                .header("Authorization", "Bearer " + groqApiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(body)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        if (response == null) throw new RuntimeException("Empty response from Groq");

        List<Map<?, ?>> choices = (List<Map<?, ?>>) response.get("choices");
        if (choices == null || choices.isEmpty()) throw new RuntimeException("No choices in Groq response");

        Map<?, ?> msg = (Map<?, ?>) choices.get(0).get("message");
        if (msg == null) throw new RuntimeException("No message in Groq choice");

        return (String) msg.get("content");
    }
}
