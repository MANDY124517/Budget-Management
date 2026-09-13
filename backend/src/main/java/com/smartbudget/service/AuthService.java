package com.smartbudget.service;

import com.smartbudget.dto.auth.*;
import com.smartbudget.entity.Account;
import com.smartbudget.entity.User;
import com.smartbudget.entity.enums.AccountType;
import com.smartbudget.exception.BadRequestException;
import com.smartbudget.exception.DuplicateResourceException;
import com.smartbudget.exception.ResourceNotFoundException;
import com.smartbudget.exception.UnauthorizedException;
import com.smartbudget.repository.AccountRepository;
import com.smartbudget.repository.UserRepository;
import com.smartbudget.security.JwtTokenProvider;
import com.smartbudget.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail().toLowerCase().trim())) {
            throw new DuplicateResourceException("Email is already registered: " + request.getEmail());
        }

        User user = User.builder()
                .email(request.getEmail().toLowerCase().trim())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName().trim())
                .defaultCurrency(request.getDefaultCurrency() != null ? request.getDefaultCurrency().toUpperCase() : "INR")
                .role("ROLE_USER")
                .isActive(true)
                .build();

        User savedUser = userRepository.save(user);

        // Bootstrap a default primary account for the new user
        Account defaultAccount = Account.builder()
                .user(savedUser)
                .name("Primary Account")
                .accountType(AccountType.CHECKING)
                .balance(BigDecimal.ZERO)
                .currency(savedUser.getDefaultCurrency())
                .institutionName("Cash / Main Bank")
                .isActive(true)
                .build();
        accountRepository.save(defaultAccount);

        String accessToken = tokenProvider.generateAccessTokenFromEmail(
                savedUser.getEmail(), savedUser.getId(), savedUser.getFullName());
        String refreshToken = tokenProvider.generateRefreshToken(savedUser.getEmail());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresInSeconds(tokenProvider.getExpirationMs() / 1000)
                .user(mapToProfileDto(savedUser))
                .build();
    }

    private final com.smartbudget.security.LoginAttemptService loginAttemptService;

    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail().toLowerCase().trim();

        if (loginAttemptService.isBlocked(email)) {
            log.warn("Login attempt blocked for locked account: {}", email);
            throw new UnauthorizedException("Too many failed login attempts. Account temporarily locked for 15 minutes to prevent unauthorized access.");
        }

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, request.getPassword())
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();

            User user = userRepository.findByEmail(userPrincipal.getEmail())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));

            loginAttemptService.loginSucceeded(email);

            String accessToken = tokenProvider.generateAccessToken(authentication);
            String refreshToken = tokenProvider.generateRefreshToken(userPrincipal.getEmail());

            return AuthResponse.builder()
                    .accessToken(accessToken)
                    .refreshToken(refreshToken)
                    .tokenType("Bearer")
                    .expiresInSeconds(tokenProvider.getExpirationMs() / 1000)
                    .user(mapToProfileDto(user))
                    .build();
        } catch (org.springframework.security.core.AuthenticationException ex) {
            loginAttemptService.loginFailed(email);
            int remaining = loginAttemptService.getRemainingAttempts(email);
            log.warn("Failed authentication attempt for {}. Remaining attempts: {}", email, remaining);
            throw new UnauthorizedException("Invalid email or password" + (remaining > 0 ? ". Remaining attempts before lockout: " + remaining : ". Account is now locked."));
        }
    }

    public AuthResponse refreshToken(RefreshTokenRequest request) {
        if (!tokenProvider.validateToken(request.getRefreshToken())) {
            throw new UnauthorizedException("Invalid or expired refresh token");
        }

        String email = tokenProvider.getEmailFromToken(request.getRefreshToken());
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String accessToken = tokenProvider.generateAccessTokenFromEmail(user.getEmail(), user.getId(), user.getFullName());
        String newRefreshToken = tokenProvider.generateRefreshToken(user.getEmail());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(newRefreshToken)
                .tokenType("Bearer")
                .expiresInSeconds(tokenProvider.getExpirationMs() / 1000)
                .user(mapToProfileDto(user))
                .build();
    }

    @Transactional(readOnly = true)
    public UserProfileDto getCurrentUserProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        return mapToProfileDto(user);
    }

    @Transactional
    public UserProfileDto updateProfile(Long userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        user.setFullName(request.getFullName().trim());
        user.setDefaultCurrency(request.getDefaultCurrency().toUpperCase().trim());

        User updatedUser = userRepository.save(user);
        return mapToProfileDto(updatedUser);
    }

    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Current password is incorrect");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    private UserProfileDto mapToProfileDto(User user) {
        return UserProfileDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .defaultCurrency(user.getDefaultCurrency())
                .role(user.getRole())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
