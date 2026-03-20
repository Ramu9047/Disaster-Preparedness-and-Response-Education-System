package com.omniguard.controller;

import com.omniguard.service.TaskService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService service;

    /** GET /api/tasks — scoped by role */
    @GetMapping
    public ResponseEntity<?> getAll(HttpServletRequest req) {
        String role   = (String) req.getAttribute("role");
        String userId = (String) req.getAttribute("userId");
        return switch (role) {
            case "RESCUE", "VOLUNTEER" -> ResponseEntity.ok(service.getByAssignee(userId));
            case "OFFICER"             -> ResponseEntity.ok(service.getByOfficer(userId));
            default                    -> ResponseEntity.ok(service.getAll()); // ADMIN
        };
    }

    /** GET /api/tasks/:id */
    @GetMapping("/{id}")
    public ResponseEntity<?> getOne(@PathVariable String id) {
        return service.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /** POST /api/tasks — ADMIN or OFFICER only */
    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, Object> body,
                                    HttpServletRequest req) {
        String role      = (String) req.getAttribute("role");
        String assignedBy = (String) req.getAttribute("userId");
        if ("CITIZEN".equals(role) || "RESCUE".equals(role) || "VOLUNTEER".equals(role)) {
            return ResponseEntity.status(403).body(Map.of("error", "Only ADMIN or OFFICER can assign tasks"));
        }
        return ResponseEntity.status(201).body(service.create(body, assignedBy));
    }

    /** PUT /api/tasks/:id — update status/notes (assignee or admin/officer) */
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable String id,
                                    @RequestBody Map<String, Object> body) {
        return service.update(id, body)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /** GET /api/tasks/overdue — tasks past escalation deadline */
    @GetMapping("/overdue")
    public ResponseEntity<?> overdue(HttpServletRequest req) {
        String role = (String) req.getAttribute("role");
        if (!"ADMIN".equals(role) && !"OFFICER".equals(role)) {
            return ResponseEntity.status(403).body(Map.of("error", "Not authorized"));
        }
        return ResponseEntity.ok(service.getOverdueForEscalation());
    }
}
