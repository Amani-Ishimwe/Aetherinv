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
@Table(name = "sales_orders")
public class SalesOrder {

    @Id
    private String id;

    private String customerName;

    private Long productId;

    private String productName;

    private String sku;

    private Integer quantity;

    private BigDecimal unitPrice;

    private BigDecimal discount; 

    private BigDecimal taxRate; 

    private BigDecimal subtotal;

    private BigDecimal tax;

    private BigDecimal total;

    private String date;
}
