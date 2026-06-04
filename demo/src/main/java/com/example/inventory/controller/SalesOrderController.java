package com.example.inventory.controller;

import com.example.inventory.entity.SalesOrder;
import com.example.inventory.repository.SalesOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/sales-orders")
@RequiredArgsConstructor
public class SalesOrderController {

    private final SalesOrderRepository repository;

    @GetMapping
    public List<SalesOrder> getAllSalesOrders() {
        return repository.findAll();
    }

    @PostMapping
    public SalesOrder createSalesOrder(@RequestBody SalesOrder so) {
        return repository.save(so);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SalesOrder> updateSalesOrder(@PathVariable String id, @RequestBody SalesOrder details) {
        return repository.findById(id)
                .map(so -> {
                    so.setCustomerName(details.getCustomerName());
                    so.setProductId(details.getProductId());
                    so.setProductName(details.getProductName());
                    so.setSku(details.getSku());
                    so.setQuantity(details.getQuantity());
                    so.setUnitPrice(details.getUnitPrice());
                    so.setDiscount(details.getDiscount());
                    so.setTaxRate(details.getTaxRate());
                    so.setSubtotal(details.getSubtotal());
                    so.setTax(details.getTax());
                    so.setTotal(details.getTotal());
                    so.setDate(details.getDate());
                    return ResponseEntity.ok(repository.save(so));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSalesOrder(@PathVariable String id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
