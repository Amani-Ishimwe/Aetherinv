package com.example.inventory.service;

import com.example.inventory.controller.AuthenticationRequest;
import com.example.inventory.controller.AuthenticationResponse;
import com.example.inventory.controller.RegisterRequest;
import com.example.inventory.entity.Role;
import com.example.inventory.entity.User;
import com.example.inventory.repository.UserRepository;
import com.example.inventory.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthenticationServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private AuthenticationManager authenticationManager;

    @InjectMocks
    private AuthenticationService authenticationService;

    private User user;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(1)
                .firstname("John")
                .lastname("Doe")
                .email("john.doe@example.com")
                .password("encoded_password")
                .role(Role.USER)
                .build();
    }

    @Test
    void testRegister_Success() {
        RegisterRequest registerRequest = RegisterRequest.builder()
                .firstname("John")
                .lastname("Doe")
                .email("john.doe@example.com")
                .password("raw_password")
                .build();

        when(passwordEncoder.encode("raw_password")).thenReturn("encoded_password");
        when(userRepository.save(any(User.class))).thenReturn(user);
        when(jwtService.generateToken(any(User.class))).thenReturn("jwt_token_123");

        AuthenticationResponse response = authenticationService.register(registerRequest);

        assertNotNull(response);
        assertEquals("jwt_token_123", response.getToken());

        verify(passwordEncoder, times(1)).encode("raw_password");
        verify(userRepository, times(1)).save(any(User.class));
        verify(jwtService, times(1)).generateToken(any(User.class));
    }

    @Test
    void testAuthenticate_Success() {
        AuthenticationRequest authRequest = AuthenticationRequest.builder()
                .email("john.doe@example.com")
                .password("raw_password")
                .build();

        UsernamePasswordAuthenticationToken expectedAuthToken = 
                new UsernamePasswordAuthenticationToken("john.doe@example.com", "raw_password");

        when(authenticationManager.authenticate(expectedAuthToken)).thenReturn(null); 
        when(userRepository.findByEmail("john.doe@example.com")).thenReturn(Optional.of(user));
        when(jwtService.generateToken(user)).thenReturn("jwt_token_abc");

        AuthenticationResponse response = authenticationService.authenticate(authRequest);

        assertNotNull(response);
        assertEquals("jwt_token_abc", response.getToken());

        verify(authenticationManager, times(1)).authenticate(expectedAuthToken);
        verify(userRepository, times(1)).findByEmail("john.doe@example.com");
        verify(jwtService, times(1)).generateToken(user);
    }

    @Test
    void testAuthenticate_UserNotFound() {
        AuthenticationRequest authRequest = AuthenticationRequest.builder()
                .email("notfound@example.com")
                .password("raw_password")
                .build();

        UsernamePasswordAuthenticationToken expectedAuthToken = 
                new UsernamePasswordAuthenticationToken("notfound@example.com", "raw_password");

        when(authenticationManager.authenticate(expectedAuthToken)).thenReturn(null);
        when(userRepository.findByEmail("notfound@example.com")).thenReturn(Optional.empty());

        assertThrows(Exception.class, () -> authenticationService.authenticate(authRequest));

        verify(authenticationManager, times(1)).authenticate(expectedAuthToken);
        verify(userRepository, times(1)).findByEmail("notfound@example.com");
        verify(jwtService, never()).generateToken(any(User.class));
    }
}
