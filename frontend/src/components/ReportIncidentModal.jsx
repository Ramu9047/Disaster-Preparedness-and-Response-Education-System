import { useState } from 'react';
import { useDisasterData } from '../context/DisasterDataContext';
import { useAuth } from '../context/AuthContext';

const TYPES = ['Flood', 'Cyclone', 'Earthquake', 'Fire', 'Landslide', 'Building Collapse', 'Tsunami', 'Other'];
const SEVERITIES = [
    { v: 'LOW', color: '#22c55e' },
    { v: 'MEDIUM', color: '#f97316' },
    { v: 'HIGH', color: '#ef4444' },
    { v: 'CRITICAL', color: '#dc2626' },
];

export default function ReportIncidentModal({ onClose }) {
    const { user } = useAuth();
    const { addIncident } = useDisasterData();
    const [form, setForm] = useState({ type: '', severity: 'HIGH', location: '', description: '', lat: '', lng: '' });
    const [submitted, setSubmitted] = useState(false);
    const [locating, setLocating] = useState(false);

    const getLocation = () => {
        setLocating(true);
        navigator.geolocation?.getCurrentPosition(
            pos => { setForm(p => ({ ...p, lat: pos.coords.latitude.toFixed(5), lng: pos.coords.longitude.toFixed(5) })); setLocating(false); },
            async () => {
                try {
                    const res = await fetch("https://ipapi.co/json/");
                    const data = await res.json();
                    if (data.latitude && data.longitude) {
                        setForm(p => ({ ...p, lat: parseFloat(data.latitude).toFixed(5), lng: parseFloat(data.longitude).toFixed(5) }));
                    }
                } catch (err) {}
                setLocating(false);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        addIncident({ ...form, lat: parseFloat(form.lat) || 13.08, lng: parseFloat(form.lng) || 80.27, reportedBy: user.id, reporterName: user.name, assignedOfficerId: null });
        setSubmitted(true);
    };

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }} onClick={e => e.target === e.currentTarget && onClose()}>
            <div style={{ background: '#0f172a', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 20, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 80px rgba(0,0,0,0.7)' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 700, fontSize: '1.05rem', color: 'white', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <i className="fa-solid fa-triangle-exclamation" style={{ color: '#ef4444' }} /> Report Disaster Incident
                    </span>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '1.1rem' }}>
                        <i className="fa-solid fa-xmark" />
                    </button>
                </div>

                {submitted ? (
                    <div style={{ padding: 40, textAlign: 'center' }}>
                        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(34,197,94,0.15)', border: '2px solid #22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                            <i className="fa-solid fa-check" style={{ color: '#22c55e', fontSize: '1.8rem' }} />
                        </div>
                        <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'white', marginBottom: 8 }}>Incident Reported!</div>
                        <div style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: 24 }}>Your report has been logged. Authorities will be notified immediately.</div>
                        <button onClick={onClose} className="btn-primary" style={{ padding: '10px 28px' }}>Close</button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
                        <div>
                            <label style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 8 }}>Disaster Type *</label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                {TYPES.map(t => (
                                    <button key={t} type="button" onClick={() => setForm(p => ({ ...p, type: t }))}
                                        style={{ padding: '6px 14px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 600, border: `1px solid ${form.type === t ? '#ef4444' : 'var(--color-border)'}`, background: form.type === t ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.03)', color: form.type === t ? '#ef4444' : 'var(--color-text-secondary)', cursor: 'pointer', transition: 'all 0.15s' }}>
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 8 }}>Severity Level *</label>
                            <div style={{ display: 'flex', gap: 8 }}>
                                {SEVERITIES.map(s => (
                                    <button key={s.v} type="button" onClick={() => setForm(p => ({ ...p, severity: s.v }))}
                                        style={{ flex: 1, padding: '8px 4px', borderRadius: 10, fontSize: '0.78rem', fontWeight: 700, border: `1px solid ${form.severity === s.v ? s.color : 'var(--color-border)'}`, background: form.severity === s.v ? `${s.color}20` : 'rgba(255,255,255,0.03)', color: form.severity === s.v ? s.color : 'var(--color-text-muted)', cursor: 'pointer', transition: 'all 0.15s' }}>
                                        {s.v}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>Location *</label>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <input className="form-input" placeholder="e.g. Anna Nagar, Chennai" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} required style={{ flex: 1 }} />
                                <button type="button" onClick={getLocation} title="Use GPS" style={{ padding: '0 14px', background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 10, color: '#3b82f6', cursor: 'pointer' }}>
                                    <i className={`fa-solid ${locating ? 'fa-circle-notch spin' : 'fa-location-crosshairs'}`} />
                                </button>
                            </div>
                            {form.lat && <div style={{ fontSize: '0.72rem', color: '#22c55e', marginTop: 4 }}><i className="fa-solid fa-check" style={{ marginRight: 4 }} />GPS: {form.lat}, {form.lng}</div>}
                        </div>

                        <div>
                            <label style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>Description *</label>
                            <textarea className="form-input" placeholder="Describe the incident in detail..." value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} required style={{ minHeight: 90 }} />
                        </div>

                        <div style={{ display: 'flex', gap: 10 }}>
                            <button type="button" onClick={onClose} style={{ flex: 1, padding: '12px', borderRadius: 10, background: 'transparent', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
                            <button type="submit" disabled={!form.type || !form.location || !form.description}
                                style={{ flex: 2, padding: '12px', borderRadius: 10, background: 'linear-gradient(135deg,#ef4444,#dc2626)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', opacity: (!form.type || !form.location || !form.description) ? 0.5 : 1 }}>
                                <i className="fa-solid fa-paper-plane" style={{ marginRight: 8 }} />Submit Report
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
