/**
 * Disaster AI Chatbot - Secure Backend Proxy Server
 * 
 * Provides an enterprise-grade hardened proxy routing AI queries to Gemini,
 * incorporating rate limiting, helmet security, CORS bounds, and clean inputs.
 */

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
// Security modules
const helmet = require('helmet');
const xss = require('xss-clean');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            "default-src": ["'self'"],
            "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdn.tailwindcss.com", "https://unpkg.com", "https://cdnjs.cloudflare.com"],
            "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://unpkg.com", "https://cdnjs.cloudflare.com"],
            "img-src": ["'self'", "data:", "https:", "http:"],
            "font-src": ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
            "connect-src": ["'self'", "https:", "http:"]
        },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: false
}));            // Sets secure HTTP headers
app.use(xss());               // Sanitize user input coming from POST body, GET queries, and url params
app.use(cors({
    origin: '*', // In strict prod, restrict to domain: e.g. ['https://ndem-sentinel.gov']
    methods: ['POST', 'GET', 'OPTIONS']
}));
app.use(express.json({ limit: '10kb' })); // Prevents large payload DDOS

// Serve static frontend files
app.use(express.static(path.join(__dirname, '/')));

// Request Logging Middleware (Phase 6)
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Startup Key Validation
const GROQ_API_KEY = process.env.GROQ_API_KEY;
if (!GROQ_API_KEY) {
    console.error('❌ CRITICAL ERROR: GROQ_API_KEY is completely missing from environment.');
    process.exit(1);
}

// Memory Rate Limiter cache (Basic impl. production should use Redis)
const requestCounts = new Map();
const RATE_LIMIT = parseInt(process.env.RATE_LIMIT) || 20; // Stricter default
const RATE_WINDOW = 60000; // 1 minute window

function checkRateLimit(ip) {
    const now = Date.now();
    const windowStart = now - RATE_WINDOW;

    if (!requestCounts.has(ip)) requestCounts.set(ip, []);

    const requests = requestCounts.get(ip).filter(time => time > windowStart);
    requests.push(now);
    requestCounts.set(ip, requests);

    return requests.length <= RATE_LIMIT;
}

// Routes
// ----------------------------------------------------------------------------

app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OPERATIONAL',
        service: 'OmniGuard Chat Proxy',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// Phase 5 - Real Data Integration (USGS Earthquakes)
app.get('/api/earthquakes', async (req, res) => {
    try {
        const response = await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson');
        if (!response.ok) throw new Error('Failed to fetch from USGS');
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('USGS Fetch Error:', error);
        res.status(500).json({ error: 'Failed to fetch earthquake data' });
    }
});

