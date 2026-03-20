import { useState } from 'react';

const SKILLS = [
    'First Aid / Medical', 'Search & Rescue', 'Swimming / Water Rescue',
    'Driving (Heavy Vehicle)', 'Cooking / Food Distribution', 'Communication / Radio',
    'Construction / Debris Removal', 'Psychological Support', 'Logistics / Coordination',
    'Translation / Interpreter',
];

const DISTRICTS = [
    'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem',
    'Tirunelveli', 'Vellore', 'Kancheepuram', 'Erode', 'Tirupur',
    'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Kolkata', 'Pune',
];

export default function VolunteerRegisterModal({ onClose, onRegistered }) {
    const [step, setStep] = useState(1); // 1: form, 2: success
    const [form, setForm] = useState({
        fullName: '',
        phone: '',
        email: '',
        age: '',
        district: '',
        address: '',
        govtId: '',
        skills: [],
        availability: 'ANYTIME',
        emergencyContact: '',
        medicalConditions: '',
        experience: '',
    });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const AVAIL_OPTIONS = [
        { v: 'ANYTIME', label: '24/7 Available', color: '#22c55e' },
        { v: 'WEEKENDS', label: 'Weekends Only', color: '#3b82f6' },
        { v: 'EVENINGS', label: 'Evenings (5–9PM)', color: '#f97316' },
        { v: 'ON_CALL', label: 'On-Call Basis', color: '#a855f7' },
    ];

    const toggleSkill = (skill) => {
        setForm(p => ({
            ...p,
            skills: p.skills.includes(skill) ? p.skills.filter(s => s !== skill) : [...p.skills, skill]
        }));
    };

    const validate = () => {
        const e = {};
        if (!form.fullName.trim()) e.fullName = 'Full name is required';
        if (!/^\d{10}$/.test(form.phone.replace(/\s/g, ''))) e.phone = 'Enter a valid 10-digit phone number';
        if (!form.district) e.district = 'Select your district';
        if (!form.age || form.age < 18 || form.age > 70) e.age = 'Age must be between 18 and 70';
        if (form.skills.length === 0) e.skills = 'Select at least one skill';
        if (!form.govtId.trim()) e.govtId = 'Govt ID proof reference is required';
        return e;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }

        setSubmitting(true);
        await new Promise(r => setTimeout(r, 1200));

        // Save to localStorage (simulate backend)
        const regId = 'VOL-' + Math.random().toString(36).slice(2, 8).toUpperCase();
        const entry = { ...form, registrationId: regId, registeredAt: new Date().toISOString(), status: 'PENDING_APPROVAL' };
        const existing = JSON.parse(localStorage.getItem('og_volunteers') || '[]');
        localStorage.setItem('og_volunteers', JSON.stringify([...existing, entry]));

        setSubmitting(false);
        setStep(2);
        if (onRegistered) onRegistered(entry);
    };

    const inputStyle = (field) => ({
        width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.04)',
        border: `1px solid ${errors[field] ? '#ef4444' : 'var(--color-border)'}`,
        borderRadius: 10, padding: '10px 14px', color: 'white', fontSize: '0.85rem',
        outline: 'none', fontFamily: 'var(--font-body)',
    });

    const labelStyle = {
        display: 'block', fontSize: '0.72rem', fontWeight: 700,
        textTransform: 'uppercase', letterSpacing: '0.06em',
        color: 'var(--color-text-muted)', marginBottom: 6,
    };

    return (
        <div
            style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
            onClick={e => e.target === e.currentTarget && onClose()}
        >
            <div style={{ background: '#0a0f1e', border: '1px solid rgba(168,85,247,0.3)', borderRadius: 22, width: '100%', maxWidth: 620, maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 30px 80px rgba(0,0,0,0.8)', overflow: 'hidden' }}>

                {/* Header */}
                <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--color-border)', background: 'linear-gradient(135deg, rgba(168,85,247,0.1), rgba(79,70,229,0.08))', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <i className="fa-solid fa-hands-helping" style={{ color: '#a855f7', fontSize: '1.1rem' }} />
                        </div>
                        <div>
                            <h2 style={{ color: 'white', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.05rem', margin: 0 }}>Volunteer Registration</h2>
                            <p style={{ color: '#a855f7', fontSize: '0.7rem', margin: 0, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.08em' }}>NDMA Community Relief Network</p>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '1.1rem', lineHeight: 1 }}>
                        <i className="fa-solid fa-xmark" />
                    </button>
                </div>

                {/* Body */}
                <div style={{ overflowY: 'auto', flex: 1 }}>
                    {step === 2 ? (
                        /* ── Success Screen ── */
                        <div style={{ padding: 40, textAlign: 'center' }}>
                            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(34,197,94,0.1)', border: '2px solid #22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 0 40px rgba(34,197,94,0.2)' }}>
                                <i className="fa-solid fa-circle-check" style={{ color: '#22c55e', fontSize: '2rem' }} />
                            </div>
                            <h3 style={{ color: 'white', fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800, marginBottom: 10 }}>Registration Successful!</h3>
                            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.88rem', lineHeight: 1.7, marginBottom: 24, maxWidth: 360, margin: '0 auto 24px' }}>
                                Welcome to the NDMA Volunteer Network, <strong style={{ color: 'white' }}>{form.fullName}</strong>!
                                Your registration is under review. You'll be notified within 24 hours.
                            </p>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, maxWidth: 360, margin: '0 auto 28px', textAlign: 'left' }}>
                                {[
                                    { label: 'District', value: form.district, icon: 'fa-location-dot' },
                                    { label: 'Availability', value: AVAIL_OPTIONS.find(a => a.v === form.availability)?.label, icon: 'fa-clock' },
                                    { label: 'Skills', value: `${form.skills.length} registered`, icon: 'fa-star' },
                                    { label: 'Status', value: 'Pending Approval', icon: 'fa-hourglass-half' },
                                ].map(item => (
                                    <div key={item.label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--color-border)', borderRadius: 10, padding: '10px 14px' }}>
                                        <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                            <i className={`fa-solid ${item.icon}`} style={{ marginRight: 4 }} />{item.label}
                                        </div>
                                        <div style={{ color: 'white', fontWeight: 600, fontSize: '0.82rem' }}>{item.value}</div>
                                    </div>
                                ))}
                            </div>

                            <div style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.25)', borderRadius: 12, padding: '12px 20px', marginBottom: 24, fontSize: '0.8rem', color: '#c4b5fd' }}>
                                <i className="fa-solid fa-circle-info" style={{ marginRight: 6 }} />
                                Keep your phone accessible. Rescue coordinators may call you during active operations.
                            </div>
                            <button onClick={onClose} className="btn-primary" style={{ padding: '12px 32px', borderRadius: 12 }}>
                                Go to Dashboard
                            </button>
                        </div>
                    ) : (
                        /* ── Registration Form ── */
                        <form onSubmit={handleSubmit} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>

                            {/* Personal Info */}
                            <div>
                                <div style={{ fontSize: '0.75rem', color: '#a855f7', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <i className="fa-solid fa-user" /> Personal Information
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                    <div style={{ gridColumn: '1 / -1' }}>
                                        <label style={labelStyle}>Full Name *</label>
                                        <input
                                            style={inputStyle('fullName')}
                                            placeholder="As per government ID"
                                            value={form.fullName}
                                            onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))}
                                        />
                                        {errors.fullName && <span style={{ color: '#f87171', fontSize: '0.7rem' }}>{errors.fullName}</span>}
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Age *</label>
                                        <input
                                            style={inputStyle('age')}
                                            type="number" min="18" max="70" placeholder="18–70"
                                            value={form.age}
                                            onChange={e => setForm(p => ({ ...p, age: e.target.value }))}
                                        />
                                        {errors.age && <span style={{ color: '#f87171', fontSize: '0.7rem' }}>{errors.age}</span>}
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Phone Number *</label>
                                        <input
                                            style={inputStyle('phone')}
                                            placeholder="10-digit mobile"
                                            value={form.phone}
                                            onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                                        />
                                        {errors.phone && <span style={{ color: '#f87171', fontSize: '0.7rem' }}>{errors.phone}</span>}
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Email (Optional)</label>
                                        <input
                                            style={inputStyle('email')}
                                            type="email" placeholder="yourname@example.com"
                                            value={form.email}
                                            onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                                        />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>District *</label>
                                        <select
                                            style={{ ...inputStyle('district'), appearance: 'none' }}
                                            value={form.district}
                                            onChange={e => setForm(p => ({ ...p, district: e.target.value }))}
                                        >
                                            <option value="">Select District</option>
                                            {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                                        </select>
                                        {errors.district && <span style={{ color: '#f87171', fontSize: '0.7rem' }}>{errors.district}</span>}
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Govt. ID Proof *</label>
                                        <input
                                            style={inputStyle('govtId')}
                                            placeholder="Aadhaar / Voter ID / PAN"
                                            value={form.govtId}
                                            onChange={e => setForm(p => ({ ...p, govtId: e.target.value }))}
                                        />
                                        {errors.govtId && <span style={{ color: '#f87171', fontSize: '0.7rem' }}>{errors.govtId}</span>}
                                    </div>
                                    <div style={{ gridColumn: '1 / -1' }}>
                                        <label style={labelStyle}>Emergency Contact</label>
                                        <input
                                            style={inputStyle('emergencyContact')}
                                            placeholder="Name & phone of a family member"
                                            value={form.emergencyContact}
                                            onChange={e => setForm(p => ({ ...p, emergencyContact: e.target.value }))}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Skills */}
                            <div>
                                <div style={{ fontSize: '0.75rem', color: '#a855f7', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <i className="fa-solid fa-star" /> Skills & Expertise *
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                    {SKILLS.map(skill => (
                                        <button
                                            key={skill}
                                            type="button"
                                            onClick={() => toggleSkill(skill)}
                                            style={{
                                                padding: '6px 14px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                                                background: form.skills.includes(skill) ? 'rgba(168,85,247,0.2)' : 'rgba(255,255,255,0.04)',
                                                border: `1px solid ${form.skills.includes(skill) ? 'rgba(168,85,247,0.5)' : 'var(--color-border)'}`,
                                                color: form.skills.includes(skill) ? '#c4b5fd' : 'var(--color-text-muted)',
                                            }}
                                        >
                                            {form.skills.includes(skill) && <i className="fa-solid fa-check" style={{ marginRight: 5, fontSize: '0.65rem' }} />}
                                            {skill}
                                        </button>
                                    ))}
                                </div>
                                {errors.skills && <span style={{ color: '#f87171', fontSize: '0.7rem', display: 'block', marginTop: 6 }}>{errors.skills}</span>}
                            </div>

                            {/* Availability */}
                            <div>
                                <div style={{ fontSize: '0.75rem', color: '#a855f7', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <i className="fa-solid fa-clock" /> Availability
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                                    {AVAIL_OPTIONS.map(opt => (
                                        <button
                                            key={opt.v}
                                            type="button"
                                            onClick={() => setForm(p => ({ ...p, availability: opt.v }))}
                                            style={{
                                                padding: '10px 14px', borderRadius: 10, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s', textAlign: 'center',
                                                background: form.availability === opt.v ? `${opt.color}20` : 'rgba(255,255,255,0.03)',
                                                border: `1px solid ${form.availability === opt.v ? opt.color + '60' : 'var(--color-border)'}`,
                                                color: form.availability === opt.v ? opt.color : 'var(--color-text-muted)',
                                            }}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Prior experience */}
                            <div>
                                <label style={labelStyle}>Prior Volunteer / Disaster Experience (Optional)</label>
                                <textarea
                                    style={{ ...inputStyle(''), minHeight: 70, resize: 'vertical' }}
                                    placeholder="Briefly describe any relevant experience (NCC, NSS, NDRF, etc.)"
                                    value={form.experience}
                                    onChange={e => setForm(p => ({ ...p, experience: e.target.value }))}
                                />
                            </div>

                            {/* Declaration */}
                            <div style={{ background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.2)', borderRadius: 12, padding: '12px 16px', fontSize: '0.75rem', color: '#a78bfa', lineHeight: 1.6 }}>
                                <i className="fa-solid fa-shield-halved" style={{ marginRight: 6 }} />
                                By submitting this form, I declare that the information provided is accurate. I understand that I may be deployed during active disaster operations and take full responsibility for my participation.
                            </div>

                            {/* Buttons */}
                            <div style={{ display: 'flex', gap: 10 }}>
                                <button type="button" onClick={onClose}
                                    style={{ flex: 1, padding: '12px', borderRadius: 12, background: 'transparent', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)', cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem' }}>
                                    Cancel
                                </button>
                                <button type="submit" disabled={submitting}
                                    style={{ flex: 2, padding: '12px', borderRadius: 12, background: 'linear-gradient(135deg,#a855f7,#7c3aed)', color: 'white', border: 'none', fontWeight: 700, fontSize: '0.9rem', cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                    {submitting ? (
                                        <><i className="fa-solid fa-circle-notch spin" /> Registering...</>
                                    ) : (
                                        <><i className="fa-solid fa-hands-helping" /> Register as Volunteer</>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
