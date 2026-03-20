package com.omniguard.repository;

import com.omniguard.model.Resource;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourceRepository extends MongoRepository<Resource, String> {
    List<Resource> findByAvailable(boolean available);
    List<Resource> findByType(String type);
}
