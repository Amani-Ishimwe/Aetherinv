package com.example.inventory.service;

import com.example.inventory.entity.Product;
import com.example.inventory.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository repository;

    public Page<Product> getAllProducts(Pageable pageable) {
        return repository.findAll(pageable);
    }

    public Optional<Product> getProductById(Long id) {
        return repository.findById(id);
    }

    public Product createProduct(Product product) {
        return repository.save(product);
    }

    public Product updateProduct(Long id, Product productDetails) {
        Product product = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));

        product.setName(productDetails.getName());
        product.setDescription(productDetails.getDescription());
        product.setSku(productDetails.getSku());
        product.setQuantity(productDetails.getQuantity());
        product.setPrice(productDetails.getPrice());
        product.setCategory(productDetails.getCategory());

        return repository.save(product);
    }

    public void deleteProduct(Long id) {
        Product product = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
        repository.delete(product);
    }

    public Page<Product> searchProducts(String keyword, Pageable pageable) {
        return repository.searchByKeyword(keyword, pageable);
    }

    public List<Product> getLowStockProducts(Integer threshold) {
        return repository.findLowStockProducts(threshold);
    }

    public Map<String, Long> getProductCountByCategory() {
        return repository.getProductCountByCategory().stream()
                .collect(Collectors.toMap(
                        obj -> obj[0] != null ? (String) obj[0] : "Uncategorized",
                        obj -> obj[1] != null ? (Long) obj[1] : 0L,
                        Long::sum
                ));
    }
}


