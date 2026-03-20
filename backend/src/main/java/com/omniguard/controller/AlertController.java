package com.omniguard.controller;

import com.omniguard.service.AlertService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/alerts")
@RequiredArgsConstructor
public class AlertController {

    private final AlertService service;

    /** GET /api/alerts — public, returns latest 20 */
    @GetMapping
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok(service.getLatest());
    }

    /** POST /api/alerts — ADMIN or OFFICER only (interceptor will validate token for auth routes) */
    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, Object> body,
                                    HttpServletRequest req) {
        // sentBy from JWT (interceptor attaches it for protected paths)
        String sentBy = req.getAttribute("userId") != null
                ? (String) req.getAttribute("userId") : "system";
        String role = req.getAttribute("role") != null
                ? (String) req.getAttribute("role") : "";
        if (!"ADMIN".equals(role) && !"OFFICER".equals(role)) {
            return ResponseEntity.status(403).body(Map.of("error", "Only ADMIN or OFFICER can broadcast alerts"));
        }
        return ResponseEntity.status(201).body(service.create(body, sentBy));
    }
}
