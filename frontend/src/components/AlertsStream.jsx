export default function AlertsStream({ alerts, onAlertClick, alertCount }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, background: 'rgba(0,0,0,0.2)', borderRadius: 12, border: '1px solid var(--color-border)' }}>
            {/* Header */}
            <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f87171', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <i className="fa-solid fa-tower-observation" /> Live Stream
                </span>
                <span
                    id="alert-badge"
                    style={{ background: '#ef4444', color: 'white', fontWeight: 700, fontSize: '0.65rem', padding: '2px 7px', borderRadius: 20, animation: 'pulseGlow 2s infinite', boxShadow: '0 0 10px rgba(239,68,68,0.5)' }}
                >
                    {alertCount}
                </span>
            </div>

            {/* Stream List */}
            <div id="alerts-container" style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
                {alerts.length === 0 ? (
                    <div style={{ padding: 16, textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.75rem', fontStyle: 'italic' }}>
                        Awaiting telemetry...
                    </div>
                ) : (
                    alerts.slice(0, 10).map((alert, i) => {
                        let colorStr = '#60a5fa'; // fallback blue
                        let magLabel = '';
                        let iconName = 'triangle-exclamation';

                        if (alert.type === 'Earthquake') {
                            colorStr = alert.mag >= 6 ? '#ef4444' : alert.mag >= 4.5 ? '#f97316' : '#60a5fa';
                            magLabel = `M ${alert.mag} `;
                            iconName = 'waveform-lines';
                        } else if (alert.type === 'Wildfire') {
                            colorStr = '#f97316';
                            iconName = 'fire';
                        } else if (alert.type === 'Severe Storm') {
                            colorStr = '#3b82f6';
                            iconName = 'hurricane';
                        } else if (alert.type === 'Flood') {
                            colorStr = '#3b82f6';
                            iconName = 'water';
                        }

                        const timeStr = alert.date.toLocaleString();

                        return (
                            <div
                                key={alert.id || i}
                                className="alert-item animate-fade-in-up"
                                onClick={() => onAlertClick(alert)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={e => e.key === 'Enter' && onAlertClick(alert)}
                                style={{ animationDelay: `${i * 0.05}s` }}
                            >
                                <div style={{ fontSize: '0.65rem', color: colorStr, fontFamily: 'monospace', marginBottom: 2, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <i className={`fa-solid fa-${iconName}`} />
                                    {magLabel}{alert.type}
                                </div>
                                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-primary)', fontWeight: 600, lineHeight: 1.3, marginBottom: 2 }}>
                                    {alert.title}
                                </div>
                                <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>
                                    {timeStr}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
