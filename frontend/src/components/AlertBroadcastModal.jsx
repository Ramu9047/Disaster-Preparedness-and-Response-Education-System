import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useDisasterData } from '../context/DisasterDataContext';

export default function AlertBroadcastModal({ onClose }) {
    const { user } = useAuth();
    const { addAlert } = useDisasterData();
    const [form, setForm] = useState({ title: '', message: '', type: 'HIGH' });
    const [done, setDone] = useState(false);

    const TYPES = [
        { v: 'CRITICAL', color: '#dc2626', label: '🔴 CRITICAL' },
        { v: 'HIGH',     color: '#ef4444', label: '🟠 HIGH' },
        { v: 'MEDIUM',   color: '#f97316', label: '🟡 MEDIUM' },
    ];

    const TEMPLATES = [
        { title: 'Cyclone Warning', message: 'A severe cyclonic storm is approaching the coast. All coastal residents must evacuate immediately to designated shelters.', type: 'CRITICAL' },
        { title: 'Flood Alert', message: 'Water levels rising rapidly in low-lying areas. Residents in Zones A, B, C must move to higher ground immediately.', type: 'HIGH' },
        { title: 'Relief Camp Open', message: 'An emergency relief camp has been opened at the designated location. Food, water, and medical assistance available.', type: 'MEDIUM' },
        { title: 'Power Restoration', message: 'Power supply has been restored in affected areas. Emergency helpline: 1077.', type: 'MEDIUM' },
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        addAlert({ ...form, sentBy: user.id });
        setDone(true);
    };

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }} onClick={e => e.target === e.currentTarget && onClose()}>
            <div style={{ background: '#0f172a', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 20, width: '100%', maxWidth: 520, boxShadow: '0 25px 80px rgba(0,0,0,0.7)', overflow: 'hidden' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 700, fontSize: '1.05rem', color: 'white', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <i className="fa-solid fa-bullhorn" style={{ color: '#ef4444' }} />Broadcast Emergency Alert
                    </span>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '1.1rem' }}>
                        <i className="fa-solid fa-xmark" />
                    </button>
                </div>

                {done ? (
                    <div style={{ padding: 40, textAlign: 'center' }}>
                        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(239,68,68,0.12)', border: '2px solid #ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                            <i className="fa-solid fa-bullhorn" style={{ color: '#ef4444', fontSize: '1.5rem' }} />
                        </div>
                        <div style={{ fontWeight: 700, color: 'white', fontSize: '1.1rem', marginBottom: 8 }}>Alert Broadcast!</div>
                        <div style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: 20 }}>Alert has been sent to all active users in the system.</div>
                        <button onClick={onClose} className="btn-primary" style={{ padding: '10px 28px' }}>Close</button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div>
                            <label style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 8 }}>Quick Templates</label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                {TEMPLATES.map(t => (
                                    <button key={t.title} type="button" onClick={() => setForm({ title: t.title, message: t.message, type: t.type })}
                                        style={{ padding: '8px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)', cursor: 'pointer', textAlign: 'left', fontSize: '0.8rem', fontWeight: 500, transition: 'all 0.15s' }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}>
                                        {t.title}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>Alert Level *</label>
                            <div style={{ display: 'flex', gap: 8 }}>
                                {TYPES.map(t => (
                                    <button key={t.v} type="button" onClick={() => setForm(p => ({ ...p, type: t.v }))}
                                        style={{ flex: 1, padding: '8px', borderRadius: 10, fontSize: '0.78rem', fontWeight: 700, border: `1px solid ${form.type === t.v ? t.color : 'var(--color-border)'}`, background: form.type === t.v ? `${t.color}20` : 'rgba(255,255,255,0.03)', color: form.type === t.v ? t.color : 'var(--color-text-muted)', cursor: 'pointer' }}>
                                        {t.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>Alert Title *</label>
                            <input className="form-input" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Cyclone Warning — Chennai Coast" required />
                        </div>

                        <div>
                            <label style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>Message *</label>
                            <textarea className="form-input" value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} placeholder="Full alert message for the public..." required style={{ minHeight: 100 }} />
                        </div>

                        <div style={{ display: 'flex', gap: 10 }}>
                            <button type="button" onClick={onClose} style={{ flex: 1, padding: '12px', borderRadius: 10, background: 'transparent', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
                            <button type="submit" disabled={!form.title || !form.message}
                                style={{ flex: 2, padding: '12px', borderRadius: 10, background: 'linear-gradient(135deg,#ef4444,#dc2626)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', opacity: (!form.title || !form.message) ? 0.5 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                <i className="fa-solid fa-bullhorn" />Broadcast Alert
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
