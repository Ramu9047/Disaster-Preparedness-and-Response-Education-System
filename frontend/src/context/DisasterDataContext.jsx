import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
    getIncidents, createIncident as apiCreateIncident, updateIncident as apiUpdateIncident,
    getTasks,     createTask     as apiCreateTask,     updateTask     as apiUpdateTask,
    getAlerts,    createAlert    as apiCreateAlert,
    getResources, updateResource as apiUpdateResource,
} from '../services/api';

export const TASK_STATUS     = { PENDING: 'PENDING', IN_PROGRESS: 'IN_PROGRESS', COMPLETED: 'COMPLETED', ESCALATED: 'ESCALATED' };
export const TASK_PRIORITY   = { HIGH: 'HIGH', MEDIUM: 'MEDIUM', LOW: 'LOW' };
export const INCIDENT_STATUS = { REPORTED: 'REPORTED', ACKNOWLEDGED: 'ACKNOWLEDGED', RESOLVED: 'RESOLVED' };

const now = () => new Date().toISOString();

// ── Seed fallback (used when backend is unreachable / demo mode) ──────────────
const INITIAL_INCIDENTS = [
    { id: 'inc-001', type: 'Flood',            severity: 'HIGH',     location: 'Anna Nagar, Chennai',  lat: 13.085, lng: 80.21, description: 'Major flooding in residential area. 200+ families displaced.', reportedBy: 'u4', reporterName: 'Ravi Kumar',           status: INCIDENT_STATUS.ACKNOWLEDGED, timestamp: new Date(Date.now() - 3600000).toISOString(),  images: [], assignedOfficerId: 'u2' },
    { id: 'inc-002', type: 'Cyclone',          severity: 'CRITICAL', location: 'Marina Beach, Chennai', lat: 13.05, lng: 80.28, description: 'Cyclonic storm approaching coastline. Category 3.',           reportedBy: 'u2', reporterName: 'Dy. Collector Priya',  status: INCIDENT_STATUS.REPORTED,     timestamp: new Date(Date.now() - 7200000).toISOString(),  images: [], assignedOfficerId: null },
    { id: 'inc-003', type: 'Building Collapse',severity: 'CRITICAL', location: 'T. Nagar, Chennai',     lat: 13.04, lng: 80.23, description: 'Old building partially collapsed. Residents trapped.',       reportedBy: 'u4', reporterName: 'Ravi Kumar',           status: INCIDENT_STATUS.REPORTED,     timestamp: new Date(Date.now() - 1800000).toISOString(),  images: [], assignedOfficerId: null },
    { id: 'inc-004', type: 'Fire',             severity: 'MEDIUM',   location: 'Guindy Industrial Area', lat: 13.01, lng: 80.21, description: 'Fire at warehouse. Fire department on scene.',              reportedBy: 'u5', reporterName: 'Meena Devi',           status: INCIDENT_STATUS.RESOLVED,     timestamp: new Date(Date.now() - 10800000).toISOString(), images: [], assignedOfficerId: 'u2' },
];

