import { useState, useEffect, useCallback } from 'react';
import { useDisasterData } from '../context/DisasterDataContext';

// ── Risk scoring engine ───────────────────────────────────────────────────────
function computeRiskProfile(incidents, alerts) {
    let score = 0;
    const factors = [];
    const now = new Date();
    const month = now.getMonth() + 1; // 1-12
    const hour = now.getHours();

    // Incident severity
    const critical = incidents.filter(i => i.severity === 'CRITICAL' && i.status !== 'RESOLVED');
    const high = incidents.filter(i => i.severity === 'HIGH' && i.status !== 'RESOLVED');
    score += critical.length * 25;
    score += high.length * 12;
    if (critical.length > 0) factors.push({ label: `${critical.length} critical incident(s) active`, icon: 'fa-fire', color: '#ef4444' });

    // Alert volume
    const critAlerts = alerts.filter(a => a.type === 'CRITICAL');
    score += critAlerts.length * 18;
    if (critAlerts.length > 0) factors.push({ label: `${critAlerts.length} critical alert(s) broadcast`, icon: 'fa-bell', color: '#ef4444' });

    // Seasonal risk (India-specific)
    if (month >= 6 && month <= 9) {
        score += 20;
        factors.push({ label: 'Monsoon season — elevated flood risk', icon: 'fa-cloud-rain', color: '#3b82f6' });
    } else if (month >= 10 && month <= 12) {
        score += 15;
        factors.push({ label: 'NE monsoon — cyclone watch active', icon: 'fa-tornado', color: '#a855f7' });
    } else if (month >= 3 && month <= 5) {
        score += 10;
        factors.push({ label: 'Pre-monsoon — heatwave risk elevated', icon: 'fa-sun', color: '#f97316' });
    } else {
        factors.push({ label: 'Off-season — lower risk window', icon: 'fa-snowflake', color: '#22c55e' });
    }

    // Nighttime risk (harder to evacuate)
    if (hour >= 22 || hour <= 5) {
        score += 8;
        factors.push({ label: 'Nighttime — evacuation difficulty increased', icon: 'fa-moon', color: '#8b5cf6' });
    }

    const clampedScore = Math.min(score, 100);

    let level, color, bg, pulse;
    if (clampedScore >= 70) { level = 'CRITICAL'; color = '#ef4444'; bg = 'rgba(239,68,68,0.1)'; pulse = true; }
    else if (clampedScore >= 40) { level = 'HIGH'; color = '#f97316'; bg = 'rgba(249,115,22,0.1)'; pulse = false; }
    else if (clampedScore >= 20) { level = 'MODERATE'; color = '#eab308'; bg = 'rgba(234,179,8,0.1)'; pulse = false; }
    else { level = 'LOW'; color = '#22c55e'; bg = 'rgba(34,197,94,0.1)'; pulse = false; }

    return { score: clampedScore, level, color, bg, pulse, factors };
}

