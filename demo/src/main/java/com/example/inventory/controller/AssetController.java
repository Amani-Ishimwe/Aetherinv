package com.example.inventory.controller;

import com.example.inventory.entity.Asset;
import com.example.inventory.repository.AssetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/assets")
@RequiredArgsConstructor
public class AssetController {

    private final AssetRepository repository;

    @GetMapping
    public List<Asset> getAllAssets() {
        return repository.findAll();
    }

    @PostMapping
    public Asset createAsset(@RequestBody Asset asset) {
        return repository.save(asset);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Asset> updateAsset(@PathVariable String id, @RequestBody Asset details) {
        return repository.findById(id)
                .map(a -> {
                    a.setName(details.getName());
                    a.setCategory(details.getCategory());
                    a.setDepartment(details.getDepartment());
                    a.setAssignedTo(details.getAssignedTo());
                    a.setPurchaseValue(details.getPurchaseValue());
                    a.setCurrentValue(details.getCurrentValue());
                    a.setDepreciationRate(details.getDepreciationRate());
                    a.setPurchaseDate(details.getPurchaseDate());
                    a.setStatus(details.getStatus());
                    return ResponseEntity.ok(repository.save(a));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAsset(@PathVariable String id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
