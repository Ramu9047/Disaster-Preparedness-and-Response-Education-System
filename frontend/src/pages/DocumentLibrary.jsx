import React from 'react';

const DOCUMENTS = [
    { title: 'National Disaster Management Plan 2026', type: 'PDF', size: '4.2 MB', icon: 'fa-file-pdf', color: '#ef4444', desc: 'Official comprehensive framework for disaster resilience in India.' },
    { title: 'Flood Hazard Atlas', type: 'PDF', size: '12.5 MB', icon: 'fa-map-location-dot', color: '#3b82f6', desc: 'Detailed inundation maps and vulnerability zones.' },
    { title: 'Heat Wave Action Plan', type: 'PDF', size: '2.1 MB', icon: 'fa-sun', color: '#f97316', desc: 'Guidelines for mitigating extreme heat impact on public health.' },
    { title: 'Family Evacuation Planning Template', type: 'PDF/DOCX', size: '1.5 MB', icon: 'fa-file-word', color: '#22c55e', desc: 'Interactive worksheet for household emergency strategies.' },
    { title: 'Standard Operating Procedures (SOPs) - Earthquakes', type: 'PDF', size: '3.8 MB', icon: 'fa-file-lines', color: '#a855f7', desc: 'Technical protocols for first responders and civic bodies.' },
    { title: 'Sendai Framework - India Progress Report', type: 'PDF', size: '5.0 MB', icon: 'fa-globe', color: '#06b6d4', desc: 'Metrics on DRR goals and global compliance.' }
];

export default function DocumentLibrary() {
    const handleDownload = (doc) => {
        const content = `[OFFICIAL OMNIGUARD DOCUMENT]\n\nTitle: ${doc.title}\nType: ${doc.type}\nSize: ${doc.size}\nDescription: ${doc.desc}\n\nThis is a securely downloaded placeholder document from the OmniGuard Document Library.`;
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${doc.title.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <main style={{ padding: '32px 24px', maxWidth: 1200, margin: '0 auto', minHeight: 'calc(100vh - 56px)' }}>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem,4vw,2.8rem)', fontWeight: 800, color: 'white', marginBottom: 12 }}>
                    Official Document Library
                </h1>
                <p style={{ color: 'var(--color-text-secondary)', maxWidth: 600, margin: '0 auto', lineHeight: 1.7 }}>
                    Repository of National Disaster Management Plans, Policies, Hazard Atlases, and Planning Templates.
                </p>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
                {DOCUMENTS.map((doc, i) => (
                    <div key={i} style={{ background: 'rgba(17,24,39,0.7)', border: `1px solid ${doc.color}30`, borderRadius: 16, padding: '24px', backdropFilter: 'blur(16px)', display: 'flex', flexDirection: 'column', gap: 16, transition: 'all 0.2s', boxShadow: `0 4px 16px rgba(0,0,0,0.2)` }}
                         onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 12px 30px ${doc.color}25`; }}
                         onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 4px 16px rgba(0,0,0,0.2)`; }}
                    >
                        <div style={{ display: 'flex', gap: 16 }}>
                            <div style={{ width: 50, height: 50, borderRadius: 12, background: `${doc.color}15`, border: `1px solid ${doc.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <i className={`fa-solid ${doc.icon}`} style={{ color: doc.color, fontSize: '1.4rem' }} />
                            </div>
                            <div>
                                <h3 style={{ color: 'white', fontWeight: 700, fontSize: '1.05rem', lineHeight: 1.3, marginBottom: 4 }}>{doc.title}</h3>
                                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.65rem', background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: 4, color: 'var(--color-text-secondary)', fontWeight: 700, letterSpacing: '0.05em' }}>{doc.type}</span>
                                    <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>{doc.size}</span>
                                </div>
                            </div>
                        </div>
                        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', lineHeight: 1.6, flex: 1 }}>{doc.desc}</p>
                        <button 
                            onClick={() => handleDownload(doc)}
                            style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${doc.color}40`, color: doc.color, padding: '10px', borderRadius: 10, fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, transition: 'background 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.background = `${doc.color}20`}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                        >
                            <i className="fa-solid fa-download" /> Download Document
                        </button>
                    </div>
                ))}
            </div>
        </main>
    );
}
