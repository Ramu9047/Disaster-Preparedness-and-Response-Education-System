// Strict Fix: Map Module
document.addEventListener('DOMContentLoaded', () => {
    console.log("Map Module: Checking for map container...");

    // 2. Ensure map container id="map" exists.
    const mapContainer = document.getElementById('map');
    const mapLoader = document.getElementById('map-loader');

    if (!mapContainer) {
        // If map container does not exist on page, abort safely without error.
        console.warn("Map container not found on this page. Aborting map init safely.");
        return;
    }

    // Ensure Leaflet is fully loaded
    if (typeof L === 'undefined') {
        console.error("Map error: Leaflet library (L) is undefined. Check index.html imports.");
        return;
    }

    try {
        console.log("Map initialized: Creating Leaflet instance.");

        // 6. Ensure map variable is global-safe but not duplicated.
        if (window.disasterMapInstance) {
            console.log("Map already initialized.");
            return;
        }

        const map = L.map('map', {
            zoomControl: false
        }).setView([22.5937, 78.9629], 5);

        L.control.zoom({ position: 'bottomright' }).addTo(map);

        // 4. Use working OpenStreetMap dark tile URL.
        const tileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
        const tileLayer = L.tileLayer(tileUrl, {
            attribution: '&copy; OpenStreetMap &copy; CARTO',
            subdomains: 'abcd',
            maxZoom: 20
        });

        // 7. Remove spinner once map 'load' event fires.
        tileLayer.on('load', () => {
            console.log("Tiles loaded");
            if (mapLoader) {
                mapLoader.style.opacity = '0';
                setTimeout(() => mapLoader.style.display = 'none', 500);
            }
        });

        // 5. Add error event listener to tileLayer.
        tileLayer.on('tileerror', (error, tile) => {
            console.error("Map error: A tile failed to load.", error);
        });

        tileLayer.addTo(map);

        window.disasterMapInstance = map;

        // --- FETCH AND DISPLAY LIVE USER LOCATION ---
        let currentLocMarker = null;

        function dropLocationMarker(lat, lng, labelText) {
            if (currentLocMarker) map.removeLayer(currentLocMarker);

            map.flyTo([lat, lng], 10, { animate: true, duration: 1.5 });

            const userLocationIcon = L.divIcon({
                className: 'user-location-marker relative',
                html: `
                    <div class="absolute inset-0 w-4 h-4 rounded-full bg-cyan-400 border-2 border-white shadow-[0_0_10px_rgba(34,211,238,0.8)] mx-auto z-10" style="left: -8px; top: -8px;"></div>
                    <div class="absolute inset-0 w-8 h-8 rounded-full bg-cyan-400 opacity-40 animate-ping mx-auto z-0" style="left: -16px; top: -16px;"></div>
                `,
                iconSize: [0, 0] // Centered exactly on lat/lng coordinate
            });

            currentLocMarker = L.marker([lat, lng], { icon: userLocationIcon, zIndexOffset: 1000 }).addTo(map);
            currentLocMarker.bindPopup(`<div class="font-outfit font-bold text-sm text-cyan-400">Live Location</div><div class="text-xs text-gray-700 mt-1">${labelText}</div>`, { className: 'custom-popup z-[9000]' }).openPopup();
        }

        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition((position) => {
                dropLocationMarker(position.coords.latitude, position.coords.longitude, "Approximate GPS/IP Location");
            }, (error) => {
                console.warn("Geolocation Error/Denied:", error.message);
            }, { enableHighAccuracy: true });
        } else {
            console.warn("Geolocation not supported by this browser.");
        }

        // --- MANUAL LOCATION SEARCH (For Desktop Override) ---
        const locationSearch = document.getElementById('location-search');
        if (locationSearch) {
            locationSearch.addEventListener('keypress', async (e) => {
                if (e.key === 'Enter') {
                    const query = e.target.value.trim();
                    if (!query) return;

                    // Brief visual feedback
                    locationSearch.disabled = true;
                    locationSearch.value = "Searching...";

                    try {
                        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
                        if (!res.ok) throw new Error("Search provider failed");

                        const data = await res.json();
                        if (data && data.length > 0) {
                            dropLocationMarker(data[0].lat, data[0].lon, data[0].display_name);
                        } else {
                            alert("Location not found. Please try a different city or region.");
                        }
                    } catch (err) {
                        console.error("Geocoding error:", err);
                        alert("Geocoding service unavailable.");
                    } finally {
                        locationSearch.disabled = false;
                        locationSearch.value = query; // Restore query
                    }
                }
            });
        }

        // --- FETCH REAL-TIME DATA FROM BACKEND ---
        const fetchLiveDisasters = async () => {
            try {
                // Fetch USGS Earthquakes from our secure proxy
                const response = await fetch('http://localhost:3000/api/earthquakes');
                if (!response.ok) throw new Error('Backend API Failed');

                const data = await response.json();
                console.log(`Loaded ${data.features.length} live earthquake events`);

                // Create a marker cluster group for performance
                let markers = L.markerClusterGroup({
                    chunkedLoading: true,
                    maxClusterRadius: 50
                });

                data.features.forEach(event => {
                    const coords = event.geometry.coordinates;
                    if (coords.length < 2) return;

                    const lat = coords[1];
                    const lng = coords[0];
                    const mag = event.properties.mag;
                    const title = event.properties.place;
                    const date = new Date(event.properties.time).toLocaleDateString();

                    // Determine color based on magnitude
                    let color = '#3B82F6'; // Default Blue
                    let iconClass = 'fa-mountain'; // Generic earthquake icon

                    if (mag >= 6.0) {
                        color = '#EF4444'; // Red
                    } else if (mag >= 4.5) {
                        color = '#F97316'; // Orange
                    } else if (mag >= 2.5) {
                        color = '#EAB308'; // Yellow
                    }

                    // Create custom HTML icon
                    const customIcon = L.divIcon({
                        className: 'custom-div-icon',
                        html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 0 10px ${color}; color: white; font-size: 10px;">
                                <i class="fa-solid ${iconClass}"></i>
                               </div>`,
                        iconSize: [24, 24],
                        iconAnchor: [12, 12]
                    });

                    // Create marker with popup
                    const marker = L.marker([lat, lng], { icon: customIcon });
                    marker.bindPopup(`
                        <div class="p-2 min-w-[200px] text-gray-800 font-inter">
                            <h4 class="font-bold text-sm mb-1" style="color: ${color}">M ${mag} - ${title}</h4>
                            <div class="text-xs text-gray-600 mb-2 font-mono">Earthquake | ${date}</div>
                            <a href="${event.properties.url}" target="_blank" class="text-[10px] bg-gray-100 px-2 py-1 rounded border border-gray-200 hover:bg-gray-200 transition text-gray-700 block text-center mt-2">View USGS Report</a>
                        </div>
                    `, {
                        className: 'custom-popup'
                    });

                    // Update Right Panel on Marker Click
                    marker.on('click', () => {
                        const impactRadius = Math.round(mag * 15);
                        const titleEl = document.getElementById('contextTitle');
                        const detailsEl = document.getElementById('contextDetails');

                        if (titleEl && detailsEl) {
                            titleEl.innerText = `M ${mag} - ${title}`;
                            detailsEl.innerHTML = `
                                <strong>Event Time:</strong> ${date}<br>
                                <strong>Coordinates:</strong> ${lat.toFixed(4)}, ${lng.toFixed(4)}<br>
                                <strong>Impact Radius:</strong> ~${impactRadius} miles<br><br>
                                <strong>Protocol:</strong> Drop, Cover, and Hold On. Avoid damaged structures.
                            `;

                            const rightSidebar = document.getElementById('right-sidebar');
                            if (rightSidebar) {
                                rightSidebar.classList.remove('hidden');
                                rightSidebar.classList.add('flex');
                            }
                        }
                    });

                    markers.addLayer(marker);
                });

                map.addLayer(markers);

                // Update live count badge
                const badge = document.getElementById('alert-badge');
                if (badge) badge.innerText = data.features.length;

                // Update stream container
                const stream = document.getElementById('alerts-container');
                if (stream && data.features.length > 0) {
                    stream.innerHTML = '';
                    // Take top 10 most recent
                    data.features.slice(0, 10).forEach(ev => {
                        const magColor = ev.properties.mag >= 6 ? 'text-red-400' : (ev.properties.mag >= 4.5 ? 'text-orange-400' : 'text-blue-400');
                        const timeStr = new Date(ev.properties.time).toLocaleString();

                        const item = document.createElement('div');
                        item.className = "bg-gray-800/50 p-3 rounded-lg border border-white/5 hover:bg-gray-800 transition cursor-pointer text-left mb-2";
                        item.innerHTML = `
                            <div class="text-[10px] ${magColor} font-mono mb-1">M ${ev.properties.mag} Earthquake</div>
                            <div class="text-xs text-gray-200 font-semibold mb-1 leading-tight">${ev.properties.place}</div>
                            <div class="text-[9px] text-gray-500">${timeStr}</div>
                        `;

                        item.addEventListener('click', () => {
                            const coords = ev.geometry.coordinates;
                            map.flyTo([coords[1], coords[0]], 8, { animate: true });

                            const titleEl = document.getElementById('contextTitle');
                            const detailsEl = document.getElementById('contextDetails');

                            if (titleEl && detailsEl) {
                                const impactRadius = Math.round(ev.properties.mag * 15);
                                titleEl.innerText = `M ${ev.properties.mag} - ${ev.properties.place}`;
                                detailsEl.innerHTML = `
                                    <strong>Event Time:</strong> ${timeStr}<br>
                                    <strong>Coordinates:</strong> ${coords[1].toFixed(4)}, ${coords[0].toFixed(4)}<br>
                                    <strong>Impact Radius:</strong> ~${impactRadius} miles<br><br>
                                    <strong>Protocol:</strong> Drop, Cover, and Hold On. Avoid damaged structures.
                                `;

                                const rightSidebar = document.getElementById('right-sidebar');
                                if (rightSidebar) {
                                    rightSidebar.classList.remove('hidden');
                                    rightSidebar.classList.add('flex');
                                }
                            }
                        });

                        stream.appendChild(item);
                    });
                }

            } catch (err) {
                console.error("Map Data Fetch Error:", err);
                const stream = document.getElementById('alerts-container');
                if (stream) {
                    stream.innerHTML = '<div class="p-4 text-center text-red-400 text-[10px] border border-red-500/20 bg-red-500/10 rounded uppercase tracking-wider font-bold">API DISCONNECTED - OFFLINE MODE</div>';
                }
            }
        };

        // Call the fetch function
        setTimeout(fetchLiveDisasters, 1000);

    } catch (e) {
        console.error("Map error", e);
    }
});
