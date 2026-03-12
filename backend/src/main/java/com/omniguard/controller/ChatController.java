package com.omniguard.controller;

import com.omniguard.model.ChatMessage;
import com.omniguard.service.ChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    /**
     * POST /api/chat
     * Body: { sessionId, message, history[] }
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> chat(@RequestBody Map<String, Object> body) {
        String sessionId = (String) body.getOrDefault("sessionId", null);
        String message   = (String) body.getOrDefault("message", "");

        @SuppressWarnings("unchecked")
        List<Map<String, String>> history = (List<Map<String, String>>) body.getOrDefault("history", List.of());

        log.info("[POST /api/chat] sessionId={}, message length={}", sessionId, message.length());

        Map<String, Object> result = chatService.chat(sessionId, message, history);
        return ResponseEntity.ok(result);
    }

    /**
     * GET /api/chat/{sessionId}
     * Returns full conversation history for a session
     */
    @GetMapping("/{sessionId}")
    public ResponseEntity<List<ChatMessage>> getHistory(@PathVariable String sessionId) {
        List<ChatMessage> history = chatService.getHistory(sessionId);
        return ResponseEntity.ok(history);
    }
}
