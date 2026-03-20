package com.omniguard.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
@Document(collection = "resources")
public class Resource {

    @Id
    private String id;

    private String name;
    private String type;        // Shelter | Medical | Food | Equipment | Rescue Team
    private String location;    // human-readable
    private double[] coordinates; // [lng, lat]
    private boolean available;
    private int capacity;
    private String contact;
}
