package com.omniguard.service;

import com.omniguard.model.Resource;
import com.omniguard.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Slf4j @Service @RequiredArgsConstructor
public class ResourceService {

    private final ResourceRepository repo;

    public List<Resource> getAll()           { return repo.findAll(); }
    public List<Resource> getAvailable()     { return repo.findByAvailable(true); }
    public List<Resource> getByType(String t){ return repo.findByType(t); }

    public Optional<Resource> update(String id, Map<String, Object> updates) {
        return repo.findById(id).map(r -> {
            if (updates.containsKey("available")) {
                Object v = updates.get("available");
                r.setAvailable(v instanceof Boolean b ? b : Boolean.parseBoolean(v.toString()));
            }
            if (updates.containsKey("capacity"))
                r.setCapacity(((Number) updates.get("capacity")).intValue());
            return repo.save(r);
        });
    }
}
