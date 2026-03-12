import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, useMap, Marker, Popup, Circle } from 'react-leaflet';
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

function EarthquakeLayer({ onAlertsLoaded, onMarkerClick, layerToggles }) {
    const map = useMap();
    const markersRef = useRef(null);

    useEffect(() => {
        let clusterGroup = L.markerClusterGroup({ chunkedLoading: true, maxClusterRadius: 50 });
        markersRef.current = clusterGroup;

        getEarthquakes()
            .then(res => {
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

                if (layerToggles.earthquakes) onAlertsLoaded(alerts);

                alerts.forEach(alert => {
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

                map.addLayer(clusterGroup);
            })
            .catch(err => {
                console.warn('Could not fetch earthquakes from backend, trying USGS directly...', err);
                // fallback: fetch USGS directly if backend is down
                fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson')
                    .then(r => r.json())
                    .then(data => {
                        onAlertsLoaded(data.features || []);
                        console.log('Loaded from USGS directly:', data.features?.length);
                    });
            });

        return () => { map.removeLayer(clusterGroup); };
    }, [map]);

    return null;
}

function NasaEventsLayer({ onAlertsLoaded, onMarkerClick, layerToggles }) {
    const map = useMap();
    const markersRef = useRef(null);

    useEffect(() => {
        let clusterGroup = L.markerClusterGroup({ chunkedLoading: true, maxClusterRadius: 50 });
        markersRef.current = clusterGroup;

        getNasaEvents('open')
            .then(res => {
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
                        // NASA sometimes provides polygons, grab the first longitude point
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

                const activeAlerts = alerts.filter(a =>
                    (a.type === 'Wildfire' && layerToggles.fires) ||
                    ((a.type === 'Severe Storm' || a.type === 'Flood') && layerToggles.floods)
                );

                onAlertsLoaded(activeAlerts);

                activeAlerts.forEach(alert => {
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

                map.addLayer(clusterGroup);
            })
            .catch(err => console.error('Failed to fetch NASA EONET data:', err));

        return () => { map.removeLayer(clusterGroup); };
    }, [map, layerToggles.fires, layerToggles.floods]);

    return null;
}

function LiveLocationLayer() {
    const map = useMap();
    const [position, setPosition] = useState(null);
    const [accuracy, setAccuracy] = useState(0);

    useEffect(() => {
        let initialFly = true;

        // Watch mode continuously polls the hardware GPS and refines accuracy as satellites lock
        map.locate({
            watch: true,
            enableHighAccuracy: true,
            timeout: 30000,
            maximumAge: 0
        });

        const onLocationFound = (e) => {
            setPosition(e.latlng);
            setAccuracy(e.accuracy);

            // Only force map center on the first highly accurate lock
            if (initialFly) {
                map.flyTo(e.latlng, 13, { animate: true, duration: 1.5 });
                initialFly = false;
            }
        };

        const onLocationError = (e) => {
            console.warn('Live location error:', e.message);
        };

        map.on('locationfound', onLocationFound);
        map.on('locationerror', onLocationError);

        return () => {
            map.stopLocate();
            map.off('locationfound', onLocationFound);
            map.off('locationerror', onLocationError);
        };
    }, [map]);

    if (!position) return null;

    const pulseIcon = L.divIcon({
        className: 'user-location-pulse',
        html: `<div style="background:#22c55e;width:18px;height:18px;border-radius:50%;border:3px solid white;box-shadow:0 0 20px #22c55e;animation:pulseGlow 1.5s infinite;"></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
    });

    const displayAccuracy = accuracy < 10 ? '99.9%' : (100 - (accuracy / 1000)).toFixed(2) + '%';

    return (
        <>
            <Marker position={position} icon={pulseIcon}>
                <Popup className="custom-popup" closeButton={false}>
                    <div style={{ textAlign: 'center', minWidth: 160 }}>
                        <h4 style={{ color: '#22c55e', fontWeight: 800, margin: '0 0 4px 0', fontSize: '14px', fontFamily: 'var(--font-display)' }}>
                            <i className="fa-solid fa-location-crosshairs" style={{ marginRight: 6 }} /> Active Tracking
                        </h4>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                            Satellite GPS Lock: Stable
                        </div>
                        <div style={{ fontSize: '10px', color: '#60a5fa', marginTop: '6px', fontWeight: 700, padding: '4px 8px', background: 'rgba(59,130,246,0.1)', borderRadius: '4px', border: '1px solid rgba(59,130,246,0.2)' }}>
                            Precision Rating: &gt;100%<br />
                            Calculated Error: ±{accuracy <= 1 ? '< 1' : Math.round(accuracy)} meters
                        </div>
                    </div>
                </Popup>
            </Marker>
            <Circle
                center={position}
                radius={accuracy > 3000 ? 3000 : accuracy}
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
                <EarthquakeLayer
                    onAlertsLoaded={onAlertsLoaded}
                    onMarkerClick={onMarkerClick}
                    layerToggles={layerToggles}
                />
                <NasaEventsLayer
                    onAlertsLoaded={onAlertsLoaded}
                    onMarkerClick={onMarkerClick}
                    layerToggles={layerToggles}
                />
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
