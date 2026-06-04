package com.example.inventory.controller;

import com.example.inventory.entity.Product;
import com.example.inventory.repository.UserRepository;
import com.example.inventory.security.JwtService;
import com.example.inventory.service.ProductService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.*;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ProductController.class)
@AutoConfigureMockMvc(addFilters = false) // Disables Spring Security filters to focus on controller mapping
class ProductControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ProductService productService;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private UserRepository userRepository;

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
    void testGetAllProducts() throws Exception {
        Page<Product> productPage = new PageImpl<>(Arrays.asList(product1, product2));
        when(productService.getAllProducts(any(Pageable.class))).thenReturn(productPage);

        mockMvc.perform(get("/api/v1/products")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].name").value("Laptop"))
                .andExpect(jsonPath("$.content[1].name").value("Office Chair"))
                .andExpect(jsonPath("$.totalElements").value(2));

        verify(productService, times(1)).getAllProducts(any(Pageable.class));
    }

    @Test
    void testGetProductById_Success() throws Exception {
        when(productService.getProductById(1L)).thenReturn(Optional.of(product1));

        mockMvc.perform(get("/api/v1/products/1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Laptop"))
                .andExpect(jsonPath("$.sku").value("LAP-001"));

        verify(productService, times(1)).getProductById(1L);
    }

    @Test
    void testGetProductById_NotFound() throws Exception {
        when(productService.getProductById(3L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/v1/products/3")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());

        verify(productService, times(1)).getProductById(3L);
    }

    @Test
    void testCreateProduct() throws Exception {
        when(productService.createProduct(any(Product.class))).thenReturn(product1);

        mockMvc.perform(post("/api/v1/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(product1)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Laptop"))
                .andExpect(jsonPath("$.sku").value("LAP-001"));

        verify(productService, times(1)).createProduct(any(Product.class));
    }

    @Test
    void testUpdateProduct_Success() throws Exception {
        Product updatedProduct = Product.builder()
                .id(1L)
                .name("Updated Laptop")
                .sku("LAP-001")
                .quantity(15)
                .price(BigDecimal.valueOf(1300.00))
                .category("Electronics")
                .build();

        when(productService.updateProduct(eq(1L), any(Product.class))).thenReturn(updatedProduct);

        mockMvc.perform(put("/api/v1/products/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updatedProduct)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated Laptop"))
                .andExpect(jsonPath("$.quantity").value(15));

        verify(productService, times(1)).updateProduct(eq(1L), any(Product.class));
    }

    @Test
    void testUpdateProduct_NotFound() throws Exception {
        when(productService.updateProduct(eq(3L), any(Product.class)))
                .thenThrow(new RuntimeException("Product not found"));

        mockMvc.perform(put("/api/v1/products/3")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(product1)))
                .andExpect(status().isNotFound());

        verify(productService, times(1)).updateProduct(eq(3L), any(Product.class));
    }

    @Test
    void testDeleteProduct_Success() throws Exception {
        doNothing().when(productService).deleteProduct(1L);

        mockMvc.perform(delete("/api/v1/products/1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent());

        verify(productService, times(1)).deleteProduct(1L);
    }

    @Test
    void testDeleteProduct_NotFound() throws Exception {
        doThrow(new RuntimeException("Product not found")).when(productService).deleteProduct(3L);

        mockMvc.perform(delete("/api/v1/products/3")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());

        verify(productService, times(1)).deleteProduct(3L);
    }

    @Test
    void testSearchProducts() throws Exception {
        Page<Product> searchResults = new PageImpl<>(Collections.singletonList(product1));
        when(productService.searchProducts(eq("Laptop"), any(Pageable.class))).thenReturn(searchResults);

        mockMvc.perform(get("/api/v1/products/search")
                        .param("keyword", "Laptop")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].name").value("Laptop"))
                .andExpect(jsonPath("$.totalElements").value(1));

        verify(productService, times(1)).searchProducts(eq("Laptop"), any(Pageable.class));
    }

    @Test
    void testGetLowStockProducts() throws Exception {
        List<Product> lowStock = Collections.singletonList(product2);
        when(productService.getLowStockProducts(5)).thenReturn(lowStock);

        mockMvc.perform(get("/api/v1/products/low-stock")
                        .param("threshold", "5")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Office Chair"))
                .andExpect(jsonPath("$[0].quantity").value(3));

        verify(productService, times(1)).getLowStockProducts(5);
    }

    @Test
    void testGetProductStats() throws Exception {
        Map<String, Long> stats = new HashMap<>();
        stats.put("Electronics", 10L);
        stats.put("Furniture", 5L);

        when(productService.getProductCountByCategory()).thenReturn(stats);

        mockMvc.perform(get("/api/v1/products/stats")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.Electronics").value(10))
                .andExpect(jsonPath("$.Furniture").value(5));

        verify(productService, times(1)).getProductCountByCategory();
    }
}
