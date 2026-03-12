package com.omniguard.repository;

import com.omniguard.model.DisasterReport;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DisasterReportRepository extends MongoRepository<DisasterReport, String> {
    List<DisasterReport> findByTypeOrderByReportedAtDesc(String type);
    List<DisasterReport> findTop50ByOrderByReportedAtDesc();
}
