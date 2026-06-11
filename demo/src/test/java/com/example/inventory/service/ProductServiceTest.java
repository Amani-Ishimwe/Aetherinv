package com.example.inventory.service;

import com.example.inventory.entity.Product;
import com.example.inventory.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository repository;

    @InjectMocks
    private ProductService productService;

    private Product product1;
    private Product product2;

    @BeforeEach
    void setUp() {
        product1 = Product.builder()
                .id(1L)
                .name("Laptop")
                .description("High-end gaming laptop")
                .sku("LAP-001")
                .quantity(10)
                .price(BigDecimal.valueOf(1200.00))
                .category("Electronics")
                .build();

        product2 = Product.builder()
                .id(2L)
                .name("Office Chair")
                .description("Ergonomic office chair")
                .sku("CHR-002")
                .quantity(3)
                .price(BigDecimal.valueOf(150.00))
                .category("Furniture")
                .build();
    }

    @Test
    void testGetAllProducts() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Product> productPage = new PageImpl<>(Arrays.asList(product1, product2));
        
        when(repository.findAll(pageable)).thenReturn(productPage);

        Page<Product> result = productService.getAllProducts(pageable);

        assertNotNull(result);
        assertEquals(2, result.getContent().size());
        assertEquals("Laptop", result.getContent().get(0).getName());
        assertEquals("Office Chair", result.getContent().get(1).getName());
        verify(repository, times(1)).findAll(pageable);
    }

    @Test
    void testGetProductById_Success() {
        when(repository.findById(1L)).thenReturn(Optional.of(product1));

        Optional<Product> result = productService.getProductById(1L);

        assertTrue(result.isPresent());
        assertEquals("Laptop", result.get().getName());
        verify(repository, times(1)).findById(1L);
    }

    @Test
    void testGetProductById_NotFound() {
        when(repository.findById(3L)).thenReturn(Optional.empty());

        Optional<Product> result = productService.getProductById(3L);

        assertFalse(result.isPresent());
        verify(repository, times(1)).findById(3L);
    }

    @Test
    void testCreateProduct() {
        when(repository.save(any(Product.class))).thenReturn(product1);

        Product result = productService.createProduct(product1);

        assertNotNull(result);
        assertEquals("Laptop", result.getName());
        verify(repository, times(1)).save(product1);
    }

    @Test
    void testUpdateProduct_Success() {
        Product updatedDetails = Product.builder()
                .name("Updated Laptop")
                .description("Updated Description")
                .sku("LAP-001-UPD")
                .quantity(15)
                .price(BigDecimal.valueOf(1300.00))
                .category("Electronics & Tech")
                .build();

        when(repository.findById(1L)).thenReturn(Optional.of(product1));
        when(repository.save(any(Product.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Product result = productService.updateProduct(1L, updatedDetails);

        assertNotNull(result);
        assertEquals("Updated Laptop", result.getName());
        assertEquals("Updated Description", result.getDescription());
        assertEquals("LAP-001-UPD", result.getSku());
        assertEquals(15, result.getQuantity());
        assertEquals(BigDecimal.valueOf(1300.00), result.getPrice());
        assertEquals("Electronics & Tech", result.getCategory());
        
        verify(repository, times(1)).findById(1L);
        verify(repository, times(1)).save(any(Product.class));
    }

    @Test
    void testUpdateProduct_NotFound() {
        Product updatedDetails = Product.builder().name("Updated").build();
        when(repository.findById(3L)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> 
            productService.updateProduct(3L, updatedDetails)
        );

        assertEquals("Product not found with id: 3", exception.getMessage());
        verify(repository, times(1)).findById(3L);
        verify(repository, never()).save(any(Product.class));
    }

    @Test
    void testDeleteProduct_Success() {
        when(repository.findById(1L)).thenReturn(Optional.of(product1));
        doNothing().when(repository).delete(product1);

        assertDoesNotThrow(() -> productService.deleteProduct(1L));

        verify(repository, times(1)).findById(1L);
        verify(repository, times(1)).delete(product1);
    }

    @Test
    void testDeleteProduct_NotFound() {
        when(repository.findById(3L)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> 
            productService.deleteProduct(3L)
        );

        assertEquals("Product not found with id: 3", exception.getMessage());
        verify(repository, times(1)).findById(3L);
        verify(repository, never()).delete(any(Product.class));
    }

    @Test
    void testSearchProducts() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Product> searchPage = new PageImpl<>(Collections.singletonList(product1));

        when(repository.searchByKeyword("Laptop", pageable)).thenReturn(searchPage);

        Page<Product> result = productService.searchProducts("Laptop", pageable);

        assertNotNull(result);
        assertEquals(1, result.getContent().size());
        assertEquals("Laptop", result.getContent().get(0).getName());
        verify(repository, times(1)).searchByKeyword("Laptop", pageable);
    }

    @Test
    void testGetLowStockProducts() {
        List<Product> lowStockList = Collections.singletonList(product2); 

        when(repository.findLowStockProducts(5)).thenReturn(lowStockList);

        List<Product> result = productService.getLowStockProducts(5);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Office Chair", result.get(0).getName());
        verify(repository, times(1)).findLowStockProducts(5);
    }

    @Test
    void testGetProductCountByCategory() {
        List<Object[]> queryResults = new ArrayList<>();
        queryResults.add(new Object[]{"Electronics", 10L});
        queryResults.add(new Object[]{"Furniture", 5L});

        when(repository.getProductCountByCategory()).thenReturn(queryResults);

        Map<String, Long> result = productService.getProductCountByCategory();

        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals(10L, result.get("Electronics"));
        assertEquals(5L, result.get("Furniture"));
        verify(repository, times(1)).getProductCountByCategory();
    }
}
