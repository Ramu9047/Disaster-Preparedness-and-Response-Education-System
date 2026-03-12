package com.omniguard.controller;

import com.omniguard.service.DisasterService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class DisasterController {

    private final DisasterService disasterService;

    /**
     * GET /api/earthquakes
     * Proxies USGS GeoJSON earthquake feed
     */
    @GetMapping("/earthquakes")
    public ResponseEntity<?> getEarthquakes() {
        try {
            Map<?, ?> data = disasterService.getEarthquakes();
            return ResponseEntity.ok(data);
        } catch (Exception e) {
            log.error("Earthquake fetch failed: {}", e.getMessage());
            return ResponseEntity.status(500)
                    .body(Map.of("error", "Failed to fetch earthquake data: " + e.getMessage()));
        }
    }

    /**
     * GET /api/health
     * Application health check
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(Map.of(
                "status", "OPERATIONAL",
                "service", "OmniGuard AI Backend",
                "timestamp", java.time.Instant.now().toString()
        ));
    }
}
