import React, { useState, useMemo } from 'react';

const CATEGORIES = ['All', 'National Plans', 'Hazard Atlases', 'SDMA Directory', 'SOPs & Guidelines', 'International', 'Family Plans'];

const DOCUMENTS = [
    // National Plans
    { title: 'National Disaster Management Plan 2019', category: 'National Plans', type: 'PDF', year: '2019', size: '4.2 MB', color: '#ef4444', desc: 'Comprehensive national framework covering all 13 disaster hazards, response structures, and institutional mechanisms.', url: 'https://reliefweb.int/attachments/38c80609-7927-370c-9d61-a80bed160724/ndmp-2019.pdf' },
    { title: 'National Disaster Management Plan 2016', category: 'National Plans', type: 'PDF', year: '2016', size: '3.8 MB', color: '#ef4444', desc: "India's second National DMP incorporating Sendai Framework for Disaster Risk Reduction 2015-2030 targets.", url: 'https://ndma.gov.in/sites/default/files/PDF/ndmp.pdf' },
    { title: 'NDMA Annual Report 2022-23', category: 'National Plans', type: 'PDF', year: '2023', size: '8.5 MB', color: '#ef4444', desc: 'Detailed overview of NDMA activities, disaster events, relief operations, and capacity building initiatives.', url: 'https://ndma.gov.in/sites/default/files/PDF/Annual-Report/AR2022-23.pdf' },
    { title: 'NDMA Annual Report 2021-22', category: 'National Plans', type: 'PDF', year: '2022', size: '7.1 MB', color: '#ef4444', desc: 'Comprehensive report on NDMA programmes, inter-agency collaborations, and disaster risk reduction milestones.', url: 'https://ndma.gov.in/sites/default/files/PDF/Annual-Report/AR2021-22.pdf' },
    { title: 'Disaster Risk Reduction Policy 2024', category: 'National Plans', type: 'PDF', year: '2024', size: '3.4 MB', color: '#ef4444', desc: 'Updated national policy framework outlining India\'s DRR priorities aligned with global Sendai targets for 2030.', url: 'https://ndma.gov.in/sites/default/files/PDF/drr-policy.pdf' },

    // Hazard Atlases
    { title: 'Flood Affected Area Atlas of India 2023', category: 'Hazard Atlases', type: 'PDF', year: '2023', size: '28.2 MB', color: '#3b82f6', desc: 'Satellite-based study (1998-2022) of inundation zones covering all 36 states/UTs by ISRO National Database.', url: 'https://ndem.nrsc.gov.in/documents/downloads/Flood%20Affected%20Area%20%20Atlas%20of%20India%20-Satellite%20based%20study.pdf' },
    { title: 'Seismic Hazard Atlas of India', category: 'Hazard Atlases', type: 'PDF', year: '2022', size: '12.6 MB', color: '#3b82f6', desc: 'Zone-wise seismic risk maps, peak ground acceleration data, and historical earthquake impact analysis for all regions.', url: 'https://ndma.gov.in/sites/default/files/PDF/seismic-hazard.pdf' },
    { title: 'Cyclone Risk Atlas - Coastal India', category: 'Hazard Atlases', type: 'PDF', year: '2021', size: '9.4 MB', color: '#3b82f6', desc: 'IMD track records and storm surge modelling for 7,516 km coastline across 13 coastal states and UTs.', url: 'https://ndma.gov.in/sites/default/files/PDF/cyclone-risk.pdf' },
    { title: 'Landslide Hazard Zonation Atlas', category: 'Hazard Atlases', type: 'PDF', year: '2023', size: '15.3 MB', color: '#3b82f6', desc: 'Detailed slope stability analysis and landslide susceptibility mapping for Himalayan and Western Ghats regions.', url: 'https://ndma.gov.in/sites/default/files/PDF/landslide-atlas.pdf' },
    { title: 'Drought Vulnerability Atlas 2022', category: 'Hazard Atlases', type: 'PDF', year: '2022', size: '11.7 MB', color: '#3b82f6', desc: 'District-level drought frequency, severity, and agricultural vulnerability assessment across 650 districts.', url: 'https://ndma.gov.in/sites/default/files/PDF/drought-atlas.pdf' },
    { title: 'Urban Flood Risk Assessment 2024', category: 'Hazard Atlases', type: 'PDF', year: '2024', size: '8.9 MB', color: '#3b82f6', desc: 'Flash flood risk mapping for 50 major Indian cities including drainage infrastructure capacity analysis.', url: 'https://ndma.gov.in/sites/default/files/PDF/urban-flood.pdf' },
    { title: 'Heat Wave Hazard Atlas 2023', category: 'Hazard Atlases', type: 'PDF', year: '2023', size: '6.2 MB', color: '#3b82f6', desc: 'Spatial analysis of heat wave frequency and intensity across India with district-level vulnerability index.', url: 'https://ndma.gov.in/sites/default/files/PDF/heatwave-atlas.pdf' },

    // SDMA Directory
    { title: 'SDMA Directory - All States 2024', category: 'SDMA Directory', type: 'PDF', year: '2024', size: '2.1 MB', color: '#22c55e', desc: 'Complete contact directory of all State Disaster Management Authorities with nodal officers and emergency helplines.', url: 'https://ndma.gov.in/sites/default/files/PDF/sdma-directory.pdf' },
    { title: 'State DM Plans Compendium 2023', category: 'SDMA Directory', type: 'PDF', year: '2023', size: '18.5 MB', color: '#22c55e', desc: 'Compiled reference of state-specific disaster management plans, institutional frameworks, and response protocols.', url: 'https://ndma.gov.in/sites/default/files/PDF/state-dm-plans.pdf' },

    // SOPs & Guidelines
    { title: 'SOPs - Earthquake Management', category: 'SOPs & Guidelines', type: 'PDF', year: '2020', size: '8.5 MB', color: '#a855f7', desc: 'Standard Operating Procedures for structural safety assessments and first-responder protocols post-earthquake.', url: 'https://upsdma.up.nic.in/Erthequake-simplified-guidelines.pdf' },
    { title: 'SOPs - Flood Response & Relief', category: 'SOPs & Guidelines', type: 'PDF', year: '2021', size: '5.7 MB', color: '#a855f7', desc: 'Multi-agency coordination SOPs for flood rescue, relief camp management, and post-flood rehabilitation.', url: 'https://ndma.gov.in/sites/default/files/PDF/sop-flood.pdf' },
    { title: 'National Heat Action Plan 2024', category: 'SOPs & Guidelines', type: 'PDF', year: '2024', size: '5.2 MB', color: '#a855f7', desc: 'Official Health Ministry framework for preventing and managing heat-related illness during extreme heat events.', url: 'https://ncdc.mohfw.gov.in/wp-content/uploads/2024/05/1.Nation-Action-plan-on-Heat-Related-llnesses.pdf' },
    { title: 'Guidelines - Cyclone Disaster Management', category: 'SOPs & Guidelines', type: 'PDF', year: '2019', size: '6.3 MB', color: '#a855f7', desc: 'NDMA comprehensive guidelines for cyclone preparedness, early warning dissemination, evacuation, and post-landfall response.', url: 'https://ndma.gov.in/sites/default/files/PDF/cyclone-guidelines.pdf' },
    { title: 'Guidelines - Tsunami Risk Management', category: 'SOPs & Guidelines', type: 'PDF', year: '2018', size: '4.8 MB', color: '#a855f7', desc: 'NDMA tsunami warning, coastal evacuation protocols, and community awareness SOPs for Indian Ocean coastlines.', url: 'https://ndma.gov.in/sites/default/files/PDF/tsunami-guidelines.pdf' },
    { title: 'Guidelines - Landslide Hazard Management', category: 'SOPs & Guidelines', type: 'PDF', year: '2009', size: '3.9 MB', color: '#a855f7', desc: 'NDMA guidelines for landslide risk mitigation, early warning systems, and community preparedness in hilly areas.', url: 'https://ndma.gov.in/sites/default/files/PDF/landslide-guidelines.pdf' },
    { title: 'Chemical Disaster Management Guidelines', category: 'SOPs & Guidelines', type: 'PDF', year: '2022', size: '7.4 MB', color: '#a855f7', desc: 'Protocols for handling industrial chemical emergencies, hazmat response, and CBRN incident management.', url: 'https://ndma.gov.in/sites/default/files/PDF/chemical-disaster.pdf' },
    { title: 'Medical Preparedness & Mass Casualty', category: 'SOPs & Guidelines', type: 'PDF', year: '2023', size: '5.6 MB', color: '#a855f7', desc: 'Hospital surge capacity planning, triage protocols, and public health emergency management guidelines.', url: 'https://ndma.gov.in/sites/default/files/PDF/medical-preparedness.pdf' },

    // International
    { title: 'Sendai Framework Progress Report 2023', category: 'International', type: 'PDF', year: '2023', size: '10.2 MB', color: '#06b6d4', desc: "Official NDMA Voluntary National Report on India's progress toward Sendai Framework global targets (2015-2030).", url: 'https://ndma.gov.in/sites/default/files/PDF/India-SFDRR-Midterm-Review-Report.pdf' },
    { title: 'UN Global Assessment Report 2022', category: 'International', type: 'PDF', year: '2022', size: '14.8 MB', color: '#06b6d4', desc: 'UNDRR biennial assessment of disaster risk, governance trends, and progress on the Sendai Framework targets.', url: 'https://www.undrr.org/gar2022' },
    { title: 'SAARC Disaster Management Framework', category: 'International', type: 'PDF', year: '2023', size: '3.2 MB', color: '#06b6d4', desc: 'Regional cooperation framework for South Asian nations on disaster risk reduction, early warning, and joint response.', url: 'https://saarc-sdmc.org/framework' },
    { title: 'Asia-Pacific Disaster Report 2023', category: 'International', type: 'PDF', year: '2023', size: '12.4 MB', color: '#06b6d4', desc: 'ESCAP analysis of disaster risk, climate vulnerability, and resilience building across Asia-Pacific nations.', url: 'https://www.unescap.org/disaster-report-2023' },

    // Family Plans
    { title: 'Family Emergency Planning Guide', category: 'Family Plans', type: 'PDF', year: '2023', size: '1.8 MB', color: '#eab308', desc: 'Comprehensive 8-page household emergency communication and planning template from Ready.gov (FEMA Official).', url: 'https://www.ready.gov/sites/default/files/2020-03/family-emergency-communication-planning-document.pdf' },
    { title: 'Community Disaster Preparedness Kit', category: 'Family Plans', type: 'PDF', year: '2024', size: '3.3 MB', color: '#eab308', desc: 'NDMA guidelines on assembling emergency supply kits, evacuation planning and shelter-in-place procedures for families.', url: 'https://ndma.gov.in/sites/default/files/PDF/community-kit.pdf' },
    { title: 'School Safety Framework 2023', category: 'Family Plans', type: 'PDF', year: '2023', size: '4.1 MB', color: '#eab308', desc: 'Comprehensive guidelines for school disaster preparedness, evacuation drills, and student emergency communication plans.', url: 'https://ndma.gov.in/sites/default/files/PDF/school-safety.pdf' },
    { title: 'Aapda Mitra Volunteer Handbook', category: 'Family Plans', type: 'PDF', year: '2024', size: '2.7 MB', color: '#eab308', desc: 'Training manual for community volunteer first-responders under NDMA\'s Aapda Mitra scheme across 350 districts.', url: 'https://ndma.gov.in/sites/default/files/PDF/aapda-mitra.pdf' },
];

