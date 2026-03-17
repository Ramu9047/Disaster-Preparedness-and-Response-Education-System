// Strict Fix: AI Assistant Module
document.addEventListener('DOMContentLoaded', () => {
    console.log("AI Assistant: Checking DOM...");

    // 1. Z-index safe floating button and chat components
    const chatToggle = document.getElementById('chat-toggle');
    const chatWindow = document.getElementById('chat-window');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');
    const chatForm = document.getElementById('chat-form');
    const messagesContainer = document.getElementById('chat-messages');
    const typingIndicator = document.getElementById('typing-indicator');

    // 6. Ensure no null reference errors by checking all DOM nodes.
    if (!chatToggle || !chatWindow || !chatInput || !sendBtn || !chatForm || !messagesContainer) {
        console.warn("AI Assistant DOM elements missing on this page. Aborting safely.");
        return;
    }

    console.log("AI Assistant: Initialized safely.");

    let messageArray = [];
    let isChatOpen = false;

    // 2. The button must toggle the chat window
    chatToggle.addEventListener('click', () => {
        console.log("Button click: Toggling AI Chat window.");
        isChatOpen = !isChatOpen;
        if (isChatOpen) {
            chatWindow.classList.remove('hidden');
            chatWindow.classList.add('flex');
            setTimeout(() => {
                chatWindow.classList.remove('opacity-0', 'scale-95');
                chatInput.focus();
                scrollToBottom();
            }, 10);
        } else {
            chatWindow.classList.add('opacity-0', 'scale-95');
            setTimeout(() => {
                chatWindow.classList.add('hidden');
                chatWindow.classList.remove('flex');
            }, 300);
        }
    });

    // Close button if available
    const chatClose = document.getElementById('chat-close');
    if (chatClose) {
        chatClose.addEventListener('click', () => {
            if (isChatOpen) chatToggle.click();
        });
    }

    // 3. Auto-scroll to bottom
    function scrollToBottom() {
        if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }

    function formatMessage(text) {
        if (!text) return "";
        let formatted = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong class="text-blue-300 font-bold">$1</strong>');
        formatted = formatted.replace(/^[\*\-\•]\s+(.*)$/gm, '<div class="flex items-start mt-1"><span class="mr-2 text-blue-400 font-bold">•</span><span class="flex-1">$1</span></div>');
        return formatted;
    }

    function appendMessage(role, text) {
        const wrapper = document.createElement('div');
        wrapper.className = `flex mb-4 ${role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`;

        const bubble = document.createElement('div');
        bubble.className = role === 'user'
            ? 'bg-blue-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 max-w-[90%] text-sm shadow-md whitespace-pre-wrap leading-relaxed'
            : 'bg-gray-800 border border-gray-700 text-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[90%] text-sm shadow-md whitespace-pre-wrap leading-relaxed';

        bubble.innerHTML = formatMessage(text);

        wrapper.appendChild(bubble);
        messagesContainer.appendChild(wrapper);
        scrollToBottom();
    }

    // 3. Chat system must push user msg, show spinner, POST to /api/chat, await JSON
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const text = chatInput.value.trim();
        if (!text) return;

        chatInput.value = '';
        appendMessage('user', text);
        messageArray.push({ role: 'user', content: text });

        chatInput.disabled = true;
        sendBtn.disabled = true;
        if (typingIndicator) typingIndicator.classList.remove('hidden');
        scrollToBottom();

        console.log("Sending:", text);
        try {
            const response = await fetch('http://localhost:3000/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text, history: messageArray.slice(-5) })
            });

            const responseText = await response.text();
            let data = {};

            try {
                if (responseText) {
                    data = JSON.parse(responseText);
                } else {
                    throw new Error("Server returned an empty response instead of data.");
                }
            } catch (parseError) {
                console.error("Failed to parse JSON response:", responseText);
                throw new Error(response.ok ? "System returned malformed response data." : `HTTP ${response.status} Error - Connectivity disrupted.`);
            }

            console.log("Response:", data);

            if (!response.ok) {
                // If Gemini truly fails, output detailed error
                throw new Error(data.reply || data.error || `HTTP Error! status: ${response.status}`);
            }

            const reply = data.reply || "⚠ AI did not return a valid reply property.";
            messageArray.push({ role: 'assistant', content: reply });
            appendMessage('assistant', reply);

        } catch (error) {
            console.error("Fetch error:", error);
            // Remove blind fallback, show actual error returned from backend
            appendMessage('assistant', error.message);
        } finally {
            if (typingIndicator) typingIndicator.classList.add('hidden');
            chatInput.disabled = false;
            sendBtn.disabled = false;
            chatInput.focus();
            scrollToBottom();
        }
    });

    // Handle Quick Action Chips
    document.querySelectorAll('.quick-reply-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            chatInput.value = btn.dataset.query;
            chatForm.dispatchEvent(new Event('submit'));
        });
    });

    // Optional: add a greeting from the system if array is empty
    if (messageArray.length === 0) {
        appendMessage('assistant', "System online. I am OmniGuard AI. How can I assist you with disaster protocols today?");
    }
});
