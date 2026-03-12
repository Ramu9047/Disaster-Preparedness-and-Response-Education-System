import { useState } from 'react';
import { submitContactForm } from '../services/api';

export default function Contact() {
    const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
    const [status, setStatus] = useState(null); // 'loading' | 'success' | 'error'

    const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');
        try {
            await submitContactForm(form);
            setStatus('success');
            setForm({ name: '', email: '', subject: '', message: '' });
        } catch (err) {
            console.error('Contact form error:', err);
            setStatus('error');
        }
    };

    return (
        <main style={{ padding: '32px 24px', maxWidth: 900, margin: '0 auto', minHeight: 'calc(100vh - 56px)' }}>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem,4vw,2.5rem)', fontWeight: 800, color: 'white', marginBottom: 12 }}>
                    <i className="fa-solid fa-satellite-dish" style={{ color: 'var(--color-blue)', marginRight: 12 }} />Contact OmniGuard
                </h1>
                <p style={{ color: 'var(--color-text-secondary)', maxWidth: 500, margin: '0 auto', lineHeight: 1.7 }}>
                    Send reports, feedback, or alert transmissions to our emergency coordination team.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 32, alignItems: 'flex-start' }}>
                {/* Form */}
                <div style={{ background: 'rgba(17,24,39,0.7)', border: '1px solid var(--color-border)', borderRadius: 20, padding: 32, backdropFilter: 'blur(20px)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.2rem', color: 'white', marginBottom: 24 }}>
                        <i className="fa-solid fa-paper-plane" style={{ color: 'var(--color-blue)', marginRight: 8 }} />Send Transmission
                    </h2>
                    {status === 'success' && (
                        <div className="animate-fade-in-up" style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 12, padding: '12px 16px', marginBottom: 20, display: 'flex', gap: 10, alignItems: 'center', color: '#4ade80', fontSize: '0.87rem', fontWeight: 600 }}>
                            <i className="fa-solid fa-circle-check" /> Transmission received. Our team will respond shortly.
                        </div>
                    )}
                    {status === 'error' && (
                        <div className="animate-fade-in-up" style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, padding: '12px 16px', marginBottom: 20, display: 'flex', gap: 10, alignItems: 'center', color: '#f87171', fontSize: '0.87rem', fontWeight: 600 }}>
                            <i className="fa-solid fa-circle-exclamation" /> Transmission failed. Please try again or call 112.
                        </div>
                    )}
                    <form id="contact-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: 6, fontWeight: 600 }}>Full Name *</label>
                            <input name="name" type="text" required value={form.name} onChange={handleChange} className="form-input" placeholder="Your full name" aria-label="Full name" />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: 6, fontWeight: 600 }}>Email Address *</label>
                            <input name="email" type="email" required value={form.email} onChange={handleChange} className="form-input" placeholder="your@email.com" aria-label="Email address" />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: 6, fontWeight: 600 }}>Subject *</label>
                            <input name="subject" type="text" required value={form.subject} onChange={handleChange} className="form-input" placeholder="Nature of your report" aria-label="Subject" />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: 6, fontWeight: 600 }}>Message *</label>
                            <textarea name="message" required value={form.message} onChange={handleChange} className="form-input" placeholder="Describe the situation clearly..." aria-label="Message" />
                        </div>
                        <button type="submit" id="contact-submit" disabled={status === 'loading'} className="btn-primary" style={{ width: '100%', padding: '14px', fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                            {status === 'loading'
                                ? <><i className="fa-solid fa-circle-notch spin" /> Transmitting...</>
                                : <><i className="fa-solid fa-paper-plane" /> Send Transmission</>}
                        </button>
                    </form>
                </div>

                {/* Info Cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {[
                        { icon: 'fa-tower-broadcast', color: '#3b82f6', label: 'Emergency Dispatch', value: '112 / 108', desc: 'Available 24/7 for immediate crisis response' },
                        { icon: 'fa-envelope', color: '#a855f7', label: 'Operations Email', value: 'ops@omniguard.ai', desc: 'For non-urgent reports and technical issues' },
                        { icon: 'fa-location-dot', color: '#22c55e', label: 'Coordination Center', value: 'National EOC', desc: 'Emergency Operations Center – New Delhi' },
                    ].map(card => (
                        <div key={card.label} style={{ background: 'rgba(17,24,39,0.7)', border: '1px solid var(--color-border)', borderRadius: 16, padding: '18px 20px', backdropFilter: 'blur(16px)', display: 'flex', alignItems: 'center', gap: 14 }}>
                            <div style={{ width: 46, height: 46, borderRadius: '50%', background: `${card.color}18`, border: `1px solid ${card.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <i className={`fa-solid ${card.icon}`} style={{ color: card.color, fontSize: '1.1rem' }} />
                            </div>
                            <div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>{card.label}</div>
                                <div style={{ color: 'white', fontWeight: 700, fontSize: '0.95rem', marginBottom: 2 }}>{card.value}</div>
                                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>{card.desc}</div>
                            </div>
                        </div>
                    ))}

                    {/* Alert box */}
                    <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 16, padding: '18px 20px' }}>
                        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
                            <i className="fa-solid fa-triangle-exclamation" style={{ color: '#ef4444', fontSize: '1.1rem' }} />
                            <span style={{ color: '#fca5a5', fontWeight: 700, fontSize: '0.85rem' }}>Life-Threatening Emergency?</span>
                        </div>
                        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem', lineHeight: 1.6 }}>
                            Do NOT use this form. Call <strong style={{ color: '#ef4444' }}>112</strong> immediately or have someone else handle the call while you take protective action.
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}
