package com.smartbudget.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class LoginAttemptServiceTest {

    private LoginAttemptService loginAttemptService;

    @BeforeEach
    void setUp() {
        loginAttemptService = new LoginAttemptService();
        loginAttemptService.resetCache();
    }

    @Test
    void initialAttempts_NotBlocked() {
        assertFalse(loginAttemptService.isBlocked("user@example.com"));
        assertEquals(LoginAttemptService.MAX_ATTEMPTS, loginAttemptService.getRemainingAttempts("user@example.com"));
    }

    @Test
    void failedAttempts_DecrementsRemaining() {
        loginAttemptService.loginFailed("user@example.com");
        loginAttemptService.loginFailed("user@example.com");

        assertFalse(loginAttemptService.isBlocked("user@example.com"));
        assertEquals(LoginAttemptService.MAX_ATTEMPTS - 2, loginAttemptService.getRemainingAttempts("user@example.com"));
    }

    @Test
    void exceedingMaxAttempts_LocksOutUser() {
        for (int i = 0; i < LoginAttemptService.MAX_ATTEMPTS; i++) {
            loginAttemptService.loginFailed("attacker@example.com");
        }

        assertTrue(loginAttemptService.isBlocked("attacker@example.com"));
        assertEquals(0, loginAttemptService.getRemainingAttempts("attacker@example.com"));
    }

    @Test
    void successfulLogin_ResetsAttempts() {
        loginAttemptService.loginFailed("user@example.com");
        loginAttemptService.loginFailed("user@example.com");

        loginAttemptService.loginSucceeded("user@example.com");

        assertFalse(loginAttemptService.isBlocked("user@example.com"));
        assertEquals(LoginAttemptService.MAX_ATTEMPTS, loginAttemptService.getRemainingAttempts("user@example.com"));
    }
}
