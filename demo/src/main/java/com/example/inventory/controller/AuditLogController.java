package com.example.inventory.controller;

import com.example.inventory.entity.AuditLog;
import com.example.inventory.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/audit-logs")
@RequiredArgsConstructor
public class AuditLogController {

    private final AuditLogRepository repository;

    @GetMapping
    public List<AuditLog> getAllAuditLogs() {
        return repository.findAll(Sort.by(Sort.Direction.DESC, "id"));
    }

    @PostMapping
    public AuditLog createAuditLog(@RequestBody AuditLog log) {
        return repository.save(log);
    }

    @DeleteMapping
    public org.springframework.http.ResponseEntity<Void> deleteAllAuditLogs() {
        repository.deleteAll();
        return org.springframework.http.ResponseEntity.noContent().build();
    }
}
