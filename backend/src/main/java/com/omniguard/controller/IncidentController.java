package com.omniguard.controller;

import com.omniguard.service.IncidentService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/incidents")
@RequiredArgsConstructor
public class IncidentController {

    private final IncidentService service;

    /** GET /api/incidents — all incidents (protected) */
    @GetMapping
    public ResponseEntity<?> getAll(@RequestParam(required = false) String filter,
                                    HttpServletRequest req) {
        String role = (String) req.getAttribute("role");
        String userId = (String) req.getAttribute("userId");
        if ("CITIZEN".equals(role)) {
            return ResponseEntity.ok(service.getByReporter(userId));
        }
        return ResponseEntity.ok("active".equals(filter) ? service.getActive() : service.getAll());
    }

    /** GET /api/incidents/:id */
    @GetMapping("/{id}")
    public ResponseEntity<?> getOne(@PathVariable String id) {
        return service.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /** POST /api/incidents — create (any logged-in user can report) */
    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, Object> body,
                                    HttpServletRequest req) {
        String userId      = (String) req.getAttribute("userId");
        String username    = (String) req.getAttribute("username");
        var incident = service.create(body, userId, username);
        return ResponseEntity.status(201).body(incident);
    }

    /** PUT /api/incidents/:id — update status/assignment (OFFICER/ADMIN) */
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable String id,
                                    @RequestBody Map<String, Object> body,
                                    HttpServletRequest req) {
        String role = (String) req.getAttribute("role");
        if ("CITIZEN".equals(role) || "VOLUNTEER".equals(role)) {
            return ResponseEntity.status(403).body(Map.of("error", "Insufficient permissions"));
        }
        return service.update(id, body)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
