import { useState, useCallback } from 'react';

// ── Seed of community helpers (simulated local network) ───────────────────────
const COMMUNITY_MEMBERS = [
    { id: 'cm-1', name: 'Arjun Sharma', role: 'First Aid Volunteer', area: 'Anna Nagar', lat: 13.085, lng: 80.21, skills: ['First Aid', 'CPR'], available: true, rating: 4.9, helps: 23, avatar: 'AS', color: '#22c55e' },
    { id: 'cm-2', name: 'Priya Nair', role: 'Community Coordinator', area: 'T. Nagar', lat: 13.04, lng: 80.23, skills: ['Logistics', 'Food Distribution'], available: true, rating: 4.7, helps: 41, avatar: 'PN', color: '#3b82f6' },
    { id: 'cm-3', name: 'Rahul Menon', role: 'Rescue Diver', area: 'Adyar', lat: 13.003, lng: 80.255, skills: ['Water Rescue', 'Diving'], available: false, rating: 5.0, helps: 15, avatar: 'RM', color: '#a855f7' },
    { id: 'cm-4', name: 'Dr. Kavitha Reddy', role: 'Medical Volunteer', area: 'Mylapore', lat: 13.033, lng: 80.267, skills: ['Emergency Medicine', 'Triage'], available: true, rating: 4.8, helps: 38, avatar: 'KR', color: '#ef4444' },
    { id: 'cm-5', name: 'Sathish Kumar', role: 'Vehicle Owner (4WD)', area: 'Ambattur', lat: 13.098, lng: 80.163, skills: ['Transportation', 'Navigation'], available: true, rating: 4.5, helps: 12, avatar: 'SK', color: '#f97316' },
    { id: 'cm-6', name: 'Meena Iyer', role: 'Counsellor', area: 'Velachery', lat: 12.978, lng: 80.218, skills: ['Psychological Support', 'Child Care'], available: true, rating: 4.6, helps: 29, avatar: 'MI', color: '#eab308' },
    { id: 'cm-7', name: 'Ahmed Ansari', role: 'Construction Expert', area: 'Perambur', lat: 13.117, lng: 80.236, skills: ['Debris Removal', 'Structural Safety'], available: false, rating: 4.4, helps: 9, avatar: 'AA', color: '#10b981' },
    { id: 'cm-8', name: 'Sunita Verma', role: 'Cook / Food Organiser', area: 'Guindy', lat: 13.008, lng: 80.207, skills: ['Cooking', 'Food Safety'], available: true, rating: 4.7, helps: 55, avatar: 'SV', color: '#06b6d4' },
];

const RESOURCE_OFFERS = [
    { id: 'ro-1', offeredBy: 'Arjun Sharma', item: 'First Aid Kit (×3)', category: 'Medical', area: 'Anna Nagar', available: true, color: '#22c55e' },
    { id: 'ro-2', offeredBy: 'Sathish Kumar', item: '4WD Vehicle (seats 6)', category: 'Transport', area: 'Ambattur', available: true, color: '#f97316' },
    { id: 'ro-3', offeredBy: 'Sunita Verma', item: 'Cooked meals (50 portions)', category: 'Food', area: 'Guindy', available: true, color: '#06b6d4' },
    { id: 'ro-4', offeredBy: 'Rahul Menon', item: 'Inflatable rescue boat', category: 'Equipment', area: 'Adyar', available: false, color: '#a855f7' },
    { id: 'ro-5', offeredBy: 'Priya Nair', item: 'Safe room (family of 4)', category: 'Shelter', area: 'T. Nagar', available: true, color: '#3b82f6' },
    { id: 'ro-6', offeredBy: 'Ahmed Ansari', item: 'Generator (5kW)', category: 'Equipment', area: 'Perambur', available: true, color: '#10b981' },
];

