/**
 * API Logic Module
 * Single abstraction layer to manage all direct external or backend calls securely
 */

class APILogic {
    constructor() {
        this.chatbotEndpoint = 'http://localhost:3000/api/chat';
        this.contactEndpoint = 'http://localhost:3000/api/contact'; // For Phase 3 implementation
        this.requestTimeout = 15000;

        // Offline Fallback KB
        this.fallbackKB = {
            earthquake: {
                keywords: ['earthquake', 'quake', 'shake'],
                response: `🌍 **EARTHQUAKE PROTOCOL**\n\n**1. During:** \n• DROP to hands and knees.\n• COVER head/neck under sturdy furniture.\n• HOLD ON until shaking stops.\n\n**2. After:** \n• Expect aftershocks. Avoid elevators.\n• Evacuate if structure is compromised.\n\n⚠️ Call 911 if trapped or severely injured.`
            },
            fire: {
                keywords: ['fire', 'flame', 'smoke', 'burn'],
                response: `🔥 **FIRE EVACUATION**\n\n**1. Immediate Action:**\n• GET OUT immediately.\n• Stay low under smoke.\n• Check doors for heat before opening.\n\n**2. Do NOT:**\n• Attempt to gather belongings.\n• Return to the building under any circumstance.\n\n⚠️ Dial 911 from a secure distance.`
            },
            flood: {
                keywords: ['flood', 'water', 'tsunami'],
                response: `🌊 **FLOOD SAFETY**\n\n**1. Immediate Action:**\n• Seek high ground immediately.\n• Avoid walking/driving through moving water (6 inches can knock you down).\n\n**2. Prepare:**\n• Turn off utilities at main switches.\n\n⚠️ Contact emergency response if stranded.`
            }
        };
    }

    /**
     * Get Chatbot Response, maintaining history
     */
    async getAIResponse(message, history = []) {
        // 1. Try Keyword Match for Instant Offline Relief
        const lowerMessage = message.toLowerCase();
        for (const [key, data] of Object.entries(this.fallbackKB)) {
            for (const keyword of data.keywords) {
                if (lowerMessage.includes(keyword)) {
                    // Slight delay to simulate natural feel
                    return new Promise(resolve => setTimeout(() => resolve({ text: data.response, source: 'offline_kb' }), 600));
                }
            }
        }

        // 2. Try Backend Gemini Integration
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.requestTimeout);

            const reqBody = { message, history: history.slice(-5) }; // Send last 5 for context

            const response = await fetch(this.chatbotEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reqBody),
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (!response.ok) throw new Error('Backend failed');

            const resData = await response.json();
            return { text: resData.response, source: resData.source };
        } catch (error) {
            console.error('AI Processing Error:', error);
            return {
                text: `⚠️ **System Fallback**\n\nAI assessment cluster unreachable. Immediate safety overrides enabled:\n• Dial 911 for emergencies.\n• Follow standard protocols (try typing "fire", "flood", "earthquake").`,
                source: 'fallback_error'
            };
        }
    }

    /**
     * Contact Form Sender Simulation
     */
    async sendContactForm(formData) {
        try {
            // Simulated delay
            await new Promise(r => setTimeout(r, 1200));

            // In a real app we would post this
            // const res = await fetch(this.contactEndpoint, { method: 'POST', body: JSON.stringify(formData) });
            // if(!res.ok) throw new Error();

            return { success: true };
        } catch (e) {
            return { success: false, error: 'Transmission interrupted. Please try again.' };
        }
    }
}

// Export for app.js
window.APILogic = APILogic;
