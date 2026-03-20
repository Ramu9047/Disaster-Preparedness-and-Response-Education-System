package com.omniguard.controller;

import com.omniguard.service.ResourceService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/resources")
@RequiredArgsConstructor
public class ResourceController {

    private final ResourceService service;

    /** GET /api/resources — public */
    @GetMapping
    public ResponseEntity<?> getAll(@RequestParam(required = false) String type,
                                    @RequestParam(required = false) Boolean available) {
        if (type != null) return ResponseEntity.ok(service.getByType(type));
        if (Boolean.TRUE.equals(available)) return ResponseEntity.ok(service.getAvailable());
        return ResponseEntity.ok(service.getAll());
    }

    /** PUT /api/resources/:id — ADMIN/OFFICER can update availability */
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable String id,
                                    @RequestBody Map<String, Object> body,
                                    HttpServletRequest req) {
        String role = (String) req.getAttribute("role");
        if (!"ADMIN".equals(role) && !"OFFICER".equals(role)) {
            return ResponseEntity.status(403).body(Map.of("error", "Not authorized"));
        }
        return service.update(id, body)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
