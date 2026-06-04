package com.example.inventory.controller;

import com.example.inventory.entity.DiscrepancyItem;
import com.example.inventory.repository.DiscrepancyItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/discrepancies")
@RequiredArgsConstructor
public class DiscrepancyItemController {

    private final DiscrepancyItemRepository repository;

    @GetMapping
    public List<DiscrepancyItem> getAllDiscrepancies() {
        return repository.findAll();
    }

    @PostMapping
    public DiscrepancyItem createDiscrepancy(@RequestBody DiscrepancyItem discrepancy) {
        return repository.save(discrepancy);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DiscrepancyItem> updateDiscrepancy(@PathVariable String id, @RequestBody DiscrepancyItem details) {
        return repository.findById(id)
                .map(d -> {
                    d.setProductId(details.getProductId());
                    d.setProductName(details.getProductName());
                    d.setSku(details.getSku());
                    d.setSystemQty(details.getSystemQty());
                    d.setPhysicalQty(details.getPhysicalQty());
                    d.setDiscrepancy(details.getDiscrepancy());
                    d.setNotes(details.getNotes());
                    d.setResolved(details.getResolved());
                    return ResponseEntity.ok(repository.save(d));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDiscrepancy(@PathVariable String id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
