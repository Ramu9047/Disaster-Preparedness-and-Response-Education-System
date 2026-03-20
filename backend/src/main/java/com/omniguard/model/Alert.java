package com.omniguard.model;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
@Document(collection = "alerts")
public class Alert {

    @Id
    private String id;

    private String type;        // CRITICAL | HIGH | MEDIUM
    private String title;
    private String message;
    private String sentBy;      // User.id
    private String targetArea;  // free-text region descriptor
    private boolean sent;

    @CreatedDate
    private Instant timestamp;
}
