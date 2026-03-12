# OmniGuard AI — Full Stack Setup

## Stack
- **Frontend**: React.js 18 + Vite (port 5173)
- **Backend**: Spring Boot 3.3 (port 8080)
- **Database**: MongoDB (port 27017)
- **AI**: Groq API (Llama 3.3-70b)
- **Maps**: Leaflet.js + USGS live data

---

## Quick Start

### 1. Configure Environment

**Backend** — edit `backend/.env` or set environment variables:
```
GROQ_API_KEY=gsk_your_groq_api_key
MONGODB_URI=mongodb://localhost:27017/omniguard
```

### 2. Start MongoDB (if local)
```powershell
mongod
```
Or use MongoDB Atlas — just update `MONGODB_URI`.

### 3. Run Backend (Spring Boot)
```powershell
cd d:\Projects\Disaster\backend
$env:GROQ_API_KEY="gsk_your_key_here"
mvn spring-boot:run
```
Backend available at: http://localhost:8080

### 4. Run Frontend (React + Vite)
```powershell
cd d:\Projects\Disaster\frontend
npm run dev
```
Frontend available at: http://localhost:5173

---

## Project Structure
```
Disaster/
├── frontend/           ← React.js (Vite)
│   ├── src/
│   │   ├── components/ ← Navbar, ChatWidget, DisasterMap, AlertsStream, ContextPanel
│   │   ├── pages/      ← Dashboard, Guidelines, Emergency, Contact
│   │   └── services/   ← api.js (Axios)
│   └── vite.config.js  ← Proxy /api → localhost:8080
│
├── backend/            ← Spring Boot
│   ├── src/main/java/com/omniguard/
│   │   ├── controller/ ← ChatController, DisasterController, ContactController
│   │   ├── service/    ← ChatService (Groq + USGS), DisasterService, ContactService
│   │   ├── model/      ← ChatSession, ChatMessage, ContactMessage, DisasterReport
│   │   └── repository/ ← MongoDB repositories
│   └── src/main/resources/application.yml
│
└── (old files)         ← Original Node.js server (kept for reference)
```

## REST API
| Endpoint            | Method | Description              |
|---------------------|--------|--------------------------|
| `/api/health`       | GET    | Health check             |
| `/api/chat`         | POST   | Send AI chat message     |
| `/api/chat/{id}`    | GET    | Get session history      |
| `/api/earthquakes`  | GET    | Live USGS earthquake data|
| `/api/contact`      | POST   | Submit contact form      |
