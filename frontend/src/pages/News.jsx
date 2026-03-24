export default function News() {
    return (
        <main className="animate-fade-in-up" style={{ padding: '32px 24px', maxWidth: 1000, margin: '0 auto', minHeight: 'calc(100vh - 56px)', textAlign: 'center' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', color: 'white', marginBottom: 16 }}>Official Emergency Broadcasts</h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem', marginBottom: 48 }}>Live news streams mapped to authorized local and national alerts.</p>
            <div style={{ padding: 40, border: '2px dashed rgba(255,255,255,0.1)', borderRadius: 16, background: 'rgba(255,255,255,0.02)' }}>
                <i className="fa-solid fa-satellite-dish" style={{ fontSize: '3rem', color: 'var(--color-blue)', marginBottom: 16 }}></i>
                <h3 style={{ color: 'white' }}>Establishing API Connection...</h3>
                <p style={{ color: 'var(--color-text-muted)', marginTop: 8 }}>Migrating data feeds to the real-time Stream layer.</p>
            </div>
        </main>
    );
}
