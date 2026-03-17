import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, DEMO_USERS, ROLES } from '../context/AuthContext';

const ROLE_META = {
    [ROLES.ADMIN]:     { color: '#ef4444', bg: 'rgba(239,68,68,0.12)',     icon: 'fa-crown',          label: 'Admin / Collector' },
    [ROLES.OFFICER]:   { color: '#f97316', bg: 'rgba(249,115,22,0.12)',    icon: 'fa-user-shield',    label: 'Disaster Officer' },
    [ROLES.RESCUE]:    { color: '#22c55e', bg: 'rgba(34,197,94,0.12)',     icon: 'fa-person-running', label: 'Rescue Team' },
    [ROLES.CITIZEN]:   { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)',    icon: 'fa-user',           label: 'Citizen' },
    [ROLES.VOLUNTEER]: { color: '#a855f7', bg: 'rgba(168,85,247,0.12)',    icon: 'fa-hands-helping',  label: 'Volunteer' },
};

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        await new Promise(r => setTimeout(r, 600));
        const result = login(form.username, form.password);
        setLoading(false);
        if (result.success) {
            navigate('/command-center');
        } else {
            setError('Invalid username or password. Use a demo account below.');
        }
    };

    const fillDemo = (u) => {
        setForm({ username: u.username, password: u.password });
        setError('');
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            position: 'relative',
            overflow: 'hidden',
        }}>
            {/* Animated bg orbs */}
            <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
                <div style={{ position: 'absolute', top: '10%', left: '5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)', animation: 'floatOrb 8s ease-in-out infinite' }} />
                <div style={{ position: 'absolute', bottom: '10%', right: '5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(239,68,68,0.07) 0%, transparent 70%)', animation: 'floatOrb 10s ease-in-out infinite reverse' }} />
            </div>

            <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 1100, display: 'flex', gap: 40, alignItems: 'flex-start', flexWrap: 'wrap' }}>

                {/* Left: Branding */}
                <div style={{ flex: '1 1 340px', padding: '20px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 32 }}>
                        <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, #3b82f6, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 30px rgba(59,130,246,0.5)' }}>
                            <i className="fa-solid fa-shield-halved" style={{ fontSize: '1.6rem', color: 'white' }} />
                        </div>
                        <div>
                            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.8rem', color: 'white', lineHeight: 1 }}>
                                <span style={{ color: 'var(--color-blue)' }}>OmniGuard</span> AI
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 2 }}>Intelligent Disaster Command System</div>
                        </div>
                    </div>

                    <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 800, color: 'white', lineHeight: 1.15, marginBottom: 16 }}>
                        India's Disaster<br /><span style={{ color: '#3b82f6' }}>Command Center</span>
                    </h1>
                    <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7, marginBottom: 32, maxWidth: 380 }}>
                        Role-based access control for NDMA-aligned disaster management. Real-time coordination for Admin, Officers, Rescue Teams & Citizens.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {[
                            { icon: 'fa-layer-group', label: '5-tier Role Hierarchy', color: '#3b82f6' },
                            { icon: 'fa-tasks', label: 'Task Assignment & Tracking', color: '#22c55e' },
                            { icon: 'fa-bell', label: 'Emergency Alert Broadcasting', color: '#ef4444' },
                            { icon: 'fa-map-location-dot', label: 'Live Incident Map & Reporting', color: '#f97316' },
                        ].map(f => (
                            <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ width: 32, height: 32, borderRadius: 8, background: `${f.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <i className={`fa-solid ${f.icon}`} style={{ color: f.color, fontSize: '0.85rem' }} />
                                </div>
                                <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>{f.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Login Form + Demo Cards */}
                <div style={{ flex: '1 1 380px', display: 'flex', flexDirection: 'column', gap: 20 }}>

                    {/* Login Form */}
                    <div style={{ background: 'rgba(17,24,39,0.8)', border: '1px solid var(--color-border)', borderRadius: 20, padding: 32, backdropFilter: 'blur(24px)', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
                        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.3rem', color: 'white', marginBottom: 6 }}>
                            Secure Sign In
                        </h2>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.82rem', marginBottom: 24 }}>Click a demo account below to auto-fill credentials</p>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div>
                                <label style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Username / Email</label>
                                <div style={{ position: 'relative' }}>
                                    <i className="fa-solid fa-user" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', fontSize: '0.8rem' }} />
                                    <input
                                        id="login-username"
                                        type="text"
                                        className="form-input"
                                        style={{ paddingLeft: 40 }}
                                        placeholder="Enter username..."
                                        value={form.username}
                                        onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
                                        required
                                        autoComplete="username"
                                    />
                                </div>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Password</label>
                                <div style={{ position: 'relative' }}>
                                    <i className="fa-solid fa-lock" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', fontSize: '0.8rem' }} />
                                    <input
                                        id="login-password"
                                        type="password"
                                        className="form-input"
                                        style={{ paddingLeft: 40 }}
                                        placeholder="Enter password..."
                                        value={form.password}
                                        onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                                        required
                                        autoComplete="current-password"
                                    />
                                </div>
                            </div>

                            {error && (
                                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '10px 14px', color: '#fca5a5', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <i className="fa-solid fa-triangle-exclamation" />
                                    {error}
                                </div>
                            )}

                            <button
                                id="login-submit"
                                type="submit"
                                disabled={loading}
                                style={{
                                    background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                                    color: 'white', border: 'none', padding: '14px', borderRadius: 12,
                                    fontWeight: 700, fontSize: '0.95rem', cursor: loading ? 'not-allowed' : 'pointer',
                                    opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                    transition: 'all 0.2s', boxShadow: '0 4px 20px rgba(59,130,246,0.3)',
                                }}
                                onMouseEnter={e => !loading && (e.currentTarget.style.transform = 'translateY(-1px)')}
                                onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
                            >
                                {loading ? <><i className="fa-solid fa-circle-notch spin" /> Authenticating...</> : <><i className="fa-solid fa-right-to-bracket" /> Sign In to Command Center</>}
                            </button>
                        </form>
                    </div>

                    {/* Demo Accounts */}
                    <div style={{ background: 'rgba(17,24,39,0.6)', border: '1px solid var(--color-border)', borderRadius: 20, padding: 24, backdropFilter: 'blur(20px)' }}>
                        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
                            <i className="fa-solid fa-key" style={{ marginRight: 6 }} /> Demo Accounts — Click to Auto-Fill
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {DEMO_USERS.map(u => {
                                const meta = ROLE_META[u.role];
                                return (
                                    <button
                                        key={u.id}
                                        id={`demo-${u.role.toLowerCase()}`}
                                        onClick={() => fillDemo(u)}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                                            background: form.username === u.username ? meta.bg : 'rgba(255,255,255,0.03)',
                                            border: `1px solid ${form.username === u.username ? meta.color + '60' : 'var(--color-border)'}`,
                                            borderRadius: 10, cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = meta.bg}
                                        onMouseLeave={e => { if (form.username !== u.username) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                                    >
                                        <div style={{ width: 32, height: 32, borderRadius: 8, background: meta.bg, border: `1px solid ${meta.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <i className={`fa-solid ${meta.icon}`} style={{ color: meta.color, fontSize: '0.8rem' }} />
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: '0.82rem', color: 'white', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.name}</div>
                                            <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{meta.label} • {u.username}</div>
                                        </div>
                                        <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: meta.bg, color: meta.color, border: `1px solid ${meta.color}40`, whiteSpace: 'nowrap' }}>
                                            {u.role}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes floatOrb {
                    0%, 100% { transform: translateY(0) scale(1); }
                    50% { transform: translateY(-30px) scale(1.05); }
                }
            `}</style>
        </div>
    );
}
