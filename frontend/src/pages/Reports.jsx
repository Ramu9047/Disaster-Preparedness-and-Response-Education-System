import { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useDisasterData } from '../context/DisasterDataContext';
import { Panel, PriorityBadge, StatusBadge } from '../components/DashboardShared';

function MetricCard({ label, value, icon, color, sub, trend }) {
    return (
        <div style={{ background: 'rgba(17,24,39,0.8)', border: `1px solid ${color}30`, borderRadius: 16, padding: '22px 24px', backdropFilter: 'blur(16px)', boxShadow: `0 4px 24px ${color}10`, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -10, right: -10, width: 80, height: 80, borderRadius: '50%', background: `${color}08` }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className={`fa-solid ${icon}`} style={{ color, fontSize: '1rem' }} />
                </div>
                {trend !== undefined && (
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: trend >= 0 ? '#22c55e' : '#ef4444', background: trend >= 0 ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', padding: '2px 8px', borderRadius: 20 }}>
                        <i className={`fa-solid fa-arrow-${trend >= 0 ? 'up' : 'down'}`} style={{ fontSize: '0.6rem', marginRight: 3 }} />
                        {Math.abs(trend)}%
                    </span>
                )}
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color, fontFamily: 'var(--font-display)', lineHeight: 1, marginBottom: 4 }}>{value}</div>
            <div style={{ fontSize: '0.78rem', color: 'white', fontWeight: 600, marginBottom: 2 }}>{label}</div>
            {sub && <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{sub}</div>}
        </div>
    );
}

function BarChart({ data, maxVal, color }) {
    return (
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 80 }}>
            {data.map((item, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: '100%', height: `${Math.round((item.val / maxVal) * 72)}px`, background: `linear-gradient(to top, ${color}, ${color}60)`, borderRadius: '4px 4px 0 0', minHeight: 4, transition: 'height 0.5s ease' }} />
                    <span style={{ fontSize: '0.62rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>{item.label}</span>
                </div>
            ))}
        </div>
    );
}

