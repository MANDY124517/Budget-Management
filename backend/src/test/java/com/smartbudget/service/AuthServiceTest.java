package com.smartbudget.service;

import com.smartbudget.dto.auth.AuthResponse;
import com.smartbudget.dto.auth.RegisterRequest;
import com.smartbudget.entity.Account;
import com.smartbudget.entity.User;
import com.smartbudget.exception.DuplicateResourceException;
import com.smartbudget.repository.AccountRepository;
import com.smartbudget.repository.UserRepository;
import com.smartbudget.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtTokenProvider tokenProvider;

    @Mock
    private com.smartbudget.security.LoginAttemptService loginAttemptService;

    @InjectMocks
    private AuthService authService;

    private RegisterRequest registerRequest;
    private User mockUser;

    @BeforeEach
    void setUp() {
        registerRequest = RegisterRequest.builder()
                .fullName("Sarah Connor")
                .email("sarah@example.com")
                .password("Password123!")
                .defaultCurrency("INR")
                .build();

        mockUser = User.builder()
                .id(1L)
                .email("sarah@example.com")
                .passwordHash("encoded_hash")
                .fullName("Sarah Connor")
                .defaultCurrency("INR")
                .role("ROLE_USER")
                .isActive(true)
                .createdAt(Instant.now())
                .build();
    }

    @Test
    void register_Success() {
        when(userRepository.existsByEmail("sarah@example.com")).thenReturn(false);
        when(passwordEncoder.encode("Password123!")).thenReturn("encoded_hash");
        when(userRepository.save(any(User.class))).thenReturn(mockUser);
        when(accountRepository.save(any(Account.class))).thenReturn(new Account());
        when(tokenProvider.generateAccessTokenFromEmail(anyString(), anyLong(), anyString())).thenReturn("mock_access_token");
        when(tokenProvider.generateRefreshToken(anyString())).thenReturn("mock_refresh_token");
        when(tokenProvider.getExpirationMs()).thenReturn(900000L);

        AuthResponse response = authService.register(registerRequest);

        assertNotNull(response);
        assertEquals("mock_access_token", response.getAccessToken());
        assertEquals("sarah@example.com", response.getUser().getEmail());
        verify(accountRepository, times(1)).save(any(Account.class));
    }

    @Test
    void register_DuplicateEmail_ThrowsException() {
        when(userRepository.existsByEmail("sarah@example.com")).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> authService.register(registerRequest));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void login_BlockedUser_ThrowsUnauthorizedException() {
        when(loginAttemptService.isBlocked("blocked@example.com")).thenReturn(true);

        com.smartbudget.dto.auth.LoginRequest loginRequest = com.smartbudget.dto.auth.LoginRequest.builder()
                .email("blocked@example.com")
                .password("password")
                .build();

        assertThrows(com.smartbudget.exception.UnauthorizedException.class, () -> authService.login(loginRequest));
        verify(authenticationManager, never()).authenticate(any());
    }

    @Test
    void login_FailedCredentials_CallsLoginFailedAndThrowsUnauthorized() {
        when(loginAttemptService.isBlocked("victim@example.com")).thenReturn(false);
        when(authenticationManager.authenticate(any())).thenThrow(new org.springframework.security.authentication.BadCredentialsException("Bad credentials"));
        when(loginAttemptService.getRemainingAttempts("victim@example.com")).thenReturn(4);

        com.smartbudget.dto.auth.LoginRequest loginRequest = com.smartbudget.dto.auth.LoginRequest.builder()
                .email("victim@example.com")
                .password("wrongpassword")
                .build();

        assertThrows(com.smartbudget.exception.UnauthorizedException.class, () -> authService.login(loginRequest));
        verify(loginAttemptService, times(1)).loginFailed("victim@example.com");
    }
}
