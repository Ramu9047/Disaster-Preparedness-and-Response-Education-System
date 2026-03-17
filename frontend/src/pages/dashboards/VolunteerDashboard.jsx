import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useDisasterData } from '../../context/DisasterDataContext';
import { StatCard, PriorityBadge, StatusBadge, Panel, DashboardHeader } from '../../components/DashboardShared';
import ReportIncidentModal from '../../components/ReportIncidentModal';

export default function VolunteerDashboard() {
    const { user } = useAuth();
    const { tasks, incidents, alerts, updateTask, TASK_STATUS } = useDisasterData();
    const [showReport, setShowReport] = useState(false);
    const [registered, setRegistered] = useState(false);

    const myTasks = tasks.filter(t => t.assignedTo === user.id);
    const openTasks = tasks.filter(t => t.status === TASK_STATUS.PENDING && !t.assignedTo);

    return (
        <div style={{ minHeight: 'calc(100vh - 56px)', padding: '0 0 40px', overflowY: 'auto' }}>
            <DashboardHeader role="VOLUNTEER" name={user.name} roleColor="#a855f7" roleIcon="fa-hands-helping" badge={user.badge} district={user.district} />

            <div style={{ padding: '20px 28px 0', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button onClick={() => setShowReport(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 10, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}>
                    <i className="fa-solid fa-triangle-exclamation" />Report Incident
                </button>
                {!registered ? (
                    <button onClick={() => setRegistered(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 10, background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.3)', color: '#a855f7', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}>
                        <i className="fa-solid fa-hand-paper" />Register as Active Volunteer
                    </button>
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 10, background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e', fontWeight: 700, fontSize: '0.82rem' }}>
                        <i className="fa-solid fa-circle-check" />Active — Awaiting task assignment
                    </div>
                )}
            </div>

            <div style={{ padding: '20px 28px 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 16 }}>
                <StatCard icon="fa-tasks" label="My Tasks" value={myTasks.length} color="#a855f7" />
                <StatCard icon="fa-list-check" label="Open Tasks" value={openTasks.length} color="#3b82f6" sub="Ready to claim" />
                <StatCard icon="fa-check" label="Completed" value={myTasks.filter(t => t.status === TASK_STATUS.COMPLETED).length} color="#22c55e" />
            </div>

            <div style={{ padding: '20px 28px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <Panel title="My Tasks" icon="fa-clipboard-list">
                    {myTasks.length === 0 ? (
                        <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '24px 0', fontSize: '0.85rem' }}>
                            <i className="fa-solid fa-inbox" style={{ fontSize: '1.8rem', marginBottom: 10, display: 'block' }} />
                            No tasks assigned yet.
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {myTasks.map(t => (
                                <div key={t.id} style={{ padding: '12px 14px', background: 'rgba(0,0,0,0.3)', borderRadius: 10, border: '1px solid var(--color-border)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
                                        <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'white' }}>{t.title}</span>
                                        <div style={{ display: 'flex', gap: 5 }}>
                                            <PriorityBadge priority={t.priority} />
                                            <StatusBadge status={t.status} />
                                        </div>
                                    </div>
                                    <p style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginBottom: 8 }}>{t.description}</p>
                                    {t.status === TASK_STATUS.PENDING && (
                                        <button onClick={() => updateTask(t.id, { status: TASK_STATUS.IN_PROGRESS })}
                                            style={{ fontSize: '0.72rem', padding: '4px 12px', borderRadius: 6, background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.3)', color: '#a855f7', cursor: 'pointer', fontWeight: 600 }}>
                                            Start Volunteering
                                        </button>
                                    )}
                                    {t.status === TASK_STATUS.IN_PROGRESS && (
                                        <button onClick={() => updateTask(t.id, { status: TASK_STATUS.COMPLETED })}
                                            style={{ fontSize: '0.72rem', padding: '4px 12px', borderRadius: 6, background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e', cursor: 'pointer', fontWeight: 600 }}>
                                            Mark Done
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </Panel>

                <Panel title="Latest Alerts" icon="fa-bell">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 340, overflowY: 'auto' }}>
                        {alerts.map(al => (
                            <div key={al.id} style={{ padding: '10px 12px', background: 'rgba(0,0,0,0.3)', borderRadius: 10, border: '1px solid var(--color-border)' }}>
                                <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'white', marginBottom: 4 }}>{al.title}</div>
                                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{al.message.slice(0, 100)}...</p>
                            </div>
                        ))}
                    </div>
                </Panel>
            </div>

            {showReport && <ReportIncidentModal onClose={() => setShowReport(false)} />}
        </div>
    );
}
