package com.omniguard.config;

import com.omniguard.security.JwtInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Registers JwtInterceptor on all /api/** paths EXCEPT the public ones.
 */
@Configuration
@RequiredArgsConstructor
@SuppressWarnings("null")
public class WebMvcConfig implements WebMvcConfigurer {

    private final JwtInterceptor jwtInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(jwtInterceptor)
                .addPathPatterns("/api/**")
                .excludePathPatterns(
                        // Public — no token needed
                        "/api/auth/**",
                        "/api/health",
                        "/api/earthquakes",
                        "/api/chat/**",
                        "/api/disasters",          // public read (map)
                        "/api/disasters/report",   // public submit
                        "/api/alerts",             // public read
                        "/api/resources"           // public read
                );
    }
}