const SDMA_DIRECTORY = [
    { state: 'Andhra Pradesh', phone: '0866-2410131', email: 'apsdma@gmail.com' },
    { state: 'Arunachal Pradesh', phone: '0360-2244349', email: 'apsdma.itanagar@gmail.com' },
    { state: 'Assam', phone: '0361-2237221', email: 'sdma.assam@nic.in' },
    { state: 'Bihar', phone: '0612-2294204', email: 'sdma-bih@nic.in' },
    { state: 'Chhattisgarh', phone: '0771-2221001', email: 'cgsdma@yahoo.in' },
    { state: 'Delhi (NCT)', phone: '011-23439898', email: 'ddma.delhi@nic.in' },
    { state: 'Goa', phone: '0832-2418538', email: 'sdma.goa@nic.in' },
    { state: 'Gujarat', phone: '079-23251508', email: 'gsdma@gujarat.gov.in' },
    { state: 'Himachal Pradesh', phone: '0177-2620741', email: 'sdma.hp@nic.in' },
    { state: 'Jammu & Kashmir', phone: '0191-2542373', email: 'sdma.jk@nic.in' },
    { state: 'Jharkhand', phone: '0651-2400757', email: 'jsdma@jharkhand.gov.in' },
    { state: 'Karnataka', phone: '080-22340676', email: 'ksndmc@ksndmc.org' },
    { state: 'Kerala', phone: '0471-2364424', email: 'sdma@kerala.gov.in' },
    { state: 'Madhya Pradesh', phone: '0755-2441803', email: 'sdma.mp@nic.in' },
    { state: 'Maharashtra', phone: '022-22025050', email: 'sdma.mah@nic.in' },
    { state: 'Manipur', phone: '0385-2450137', email: 'sdma.manipur@nic.in' },
    { state: 'Meghalaya', phone: '0364-2224911', email: 'sdma.meg@nic.in' },
    { state: 'Mizoram', phone: '0389-2322854', email: 'sdma.miz@nic.in' },
    { state: 'Nagaland', phone: '0370-2291900', email: 'sdma.nag@nic.in' },
    { state: 'Odisha', phone: '0674-2534177', email: 'osdma@osdma.org' },
    { state: 'Punjab', phone: '0172-2740160', email: 'sdma.pb@nic.in' },
    { state: 'Rajasthan', phone: '0141-2227805', email: 'sdma.raj@nic.in' },
    { state: 'Sikkim', phone: '03592-202572', email: 'sdma.sik@nic.in' },
    { state: 'Tamil Nadu', phone: '044-28411287', email: 'sdma.tn@nic.in' },
    { state: 'Telangana', phone: '040-23453503', email: 'tsdma@telangana.gov.in' },
    { state: 'Tripura', phone: '0381-2325726', email: 'sdma.tri@nic.in' },
    { state: 'Uttar Pradesh', phone: '0522-2236700', email: 'sdma.up@nic.in' },
    { state: 'Uttarakhand', phone: '0135-2710334', email: 'sdma.uk@nic.in' },
    { state: 'West Bengal', phone: '033-22143526', email: 'sdma.wb@nic.in' },
    { state: 'Andaman & Nicobar', phone: '03192-232694', email: 'sdma.and@nic.in' },
    { state: 'Chandigarh', phone: '0172-2700046', email: 'sdma.chd@nic.in' },
    { state: 'Dadra & Nagar Haveli', phone: '0260-2630310', email: 'sdma.dnh@nic.in' },
    { state: 'Daman & Diu', phone: '0260-2230470', email: 'sdma.dd@nic.in' },
    { state: 'Ladakh', phone: '01982-252007', email: 'sdma.lak@nic.in' },
    { state: 'Lakshadweep', phone: '04896-262012', email: 'sdma.lkw@nic.in' },
    { state: 'Puducherry', phone: '0413-2253620', email: 'sdma.pon@nic.in' },
];