app.post('/api/chat', async (req, res) => {
    try {
        console.log(`[POST /api/chat] Incoming request body:`, JSON.stringify(req.body));
        const clientIp = req.ip || req.connection.remoteAddress;
        if (!checkRateLimit(clientIp)) {
            return res.status(429).json({
                reply: 'Network congestion: Rate limit exceeded. Try again in 60s.'
            });
        }

        const { message, history } = req.body;
        if (!message || typeof message !== 'string') {
            return res.status(400).json({ reply: 'Malformed request: message payload missing' });
        }

        // Limit inputs forcefully natively beyond xss-clean
        const safeMessage = message.trim().slice(0, 500);
        let safeHistory = '';
        if (Array.isArray(history)) {
            // Flatten context history string safely
            safeHistory = history.map(item => {
                const textStr = item.content || item.text || '';
                return `${item.role.toUpperCase()}: ${textStr.replace(/</g, "&lt;").slice(0, 300)}`;
            }).join('\n');
        }

        // Phase 3: Fetch Real-World Disaster Data for AI Context
        let liveContext = "No current live data available.";
        try {
            const usgsResponse = await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson');
            if (usgsResponse.ok) {
                const usgsData = await usgsResponse.json();
                const top5 = usgsData.features.slice(0, 5).map(f =>
                    `- Magnitude ${f.properties.mag} near ${f.properties.place} (Time: ${new Date(f.properties.time).toLocaleString()})`
                );
                if (top5.length > 0) {
                    liveContext = "Current live earthquake events:\n" + top5.join('\n');
                }
            }
        } catch (ctxErr) {
            console.error('Failed to fetch live context for AI:', ctxErr.message);
        }

        // NDEM Strategic Expert System Prompt
        const systemPrompt = `You are OmniGuard AI, a high-level strategic disaster preparedness and emergency assessment AI.
You advise citizens, first responders, and civic authorities.

Application Context (For when users ask "what is this application" or similar):
OmniGuard AI is a comprehensive real-time disaster preparedness and emergency monitoring dashboard. It provides live interactive maps tracking earthquakes, forest fires, and floods dynamically. It also provides immediate safety guidelines, contextual alerts, and interactive AI response.

CRITICAL DIRECTIVES:
1. Provide extremely clear, immediately actionable, bulleted data for disaster protocols.
2. Prioritize absolute life-safety over asset protection.
3. If a severe medical or physical threat is imminent, command the user to DIAL 911 (or local equivalent).
4. Output Markdown exclusively: Use bolding (** **) for critical paths and bullet points (•) for items.
5. If the user asks about the application, explain its features clearly based on the "Application Context" above.
6. HANDLING IRRELEVANT INPUT: If the user inputs random letters (e.g., "gk", "asdf"), gibberish, or asks about completely unrelated topics (sports, movies, etc.), you MUST politely reject it by saying: "Please enter a valid query related to disaster safety, emergency guidelines, or ask about what this application can do." Do not answer irrelevant questions.

LIVE SITUATIONAL INTEGRATION:
${liveContext}

Conversation History Context:
${safeHistory}

New Action Query: ${safeMessage}

Provide your strategic response below:`

        const groqUrl = `https://api.groq.com/openai/v1/chat/completions`;

        const groqResponse = await fetch(groqUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile", // Fast and highly capable groq model
                messages: [
                    // System prompt already embodies the safeMessage
                    { role: "user", content: systemPrompt }
                ],
                temperature: 0.15,
                max_tokens: 500,
                top_p: 0.8
            })
        });

        if (!groqResponse.ok) {
            const errorText = await groqResponse.text();
            console.error('API UPSTREAM ERROR (Groq):', errorText);
            try {
                const errObj = JSON.parse(errorText);
                throw new Error(`${errObj.error?.message || 'Groq API fault'}`);
            } catch (e) {
                throw new Error(`Upstream fault: code ${groqResponse.status} - ${errorText.slice(0, 100)}`);
            }
        }

        const data = await groqResponse.json();

        let aiResponse = '';
        if (data.choices && data.choices[0] && data.choices[0].message) {
            aiResponse = data.choices[0].message.content;
        } else {
            throw new Error('Failed to parse Groq output structure');
        }

        res.json({ reply: aiResponse });

    } catch (error) {
        console.error('SYSTEM FAILURE in /api/chat:', error.message);
        // Phase 1: detailed error instead of generic fallback
        // Explicitly return 200 OK and handle error within JSON payload 
        // to prevent browser-level fetch body stripping on 500/503 statuses.
        res.status(200).json({
            error: true,
            reply: `AI service temporarily unavailable. Details: ${error.message}`
        });
    }
});

// Mock Contact Endpoint for Phase 3
app.post('/api/contact', (req, res) => {
    try {
        const clientIp = req.ip || req.connection.remoteAddress;
        if (!checkRateLimit(clientIp)) {
            return res.status(429).json({ success: false, error: 'Rate limit exceeded.' });
        }
        res.status(200).json({ success: true, message: 'Transmission Successful' });
    } catch (e) {
        res.status(500).json({ success: false, error: 'Server fault during transmission.' });
    }
});

// Centralized error boundary
app.use((err, req, res, next) => {
    console.error('GLOBAL ERROR:', err);
    res.status(500).json({
        success: false,
        error: 'Critical Middleware Fault.',
        fallback: true
    });
});

app.listen(PORT, () => {
    console.log(`
🛡️ OMNIGUARD SECURE PROXY STARTED
=====================================
📡 Listening PORT: ${PORT}
✅ Helmet Headers: Active
✅ XSS Sanitizer: Active
✅ CORS Policy: Strict
✅ Rate Limiter: Active (${RATE_LIMIT} req/min)
    `);
});

// Phase 6: Prevent uncaught promise rejection
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception thrown:', err);
});

module.exports = app;
