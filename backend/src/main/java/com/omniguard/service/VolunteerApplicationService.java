package com.omniguard.service;

import com.omniguard.model.VolunteerApplication;
import com.omniguard.repository.VolunteerApplicationRepository;
import com.omniguard.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class VolunteerApplicationService {

    private final VolunteerApplicationRepository repository;
    private final UserRepository userRepository;

    public VolunteerApplication submit(VolunteerApplication app) {
        VolunteerApplication saved = repository.save(app);
        log.info("Volunteer application saved: id={}", saved.getId());
        return saved;
    }

    public List<VolunteerApplication> getAllAsync() {
        return repository.findAll();
    }

    public VolunteerApplication approve(String id) {
        VolunteerApplication app = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found"));
        
        app.setStatus("APPROVED");
        VolunteerApplication saved = repository.save(app);
        
        log.info("Volunteer application approved: id={}, userId={}", id, app.getUserId());

        if (app.getUserId() != null) {
            userRepository.findById(app.getUserId()).ifPresent(u -> {
                u.setRole("VOLUNTEER");
                userRepository.save(u);
                log.info("User {} promoted to VOLUNTEER", u.getUsername());
            });
        }

        return saved;
    }

    public VolunteerApplication reject(String id) {
        VolunteerApplication app = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found"));
        app.setStatus("REJECTED");
        return repository.save(app);
    }
}
