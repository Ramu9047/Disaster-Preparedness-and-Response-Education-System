package com.omniguard.repository;

import com.omniguard.model.Incident;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IncidentRepository extends MongoRepository<Incident, String> {
    List<Incident> findAllByOrderByTimestampDesc();
    List<Incident> findByReportedByOrderByTimestampDesc(String reportedBy);
    List<Incident> findByStatusNot(String status);
    List<Incident> findByAssignedOfficerIdOrderByTimestampDesc(String officerId);
}
