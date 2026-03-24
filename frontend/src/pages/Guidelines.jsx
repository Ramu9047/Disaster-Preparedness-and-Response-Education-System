import { useState } from 'react';

const GUIDELINES = [
    {
        key: 'fire',
        label: 'Fire', icon: 'fa-fire', color: '#f97316', borderColor: 'rgba(249,115,22,0.25)',
        glow: 'rgba(249,115,22,0.1)',
        image: '/guidelines/fire.png',
        summary: 'Fires spread rapidly and generate toxic smoke. Smoke inhalation is the leading cause of casualties. Always prioritize evacuation over belongings.',
        protocols: [
            { icon: 'fa-shield-halved', iconColor: '#60a5fa', label: 'Before Disaster', tips: ['Install smoke detectors & test monthly.', 'Identify multiple exit routes.', 'Keep fire extinguishers accessible.'] },
            { icon: 'fa-triangle-exclamation', iconColor: '#fb923c', label: 'During Disaster', tips: ['Crawl low under smoke.', 'Feel doors for heat before opening.', 'Never use elevators; use stairs.'], open: true },
            { icon: 'fa-house-medical', iconColor: '#4ade80', label: 'After Disaster', tips: ['Do not re-enter until declared safe.', 'Seek immediate medical help for inhalation.'] },
        ],
    },
    {
        key: 'earthquake',
        label: 'Earthquake', icon: 'fa-house-crack', color: '#ef4444', borderColor: 'rgba(239,68,68,0.25)',
        glow: 'rgba(239,68,68,0.1)',
        image: '/guidelines/earthquake.png',
        summary: 'Earthquakes strike without warning. Structural collapse and falling debris are the primary hazards. Drop, Cover, and Hold On immediately.',
        protocols: [
            { icon: 'fa-shield-halved', iconColor: '#60a5fa', label: 'Before Disaster', tips: ['Secure heavy furniture to walls.', 'Prepare a 72-hour survival kit.'] },
            { icon: 'fa-triangle-exclamation', iconColor: '#f87171', label: 'During Disaster', tips: ['**DROP** to your hands and knees.', '**COVER** your head/neck under sturdy furniture.', '**HOLD ON** until shaking stops.'], open: true },
            { icon: 'fa-house-medical', iconColor: '#4ade80', label: 'After Disaster', tips: ['Expect aftershocks. Be prepared to Drop/Cover.', 'Evacuate compromised structures immediately.'] },
        ],
    },
    {
        key: 'flood',
        label: 'Floods & Cyclones', icon: 'fa-water', color: '#3b82f6', borderColor: 'rgba(59,130,246,0.25)',
        glow: 'rgba(59,130,246,0.1)',
        image: '/guidelines/flood.png',
        summary: 'Flash floods can occur in minutes. Just 6 inches of rapidly moving water can knock down an adult, and 2 feet can sweep away vehicles.',
        protocols: [
            { icon: 'fa-shield-halved', iconColor: '#60a5fa', label: 'Before Disaster', tips: ['Elevate essential electrical items.', 'Identify high-ground evacuation routes.'] },
            { icon: 'fa-triangle-exclamation', iconColor: '#60a5fa', label: 'During Disaster', tips: ['Never drive or walk through moving water.', 'Move instantly to higher ground.', 'Abandon submerged vehicles if waters are rising inside.'], open: true },
            { icon: 'fa-house-medical', iconColor: '#4ade80', label: 'After Disaster', tips: ['Wait for official clearance before returning home.', 'Avoid standing water (risk of electrocution or contamination).'] },
        ],
    },
    {
        key: 'cyclone',
        label: 'Cyclone / Hurricane', icon: 'fa-hurricane', color: '#a855f7', borderColor: 'rgba(168,85,247,0.25)',
        glow: 'rgba(168,85,247,0.1)',
        image: '/guidelines/cyclone.png',
        summary: 'Cyclones bring extreme winds, storm surges, and heavy rainfall. Early evacuation is the single most effective life-saving action.',
        protocols: [
            { icon: 'fa-shield-halved', iconColor: '#60a5fa', label: 'Before Disaster', tips: ['Board up windows and secure loose objects.', 'Stock emergency supplies for at least 72 hours.', 'Follow official evacuation orders immediately.'] },
            { icon: 'fa-triangle-exclamation', iconColor: '#c084fc', label: 'During Disaster', tips: ['Stay indoors away from windows.', 'Do not go outside during the eye of the storm.', 'Monitor emergency broadcasts.'], open: true },
            { icon: 'fa-house-medical', iconColor: '#4ade80', label: 'After Disaster', tips: ['Be aware of downed power lines.', 'Report gas leaks and structural damage.'] },
        ],
    },
    {
        key: 'heatwave',
        label: 'Heat Wave', icon: 'fa-temperature-arrow-up', color: '#dc2626', borderColor: 'rgba(220,38,38,0.25)',
        glow: 'rgba(220,38,38,0.1)',
        image: '/guidelines/heatwave.png',
        summary: 'Heat waves cause dangerous heat exhaustion and stroke. It is critical to stay hydrated and avoid direct sun exposure during peak hours.',
        protocols: [
            { icon: 'fa-shield-halved', iconColor: '#60a5fa', label: 'Before Disaster', tips: ['Stock up on water and oral rehydration solutions.', 'Ensure air conditioning or fans are working.'] },
            { icon: 'fa-triangle-exclamation', iconColor: '#f87171', label: 'During Disaster', tips: ['Stay indoors between 12:00 noon and 3:00 p.m.', 'Drink water constantly, even if not thirsty.', 'Wear lightweight, light-colored cotton clothes.'], open: true },
            { icon: 'fa-house-medical', iconColor: '#4ade80', label: 'After Disaster', tips: ['Seek medical help immediately if you experience dizziness or fainting.', 'Keep animals and pets in the shade with plenty of water.'] },
        ],
    },
    {
        key: 'coldwave',
        label: 'Cold Wave', icon: 'fa-snowflake', color: '#0ea5e9', borderColor: 'rgba(14,165,233,0.25)',
        glow: 'rgba(14,165,233,0.1)',
        image: '/guidelines/coldwave.png',
        summary: 'Cold waves can lead to hypothermia and frostbite. Proper layering of clothing and safe heating are essential for survival.',
        protocols: [
            { icon: 'fa-shield-halved', iconColor: '#60a5fa', label: 'Before Disaster', tips: ['Stockpile winter clothing and blankets.', 'Seal gaps in doors and windows to retain heat.'] },
            { icon: 'fa-triangle-exclamation', iconColor: '#38bdf8', label: 'During Disaster', tips: ['Keep dry; change wet clothes immediately to prevent heat loss.', 'Drink warm water and eat hot, nutritious food.', 'Use heaters safely and ensure adequate room ventilation.'], open: true },
            { icon: 'fa-house-medical', iconColor: '#4ade80', label: 'After Disaster', tips: ['Watch for signs of frostbite like numbness or pale skin.', 'Avoid alcohol, as it reduces your core body temperature.'] },
        ],
    },
];

