export default function RiskMap() {
    return (
        <main className="animate-fade-in-up" style={{ padding: '32px 24px', maxWidth: 1000, margin: '0 auto', minHeight: 'calc(100vh - 56px)', textAlign: 'center' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', color: 'white', marginBottom: 16 }}>Regional Risk Mapping</h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem', marginBottom: 48 }}>Static assessments of long-term geographical hazard probabilities.</p>
            <div style={{ padding: 40, border: '2px dashed rgba(255,255,255,0.1)', borderRadius: 16, background: 'rgba(255,255,255,0.02)' }}>
                <i className="fa-solid fa-map-location-dot" style={{ fontSize: '3rem', color: '#ef4444', marginBottom: 16 }}></i>
                <h3 style={{ color: 'white' }}>Risk Overlays Moved to Live Map</h3>
                <p style={{ color: 'var(--color-text-muted)', marginTop: 8 }}>Please visit the Dashboard and enable 'Risk Zones' in the layer toggle.</p>
            </div>
        </main>
    );
}
