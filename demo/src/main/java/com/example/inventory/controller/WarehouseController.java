package com.example.inventory.controller;

import com.example.inventory.entity.Warehouse;
import com.example.inventory.repository.WarehouseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/warehouses")
@RequiredArgsConstructor
public class WarehouseController {

    private final WarehouseRepository repository;

    @GetMapping
    public List<Warehouse> getAllWarehouses() {
        return repository.findAll();
    }

    @PostMapping
    public Warehouse createWarehouse(@RequestBody Warehouse warehouse) {
        return repository.save(warehouse);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Warehouse> updateWarehouse(@PathVariable String id, @RequestBody Warehouse details) {
        return repository.findById(id)
                .map(wh -> {
                    wh.setName(details.getName());
                    wh.setLocation(details.getLocation());
                    wh.setManager(details.getManager());
                    wh.setCapacity(details.getCapacity());
                    wh.setStockCount(details.getStockCount());
                    return ResponseEntity.ok(repository.save(wh));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWarehouse(@PathVariable String id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
