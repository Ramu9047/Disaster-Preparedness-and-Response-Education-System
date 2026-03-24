const CONTACTS = [
    { name: 'National Emergency Helpline', number: '112', icon: 'fa-phone-volume', color: '#ef4444', desc: 'All emergencies, available 24/7' },
    { name: 'Police', number: '100', icon: 'fa-shield-halved', color: '#3b82f6', desc: 'Law enforcement emergencies' },
    { name: 'Fire Brigade', number: '101', icon: 'fa-fire-extinguisher', color: '#f97316', desc: 'Fire & rescue operations' },
    { name: 'Ambulance', number: '102', icon: 'fa-truck-medical', color: '#22c55e', desc: 'Medical emergencies' },
    { name: 'Disaster Management', number: '108', icon: 'fa-earth-americas', color: '#a855f7', desc: 'NDMA coordination' },
    { name: 'Coast Guard', number: '1554', icon: 'fa-anchor', color: '#06b6d4', desc: 'Maritime emergencies' },
];

const SDMA_CONTACTS = [
    { state: 'Andhra Pradesh', number: '1070', label: 'State Control Room' },
    { state: 'Assam', number: '1079', label: 'Disaster Management' },
    { state: 'Bihar', number: '1070', label: 'SDMA Control Room' },
    { state: 'Delhi', number: '1077', label: 'Emergency Operations' },
    { state: 'Gujarat', number: '1070', label: 'State Emergency Center' },
    { state: 'Karnataka', number: '1070', label: 'Revenue & Disaster Room' },
    { state: 'Kerala', number: '1077', label: 'SEOC / KSDMA' },
    { state: 'Maharashtra', number: '1077', label: 'Disaster Management Unit' },
    { state: 'Odisha', number: '1070', label: 'OSDMA Control Room' },
    { state: 'Tamil Nadu', number: '1070', label: 'State Emergency Center' },
    { state: 'Uttar Pradesh', number: '1070', label: 'Relief Commissioner' },
    { state: 'West Bengal', number: '1070', label: 'Emergency Ops Center' },
];

const STEPS = [
    { icon: 'fa-triangle-exclamation', label: 'Assess the Situation', desc: 'Stay calm. Identify what type of disaster is occurring and your immediate danger level.', color: '#f97316' },
    { icon: 'fa-person-running', label: 'Protect Yourself First', desc: 'Follow the correct protocol for the disaster type. Your safety is the priority.', color: '#ef4444' },
    { icon: 'fa-users', label: 'Help Others if Safe', desc: 'Once you are safe, help those who cannot help themselves without putting yourself at risk.', color: '#3b82f6' },
    { icon: 'fa-tower-broadcast', label: 'Alert Authorities', desc: 'Call emergency services with clear location info and a description of the situation.', color: '#22c55e' },
];

import Swal from 'sweetalert2';
import { toast } from 'react-toastify';

