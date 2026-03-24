package com.omniguard.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.validation.constraints.NotBlank;
import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "volunteer_applications")
public class VolunteerApplication {

    @Id
    private String id;
    
    private String userId;

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Phone is required")
    private String phone;

    private List<String> skills;

    @Builder.Default
    private String status = "AWAITING_VERIFICATION"; // AWAITING_VERIFICATION, APPROVED, REJECTED

    @CreatedDate
    @Builder.Default
    private Instant submittedAt = Instant.now();
}
