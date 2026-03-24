package com.omniguard.service;

import com.omniguard.model.User;
import com.omniguard.repository.UserRepository;
import com.omniguard.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class AuthService {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final BCryptPasswordEncoder passwordEncoder;

    /**
     * Login — matches hashed password and returns a JWT + safe user object.
     */
    public Map<String, Object> login(String username, String password) {
        Optional<User> opt = userRepository.findByUsername(username);
        if (opt.isEmpty()) {
            return Map.of("success", false, "error", "User not found");
        }
        User user = opt.get();
        if (!passwordEncoder.matches(password, user.getPassword())) {
            return Map.of("success", false, "error", "Invalid credentials");
        }
        String token = jwtUtil.generateToken(user.getId(), user.getUsername(), user.getRole());
        log.info("Login: {} ({})", username, user.getRole());
        return Map.of(
                "success", true,
                "token",   token,
                "user",    safeUser(user)
        );
    }

    /**
     * Register a new user (CITIZEN by default unless seeded).
     */
    public Map<String, Object> register(Map<String, String> body) {
        String username = body.getOrDefault("username", "").trim();
        String password = body.getOrDefault("password", "").trim();
        String name     = body.getOrDefault("name", username).trim();
        String role     = body.getOrDefault("role", "CITIZEN");
        String district = body.getOrDefault("district", "");

        if (username.isBlank() || password.length() < 6) {
            return Map.of("success", false, "error", "Username and password (min 6 chars) required");
        }
        if (userRepository.existsByUsername(username)) {
            return Map.of("success", false, "error", "Username already taken");
        }

        // Only CITIZEN self-registration from public endpoint — admin seeding skips here
        String safeRole = "CITIZEN";
        if (System.getProperty("seeding") != null) safeRole = role; // internal seeder bypass

        User user = User.builder()
                .username(username)
                .password(passwordEncoder.encode(password))
                .name(name)
                .role(safeRole)
                .district(district)
                .avatar(name.isEmpty() ? "?" : String.valueOf(Character.toUpperCase(name.charAt(0))))
                .build();

        User saved = userRepository.save(user);
        String token = jwtUtil.generateToken(saved.getId(), saved.getUsername(), saved.getRole());
        return Map.of("success", true, "token", token, "user", safeUser(saved));
    }

    /**
     * Profile lookup by userId (from JWT subject).
     */
    public Map<String, Object> profile(String userId) {
        return userRepository.findById(userId)
                .map(u -> Map.<String, Object>of("success", true, "user", safeUser(u)))
                .orElse(Map.of("success", false, "error", "User not found"));
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    public Map<String, Object> safeUser(User u) {
        return Map.of(
                "id",       u.getId(),
                "username", u.getUsername(),
                "name",     nullSafe(u.getName()),
                "role",     nullSafe(u.getRole()),
                "avatar",   nullSafe(u.getAvatar()),
                "district", nullSafe(u.getDistrict()),
                "badge",    u.getBadge() != null ? u.getBadge() : ""
        );
    }

    private String nullSafe(String s) { return s == null ? "" : s; }

    public BCryptPasswordEncoder getEncoder() { return passwordEncoder; }
}
