package com.omniguard.model;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
@Document(collection = "users")
public class User {

    @Id
    private String id;

    @Indexed(unique = true)
    private String username;   // email / login handle

    private String password;   // BCrypt hashed
    private String name;
    private String role;       // ADMIN | OFFICER | RESCUE | VOLUNTEER | CITIZEN
    private String avatar;     // single letter
    private String district;
    private String badge;
    private String phone;

    // GeoJSON-compatible location (for 2dsphere if needed)
    private double[] location; // [lng, lat]

    @CreatedDate
    private Instant createdAt;

    /** Return a safe copy (no password) */
    public User withoutPassword() {
        User u = new User(id, "[REDACTED]", null, name, role, avatar, district, badge, phone, location, createdAt);
        return u;
    }
}
