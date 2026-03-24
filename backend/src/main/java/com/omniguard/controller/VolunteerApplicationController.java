package com.omniguard.controller;

import com.omniguard.model.VolunteerApplication;
import com.omniguard.service.VolunteerApplicationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
     * Get all applications for Command Center (Requires ADMIN role attribute from JWT)
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAll(jakarta.servlet.http.HttpServletRequest request) {
        String role = (String) request.getAttribute("role");
        if (!"ADMIN".equalsIgnoreCase(role)) {
            return ResponseEntity.status(403).body(Map.of("success", false, "message", "Forbidden: Admin access required."));
        }
        
        try {
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "data", service.getAllAsync()));
        } catch (Exception e) {
            log.error("Failed to load volunteers: {}", e.getMessage());
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "Failed to load applications."));
        }
    }

    /**
     * POST /api/volunteer-applications/{id}/approve
     * Approves application and grants VOLUNTEER role
     */
    @PostMapping("/{id}/approve")
    public ResponseEntity<Map<String, Object>> approve(@PathVariable String id, jakarta.servlet.http.HttpServletRequest request) {
        String role = (String) request.getAttribute("role");
        if (!"ADMIN".equalsIgnoreCase(role)) {
            return ResponseEntity.status(403).body(Map.of("success", false, "message", "Forbidden: Admin access required."));
        }

        try {
            VolunteerApplication saved = service.approve(id);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Application approved successfully.",
                    "data", saved));
        } catch (Exception e) {
            log.error("Approval error: {}", e.getMessage());
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "Failed to approve application."));
        }
    }

    /**
     * POST /api/volunteer-applications/{id}/reject
     * Rejects application
     */
    @PostMapping("/{id}/reject")
    public ResponseEntity<Map<String, Object>> reject(@PathVariable String id, jakarta.servlet.http.HttpServletRequest request) {
        String role = (String) request.getAttribute("role");
        if (!"ADMIN".equalsIgnoreCase(role)) {
            return ResponseEntity.status(403).body(Map.of("success", false, "message", "Forbidden: Admin access required."));
        }

        try {
            VolunteerApplication saved = service.reject(id);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Application rejected successfully.",
                    "data", saved));
        } catch (Exception e) {
            log.error("Rejection error: {}", e.getMessage());
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "Failed to reject application."));
        }
    }
}