export default function Reports() {
    const { user } = useAuth();
    const { incidents, tasks, alerts, resources, TASK_STATUS, INCIDENT_STATUS, TASK_PRIORITY } = useDisasterData();
    const [activeTab, setActiveTab] = useState('overview');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [filterPriority, setFilterPriority] = useState('ALL');

    // Computed stats
    const stats = useMemo(() => {
        const resolved = incidents.filter(i => i.status === INCIDENT_STATUS.RESOLVED);
        const active = incidents.filter(i => i.status !== INCIDENT_STATUS.RESOLVED);
        const critical = incidents.filter(i => i.severity === 'CRITICAL');
        const completedTasks = tasks.filter(t => t.status === TASK_STATUS.COMPLETED);
        const escalatedTasks = tasks.filter(t => t.status === TASK_STATUS.ESCALATED);
        const pendingTasks = tasks.filter(t => t.status === TASK_STATUS.PENDING);
        const inProgressTasks = tasks.filter(t => t.status === TASK_STATUS.IN_PROGRESS);
        const availableResources = resources.filter(r => r.available);
        const completionRate = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

        // Incident type distribution
        const typeMap = {};
        incidents.forEach(i => { typeMap[i.type] = (typeMap[i.type] || 0) + 1; });

        return {
            resolved, active, critical, completedTasks, escalatedTasks, pendingTasks, inProgressTasks,
            availableResources, completionRate, typeMap,
            totalIncidents: incidents.length,
            totalTasks: tasks.length,
            totalAlerts: alerts.length,
        };
    }, [incidents, tasks, alerts, resources, TASK_STATUS, INCIDENT_STATUS]);

    const filteredTasks = useMemo(() => {
        return tasks.filter(t => {
            const statusOk = filterStatus === 'ALL' || t.status === filterStatus;
            const priorityOk = filterPriority === 'ALL' || t.priority === filterPriority;
            return statusOk && priorityOk;
        });
    }, [tasks, filterStatus, filterPriority]);

    const typeChartData = Object.entries(stats.typeMap).map(([label, val]) => ({ label: label.slice(0, 6), val }));
    const maxType = Math.max(...typeChartData.map(d => d.val), 1);

    const tabs = [
        { id: 'overview', label: 'Overview', icon: 'fa-gauge-high' },
        { id: 'incidents', label: 'Incidents', icon: 'fa-fire' },
        { id: 'tasks', label: 'Task Tracker', icon: 'fa-clipboard-list' },
        { id: 'resources', label: 'Resources', icon: 'fa-boxes-stacked' },
        { id: 'alerts', label: 'Alert Log', icon: 'fa-bell' },
    ];

    return (
        <div style={{ minHeight: 'calc(100vh - 56px)', padding: '0 0 60px', overflowY: 'auto' }}>

            {/* Header */}
            <div style={{ padding: '28px 28px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
                <div>
                    <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '2rem', color: 'white', marginBottom: 6 }}>
                        <i className="fa-solid fa-chart-bar" style={{ color: '#3b82f6', marginRight: 12 }} />
                        Reports &amp; Analytics
                    </h1>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                        Real-time operational intelligence • Role: <span style={{ color: '#3b82f6', fontWeight: 700 }}>{user?.role}</span> • {user?.district}
                    </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem', color: '#22c55e', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 20, padding: '6px 14px' }}>
                    <i className="fa-solid fa-circle" style={{ fontSize: '0.5rem' }} />
                    LIVE DATA — Auto-refreshing
                </div>
            </div>

            {/* Tabs */}
            <div style={{ padding: '0 28px 20px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {tabs.map(tab => (
                    <button key={tab.id} id={`tab-${tab.id}`} onClick={() => setActiveTab(tab.id)} style={{
                        display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 10,
                        background: activeTab === tab.id ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${activeTab === tab.id ? 'rgba(59,130,246,0.5)' : 'var(--color-border)'}`,
                        color: activeTab === tab.id ? '#3b82f6' : 'var(--color-text-muted)',
                        fontWeight: activeTab === tab.id ? 700 : 600, fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.2s'
                    }}>
                        <i className={`fa-solid ${tab.icon}`} style={{ fontSize: '0.75rem' }} />{tab.label}
                    </button>
                ))}
            </div>

            <div style={{ padding: '0 28px' }}>

                {/* OVERVIEW TAB */}
                {activeTab === 'overview' && (
                    <>
                        {/* Key Metrics Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
                            <MetricCard label="Total Incidents" value={stats.totalIncidents} icon="fa-triangle-exclamation" color="#ef4444" sub={`${stats.critical.length} Critical`} trend={12} />
                            <MetricCard label="Active Incidents" value={stats.active.length} icon="fa-fire" color="#f97316" sub="Requiring attention" trend={-5} />
                            <MetricCard label="Resolved" value={stats.resolved.length} icon="fa-circle-check" color="#22c55e" sub="Successfully closed" trend={8} />
                            <MetricCard label="Task Completion" value={`${stats.completionRate}%`} icon="fa-chart-pie" color="#3b82f6" sub={`${stats.completedTasks.length}/${stats.totalTasks} tasks done`} />
                            <MetricCard label="Escalated Tasks" value={stats.escalatedTasks.length} icon="fa-arrow-up" color="#ef4444" sub="Needs immediate action" trend={stats.escalatedTasks.length > 0 ? 100 : 0} />
                            <MetricCard label="Alerts Sent" value={stats.totalAlerts} icon="fa-bell" color="#a855f7" sub="Broadcast messages" />
                            <MetricCard label="Available Resources" value={stats.availableResources.length} icon="fa-boxes-stacked" color="#22c55e" sub={`of ${resources.length} total`} />
                            <MetricCard label="Pending Tasks" value={stats.pendingTasks.length} icon="fa-clock" color="#f97316" sub="Awaiting assignment" />
                        </div>

                        {/* Charts Row */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20, marginBottom: 24 }}>
                            <Panel title="Incident Types" icon="fa-chart-bar">
                                {typeChartData.length > 0
                                    ? <BarChart data={typeChartData} maxVal={maxType} color="#3b82f6" />
                                    : <div style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '20px 0', fontSize: '0.85rem' }}>No data</div>}
                            </Panel>
                            <Panel title="Task Status Breakdown" icon="fa-chart-donut">
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {[
                                        { label: 'Completed', val: stats.completedTasks.length, color: '#22c55e' },
                                        { label: 'In Progress', val: stats.inProgressTasks.length, color: '#3b82f6' },
                                        { label: 'Pending', val: stats.pendingTasks.length, color: '#f97316' },
                                        { label: 'Escalated', val: stats.escalatedTasks.length, color: '#ef4444' },
                                    ].map(item => (
                                        <div key={item.label}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: '0.78rem' }}>
                                                <span style={{ color: 'var(--color-text-secondary)' }}>{item.label}</span>
                                                <span style={{ color: item.color, fontWeight: 700 }}>{item.val}</span>
                                            </div>
                                            <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)' }}>
                                                <div style={{ height: '100%', width: `${stats.totalTasks ? (item.val / stats.totalTasks) * 100 : 0}%`, background: item.color, borderRadius: 3, transition: 'width 0.5s ease' }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Panel>
                            <Panel title="Resource Availability" icon="fa-warehouse">
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {resources.map(r => (
                                        <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: r.available ? '#22c55e' : '#ef4444', boxShadow: `0 0 6px ${r.available ? '#22c55e' : '#ef4444'}`, flexShrink: 0 }} />
                                            <span style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name}</span>
                                            <span style={{ fontSize: '0.68rem', color: r.available ? '#22c55e' : '#94a3b8', fontWeight: 700 }}>{r.available ? 'AVAIL' : 'BUSY'}</span>
                                        </div>
                                    ))}
                                </div>
                            </Panel>
                        </div>

                        {/* Escalation Queue */}
                        {stats.escalatedTasks.length > 0 && (
                            <Panel title="🔴 ESCALATION QUEUE — Immediate Action Required" icon="fa-triangle-exclamation">
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    {stats.escalatedTasks.map(t => (
                                        <div key={t.id} style={{ padding: '14px 16px', background: 'rgba(239,68,68,0.06)', borderRadius: 10, border: '1px solid rgba(239,68,68,0.3)', display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <i className="fa-solid fa-arrow-up" style={{ color: '#ef4444', fontSize: '1rem', flexShrink: 0 }} />
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#ef4444', marginBottom: 2 }}>{t.title}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{t.description}</div>
                                            </div>
                                            <PriorityBadge priority={t.priority} />
                                        </div>
                                    ))}
                                </div>
                            </Panel>
                        )}
                    </>
                )}

                {/* INCIDENTS TAB */}
                {activeTab === 'incidents' && (
                    <Panel title="All Incidents" icon="fa-fire" action={<span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{incidents.length} total records</span>}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {incidents.map(inc => (
                                <div key={inc.id} style={{ padding: '16px 18px', background: 'rgba(0,0,0,0.3)', borderRadius: 12, border: '1px solid var(--color-border)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'white', marginBottom: 2 }}>{inc.type} — {inc.location}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                                <i className="fa-solid fa-user" style={{ marginRight: 4 }} />{inc.reporterName}
                                                <span style={{ margin: '0 8px' }}>•</span>
                                                <i className="fa-regular fa-clock" style={{ marginRight: 4 }} />{new Date(inc.timestamp).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                                            <PriorityBadge priority={inc.severity} />
                                            <StatusBadge status={inc.status} />
                                        </div>
                                    </div>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{inc.description}</p>
                                </div>
                            ))}
                        </div>
                    </Panel>
                )}

                {/* TASKS TAB */}
                {activeTab === 'tasks' && (
                    <Panel title="Task Tracker" icon="fa-clipboard-list" action={
                        <div style={{ display: 'flex', gap: 8 }}>
                            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                                style={{ padding: '4px 10px', borderRadius: 8, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)', fontSize: '0.75rem', cursor: 'pointer' }}>
                                <option value="ALL">All Status</option>
                                <option value="PENDING">Pending</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="COMPLETED">Completed</option>
                                <option value="ESCALATED">Escalated</option>
                            </select>
                            <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}
                                style={{ padding: '4px 10px', borderRadius: 8, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)', fontSize: '0.75rem', cursor: 'pointer' }}>
                                <option value="ALL">All Priority</option>
                                <option value="HIGH">High</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="LOW">Low</option>
                            </select>
                        </div>
                    }>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {filteredTasks.length === 0 && (
                                <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '30px 0' }}>No tasks match the filter.</div>
                            )}
                            {filteredTasks.map(t => {
                                const isOverdue = new Date(t.escalateAt) < new Date();
                                return (
                                    <div key={t.id} style={{ padding: '14px 16px', background: t.status === 'ESCALATED' ? 'rgba(239,68,68,0.05)' : 'rgba(0,0,0,0.3)', borderRadius: 12, border: `1px solid ${t.status === 'ESCALATED' ? 'rgba(239,68,68,0.3)' : 'var(--color-border)'}` }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 6 }}>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'white', marginBottom: 2 }}>{t.title}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                                    <i className="fa-regular fa-clock" style={{ marginRight: 4 }} />Deadline: {new Date(t.escalateAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                                                    {isOverdue && t.status !== 'COMPLETED' && <span style={{ color: '#ef4444', marginLeft: 8, fontWeight: 700 }}>• OVERDUE</span>}
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                                                <PriorityBadge priority={t.priority} />
                                                <StatusBadge status={t.status} />
                                            </div>
                                        </div>
                                        <p style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginBottom: t.notes ? 6 : 0 }}>{t.description}</p>
                                        {t.notes && <div style={{ fontSize: '0.75rem', color: '#22c55e', padding: '4px 10px', background: 'rgba(34,197,94,0.08)', borderRadius: 6 }}><i className="fa-solid fa-note-sticky" style={{ marginRight: 4 }} />{t.notes}</div>}
                                    </div>
                                );
                            })}
                        </div>
                    </Panel>
                )}

                {/* RESOURCES TAB */}
                {activeTab === 'resources' && (
                    <Panel title="Resource Management" icon="fa-boxes-stacked">
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                            {resources.map(r => (
                                <div key={r.id} style={{ padding: '16px 18px', background: 'rgba(0,0,0,0.3)', borderRadius: 12, border: `1px solid ${r.available ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: r.available ? '#22c55e' : '#ef4444', boxShadow: `0 0 8px ${r.available ? '#22c55e' : '#ef4444'}`, flexShrink: 0 }} />
                                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'white', flex: 1 }}>{r.name}</div>
                                        <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: r.available ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', color: r.available ? '#22c55e' : '#ef4444' }}>
                                            {r.available ? 'AVAILABLE' : 'DEPLOYED'}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}><i className="fa-solid fa-tag" style={{ marginRight: 6, width: 14 }} />{r.type}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}><i className="fa-solid fa-location-dot" style={{ marginRight: 6, width: 14 }} />{r.location}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}><i className="fa-solid fa-people-group" style={{ marginRight: 6, width: 14 }} />Capacity: {r.capacity}</div>
                                        <a href={`tel:${r.contact}`} style={{ fontSize: '0.75rem', color: '#3b82f6', textDecoration: 'none' }}><i className="fa-solid fa-phone" style={{ marginRight: 6, width: 14 }} />{r.contact}</a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Panel>
                )}

                {/* ALERTS TAB */}
                {activeTab === 'alerts' && (
                    <Panel title="Alert Broadcast Log" icon="fa-bell" action={<span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{alerts.length} broadcasts</span>}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {alerts.map(al => {
                                const typeColor = al.type === 'CRITICAL' ? '#ef4444' : al.type === 'HIGH' ? '#f97316' : '#3b82f6';
                                return (
                                    <div key={al.id} style={{ padding: '14px 16px', background: `${typeColor}06`, borderRadius: 12, border: `1px solid ${typeColor}25` }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'white' }}>{al.title}</span>
                                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                                <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '2px 10px', borderRadius: 20, background: `${typeColor}15`, color: typeColor, border: `1px solid ${typeColor}30` }}>{al.type}</span>
                                                <span style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)' }}>{new Date(al.timestamp).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}</span>
                                            </div>
                                        </div>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{al.message}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </Panel>
                )}
            </div>
        </div>
    );
}
