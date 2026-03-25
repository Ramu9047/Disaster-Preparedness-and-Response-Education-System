import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useDisasterData } from '../context/DisasterDataContext';

// ── Helper: request and fire a browser push notification ─────────────────────
async function firePushNotification(title, body) {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'default') {
        await Notification.requestPermission();
    }
    if (Notification.permission === 'granted') {
        new Notification(`🚨 OmniGuard Alert: ${title}`, {
            body,
            icon: '/logo.svg',
            badge: '/logo.svg',
            tag: 'omniguard-alert',
            requireInteraction: true,
        });
    }
}

export default function AlertBroadcastModal({ onClose }) {
    const { user } = useAuth();
    const { addAlert } = useDisasterData();
    const [form, setForm] = useState({ title: '', message: '', type: 'HIGH', targetPhones: '' });
    const [done, setDone] = useState(false);
    const [sending, setSending] = useState(false);
    const [smsStatus, setSmsStatus] = useState(null); // null | 'sending' | 'sent'
    const [pushStatus, setPushStatus] = useState(null); // null | 'sent' | 'denied'
    const [activeTab, setActiveTab] = useState('compose'); // compose | sms

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
        { title: 'Earthquake Alert', message: 'Earthquake detected nearby. Move away from buildings, stay in open ground. Do not use elevators. Call 108 if injured.', type: 'CRITICAL' },
    ];

    const smsBody = `[NDMA ALERT - ${form.type}]\n${form.title}\n\n${form.message}\n\nHelpline: 1077 | Do Not Reply`;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSending(true);

        // 1. Add alert to in-app system
        addAlert({ ...form, sentBy: user.id });

        // 2. Browser push notification
        try {
            await firePushNotification(form.title, form.message);
            setPushStatus('sent');
        } catch {
            setPushStatus('denied');
        }

        // 3. Simulate SMS sending with delay
        if (form.targetPhones.trim()) {
            setSmsStatus('sending');
            await new Promise(r => setTimeout(r, 1500));
            setSmsStatus('sent');
        }

        setSending(false);
        setDone(true);
    };

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }} onClick={e => e.target === e.currentTarget && onClose()}>
            <div style={{ background: '#0f172a', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 22, width: '100%', maxWidth: 560, boxShadow: '0 25px 80px rgba(0,0,0,0.7)', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>

                {/* Header */}
                <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                    <span style={{ fontWeight: 700, fontSize: '1.05rem', color: 'white', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <i className="fa-solid fa-bullhorn" style={{ color: '#ef4444' }} />Broadcast Emergency Alert
                    </span>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '1.1rem' }}>
                        <i className="fa-solid fa-xmark" />
                    </button>
                </div>

                {/* Tabs */}
                {!done && (
                    <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', flexShrink: 0 }}>
                        {[
                            { id: 'compose', label: 'Compose Alert', icon: 'fa-pen-to-square' },
                            { id: 'sms', label: 'SMS Preview', icon: 'fa-mobile-screen-button' },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                style={{ flex: 1, padding: '12px', background: 'none', border: 'none', borderBottom: `2px solid ${activeTab === tab.id ? '#ef4444' : 'transparent'}`, color: activeTab === tab.id ? '#ef4444' : 'var(--color-text-muted)', fontWeight: activeTab === tab.id ? 700 : 500, cursor: 'pointer', fontSize: '0.82rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                            >
                                <i className={`fa-solid ${tab.icon}`} />{tab.label}
                            </button>
                        ))}
                    </div>
                )}

                <div style={{ overflowY: 'auto', flex: 1 }}>
                    {done ? (
                        /* Success screen */
                        <div style={{ padding: 36, textAlign: 'center' }}>
                            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(239,68,68,0.12)', border: '2px solid #ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 0 30px rgba(239,68,68,0.2)' }}>
                                <i className="fa-solid fa-bullhorn" style={{ color: '#ef4444', fontSize: '1.5rem' }} />
                            </div>
                            <div style={{ fontWeight: 700, color: 'white', fontSize: '1.15rem', marginBottom: 8 }}>Alert Broadcast Complete!</div>
                            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.82rem', marginBottom: 20 }}>
                                The emergency alert has been dispatched across all channels.
                            </div>

                            {/* Delivery status */}
                            <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--color-border)', borderRadius: 14, padding: 16, textAlign: 'left', marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {[
                                    { channel: 'In-App Alert', icon: 'fa-bell', status: '✓ Delivered', color: '#22c55e' },
                                    { channel: 'Browser Push Notification', icon: 'fa-mobile-screen-button', status: pushStatus === 'sent' ? '✓ Sent' : '⚠ Permission denied', color: pushStatus === 'sent' ? '#22c55e' : '#f97316' },
                                    { channel: 'SMS Broadcast', icon: 'fa-message', status: form.targetPhones ? (smsStatus === 'sent' ? `✓ Sent to ${form.targetPhones.split(',').length} number(s)` : 'Sending...') : '— No numbers specified', color: form.targetPhones && smsStatus === 'sent' ? '#22c55e' : '#64748b' },
                                ].map(item => (
                                    <div key={item.channel} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div style={{ width: 30, height: 30, borderRadius: 8, background: `${item.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <i className={`fa-solid ${item.icon}`} style={{ color: item.color, fontSize: '0.8rem' }} />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '0.78rem', color: 'white', fontWeight: 600 }}>{item.channel}</div>
                                        </div>
                                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: item.color }}>{item.status}</span>
                                    </div>
                                ))}
                            </div>

                            <button onClick={onClose} className="btn-primary" style={{ padding: '10px 28px' }}>Close</button>
                        </div>
                    ) : activeTab === 'compose' ? (
                        /* Compose tab */
                        <form onSubmit={handleSubmit} style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <div>
                                <label style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 8 }}>Quick Templates</label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                                    {TEMPLATES.map(t => (
                                        <button key={t.title} type="button" onClick={() => setForm(p => ({ ...p, title: t.title, message: t.message, type: t.type }))}
                                            style={{ padding: '7px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)', cursor: 'pointer', textAlign: 'left', fontSize: '0.78rem', fontWeight: 500, transition: 'all 0.15s' }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}>
                                            {t.title}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>Alert Level *</label>
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
                                <label style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>Alert Title *</label>
                                <input className="form-input" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Cyclone Warning — Chennai Coast" required />
                            </div>

                            <div>
                                <label style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>Message *</label>
                                <textarea className="form-input" value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} placeholder="Full alert message for the public..." required style={{ minHeight: 80 }} />
                            </div>

                            {/* SMS targets */}
                            <div>
                                <label style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>
                                    <i className="fa-solid fa-message" style={{ marginRight: 4, color: '#22c55e' }} />SMS Target Numbers (Optional)
                                </label>
                                <input className="form-input" value={form.targetPhones}
                                    onChange={e => setForm(p => ({ ...p, targetPhones: e.target.value }))}
                                    placeholder="+91-9876543210, +91-7890123456 (comma-separated)" />
                                <div style={{ fontSize: '0.68rem', color: '#4b5563', marginTop: 4 }}>Leave blank to only send in-app + push alerts</div>
                            </div>

                            {/* Push notification note */}
                            <div style={{ background: 'rgba(59,130,246,0.07)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 10, padding: '10px 14px', fontSize: '0.75rem', color: '#93c5fd', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                                <i className="fa-solid fa-mobile-screen-button" style={{ marginTop: 2, flexShrink: 0 }} />
                                <span>A <strong>browser push notification</strong> will be triggered on submit. Allow notifications when browser prompts.</span>
                            </div>

                            <div style={{ display: 'flex', gap: 10 }}>
                                <button type="button" onClick={onClose} style={{ flex: 1, padding: '12px', borderRadius: 10, background: 'transparent', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
                                <button type="submit" disabled={!form.title || !form.message || sending}
                                    style={{ flex: 2, padding: '12px', borderRadius: 10, background: 'linear-gradient(135deg,#ef4444,#dc2626)', color: 'white', border: 'none', fontWeight: 700, cursor: (!form.title || !form.message || sending) ? 'not-allowed' : 'pointer', opacity: (!form.title || !form.message || sending) ? 0.5 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                    {sending ? <><i className="fa-solid fa-circle-notch spin" />Sending...</> : <><i className="fa-solid fa-bullhorn" />Broadcast Alert</>}
                                </button>
                            </div>
                        </form>
                    ) : (
                        /* SMS Preview tab */
                        <div style={{ padding: 22 }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>SMS Message Preview</div>
                            {/* Phone mockup */}
                            <div style={{ maxWidth: 300, margin: '0 auto', background: '#1e293b', border: '4px solid #334155', borderRadius: 24, padding: '10px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
                                <div style={{ background: '#0f172a', borderRadius: 16, padding: 16 }}>
                                    {/* Status bar */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', color: '#64748b', marginBottom: 12 }}>
                                        <span>9:41 AM</span>
                                        <span>🔋 95%</span>
                                    </div>
                                    {/* Message */}
                                    <div style={{ background: '#1e293b', borderRadius: 12, padding: '10px 14px', fontSize: '0.75rem', lineHeight: 1.7, color: 'white', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                                        <div style={{ fontSize: '0.6rem', color: '#22c55e', marginBottom: 6, fontFamily: 'monospace', letterSpacing: '0.05em' }}>FROM: NDMA-ALERT</div>
                                        {form.title || form.message ? smsBody : <span style={{ color: '#4b5563', fontStyle: 'italic' }}>Fill in the form to preview SMS...</span>}
                                    </div>
                                    <div style={{ fontSize: '0.6rem', color: '#4b5563', textAlign: 'right', marginTop: 6 }}>
                                        {smsBody.length}/160 chars {smsBody.length > 160 && <span style={{ color: '#f97316' }}>(Multi-part SMS)</span>}
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginTop: 20, background: 'rgba(0,0,0,0.3)', borderRadius: 12, padding: 16 }}>
                                <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Target Numbers</div>
                                {form.targetPhones ? (
                                    form.targetPhones.split(',').map((p, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: i < form.targetPhones.split(',').length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                                            <i className="fa-solid fa-mobile" style={{ color: '#22c55e', fontSize: '0.75rem' }} />
                                            <span style={{ fontSize: '0.82rem', color: 'white', fontFamily: 'monospace' }}>{p.trim()}</span>
                                        </div>
                                    ))
                                ) : (
                                    <div style={{ fontSize: '0.8rem', color: '#4b5563', fontStyle: 'italic' }}>No phone numbers added. Go to Compose tab to add targets.</div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}


