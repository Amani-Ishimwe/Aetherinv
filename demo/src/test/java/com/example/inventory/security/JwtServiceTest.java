package com.example.inventory.security;

import com.example.inventory.entity.Role;
import com.example.inventory.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private JwtService jwtService;
    private User user;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        
        ReflectionTestUtils.setField(jwtService, "secretKey", "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970");
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", 86400000L); 

        user = User.builder()
                .id(1)
                .firstname("John")
                .lastname("Doe")
                .email("john.doe@example.com")
                .password("password")
                .role(Role.USER)
                .build();
    }

    @Test
    void testGenerateTokenAndExtractUsername() {
        String token = jwtService.generateToken(user);
        assertNotNull(token);
        
        String username = jwtService.extractUsername(token);
        assertEquals("john.doe@example.com", username);
    }

    @Test
    void testGenerateTokenWithExtraClaims() {
        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("role", "USER");
        extraClaims.put("userId", 1);

        String token = jwtService.generateToken(extraClaims, user);
        assertNotNull(token);

        String username = jwtService.extractUsername(token);
        assertEquals("john.doe@example.com", username);

        String role = jwtService.extractClaim(token, claims -> claims.get("role", String.class));
        Integer userId = jwtService.extractClaim(token, claims -> claims.get("userId", Integer.class));

        assertEquals("USER", role);
        assertEquals(1, userId);
    }

    @Test
    void testIsTokenValid_Success() {
        String token = jwtService.generateToken(user);
        assertTrue(jwtService.isTokenValid(token, user));
    }

    @Test
    void testIsTokenValid_FailDueToUserMismatch() {
        String token = jwtService.generateToken(user);
        
        User differentUser = User.builder()
                .email("other.user@example.com")
                .build();

        assertFalse(jwtService.isTokenValid(token, differentUser));
    }

    @Test
    void testIsTokenExpired_WithShortExpiration() {
        
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", -1000L);
        
        String token = jwtService.generateToken(user);
        assertNotNull(token);

        
        assertThrows(Exception.class, () -> jwtService.isTokenValid(token, user));
    }
}
