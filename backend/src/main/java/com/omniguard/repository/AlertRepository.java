package com.omniguard.repository;

import com.omniguard.model.Alert;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AlertRepository extends MongoRepository<Alert, String> {
    List<Alert> findAllByOrderByTimestampDesc();
    List<Alert> findTop20ByOrderByTimestampDesc();
}
