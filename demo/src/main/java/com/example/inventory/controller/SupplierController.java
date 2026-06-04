package com.example.inventory.controller;

import com.example.inventory.entity.Supplier;
import com.example.inventory.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/suppliers")
@RequiredArgsConstructor
public class SupplierController {

    private final SupplierRepository repository;

    @GetMapping
    public List<Supplier> getAllSuppliers() {
        return repository.findAll();
    }

    @PostMapping
    public Supplier createSupplier(@RequestBody Supplier supplier) {
        return repository.save(supplier);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Supplier> updateSupplier(@PathVariable String id, @RequestBody Supplier details) {
        return repository.findById(id)
                .map(s -> {
                    s.setName(details.getName());
                    s.setEmail(details.getEmail());
                    s.setPhone(details.getPhone());
                    s.setAddress(details.getAddress());
                    s.setProductsSupplied(details.getProductsSupplied());
                    s.setRating(details.getRating());
                    s.setOutstandingBalance(details.getOutstandingBalance());
                    return ResponseEntity.ok(repository.save(s));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSupplier(@PathVariable String id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
