# 🤖 Disaster AI Chatbot - Gemini API Integration

This document provides complete setup instructions for the Gemini AI-powered disaster preparedness chatbot.

## 📋 Overview

The Disaster AI Chatbot now features **hybrid intelligence**:

1. **Rule-Based Responses** - Instant answers for known disaster topics
2. **Gemini AI Integration** - Smart AI responses for complex queries
3. **Secure Backend Proxy** - API key protection via Node.js backend

---

## 🏗️ Architecture

```
┌─────────────────┐      ┌──────────────────┐      ┌─────────────────┐
│   Frontend      │      │  Backend Proxy   │      │   Gemini API    │
│  (script.js)    │──────▶│   (server.js)    │──────▶│  (Google AI)    │
│                 │      │   Port: 3000     │      │                 │
└─────────────────┘      └──────────────────┘      └─────────────────┘
         │
         ▼
┌─────────────────┐
│ Rule-Based DB   │
│ (knowledgeBase) │
└─────────────────┘
```

---

## 🚀 Quick Start

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Get your Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

3. Edit `.env` and add your API key:
   ```env
   GEMINI_API_KEY=your_actual_api_key_here
   PORT=3000
   ```

### Step 3: Start the Backend Server

```bash
node server.js
```

You should see:
```
🚀 Disaster AI Chatbot Backend Server
=====================================
✅ Server running on http://localhost:3000
✅ Health check: http://localhost:3000/health
✅ Chat endpoint: POST http://localhost:3000/api/chat
```

### Step 4: Open the Frontend

Open `index.html` in your browser (using Live Server or directly).

---

## 🔧 Configuration Options

### Frontend Configuration (`script.js`)

```javascript
const chatbotConfig = {
    // AI Mode: 'rule' (rule-based only) or 'gemini' (hybrid)
    aiMode: 'gemini',
    
    // Backend API endpoint
    backendEndpoint: 'http://localhost:3000/api/chat',
    
    // Request timeout (milliseconds)
    requestTimeout: 15000,
    
    // Sound notifications
    soundEnabled: true
};
```

### Backend Configuration (`.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `GEMINI_API_KEY` | Your Google Gemini API key | Required |
| `PORT` | Backend server port | 3000 |
| `RATE_LIMIT` | Max requests per minute per IP | 30 |

---

## 🧠 How It Works

### Hybrid Response Flow

```
User Message
     │
     ▼
┌─────────────────┐
│ Check Rule-Based│
│  Knowledge Base │
└─────────────────┘
     │
     ├─ Match Found ──▶ Return Rule-Based Response
     │
     └─ No Match ─────▶ Call Gemini AI via Backend
                            │
                            ▼
                    ┌─────────────────┐
                    │  Gemini API     │
                    │  (Secure Proxy) │
                    └─────────────────┘
                            │
                            ├─ Success ──▶ Return AI Response
                            │
                            └─ Error ───▶ Return Fallback Message
```

### Response Priority

1. **Rule-Based (Fastest)** - Keywords like "earthquake", "flood", "fire"
2. **Gemini AI (Smart)** - Complex queries requiring AI analysis
3. **Fallback (Safe)** - Error messages with emergency resources

---

## 🛡️ Security Features

✅ **API Key Protection** - Key stored only in backend `.env` file  
✅ **No Frontend Exposure** - API key never sent to browser  
✅ **Rate Limiting** - Prevents API abuse (30 requests/minute)  
✅ **Input Validation** - Message length limited to 500 characters  
✅ **CORS Protection** - Configurable allowed origins  
✅ **Safety Settings** - Gemini content filtering enabled  

---

## 📝 API Endpoints

### Health Check
```http
GET http://localhost:3000/health
```

Response:
```json
{
  "status": "ok",
  "service": "Disaster AI Chatbot Backend",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Chat Endpoint
```http
POST http://localhost:3000/api/chat
Content-Type: application/json