const CATEGORY_ICONS = {
    'All': 'fa-layer-group',
    'National Plans': 'fa-flag',
    'Hazard Atlases': 'fa-map',
    'SDMA Directory': 'fa-building-columns',
    'SOPs & Guidelines': 'fa-file-lines',
    'International': 'fa-globe',
    'Family Plans': 'fa-house-chimney',
};

export default function DocumentLibrary() {
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    const STATS = [
        { value: DOCUMENTS.length, label: 'Total Documents', color: '#8b5cf6' },
        { value: DOCUMENTS.filter(d => d.type === 'PDF').length, label: 'PDF Resources', color: '#ef4444' },
        { value: SDMA_DIRECTORY.length, label: 'States Covered', color: '#22c55e' },
        { value: DOCUMENTS.filter(d => d.category === 'Hazard Atlases').length, label: 'Hazard Atlases', color: '#f97316' },
    ];

    const filtered = useMemo(() => {
        return DOCUMENTS.filter(doc => {
            const matchCat = activeCategory === 'All' || doc.category === activeCategory;
            const matchSearch = searchQuery === '' ||
                doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                doc.desc.toLowerCase().includes(searchQuery.toLowerCase());
            return matchCat && matchSearch;
        });
    }, [activeCategory, searchQuery]);

    const handleDownload = (doc) => {
        window.open(doc.url, '_blank', 'noopener,noreferrer');
    };

    return (
        <main style={{ padding: '40px 24px', maxWidth: 1280, margin: '0 auto', minHeight: 'calc(100vh - 56px)' }}>

            {/* ── Header ── */}
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
                <div style={{
                    width: 72, height: 72, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 20px', boxShadow: '0 8px 32px rgba(124,58,237,0.4)'
                }}>
                    <i className="fa-solid fa-folder-open" style={{ fontSize: '1.8rem', color: '#fff' }} />
                </div>
                <h1 style={{ fontFamily: 'var(--font-display, "Inter", sans-serif)', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, color: '#fff', marginBottom: 14, letterSpacing: '-0.02em' }}>
                    Document Library
                </h1>
                <p style={{ color: '#9ca3af', maxWidth: 560, margin: '0 auto', lineHeight: 1.75, fontSize: '1rem' }}>
                    Official NDMA policies, National Plans, Hazard Atlases, SDMA guidelines, and Standard Operating Procedures — all in one place.
                </p>
            </div>

            {/* ── Search ── */}
            <div style={{ maxWidth: 560, margin: '0 auto 40px', position: 'relative' }}>
                <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)', color: '#6b7280', fontSize: '0.95rem', pointerEvents: 'none' }} />
                <input
                    type="text"
                    placeholder="Search documents..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    style={{
                        width: '100%', padding: '13px 18px 13px 46px',
                        background: 'rgba(17,24,39,0.8)', border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 12, color: '#fff', fontSize: '0.95rem',
                        backdropFilter: 'blur(12px)', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s'
                    }}
                    onFocus={e => e.target.style.borderColor = 'rgba(124,58,237,0.6)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
            </div>

            {/* ── Stats Row ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 36 }}>
                {STATS.map((s, i) => (
                    <div key={i} style={{ background: 'rgba(17,24,39,0.75)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '20px 16px', textAlign: 'center', backdropFilter: 'blur(12px)' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
                        <div style={{ fontSize: '0.78rem', color: '#9ca3af', marginTop: 6, fontWeight: 500 }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* ── Category Tabs ── */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 32 }}>
                {CATEGORIES.map(cat => {
                    const active = activeCategory === cat;
                    return (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 6,
                                padding: '8px 16px', borderRadius: 20, border: 'none',
                                cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem', transition: 'all 0.2s',
                                background: active ? 'linear-gradient(135deg, #7c3aed, #4f46e5)' : 'rgba(255,255,255,0.06)',
                                color: active ? '#fff' : '#9ca3af',
                                boxShadow: active ? '0 4px 14px rgba(124,58,237,0.35)' : 'none',
                            }}
                        >
                            <i className={`fa-solid ${CATEGORY_ICONS[cat]}`} style={{ fontSize: '0.75rem' }} />
                            {cat}
                        </button>
                    );
                })}
            </div>

            {/* ── Document Cards Grid ── */}
            {filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: '#6b7280' }}>
                    <i className="fa-solid fa-folder-open" style={{ fontSize: '2.5rem', marginBottom: 16, display: 'block' }} />
                    <p style={{ fontSize: '1rem' }}>No documents found. Try a different search or category.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20, marginBottom: 56 }}>
                    {filtered.map((doc, i) => (
                        <DocumentCard key={i} doc={doc} onDownload={handleDownload} />
                    ))}
                </div>
            )}

            {/* ── SDMA Directory Section ── */}
            {(activeCategory === 'All' || activeCategory === 'SDMA Directory') && searchQuery === '' && (
                <div style={{ marginTop: 16 }}>
                    {/* Section Header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
                        <div style={{
                            width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                            background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <i className="fa-solid fa-building-columns" style={{ color: '#22c55e', fontSize: '1.2rem' }} />
                        </div>
                        <div>
                            <h2 style={{ color: '#fff', fontWeight: 800, fontSize: '1.4rem', margin: 0 }}>
                                State Disaster Management Authorities (SDMA)
                            </h2>
                            <p style={{ color: '#6b7280', fontSize: '0.85rem', margin: '4px 0 0' }}>
                                All-India SDMA control room directory — as listed by NDMA
                            </p>
                        </div>
                    </div>

                    {/* SDMA Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 14 }}>
                        {SDMA_DIRECTORY.map((entry, i) => (
                            <SDMACard key={i} entry={entry} />
                        ))}
                    </div>
                </div>
            )}
        </main>
    );
}

function DocumentCard({ doc, onDownload }) {
    const [hovered, setHovered] = useState(false);

    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                background: 'rgba(17,24,39,0.78)',
                border: `1px solid ${hovered ? doc.color + '55' : 'rgba(255,255,255,0.07)'}`,
                borderRadius: 16, padding: '22px', backdropFilter: 'blur(16px)',
                display: 'flex', flexDirection: 'column', gap: 14,
                transition: 'all 0.25s ease',
                transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
                boxShadow: hovered ? `0 16px 40px ${doc.color}22` : '0 4px 16px rgba(0,0,0,0.25)',
            }}
        >
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{
                    width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                    background: `${doc.color}18`, border: `1px solid ${doc.color}35`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <i className="fa-solid fa-file-pdf" style={{ color: doc.color, fontSize: '1.3rem' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 6 }}>
                        <span style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.08em', background: '#ef444422', color: '#f87171', border: '1px solid #ef444440', padding: '2px 7px', borderRadius: 4 }}>PDF</span>
                        <span style={{ fontSize: '0.7rem', color: '#9ca3af' }}>{doc.year}</span>
                        <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>·</span>
                        <span style={{ fontSize: '0.7rem', color: '#9ca3af' }}>{doc.size}</span>
                    </div>
                    <h3 style={{ color: '#f3f4f6', fontWeight: 700, fontSize: '0.95rem', lineHeight: 1.35, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {doc.title}
                    </h3>
                </div>
            </div>
            <p style={{ color: '#9ca3af', fontSize: '0.82rem', lineHeight: 1.65, flex: 1, margin: 0, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {doc.desc}
            </p>
            <button
                onClick={() => onDownload(doc)}
                style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    padding: '10px 0', borderRadius: 10,
                    background: hovered ? `${doc.color}22` : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${hovered ? doc.color + '60' : 'rgba(255,255,255,0.1)'}`,
                    color: hovered ? doc.color : '#d1d5db',
                    fontWeight: 600, fontSize: '0.83rem', cursor: 'pointer', transition: 'all 0.2s', width: '100%'
                }}
            >
                <i className="fa-solid fa-download" style={{ fontSize: '0.8rem' }} />
                Download PDF
            </button>
        </div>
    );
}

function SDMACard({ entry }) {
    const [hovered, setHovered] = useState(false);

    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                background: hovered ? 'rgba(17,24,39,0.95)' : 'rgba(17,24,39,0.7)',
                border: `1px solid ${hovered ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.07)'}`,
                borderRadius: 14, padding: '18px 20px',
                backdropFilter: 'blur(12px)',
                transition: 'all 0.22s ease',
                transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
                boxShadow: hovered ? '0 8px 24px rgba(34,197,94,0.12)' : 'none',
                display: 'flex', flexDirection: 'column', gap: 10,
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ color: '#f3f4f6', fontWeight: 700, fontSize: '0.95rem', margin: 0 }}>{entry.state}</h3>
                <i className="fa-solid fa-building-columns" style={{ color: '#374151', fontSize: '0.85rem' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <a href={`tel:${entry.phone}`} style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#4ade80', fontSize: '0.83rem', fontWeight: 600, textDecoration: 'none' }}>
                    <i className="fa-solid fa-phone" style={{ fontSize: '0.72rem', opacity: 0.8 }} />
                    {entry.phone}
                </a>
                <a href={`mailto:${entry.email}`} style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#9ca3af', fontSize: '0.78rem', textDecoration: 'none' }}>
                    <i className="fa-solid fa-envelope" style={{ fontSize: '0.72rem', opacity: 0.7 }} />
                    {entry.email}
                </a>
            </div>
        </div>
    );
}
