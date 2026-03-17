/* Shared stat card used across all dashboards */
export function StatCard({ icon, label, value, color = '#3b82f6', sub }) {
    return (
        <div style={{
            background: 'rgba(17,24,39,0.7)', border: `1px solid ${color}30`,
            borderRadius: 16, padding: '20px 22px', backdropFilter: 'blur(16px)',
            display: 'flex', flexDirection: 'column', gap: 8,
            boxShadow: `0 4px 24px ${color}15`, position: 'relative', overflow: 'hidden',
        }}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: 80, height: 80, borderRadius: '0 16px', background: `${color}10`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className={`fa-solid ${icon}`} style={{ color, fontSize: '1.4rem', opacity: 0.7 }} />
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color, fontFamily: 'var(--font-display)', lineHeight: 1 }}>{value}</div>
            {sub && <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{sub}</div>}
        </div>
    );
}

/* Priority badge */
export function PriorityBadge({ priority }) {
    const cfg = {
        HIGH:   { color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
        MEDIUM: { color: '#f97316', bg: 'rgba(249,115,22,0.12)' },
        LOW:    { color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
    };
    const c = cfg[priority] || cfg.MEDIUM;
    return (
        <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: c.bg, color: c.color, border: `1px solid ${c.color}40`, whiteSpace: 'nowrap' }}>
            {priority}
        </span>
    );
}

/* Status badge */
export function StatusBadge({ status }) {
    const cfg = {
        PENDING:      { color: '#f97316', icon: 'fa-clock' },
        IN_PROGRESS:  { color: '#3b82f6', icon: 'fa-spinner' },
        COMPLETED:    { color: '#22c55e', icon: 'fa-check-circle' },
        ESCALATED:    { color: '#ef4444', icon: 'fa-arrow-up' },
        REPORTED:     { color: '#f97316', icon: 'fa-flag' },
        ACKNOWLEDGED: { color: '#3b82f6', icon: 'fa-eye' },
        RESOLVED:     { color: '#22c55e', icon: 'fa-check' },
    };
    const c = cfg[status] || { color: '#94a3b8', icon: 'fa-circle' };
    return (
        <span style={{ fontSize: '0.68rem', fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: `${c.color}15`, color: c.color, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <i className={`fa-solid ${c.icon}`} style={{ fontSize: '0.6rem' }} />
            {status.replace('_', ' ')}
        </span>
    );
}

/* Panel wrapper */
export function Panel({ title, icon, children, action, style = {} }) {
    return (
        <div style={{ background: 'rgba(17,24,39,0.7)', border: '1px solid var(--color-border)', borderRadius: 16, backdropFilter: 'blur(16px)', overflow: 'hidden', ...style }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'white', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <i className={`fa-solid ${icon}`} style={{ color: 'var(--color-blue)' }} />{title}
                </span>
                {action}
            </div>
            <div style={{ padding: 20 }}>{children}</div>
        </div>
    );
}

/* Section header */
export function DashboardHeader({ role, name, roleColor, roleIcon, badge, district }) {
    return (
        <div style={{ padding: '24px 28px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: `${roleColor}20`, border: `1px solid ${roleColor}40`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className={`fa-solid ${roleIcon}`} style={{ color: roleColor, fontSize: '1.2rem' }} />
                </div>
                <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.4rem', color: 'white' }}>{name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', display: 'flex', gap: 10, alignItems: 'center' }}>
                        <span style={{ padding: '2px 10px', borderRadius: 20, background: `${roleColor}15`, color: roleColor, fontWeight: 700, fontSize: '0.68rem', border: `1px solid ${roleColor}30` }}>{role}</span>
                        {district && <span><i className="fa-solid fa-location-dot" style={{ marginRight: 4 }} />{district}</span>}
                        {badge && <span><i className="fa-solid fa-id-badge" style={{ marginRight: 4 }} />{badge}</span>}
                    </div>
                </div>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <i className="fa-solid fa-circle" style={{ color: '#22c55e', fontSize: '0.5rem' }} />
                LIVE — {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} IST
            </div>
        </div>
    );
}
