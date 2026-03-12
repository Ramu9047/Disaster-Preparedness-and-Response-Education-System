package com.omniguard.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class DisasterService {

    private final WebClient webClient;

    private static final String USGS_URL =
            "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";

    /**
     * Proxy and return USGS earthquake data.
     */
    public Map<?, ?> getEarthquakes() {
        try {
            Map<?, ?> data = webClient.get()
                    .uri(USGS_URL)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            if (data == null) {
                throw new RuntimeException("Empty response from USGS");
            }
            return data;
        } catch (Exception e) {
            log.error("Failed to fetch USGS earthquake data: {}", e.getMessage());
            throw new RuntimeException("Failed to fetch earthquake data from USGS: " + e.getMessage());
        }
    }
}
