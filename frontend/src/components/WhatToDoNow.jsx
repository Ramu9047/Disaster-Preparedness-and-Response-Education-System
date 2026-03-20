import { useState, useMemo } from 'react';
import { useDisasterData } from '../context/DisasterDataContext';

// ── Decision tree: disaster type → step-by-step action plan ──────────────────
const DECISION_TREE = {
    FLOOD: {
        label: 'Flood / Water Inundation',
        icon: 'fa-water',
        color: '#3b82f6',
        bg: 'rgba(59,130,246,0.08)',
        phases: [
            {
                phase: 'IMMEDIATE (0–30 min)',
                color: '#ef4444',
                steps: [
                    'Move to the HIGHEST floor or rooftop immediately',
                    'Turn off electricity at the main switch — do NOT touch wet switches',
                    'Do NOT walk through moving water (15 cm can knock you down)',
                    'Collect: drinking water, medicines, torch, phone charger',
                ]
            },
            {
                phase: 'SHORT-TERM (30 min – 3 hrs)',
                color: '#f97316',
                steps: [
                    'Call State Disaster Helpline: 1077',
                    'Signal rescuers with bright cloth / torch from rooftop',
                    'Keep children and elderly away from windows',
                    'Do NOT drink tap water — use sealed bottles only',
                ]
            },
            {
                phase: 'EVACUATION PROTOCOL',
                color: '#22c55e',
                steps: [
                    'Follow official rescue personnel ONLY — do not self-evacuate via flooded roads',
                    'Take: ID proof, medicines, valuables in waterproof bag',
                    'Go to nearest government shelter (check Nearby Finder on this platform)',
                    'Inform a family member / contact of your shelter location',
                ]
            }
        ],
        hotlines: [{ name: 'Flood Relief', number: '1077' }, { name: 'Emergency', number: '112' }, { name: 'NDRF', number: '011-24363260' }]
    },

    CYCLONE: {
        label: 'Cyclone / Severe Storm',
        icon: 'fa-tornado',
        color: '#a855f7',
        bg: 'rgba(168,85,247,0.08)',
        phases: [
            {
                phase: 'BEFORE LANDFALL (6–12 hrs prior)',
                color: '#ef4444',
                steps: [
                    'Board up windows with wood or thick tape — tape an X pattern on glass',
                    'Store 72 hours of water & dry food (3 litres/person/day)',
                    'Charge ALL devices: phone, power bank, emergency radio',
                    'Secure or stow all outdoor objects (furniture, vehicles)',
                ]
            },
            {
                phase: 'DURING LANDFALL',
                color: '#f97316',
                steps: [
                    'Stay INDOORS — move to an interior room with no windows',
                    'Do not go outdoors during the "eye" — the storm will resume',
                    'Keep emergency radio on for official updates',
                    'If roof fails → move to stairwell or interior wall',
                ]
            },
            {
                phase: 'AFTER THE STORM',
                color: '#22c55e',
                steps: [
                    'Do not go outside until officially declared safe',
                    'Avoid downed power lines and flooded roads',
                    'Report structural damage to local authorities',
                    'Boil all water before drinking until supply is certified safe',
                ]
            }
        ],
        hotlines: [{ name: 'Cyclone Helpline', number: '1800-180-1717' }, { name: 'Emergency', number: '112' }, { name: 'Coast Guard', number: '1554' }]
    },

    EARTHQUAKE: {
        label: 'Earthquake',
        icon: 'fa-house-crack',
        color: '#ef4444',
        bg: 'rgba(239,68,68,0.08)',
        phases: [
            {
                phase: 'DURING SHAKING (DROP, COVER, HOLD)',
                color: '#ef4444',
                steps: [
                    'DROP to your hands and knees immediately',
                    'COVER your head/neck under a sturdy desk or table, or against an interior wall',
                    'HOLD ON until shaking stops — do NOT run outside during shaking',
                    'Stay away from windows, heavy furniture, and exterior walls',
                ]
            },
            {
                phase: 'IMMEDIATELY AFTER',
                color: '#f97316',
                steps: [
                    'Check yourself and others for injuries — do NOT move seriously injured people',
                    'Check for gas leaks: if you smell gas, leave immediately and call 101',
                    'Expect and prepare for aftershocks',
                    'Do NOT use elevators, open flames, or electrical switches',
                ]
            },
            {
                phase: 'IF TRAPPED',
                color: '#22c55e',
                steps: [
                    'Cover mouth with cloth to prevent dust inhalation',
                    'Tap on pipe or wall so rescuers can hear you',
                    'Use phone torch/whistle to signal; shout only periodically',
                    'Do NOT light a match or lighter',
                ]
            }
        ],
        hotlines: [{ name: 'Emergency', number: '112' }, { name: 'Ambulance', number: '108' }, { name: 'NDRF', number: '011-24363260' }]
    },

    FIRE: {
        label: 'Fire / Building Fire',
        icon: 'fa-fire',
        color: '#f97316',
        bg: 'rgba(249,115,22,0.08)',
        phases: [
            {
                phase: 'IMMEDIATE RESPONSE',
                color: '#ef4444',
                steps: [
                    'Call 101 (Fire Brigade) IMMEDIATELY — give your exact address',
                    'Activate the building fire alarm if available',
                    'DO NOT use the elevator — use stairwells only',
                    'If room fills with smoke — crawl low to the ground where air is cleaner',
                ]
            },
            {
                phase: 'ESCAPE PROTOCOL',
                color: '#f97316',
                steps: [
                    'Feel door handle before opening — if hot, do NOT open; use alternative exit',
                    'Close doors behind you to slow fire spread',
                    'Move upwind and away from smoke — do NOT re-enter for any belongings',
                    'Meet at designated assembly point',
                ]
            },
            {
                phase: 'IF TRAPPED BY FIRE',
                color: '#22c55e',
                steps: [
                    'Stay at window and signal to rescuers with bright cloth or torch',
                    'Seal door gaps with clothing or bedding to block smoke',
                    'Signal rescuers by shouting and waving from window',
                    'Do NOT break window unless ready to escape immediately',
                ]
            }
        ],
        hotlines: [{ name: 'Fire Brigade', number: '101' }, { name: 'Emergency', number: '112' }, { name: 'Ambulance', number: '108' }]
    },

    HEATWAVE: {
        label: 'Heatwave / Extreme Heat',
        icon: 'fa-sun',
        color: '#eab308',
        bg: 'rgba(234,179,8,0.08)',
        phases: [
            {
                phase: 'IMMEDIATE PROTECTION',
                color: '#ef4444',
                steps: [
                    'Stay indoors between 11am–3pm when heat is most intense',
                    'Drink 3–4 litres of water daily — do NOT wait until you feel thirsty',
                    'Wear light-coloured, loose, cotton clothing',
                    'Never leave children, elderly, or pets in parked vehicles',
                ]
            },
            {
                phase: 'SIGNS OF HEAT STROKE',
                color: '#f97316',
                steps: [
                    'Signs: body temp >40°C, no sweating, confusion, unconsciousness',
                    'Call 108 immediately for heat stroke — it is a medical emergency',
                    'Move victim to shade; apply cool water/ice to neck, armpits, groin',
                    'Do NOT give fluids to an unconscious person',
                ]
            },
            {
                phase: 'COMMUNITY SUPPORT',
                color: '#22c55e',
                steps: [
                    'Check on elderly neighbours and those living alone daily',
                    'Use government cooling centres (check nearest shelter on this platform)',
                    'Avoid alcohol and caffeine — they accelerate dehydration',
                    'Report heat-related emergencies to local health office',
                ]
            }
        ],
        hotlines: [{ name: 'Ambulance', number: '108' }, { name: 'Heat Emergency', number: '104' }, { name: 'Emergency', number: '112' }]
    },
};

