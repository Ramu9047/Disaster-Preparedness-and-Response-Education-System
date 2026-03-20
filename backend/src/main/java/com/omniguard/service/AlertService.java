package com.omniguard.service;

import com.omniguard.model.Alert;
import com.omniguard.repository.AlertRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Slf4j @Service @RequiredArgsConstructor
public class AlertService {

    private final AlertRepository repo;

    public List<Alert> getAll()    { return repo.findAllByOrderByTimestampDesc(); }
    public List<Alert> getLatest() { return repo.findTop20ByOrderByTimestampDesc(); }

    public Alert create(Map<String, Object> body, String sentBy) {
        Alert alert = Alert.builder()
                .type((String) body.getOrDefault("type", "HIGH"))
                .title((String) body.getOrDefault("title", "Alert"))
                .message((String) body.getOrDefault("message", ""))
                .sentBy(sentBy)
                .targetArea((String) body.getOrDefault("targetArea", "All Areas"))
                .sent(true)
                .build();
        Alert saved = repo.save(alert);
        log.info("Alert broadcast: [{}] {} by {}", saved.getType(), saved.getTitle(), sentBy);
        return saved;
    }
}
