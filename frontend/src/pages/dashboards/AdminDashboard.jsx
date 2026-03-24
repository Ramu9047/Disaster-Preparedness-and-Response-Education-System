import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { useAuth } from '../../context/AuthContext';
import { useDisasterData } from '../../context/DisasterDataContext';
import { StatCard, PriorityBadge, StatusBadge, Panel, DashboardHeader } from '../../components/DashboardShared';
import TaskAssignModal from '../../components/TaskAssignModal';
import AlertBroadcastModal from '../../components/AlertBroadcastModal';
import { getVolunteerApplications, getContactMessages, approveVolunteerApplication, rejectVolunteerApplication } from '../../services/api';

export default function AdminDashboard() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { incidents, tasks, alerts, resources, updateIncident, INCIDENT_STATUS, TASK_STATUS } = useDisasterData();
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [showAlertModal, setShowAlertModal] = useState(false);
    const [selectedIncident, setSelectedIncident] = useState(null);
    const [volunteers, setVolunteers] = useState([]);
    const [messages, setMessages] = useState([]);
    const [initialLoading, setInitialLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        const fetchData = async (isPoll = false) => {
            if (!isPoll) setInitialLoading(true);
            else setIsRefreshing(true);
            try {
                const [vRes, mRes] = await Promise.all([
                    getVolunteerApplications(),
                    getContactMessages()
                ]);
                setVolunteers(vRes.data.data);
                setMessages(mRes.data.data);
            } catch (err) {
                console.error(err);
            } finally {
                setInitialLoading(false);
                setTimeout(() => setIsRefreshing(false), 2000); 
            }
        };
        fetchData(); // Initial load
        const interval = setInterval(() => fetchData(true), 15000); // Poll every 15s
        return () => clearInterval(interval);
    }, []);

    const handleApprove = async (id) => {
        const res = await Swal.fire({
            title: 'Approve Volunteer?',
            text: "This user will be promoted to the VOLUNTEER role instantly.",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#22c55e',
            cancelButtonColor: '#374151',
            confirmButtonText: 'Yes, Approve',
            background: '#111827',
            color: '#fff'
        });

        if (res.isConfirmed) {
            try {
                await approveVolunteerApplication(id);
                setVolunteers(v => v.map(app => app.id === id ? { ...app, status: 'APPROVED' } : app));
                toast.success("Volunteer application approved! 🎯");
            } catch (e) {
                console.error('Failed to approve', e);
                toast.error(`Approval failed: ${e.response?.data?.message || e.message}`);
            }
        }
    };
    
    const handleReject = async (id) => {
        const res = await Swal.fire({
            title: 'Reject Application?',
            text: "Are you sure you want to decline this volunteer?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#374151',
            confirmButtonText: 'Yes, Reject',
            background: '#111827',
            color: '#fff'
        });

        if (res.isConfirmed) {
            try {
                await rejectVolunteerApplication(id);
                setVolunteers(v => v.map(app => app.id === id ? { ...app, status: 'REJECTED' } : app));
                toast.warn("Volunteer application rejected.");
            } catch (e) {
                console.error('Failed to reject', e);
                toast.error(`Rejection failed: ${e.response?.data?.message || e.message}`);
            }
        }
    };

    const active = incidents.filter(i => i.status !== INCIDENT_STATUS.RESOLVED);
    const pending = tasks.filter(t => t.status === TASK_STATUS.PENDING);
    const critical = incidents.filter(i => i.severity === 'CRITICAL');
    const resolved = incidents.filter(i => i.status === INCIDENT_STATUS.RESOLVED);

    return (
        <div style={{ minHeight: 'calc(100vh - 56px)', padding: '0 0 40px', overflowY: 'auto', position: 'relative' }}>
            {isRefreshing && (
                <div style={{ position: 'fixed', top: 70, right: 30, zHeight: 2000, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', color: '#3b82f6', padding: '4px 12px', borderRadius: 20, fontSize: '0.7rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, backdropFilter: 'blur(10px)', animation: 'fadeIn 0.3s' }}>
                    <i className="fa-solid fa-circle-notch spin" /> Syncing Real-time...
                </div>
            )}
            
            <DashboardHeader role="ADMIN" name={user.name} roleColor="#ef4444" roleIcon="fa-crown" badge={user.badge} district={user.district} />

            {initialLoading ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    <i className="fa-solid fa-circle-notch spin" style={{ fontSize: '2rem', marginBottom: 12, color: '#3b82f6' }} />
                    <p>Initializing Secure Command Interface...</p>
                </div>
            ) : (
                <>

            {/* Quick Actions */}
            <div style={{ padding: '20px 28px 0', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {[
                    { label: 'Broadcast Alert', icon: 'fa-bullhorn', color: '#ef4444', action: () => setShowAlertModal(true) },
                    { label: 'Assign Task', icon: 'fa-tasks', color: '#3b82f6', action: () => { setSelectedIncident(null); setShowTaskModal(true); } },
                    { label: 'View All Reports', icon: 'fa-file-alt', color: '#a855f7', action: () => navigate('/reports') },
                    { label: 'Escalation Queue', icon: 'fa-arrow-up', color: '#f97316', action: () => navigate('/reports?tab=overview') },
                ].map(a => (
                    <button key={a.label} onClick={a.action} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 10, background: `${a.color}15`, border: `1px solid ${a.color}40`, color: a.color, fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.background = `${a.color}25`}
                        onMouseLeave={e => e.currentTarget.style.background = `${a.color}15`}>
                        <i className={`fa-solid ${a.icon}`} />{a.label}
                    </button>
                ))}
            </div>

            {/* Stats */}
            <div style={{ padding: '20px 28px 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16 }}>
                <StatCard icon="fa-triangle-exclamation" label="Active Incidents" value={active.length} color="#ef4444" sub={`${critical.length} Critical`} />
                <StatCard icon="fa-tasks" label="Pending Tasks" value={pending.length} color="#f97316" sub="Awaiting assignment" />
                <StatCard icon="fa-check-circle" label="Resolved" value={resolved.length} color="#22c55e" sub="Last 24 hours" />
                <StatCard icon="fa-bell" label="Alerts Sent" value={alerts.length} color="#3b82f6" sub="Active broadcasts" />
            </div>

            <div style={{ padding: '20px 28px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                {/* Incidents Panel */}
                <Panel title="Active Incidents" icon="fa-fire" action={
                    <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{incidents.length} total</span>
                }>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 340, overflowY: 'auto' }}>
                        {incidents.map(inc => (
                            <div key={inc.id} style={{ padding: '12px 14px', background: 'rgba(0,0,0,0.3)', borderRadius: 10, border: '1px solid var(--color-border)', cursor: 'pointer' }}
                                onClick={() => { setSelectedIncident(inc); setShowTaskModal(true); }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
                                    <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'white' }}>{inc.type} — {inc.location}</span>
                                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                                        <PriorityBadge priority={inc.severity} />
                                        <StatusBadge status={inc.status} />
                                    </div>
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: 6 }}>{inc.description.slice(0, 80)}...</div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                                        <i className="fa-regular fa-clock" style={{ marginRight: 4 }} />
                                        {new Date(inc.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    {inc.status !== INCIDENT_STATUS.RESOLVED && (
                                        <button onClick={e => { e.stopPropagation(); updateIncident(inc.id, { status: INCIDENT_STATUS.ACKNOWLEDGED }); }}
                                            style={{ fontSize: '0.68rem', padding: '3px 10px', borderRadius: 6, background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', color: '#3b82f6', cursor: 'pointer', fontWeight: 600 }}>
                                            Acknowledge
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </Panel>

                {/* Tasks Panel */}
                <Panel title="Task Overview" icon="fa-clipboard-list" action={
                    <button onClick={() => setShowTaskModal(true)} style={{ fontSize: '0.75rem', padding: '4px 12px', borderRadius: 8, background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', color: '#3b82f6', cursor: 'pointer', fontWeight: 600 }}>
                        + New Task
                    </button>
                }>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 340, overflowY: 'auto' }}>
                        {tasks.map(t => (
                            <div key={t.id} style={{ padding: '10px 14px', background: 'rgba(0,0,0,0.3)', borderRadius: 10, border: '1px solid var(--color-border)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                                    <span style={{ fontWeight: 600, fontSize: '0.82rem', color: 'white', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</span>
                                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                                        <PriorityBadge priority={t.priority} />
                                        <StatusBadge status={t.status} />
                                    </div>
                                </div>
                                {t.notes && <div style={{ fontSize: '0.7rem', color: '#22c55e', marginTop: 4 }}><i className="fa-solid fa-sticky-note" style={{ marginRight: 4 }} />{t.notes}</div>}
                            </div>
                        ))}
                    </div>
                </Panel>

                {/* Alerts Panel */}
                <Panel title="Alert Broadcasts" icon="fa-bullhorn">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 220, overflowY: 'auto' }}>
                        {alerts.map(al => (
                            <div key={al.id} style={{ padding: '10px 14px', background: 'rgba(0,0,0,0.3)', borderRadius: 10, border: '1px solid var(--color-border)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                    <span style={{ fontWeight: 700, fontSize: '0.82rem', color: 'white' }}>{al.title}</span>
                                    <StatusBadge status={al.type} />
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{al.message.slice(0, 90)}...</div>
                            </div>
                        ))}
                    </div>
                </Panel>

                {/* Resources Panel */}
                <Panel title="Resource Status" icon="fa-boxes-stacked">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 220, overflowY: 'auto' }}>
                        {resources.map(r => (
                            <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'rgba(0,0,0,0.3)', borderRadius: 10, border: '1px solid var(--color-border)' }}>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: r.available ? '#22c55e' : '#ef4444', boxShadow: `0 0 6px ${r.available ? '#22c55e' : '#ef4444'}`, flexShrink: 0 }} />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: 600, fontSize: '0.8rem', color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name}</div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{r.location} • Cap: {r.capacity}</div>
                                </div>
                                <span style={{ fontSize: '0.68rem', fontWeight: 600, color: r.available ? '#22c55e' : '#ef4444' }}>{r.available ? 'AVAIL' : 'BUSY'}</span>
                            </div>
                        ))}
                    </div>
                </Panel>
            </div>

            {/* Escalation Queue Panel - always visible to Admin */}
            {tasks.filter(t => t.status === 'ESCALATED').length > 0 && (
                <div style={{ padding: '20px 28px 0' }}>
                    <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 16, overflow: 'hidden' }}>
                        <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: 8 }}>
                                <i className="fa-solid fa-triangle-exclamation" />🚨 ESCALATION QUEUE — Auto-Escalated Tasks
                            </span>
                            <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{tasks.filter(t => t.status === 'ESCALATED').length} task(s)</span>
                        </div>
                        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {tasks.filter(t => t.status === 'ESCALATED').map(t => (
                                <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'rgba(239,68,68,0.05)', borderRadius: 10, border: '1px solid rgba(239,68,68,0.15)' }}>
                                    <i className="fa-solid fa-arrow-up" style={{ color: '#ef4444', flexShrink: 0 }} />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#fca5a5' }}>{t.title}</div>
                                        <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: 2 }}>Deadline passed: {new Date(t.escalateAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
                                    </div>
                                    <button onClick={() => { updateIncident(t.incidentId, { status: INCIDENT_STATUS.ACKNOWLEDGED }); }} style={{ fontSize: '0.72rem', padding: '5px 12px', borderRadius: 6, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap' }}>Take Action</button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Admin Submissions Row */}
            <div style={{ padding: '20px 28px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                {/* Volunteer Applications Panel */}
                <Panel title="Volunteer Applications" icon="fa-user-plus">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 300, overflowY: 'auto' }}>
                        {volunteers.length === 0 && <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textAlign: 'center', padding: 20 }}>No applications found.</div>}
                        {volunteers.map(app => (
                            <div key={app.id} style={{ padding: '12px', background: 'rgba(0,0,0,0.3)', borderRadius: 10, border: '1px solid var(--color-border)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                    <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'white' }}>{app.name}</span>
                                    <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: app.status === 'APPROVED' ? 'rgba(34,197,94,0.15)' : app.status === 'REJECTED' ? 'rgba(239,68,68,0.15)' : 'rgba(234,179,8,0.15)', color: app.status === 'APPROVED' ? '#4ade80' : app.status === 'REJECTED' ? '#f87171' : '#facc15' }}>{app.status}</span>
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: 8 }}><i className="fa-solid fa-phone" style={{ marginRight: 6 }}/>{app.phone}</div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
                                    {app.skills?.map(skill => (
                                        <span key={skill} style={{ fontSize: '0.65rem', padding: '2px 6px', background: 'rgba(59,130,246,0.1)', color: '#93c5fd', borderRadius: 4, border: '1px solid rgba(59,130,246,0.2)' }}>{skill}</span>
                                    ))}
                                </div>
                                {app.status === 'AWAITING_VERIFICATION' && (
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button onClick={() => handleApprove(app.id)} style={{ flex: 1, padding: '6px', background: 'rgba(34,197,94,0.1)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 6, fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}><i className="fa-solid fa-check" style={{ marginRight: 6 }}/>Approve</button>
                                        <button onClick={() => handleReject(app.id)} style={{ flex: 1, padding: '6px', background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 6, fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}><i className="fa-solid fa-xmark" style={{ marginRight: 6 }}/>Reject</button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </Panel>

                {/* Contact Transmissions Panel */}
                <Panel title="Contact Transmissions" icon="fa-envelope">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 300, overflowY: 'auto' }}>
                        {messages.length === 0 && <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textAlign: 'center', padding: 20 }}>No messages found.</div>}
                        {messages.map(msg => (
                            <div key={msg.id} style={{ padding: '12px', background: 'rgba(0,0,0,0.3)', borderRadius: 10, border: '1px solid var(--color-border)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'white' }}>{msg.subject}</div>
                                        <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>From: {msg.name} ({msg.email})</div>
                                    </div>
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', background: 'rgba(255,255,255,0.03)', padding: '8px 10px', borderRadius: 6, borderLeft: '2px solid rgba(59,130,246,0.5)', lineHeight: 1.5 }}>
                                    {msg.message}
                                </div>
                            </div>
                        ))}
                    </div>
                </Panel>
            </div>

            {showTaskModal && <TaskAssignModal incident={selectedIncident} onClose={() => { setShowTaskModal(false); setSelectedIncident(null); }} />}
            {showAlertModal && <AlertBroadcastModal onClose={() => setShowAlertModal(false)} />}
                </>
            )}
        </div>
    );
}
