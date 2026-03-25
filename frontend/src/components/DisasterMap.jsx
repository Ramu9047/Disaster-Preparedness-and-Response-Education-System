import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, useMap, Marker, Popup, Circle, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.markercluster';
import { getEarthquakes, getNasaEvents } from '../services/api';

// Fix leaflet default icon path issue with bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// ── Risk Zones Data ────────────────────────────────────────────────────────
const RISK_ZONES = [
    { id: 'rz-1', name: 'Marina Coast Cyclone Zone', lat: 13.052, lng: 80.282, radiusKm: 8, level: 'HIGH', type: 'Cyclone', desc: 'High cyclone frequency. Annual risk Apr–Dec. Mandatory evacuation zone during Cat 2+.' },
    { id: 'rz-2', name: 'Adyar River Flood Plain', lat: 13.006, lng: 80.255, radiusKm: 5, level: 'HIGH', type: 'Flood', desc: 'Adyar floodplain. Inundated during heavy rains (>200mm/day). Evacuation protocol active.' },
    { id: 'rz-3', name: 'Anna Nagar Industrial Zone', lat: 13.089, lng: 80.215, radiusKm: 3, level: 'MEDIUM', type: 'Chemical Hazard', desc: 'Industrial chemical storage. Risk of spillage during seismic events or flooding.' },
    { id: 'rz-4', name: 'Chennai Seismic Zone III', lat: 13.067, lng: 80.237, radiusKm: 15, level: 'MEDIUM', type: 'Earthquake', desc: 'IS 1893 Seismic Zone III. Buildings pre-2010 may require retrofitting.' },
    { id: 'rz-5', name: 'Cooum River Flood Corridor', lat: 13.077, lng: 80.26, radiusKm: 4, level: 'HIGH', type: 'Flood', desc: 'Cooum river overflow zone. Regular flooding during NE monsoon (Oct–Dec).' },
    { id: 'rz-6', name: 'T. Nagar Dense Urban Zone', lat: 13.04, lng: 80.234, radiusKm: 2.5, level: 'MEDIUM', type: 'Building Collapse', desc: 'High density. Old buildings at collapse risk during seismic activity or flooding.' },
    { id: 'rz-7', name: 'Bay of Bengal Watch Zone', lat: 13.12, lng: 80.30, radiusKm: 20, level: 'LOW', type: 'Storm Surge', desc: 'Open coastal area. Storm surge monitoring active during cyclone season.' },
    { id: 'rz-8', name: 'Guindy Industrial Hazard Zone', lat: 13.008, lng: 80.207, radiusKm: 3.5, level: 'HIGH', type: 'Fire/Chemical', desc: 'Industrial estate with fuel storage. High fire and chemical hazard risk zone.' },
];

const SHELTERS = [
    { id: 'sh-1', name: 'Central High School Gym', lat: 13.065, lng: 80.24, capacity: 500, current: 120, type: 'General', contact: '112' },
    { id: 'sh-2', name: 'Marina Community Hall', lat: 13.05, lng: 80.28, capacity: 200, current: 195, type: 'Cyclone Shelter', contact: '112' },
    { id: 'sh-3', name: 'Guindy Govt School', lat: 13.01, lng: 80.21, capacity: 800, current: 300, type: 'Medical Equipped', contact: '112' },
    { id: 'sh-4', name: 'Anna Nagar Expo Center', lat: 13.09, lng: 80.21, capacity: 2000, current: 50, type: 'Mass Evacuation', contact: '112' },
];

const RISK_COLORS = { HIGH: '#ef4444', MEDIUM: '#f97316', LOW: '#eab308' };
const RISK_OPACITIES = { HIGH: 0.12, MEDIUM: 0.08, LOW: 0.05 };

