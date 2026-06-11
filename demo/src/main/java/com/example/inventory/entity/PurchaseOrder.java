package com.example.inventory.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "purchase_orders")
public class PurchaseOrder {

    @Id
    private String id;

    private String supplierName;

    private Long productId;

    private String productName;

    private String sku;

    private Integer quantity;

    private BigDecimal unitCost;

    private String status; 

    private Boolean invoiceUploaded;

    private String date;
}
