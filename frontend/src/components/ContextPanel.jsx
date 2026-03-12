export default function ContextPanel({ selected }) {
    return (
        <aside
            id="right-sidebar"
            style={{
                width: 320,
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                height: '100%',
                overflowY: 'auto',
                padding: 16,
                borderRadius: 16,
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                border: '1px solid var(--color-border)',
                background: 'rgba(17,24,39,0.7)',
                backdropFilter: 'blur(20px)',
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', color: 'white', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <i className="fa-solid fa-chart-pie" style={{ color: '#818cf8' }} /> Context Intel
                </h2>
            </div>

            {/* Context Content */}
            <div
                id="context-content"
                style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: 24, border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 12, background: 'rgba(0,0,0,0.2)' }}
            >
                {selected ? (
                    <div style={{ textAlign: 'left', width: '100%' }} className="animate-fade-in-up">
                        <h3 id="contextTitle" style={{ color: 'var(--color-text-primary)', fontWeight: 700, fontSize: '0.95rem', marginBottom: 12 }}>
                            {selected.mag ? `M ${selected.mag} – ` : ''}{selected.title}
                        </h3>
                        <div id="contextDetails" style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', lineHeight: 1.8 }}>
                            <div><strong style={{ color: 'var(--color-text-primary)' }}>Disaster Type:</strong> {selected.type}</div>
                            <div><strong style={{ color: 'var(--color-text-primary)' }}>Event Time:</strong> {selected.date ? selected.date.toLocaleString() : 'Live'}</div>
                            <div><strong style={{ color: 'var(--color-text-primary)' }}>Coordinates:</strong> {selected.lat?.toFixed(4)}, {selected.lng?.toFixed(4)}</div>
                            {selected.mag && (
                                <div><strong style={{ color: 'var(--color-text-primary)' }}>Impact Radius:</strong> ~{Math.round(selected.mag * 15)} miles</div>
                            )}
                            <div style={{ marginTop: 12, padding: '8px 12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8 }}>
                                <strong style={{ color: '#fca5a5' }}>Protocol:</strong>{' '}
                                <span>
                                    {selected.type === 'Earthquake' && 'Drop, Cover, and Hold On. Avoid damaged structures.'}
                                    {selected.type === 'Wildfire' && 'Evacuate immediately if ordered. Follow marked routes and avoid smoke.'}
                                    {selected.type === 'Flood' && 'Move to higher ground. Do NOT drive or walk through flood waters.'}
                                    {selected.type === 'Severe Storm' && 'Seek shelter in a sturdy building. Stay away from windows.'}
                                    {!['Earthquake', 'Wildfire', 'Flood', 'Severe Storm'].includes(selected.type) && 'Follow local emergency broadcasts immediately.'}
                                </span>
                            </div>
                            {selected.url && (
                                <a href={selected.url} target="_blank" rel="noopener noreferrer" style={{ display: 'block', marginTop: 12, textAlign: 'center', background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', padding: '6px 12px', borderRadius: 8, color: '#93c5fd', fontSize: '0.75rem', textDecoration: 'none' }}>
                                    View Source Report ↗
                                </a>
                            )}
                        </div>
                    </div>
                ) : (
                    <>
                        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, fontSize: '1.5rem', color: '#475569', border: '1px solid var(--color-border)' }}>
                            <i className="fa-solid fa-location-crosshairs" />
                        </div>
                        <h3 id="contextTitle" style={{ color: 'var(--color-text-secondary)', fontWeight: 600, marginBottom: 8, fontSize: '0.9rem' }}>Awaiting Selection</h3>
                        <p id="contextDetails" style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                            Select an alert from the map or the live stream to view detailed telemetry, impact radius, and specific mitigation protocols.
                        </p>
                    </>
                )}
            </div>

            {/* Quick Resources */}
            <div style={{ paddingTop: 16, borderTop: '1px solid var(--color-border)' }}>
                <h3 style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', fontWeight: 700, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.12em' }}>Rapid Response</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <button style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--color-border)', padding: 12, borderRadius: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'pointer', color: 'var(--color-text-secondary)', fontSize: '0.75rem', transition: 'background 0.2s' }}>
                        <i className="fa-solid fa-truck-medical" style={{ color: '#22c55e', fontSize: '1.2rem' }} />
                        Local Units
                    </button>
                    <button style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--color-border)', padding: 12, borderRadius: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'pointer', color: 'var(--color-text-secondary)', fontSize: '0.75rem' }}>
                        <i className="fa-solid fa-bed-pulse" style={{ color: '#60a5fa', fontSize: '1.2rem' }} />
                        Hospitals
                    </button>
                    <a
                        href="tel:911"
                        style={{ gridColumn: 'span 2', background: 'linear-gradient(135deg,#dc2626,#ef4444)', color: 'white', padding: '10px 16px', borderRadius: 12, fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 15px rgba(220,38,38,0.4)', letterSpacing: '0.05em', textTransform: 'uppercase' }}
                    >
                        <i className="fa-solid fa-phone-volume" /> Emergency Call
                    </a>
                </div>
            </div>
        </aside>
    );
}