function RiskZonesLayer({ show }) {
    if (!show) return null;
    return (
        <>
            {RISK_ZONES.map(zone => {
                const color = RISK_COLORS[zone.level];
                const fillOpacity = RISK_OPACITIES[zone.level];
                return (
                    <Circle
                        key={zone.id}
                        center={[zone.lat, zone.lng]}
                        radius={zone.radiusKm * 1000}
                        pathOptions={{
                            color,
                            fillColor: color,
                            fillOpacity,
                            weight: zone.level === 'HIGH' ? 2 : 1,
                            dashArray: zone.level === 'LOW' ? '6 4' : zone.level === 'MEDIUM' ? '4 2' : undefined,
                        }}
                    >
                        <Popup className="custom-popup">
                            <div style={{ minWidth: 200 }}>
                                <div style={{ fontWeight: 800, fontSize: '0.88rem', color, marginBottom: 4 }}>
                                    ⚠ {zone.level} RISK — {zone.type}
                                </div>
                                <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#e2e8f0', marginBottom: 6 }}>{zone.name}</div>
                                <div style={{ fontSize: '0.74rem', color: '#94a3b8', lineHeight: 1.5 }}>{zone.desc}</div>
                                <div style={{ marginTop: 8, fontSize: '0.68rem', color: '#64748b', fontFamily: 'monospace' }}>
                                    Radius: {zone.radiusKm} km · Zone ID: {zone.id}
                                </div>
                            </div>
                        </Popup>
                    </Circle>
                );
            })}
        </>
    );
}

function HeatmapLayer({ show }) {
    if (!show) return null;
    
    // Abstract Heatmap representation using gradient circles
    return (
        <>
            <Circle center={[13.08, 80.27]} radius={25000} pathOptions={{ fillOpacity: 0.1, color: 'none', fillColor: '#ef4444' }} />
            <Circle center={[13.08, 80.27]} radius={15000} pathOptions={{ fillOpacity: 0.2, color: 'none', fillColor: '#ef4444' }} />
            <Circle center={[13.08, 80.27]} radius={8000} pathOptions={{ fillOpacity: 0.3, color: 'none', fillColor: '#ef4444' }} />
            
            <Circle center={[11.12, 78.65]} radius={30000} pathOptions={{ fillOpacity: 0.1, color: 'none', fillColor: '#f97316' }} />
            <Circle center={[11.12, 78.65]} radius={15000} pathOptions={{ fillOpacity: 0.2, color: 'none', fillColor: '#f97316' }} />
            
            <Circle center={[22.57, 88.36]} radius={40000} pathOptions={{ fillOpacity: 0.15, color: 'none', fillColor: '#3b82f6' }} />
            <Circle center={[22.57, 88.36]} radius={20000} pathOptions={{ fillOpacity: 0.25, color: 'none', fillColor: '#3b82f6' }} />
        </>
    );
}

function SheltersLayer({ show }) {
    if (!show) return null;
    return (
        <>
            {SHELTERS.map(shelter => {
                const color = '#10b981'; // green for safety
                const isFull = shelter.current >= shelter.capacity;
                const dotColor = isFull ? '#ef4444' : color;
                const customIcon = L.divIcon({
                    className: 'custom-div-icon',
                    html: `<div style="background:${dotColor};width:26px;height:26px;border-radius:6px;display:flex;align-items:center;justify-content:center;border:2px solid rgba(255,255,255,0.9);box-shadow:0 0 10px ${dotColor};color:white;font-size:12px;"><i class="fa-solid fa-tent"></i></div>`,
                    iconSize: [26, 26], iconAnchor: [13, 13]
                });
                return (
                    <Marker key={shelter.id} position={[shelter.lat, shelter.lng]} icon={customIcon}>
                        <Popup className="custom-popup">
                            <div style={{ minWidth: 200 }}>
                                <div style={{ fontWeight: 800, fontSize: '0.88rem', color: dotColor, marginBottom: 4 }}>
                                    {isFull ? '⚠ SHELTER FULL' : '⛑️ OPEN SHELTER'}
                                </div>
                                <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#e2e8f0', marginBottom: 6 }}>{shelter.name}</div>
                                <div style={{ fontSize: '0.74rem', color: '#94a3b8', lineHeight: 1.5 }}>
                                    Type: {shelter.type}<br/>
                                    Capacity: <span style={{color: isFull ? '#ef4444' : '#10b981'}}>{shelter.current} / {shelter.capacity}</span>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                );
            })}
        </>
    );
}