// ── Personalized AI recommendations ──────────────────────────────────────────
function getRecommendations(profile, incidents) {
    const { level } = profile;
    const hasFlood = incidents.some(i => i.type?.toLowerCase().includes('flood') && i.status !== 'RESOLVED');
    const hasCyclone = incidents.some(i => i.type?.toLowerCase().includes('cyclone') && i.status !== 'RESOLVED');
    const hasEarthquake = incidents.some(i => i.type?.toLowerCase().includes('earthquake') && i.status !== 'RESOLVED');
    const hasFire = incidents.some(i => i.type?.toLowerCase().includes('fire') && i.status !== 'RESOLVED');

    const recs = [];

    if (level === 'CRITICAL' || level === 'HIGH') {
        recs.push({ icon: 'fa-house-circle-check', color: '#22c55e', title: 'Stay Indoors', desc: 'Avoid travel. Move to the highest floor if flooding is possible. Keep emergency kit ready.' });
        recs.push({ icon: 'fa-phone-volume', color: '#3b82f6', title: 'Save Emergency Numbers', desc: 'NDRF: 011-24363260 | Ambulance: 108 | Police: 100 | Disaster Helpline: 1078' });
    }
    if (hasFlood) {
        recs.push({ icon: 'fa-water', color: '#3b82f6', title: 'Flood Protocol Active', desc: 'Do not wade through water. Move valuables to higher floors. Know your nearest shelter location.' });
    }
    if (hasCyclone) {
        recs.push({ icon: 'fa-tornado', color: '#a855f7', title: 'Cyclone Safety Mode', desc: 'Board up windows. Charge all devices. Stock 72 hours of water & dry food. Head to designated shelter.' });
    }
    if (hasEarthquake) {
        recs.push({ icon: 'fa-house-crack', color: '#ef4444', title: 'Earthquake Aftermath', desc: 'Check for gas leaks. Avoid damaged buildings. Expect aftershocks. Do not use elevators.' });
    }
    if (hasFire) {
        recs.push({ icon: 'fa-fire-extinguisher', color: '#f97316', title: 'Fire Alert Nearby', desc: 'Stay upwind. Cover nose and mouth. Follow evacuation signals. Call 101 for fire emergency.' });
    }
    if (level === 'MODERATE') {
        recs.push({ icon: 'fa-kit-medical', color: '#22c55e', title: 'Prepare Emergency Kit', desc: 'Water (3L/person/day), medicines, torch, ID documents, power bank, and first-aid kit.' });
        recs.push({ icon: 'fa-route', color: '#f97316', title: 'Plan Evacuation Route', desc: 'Identify 2 escape routes from your home and know the nearest government shelter location.' });
    }
    if (level === 'LOW') {
        recs.push({ icon: 'fa-graduation-cap', color: '#a855f7', title: 'Stay Prepared', desc: 'Review emergency procedures. Ensure your family knows the local helpline numbers and shelter locations.' });
        recs.push({ icon: 'fa-bell', color: '#3b82f6', title: 'Enable Alerts', desc: 'Allow browser notifications in OmniGuard to receive real-time disaster alerts for your region.' });
        recs.push({ icon: 'fa-people-group', color: '#22c55e', title: 'Community Resilience', desc: 'Connect with neighbours. Share resources. Register as a volunteer to help during emergencies.' });
    }

    return recs.slice(0, 3);
}

// ── Sparkline mini-bar graph ──────────────────────────────────────────────────
function RiskBar({ score, color }) {
    return (
        <div style={{ height: 6, borderRadius: 4, background: 'rgba(255,255,255,0.08)', overflow: 'hidden', marginTop: 8 }}>
            <div
                style={{ height: '100%', borderRadius: 4, width: `${score}%`, background: `linear-gradient(90deg, ${color}80, ${color})`, transition: 'width 1s ease', boxShadow: `0 0 8px ${color}60` }}
            />
        </div>
    );
}

