package com.example.inventory;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest(classes = InventoryApplication.class)
@ActiveProfiles("test")
class InventoryApplicationTests {

    @Test
    void contextLoads() {
    }

}
