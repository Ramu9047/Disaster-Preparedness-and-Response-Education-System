package com.omniguard.security;

import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * Reads the Authorization: Bearer <token> header, validates it,
 * and stores extracted claims as request attributes so controllers
 * can call req.getAttribute("userId") etc.
 *
 * Protected endpoints are configured in WebMvcConfig.
 * Public paths (/api/auth/**, /api/health, /api/earthquakes, etc.) bypass this.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtInterceptor implements HandlerInterceptor {

    private final JwtUtil jwtUtil;

    @Override
    public boolean preHandle(HttpServletRequest request,
                             HttpServletResponse response,
                             Object handler) throws Exception {

        // Allow preflight (CORS OPTIONS)
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) return true;

        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"error\":\"Missing or invalid Authorization header\"}");
            response.setContentType("application/json");
            return false;
        }

        String token = header.substring(7);
        Claims claims = jwtUtil.validateToken(token);
        if (claims == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"error\":\"Token expired or invalid\"}");
            response.setContentType("application/json");
            return false;
        }

        // Attach user context to request for downstream controllers
        request.setAttribute("userId",   jwtUtil.extractUserId(claims));
        request.setAttribute("role",     jwtUtil.extractRole(claims));
        request.setAttribute("username", jwtUtil.extractUsername(claims));
        return true;
    }
}
