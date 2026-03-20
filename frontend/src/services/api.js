import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 20000,
    headers: { 'Content-Type': 'application/json' },
});

// ── JWT auto-attach interceptor ───────────────────────────────────────────────
api.interceptors.request.use(config => {
    const token = localStorage.getItem('og_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// ── Auth ──────────────────────────────────────────────────────────────────────
export const loginApi      = (username, password) => api.post('/api/auth/login', { username, password });
export const registerApi   = (body)               => api.post('/api/auth/register', body);
export const profileApi    = ()                   => api.get('/api/auth/profile');

// ── Chat ─────────────────────────────────────────────────────────────────────
export const sendChatMessage = (sessionId, message, history = []) =>
    api.post('/api/chat', { sessionId, message, history });

export const getChatHistory = (sessionId) => api.get(`/api/chat/${sessionId}`);

// ── Disasters / Map ───────────────────────────────────────────────────────────
export const getEarthquakes       = ()       => api.get('/api/earthquakes');
export const getDisasterReports   = ()       => api.get('/api/disasters');
export const getNasaEvents        = (status = 'open') =>
    axios.get(`https://eonet.gsfc.nasa.gov/api/v3/events?status=${status}&categories=wildfires,severeStorms,floods&limit=100&days=30`);
export const submitDisasterReport = (report) => api.post('/api/disasters/report', report);

// ── Incidents (protected) ─────────────────────────────────────────────────────
export const getIncidents     = (filter)    => api.get('/api/incidents', { params: filter ? { filter } : {} });
export const getIncidentById  = (id)        => api.get(`/api/incidents/${id}`);
export const createIncident   = (body)      => api.post('/api/incidents', body);
export const updateIncident   = (id, body)  => api.put(`/api/incidents/${id}`, body);

// ── Tasks (protected) ─────────────────────────────────────────────────────────
export const getTasks     = ()           => api.get('/api/tasks');
export const getTaskById  = (id)         => api.get(`/api/tasks/${id}`);
export const createTask   = (body)       => api.post('/api/tasks', body);
export const updateTask   = (id, body)   => api.put(`/api/tasks/${id}`, body);
export const getOverdueTasks = ()        => api.get('/api/tasks/overdue');

// ── Alerts ────────────────────────────────────────────────────────────────────
export const getAlerts    = ()     => api.get('/api/alerts');
export const createAlert  = (body) => api.post('/api/alerts', body);

// ── Resources ─────────────────────────────────────────────────────────────────
export const getResources    = (params = {}) => api.get('/api/resources', { params });
export const updateResource  = (id, body)    => api.put(`/api/resources/${id}`, body);

// ── Contact ───────────────────────────────────────────────────────────────────
export const submitContactForm = (formData) => api.post('/api/contact', formData);

// ── Health ────────────────────────────────────────────────────────────────────
export const checkHealth = () => api.get('/api/health');

export default api;
