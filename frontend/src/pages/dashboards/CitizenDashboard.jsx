import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useDisasterData } from '../../context/DisasterDataContext';
import { StatCard, StatusBadge, Panel, DashboardHeader } from '../../components/DashboardShared';
import ReportIncidentModal from '../../components/ReportIncidentModal';
import NearbyFinderModal from '../../components/NearbyFinderModal';
import WhatToDoNow from '../../components/WhatToDoNow';
import CommunityHelpNetwork from '../../components/CommunityHelpNetwork';
import RiskIntelligencePanel from '../../components/RiskIntelligencePanel';

export default function CitizenDashboard() {
    const { user } = useAuth();
    const { incidents, alerts, resources, INCIDENT_STATUS } = useDisasterData();
    const [showReport, setShowReport] = useState(false);
    const [showNearby, setShowNearby] = useState(false);
    const [showWhatToDo, setShowWhatToDo] = useState(false);
    const [showCommunity, setShowCommunity] = useState(false);

    const myReports = incidents.filter(i => i.reportedBy === user.id);
    const activeAlerts = alerts.filter(a => a.type === 'CRITICAL' || a.type === 'HIGH');
    const shelters = resources.filter(r => r.type === 'Shelter' && r.available);

    return (
        <div style={{ minHeight: 'calc(100vh - 56px)', padding: '0 0 40px', overflowY: 'auto' }}>
            <DashboardHeader role="CITIZEN" name={user.name} roleColor="#3b82f6" roleIcon="fa-user" district={user.district} />

            {/* SOS + Report */}
            <div style={{ padding: '20px 28px 0', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <a href="tel:112" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 24px', borderRadius: 12, background: 'linear-gradient(135deg,#ef4444,#dc2626)', color: 'white', fontWeight: 800, fontSize: '1rem', textDecoration: 'none', boxShadow: '0 4px 20px rgba(239,68,68,0.4)', transition: 'transform 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                    <i className="fa-solid fa-phone-volume" style={{ fontSize: '1.2rem' }} />🆘 EMERGENCY — Call 112
                </a>
                <button onClick={() => setShowReport(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 20px', borderRadius: 12, background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.4)', color: '#3b82f6', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' }}>
                    <i className="fa-solid fa-triangle-exclamation" />Report Disaster
                </button>
                <button onClick={() => setShowNearby(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 20px', borderRadius: 12, background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.4)', color: '#22c55e', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' }}>
                    <i className="fa-solid fa-location-crosshairs" />Find Nearby Shelters
                </button>
                <button onClick={() => setShowWhatToDo(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 20px', borderRadius: 12, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#ef4444', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' }}>
                    <i className="fa-solid fa-bolt" />What To Do NOW
                </button>
                <button onClick={() => setShowCommunity(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 20px', borderRadius: 12, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)', color: '#10b981', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' }}>
                    <i className="fa-solid fa-people-roof" />Community Help
                </button>
            </div>

            <div style={{ padding: '20px 28px 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 16 }}>
                <StatCard icon="fa-bell" label="Active Alerts" value={activeAlerts.length} color="#ef4444" sub="In your area" />
                <StatCard icon="fa-house" label="Open Shelters" value={shelters.length} color="#22c55e" sub="Available now" />
                <StatCard icon="fa-flag" label="My Reports" value={myReports.length} color="#3b82f6" />
            </div>

            {/* AI Risk Intelligence Panel */}
            <div style={{ padding: '20px 28px 0' }}>
                <RiskIntelligencePanel />
            </div>

            <div style={{ padding: '20px 28px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <Panel title="⚠️ Emergency Alerts" icon="fa-bell">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 300, overflowY: 'auto' }}>
                        {alerts.map(al => (
                            <div key={al.id} style={{ padding: '12px 14px', background: al.type === 'CRITICAL' ? 'rgba(239,68,68,0.08)' : 'rgba(0,0,0,0.3)', borderRadius: 10, border: `1px solid ${al.type === 'CRITICAL' ? 'rgba(239,68,68,0.3)' : 'var(--color-border)'}` }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                    <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'white' }}>{al.title}</span>
                                    <span style={{ fontSize: '0.68rem', color: al.type === 'CRITICAL' ? '#ef4444' : '#f97316', fontWeight: 700 }}>{al.type}</span>
                                </div>
                                <p style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>{al.message}</p>
                            </div>
                        ))}
                    </div>
                </Panel>

                <Panel title="🏠 Nearby Shelters & Resources" icon="fa-house-chimney-medical">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 300, overflowY: 'auto' }}>
                        {resources.map(r => (
                            <div key={r.id} style={{ padding: '12px 14px', background: 'rgba(0,0,0,0.3)', borderRadius: 10, border: '1px solid var(--color-border)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                    <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'white' }}>{r.name}</span>
                                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: r.available ? '#22c55e' : '#ef4444' }}>{r.available ? '✓ Open' : '✗ Full'}</span>
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: 4 }}>
                                    <i className="fa-solid fa-location-dot" style={{ marginRight: 4 }} />{r.location}
                                </div>
                                <a href={`tel:${r.contact}`} style={{ fontSize: '0.72rem', color: '#3b82f6', textDecoration: 'none' }}>
                                    <i className="fa-solid fa-phone" style={{ marginRight: 4 }} />{r.contact}
                                </a>
                            </div>
                        ))}
                    </div>
                </Panel>

                <Panel title="My Incident Reports" icon="fa-flag" style={{ gridColumn: '1 / -1' }}>
                    {myReports.length === 0 ? (
                        <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '20px 0' }}>
                            No reports submitted yet.&nbsp;
                            <button onClick={() => setShowReport(true)} style={{ color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Report an incident →</button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {myReports.map(r => (
                                <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'rgba(0,0,0,0.3)', borderRadius: 10, border: '1px solid var(--color-border)' }}>
                                    <div style={{ flex: 1 }}>
                                        <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'white' }}>{r.type}</span>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginLeft: 8 }}>{r.location}</span>
                                    </div>
                                    <StatusBadge status={r.status} />
                                </div>
                            ))}
                        </div>
                    )}
                </Panel>
            </div>

            {showReport && <ReportIncidentModal onClose={() => setShowReport(false)} />}
            {showNearby && <NearbyFinderModal onClose={() => setShowNearby(false)} />}
            {showWhatToDo && <WhatToDoNow onClose={() => setShowWhatToDo(false)} />}
            {showCommunity && <CommunityHelpNetwork onClose={() => setShowCommunity(false)} />}
        </div>
    );
}
