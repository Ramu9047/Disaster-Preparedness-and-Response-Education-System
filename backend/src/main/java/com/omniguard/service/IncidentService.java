package com.omniguard.service;

import com.omniguard.model.Incident;
import com.omniguard.repository.IncidentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Slf4j @Service @RequiredArgsConstructor
public class IncidentService {

    private final IncidentRepository repo;

    public List<Incident> getAll() {
        return repo.findAllByOrderByTimestampDesc();
    }

    public List<Incident> getByReporter(String userId) {
        return repo.findByReportedByOrderByTimestampDesc(userId);
    }

    public List<Incident> getActive() {
        return repo.findByStatusNot("RESOLVED");
    }

    public Optional<Incident> getById(String id) {
        return repo.findById(id);
    }

    public Incident create(Map<String, Object> body, String reportedBy, String reporterName) {
        double[] coords = parseCoords(body);
        Incident inc = Incident.builder()
                .type((String) body.getOrDefault("type", "Unknown"))
                .severity((String) body.getOrDefault("severity", "MEDIUM"))
                .location((String) body.getOrDefault("location", ""))
                .description((String) body.getOrDefault("description", ""))
                .reportedBy(reportedBy)
                .reporterName(reporterName)
                .status("REPORTED")
                .coordinates(coords)
                .assignedOfficerId((String) body.get("assignedOfficerId"))
                .build();
        return repo.save(inc);
    }

    public Optional<Incident> update(String id, Map<String, Object> updates) {
        return repo.findById(id).map(inc -> {
            if (updates.containsKey("status"))           inc.setStatus((String) updates.get("status"));
            if (updates.containsKey("severity"))         inc.setSeverity((String) updates.get("severity"));
            if (updates.containsKey("assignedOfficerId")) inc.setAssignedOfficerId((String) updates.get("assignedOfficerId"));
            if (updates.containsKey("description"))      inc.setDescription((String) updates.get("description"));
            return repo.save(inc);
        });
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private double[] parseCoords(Map<String, Object> body) {
        try {
            double lat = toDouble(body.get("lat"));
            double lng = toDouble(body.get("lng"));
            return new double[]{lng, lat}; // MongoDB GeoJSON: [lng, lat]
        } catch (Exception e) {
            return new double[]{80.237, 13.067}; // default Chennai
        }
    }

    private double toDouble(Object v) {
        if (v instanceof Number n) return n.doubleValue();
        return Double.parseDouble(v.toString());
    }
}
