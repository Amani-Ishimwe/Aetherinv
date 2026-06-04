package com.example.inventory.scheduler;

import com.example.inventory.InventoryApplication;
import com.example.inventory.service.ProductService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;

import java.util.Collections;
import java.util.HashMap;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.*;

@SpringBootTest(classes = InventoryApplication.class)
@ActiveProfiles("test")
public class InventorySchedulerTest {

    @Autowired
    private InventoryScheduler inventoryScheduler;

    @MockBean
    private ProductService productService;

    @Test
    public void contextLoads() {
        assertNotNull(inventoryScheduler, "InventoryScheduler should be successfully loaded into the application context.");
    }

    @Test
    public void testReportInventoryStatus() {
        when(productService.getProductCountByCategory()).thenReturn(new HashMap<>());
        
        inventoryScheduler.reportInventoryStatus();
        
        verify(productService, times(1)).getProductCountByCategory();
    }

    @Test
    public void testCheckLowStock() {
        when(productService.getLowStockProducts(anyInt())).thenReturn(Collections.emptyList());
        
        inventoryScheduler.checkLowStock();
        
        verify(productService, times(1)).getLowStockProducts(anyInt());
    }
}
