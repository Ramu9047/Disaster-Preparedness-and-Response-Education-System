import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { submitVolunteerApplication } from '../services/api';

export default function Volunteer() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({ name: '', phone: '', skills: [] });

    const handleCheck = (skill) => {
        setForm(prev => {
            if (prev.skills.includes(skill)) {
                return { ...prev, skills: prev.skills.filter(s => s !== skill) };
            } else {
                return { ...prev, skills: [...prev.skills, skill] };
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await submitVolunteerApplication({
                ...form,
                userId: user ? user.id : null
            });
            setSubmitted(true);
        } catch (err) {
            console.error('Failed to submit volunteer app:', err);
            alert('Submission failed. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (!user) {
        return (
            <main className="animate-fade-in-up" style={{ padding: '32px 24px', maxWidth: 800, margin: '0 auto', textAlign: 'center', minHeight: 'calc(100vh - 56px)' }}>
                <h1 style={{ color: 'white', marginBottom: 16 }}>Join the Volunteer Network</h1>
                <p style={{ color: 'var(--color-text-secondary)', marginBottom: 24, padding: '0 20px' }}>You must register or sign into an official OmniGuard account before you can submit a volunteer application.</p>
                <button onClick={() => navigate('/login')} className="btn-primary" style={{ padding: '12px 24px', background: 'var(--color-blue)', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700 }}>Sign In / Register</button>
            </main>
        );
    }

    if (user.role === 'VOLUNTEER') {
        return (
            <main style={{ padding: '32px 24px', maxWidth: 1400, margin: '0 auto', textAlign: 'center' }}>
                <h1 style={{ color: 'white', marginBottom: 16 }}>Volunteer Operations Dashboard</h1>
                <p style={{ color: 'var(--color-text-secondary)', marginBottom: 24 }}>Your volunteer operations are managed directly from the Command Center.</p>
                <button onClick={() => navigate('/command-center')} className="btn-primary" style={{ padding: '12px 24px', background: 'var(--color-blue)', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700 }}>Go to Command Center</button>
            </main>
        );
    }

    if (['ADMIN', 'OFFICER', 'RESCUE'].includes(user.role)) {
        return (
            <main style={{ padding: '32px 24px', maxWidth: 1400, margin: '0 auto', textAlign: 'center' }}>
                <h1 style={{ color: 'white', marginBottom: 16 }}>Official Personnel</h1>
                <p style={{ color: 'var(--color-text-secondary)', marginBottom: 24 }}>You are already registered to the network with an official rank: <strong>{user.role}</strong>.</p>
                <button onClick={() => navigate('/command-center')} className="btn-primary" style={{ padding: '12px 24px', background: 'var(--color-blue)', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700 }}>Go to Command Center</button>
            </main>
        );
    }

    return (
        <main className="animate-fade-in-up" style={{ padding: '32px 24px', maxWidth: 800, margin: '0 auto', minHeight: 'calc(100vh - 56px)' }}>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem,4vw,2.8rem)', fontWeight: 800, color: 'white', marginBottom: 12 }}>
                    Join the Volunteer Network
                </h1>
                <p style={{ color: 'var(--color-text-secondary)', maxWidth: 600, margin: '0 auto', lineHeight: 1.7 }}>
                    Your community needs you. Register your skills and availability to be pinged during emergency situations.
                </p>
            </div>

            {submitted ? (
                <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', padding: 32, borderRadius: 16, textAlign: 'center' }}>
                    <i className="fa-solid fa-circle-check" style={{ fontSize: '3rem', color: '#10b981', marginBottom: 16 }} />
                    <h2 style={{ color: 'white', marginBottom: 8 }}>Application Received!</h2>
                    <p style={{ color: 'var(--color-text-secondary)' }}>You will be contacted by a regional officer once your background check is completed.</p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} style={{ background: 'rgba(17,24,39,0.7)', padding: 32, borderRadius: 16, border: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <div>
                            <label style={{ display: 'block', color: 'var(--color-text-primary)', marginBottom: 8, fontSize: '0.9rem', fontWeight: 600 }}>Full Name</label>
                            <input type="text" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} required style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: 'white' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', color: 'var(--color-text-primary)', marginBottom: 8, fontSize: '0.9rem', fontWeight: 600 }}>Phone Number</label>
                            <input type="tel" value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} required style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: 'white' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', color: 'var(--color-text-primary)', marginBottom: 8, fontSize: '0.9rem', fontWeight: 600 }}>Specialized Skills (Check all that apply)</label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                {['First Aid / CPR', 'Heavy Machinery Operation', 'Medical Professional', 'Search & Rescue', 'Multilingual', 'Transportation / CDL'].map(skill => (
                                    <label key={skill} style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
                                        <input type="checkbox" checked={form.skills.includes(skill)} onChange={() => handleCheck(skill)} /> {skill}
                                    </label>
                                ))}
                            </div>
                        </div>
                        <button type="submit" disabled={submitting} style={{ padding: '14px', background: 'var(--color-blue)', color: 'white', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: '1rem', cursor: submitting ? 'not-allowed' : 'pointer', marginTop: 12, opacity: submitting ? 0.7 : 1 }}>
                            {submitting ? 'Submitting...' : 'Submit Application'}
                        </button>
                    </div>
                </form>
            )}
        </main>
    );
}
