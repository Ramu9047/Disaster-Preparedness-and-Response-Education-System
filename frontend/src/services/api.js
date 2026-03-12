import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 20000,
    headers: { 'Content-Type': 'application/json' },
});

// ── Chat ─────────────────────────────────────────────────────────────────────

export const sendChatMessage = (sessionId, message, history = []) =>
    api.post('/api/chat', { sessionId, message, history });

export const getChatHistory = (sessionId) =>
    api.get(`/api/chat/${sessionId}`);

// ── Disasters / Map ───────────────────────────────────────────────────────────

export const getEarthquakes = () => api.get('/api/earthquakes');

export const getDisasterReports = () => api.get('/api/disasters');

export const getNasaEvents = (status = 'open') =>
    axios.get(`https://eonet.gsfc.nasa.gov/api/v3/events?status=${status}&categories=wildfires,severeStorms,floods&limit=100&days=30`);

export const submitDisasterReport = (report) =>
    api.post('/api/disasters/report', report);

// ── Contact ───────────────────────────────────────────────────────────────────

export const submitContactForm = (formData) =>
    api.post('/api/contact', formData);

// ── Health ────────────────────────────────────────────────────────────────────

export const checkHealth = () => api.get('/api/health');

export default api;
