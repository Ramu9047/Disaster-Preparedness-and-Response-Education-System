import { useState, useRef, useCallback, useEffect } from 'react';
import { toast } from 'react-toastify';
import DisasterMap from '../components/DisasterMap';
import AlertsStream from '../components/AlertsStream';
import ContextPanel from '../components/ContextPanel';
import RiskIntelligencePanel from '../components/RiskIntelligencePanel';
import PredictiveAnalyticsPanel from '../components/PredictiveAnalyticsPanel';
import WhatToDoNow from '../components/WhatToDoNow';
import CommunityHelpNetwork from '../components/CommunityHelpNetwork';

export default function Dashboard() {
    const [alerts, setAlerts] = useState([]);
    const [selected, setSelected] = useState(null);
    const [layerToggles, setLayerToggles] = useState({ earthquakes: true, fires: true, floods: true, heatmap: false, riskZones: true, shelters: true });
    const [locationQuery, setLocationQuery] = useState('');
    const [searchLoading, setSearchLoading] = useState(false);
    const [flyToTarget, setFlyToTarget] = useState(null);
    const [dismissedAlert, setDismissedAlert] = useState(null);
    const [showWhatToDo, setShowWhatToDo] = useState(false);
    const [showCommunity, setShowCommunity] = useState(false);
    const [locating, setLocating] = useState(false);
    const locatingRef = useRef(false);

    const locateUser = useCallback((isAuto = false) => {
        // Prevent duplicate calls while already locating
        if (!isAuto && locatingRef.current) return;

        const fallbackToIP = async () => {
            try {
                const res = await fetch("https://ipapi.co/json/");
                const data = await res.json();
                if (data.latitude && data.longitude) {
                    setFlyToTarget({
                        lat: parseFloat(data.latitude),
                        lng: parseFloat(data.longitude),
                        zoom: 12,
                        t: Date.now()
                    });
                    if (!isAuto) toast.info("Location approximated via IP 🌐");
                } else {
                    if (!isAuto) toast.warn("Could not determine your location.");
                }
            } catch (err) {
                console.error("IP fallback failed:", err);
                if (!isAuto) toast.error("Cannot find location. Please use the search bar.");
            } finally {
                if (!isAuto) { setLocating(false); locatingRef.current = false; }
            }
        };

        if (!navigator.geolocation) {
            fallbackToIP();
            return;
        }

        if (!isAuto) {
            setLocating(true);
            locatingRef.current = true;
        }

        // Use watchPosition: grabs first fix immediately, then refines.
        // We stop watching as soon as we get a fix with decent accuracy.
        let watchId = null;
        const successHandler = (pos) => {
            const { latitude, longitude, accuracy } = pos.coords;
            // Accept fix immediately; stop watching after first result
            if (watchId !== null) {
                navigator.geolocation.clearWatch(watchId);
                watchId = null;
            }
            setFlyToTarget({ lat: latitude, lng: longitude, zoom: 16, t: Date.now() });
            if (!isAuto) {
                const accuracyText = accuracy < 50 ? `±${Math.round(accuracy)}m` : `±${Math.round(accuracy)}m (approximate)`;
                toast.success(`📍 Location locked! Accuracy: ${accuracyText}`);
                setLocating(false);
                locatingRef.current = false;
            }
        };

        const errorHandler = (err) => {
            console.warn('GPS failed, trying IP fallback:', err.message);
            if (watchId !== null) {
                navigator.geolocation.clearWatch(watchId);
                watchId = null;
            }
            fallbackToIP();
        };

        watchId = navigator.geolocation.watchPosition(
            successHandler,
            errorHandler,
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );

        // Safety timeout: stop watching after 12s regardless
        setTimeout(() => {
            if (watchId !== null) {
                navigator.geolocation.clearWatch(watchId);
                watchId = null;
                if (!isAuto) { setLocating(false); locatingRef.current = false; }
            }
        }, 12000);
    }, []);

    useEffect(() => {
        // Auto-locate on first load
        locateUser(true);
    }, [locateUser]);

    const handleAlertsLoaded = useCallback((newAlerts) => {
        setAlerts(prev => {
            const map = new Map();
            // Merge existing and new alerts, eliminating duplicates by ID
            [...prev, ...newAlerts].forEach(a => map.set(a.id, a));
            const merged = Array.from(map.values());
            // Sort by descending date
            return merged.sort((a, b) => b.date - a.date);
        });
    }, []);

    const handleMarkerClick = useCallback((alertData) => {
        setSelected(alertData);
    }, []);

    const handleAlertClick = useCallback((alertData) => {
        setSelected(alertData);
        setFlyToTarget({ lat: alertData.lat, lng: alertData.lng, zoom: 10 });
    }, []);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!locationQuery.trim()) return;
        setSearchLoading(true);
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationQuery)}`);
            const data = await res.json();
            if (data && data.length > 0) {
                setFlyToTarget({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), zoom: 10 });
            }
        } catch (err) {
            console.error('Geocoding error:', err);
        } finally {
            setSearchLoading(false);
        }
    };

    const toggleLayer = (key) => setLayerToggles(prev => ({ ...prev, [key]: !prev[key] }));

    const topAlert = alerts[0];
    const showBanner = topAlert && topAlert.id !== dismissedAlert;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 56px)' }}>
            {showBanner && (
                <div style={{ background: 'linear-gradient(135deg, #ef4444, #b91c1c)', color: 'white', padding: '10px 24px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, boxShadow: '0 4px 15px rgba(239,68,68,0.4)', zIndex: 50, position: 'relative' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 700, fontSize: '0.9rem', flex: 1, justifyContent: 'center' }}>
                        <i className="fa-solid fa-tower-broadcast pulse-dot" /> EARLY WARNING BROADCAST: 
                        <span style={{ fontWeight: 400, marginLeft: 6 }}>{topAlert.title.split(' - ')[0]} • ({new Date(topAlert.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})})</span>
                    </div>
                    <button onClick={() => { setDismissedAlert(topAlert.id); setFlyToTarget({lat: topAlert.lat, lng: topAlert.lng, zoom: 10}); setSelected(topAlert); }} style={{ background: 'white', color: '#ef4444', border: 'none', borderRadius: 20, padding: '4px 12px', fontWeight: 700, cursor: 'pointer', fontSize: '0.75rem', whiteSpace: 'nowrap', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform='scale(1.05)'} onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}>View Map</button>
                    <button onClick={() => setDismissedAlert(topAlert.id)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer' }} aria-label="Dismiss"><i className="fa-solid fa-xmark" /></button>
                </div>
            )}
            <main style={{ display: 'flex', flexDirection: 'row', gap: 16, padding: 16, flex: 1, overflow: 'hidden', maxWidth: 1920, margin: '0 auto', width: '100%' }}>

            {/* Left Sidebar */}
            <aside style={{ width: 300, flexShrink: 0, height: '100%', overflowY: 'auto', padding: 16, borderRadius: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.5)', border: '1px solid var(--color-border)', background: 'rgba(17,24,39,0.7)', backdropFilter: 'blur(20px)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.2rem', color: 'white', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <i className="fa-solid fa-satellite-dish" style={{ color: 'var(--color-blue)' }} /> Radar Console
                    </h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.65rem', color: '#22c55e', background: 'rgba(34,197,94,0.1)', padding: '2px 8px', borderRadius: 20, border: '1px solid rgba(34,197,94,0.3)' }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e' }} className="pulse-dot" /> LIVE
                    </div>
                </div>

                {/* Search */}
                <form onSubmit={handleSearch} style={{ position: 'relative' }}>
                    <input
                        type="text"
                        id="location-search"
                        placeholder="Search state, city, region..."
                        className="form-input"
                        style={{ paddingLeft: 36 }}
                        value={locationQuery}
                        onChange={e => setLocationQuery(e.target.value)}
                        aria-label="Search map location"
                    />
                    <i className="fa-solid fa-search" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', fontSize: '0.8rem' }} />
                    {searchLoading && <i className="fa-solid fa-circle-notch spin" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-blue)', fontSize: '0.8rem' }} />}
                </form>

                {/* Layer Manager */}
                <div style={{ flexShrink: 0, background: 'rgba(0,0,0,0.2)', borderRadius: 12, border: '1px solid var(--color-border)', overflow: 'hidden' }}>
                    <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--color-border)' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#93c5fd', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                            <i className="fa-solid fa-layer-group" style={{ marginRight: 6 }} />Map Layers
                        </span>
                    </div>
                    <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {[
                            { key: 'earthquakes', label: 'Earthquakes', color: '#ef4444' },
                            { key: 'fires', label: 'Forest Fires', color: '#f97316' },
                            { key: 'floods', label: 'Floods/Cyclones', color: '#3b82f6' },
                            { key: 'heatmap', label: 'Risk Heatmap', color: '#a855f7' },
                            { key: 'riskZones', label: 'Risk Zone Overlays', color: '#ef4444' },
                            { key: 'shelters', label: 'Emergency Shelters', color: '#10b981' },
                        ].map(layer => (
                            <label key={layer.key} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: 10, padding: '6px 8px', borderRadius: 8, transition: 'background 0.2s' }}>
                                <div className="toggle-wrapper" style={{ position: 'relative' }}>
                                    <input
                                        type="checkbox"
                                        checked={layerToggles[layer.key]}
                                        onChange={() => toggleLayer(layer.key)}
                                        style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
                                        aria-label={`Toggle ${layer.label}`}
                                    />
                                    <div className="toggle-bg" style={{ background: layerToggles[layer.key] ? 'var(--color-blue)' : '#374151' }} />
                                    <div className="toggle-dot" style={{ transform: layerToggles[layer.key] ? 'translateX(20px)' : 'translateX(0)' }} />
                                </div>
                                <span style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: layer.color, boxShadow: `0 0 6px ${layer.color}` }} />
                                    {layer.label}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Alerts Stream */}
                {(() => {
                    const filteredAlerts = alerts.filter(a => 
                        (a.type === 'Earthquake' && layerToggles.earthquakes) ||
                        (a.type === 'Wildfire' && layerToggles.fires) ||
                        ((a.type === 'Severe Storm' || a.type === 'Flood') && layerToggles.floods)
                    );
                    return <AlertsStream alerts={filteredAlerts} onAlertClick={handleAlertClick} alertCount={filteredAlerts.length} />;
                })()}

                {/* ── AI Panels ── */}
                <RiskIntelligencePanel />
                <PredictiveAnalyticsPanel />

                {/* ── Quick Action Buttons ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <button onClick={() => setShowWhatToDo(true)}
                        style={{ width: '100%', padding: '12px 14px', borderRadius: 12, background: 'linear-gradient(135deg,rgba(239,68,68,0.15),rgba(249,115,22,0.1))', border: '1px solid rgba(239,68,68,0.35)', color: 'white', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, transition: 'all 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'linear-gradient(135deg,rgba(239,68,68,0.25),rgba(249,115,22,0.18))'}
                        onMouseLeave={e => e.currentTarget.style.background = 'linear-gradient(135deg,rgba(239,68,68,0.15),rgba(249,115,22,0.1))'}
                    >
                        <i className="fa-solid fa-bolt" style={{ color: '#ef4444' }} />
                        <div style={{ textAlign: 'left' }}>
                            <div>What To Do NOW</div>
                            <div style={{ fontWeight: 400, fontSize: '0.68rem', color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>Step-by-step emergency action plan</div>
                        </div>
                    </button>
                    <button onClick={() => setShowCommunity(true)}
                        style={{ width: '100%', padding: '12px 14px', borderRadius: 12, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: 'white', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, transition: 'all 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(16,185,129,0.18)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(16,185,129,0.1)'}
                    >
                        <i className="fa-solid fa-people-roof" style={{ color: '#10b981' }} />
                        <div style={{ textAlign: 'left' }}>
                            <div>Community Help Network</div>
                            <div style={{ fontWeight: 400, fontSize: '0.68rem', color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>Find nearby volunteers &amp; resources</div>
                        </div>
                    </button>
                </div>
                </div>
            </aside>

            {/* Map Center */}
            <section style={{ flex: 1, position: 'relative', borderRadius: 16, overflow: 'hidden', border: '1px solid var(--color-border)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)', minHeight: '40vh' }}>
                <DisasterMap
                    onAlertsLoaded={handleAlertsLoaded}
                    onMarkerClick={handleMarkerClick}
                    layerToggles={layerToggles}
                    flyToTarget={flyToTarget}
                />
                <button
                    onClick={() => locateUser(false)}
                    disabled={locating}
                    style={{
                        position: 'absolute', top: 16, right: 16, zIndex: 1000,
                        background: locating ? 'rgba(34,197,94,0.2)' : 'rgba(17,24,39,0.88)',
                        color: 'white',
                        border: locating ? '1px solid #22c55e' : '1px solid rgba(34,197,94,0.6)',
                        padding: '10px 18px', borderRadius: 10, cursor: locating ? 'default' : 'pointer',
                        display: 'flex', alignItems: 'center', gap: 9,
                        fontSize: '0.85rem', fontWeight: 700,
                        backdropFilter: 'blur(12px)', transition: 'all 0.18s',
                        outline: 'none',
                        boxShadow: locating ? '0 0 18px rgba(34,197,94,0.5)' : '0 2px 10px rgba(0,0,0,0.4)',
                        transform: locating ? 'scale(0.97)' : 'scale(1)'
                    }}
                    onMouseEnter={e => { if (!locating) Object.assign(e.currentTarget.style, { background: 'rgba(34,197,94,0.18)', boxShadow: '0 0 18px rgba(34,197,94,0.45)', transform: 'scale(1.03)' }); }}
                    onMouseLeave={e => { if (!locating) Object.assign(e.currentTarget.style, { background: 'rgba(17,24,39,0.88)', boxShadow: '0 2px 10px rgba(0,0,0,0.4)', transform: 'scale(1)' }); }}
                    title={locating ? 'Acquiring GPS signal…' : 'Fly to My Current Location'}
                >
                    {locating
                        ? <i className="fa-solid fa-circle-notch" style={{ color: '#22c55e', animation: 'spin 0.9s linear infinite' }} />
                        : <i className="fa-solid fa-location-crosshairs" style={{ color: '#22c55e' }} />
                    }
                    {locating ? 'Locating…' : 'Find Me'}
                </button>
            </section>

            {/* Right Context Panel */}
            <div className="lg-hidden" style={{ display: 'none' }}>
                <ContextPanel selected={selected} />
            </div>
            <div style={{ display: 'none' }} className="desktop-context-panel">
                <ContextPanel selected={selected} />
            </div>
            <ContextPanel selected={selected} />
            </main>
            {showWhatToDo && <WhatToDoNow onClose={() => setShowWhatToDo(false)} />}
            {showCommunity && <CommunityHelpNetwork onClose={() => setShowCommunity(false)} />}
        </div>
    );
}