const INITIAL_TASKS = [
    { id: 'task-001', title: 'Evacuate Anna Nagar Sector 3',        description: 'Deploy rescue boats and evacuate 50 families from flood zone.',     priority: TASK_PRIORITY.HIGH,   status: TASK_STATUS.IN_PROGRESS, incidentId: 'inc-001', assignedTo: 'u3',  assignedBy: 'u2', createdAt: new Date(Date.now() - 3000000).toISOString(), updatedAt: new Date(Date.now() - 600000).toISOString(), escalateAt: new Date(Date.now() + 3600000).toISOString(), notes: 'Boats deployed. 30 families moved.' },
    { id: 'task-002', title: 'Set up Relief Camp - Washermanpet',   description: 'Coordinate with NGOs to establish food and shelter camp.',           priority: TASK_PRIORITY.HIGH,   status: TASK_STATUS.PENDING,     incidentId: 'inc-001', assignedTo: 'u5',  assignedBy: 'u2', createdAt: new Date(Date.now() - 2000000).toISOString(), updatedAt: new Date(Date.now() - 2000000).toISOString(), escalateAt: new Date(Date.now() + 7200000).toISOString(), notes: '' },
    { id: 'task-003', title: 'Coast Guard Alert - Marina Beach',    description: 'Issue evacuation orders for 1km coastal belt.',                       priority: TASK_PRIORITY.HIGH,   status: TASK_STATUS.PENDING,     incidentId: 'inc-002', assignedTo: null,  assignedBy: 'u2', createdAt: new Date(Date.now() - 6000000).toISOString(), updatedAt: new Date(Date.now() - 6000000).toISOString(), escalateAt: new Date(Date.now() + 1800000).toISOString(), notes: '' },
    { id: 'task-004', title: 'Search & Rescue - T. Nagar Collapse', description: 'NDRF team to conduct immediate search and rescue operations.',        priority: TASK_PRIORITY.HIGH,   status: TASK_STATUS.IN_PROGRESS, incidentId: 'inc-003', assignedTo: 'u3',  assignedBy: 'u1', createdAt: new Date(Date.now() - 1700000).toISOString(), updatedAt: new Date(Date.now() - 300000).toISOString(),  escalateAt: new Date(Date.now() + 900000).toISOString(),  notes: 'Team on ground. 3 survivors found.' },
    { id: 'task-005', title: 'Medical Team - T. Nagar',             description: 'Dispatch medical team with trauma equipment.',                         priority: TASK_PRIORITY.MEDIUM, status: TASK_STATUS.COMPLETED,   incidentId: 'inc-003', assignedTo: 'u5',  assignedBy: 'u1', createdAt: new Date(Date.now() - 1600000).toISOString(), updatedAt: new Date(Date.now() - 500000).toISOString(),  escalateAt: new Date(Date.now() + 3600000).toISOString(), notes: 'Medical team arrived. 2 critical, 5 stable.' },
];

const INITIAL_ALERTS = [
    { id: 'al-001', type: 'CRITICAL', title: 'Cyclone Warning',    message: 'Cyclone MANDOUS approaching Chennai coast. Expected landfall at 0300 hrs. All coastal residents evacuate immediately.', timestamp: now(), sent: true },
    { id: 'al-002', type: 'HIGH',     title: 'Flood Alert - Zone A', message: 'Water level rising in Adyar River. Zones A, B, C on high alert. Expect crests by 1800 hrs.', timestamp: new Date(Date.now() - 1800000).toISOString(), sent: true },
    { id: 'al-003', type: 'MEDIUM',   title: 'Relief Camp Open',   message: 'Relief camp operational at Washermanpet Government School. Capacity: 500. Food, water, medical aid available.', timestamp: new Date(Date.now() - 3600000).toISOString(), sent: true },
];

const INITIAL_RESOURCES = [
    { id: 'res-001', name: 'NDRF Battalion Alpha', type: 'Rescue Team', available: true,  location: 'Anna Nagar Base',       capacity: 40,   contact: '+91-44-28293000' },
    { id: 'res-002', name: 'Govt. Medical Camp',   type: 'Medical',     available: true,  location: 'Washermanpet School',    capacity: 200,  contact: '+91-44-25223000' },
    { id: 'res-003', name: 'Relief Food Store',    type: 'Food',        available: true,  location: 'Central Warehouse',      capacity: 5000, contact: '+91-44-25420001' },
    { id: 'res-004', name: 'Rescue Boats (×8)',    type: 'Equipment',   available: false, location: 'Anna Nagar Depot',       capacity: 8,    contact: '+91-44-28297000' },
    { id: 'res-005', name: 'Emergency Shelter',    type: 'Shelter',     available: true,  location: 'Anna Nagar Stadium',     capacity: 1000, contact: '+91-44-26203000' },
];

// ── Normalise backend Incident shape → frontend shape ─────────────────────────
function normaliseIncident(inc) {
    const coords = inc.coordinates || [inc.lng || 80.237, inc.lat || 13.067];
    return { ...inc, lat: coords[1], lng: coords[0], timestamp: inc.timestamp || now(), images: inc.images || [] };
}

// ─────────────────────────────────────────────────────────────────────────────
const DisasterDataContext = createContext(null);

