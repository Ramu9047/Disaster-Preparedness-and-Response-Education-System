# AI-Powered Multi-Disaster Preparedness PWA

This project sets up an AI-Powered Multi-Disaster Preparedness Progressive Web App (PWA) with the following tech stack:

- **Frontend**: React.js + Tailwind CSS + Leaflet Maps
- **Backend**: Node.js + Express
- **Features**: Live disaster map, alerts, AI chatbot, risk predictor, offline PWA support

## Recommended Folder Structure

```
disaster-pwa/
├── frontend/          # React frontend application
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── ...
├── backend/           # Node.js Express backend
│   ├── src/
│   ├── package.json
│   └── ...
└── README.md          # This file
```

## Step-by-Step Installation Commands

### Prerequisites
- Node.js (version 14 or higher) - If not installed, download and install from https://nodejs.org/

### 1. Install Node.js (if not already installed)
Download the Node.js installer from https://nodejs.org/ and run it to install Node.js and npm.

Verify installation:
```bash
node --version
npm --version
```

### 2. Create Project Directory and Navigate
```bash
mkdir disaster-pwa
cd disaster-pwa
```

### 2. Set Up React Frontend Project
```bash
npx create-react-app frontend --template typescript
cd frontend
```

### 3. Install Tailwind CSS
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 4. Install Leaflet Map Packages
```bash
npm install leaflet react-leaflet
```

### 5. Install Axios for API Calls
```bash
npm install axios
```

### 6. Install Firebase (Optional)
```bash
npm install firebase
```

### 7. Enable PWA Service Worker
```bash
npm install workbox-webpack-plugin --save-dev
```

### 8. Set Up Node.js Express Backend
```bash
cd ..
mkdir backend
cd backend
npm init -y
npm install express cors dotenv
```

### 9. Additional Backend Setup
```bash
npm install body-parser helmet morgan
```

### 10. Configure Tailwind CSS (in frontend/)
Edit `tailwind.config.js`:
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### 11. Configure PWA (in frontend/)
Update `src/index.js` to register service worker:
```javascript
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
serviceWorkerRegistration.register();
```

### 12. Run the Applications
```bash
# In frontend/
npm start

# In backend/ (new terminal)
cd backend
node src/app.js
```

## Terminal Commands Summary
Run these commands in sequence from the `disaster-pwa` directory:

1. `npx create-react-app frontend --template typescript`
2. `cd frontend && npm install -D tailwindcss postcss autoprefixer && npx tailwindcss init -p`
3. `cd frontend && npm install leaflet react-leaflet axios firebase workbox-webpack-plugin --save-dev`
4. `cd .. && mkdir backend && cd backend && npm init -y && npm install express cors dotenv body-parser helmet morgan`

## Next Steps
- Configure Tailwind CSS classes in your React components
- Set up Leaflet map component
- Implement Express routes for backend API
- Add PWA manifest and service worker
- Integrate AI chatbot and risk predictor features
