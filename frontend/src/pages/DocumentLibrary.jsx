import React from 'react';

const DOCUMENTS = [
    { title: 'National Disaster Management Plan (NDMP)', type: 'PDF', size: '15.4 MB', icon: 'fa-file-pdf', color: '#ef4444', desc: 'Comprehensive India strategy for disaster resilience and risk reduction (Latest Revised 2019).', url: 'https://reliefweb.int/attachments/38c80609-7927-370c-9d61-a80bed160724/ndmp-2019.pdf' },
    { title: 'Flood Affected Area Atlas (2023)', type: 'PDF', size: '28.2 MB', icon: 'fa-map-location-dot', color: '#3b82f6', desc: 'Satellite-based study (1998-2022) of inundation zones by ISRO National Database.', url: 'https://ndem.nrsc.gov.in/documents/downloads/Flood%20Affected%20Area%20%20Atlas%20of%20India%20-Satellite%20based%20study.pdf' },
    { title: 'National Heat Action Plan (2024)', type: 'PDF', size: '5.2 MB', icon: 'fa-sun', color: '#f97316', desc: 'Official May 2024 Health Ministry framework for heat-related illness management.', url: 'https://ncdc.mohfw.gov.in/wp-content/uploads/2024/05/1.Nation-Action-plan-on-Heat-Related-llnesses.pdf' },
    { title: 'Family Emergency Planning Guide', type: 'PDF', size: '1.8 MB', icon: 'fa-file-word', color: '#22c55e', desc: 'Comprehensive 8-page planning template from Ready.gov (FEMA Official).', url: 'https://www.ready.gov/sites/default/files/2020-03/family-emergency-communication-planning-document.pdf' },
    { title: 'SOPs - Earthquake Management', type: 'PDF', size: '8.5 MB', icon: 'fa-file-lines', color: '#a855f7', desc: 'Guidelines for structural safety and first-responder protocols (Simplified Govt Mirror).', url: 'https://upsdma.up.nic.in/Erthequake-simplified-guidelines.pdf' },
    { title: 'Sendai Framework Progress Report', type: 'PDF', size: '10.2 MB', icon: 'fa-globe', color: '#06b6d4', desc: 'Official NDMA Voluntary National Report on progress toward global targets (2023).', url: 'https://ndma.gov.in/sites/default/files/PDF/India-SFDRR-Midterm-Review-Report.pdf' }
];

export default function DocumentLibrary() {
    const handleDownload = (doc) => {
        if (doc.url) {
            // Open real official document link
            window.open(doc.url, '_blank', 'noopener,noreferrer');
        } else {
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
        }
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