{
  "message": "What should I do during an earthquake?"
}
```

Response:
```json
{
  "success": true,
  "response": "🌍 **EARTHQUAKE SAFETY TIPS**\n\n**During an Earthquake:**\n• DROP to your hands and knees...",
  "source": "rule-based",
  "timestamp": "2024-01-15T10:30:01.000Z"
}
```

---

## 🎨 UX Enhancements

### Implemented Features

- ✅ **Typing Indicator** - Shows "AI is analyzing..." during API calls
- ✅ **Disabled Send Button** - Prevents duplicate requests
- ✅ **Auto-Scroll** - Automatically scrolls to latest message
- ✅ **AI Attribution** - Shows "🤖 Powered by Gemini AI" for AI responses
- ✅ **Error Handling** - Graceful fallback with emergency resources
- ✅ **Sound Notifications** - Audio alert for new messages
- ✅ **Quick Replies** - One-click access to common topics

---

## 🧪 Testing

### Test Rule-Based Responses
Type these keywords to test instant responses:
- "earthquake"
- "flood"
- "fire"
- "cyclone"
- "emergency kit"

### Test Gemini AI Responses
Ask complex questions:
- "What should I do if I'm trapped in a building during a fire?"
- "How do I prepare for a hurricane evacuation with pets?"
- "What are the psychological effects of disasters on students?"

### Test Fallback Behavior
1. Stop the backend server (`Ctrl+C`)
2. Ask a non-rule-based question
3. Verify fallback message appears with emergency resources

---

## 🚨 Emergency Features

The chatbot includes built-in emergency guidance:

- **911 Reminder** - Always suggests calling emergency services
- **Campus Resources** - References campus security and health services
- **Offline Mode** - Works without AI for basic disaster info
- **Safety-First Prompts** - Gemini instructed to prioritize human safety

---

## 🔍 Troubleshooting

### Backend Won't Start
```bash
# Check if port 3000 is in use
lsof -i :3000

# Kill process using port 3000
kill -9 <PID>

# Or use different port in .env
PORT=3001
```

### API Key Errors
```bash
# Verify .env file exists
cat .env

# Check GEMINI_API_KEY is set
echo $GEMINI_API_KEY
```

### Frontend Can't Connect
1. Ensure backend is running on correct port
2. Check `backendEndpoint` in `script.js` matches your backend URL
3. Verify CORS settings in `server.js`

### Gemini API Errors
- Check API key validity at [Google AI Studio](https://makersuite.google.com/app/apikey)
- Verify rate limits haven't been exceeded
- Check network connectivity

---

## 📦 File Structure

```
Disaster/
├── index.html              # Main frontend page
├── script.js               # Frontend chatbot logic
├── style.css               # Styling
├── server.js               # Backend proxy server ⭐ NEW
├── package.json            # Node.js dependencies ⭐ NEW
├── .env                    # API keys (not in git) ⭐ NEW
├── .env.example            # Environment template ⭐ NEW
├── README-GEMINI-SETUP.md  # This file ⭐ NEW
├── TODO.md                 # Implementation checklist
├── disasters.html          # Disaster info pages
├── emergency.html          # Emergency contacts
└── contact.html            # Contact form
```

---

## 🎯 Next Steps

1. ✅ Get Gemini API key from Google AI Studio
2. ✅ Run `npm install` to install dependencies
3. ✅ Create `.env` file with your API key
4. ✅ Start backend with `node server.js`
5. ✅ Open `index.html` and test the chatbot
6. ✅ Try both rule-based and AI-powered queries

---

## 📚 Resources

- [Google Gemini API Documentation](https://ai.google.dev/docs)
- [Get Gemini API Key](https://makersuite.google.com/app/apikey)
- [Node.js Express Documentation](https://expressjs.com/)
- [Disaster Preparedness Guidelines](https://www.ready.gov/)

---

**🎉 Your Disaster AI Chatbot is now powered by Gemini AI!**
