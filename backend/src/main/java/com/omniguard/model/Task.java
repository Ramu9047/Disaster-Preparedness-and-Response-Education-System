package com.omniguard.model;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
@Document(collection = "tasks")
public class Task {

    @Id
    private String id;

    private String title;
    private String description;
    private String priority;       // HIGH | MEDIUM | LOW
    private String status;         // PENDING | IN_PROGRESS | COMPLETED | ESCALATED
    private String incidentId;     // Incident.id
    private String assignedTo;     // User.id (RESCUE / VOLUNTEER)
    private String assignedBy;     // User.id (OFFICER / ADMIN)
    private String notes;

    private Instant escalateAt;    // auto-escalate deadline

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}
