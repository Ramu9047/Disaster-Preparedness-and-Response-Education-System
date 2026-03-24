package com.omniguard.controller;

import com.omniguard.model.ContactMessage;
import com.omniguard.service.ContactService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/contact")
@RequiredArgsConstructor
public class ContactController {

    private final ContactService contactService;

    /**
     * POST /api/contact
     * Saves contact form to MongoDB
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> submit(@Valid @RequestBody ContactMessage message) {
        try {
            ContactMessage saved = contactService.save(message);
            log.info("[POST /api/contact] Saved message id={}", saved.getId());
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Transmission successful. We will respond shortly."));
        } catch (Exception e) {
            log.error("Contact form error: {}", e.getMessage());
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "Transmission failed. Please try again."));
        }
    }

    /**
     * GET /api/contact
     * Loads all transmissions for the Command Center
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
                    "data", contactService.getAll()));
        } catch (Exception e) {
            log.error("Failed to load contacts: {}", e.getMessage());
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "Failed to load messages."));
        }
    }
}
