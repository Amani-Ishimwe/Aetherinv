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
@Table(name = "assets")
public class Asset {

    @Id
    private String id;

    private String name;

    private String category;

    private String department;

    private String assignedTo;

    private BigDecimal purchaseValue;

    private BigDecimal currentValue;

    private BigDecimal depreciationRate; 

    private String purchaseDate;

    private String status; 
}
