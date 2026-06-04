package com.example.inventory.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "suppliers")
public class Supplier {

    @Id
    private String id;

    private String name;

    private String email;

    private String phone;

    private String address;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "supplier_products", joinColumns = @JoinColumn(name = "supplier_id"))
    @Column(name = "product_name")
    private List<String> productsSupplied;

    private Integer rating;

    private BigDecimal outstandingBalance;
}