const HELP_REQUESTS = [
    { id: 'hr-1', from: 'Anonymous', need: 'Need wheelchair-accessible transport to shelter', category: 'Transport', area: 'Mylapore', urgent: true, time: '2 min ago' },
    { id: 'hr-2', from: 'Ramesh P.', need: 'Elderly parent needs medication (Metformin 500mg)', category: 'Medical', area: 'Velachery', urgent: true, time: '8 min ago' },
    { id: 'hr-3', from: 'Anonymous', need: 'Family of 5 needs shelter — 2 toddlers', category: 'Shelter', area: 'Adyar', urgent: false, time: '15 min ago' },
    { id: 'hr-4', from: 'Lakshmi R.', need: 'Need help clearing debris from entrance', category: 'Manual Labour', area: 'Ambattur', urgent: false, time: '22 min ago' },
];

const CAT_COLORS = { Medical: '#ef4444', Transport: '#f97316', Food: '#22c55e', Shelter: '#3b82f6', Equipment: '#a855f7', 'Manual Labour': '#eab308' };

export default function CommunityHelpNetwork({ onClose }) {
    const [tab, setTab] = useState('members'); // members | offers | needs | post
    const [filterAvail, setFilterAvail] = useState(false);
    const [needForm, setNeedForm] = useState({ description: '', category: 'Medical', area: '', urgent: false });
    const [posted, setPosted] = useState(false);
    const [contactedId, setContactedId] = useState(null);

    const handlePost = useCallback((e) => {
        e.preventDefault();
        setPosted(true);
    }, []);

    const TABS = [
        { id: 'members', label: 'Volunteers', icon: 'fa-people-group', count: COMMUNITY_MEMBERS.filter(m => m.available).length },
        { id: 'offers', label: 'Resources', icon: 'fa-box-open', count: RESOURCE_OFFERS.filter(r => r.available).length },
        { id: 'needs', label: 'Help Needed', icon: 'fa-hand-holding-heart', count: HELP_REQUESTS.length, urgent: HELP_REQUESTS.filter(r => r.urgent).length },
        { id: 'post', label: 'Ask for Help', icon: 'fa-bullhorn', count: null },
    ];

    const visibleMembers = filterAvail ? COMMUNITY_MEMBERS.filter(m => m.available) : COMMUNITY_MEMBERS;

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)' }}
            onClick={e => e.target === e.currentTarget && onClose()}>
            <div style={{ background: '#070d1a', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 22, width: '100%', maxWidth: 680, maxHeight: '92vh', display: 'flex', flexDirection: 'column', boxShadow: '0 40px 100px rgba(0,0,0,0.9)', overflow: 'hidden' }}>

                {/* Header */}
                <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'linear-gradient(135deg,rgba(16,185,129,0.07),rgba(6,182,212,0.04))', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <i className="fa-solid fa-people-roof" style={{ color: '#10b981', fontSize: '1.1rem' }} />
                        </div>
                        <div>
                            <h2 style={{ color: 'white', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.05rem', margin: 0 }}>Community Help Network</h2>
                            <p style={{ color: '#10b981', fontSize: '0.68rem', margin: 0, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                Peer-to-Peer Disaster Support · {COMMUNITY_MEMBERS.filter(m => m.available).length} Volunteers Active
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '1.1rem' }}>
                        <i className="fa-solid fa-xmark" />
                    </button>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
                    {TABS.map(t => (
                        <button key={t.id} onClick={() => setTab(t.id)}
                            style={{ flex: 1, padding: '11px 4px', background: 'none', border: 'none', borderBottom: `2px solid ${tab === t.id ? '#10b981' : 'transparent'}`, color: tab === t.id ? 'white' : 'var(--color-text-muted)', fontWeight: tab === t.id ? 700 : 500, cursor: 'pointer', fontSize: '0.72rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, transition: 'all 0.2s' }}>
                            <div style={{ position: 'relative' }}>
                                <i className={`fa-solid ${t.icon}`} />
                                {t.count != null && (
                                    <span style={{ position: 'absolute', top: -6, right: -10, background: t.urgent ? '#ef4444' : '#10b981', color: 'white', borderRadius: 8, padding: '0 4px', fontSize: '0.55rem', fontWeight: 800, minWidth: 14, textAlign: 'center' }}>{t.count}</span>
                                )}
                            </div>
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* Body */}
                <div style={{ overflowY: 'auto', flex: 1, padding: 20 }}>

                    {/* ── Volunteers tab ── */}
                    {tab === 'members' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.75rem', color: 'var(--color-text-muted)', cursor: 'pointer' }}>
                                    <input type="checkbox" checked={filterAvail} onChange={e => setFilterAvail(e.target.checked)} style={{ accentColor: '#10b981' }} />
                                    Available only
                                </label>
                            </div>
                            {visibleMembers.map(m => (
                                <div key={m.id} style={{ background: 'rgba(0,0,0,0.35)', border: `1px solid ${m.available ? 'rgba(16,185,129,0.15)' : 'var(--color-border)'}`, borderRadius: 14, padding: '14px 16px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                                    <div style={{ width: 42, height: 42, borderRadius: '50%', background: `${m.color}20`, border: `2px solid ${m.color}60`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem', color: m.color, flexShrink: 0 }}>
                                        {m.avatar}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                                            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'white' }}>{m.name}</span>
                                            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: m.available ? '#22c55e' : '#64748b', background: m.available ? 'rgba(34,197,94,0.1)' : 'rgba(100,116,139,0.1)', padding: '2px 8px', borderRadius: 8 }}>
                                                {m.available ? '● Available' : '○ Busy'}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', marginBottom: 6 }}>
                                            {m.role} · <i className="fa-solid fa-location-dot" style={{ marginRight: 3 }} />{m.area}
                                        </div>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 8 }}>
                                            {m.skills.map(s => (
                                                <span key={s} style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: 8, background: `${m.color}15`, border: `1px solid ${m.color}30`, color: m.color, fontWeight: 600 }}>{s}</span>
                                            ))}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: '0.68rem', color: 'var(--color-text-muted)' }}>
                                            <span>⭐ {m.rating}</span>
                                            <span><i className="fa-solid fa-hands-helping" style={{ marginRight: 3 }} />{m.helps} helps</span>
                                            {m.available && (
                                                contactedId === m.id ? (
                                                    <span style={{ color: '#22c55e', fontWeight: 700 }}><i className="fa-solid fa-circle-check" style={{ marginRight: 4 }} />Request Sent!</span>
                                                ) : (
                                                    <button onClick={() => setContactedId(m.id)}
                                                        style={{ marginLeft: 'auto', padding: '5px 12px', borderRadius: 8, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981', cursor: 'pointer', fontWeight: 700, fontSize: '0.68rem' }}>
                                                        Contact →
                                                    </button>
                                                )
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ── Resource offers tab ── */}
                    {tab === 'offers' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginBottom: 4 }}>Community members offering resources during the emergency</div>
                            {RESOURCE_OFFERS.map(r => {
                                const catColor = CAT_COLORS[r.category] || '#64748b';
                                return (
                                    <div key={r.id} style={{ background: 'rgba(0,0,0,0.35)', border: `1px solid ${r.available ? catColor + '25' : 'var(--color-border)'}`, borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div style={{ width: 36, height: 36, borderRadius: 10, background: `${catColor}15`, border: `1px solid ${catColor}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <i className="fa-solid fa-box-open" style={{ color: catColor, fontSize: '0.9rem' }} />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'white', marginBottom: 2 }}>{r.item}</div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                                                Offered by <strong style={{ color: 'white' }}>{r.offeredBy}</strong> · <i className="fa-solid fa-location-dot" style={{ marginRight: 3 }} />{r.area}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                                            <span style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: 8, background: `${catColor}15`, border: `1px solid ${catColor}30`, color: catColor, fontWeight: 700 }}>{r.category}</span>
                                            <span style={{ fontSize: '0.65rem', color: r.available ? '#22c55e' : '#64748b', fontWeight: 700 }}>{r.available ? '✓ Available' : '✗ Taken'}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* ── Help requests tab ── */}
                    {tab === 'needs' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginBottom: 4 }}>Community members who need assistance right now</div>
                            {HELP_REQUESTS.map(req => (
                                <div key={req.id} style={{ background: req.urgent ? 'rgba(239,68,68,0.06)' : 'rgba(0,0,0,0.35)', border: `1px solid ${req.urgent ? 'rgba(239,68,68,0.3)' : 'var(--color-border)'}`, borderRadius: 12, padding: '14px 16px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6, gap: 8 }}>
                                        <div style={{ flex: 1 }}>
                                            {req.urgent && <span style={{ fontSize: '0.62rem', color: '#ef4444', background: 'rgba(239,68,68,0.15)', padding: '1px 7px', borderRadius: 8, fontWeight: 700, fontFamily: 'monospace', display: 'inline-block', marginBottom: 4 }}>🚨 URGENT</span>}
                                            <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'white', lineHeight: 1.4 }}>{req.need}</div>
                                        </div>
                                        <button
                                            style={{ padding: '7px 12px', borderRadius: 8, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981', cursor: 'pointer', fontWeight: 700, fontSize: '0.72rem', flexShrink: 0 }}>
                                            Respond
                                        </button>
                                    </div>
                                    <div style={{ display: 'flex', gap: 10, fontSize: '0.68rem', color: 'var(--color-text-muted)' }}>
                                        <span><i className="fa-solid fa-clock" style={{ marginRight: 3 }} />{req.time}</span>
                                        <span><i className="fa-solid fa-location-dot" style={{ marginRight: 3 }} />{req.area}</span>
                                        <span style={{ padding: '1px 7px', borderRadius: 8, background: `${CAT_COLORS[req.category] || '#64748b'}15`, color: CAT_COLORS[req.category] || '#64748b', fontWeight: 600 }}>{req.category}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ── Post a help request ── */}
                    {tab === 'post' && (
                        <div>
                            {posted ? (
                                <div style={{ textAlign: 'center', padding: '30px 0' }}>
                                    <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(16,185,129,0.1)', border: '2px solid #10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 0 30px rgba(16,185,129,0.2)' }}>
                                        <i className="fa-solid fa-circle-check" style={{ color: '#10b981', fontSize: '1.8rem' }} />
                                    </div>
                                    <h3 style={{ color: 'white', fontWeight: 800, fontSize: '1.2rem', marginBottom: 8 }}>Request Posted!</h3>
                                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', lineHeight: 1.7, maxWidth: 340, margin: '0 auto 24px' }}>
                                        Your request has been broadcast to nearby volunteers. You should receive a response within a few minutes.
                                    </p>
                                    <button onClick={() => { setPosted(false); setTab('needs'); setNeedForm({ description: '', category: 'Medical', area: '', urgent: false }); }}
                                        style={{ padding: '10px 24px', borderRadius: 12, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}>
                                        View All Requests
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handlePost} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                    <div style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.18)', borderRadius: 12, padding: '12px 16px', fontSize: '0.78rem', color: '#6ee7b7', lineHeight: 1.6 }}>
                                        <i className="fa-solid fa-lock" style={{ marginRight: 6 }} />
                                        Your request can be posted anonymously. Only your general area will be visible to helpers.
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 7 }}>What do you need? *</label>
                                        <textarea className="form-input" required value={needForm.description}
                                            onChange={e => setNeedForm(p => ({ ...p, description: e.target.value }))}
                                            placeholder="Describe what you need and how urgent it is..."
                                            style={{ minHeight: 90, resize: 'vertical' }} />
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 7 }}>Category *</label>
                                            <select className="form-input" value={needForm.category} onChange={e => setNeedForm(p => ({ ...p, category: e.target.value }))} style={{ appearance: 'none' }}>
                                                {Object.keys(CAT_COLORS).map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 7 }}>Your Area *</label>
                                            <input className="form-input" required placeholder="e.g. Adyar, T. Nagar" value={needForm.area}
                                                onChange={e => setNeedForm(p => ({ ...p, area: e.target.value }))} />
                                        </div>
                                    </div>

                                    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.18)', borderRadius: 10, padding: '12px 14px' }}>
                                        <input type="checkbox" checked={needForm.urgent} onChange={e => setNeedForm(p => ({ ...p, urgent: e.target.checked }))} style={{ accentColor: '#ef4444', width: 16, height: 16 }} />
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#fca5a5' }}>🚨 This is urgent / life-threatening</div>
                                            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Marks your request as urgent and notifies more volunteers immediately</div>
                                        </div>
                                    </label>

                                    <button type="submit" style={{ padding: '13px', borderRadius: 14, background: 'linear-gradient(135deg,#10b981,#059669)', color: 'white', border: 'none', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                        <i className="fa-solid fa-bullhorn" />Post Help Request to Community
                                    </button>
                                </form>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
