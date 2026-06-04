package com.example.inventory.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "discrepancy_items")
public class DiscrepancyItem {

    @Id
    private String id;

    private Long productId;

    private String productName;

    private String sku;

    private Integer systemQty;

    private Integer physicalQty;

    private Integer discrepancy;

    private String notes;

    private Boolean resolved;
}