function AccordionItem({ proto }) {
    const [open, setOpen] = useState(!!proto.open);
    return (
        <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, overflow: 'hidden' }}>
            <button
                onClick={() => setOpen(o => !o)}
                style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-primary)', textAlign: 'left', fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: '0.87rem' }}
                aria-expanded={open}
            >
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <i className={`fa-solid ${proto.icon}`} style={{ color: proto.iconColor }} />
                    {proto.label}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            const text = proto.tips.map(t => t.replace(/\*\*/g, '')).join('. ');
                            const utterance = new SpeechSynthesisUtterance(proto.label + '. ' + text);
                            window.speechSynthesis.cancel();
                            window.speechSynthesis.speak(utterance);
                        }}
                        style={{ background: 'none', border: 'none', color: 'var(--color-blue)', cursor: 'pointer', padding: 4 }}
                        title="Read Aloud" aria-label="Read Aloud"
                    >
                        <i className="fa-solid fa-volume-high" />
                    </button>
                    <i className={`fa-solid fa-chevron-${open ? 'up' : 'down'}`} style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }} />
                </div>
            </button>
            {open && (
                <div className="animate-fade-in-up" style={{ padding: '0 16px 14px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <ul style={{ listStyle: 'none', marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {proto.tips.map((tip, i) => (
                            <li key={i} style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                                <i className="fa-solid fa-circle-dot" style={{ color: proto.iconColor, marginTop: 3, fontSize: '0.5rem', flexShrink: 0 }} />
                                <span dangerouslySetInnerHTML={{ __html: tip.replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--color-text-primary)">$1</strong>') }} />
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

function KitPlanner() {
    const [checkedItems, setCheckedItems] = useState({});
    
    const toggleItem = (category, item) => {
        const key = `${category}-${item}`;
        setCheckedItems(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const KIT_CATEGORIES = [
        {
            title: 'Water & Food (3 Days)',
            icon: 'fa-bottle-water',
            color: '#3b82f6',
            items: ['1 Gallon of water per person/day', 'Non-perishable food items', 'Manual can opener', 'Water purification tablets']
        },
        {
            title: 'Medical & Health',
            icon: 'fa-kit-medical',
            color: '#ef4444',
            items: ['First-aid kit (bandages, antiseptics)', 'Prescription medications (7 days)', 'N95 masks / dust masks', 'Hand sanitizer & hygiene items']
        },
        {
            title: 'Tools & Survival',
            icon: 'fa-hammer',
            color: '#f97316',
            items: ['Battery-powered or hand-crank radio', 'Flashlight & extra batteries', 'Multi-tool or knife', 'Whistle to signal for help', 'Duct tape & plastic sheeting']
        },
        {
            title: 'Documents & Cash',
            icon: 'fa-folder-open',
            color: '#eab308',
            items: ['Copies of insurance & IDs', 'Emergency contact list', 'Cash in small denominations', 'Printed maps of local area']
        }
    ];

    const totalItems = KIT_CATEGORIES.reduce((acc, cat) => acc + cat.items.length, 0);
    const completedItems = Object.values(checkedItems).filter(Boolean).length;
    const progress = Math.round((completedItems / totalItems) * 100) || 0;

    return (
        <div className="animate-fade-in-up" style={{ maxWidth: 800, margin: '0 auto' }}>
            <div style={{ background: 'rgba(30,41,59,0.5)', padding: 24, borderRadius: 20, border: '1px solid rgba(255,255,255,0.1)', marginBottom: 32 }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'white', marginBottom: 16 }}>Survival Kit Progress</h2>
                <div style={{ height: 12, background: 'rgba(0,0,0,0.4)', borderRadius: 10, overflow: 'hidden', marginBottom: 8 }}>
                    <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg, #3b82f6, #10b981)', transition: 'width 0.3s ease' }} />
                </div>
                <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', textAlign: 'right' }}>{progress}% Prepared ({completedItems}/{totalItems} items)</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
                {KIT_CATEGORIES.map(category => (
                    <div key={category.title} style={{ background: 'rgba(17,24,39,0.7)', border: `1px solid ${category.color}40`, borderRadius: 16, padding: 20 }}>
                        <h3 style={{ fontSize: '1.1rem', color: 'white', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <i className={`fa-solid ${category.icon}`} style={{ color: category.color }} /> {category.title}
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {category.items.map(item => {
                                const key = `${category.title}-${item}`;
                                const isChecked = !!checkedItems[key];
                                return (
                                    <label key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
                                        <div style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${isChecked ? category.color : 'rgba(255,255,255,0.2)'}`, background: isChecked ? category.color : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s' }}>
                                            {isChecked && <i className="fa-solid fa-check" style={{ color: 'white', fontSize: '12px' }} />}
                                        </div>
                                        <input type="checkbox" style={{ display: 'none' }} checked={isChecked} onChange={() => toggleItem(category.title, item)} />
                                        <span style={{ color: isChecked ? 'rgba(255,255,255,0.5)' : 'var(--color-text-secondary)', fontSize: '0.9rem', textDecoration: isChecked ? 'line-through' : 'none', transition: 'all 0.2s', marginTop: 1 }}>{item}</span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function Guidelines() {
    const [activeTab, setActiveTab] = useState('protocols');

    return (
        <main style={{ padding: '32px 24px', maxWidth: 1400, margin: '0 auto', minHeight: 'calc(100vh - 56px)' }}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem,4vw,2.8rem)', fontWeight: 800, color: 'white', marginBottom: 12 }}>
                    Preparedness Center
                </h1>
                <p style={{ color: 'var(--color-text-secondary)', maxWidth: 600, margin: '0 auto', lineHeight: 1.7 }}>
                    Official protocols and interactive survival planning for extreme situations.
                </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 40 }}>
                <button
                    onClick={() => setActiveTab('protocols')}
                    style={{ padding: '10px 24px', borderRadius: 30, background: activeTab === 'protocols' ? 'var(--color-blue)' : 'rgba(255,255,255,0.05)', color: activeTab === 'protocols' ? 'white' : 'var(--color-text-secondary)', border: '1px solid', borderColor: activeTab === 'protocols' ? 'var(--color-blue)' : 'rgba(255,255,255,0.1)', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s' }}
                >
                    <i className="fa-solid fa-book-open" /> Protocols
                </button>
                <button
                    onClick={() => setActiveTab('kit')}
                    style={{ padding: '10px 24px', borderRadius: 30, background: activeTab === 'kit' ? '#10b981' : 'rgba(255,255,255,0.05)', color: activeTab === 'kit' ? 'white' : 'var(--color-text-secondary)', border: '1px solid', borderColor: activeTab === 'kit' ? '#10b981' : 'rgba(255,255,255,0.1)', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s' }}
                >
                    <i className="fa-solid fa-box-open" /> Kit Planner
                </button>
            </div>

            {activeTab === 'protocols' ? (
                <div className="animate-fade-in-up" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 28 }}>
                {GUIDELINES.map(guide => (
                    <div
                        key={guide.key}
                        style={{ background: 'rgba(17,24,39,0.7)', backdropFilter: 'blur(20px)', border: `1px solid ${guide.borderColor}`, borderRadius: 20, overflow: 'hidden', transition: 'transform 0.2s, box-shadow 0.2s', boxShadow: `0 8px 30px ${guide.glow}` }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 16px 40px ${guide.glow}`; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 8px 30px ${guide.glow}`; }}
                    >
                        {/* Image */}
                        <div style={{ height: 180, overflow: 'hidden', position: 'relative' }}>
                            <img
                                src={guide.image}
                                alt={guide.label}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                onError={e => { e.target.onerror = null; e.target.src = `https://placehold.co/800x400/1e293b/cbd5e1?font=montserrat&text=${encodeURIComponent(guide.label)}`; }}
                            />
                            <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to top, rgba(3,7,18,0.7), transparent)` }} />
                            <div style={{ position: 'absolute', top: 12, left: 14, background: guide.color, color: 'white', padding: '3px 10px', borderRadius: 6, fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                <i className={`fa-solid ${guide.icon}`} style={{ marginRight: 4 }} />{guide.label}
                            </div>
                        </div>

                        {/* Content */}
                        <div style={{ padding: 20 }}>
                            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', lineHeight: 1.7, marginBottom: 16 }}>
                                {guide.summary}
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {guide.protocols.map(proto => (
                                    <AccordionItem key={proto.label} proto={proto} />
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
                </div>
            ) : (
                <KitPlanner />
            )}
        </main>
    );
}
