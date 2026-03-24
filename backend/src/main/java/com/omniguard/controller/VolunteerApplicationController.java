package com.omniguard.controller;

import com.omniguard.model.VolunteerApplication;
import com.omniguard.service.VolunteerApplicationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/volunteer-applications")
@RequiredArgsConstructor
public class VolunteerApplicationController {

    private final VolunteerApplicationService service;

    /**
     * POST /api/volunteer-applications
     * Submit a new volunteer application
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> submit(@Valid @RequestBody VolunteerApplication app) {
        try {
            VolunteerApplication saved = service.submit(app);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Application submitted successfully.",
                    "data", saved));
        } catch (Exception e) {
            log.error("Volunteer application error: {}", e.getMessage());
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "Application submission failed."));
        }
    }

    /**
     * GET /api/volunteer-applications
     * Get all applications for Command Center (Requires auth in interceptor)
     */
    @GetMapping
    public ResponseEntity<List<VolunteerApplication>> getAll() {
        return ResponseEntity.ok(service.getAllAsync());
    }

    /**
     * POST /api/volunteer-applications/{id}/approve
     * Approves application and grants VOLUNTEER role
     */
    @PostMapping("/{id}/approve")
    public ResponseEntity<VolunteerApplication> approve(@PathVariable String id) {
        return ResponseEntity.ok(service.approve(id));
    }

    /**
     * POST /api/volunteer-applications/{id}/reject
     * Rejects application
     */
    @PostMapping("/{id}/reject")
    public ResponseEntity<VolunteerApplication> reject(@PathVariable String id) {
        return ResponseEntity.ok(service.reject(id));
    }
}
