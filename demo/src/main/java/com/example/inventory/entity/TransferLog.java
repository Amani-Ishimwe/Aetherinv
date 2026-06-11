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
@Table(name = "transfer_logs")
public class TransferLog {

    @Id
    private String id;

    private String sku;

    private String productName;

    private String fromWarehouse;

    private String toWarehouse;

    private Integer quantity;

    private String status; 

    private String date;
}
