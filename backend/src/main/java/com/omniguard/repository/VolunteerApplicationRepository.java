package com.omniguard.repository;

import com.omniguard.model.VolunteerApplication;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface VolunteerApplicationRepository extends MongoRepository<VolunteerApplication, String> {
    List<VolunteerApplication> findByStatus(String status);
}
