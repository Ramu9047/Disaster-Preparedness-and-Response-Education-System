package com.omniguard.repository;

import com.omniguard.model.Task;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends MongoRepository<Task, String> {
    List<Task> findAllByOrderByCreatedAtDesc();
    List<Task> findByAssignedToOrderByCreatedAtDesc(String userId);
    List<Task> findByIncidentIdOrderByCreatedAtDesc(String incidentId);
    List<Task> findByAssignedByOrderByCreatedAtDesc(String officerId);
    List<Task> findByStatus(String status);
}