function TelemetryLayer({ onAlertsLoaded, onMarkerClick, layerToggles }) {
    const map = useMap();
    const [earthquakeData, setEarthquakeData] = useState([]);
    const [nasaData, setNasaData] = useState([]);
    
    // Fetch data exactly once on mount
    useEffect(() => {
        let isMounted = true;
        
        // Fetch Earthquakes
        getEarthquakes()
            .then(res => {
                if (!isMounted) return;
                const features = res.data?.features || [];
                const alerts = features.map(event => {
                    const coords = event.geometry.coordinates;
                    if (coords.length < 2) return null;
                    return {
                        id: event.id,
                        type: 'Earthquake',
                        title: event.properties.place,
                        mag: event.properties.mag,
                        lat: coords[1],
                        lng: coords[0],
                        date: new Date(event.properties.time),
                        url: event.properties.url
                    };
                }).filter(Boolean);
                setEarthquakeData(alerts);
            })
            .catch(err => {
                console.warn('Backend failed, using USGS...', err);
                fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson')
                    .then(r => r.json())
                    .then(data => {
                        if (!isMounted) return;
                        const features = data.features || [];
                        const alerts = features.map(event => {
                            const coords = event.geometry.coordinates;
                            if (coords.length < 2) return null;
                            return {
                                id: event.id,
                                type: 'Earthquake',
                                title: event.properties.place,
                                mag: event.properties.mag,
                                lat: coords[1],
                                lng: coords[0],
                                date: new Date(event.properties.time),
                                url: event.properties.url
                            };
                        }).filter(Boolean);
                        setEarthquakeData(alerts);
                    });
            });

        // Fetch NASA Events
        getNasaEvents('open')
            .then(res => {
                if (!isMounted) return;
                const rawEvents = res.data?.events || [];
                const alerts = rawEvents.map(event => {
                    const categoryId = event.categories?.[0]?.id;
                    let type = 'Unknown';
                    if (categoryId === 'wildfires') type = 'Wildfire';
                    else if (categoryId === 'severeStorms') type = 'Severe Storm';
                    else if (categoryId === 'floods') type = 'Flood';
                    if (type === 'Unknown') return null;

                    const activeGeometry = event.geometry?.find(g => g.type === 'Point' || g.coordinates?.length >= 2) || event.geometry?.[0];
                    if (!activeGeometry || !activeGeometry.coordinates || activeGeometry.coordinates.length < 2) return null;

                    let [lng, lat] = activeGeometry.coordinates;
                    if (Array.isArray(lng)) {
                        lng = activeGeometry.coordinates[0][0][0];
                        lat = activeGeometry.coordinates[0][0][1];
                    }

                    return {
                        id: event.id,
                        type: type,
                        title: event.title,
                        mag: null,
                        lat: lat,
                        lng: lng,
                        date: new Date(activeGeometry.date || event.closed || new Date()),
                        url: event.sources?.[0]?.url || ''
                    };
                }).filter(Boolean);
                setNasaData(alerts);
            })
            .catch(err => console.error('Failed to fetch NASA EONET data:', err));

        return () => { isMounted = false; };
    }, []);

    // Push all alerts up to Dashboard so it can run its own filter for the Live Stream
    useEffect(() => {
        onAlertsLoaded([...earthquakeData, ...nasaData]);
    }, [earthquakeData, nasaData, onAlertsLoaded]);

    // Render Markers based on Toggles
    useEffect(() => {
        const clusterGroup = L.markerClusterGroup({ chunkedLoading: true, maxClusterRadius: 50 });

        if (layerToggles.earthquakes && earthquakeData.length > 0) {
            earthquakeData.forEach(alert => {
                let color = '#3B82F6';
                if (alert.mag >= 6.0) color = '#EF4444';
                else if (alert.mag >= 4.5) color = '#F97316';
                else if (alert.mag >= 2.5) color = '#EAB308';

                const customIcon = L.divIcon({
                    className: 'custom-div-icon',
                    html: `<div style="background:${color};width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid rgba(255,255,255,0.8);box-shadow:0 0 10px ${color};color:white;font-size:9px;font-weight:bold;">${alert.mag >= 4.5 ? '!' : '·'}</div>`,
                    iconSize: [22, 22], iconAnchor: [11, 11]
                });

                const marker = L.marker([alert.lat, alert.lng], { icon: customIcon });
                marker.bindPopup(`
                    <div class="font-inter" style="min-width:200px;">
                      <h4 style="font-weight:700;font-size:0.85rem;color:${color};margin-bottom:4px;">M ${alert.mag} – ${alert.title}</h4>
                      <div style="font-size:0.75rem;color:#64748b;font-family:monospace;">Earthquake · ${alert.date.toLocaleString()}</div>
                      ${alert.url ? `<a href="${alert.url}" target="_blank" style="display:block;margin-top:8px;font-size:0.7rem;background:#f1f5f9;padding:4px 8px;border-radius:6px;text-align:center;text-decoration:none;color:#374151;">View USGS Report ↗</a>` : ''}
                    </div>
                `, { className: 'custom-popup' });
                marker.on('click', () => onMarkerClick(alert));
                clusterGroup.addLayer(marker);
            });
        }

        if (nasaData.length > 0) {
            nasaData.forEach(alert => {
                if (alert.type === 'Wildfire' && !layerToggles.fires) return;
                if ((alert.type === 'Severe Storm' || alert.type === 'Flood') && !layerToggles.floods) return;

                let color = '#3B82F6';
                let iconChar = '!';
                if (alert.type === 'Wildfire') { color = '#F97316'; iconChar = '🔥'; }
                else if (alert.type === 'Severe Storm') { color = '#3B82F6'; iconChar = '🌀'; }
                else if (alert.type === 'Flood') { color = '#3B82F6'; iconChar = '🌊'; }

                const customIcon = L.divIcon({
                    className: 'custom-div-icon',
                    html: `<div style="background:${color};width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid rgba(255,255,255,0.8);box-shadow:0 0 10px ${color};color:white;font-size:11px;font-weight:bold;">${iconChar}</div>`,
                    iconSize: [24, 24], iconAnchor: [12, 12]
                });

                const marker = L.marker([alert.lat, alert.lng], { icon: customIcon });
                marker.bindPopup(`
                    <div class="font-inter" style="min-width:200px;">
                      <h4 style="font-weight:700;font-size:0.85rem;color:${color};margin-bottom:4px;">${alert.type} – ${alert.title}</h4>
                      <div style="font-size:0.75rem;color:#64748b;font-family:monospace;">${alert.type} · ${alert.date.toLocaleString()}</div>
                      ${alert.url ? `<a href="${alert.url}" target="_blank" style="display:block;margin-top:8px;font-size:0.7rem;background:#f1f5f9;padding:4px 8px;border-radius:6px;text-align:center;text-decoration:none;color:#374151;">View Source Report ↗</a>` : ''}
                    </div>
                `, { className: 'custom-popup' });
                marker.on('click', () => onMarkerClick(alert));
                clusterGroup.addLayer(marker);
            });
        }

        map.addLayer(clusterGroup);
        return () => { map.removeLayer(clusterGroup); };
    }, [map, layerToggles.earthquakes, layerToggles.fires, layerToggles.floods, earthquakeData, nasaData, onMarkerClick]);

    return null;
}

