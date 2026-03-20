package com.omniguard.model;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.GeoSpatialIndexType;
import org.springframework.data.mongodb.core.index.GeoSpatialIndexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
@Document(collection = "incidents")
public class Incident {

    @Id
    private String id;

    private String type;           // Flood | Cyclone | Fire | Earthquake | Building Collapse ...
    private String severity;       // CRITICAL | HIGH | MEDIUM | LOW
    private String location;       // Human-readable address
    private String description;
    private String reportedBy;     // User.id
    private String reporterName;
    private String status;         // REPORTED | ACKNOWLEDGED | RESOLVED

    // GeoJSON Point for $near queries: [lng, lat]
    @GeoSpatialIndexed(type = GeoSpatialIndexType.GEO_2DSPHERE)
    private double[] coordinates;  // [lng, lat]

    private String assignedOfficerId;

    @CreatedDate
    private Instant timestamp;

    @LastModifiedDate
    private Instant updatedAt;
}
