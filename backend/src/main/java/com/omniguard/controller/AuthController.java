package com.omniguard.controller;

import com.omniguard.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /** POST /api/auth/login — { username, password } → { token, user } */
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> body) {
        Map<String, Object> result = authService.login(
                body.getOrDefault("username", ""),
                body.getOrDefault("password", "")
        );
        if (Boolean.FALSE.equals(result.get("success"))) {
            return ResponseEntity.status(401).body(result);
        }
        return ResponseEntity.ok(result);
    }

    /** POST /api/auth/register — { username, password, name?, district? } */
    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody Map<String, String> body) {
        Map<String, Object> result = authService.register(body);
        if (Boolean.FALSE.equals(result.get("success"))) {
            return ResponseEntity.badRequest().body(result);
        }
        return ResponseEntity.status(201).body(result);
    }

    /** GET /api/auth/profile — requires Authorization: Bearer <token> (interceptor sets userId) */
    @GetMapping("/profile")
    public ResponseEntity<Map<String, Object>> profile(HttpServletRequest req) {
        String userId = (String) req.getAttribute("userId");
        if (userId == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        return ResponseEntity.ok(authService.profile(userId));
    }
}
