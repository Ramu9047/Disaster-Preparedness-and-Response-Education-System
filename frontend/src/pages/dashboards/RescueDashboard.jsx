import { useAuth } from '../../context/AuthContext';
import { useDisasterData } from '../../context/DisasterDataContext';
import { StatCard, PriorityBadge, StatusBadge, Panel, DashboardHeader } from '../../components/DashboardShared';

export default function RescueDashboard() {
    const { user } = useAuth();
    const { tasks, incidents, updateTask, TASK_STATUS } = useDisasterData();

    const myTasks = tasks.filter(t => t.assignedTo === user.id);
    const active = myTasks.filter(t => t.status === TASK_STATUS.IN_PROGRESS);
    const pending = myTasks.filter(t => t.status === TASK_STATUS.PENDING);
    const done = myTasks.filter(t => t.status === TASK_STATUS.COMPLETED);

    const [notes, setNotes] = require && false ? [] : (() => {
        const { useState } = require('react');
        return useState({});
    })();

    return (
        <div style={{ minHeight: 'calc(100vh - 56px)', padding: '0 0 40px', overflowY: 'auto' }}>
            <DashboardHeader role="RESCUE TEAM" name={user.name} roleColor="#22c55e" roleIcon="fa-person-running" badge={user.badge} district={user.district} />

            <div style={{ padding: '20px 28px 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 16 }}>
                <StatCard icon="fa-spinner" label="In Progress" value={active.length} color="#3b82f6" />
                <StatCard icon="fa-clock" label="Pending" value={pending.length} color="#f97316" />
                <StatCard icon="fa-check-circle" label="Completed" value={done.length} color="#22c55e" />
                <StatCard icon="fa-tasks" label="Total Assigned" value={myTasks.length} color="#a855f7" />
            </div>

            <div style={{ padding: '20px 28px 0' }}>
                <Panel title="My Assigned Tasks" icon="fa-person-running">
                    {myTasks.length === 0 ? (
                        <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '30px 0', fontSize: '0.9rem' }}>
                            <i className="fa-solid fa-inbox" style={{ fontSize: '2rem', marginBottom: 12, display: 'block' }} />
                            No tasks assigned yet. Stand by for orders.
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            {myTasks.map(t => {
                                const inc = incidents.find(i => i.id === t.incidentId);
                                const isOverdue = new Date(t.escalateAt) < new Date();
                                return (
                                    <div key={t.id} style={{ padding: '16px 18px', background: 'rgba(0,0,0,0.3)', borderRadius: 12, border: `1px solid ${isOverdue ? 'rgba(239,68,68,0.4)' : 'var(--color-border)'}` }}>
                                        {isOverdue && t.status !== TASK_STATUS.COMPLETED && (
                                            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '6px 12px', marginBottom: 10, fontSize: '0.75rem', color: '#ef4444', fontWeight: 700 }}>
                                                <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: 6 }} />OVERDUE — Escalation triggered!
                                            </div>
                                        )}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                                            <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'white' }}>{t.title}</span>
                                            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                                                <PriorityBadge priority={t.priority} />
                                                <StatusBadge status={t.status} />
                                            </div>
                                        </div>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: 8 }}>{t.description}</p>
                                        {inc && (
                                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: 8 }}>
                                                <i className="fa-solid fa-location-dot" style={{ marginRight: 4, color: '#ef4444' }} />{inc.location}
                                            </div>
                                        )}
                                        {t.notes && <div style={{ fontSize: '0.75rem', color: '#22c55e', marginBottom: 8, padding: '6px 10px', background: 'rgba(34,197,94,0.08)', borderRadius: 6 }}>
                                            <i className="fa-solid fa-note-sticky" style={{ marginRight: 4 }} />{t.notes}
                                        </div>}
                                        <div style={{ fontSize: '0.72rem', color: isOverdue ? '#ef4444' : 'var(--color-text-muted)', marginBottom: 12 }}>
                                            <i className="fa-regular fa-clock" style={{ marginRight: 4 }} />
                                            Deadline: {new Date(t.escalateAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            {t.status === TASK_STATUS.PENDING && (
                                                <button onClick={() => updateTask(t.id, { status: TASK_STATUS.IN_PROGRESS })}
                                                    style={{ flex: 1, padding: '8px', borderRadius: 8, background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', color: '#3b82f6', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem' }}>
                                                    <i className="fa-solid fa-play" style={{ marginRight: 6 }} />Start
                                                </button>
                                            )}
                                            {t.status === TASK_STATUS.IN_PROGRESS && (
                                                <button onClick={() => updateTask(t.id, { status: TASK_STATUS.COMPLETED, notes: 'Task completed by field team.' })}
                                                    style={{ flex: 1, padding: '8px', borderRadius: 8, background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem' }}>
                                                    <i className="fa-solid fa-check" style={{ marginRight: 6 }} />Mark Complete
                                                </button>
                                            )}
                                            {t.status === TASK_STATUS.COMPLETED && (
                                                <div style={{ flex: 1, padding: '8px', borderRadius: 8, background: 'rgba(34,197,94,0.08)', color: '#22c55e', fontWeight: 700, fontSize: '0.8rem', textAlign: 'center' }}>
                                                    <i className="fa-solid fa-circle-check" style={{ marginRight: 6 }} />Completed
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </Panel>
            </div>
        </div>
    );
}
