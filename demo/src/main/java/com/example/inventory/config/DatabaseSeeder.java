package com.example.inventory.config;

import com.example.inventory.entity.*;
import com.example.inventory.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DatabaseSeeder implements CommandLineRunner {

    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;
    private final SupplierRepository supplierRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final SalesOrderRepository salesOrderRepository;
    private final AuditSessionRepository auditSessionRepository;
    private final DiscrepancyItemRepository discrepancyItemRepository;
    private final AssetRepository assetRepository;
    private final WarehouseRepository warehouseRepository;
    private final TransferLogRepository transferLogRepository;

    @Override
    public void run(String... args) throws Exception {
        // Seed Products if empty
        if (productRepository.count() == 0) {
            productRepository.save(Product.builder()
                    .name("Laser Sensor Probe")
                    .sku("LZR-SNS-01")
                    .description("High precision optical probe")
                    .quantity(48)
                    .price(BigDecimal.valueOf(25.00))
                    .category("Electronics")
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build());
            productRepository.save(Product.builder()
                    .name("Thermal Scanner Head")
                    .sku("THM-SCN-09")
                    .description("Infrared medical temperature sensor")
                    .quantity(15)
                    .price(BigDecimal.valueOf(150.00))
                    .category("Medical")
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build());
            productRepository.save(Product.builder()
                    .name("Gigabit Network Switch")
                    .sku("NET-SWI-24")
                    .description("24-port managed PoE rack switch")
                    .quantity(10)
                    .price(BigDecimal.valueOf(350.00))
                    .category("Electronics")
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build());
        }

        // Seed Customers
        if (customerRepository.count() == 0) {
            customerRepository.save(Customer.builder().id("CST-001").name("Alice Uwase").email("alice.uwase@gmail.com").phone("+250 788 111 222").address("Remera, Kigali, Rwanda").loyaltyPoints(340).totalSpent(BigDecimal.valueOf(850.00)).outstandingDebt(BigDecimal.ZERO).build());
            customerRepository.save(Customer.builder().id("CST-002").name("David Gasana").email("david.g@hotmail.com").phone("+250 782 555 666").address("Kiyovu, Kigali, Rwanda").loyaltyPoints(120).totalSpent(BigDecimal.valueOf(300.00)).outstandingDebt(BigDecimal.valueOf(154.50)).build());
            customerRepository.save(Customer.builder().id("CST-003").name("Kigali Tech Hub").email("procurement@kigalitech.rw").phone("+250 788 444 888").address("Nyarugenge, Kigali, Rwanda").loyaltyPoints(1800).totalSpent(BigDecimal.valueOf(4500.00)).outstandingDebt(BigDecimal.ZERO).build());
        }

        // Seed Suppliers
        if (supplierRepository.count() == 0) {
            supplierRepository.save(Supplier.builder().id("SUP-001").name("TechLogix Distribution").email("logistics@techlogix.com").phone("+250 788 123 456").address("Nyarugenge, Kigali, Rwanda").productsSupplied(List.of("Network Switches", "Router Modules", "Fiber Cables")).rating(5).outstandingBalance(BigDecimal.valueOf(1250.00)).build());
            supplierRepository.save(Supplier.builder().id("SUP-002").name("Afritech Industrial Suppliers").email("info@afritech.rw").phone("+250 785 987 654").address("Gikondo Industrial Zone, Kigali").productsSupplied(List.of("Laser Sensor Probe", "Mounting Brackets")).rating(4).outstandingBalance(BigDecimal.ZERO).build());
            supplierRepository.save(Supplier.builder().id("SUP-003").name("Global Med & Health Ltd").email("orders@globalmed.co.za").phone("+27 11 456 7890").address("Sandton, Johannesburg, South Africa").productsSupplied(List.of("First Aid Kits", "Thermal Scanners")).rating(4).outstandingBalance(BigDecimal.valueOf(4200.50)).build());
        }

        // Seed Purchase Orders
        if (purchaseOrderRepository.count() == 0) {
            purchaseOrderRepository.save(PurchaseOrder.builder().id("PO-901").supplierName("TechLogix Distribution").productId(1L).productName("Laser Sensor Probe").sku("LZR-SNS-01").quantity(100).unitCost(BigDecimal.valueOf(12.00)).status("APPROVED").invoiceUploaded(false).date("2026-06-03").build());
            purchaseOrderRepository.save(PurchaseOrder.builder().id("PO-902").supplierName("Global Med & Health Ltd").productId(2L).productName("Thermal Scanner Head").sku("THM-SCN-09").quantity(50).unitCost(BigDecimal.valueOf(45.00)).status("DELIVERED").invoiceUploaded(true).date("2026-06-01").build());
        }

        // Seed Sales Orders
        if (salesOrderRepository.count() == 0) {
            salesOrderRepository.save(SalesOrder.builder().id("INV-101").customerName("Alice Uwase").productId(1L).productName("Laser Sensor Probe").sku("LZR-SNS-01").quantity(5).unitPrice(BigDecimal.valueOf(25.00)).discount(BigDecimal.valueOf(10)).taxRate(BigDecimal.valueOf(18)).subtotal(BigDecimal.valueOf(112.50)).tax(BigDecimal.valueOf(20.25)).total(BigDecimal.valueOf(132.75)).date("2026-06-04").build());
            salesOrderRepository.save(SalesOrder.builder().id("INV-102").customerName("Kigali Tech Hub").productId(2L).productName("Gigabit Network Switch").sku("NET-SWI-24").quantity(2).unitPrice(BigDecimal.valueOf(150.00)).discount(BigDecimal.ZERO).taxRate(BigDecimal.valueOf(18)).subtotal(BigDecimal.valueOf(300.00)).tax(BigDecimal.valueOf(54.00)).total(BigDecimal.valueOf(354.00)).date("2026-06-02").build());
        }

        // Seed Audit Sessions
        if (auditSessionRepository.count() == 0) {
            auditSessionRepository.save(AuditSession.builder().id("AUD-01").title("Q2 Central Stock Audit").status("IN_PROGRESS").date("2026-06-04").auditor("Marie Claire").build());
            auditSessionRepository.save(AuditSession.builder().id("AUD-02").title("Annual Fiscal Audit 2025").status("COMPLETED").date("2025-12-15").auditor("Jean Bosco").build());
        }

        // Seed Discrepancies
        if (discrepancyItemRepository.count() == 0) {
            discrepancyItemRepository.save(DiscrepancyItem.builder().id("DIS-01").productId(1L).productName("Laser Sensor Probe").sku("LZR-SNS-01").systemQty(48).physicalQty(45).discrepancy(-3).notes("Water damage detected in shelf-row A4").resolved(false).build());
            discrepancyItemRepository.save(DiscrepancyItem.builder().id("DIS-02").productId(2L).productName("Gigabit Network Switch").sku("NET-SWI-24").systemQty(10).physicalQty(10).discrepancy(0).notes("Stock count matches system records exactly").resolved(true).build());
        }

        // Seed Assets
        if (assetRepository.count() == 0) {
            assetRepository.save(Asset.builder().id("AST-101").name("HP EliteBook Laptop").category("Hardware").department("IT Support").assignedTo("Jean Bosco").purchaseValue(BigDecimal.valueOf(1200.00)).currentValue(BigDecimal.valueOf(950.00)).depreciationRate(BigDecimal.valueOf(15)).purchaseDate("2025-01-10").status("ACTIVE").build());
            assetRepository.save(Asset.builder().id("AST-102").name("Ergonomic Mesh Chair").category("Office Furniture").department("Operations").assignedTo("Marie Claire").purchaseValue(BigDecimal.valueOf(250.00)).currentValue(BigDecimal.valueOf(210.00)).depreciationRate(BigDecimal.valueOf(10)).purchaseDate("2025-03-15").status("ACTIVE").build());
        }

        // Seed Warehouses
        if (warehouseRepository.count() == 0) {
            warehouseRepository.save(Warehouse.builder().id("WH-01").name("Central Kigali Hub").location("Kigali City, Nyarugenge").manager("Marie Claire").capacity(10000).stockCount(4800).build());
            warehouseRepository.save(Warehouse.builder().id("WH-02").name("Musanze Logistics Depot").location("Northern Province, Musanze").manager("Jean Bosco").capacity(5000).stockCount(1200).build());
        }

        // Seed Transfer Logs
        if (transferLogRepository.count() == 0) {
            transferLogRepository.save(TransferLog.builder().id("TRSF-701").sku("LZR-SNS-01").productName("Laser Sensor Probe").fromWarehouse("Central Kigali Hub").toWarehouse("Musanze Logistics Depot").quantity(15).status("APPROVED").date("2026-06-03").build());
            transferLogRepository.save(TransferLog.builder().id("TRSF-702").sku("THM-SCN-09").productName("Thermal Scanner Head").fromWarehouse("Musanze Logistics Depot").toWarehouse("Central Kigali Hub").quantity(5).status("PENDING").date("2026-06-04").build());
        }
    }
}
