package com.example.inventory.scheduler;

import com.example.inventory.entity.Product;
import com.example.inventory.service.ProductService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class InventoryScheduler {

    private final ProductService productService;

    @Value("${inventory.scheduling.low-stock-threshold:5}")
    private int lowStockThreshold;


    @Scheduled(cron = "${inventory.scheduling.cron}")
    public void reportInventoryStatus() {
        log.info("[CRON JOB] Starting periodic inventory statistics report...");
        try {
            Map<String, Long> countByCategory = productService.getProductCountByCategory();
            log.info("[CRON JOB] Inventory breakdown by category:");
            if (countByCategory.isEmpty()) {
                log.info(" - No categories found in inventory.");
            } else {
                countByCategory.forEach((category, count) ->
                        log.info(" - Category: '{}', Count: {}", category != null ? category : "Uncategorized", count)
                );
            }
        } catch (Exception e) {
            log.error("[CRON JOB] Error occurred during inventory status reporting: {}", e.getMessage());
        }
        log.info("[CRON JOB] Inventory statistics report finished.");
    }


    @Scheduled(fixedRateString = "${inventory.scheduling.low-stock-check-rate}",
            initialDelayString = "${inventory.scheduling.initial-delay}")
    public void checkLowStock() {
        log.info("[SCHEDULED TASK] Checking for products below low-stock threshold (Threshold: {})...", lowStockThreshold);
        try {
            List<Product> lowStockProducts = productService.getLowStockProducts(lowStockThreshold);
            if (lowStockProducts.isEmpty()) {
                log.info("[SCHEDULED TASK] No low-stock products found. Everything is well stocked.");
            } else {
                log.warn("[SCHEDULED TASK] WARNING: The following products are low in stock!");
                for (Product product : lowStockProducts) {
                    log.warn(" - SKU: {}, Name: {}, Current Quantity: {} (Below Threshold: {})",
                            product.getSku(), product.getName(), product.getQuantity(), lowStockThreshold);
                }
            }
        } catch (Exception e) {
            log.error("[SCHEDULED TASK] Error occurred during low stock checking: {}", e.getMessage());
        }
        log.info("[SCHEDULED TASK] Low stock check complete.");
    }
}
