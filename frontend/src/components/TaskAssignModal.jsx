import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useDisasterData, DEMO_USERS } from '../context/DisasterDataContext';
import { DEMO_USERS as USERS } from '../context/AuthContext';

const ASSIGNABLE = ['u3', 'u5']; // rescue + volunteer

export default function TaskAssignModal({ incident, onClose }) {
    const { user } = useAuth();
    const { addTask, TASK_PRIORITY } = useDisasterData();
    const [form, setForm] = useState({
        title: incident ? `Respond to: ${incident.type} — ${incident.location}` : '',
        description: incident ? incident.description : '',
        priority: 'HIGH',
        assignedTo: '',
        incidentId: incident?.id || '',
        escalateMinutes: 60,
    });
    const [submitted, setSubmitted] = useState(false);

    const assignableUsers = USERS.filter(u => ASSIGNABLE.includes(u.id));

    const handleSubmit = (e) => {
        e.preventDefault();
        addTask({ ...form, assignedBy: user.id });
        setSubmitted(true);
    };

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }} onClick={e => e.target === e.currentTarget && onClose()}>
            <div style={{ background: '#0f172a', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 20, width: '100%', maxWidth: 500, boxShadow: '0 25px 80px rgba(0,0,0,0.7)', overflow: 'hidden' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 700, fontSize: '1.05rem', color: 'white', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <i className="fa-solid fa-clipboard-list" style={{ color: '#3b82f6' }} />
                        {incident ? 'Assign Task for Incident' : 'Create New Task'}
                    </span>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '1.1rem' }}>
                        <i className="fa-solid fa-xmark" />
                    </button>
                </div>

                {submitted ? (
                    <div style={{ padding: 40, textAlign: 'center' }}>
                        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(34,197,94,0.15)', border: '2px solid #22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                            <i className="fa-solid fa-check" style={{ color: '#22c55e', fontSize: '1.6rem' }} />
                        </div>
                        <div style={{ fontWeight: 700, color: 'white', marginBottom: 8 }}>Task Created & Assigned!</div>
                        <div style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: 20 }}>The assigned team member will be notified immediately.</div>
                        <button onClick={onClose} className="btn-primary" style={{ padding: '10px 28px' }}>Close</button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {incident && (
                            <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, fontSize: '0.8rem', color: '#fca5a5' }}>
                                <i className="fa-solid fa-link" style={{ marginRight: 6 }} />
                                Linked to: <strong>{incident.type}</strong> at {incident.location}
                            </div>
                        )}

                        <div>
                            <label style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>Task Title *</label>
                            <input className="form-input" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Evacuate Zone B residents" required />
                        </div>

                        <div>
                            <label style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>Description</label>
                            <textarea className="form-input" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Detailed instructions..." style={{ minHeight: 80 }} />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <div>
                                <label style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>Priority *</label>
                                <select className="form-input" value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}>
                                    <option value="HIGH">🔴 High</option>
                                    <option value="MEDIUM">🟠 Medium</option>
                                    <option value="LOW">🟢 Low</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>Escalate After</label>
                                <select className="form-input" value={form.escalateMinutes} onChange={e => setForm(p => ({ ...p, escalateMinutes: parseInt(e.target.value) }))}>
                                    <option value={30}>30 minutes</option>
                                    <option value={60}>1 hour</option>
                                    <option value={120}>2 hours</option>
                                    <option value={240}>4 hours</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 8 }}>Assign To</label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {assignableUsers.map(u => (
                                    <button key={u.id} type="button" onClick={() => setForm(p => ({ ...p, assignedTo: u.id }))}
                                        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, background: form.assignedTo === u.id ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.03)', border: `1px solid ${form.assignedTo === u.id ? 'rgba(59,130,246,0.4)' : 'var(--color-border)'}`, cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}>
                                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(59,130,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#3b82f6', fontSize: '0.9rem' }}>{u.avatar}</div>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: '0.82rem', color: 'white' }}>{u.name}</div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{u.role} • {u.badge}</div>
                                        </div>
                                        {form.assignedTo === u.id && <i className="fa-solid fa-circle-check" style={{ color: '#3b82f6', marginLeft: 'auto' }} />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: 10 }}>
                            <button type="button" onClick={onClose} style={{ flex: 1, padding: '12px', borderRadius: 10, background: 'transparent', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
                            <button type="submit" disabled={!form.title}
                                style={{ flex: 2, padding: '12px', borderRadius: 10, background: 'linear-gradient(135deg,#3b82f6,#6366f1)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', opacity: !form.title ? 0.5 : 1 }}>
                                <i className="fa-solid fa-paper-plane" style={{ marginRight: 8 }} />Create & Assign Task
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
