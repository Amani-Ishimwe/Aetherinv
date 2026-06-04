package com.example.inventory.controller;

import com.example.inventory.entity.TransferLog;
import com.example.inventory.repository.TransferLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/transfers")
@RequiredArgsConstructor
public class TransferLogController {

    private final TransferLogRepository repository;

    @GetMapping
    public List<TransferLog> getAllTransfers() {
        return repository.findAll();
    }

    @PostMapping
    public TransferLog createTransfer(@RequestBody TransferLog log) {
        return repository.save(log);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TransferLog> updateTransfer(@PathVariable String id, @RequestBody TransferLog details) {
        return repository.findById(id)
                .map(log -> {
                    log.setSku(details.getSku());
                    log.setProductName(details.getProductName());
                    log.setFromWarehouse(details.getFromWarehouse());
                    log.setToWarehouse(details.getToWarehouse());
                    log.setQuantity(details.getQuantity());
                    log.setStatus(details.getStatus());
                    log.setDate(details.getDate());
                    return ResponseEntity.ok(repository.save(log));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTransfer(@PathVariable String id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