export function DisasterDataProvider({ children }) {
    const [incidents,  setIncidents]  = useState(INITIAL_INCIDENTS);
    const [tasks,      setTasks]      = useState(INITIAL_TASKS);
    const [alerts,     setAlerts]     = useState(INITIAL_ALERTS);
    const [resources,  setResources]  = useState(INITIAL_RESOURCES);
    const [apiOnline,  setApiOnline]  = useState(false);

    // ── Hydrate from backend on mount (only when JWT exists) ─────────────────
    useEffect(() => {
        const token = localStorage.getItem('og_token');
        if (!token) return; // demo/offline mode — keep in-memory seed

        Promise.allSettled([
            getIncidents().then(r => { if (r.data?.length) setIncidents(r.data.map(normaliseIncident)); }),
            getTasks().then(r     => { if (r.data?.length) setTasks(r.data); }),
            getAlerts().then(r    => { if (r.data?.length) setAlerts(r.data); }),
            getResources().then(r => { if (r.data?.length) setResources(r.data); }),
        ]).then(results => {
            const online = results.some(r => r.status === 'fulfilled');
            setApiOnline(online);
            if (!online) console.warn('[DisasterData] Backend offline — using in-memory seed data');
        });
    }, []);

    // ── Mutations — API-first with local fallback ─────────────────────────────

    const addIncident = useCallback(async (incident) => {
        if (apiOnline) {
            try {
                const res = await apiCreateIncident(incident);
                const newInc = normaliseIncident(res.data);
                setIncidents(prev => [newInc, ...prev]);
                return newInc;
            } catch { /* fall through to local */ }
        }
        const newInc = { ...incident, id: 'inc-' + uuidv4().slice(0, 6), timestamp: now(), status: INCIDENT_STATUS.REPORTED };
        setIncidents(prev => [newInc, ...prev]);
        return newInc;
    }, [apiOnline]);

    const updateIncident = useCallback(async (id, updates) => {
        if (apiOnline) {
            try {
                const res = await apiUpdateIncident(id, updates);
                setIncidents(prev => prev.map(i => i.id === id ? normaliseIncident(res.data) : i));
                return;
            } catch { /* fall through */ }
        }
        setIncidents(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
    }, [apiOnline]);

    const addTask = useCallback(async (task) => {
        if (apiOnline) {
            try {
                const res = await apiCreateTask(task);
                setTasks(prev => [res.data, ...prev]);
                return res.data;
            } catch { /* fall through */ }
        }
        const newTask = { ...task, id: 'task-' + uuidv4().slice(0, 6), status: TASK_STATUS.PENDING, createdAt: now(), updatedAt: now(), escalateAt: new Date(Date.now() + (task.escalateMinutes || 120) * 60000).toISOString(), notes: '' };
        setTasks(prev => [newTask, ...prev]);
        return newTask;
    }, [apiOnline]);

    const updateTask = useCallback(async (id, updates) => {
        if (apiOnline) {
            try {
                const res = await apiUpdateTask(id, updates);
                setTasks(prev => prev.map(t => t.id === id ? res.data : t));
                return;
            } catch { /* fall through */ }
        }
        setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates, updatedAt: now() } : t));
    }, [apiOnline]);

    const addAlert = useCallback(async (alert) => {
        if (apiOnline) {
            try {
                const res = await apiCreateAlert(alert);
                setAlerts(prev => [res.data, ...prev]);
                return res.data;
            } catch { /* fall through */ }
        }
        const newAlert = { ...alert, id: 'al-' + uuidv4().slice(0, 6), timestamp: now(), sent: true };
        setAlerts(prev => [newAlert, ...prev]);
        return newAlert;
    }, [apiOnline]);

    const updateResource = useCallback(async (id, updates) => {
        if (apiOnline) {
            try {
                const res = await apiUpdateResource(id, updates);
                setResources(prev => prev.map(r => r.id === id ? res.data : r));
                return;
            } catch { /* fall through */ }
        }
        setResources(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
    }, [apiOnline]);

    const addResource = useCallback((resource) => {
        const newResource = { ...resource, id: 'res-' + uuidv4().slice(0, 6) };
        setResources(prev => [...prev, newResource]);
        return newResource;
    }, []);

    return (
        <DisasterDataContext.Provider value={{
            incidents, tasks, alerts, resources,
            addIncident, updateIncident, addTask, updateTask, addAlert,
            updateResource, addResource,
            TASK_STATUS, TASK_PRIORITY, INCIDENT_STATUS,
            apiOnline,
        }}>
            {children}
        </DisasterDataContext.Provider>
    );
}

export function useDisasterData() {
    const ctx = useContext(DisasterDataContext);
    if (!ctx) throw new Error('useDisasterData must be inside DisasterDataProvider');
    return ctx;
}
