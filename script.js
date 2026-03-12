// ==============================================
// 1. ADVANCED MAP LOGIC (NDEM INSPIRED)
// ==============================================

// Initialize map centered on India (like NDEM)
const map = L.map('map', {
    zoomControl: false // Custom position
}).setView([22.5937, 78.9629], 5);

// Add custom zoom control position
L.control.zoom({
    position: 'bottomright'
}).addTo(map);

// Premium Map Tiles (CartoDB Dark Matter for advanced/professional look)
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20
}).addTo(map);

// Layer Groups
const earthquakeLayer = L.layerGroup();
const fireLayer = L.markerClusterGroup({
    iconCreateFunction: function (cluster) {
        return L.divIcon({ html: '<div><span>' + cluster.getChildCount() + '</span></div>', className: 'marker-cluster marker-cluster-small cluster-fire', iconSize: L.point(40, 40) });
    }
});
const floodLayer = L.markerClusterGroup({
    iconCreateFunction: function (cluster) {
        return L.divIcon({ html: '<div><span>' + cluster.getChildCount() + '</span></div>', className: 'marker-cluster marker-cluster-small cluster-flood', iconSize: L.point(40, 40) });
    }
});

let liveAlertsData = []; // Store alerts to render in sidebar

// Icons
const createAlertIcon = (colorClass, iconClass) => {
    return L.divIcon({
        className: 'custom-div-icon',
        html: `<div class="w-8 h-8 rounded-full ${colorClass} flex items-center justify-center border-2 border-white shadow-[0_0_15px_rgba(255,255,255,0.3)] animate-pulse">
                <i class="${iconClass} text-white text-xs"></i>
               </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
    });
};

const iconFire = createAlertIcon('bg-orange-500', 'fa-solid fa-fire');
const iconFlood = createAlertIcon('bg-blue-500', 'fa-solid fa-water');

// Update UI Time
setInterval(() => {
    document.getElementById('map-time').textContent = new Date().toLocaleString();
}, 1000);

// Fetch Real Earthquakes (USGS API)
async function loadEarthquakes() {
    try {
        const res = await fetch("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_day.geojson");
        const data = await res.json();
        const earthquakes = data.features.filter(eq => eq.geometry.coordinates[0] > 60 && eq.geometry.coordinates[0] < 100 && eq.geometry.coordinates[1] > 5 && eq.geometry.coordinates[1] < 40); // Filter approx around India

        earthquakes.forEach(eq => {
            const mag = eq.properties.mag;
            const place = eq.properties.place;
            const lat = eq.geometry.coordinates[1];
            const lon = eq.geometry.coordinates[0];

            let color = mag >= 6 ? "#ef4444" : mag >= 5 ? "#f97316" : "#eab308";
            let severity = mag >= 6 ? "Warning" : mag >= 5 ? "Alert" : "Watch";
            let alertClass = mag >= 6 ? "alert-warning" : mag >= 5 ? "alert-alert" : "alert-watch";

            // Map Marker
            const marker = L.circle([lat, lon], {
                color: color, fillColor: color, fillOpacity: 0.5, radius: mag * 20000, weight: 2
            }).bindPopup(`
                <div class="font-inter">
                    <b class="text-${mag >= 6 ? 'red' : 'orange'}-400 uppercase text-xs tracking-wider">${severity}: Earthquake</b><br>
                    <span class="text-white text-lg font-bold">Magnitude ${mag.toFixed(1)}</span><br>
                    <span class="text-gray-300 text-xs">${place}</span>
                </div>
            `).addTo(earthquakeLayer);

            marker.on('click', () => {
                const titleEl = document.getElementById('contextTitle');
                const detailsEl = document.getElementById('contextDetails');
                if (titleEl && detailsEl) {
                    titleEl.innerText = `${severity}: Earthquake - ${place}`;
                    detailsEl.innerHTML = `<strong>Magnitude:</strong> ${mag.toFixed(1)}<br><strong>Location:</strong> ${lat.toFixed(4)}, ${lon.toFixed(4)}<br><strong>System:</strong> Active Telemetry<br><strong>Protocol:</strong> Drop, Cover, Hold On!`;
                }
            });

            // Add to Alerts List
            liveAlertsData.push({
                type: 'Earthquake', severity, place, class: alertClass, icon: 'fa-house-crack', color: mag >= 6 ? 'text-red-400' : 'text-orange-400', lat, lon, mag
            });
        });

        map.addLayer(earthquakeLayer);
    } catch (e) {
        console.error("Earthquake load failed", e);
    }
}

// Generate Mock Forest Fires (Simulating NDEM hotspots)
function loadMockFires() {
    const fireHotspots = [
        { lat: 26.2, lon: 92.9, clusterCount: 45, place: 'Assam/Meghalaya Border Forests' },
        { lat: 18.2, lon: 82.3, clusterCount: 120, place: 'Eastern Ghats (Odisha)' },
        { lat: 19.5, lon: 80.5, clusterCount: 34, place: 'Gadchiroli Forest Belt' },
        { lat: 30.5, lon: 78.5, clusterCount: 12, place: 'Uttarakhand Pine Forests' }
    ];

    fireHotspots.forEach(spot => {
        // Generate random points around the hotspot to simulate cluster
        for (let i = 0; i < spot.clusterCount; i++) {
            let plat = spot.lat + (Math.random() - 0.5) * 1.5;
            let plon = spot.lon + (Math.random() - 0.5) * 1.5;
            let m = L.marker([plat, plon], { icon: iconFire })
                .bindPopup(`<b class="text-orange-400 uppercase text-xs">Active Hotspot</b><br><span class="text-white">Detected via MODIS sensor</span><br><span class="text-gray-400 text-xs">${spot.place} Region</span>`)
                .addTo(fireLayer);

            m.on('click', () => {
                const titleEl = document.getElementById('contextTitle');
                const detailsEl = document.getElementById('contextDetails');
                if (titleEl && detailsEl) {
                    titleEl.innerText = `Forest Fire - ${spot.place}`;
                    detailsEl.innerHTML = `<strong>Status:</strong> Active Hotspot<br><strong>Cluster Count:</strong> ${spot.clusterCount}<br><strong>Protocol:</strong> Evacuate immediately if instructed. Monitor local channels.`;
                }
            });
        }
        liveAlertsData.push({ type: 'Forest Fire', severity: 'Alert', place: spot.place, class: 'alert-alert', icon: 'fa-fire', color: 'text-orange-400', lat: spot.lat, lon: spot.lon });
    });

    map.addLayer(fireLayer);
}

// Generate Mock Floods/Cyclones
function loadMockFloods() {
    const floods = [
        { lat: 26.8, lon: 88.3, place: 'Teesta River Basin, West Bengal', severity: 'Warning' },
        { lat: 16.5, lon: 81.3, place: 'Godavari Basin, Andhra', severity: 'Alert' },
        { lat: 19.0, lon: 73.0, place: 'Mumbai Coastal Surge', severity: 'Watch' }
    ];

    floods.forEach(flood => {
        let m = L.marker([flood.lat, flood.lon], { icon: iconFlood })
            .bindPopup(`<b class="text-blue-400 uppercase text-xs">${flood.severity}: Hydrological</b><br><span class="text-white">Near Real-Time Flood Inundation</span><br><span class="text-gray-400 text-xs">${flood.place}</span>`)
            .addTo(floodLayer);

        m.on('click', () => {
            const titleEl = document.getElementById('contextTitle');
            const detailsEl = document.getElementById('contextDetails');
            if (titleEl && detailsEl) {
                titleEl.innerText = `${flood.severity} - ${flood.place}`;
                detailsEl.innerHTML = `<strong>Type:</strong> Hydrological / Flood<br><strong>Location:</strong> ${flood.lat.toFixed(2)}, ${flood.lon.toFixed(2)}<br><strong>Protocol:</strong> Evacuate low lying areas. Do not cross flooded roads.`;
            }
        });

        let alertClass = flood.severity === 'Warning' ? 'alert-warning' : flood.severity === 'Alert' ? 'alert-alert' : 'alert-watch';
        let colorClass = flood.severity === 'Warning' ? 'text-red-400' : 'text-blue-400';

        liveAlertsData.push({ type: 'Flood Alert', severity: flood.severity, place: flood.place, class: alertClass, icon: 'fa-water', color: colorClass, lat: flood.lat, lon: flood.lon });
    });

    map.addLayer(floodLayer);
}

// Render Dashboard Alerts
function renderAlertsDashboard() {
    const container = document.getElementById('alerts-container');
    container.innerHTML = '';

    if (liveAlertsData.length === 0) {
        container.innerHTML = '<div class="text-center text-gray-500 text-xs">No active alerts.</div>';
        return;
    }

    // Sort by severity (Warning -> Alert -> Watch)
    const severityMap = { 'Warning': 3, 'Alert': 2, 'Watch': 1 };
    liveAlertsData.sort((a, b) => severityMap[b.severity] - severityMap[a.severity]);

    liveAlertsData.forEach(alert => {
        const item = document.createElement('div');
        item.className = `alert-card ${alert.class} bg-white/5 p-3 rounded-lg border border-white/10 cursor-pointer`;
        item.innerHTML = `
            <div class="flex items-center justify-between mb-1">
                <span class="${alert.color} font-bold text-xs uppercase tracking-wider flex items-center">
                    <i class="fa-solid ${alert.icon} mr-1.5"></i> ${alert.severity}: ${alert.type}
                </span>
                <span class="text-[10px] text-gray-400 bg-gray-800 px-1.5 py-0.5 rounded">LIVE</span>
            </div>
            <p class="text-gray-300 text-xs leading-relaxed truncate" title="${alert.place}">${alert.place}</p>
        `;

        item.addEventListener('click', () => {
            if (alert.lat && alert.lon) map.flyTo([alert.lat, alert.lon], 7, { animate: true });

            const titleEl = document.getElementById('contextTitle');
            const detailsEl = document.getElementById('contextDetails');
            if (titleEl && detailsEl) {
                titleEl.innerText = `${alert.severity}: ${alert.type} - ${alert.place}`;
                detailsEl.innerHTML = `<strong>Location:</strong> ${alert.place} <br><strong>Priority:</strong> ${alert.severity} <br><strong>Live Impact:</strong> Please refer to field ops.`;
            }
        });
        container.appendChild(item);
    });
}

// Initialize Map Subsystems
async function initMapData() {
    // Show Loader
    document.getElementById('map-loader').style.display = 'flex';

    await loadEarthquakes();
    loadMockFires();
    loadMockFloods();
    renderAlertsDashboard();

    // Hide Loader
    setTimeout(() => {
        document.getElementById('map-loader').style.opacity = '0';
        setTimeout(() => document.getElementById('map-loader').style.display = 'none', 500);
    }, 1000);
}

initMapData();

// Layer Toggles Custom UI Logic
document.getElementById('toggle-earthquakes').addEventListener('change', function () {
    this.checked ? map.addLayer(earthquakeLayer) : map.removeLayer(earthquakeLayer);
});
document.getElementById('toggle-fires').addEventListener('change', function () {
    this.checked ? map.addLayer(fireLayer) : map.removeLayer(fireLayer);
});
document.getElementById('toggle-floods').addEventListener('change', function () {
    this.checked ? map.addLayer(floodLayer) : map.removeLayer(floodLayer);
});

// Interactive Dashboard Accordions
document.querySelectorAll('.module-group button').forEach(button => {
    button.addEventListener('click', () => {
        const content = button.nextElementSibling;
        const icon = button.querySelector('.fa-chevron-down, .fa-chevron-up');

        if (content.style.maxHeight) {
            content.style.maxHeight = null;
            content.style.opacity = '0';
            content.style.margin = '0';
            content.style.overflow = 'hidden';
            icon.classList.replace('fa-chevron-up', 'fa-chevron-down');
        } else {
            content.style.maxHeight = content.scrollHeight + "px";
            content.style.opacity = '1';
            content.style.marginTop = '0.5rem';
            icon.classList.replace('fa-chevron-down', 'fa-chevron-up');
        }
    });
});

// Init Accordions (Open Current Scenarios by default)
setTimeout(() => {
    const currentScenarioBtn = document.querySelectorAll('.module-group button')[1];
    if (currentScenarioBtn) {
        const content = currentScenarioBtn.nextElementSibling;
        content.style.maxHeight = content.scrollHeight + 500 + "px"; // padding
        content.style.opacity = '1';
    }
}, 1500);

// ==============================================
// LAYER MANAGER COLLAPSIBLE LOGIC 
// ==============================================

const layerHeader = document.getElementById('layer-manager-header');
const layerContent = document.getElementById('layer-manager-content');
const layerToggleIcon = document.getElementById('layer-manager-toggle-icon');

if (layerHeader && layerContent && layerToggleIcon) {
    // Load stored state (default expanded)
    const storedState = localStorage.getItem('ndem_layer_manager_collapsed');
    const isLayerCollapsed = storedState === 'true';

    // Immediately apply state on load to prevent jumping
    if (isLayerCollapsed) {
        layerContent.classList.add('collapsed');
        layerToggleIcon.classList.replace('fa-minus', 'fa-plus');
        layerToggleIcon.style.transform = 'rotate(-180deg)';
        layerHeader.classList.replace('mb-3', 'mb-0');
    }

    // Attach click listener
    const toggleButton = document.getElementById('layer-manager-toggle-btn');

    const toggleLayerManager = (e) => {
        // Prevent event bubbling if clicked from inner button
        e.stopPropagation();

        layerContent.classList.toggle('collapsed');

        // Check if it is currently collapsed
        const currentlyCollapsed = layerContent.classList.contains('collapsed');

        // Save to localStorage
        localStorage.setItem('ndem_layer_manager_collapsed', currentlyCollapsed);

        // Update Icons and Spacing
        if (currentlyCollapsed) {
            layerToggleIcon.classList.replace('fa-minus', 'fa-plus');
            layerToggleIcon.style.transform = 'rotate(-180deg)';
            layerHeader.classList.replace('mb-3', 'mb-0');
        } else {
            layerToggleIcon.classList.replace('fa-plus', 'fa-minus');
            layerToggleIcon.style.transform = 'rotate(0deg)';
            layerHeader.classList.replace('mb-0', 'mb-3');
        }
    };

    // Attach event listeners to both the header and the specific button
    layerHeader.addEventListener('click', toggleLayerManager);
    if (toggleButton) toggleButton.addEventListener('click', toggleLayerManager);
} else {
    console.error("Layer Manager DOM elements not found!");
}

// ==============================================
// 2. CHATBOT SYSTEM (Adapted for modern UI)
// ==============================================

const chatbotConfig = {
    aiMode: 'gemini',
    backendEndpoint: 'http://localhost:3000/api/chat',
    requestTimeout: 15000
};

// ... (Keep existing knowledgeBase exactly as it was)
const knowledgeBase = {
    earthquake: {
        keywords: ['earthquake', 'quake', 'tremor', 'seismic', 'shake'],
        response: `🌍 **EARTHQUAKE SAFETY TIPS**\n\n**During an Earthquake:**\n• DROP to your hands and knees\n• COVER your head and neck under sturdy furniture\n• HOLD ON until the shaking stops\n\n**After an Earthquake:**\n• Expect aftershocks\n• Check for injuries and damage\n• Use flashlights, not candles\n• Stay away from damaged buildings`
    },
    flood: {
        keywords: ['flood', 'flooding', 'water', 'tsunami', 'deluge'],
        response: `🌊 **FLOOD SAFETY TIPS**\n\n**Before a Flood:**\n• Know your area's flood risk\n• Keep emergency supplies ready\n• Move valuables to higher floors\n\n**During a Flood:**\n• NEVER walk or drive through flood water\n• Move to higher ground immediately\n• Avoid bridges over flowing water\n• Stay away from downed power lines`
    },
    cyclone: {
        keywords: ['cyclone', 'hurricane', 'typhoon', 'storm', 'tornado', 'wind'],
        response: `🌪️ **CYCLONE/TORNADO SAFETY**\n\n**Before the Storm:**\n• Know your evacuation zone\n• Trim trees and secure outdoor items\n• Reinforce windows and doors\n\n**During the Storm:**\n• Stay indoors away from windows\n• Listen to emergency broadcasts\n• Use flashlights, not candles`
    },
    fire: {
        keywords: ['fire', 'wildfire', 'burn', 'smoke', 'flame', 'evacuation'],
        response: `🔥 **FIRE EMERGENCY TIPS**\n\n**Fire Prevention:**\n• Install smoke alarms monthly\n• Keep flammable items away from heat\n\n**During a Fire:**\n• GET OUT first - never delay\n• Feel doors before opening\n• Stay low to avoid smoke\n• Use stairs, not elevators\n\n**If Trapped:**\n• Call 911 if possible\n• Seal cracks with wet cloths\n• Signal from windows\n• Stay near the floor`
    }
};

const defaultResponses = [
    "I'm assisting with disaster safety! Try typing keywords like 'earthquake', 'flood', or 'fire'."
];

const chatToggle = document.getElementById('chat-toggle');
const chatWindow = document.getElementById('chat-window');
const chatClose = document.getElementById('chat-close');
const chatIcon = document.getElementById('chat-icon');
const closeIcon = document.getElementById('close-icon');
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');
const chatMessages = document.getElementById('chat-messages');
const typingIndicator = document.getElementById('typing-indicator');

let isChatOpen = false;

function toggleChat() {
    isChatOpen = !isChatOpen;
    if (isChatOpen) {
        chatWindow.classList.remove('hidden');
        // trigger animation
        setTimeout(() => {
            chatWindow.classList.remove('scale-95', 'opacity-0');
            chatWindow.classList.add('scale-100', 'opacity-100');
        }, 10);
        chatIcon.classList.add('hidden');
        closeIcon.classList.remove('hidden');
        chatInput.focus();
    } else {
        chatWindow.classList.remove('scale-100', 'opacity-100');
        chatWindow.classList.add('scale-95', 'opacity-0');
        setTimeout(() => {
            chatWindow.classList.add('hidden');
        }, 300);
        chatIcon.classList.remove('hidden');
        closeIcon.classList.add('hidden');
    }
}

function addMessage(text, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `flex ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in-up`;

    // Convert newlines to breaks and bold to strong
    const formattedText = text.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    if (isUser) {
        messageDiv.innerHTML = `
            <div class="user-bubble text-white rounded-2xl rounded-tr-sm px-4 py-3 max-w-[85%] text-sm leading-relaxed shadow-lg">
                ${formattedText}
            </div>
        `;
    } else {
        messageDiv.innerHTML = `
            <div class="bot-bubble backdrop-blur-md bg-white/10 border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%] shadow-lg">
                <p class="text-gray-200 text-sm leading-relaxed">${formattedText}</p>
            </div>
        `;
    }

    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Show/Hide Typing UI
function showTypingIndicator() {
    typingIndicator.classList.remove('hidden');
    chatMessages.scrollTop = chatMessages.scrollHeight;
}
function hideTypingIndicator() {
    typingIndicator.classList.add('hidden');
}

// Processing Logic
async function processMessage(message) {
    const lowerMessage = message.toLowerCase();

    for (const [topic, data] of Object.entries(knowledgeBase)) {
        for (const keyword of data.keywords) {
            if (lowerMessage.includes(keyword)) {
                return { text: data.response, isAI: false };
            }
        }
    }

    if (chatbotConfig.aiMode === 'gemini') {
        const aiResponse = await getGeminiResponse(message);
        return { text: aiResponse.text, isAI: true, source: aiResponse.source };
    }
    return { text: defaultResponses[0], isAI: false };
}

async function getGeminiResponse(message) {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), chatbotConfig.requestTimeout);
        const response = await fetch(chatbotConfig.backendEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: message }),
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (!response.ok) throw new Error(`Backend error`);
        const data = await response.json();
        return { text: data.response, source: data.source };
    } catch (error) {
        return {
            text: `⚠️ **System Fallback**\n\nAI assessment cluster unreachable. Immediate safety overrides enabled:\n• Dial 911 for emergencies.\n• Follow preloaded protocols (type "fire", "flood", "earthquake").`,
            source: 'fallback'
        };
    }
}

async function handleSendMessage() {
    const message = chatInput.value.trim();
    if (!message) return;

    addMessage(message, true);
    chatInput.value = '';

    chatInput.disabled = true;
    sendBtn.classList.add('opacity-50', 'cursor-not-allowed');
    showTypingIndicator();

    try {
        const result = await processMessage(message);
        hideTypingIndicator();
        let display = result.text;
        if (result.isAI && result.source === 'gemini') display += '\n\n<span class="text-[10px] text-blue-400 font-mono tracking-wider"><i class="fa-solid fa-robot mr-1"></i>VERIFIED BY AI ASSESSOR</span>';
        addMessage(display, false);
    } catch (e) {
        hideTypingIndicator();
        addMessage("Transmission error. Please consult local emergency channels.", false);
    } finally {
        chatInput.disabled = false;
        sendBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        setTimeout(() => chatInput.focus(), 100);
    }
}

// Events
chatToggle.addEventListener('click', toggleChat);
chatClose.addEventListener('click', toggleChat);
sendBtn.addEventListener('click', handleSendMessage);
chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSendMessage();
});
document.querySelectorAll('.quick-reply-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        chatInput.value = btn.dataset.query;
        handleSendMessage();
    });
});
