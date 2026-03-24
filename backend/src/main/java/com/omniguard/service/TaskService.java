package com.omniguard.service;

import com.omniguard.model.Task;
import com.omniguard.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Slf4j @Service @RequiredArgsConstructor
@SuppressWarnings("null")
public class TaskService {

    private final TaskRepository repo;

    public List<Task> getAll()                          { return repo.findAllByOrderByCreatedAtDesc(); }
    public List<Task> getByAssignee(String userId)      { return repo.findByAssignedToOrderByCreatedAtDesc(userId); }
    public List<Task> getByIncident(String incidentId)  { return repo.findByIncidentIdOrderByCreatedAtDesc(incidentId); }
    public List<Task> getByOfficer(String officerId)    { return repo.findByAssignedByOrderByCreatedAtDesc(officerId); }
    public Optional<Task> getById(String id)            { return repo.findById(id); }

    public Task create(Map<String, Object> body, String assignedBy) {
        int escalateMinutes = body.containsKey("escalateMinutes")
                ? ((Number) body.get("escalateMinutes")).intValue() : 120;

        Task task = Task.builder()
                .title((String) body.getOrDefault("title", "Untitled Task"))
                .description((String) body.getOrDefault("description", ""))
                .priority((String) body.getOrDefault("priority", "MEDIUM"))
                .status("PENDING")
                .incidentId((String) body.get("incidentId"))
                .assignedTo((String) body.get("assignedTo"))
                .assignedBy(assignedBy)
                .notes("")
                .escalateAt(Instant.now().plusSeconds(escalateMinutes * 60L))
                .build();
        return repo.save(task);
    }

    public Optional<Task> update(String id, Map<String, Object> updates) {
        return repo.findById(id).map(task -> {
            if (updates.containsKey("status"))     task.setStatus((String) updates.get("status"));
            if (updates.containsKey("priority"))   task.setPriority((String) updates.get("priority"));
            if (updates.containsKey("assignedTo")) task.setAssignedTo((String) updates.get("assignedTo"));
            if (updates.containsKey("notes"))      task.setNotes((String) updates.get("notes"));
            return repo.save(task);
        });
    }

    /** Returns tasks past their escalate deadline that are still pending/in-progress */
    public List<Task> getOverdueForEscalation() {
        return repo.findByStatus("PENDING").stream()
                .filter(t -> t.getEscalateAt() != null && t.getEscalateAt().isBefore(Instant.now()))
                .toList();
    }
}
