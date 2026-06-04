package com.example.inventory.controller;

import com.example.inventory.entity.PurchaseOrder;
import com.example.inventory.repository.PurchaseOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/purchase-orders")
@RequiredArgsConstructor
public class PurchaseOrderController {

    private final PurchaseOrderRepository repository;

    @GetMapping
    public List<PurchaseOrder> getAllPurchaseOrders() {
        return repository.findAll();
    }

    @PostMapping
    public PurchaseOrder createPurchaseOrder(@RequestBody PurchaseOrder po) {
        return repository.save(po);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PurchaseOrder> updatePurchaseOrder(@PathVariable String id, @RequestBody PurchaseOrder details) {
        return repository.findById(id)
                .map(po -> {
                    po.setSupplierName(details.getSupplierName());
                    po.setProductId(details.getProductId());
                    po.setProductName(details.getProductName());
                    po.setSku(details.getSku());
                    po.setQuantity(details.getQuantity());
                    po.setUnitCost(details.getUnitCost());
                    po.setStatus(details.getStatus());
                    po.setInvoiceUploaded(details.getInvoiceUploaded());
                    po.setDate(details.getDate());
                    return ResponseEntity.ok(repository.save(po));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePurchaseOrder(@PathVariable String id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