export default function Emergency() {
    const handleCall = (name, number) => {
        Swal.fire({
            title: `Call ${name}?`,
            text: `You are about to initiate an emergency call to ${number}. On PCs, make sure you have a dialing app configured.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#374151',
            confirmButtonText: 'Yes, Call Now',
            cancelButtonText: 'Cancel',
            background: '#111827',
            color: '#fff',
            customClass: {
                popup: 'rounded-2xl border border-white/10'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                // Production-level enhancement: Copy to clipboard if on Desktop
                navigator.clipboard.writeText(number).then(() => {
                    toast.info(`Number ${number} copied to clipboard! 📋`, { autoClose: 3000 });
                });
                
                // Attempt to open dialer
                window.location.href = `tel:${number}`;
            }
        });
    };

    return (
        <main style={{ padding: '32px 24px', maxWidth: 1200, margin: '0 auto', minHeight: 'calc(100vh - 56px)' }}>
            {/* Hero Banner */}
            <div style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.12), rgba(220,38,38,0.06))', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 20, padding: '40px 32px', textAlign: 'center', marginBottom: 48, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 300, height: 300, borderRadius: '50%', background: 'rgba(239,68,68,0.05)', filter: 'blur(60px)', pointerEvents: 'none' }} />
                <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: '3rem', color: '#ef4444', marginBottom: 16, display: 'block' }} />
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem,4vw,2.5rem)', fontWeight: 800, color: 'white', marginBottom: 12 }}>Emergency Response Center</h1>
                <p style={{ color: 'var(--color-text-secondary)', maxWidth: 550, margin: '0 auto', lineHeight: 1.7 }}>
                    Immediate action protocols and emergency contact directory. Stay calm, act fast, save lives.
                </p>
                <button
                    onClick={() => handleCall('Emergency Services', '112')}
                    style={{ border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 10, marginTop: 24, background: 'linear-gradient(135deg,#dc2626,#ef4444)', color: 'white', padding: '14px 32px', borderRadius: 14, fontWeight: 700, fontSize: '1.1rem', textDecoration: 'none', boxShadow: '0 8px 24px rgba(220,38,38,0.4)', letterSpacing: '0.05em', textTransform: 'uppercase' }}
                >
                    <i className="fa-solid fa-phone-volume" /> CALL 112 NOW
                </button>
            </div>

            {/* Action Steps */}
            <section style={{ marginBottom: 48 }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.4rem', color: 'white', marginBottom: 24, textAlign: 'center' }}>
                    <i className="fa-solid fa-list-check" style={{ color: 'var(--color-blue)', marginRight: 10 }} />Immediate Action Steps
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                    {STEPS.map((step, i) => (
                        <div key={step.label} style={{ background: 'rgba(17,24,39,0.7)', border: '1px solid var(--color-border)', borderRadius: 16, padding: 24, backdropFilter: 'blur(16px)', display: 'flex', flexDirection: 'column', gap: 12, transition: 'transform 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{ width: 44, height: 44, borderRadius: '50%', background: `${step.color}18`, border: `1px solid ${step.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <i className={`fa-solid ${step.icon}`} style={{ color: step.color, fontSize: '1.1rem' }} />
                                </div>
                                <span style={{ background: step.color, color: 'white', width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.75rem' }}>{i + 1}</span>
                            </div>
                            <h3 style={{ color: 'white', fontWeight: 700, fontSize: '0.95rem' }}>{step.label}</h3>
                            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.82rem', lineHeight: 1.6 }}>{step.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Emergency Contacts */}
            <section>
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.4rem', color: 'white', marginBottom: 24, textAlign: 'center' }}>
                    <i className="fa-solid fa-address-book" style={{ color: 'var(--color-blue)', marginRight: 10 }} />Emergency Contacts
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
                    {CONTACTS.map(contact => (
                        <div
                            key={contact.number}
                            onClick={() => handleCall(contact.name, contact.number)}
                            style={{ cursor: 'pointer', background: 'rgba(17,24,39,0.7)', border: `1px solid ${contact.color}30`, borderRadius: 16, padding: '20px 24px', backdropFilter: 'blur(16px)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 16, transition: 'all 0.2s', boxShadow: `0 4px 16px ${contact.color}0a` }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 12px 30px ${contact.color}25`; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 4px 16px ${contact.color}0a`; }}
                        >
                            <div style={{ width: 52, height: 52, borderRadius: '50%', background: `${contact.color}18`, border: `2px solid ${contact.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <i className={`fa-solid ${contact.icon}`} style={{ color: contact.color, fontSize: '1.2rem' }} />
                            </div>
                            <div>
                                <div style={{ color: 'white', fontWeight: 700, fontSize: '0.9rem', marginBottom: 2 }}>{contact.name}</div>
                                <div style={{ color: contact.color, fontWeight: 800, fontSize: '1.3rem', fontFamily: 'var(--font-display)', letterSpacing: '0.05em' }}>{contact.number}</div>
                                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.72rem', marginTop: 2 }}>{contact.desc}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* SDMA Contacts Center */}
            <section style={{ marginTop: 48 }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.4rem', color: 'white', marginBottom: 24, textAlign: 'center' }}>
                    <i className="fa-solid fa-map-location-dot" style={{ color: 'var(--color-blue)', marginRight: 10 }} />State Disaster Management Authorities (SDMA)
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                    {SDMA_CONTACTS.map(contact => (
                        <div
                            key={contact.state}
                            onClick={() => handleCall(`${contact.state} SDMA`, contact.number)}
                            style={{ cursor: 'pointer', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--color-border)', borderRadius: 12, padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', textDecoration: 'none', transition: 'all 0.2s' }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.1)'; e.currentTarget.style.borderColor = 'rgba(59,130,246,0.5)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'var(--color-border)'; }}
                        >
                            <span style={{ color: 'white', fontWeight: 600, fontSize: '0.9rem' }}>{contact.state}</span>
                            <span style={{ color: 'var(--color-blue)', fontWeight: 700, fontSize: '1.2rem', fontFamily: 'var(--font-display)', margin: '4px 0' }}>{contact.number}</span>
                            <span style={{ color: 'var(--color-text-muted)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{contact.label}</span>
                        </div>
                    ))}
                </div>
            </section>
        </main>
    );
}
