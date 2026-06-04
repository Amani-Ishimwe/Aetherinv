package com.example.inventory.controller;

import com.example.inventory.entity.Customer;
import com.example.inventory.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerRepository repository;

    @GetMapping
    public List<Customer> getAllCustomers() {
        return repository.findAll();
    }

    @PostMapping
    public Customer createCustomer(@RequestBody Customer customer) {
        return repository.save(customer);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Customer> updateCustomer(@PathVariable String id, @RequestBody Customer details) {
        return repository.findById(id)
                .map(c -> {
                    c.setName(details.getName());
                    c.setEmail(details.getEmail());
                    c.setPhone(details.getPhone());
                    c.setAddress(details.getAddress());
                    c.setLoyaltyPoints(details.getLoyaltyPoints());
                    c.setTotalSpent(details.getTotalSpent());
                    c.setOutstandingDebt(details.getOutstandingDebt());
                    return ResponseEntity.ok(repository.save(c));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCustomer(@PathVariable String id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