export default function WhatToDoNow({ onClose }) {
    const { incidents } = useDisasterData();
    const [selected, setSelected] = useState(null);
    const [activePhase, setActivePhase] = useState(0);

    // Auto-detect most likely disaster from active incidents
    const detectedType = useMemo(() => {
        const active = incidents.filter(i => i.status !== 'RESOLVED');
        for (const inc of active) {
            const type = inc.type?.toUpperCase() || '';
            if (type.includes('FLOOD')) return 'FLOOD';
            if (type.includes('CYCLONE') || type.includes('STORM') || type.includes('HURRICANE')) return 'CYCLONE';
            if (type.includes('EARTHQUAKE') || type.includes('QUAKE') || type.includes('SEISMIC')) return 'EARTHQUAKE';
            if (type.includes('FIRE') || type.includes('WILDFIRE')) return 'FIRE';
            if (type.includes('HEAT')) return 'HEATWAVE';
        }
        return null;
    }, [incidents]);

    const plan = selected ? DECISION_TREE[selected] : null;

    const TYPES = Object.entries(DECISION_TREE).map(([key, val]) => ({ key, ...val }));

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)' }}
            onClick={e => e.target === e.currentTarget && onClose()}>
            <div style={{ background: '#070d1a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 22, width: '100%', maxWidth: 700, maxHeight: '92vh', display: 'flex', flexDirection: 'column', boxShadow: '0 40px 100px rgba(0,0,0,0.9)', overflow: 'hidden' }}>

                {/* Header */}
                <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'linear-gradient(135deg,rgba(239,68,68,0.08),rgba(249,115,22,0.05))', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(239,68,68,0.2)', animation: 'pulseGlow 2s infinite' }}>
                            <i className="fa-solid fa-bolt" style={{ color: '#ef4444', fontSize: '1.1rem' }} />
                        </div>
                        <div>
                            <h2 style={{ color: 'white', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.05rem', margin: 0 }}>What To Do NOW</h2>
                            <p style={{ color: '#f97316', fontSize: '0.68rem', margin: 0, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                AI Emergency Decision Engine — Step-by-Step Action Plans
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '1.1rem' }}>
                        <i className="fa-solid fa-xmark" />
                    </button>
                </div>

                <div style={{ overflowY: 'auto', flex: 1 }}>
                    {!plan ? (
                        /* ── Disaster type selector ── */
                        <div style={{ padding: 24 }}>
                            {detectedType && (
                                <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 12, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <i className="fa-solid fa-triangle-exclamation" style={{ color: '#ef4444' }} />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'white', marginBottom: 2 }}>
                                            Active incident detected: <span style={{ color: '#ef4444' }}>{DECISION_TREE[detectedType].label}</span>
                                        </div>
                                        <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>System recommendation based on live incident data</div>
                                    </div>
                                    <button onClick={() => { setSelected(detectedType); setActivePhase(0); }}
                                        style={{ padding: '8px 16px', borderRadius: 10, background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)', color: '#fca5a5', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                                        View Plan →
                                    </button>
                                </div>
                            )}

                            <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
                                Select Your Emergency Situation
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                                {TYPES.map(t => (
                                    <button key={t.key} onClick={() => { setSelected(t.key); setActivePhase(0); }}
                                        style={{ padding: '18px 16px', borderRadius: 14, background: t.bg, border: `1px solid ${t.color}30`, color: 'white', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', gap: 10 }}
                                        onMouseEnter={e => { e.currentTarget.style.borderColor = t.color + '70'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.borderColor = t.color + '30'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                                        <div style={{ width: 38, height: 38, borderRadius: 10, background: `${t.color}20`, border: `1px solid ${t.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <i className={`fa-solid ${t.icon}`} style={{ color: t.color, fontSize: '1rem' }} />
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: 2, color: 'white' }}>{t.label}</div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{t.phases.length} phase action plan</div>
                                        </div>
                                        <div style={{ fontSize: '0.72rem', color: t.color, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                                            Get Plan <i className="fa-solid fa-arrow-right" style={{ fontSize: '0.65rem' }} />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        /* ── Action plan view ── */
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {/* Disaster type header */}
                            <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)', background: plan.bg, display: 'flex', alignItems: 'center', gap: 12 }}>
                                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '0.85rem', marginRight: 4 }}>
                                    <i className="fa-solid fa-arrow-left" />
                                </button>
                                <i className={`fa-solid ${plan.icon}`} style={{ color: plan.color, fontSize: '1.2rem' }} />
                                <div>
                                    <div style={{ fontWeight: 800, fontSize: '1rem', color: 'white', fontFamily: 'var(--font-display)' }}>{plan.label}</div>
                                    <div style={{ fontSize: '0.68rem', color: plan.color, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Emergency Action Plan</div>
                                </div>
                            </div>

                            {/* Phase tabs */}
                            <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
                                {plan.phases.map((phase, i) => (
                                    <button key={i} onClick={() => setActivePhase(i)}
                                        style={{ flex: 1, padding: '11px 8px', background: 'none', border: 'none', borderBottom: `2px solid ${activePhase === i ? plan.color : 'transparent'}`, color: activePhase === i ? 'white' : 'var(--color-text-muted)', fontWeight: activePhase === i ? 700 : 500, cursor: 'pointer', fontSize: '0.72rem', transition: 'all 0.2s', textAlign: 'center' }}>
                                        Phase {i + 1}
                                    </button>
                                ))}
                            </div>

                            {/* Phase content */}
                            <div style={{ padding: 24 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                                    <div style={{ width: 28, height: 28, borderRadius: 8, background: `${plan.phases[activePhase].color}20`, border: `1px solid ${plan.phases[activePhase].color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: plan.phases[activePhase].color }}>{activePhase + 1}</span>
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'white' }}>{plan.phases[activePhase].phase}</div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Critical action steps in sequence</div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                                    {plan.phases[activePhase].steps.map((step, i) => (
                                        <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                                            <div style={{ width: 26, height: 26, borderRadius: '50%', background: `${plan.color}15`, border: `1.5px solid ${plan.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                                                <span style={{ fontWeight: 800, fontSize: '0.68rem', color: plan.color }}>{i + 1}</span>
                                            </div>
                                            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '10px 14px', flex: 1, fontSize: '0.82rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                                                {step}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Navigation buttons */}
                                <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                                    <button onClick={() => setActivePhase(p => Math.max(0, p - 1))} disabled={activePhase === 0}
                                        style={{ flex: 1, padding: '10px', borderRadius: 10, background: activePhase === 0 ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: activePhase === 0 ? '#4b5563' : 'white', fontWeight: 600, cursor: activePhase === 0 ? 'not-allowed' : 'pointer', fontSize: '0.82rem' }}>
                                        ← Previous Phase
                                    </button>
                                    <button onClick={() => setActivePhase(p => Math.min(plan.phases.length - 1, p + 1))} disabled={activePhase === plan.phases.length - 1}
                                        style={{ flex: 1, padding: '10px', borderRadius: 10, background: activePhase === plan.phases.length - 1 ? 'rgba(255,255,255,0.02)' : `${plan.color}20`, border: `1px solid ${activePhase === plan.phases.length - 1 ? 'rgba(255,255,255,0.08)' : plan.color + '40'}`, color: activePhase === plan.phases.length - 1 ? '#4b5563' : plan.color, fontWeight: 700, cursor: activePhase === plan.phases.length - 1 ? 'not-allowed' : 'pointer', fontSize: '0.82rem' }}>
                                        Next Phase →
                                    </button>
                                </div>

                                {/* Emergency hotlines */}
                                <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 14, padding: '14px 16px' }}>
                                    <div style={{ fontSize: '0.65rem', color: '#ef4444', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                                        <i className="fa-solid fa-phone-volume" style={{ marginRight: 6 }} />Emergency Hotlines
                                    </div>
                                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                        {plan.hotlines.map(h => (
                                            <a key={h.name} href={`tel:${h.number}`}
                                                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 10, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5', textDecoration: 'none', fontSize: '0.78rem', fontWeight: 700 }}>
                                                <i className="fa-solid fa-phone" style={{ fontSize: '0.7rem' }} />{h.name}: <strong>{h.number}</strong>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
