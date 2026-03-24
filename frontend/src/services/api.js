import axios from 'axios';
import { toast } from 'react-toastify';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 30000,
    headers: { 'Content-Type': 'application/json' },
});

// ── JWT auto-attach interceptor ───────────────────────────────────────────────
api.interceptors.request.use(config => {
    const token = localStorage.getItem('og_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// ── Universal Error Handling & Retry ──────────────────────────────────────────
api.interceptors.response.use(
    response => response,
    async error => {
        const { config, response } = error;
        
        if ((!response || [503, 504].includes(response.status)) && (!config._retryCount || config._retryCount < 1)) {
            config._retryCount = (config._retryCount || 0) + 1;
            return api(config);
        }

        if (response) {
            if (response.status === 403) toast.error("Access Denied: You do not have permission for this action. 🔒");
            else if (response.status >= 500) toast.error(`System Error [${response.status}]: Server is experiencing fluctuations.`);
        } else {
            toast.error("Network Link Severed: Check your connection. 📡");
        }

        return Promise.reject(error);
    }
);

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
export const getContactMessages = () => api.get('/api/contact');

// ── Volunteer Applications ───────────────────────────────────────────────────
export const submitVolunteerApplication = (formData) => api.post('/api/volunteer-applications', formData);
export const getVolunteerApplications = () => api.get('/api/volunteer-applications');
export const approveVolunteerApplication = (id) => api.post(`/api/volunteer-applications/${id}/approve`);
export const rejectVolunteerApplication = (id) => api.post(`/api/volunteer-applications/${id}/reject`);

// ── Health ────────────────────────────────────────────────────────────────────
export const checkHealth = () => api.get('/api/health');

export default api;
