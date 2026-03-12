package com.omniguard.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "disaster_reports")
public class DisasterReport {

    @Id
    private String id;

    private String type;          // earthquake | fire | flood | cyclone
    private Double magnitude;
    private String location;
    private Map<String, Double> coordinates; // { "lat": 0.0, "lng": 0.0 }
    private String description;
    private String source;        // usgs | user_report

    @CreatedDate
    private Instant reportedAt;
}
