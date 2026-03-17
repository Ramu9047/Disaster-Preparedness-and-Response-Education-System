import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useDisasterData } from '../../context/DisasterDataContext';
import { StatCard, PriorityBadge, StatusBadge, Panel, DashboardHeader } from '../../components/DashboardShared';
import TaskAssignModal from '../../components/TaskAssignModal';

export default function OfficerDashboard() {
    const { user } = useAuth();
    const { incidents, tasks, updateIncident, updateTask, INCIDENT_STATUS, TASK_STATUS } = useDisasterData();
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [selectedIncident, setSelectedIncident] = useState(null);

    const myTasks = tasks.filter(t => t.assignedBy === user.id || t.incidentId);
    const myIncidents = incidents.filter(i => i.assignedOfficerId === user.id || i.status !== INCIDENT_STATUS.RESOLVED);
    const inProgress = myTasks.filter(t => t.status === TASK_STATUS.IN_PROGRESS);
    const pendingTasks = myTasks.filter(t => t.status === TASK_STATUS.PENDING);

    return (
        <div style={{ minHeight: 'calc(100vh - 56px)', padding: '0 0 40px', overflowY: 'auto' }}>
            <DashboardHeader role="OFFICER" name={user.name} roleColor="#f97316" roleIcon="fa-user-shield" badge={user.badge} district={user.district} />

            <div style={{ padding: '20px 28px 0', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button onClick={() => { setSelectedIncident(null); setShowTaskModal(true); }}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 10, background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', color: '#3b82f6', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}>
                    <i className="fa-solid fa-plus" /> Assign New Task
                </button>
            </div>

            <div style={{ padding: '20px 28px 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 16 }}>
                <StatCard icon="fa-fire" label="Active Incidents" value={myIncidents.length} color="#f97316" />
                <StatCard icon="fa-spinner" label="In Progress" value={inProgress.length} color="#3b82f6" />
                <StatCard icon="fa-clock" label="Pending Tasks" value={pendingTasks.length} color="#ef4444" sub="Needs assignment" />
                <StatCard icon="fa-check" label="Completed" value={myTasks.filter(t => t.status === TASK_STATUS.COMPLETED).length} color="#22c55e" />
            </div>

            <div style={{ padding: '20px 28px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <Panel title="Incident Management" icon="fa-fire" action={<span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>Click to manage</span>}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 400, overflowY: 'auto' }}>
                        {incidents.map(inc => (
                            <div key={inc.id} style={{ padding: '12px 14px', background: 'rgba(0,0,0,0.3)', borderRadius: 10, border: `1px solid ${inc.status === INCIDENT_STATUS.RESOLVED ? 'var(--color-border)' : 'rgba(249,115,22,0.2)'}`, cursor: 'pointer' }}
                                onClick={() => { setSelectedIncident(inc); setShowTaskModal(true); }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
                                    <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'white' }}>{inc.type}</span>
                                    <div style={{ display: 'flex', gap: 5 }}>
                                        <PriorityBadge priority={inc.severity} />
                                        <StatusBadge status={inc.status} />
                                    </div>
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: 6 }}>
                                    <i className="fa-solid fa-location-dot" style={{ marginRight: 4 }} />{inc.location}
                                </div>
                                <div style={{ display: 'flex', gap: 6 }}>
                                    {inc.status === INCIDENT_STATUS.REPORTED && (
                                        <button onClick={e => { e.stopPropagation(); updateIncident(inc.id, { status: INCIDENT_STATUS.ACKNOWLEDGED, assignedOfficerId: user.id }); }}
                                            style={{ fontSize: '0.68rem', padding: '3px 10px', borderRadius: 6, background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.3)', color: '#f97316', cursor: 'pointer', fontWeight: 600 }}>
                                            Take Ownership
                                        </button>
                                    )}
                                    {inc.status === INCIDENT_STATUS.ACKNOWLEDGED && (
                                        <button onClick={e => { e.stopPropagation(); updateIncident(inc.id, { status: INCIDENT_STATUS.RESOLVED }); }}
                                            style={{ fontSize: '0.68rem', padding: '3px 10px', borderRadius: 6, background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e', cursor: 'pointer', fontWeight: 600 }}>
                                            Mark Resolved
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </Panel>

                <Panel title="Task Assignments" icon="fa-clipboard-check">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 400, overflowY: 'auto' }}>
                        {myTasks.map(t => (
                            <div key={t.id} style={{ padding: '12px 14px', background: 'rgba(0,0,0,0.3)', borderRadius: 10, border: '1px solid var(--color-border)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
                                    <span style={{ fontWeight: 600, fontSize: '0.82rem', color: 'white', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</span>
                                    <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
                                        <PriorityBadge priority={t.priority} />
                                        <StatusBadge status={t.status} />
                                    </div>
                                </div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginBottom: 6 }}>
                                    Escalate by: {new Date(t.escalateAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                </div>
                                {t.notes && <div style={{ fontSize: '0.72rem', color: '#22c55e' }}><i className="fa-solid fa-note-sticky" style={{ marginRight: 4 }} />{t.notes}</div>}
                                {t.status === TASK_STATUS.PENDING && (
                                    <button onClick={() => updateTask(t.id, { status: TASK_STATUS.IN_PROGRESS })}
                                        style={{ marginTop: 6, fontSize: '0.68rem', padding: '3px 10px', borderRadius: 6, background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', color: '#3b82f6', cursor: 'pointer', fontWeight: 600 }}>
                                        Start Task
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </Panel>
            </div>

            {showTaskModal && <TaskAssignModal incident={selectedIncident} onClose={() => { setShowTaskModal(false); setSelectedIncident(null); }} />}
        </div>
    );
}
