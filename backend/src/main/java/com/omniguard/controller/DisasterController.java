package com.omniguard.controller;

import com.omniguard.service.DisasterService;
import com.omniguard.service.IncidentService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class DisasterController {

    private final DisasterService disasterService;
    private final IncidentService incidentService;

    /** GET /api/earthquakes — proxies USGS GeoJSON (public) */
    @GetMapping("/earthquakes")
    public ResponseEntity<?> getEarthquakes() {
        try {
            return ResponseEntity.ok(disasterService.getEarthquakes());
        } catch (Exception e) {
            log.error("Earthquake fetch failed: {}", e.getMessage());
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    /** GET /api/disasters — recent user reports (public, used by map) */
    @GetMapping("/disasters")
    public ResponseEntity<?> getDisasters() {
        return ResponseEntity.ok(incidentService.getAll());
    }

    /** POST /api/disasters/report — public citizen report (no token required) */
    @PostMapping("/disasters/report")
    public ResponseEntity<?> reportDisaster(@RequestBody Map<String, Object> body,
                                            HttpServletRequest req) {
        // If user is authenticated, use their id; otherwise mark as anonymous
        String userId   = req.getAttribute("userId") != null ? (String) req.getAttribute("userId") : "anonymous";
        String username = req.getAttribute("username") != null ? (String) req.getAttribute("username") : "Public Report";
        var incident = incidentService.create(body, userId, username);
        return ResponseEntity.status(201).body(incident);
    }

    /** GET /api/health */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(Map.of(
                "status", "OPERATIONAL",
                "service", "OmniGuard AI Backend",
                "timestamp", java.time.Instant.now().toString()
        ));
    }
}
