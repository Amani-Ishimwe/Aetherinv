package com.example.inventory.controller;

import com.example.inventory.entity.AuditSession;
import com.example.inventory.repository.AuditSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/audit-sessions")
@RequiredArgsConstructor
public class AuditSessionController {

    private final AuditSessionRepository repository;

    @GetMapping
    public List<AuditSession> getAllAuditSessions() {
        return repository.findAll();
    }

    @PostMapping
    public AuditSession createAuditSession(@RequestBody AuditSession session) {
        return repository.save(session);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AuditSession> updateAuditSession(@PathVariable String id, @RequestBody AuditSession details) {
        return repository.findById(id)
                .map(s -> {
                    s.setTitle(details.getTitle());
                    s.setStatus(details.getStatus());
                    s.setDate(details.getDate());
                    s.setAuditor(details.getAuditor());
                    return ResponseEntity.ok(repository.save(s));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAuditSession(@PathVariable String id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