function LiveLocationLayer() {
    const [position, setPosition] = useState(null);
    const [accuracy, setAccuracy] = useState(0);

    useEffect(() => {
        if (!navigator.geolocation) return;

        // Passively watch GPS to display the live-dot marker.
        // Does NOT pan the map — panning is handled by Dashboard's Find Me button.
        const watchId = navigator.geolocation.watchPosition(
            (pos) => {
                setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                setAccuracy(pos.coords.accuracy);
            },
            (err) => console.warn('Live location watch error:', err.message),
            { enableHighAccuracy: true, timeout: 30000, maximumAge: 5000 }
        );

        return () => navigator.geolocation.clearWatch(watchId);
    }, []);

    if (!position) return null;

    const pulseIcon = L.divIcon({
        className: 'user-location-pulse',
        html: `<div style="background:#22c55e;width:18px;height:18px;border-radius:50%;border:3px solid white;box-shadow:0 0 20px #22c55e;animation:pulseGlow 1.5s infinite;"></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
    });

    const displayAccuracy = accuracy < 10 ? '99.9%' : (100 - (accuracy / 1000)).toFixed(2) + '%';

    const pos = [position.lat, position.lng];

    return (
        <>
            <Marker position={pos} icon={pulseIcon}>
                <Popup className="custom-popup" closeButton={false}>
                    <div style={{ textAlign: 'center', minWidth: 160 }}>
                        <h4 style={{ color: '#22c55e', fontWeight: 800, margin: '0 0 4px 0', fontSize: '14px', fontFamily: 'var(--font-display)' }}>
                            <i className="fa-solid fa-location-crosshairs" style={{ marginRight: 6 }} /> Your Location
                        </h4>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: 6 }}>
                            GPS Tracking Active
                        </div>
                        <div style={{ fontSize: '10px', color: '#60a5fa', fontWeight: 700, padding: '4px 8px', background: 'rgba(59,130,246,0.1)', borderRadius: '4px', border: '1px solid rgba(59,130,246,0.2)' }}>
                            Accuracy: ±{accuracy <= 1 ? '< 1' : Math.round(accuracy)} meters
                        </div>
                    </div>
                </Popup>
            </Marker>
            <Circle
                center={pos}
                radius={Math.max(accuracy, 20)}
                pathOptions={{ color: '#22c55e', fillColor: '#22c55e', fillOpacity: 0.1, weight: 1.5, dashArray: '4 4' }}
            />
        </>
    );
}

function FlyToComponent({ target }) {
    const map = useMap();
    useEffect(() => {
        if (target && target.lat && target.lng) {
            map.flyTo([target.lat, target.lng], target.zoom || 10, { animate: true, duration: 1.5 });
        }
    }, [target, map]);
    return null;
}

export default function DisasterMap({ onAlertsLoaded, onMarkerClick, layerToggles, flyToTarget, onSearchComponent }) {
    const [mapReady, setMapReady] = useState(false);

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            {!mapReady && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(3,7,18,0.9)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
                    <div style={{ width: 56, height: 56, borderRadius: '50%', border: '4px solid #1e3a8a', borderTopColor: 'var(--color-blue)', animation: 'spin 1s linear infinite', marginBottom: 16 }} />
                    <p style={{ color: 'var(--color-blue)', fontFamily: 'monospace', fontSize: '0.8rem', letterSpacing: '0.15em', textTransform: 'uppercase', opacity: 0.8 }}>Initializing GIS Data</p>
                </div>
            )}
            <MapContainer
                center={[22.5937, 78.9629]}
                zoom={5}
                style={{ width: '100%', height: '100%' }}
                zoomControl={false}
                whenReady={() => setMapReady(true)}
            >
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution="© OpenStreetMap © CARTO"
                    subdomains="abcd"
                    maxZoom={20}
                    eventHandlers={{ load: () => setMapReady(true) }}
                />
                <TelemetryLayer
                    onAlertsLoaded={onAlertsLoaded}
                    onMarkerClick={onMarkerClick}
                    layerToggles={layerToggles}
                />
                <RiskZonesLayer show={layerToggles?.riskZones} />
                <HeatmapLayer show={layerToggles?.heatmap} />
                <SheltersLayer show={layerToggles?.shelters} />
                <LiveLocationLayer />
                <FlyToComponent target={flyToTarget} />
            </MapContainer>

            {/* Map legend */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 400, background: 'linear-gradient(to top, rgba(3,7,18,0.9), transparent)', padding: '12px 16px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', pointerEvents: 'none' }}>
                <span style={{ fontSize: '0.7rem', color: '#64748b', fontFamily: 'monospace', background: 'rgba(0,0,0,0.5)', padding: '3px 8px', borderRadius: 4, pointerEvents: 'auto' }}>
                    <i className="fa-solid fa-clock" style={{ color: 'var(--color-blue)', marginRight: 4 }} />Sync: Live
                </span>
                <div style={{ display: 'flex', gap: 12, background: 'rgba(0,0,0,0.5)', padding: '4px 12px', borderRadius: 4, border: '1px solid var(--color-border)', pointerEvents: 'auto' }}>
                    <span style={{ display: 'flex', alignItems: 'center', fontSize: '0.7rem', color: '#94a3b8', gap: 6 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 6px #ef4444' }} />Extreme
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', fontSize: '0.7rem', color: '#94a3b8', gap: 6 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f97316', boxShadow: '0 0 6px #f97316' }} />Severe
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', fontSize: '0.7rem', color: '#94a3b8', gap: 6 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#eab308', boxShadow: '0 0 6px #eab308' }} />Moderate
                    </span>
                </div>
            </div>
        </div>
    );
}
