import { useState, useCallback } from 'react';

// Haversine formula — distance in km between two lat/lng points
function haversine(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Extended resource database with coordinates
const EXTENDED_RESOURCES = [
    { id: 'res-001', name: 'NDRF Battalion Alpha', type: 'Rescue Team', available: true, location: 'Anna Nagar Base', lat: 13.085, lng: 80.21, capacity: 40, contact: '+91-44-28293000', description: 'Elite NDRF rescue unit with boats, rope teams, and medical kit.' },
    { id: 'res-002', name: 'Govt. Medical Camp', type: 'Medical', available: true, location: 'Washermanpet School', lat: 13.12, lng: 80.27, capacity: 200, contact: '+91-44-25223000', description: 'Trauma care, first aid, and triage unit. 24x7 operation.' },
    { id: 'res-003', name: 'Relief Food Store', type: 'Food', available: true, location: 'Central Warehouse', lat: 13.07, lng: 80.25, capacity: 5000, contact: '+91-44-25420001', description: 'Dry rations, drinking water, and cooked meals distribution point.' },
    { id: 'res-004', name: 'Rescue Boats (×8)', type: 'Equipment', available: false, location: 'Anna Nagar Depot', lat: 13.09, lng: 80.22, capacity: 8, contact: '+91-44-28297000', description: 'Motorised rescue boats for flood zone transport. Currently deployed.' },
    { id: 'res-005', name: 'Anna Nagar Stadium Shelter', type: 'Shelter', available: true, location: 'Anna Nagar Stadium', lat: 13.095, lng: 80.205, capacity: 1000, contact: '+91-44-26203000', description: 'Large capacity evacuation shelter with food, water and medical aid.' },
    { id: 'res-006', name: 'T. Nagar School Shelter', type: 'Shelter', available: true, location: 'T. Nagar Govt. School', lat: 13.04, lng: 80.23, capacity: 400, contact: '+91-44-24403000', description: 'Safe shelter. Blankets and food available. Women & children priority.' },
    { id: 'res-007', name: 'Adyar Riverside Camp', type: 'Shelter', available: false, location: 'Adyar Bridge North', lat: 13.003, lng: 80.255, capacity: 250, contact: '+91-44-24901111', description: 'Camp at capacity. Directing to alternate locations.' },
    { id: 'res-008', name: 'CHN Central Hospital', type: 'Medical', available: true, location: 'Park Town, Chennai', lat: 13.082, lng: 80.278, capacity: 500, contact: '+91-44-25305000', description: 'Government hospital. Burns, orthopaedic, ICU. Emergency wing open 24x7.' },
    { id: 'res-009', name: 'NGO Relief Volunteers', type: 'Rescue Team', available: true, location: 'Tambaram', lat: 12.924, lng: 80.128, capacity: 60, contact: '+91-44-22262121', description: 'Community volunteers for debris clearing, food distribution.' },
    { id: 'res-010', name: 'Egmore Dry Ration Point', type: 'Food', available: true, location: 'Egmore Station Area', lat: 13.079, lng: 80.261, capacity: 2000, contact: '+91-44-28195000', description: 'Government-approved dry ration distribution. Carry ID proof.' },
];

const TYPE_COLORS = {
    'Shelter': { color: '#22c55e', bg: 'rgba(34,197,94,0.12)', icon: 'fa-house-chimney' },
    'Medical': { color: '#ef4444', bg: 'rgba(239,68,68,0.12)', icon: 'fa-kit-medical' },
    'Food': { color: '#f97316', bg: 'rgba(249,115,22,0.12)', icon: 'fa-utensils' },
    'Equipment': { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', icon: 'fa-toolbox' },
    'Rescue Team': { color: '#a855f7', bg: 'rgba(168,85,247,0.12)', icon: 'fa-person-running' },
};

export default function NearbyFinderModal({ onClose }) {
    const [geoState, setGeoState] = useState('idle'); // idle | loading | success | error
    const [userPos, setUserPos] = useState(null);
    const [filterType, setFilterType] = useState('All');
    const [radiusKm, setRadiusKm] = useState(10);
    const [sorted, setSorted] = useState([]);

    const types = ['All', ...Object.keys(TYPE_COLORS)];

    const findNearby = useCallback(() => {
        if (!navigator.geolocation) {
            setGeoState('error');
            return;
        }
        setGeoState('loading');
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                setUserPos({ lat: latitude, lng: longitude });

                const withDist = EXTENDED_RESOURCES.map(r => ({
                    ...r,
                    distKm: haversine(latitude, longitude, r.lat, r.lng)
                })).sort((a, b) => a.distKm - b.distKm);

                setSorted(withDist);
                setGeoState('success');
            },
            async () => {
                try {
                    const res = await fetch("https://ipapi.co/json/");
                    const data = await res.json();
                    if (data.latitude && data.longitude) {
                        const fallbackLat = parseFloat(data.latitude), fallbackLng = parseFloat(data.longitude);
                        setUserPos({ lat: fallbackLat, lng: fallbackLng });
                        const withDist = EXTENDED_RESOURCES.map(r => ({
                            ...r,
                            distKm: haversine(fallbackLat, fallbackLng, r.lat, r.lng)
                        })).sort((a, b) => a.distKm - b.distKm);
                        setSorted(withDist);
                        setGeoState('success');
                        return;
                    }
                } catch (err) {}
                
                // Final Fallback: use Chennai center if even IP fails
                const fallbackLat = 13.06, fallbackLng = 80.24;
                setUserPos({ lat: fallbackLat, lng: fallbackLng });
                const withDist = EXTENDED_RESOURCES.map(r => ({
                    ...r,
                    distKm: haversine(fallbackLat, fallbackLng, r.lat, r.lng)
                })).sort((a, b) => a.distKm - b.distKm);
                setSorted(withDist);
                setGeoState('success');
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );
    }, []);

    const filtered = sorted.filter(r => {
        if (filterType !== 'All' && r.type !== filterType) return false;
        if (r.distKm > radiusKm) return false;
        return true;
    });

    const openMaps = (r) => {
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${r.lat},${r.lng}`, '_blank');
    };

    return (
        <div
            style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
            onClick={e => e.target === e.currentTarget && onClose()}
        >
            <div style={{ background: '#090f1e', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 22, width: '100%', maxWidth: 640, maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 30px 80px rgba(0,0,0,0.8)', overflow: 'hidden' }}>

                {/* Header */}
                <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--color-border)', background: 'linear-gradient(135deg, rgba(34,197,94,0.08), rgba(16,185,129,0.05))', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <i className="fa-solid fa-location-crosshairs" style={{ color: '#22c55e', fontSize: '1.1rem' }} />
                        </div>
                        <div>
                            <h2 style={{ color: 'white', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.05rem', margin: 0 }}>Nearby Resources Finder</h2>
                            <p style={{ color: '#22c55e', fontSize: '0.7rem', margin: 0, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.08em' }}>GPS-Powered Proximity Search</p>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '1.1rem' }}>
                        <i className="fa-solid fa-xmark" />
                    </button>
                </div>

                <div style={{ overflowY: 'auto', flex: 1 }}>
                    {/* Locate Me button */}
                    {geoState === 'idle' && (
                        <div style={{ padding: 40, textAlign: 'center' }}>
                            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(34,197,94,0.1)', border: '2px solid rgba(34,197,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 0 40px rgba(34,197,94,0.1)', animation: 'pulseGlow 2s infinite' }}>
                                <i className="fa-solid fa-location-crosshairs" style={{ color: '#22c55e', fontSize: '2rem' }} />
                            </div>
                            <h3 style={{ color: 'white', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.2rem', marginBottom: 10 }}>Find Shelters & Aid Near You</h3>
                            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', marginBottom: 28, maxWidth: 340, margin: '0 auto 28px', lineHeight: 1.7 }}>
                                We'll use your GPS location to find the nearest shelters, hospitals, food points, and rescue teams.
                            </p>
                            <button
                                onClick={findNearby}
                                style={{ padding: '14px 32px', borderRadius: 14, background: 'linear-gradient(135deg,#22c55e,#16a34a)', color: 'white', border: 'none', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 4px 24px rgba(34,197,94,0.35)', display: 'inline-flex', alignItems: 'center', gap: 10 }}
                            >
                                <i className="fa-solid fa-location-crosshairs" /> Locate Me & Find Nearby
                            </button>
                        </div>
                    )}

                    {geoState === 'loading' && (
                        <div style={{ padding: 60, textAlign: 'center' }}>
                            <div style={{ width: 56, height: 56, borderRadius: '50%', border: '4px solid rgba(34,197,94,0.2)', borderTopColor: '#22c55e', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
                            <p style={{ color: '#22c55e', fontFamily: 'monospace', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Acquiring GPS Signal...</p>
                        </div>
                    )}

                    {geoState === 'success' && (
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {/* Controls */}
                            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--color-border)', background: 'rgba(0,0,0,0.2)', display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                                {/* Type filter */}
                                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                    {types.map(t => (
                                        <button
                                            key={t}
                                            onClick={() => setFilterType(t)}
                                            style={{
                                                padding: '5px 12px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s', border: '1px solid',
                                                background: filterType === t ? (TYPE_COLORS[t]?.bg || 'rgba(59,130,246,0.15)') : 'rgba(255,255,255,0.04)',
                                                borderColor: filterType === t ? (TYPE_COLORS[t]?.color || '#3b82f6') : 'var(--color-border)',
                                                color: filterType === t ? (TYPE_COLORS[t]?.color || '#3b82f6') : 'var(--color-text-muted)',
                                            }}
                                        >
                                            {t === 'All' ? 'All' : <><i className={`fa-solid ${TYPE_COLORS[t]?.icon}`} style={{ marginRight: 4 }} />{t}</>}
                                        </button>
                                    ))}
                                </div>
                                {/* Radius slider */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
                                    <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>Radius: <strong style={{ color: '#22c55e' }}>{radiusKm} km</strong></span>
                                    <input
                                        type="range" min="2" max="50" step="1"
                                        value={radiusKm}
                                        onChange={e => setRadiusKm(Number(e.target.value))}
                                        style={{ width: 80, accentColor: '#22c55e' }}
                                    />
                                </div>
                            </div>

                            {/* Location info */}
                            <div style={{ padding: '10px 20px', background: 'rgba(34,197,94,0.05)', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.75rem', color: '#4ade80' }}>
                                <i className="fa-solid fa-location-dot" />
                                <span>
                                    GPS locked at {userPos?.lat?.toFixed(4)}°N, {userPos?.lng?.toFixed(4)}°E
                                    {' '}· Showing <strong>{filtered.length}</strong> resources within <strong>{radiusKm} km</strong>
                                </span>
                                <button onClick={findNearby} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#22c55e', cursor: 'pointer', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <i className="fa-solid fa-rotate-right" /> Refresh
                                </button>
                            </div>

                            {/* Results */}
                            <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {filtered.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--color-text-muted)', fontSize: '0.88rem' }}>
                                        <i className="fa-solid fa-circle-info" style={{ fontSize: '1.8rem', marginBottom: 10, display: 'block', color: '#334155' }} />
                                        No resources found within {radiusKm} km. Try increasing the radius.
                                    </div>
                                ) : (
                                    filtered.map((r, idx) => {
                                        const meta = TYPE_COLORS[r.type] || TYPE_COLORS['Equipment'];
                                        return (
                                            <div key={r.id} style={{ background: 'rgba(0,0,0,0.3)', border: `1px solid ${r.available ? 'var(--color-border)' : 'rgba(239,68,68,0.15)'}`, borderRadius: 14, padding: '14px 16px', display: 'flex', gap: 14, alignItems: 'flex-start', transition: 'border-color 0.2s' }}>
                                                {/* Rank badge */}
                                                <div style={{ flexShrink: 0, width: 32, height: 32, borderRadius: '50%', background: meta.bg, border: `1px solid ${meta.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <i className={`fa-solid ${meta.icon}`} style={{ color: meta.color, fontSize: '0.8rem' }} />
                                                </div>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 4 }}>
                                                        <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'white', lineHeight: 1.3 }}>{r.name}</span>
                                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                                                            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: r.available ? '#22c55e' : '#ef4444', background: r.available ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', padding: '2px 8px', borderRadius: 8, border: `1px solid ${r.available ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}` }}>
                                                                {r.available ? '✓ Open' : '✗ Full'}
                                                            </span>
                                                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#60a5fa', fontFamily: 'monospace' }}>
                                                                {r.distKm < 1 ? `${Math.round(r.distKm * 1000)} m` : `${r.distKm.toFixed(1)} km`}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <p style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', margin: '0 0 8px', lineHeight: 1.5 }}>{r.description}</p>
                                                    <div style={{ display: 'flex', fontSize: '0.72rem', color: 'var(--color-text-muted)', gap: 12, flexWrap: 'wrap' }}>
                                                        <span><i className="fa-solid fa-location-dot" style={{ marginRight: 4, color: meta.color }} />{r.location}</span>
                                                        <span><i className="fa-solid fa-users" style={{ marginRight: 4 }} />Cap: {r.capacity}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                                                        <a href={`tel:${r.contact}`}
                                                            style={{ flex: 1, padding: '7px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)', fontSize: '0.75rem', textDecoration: 'none', fontWeight: 600, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                                                            <i className="fa-solid fa-phone" style={{ color: '#22c55e', fontSize: '0.7rem' }} />{r.contact}
                                                        </a>
                                                        <button onClick={() => openMaps(r)}
                                                            style={{ flex: 1, padding: '7px 10px', borderRadius: 8, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', color: '#60a5fa', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                                                            <i className="fa-solid fa-route" />Get Directions
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