export default function RiskIntelligencePanel() {
    const { incidents, alerts } = useDisasterData();
    const [profile, setProfile] = useState(null);
    const [recs, setRecs] = useState([]);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [expanded, setExpanded] = useState(true);
    const [recIdx, setRecIdx] = useState(0);

    const refresh = useCallback(() => {
        const p = computeRiskProfile(incidents, alerts);
        const r = getRecommendations(p, incidents);
        setProfile(p);
        setRecs(r);
        setLastUpdated(new Date());
        setRecIdx(0);
    }, [incidents, alerts]);

    useEffect(() => { refresh(); }, [refresh]);

    // Auto-cycle recommendations every 6s
    useEffect(() => {
        if (recs.length <= 1) return;
        const t = setInterval(() => setRecIdx(i => (i + 1) % recs.length), 6000);
        return () => clearInterval(t);
    }, [recs.length]);

    // Auto-refresh risk every 60s
    useEffect(() => {
        const t = setInterval(refresh, 60000);
        return () => clearInterval(t);
    }, [refresh]);

    if (!profile) return null;

    const activeRec = recs[recIdx];

    return (
        <div style={{ background: 'rgba(0,0,0,0.4)', border: `1px solid ${profile.color}30`, borderRadius: 18, overflow: 'hidden', backdropFilter: 'blur(12px)', boxShadow: `0 4px 30px ${profile.color}10` }}>
            {/* ── Header ── */}
            <div
                onClick={() => setExpanded(e => !e)}
                style={{ padding: '14px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, borderBottom: expanded ? `1px solid ${profile.color}20` : 'none', background: profile.bg }}
            >
                <div style={{ position: 'relative', flexShrink: 0 }}>
                    <div style={{
                        width: 44, height: 44, borderRadius: 12,
                        background: `${profile.color}20`, border: `1.5px solid ${profile.color}50`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: profile.pulse ? `0 0 18px ${profile.color}40` : 'none',
                        animation: profile.pulse ? 'pulseGlow 2s infinite' : 'none',
                    }}>
                        <i className="fa-solid fa-brain" style={{ color: profile.color, fontSize: '1.1rem' }} />
                    </div>
                    {/* Live dot */}
                    <span style={{ position: 'absolute', top: -2, right: -2, width: 10, height: 10, borderRadius: '50%', background: profile.color, border: '2px solid #0a0f1e', animation: 'pulse-dot 1.5s ease-in-out infinite' }} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                        <span style={{ fontWeight: 800, fontSize: '0.85rem', color: 'white', fontFamily: 'var(--font-display)' }}>AI Risk Intelligence</span>
                        <span style={{ fontSize: '0.62rem', color: profile.color, background: `${profile.color}18`, padding: '1px 7px', borderRadius: 10, fontFamily: 'monospace', fontWeight: 700, letterSpacing: '0.05em' }}>{profile.level}</span>
                    </div>
                    <RiskBar score={profile.score} color={profile.color} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                        <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>Risk Score: <strong style={{ color: profile.color }}>{profile.score}/100</strong></span>
                        {lastUpdated && <span style={{ fontSize: '0.6rem', color: '#4b5563', fontFamily: 'monospace' }}>Updated {lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>}
                    </div>
                </div>

                <i className={`fa-solid fa-chevron-${expanded ? 'up' : 'down'}`} style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', flexShrink: 0 }} />
            </div>

            {/* ── Body ── */}
            {expanded && (
                <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {/* Risk factors */}
                    {profile.factors.length > 0 && (
                        <div>
                            <div style={{ fontSize: '0.62rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Risk Factors</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                                {profile.factors.map((f, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.74rem', color: 'var(--color-text-secondary)' }}>
                                        <i className={`fa-solid ${f.icon}`} style={{ color: f.color, width: 14, textAlign: 'center', flexShrink: 0 }} />
                                        {f.label}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Active recommendation (carousel) */}
                    {activeRec && (
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                                <div style={{ fontSize: '0.62rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                    <i className="fa-solid fa-robot" style={{ marginRight: 4, color: '#a855f7' }} />AI Guidance
                                </div>
                                {recs.length > 1 && (
                                    <div style={{ display: 'flex', gap: 3 }}>
                                        {recs.map((_, i) => (
                                            <button key={i} onClick={() => setRecIdx(i)}
                                                style={{ width: i === recIdx ? 16 : 6, height: 6, borderRadius: 3, background: i === recIdx ? '#a855f7' : 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', padding: 0, transition: 'all 0.3s' }} />
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div style={{ background: `${activeRec.color}0d`, border: `1px solid ${activeRec.color}25`, borderRadius: 12, padding: '12px 14px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                    <i className={`fa-solid ${activeRec.icon}`} style={{ color: activeRec.color, fontSize: '0.9rem' }} />
                                    <span style={{ fontWeight: 700, fontSize: '0.82rem', color: 'white' }}>{activeRec.title}</span>
                                </div>
                                <p style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: 0 }}>{activeRec.desc}</p>
                            </div>
                        </div>
                    )}

                    {/* Refresh */}
                    <button onClick={(e) => { e.stopPropagation(); refresh(); }}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '7px', borderRadius: 10, background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)', color: '#a78bfa', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600, transition: 'all 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(168,85,247,0.15)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(168,85,247,0.08)'}>
                        <i className="fa-solid fa-rotate-right" />Re-analyse Risk Now
                    </button>
                </div>
            )}
        </div>
    );
}
