package com.smartbudget.security;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Thread-safe in-memory login attempt cache to protect against
 * brute-force dictionary attacks and credential stuffing.
 */
@Slf4j
@Service
public class LoginAttemptService {

    public static final int MAX_ATTEMPTS = 5;
    public static final long LOCKOUT_DURATION_SECONDS = 900; // 15 minutes

    private static class AttemptRecord {
        int attempts;
        Instant lastAttempt;
        Instant lockedUntil;

        AttemptRecord(int attempts, Instant lastAttempt) {
            this.attempts = attempts;
            this.lastAttempt = lastAttempt;
            this.lockedUntil = null;
        }
    }

    private final Map<String, AttemptRecord> attemptsCache = new ConcurrentHashMap<>();

    public void loginSucceeded(String key) {
        attemptsCache.remove(key.toLowerCase().trim());
    }

    public void loginFailed(String key) {
        String normalizedKey = key.toLowerCase().trim();
        Instant now = Instant.now();

        attemptsCache.compute(normalizedKey, (k, record) -> {
            if (record == null) {
                return new AttemptRecord(1, now);
            }

            // If previously locked and lockout expired, reset count
            if (record.lockedUntil != null && now.isAfter(record.lockedUntil)) {
                return new AttemptRecord(1, now);
            }

            // If last attempt was older than the window, reset count
            if (record.lastAttempt != null && now.isAfter(record.lastAttempt.plusSeconds(LOCKOUT_DURATION_SECONDS))) {
                return new AttemptRecord(1, now);
            }

            int newCount = record.attempts + 1;
            record.attempts = newCount;
            record.lastAttempt = now;

            if (newCount >= MAX_ATTEMPTS) {
                record.lockedUntil = now.plusSeconds(LOCKOUT_DURATION_SECONDS);
                log.warn("Security Alert: Key '{}' has exceeded maximum failed login attempts ({}) and is locked until {}",
                        normalizedKey, MAX_ATTEMPTS, record.lockedUntil);
            }

            return record;
        });
    }

    public boolean isBlocked(String key) {
        String normalizedKey = key.toLowerCase().trim();
        AttemptRecord record = attemptsCache.get(normalizedKey);

        if (record == null) {
            return false;
        }

        Instant now = Instant.now();
        if (record.lockedUntil != null) {
            if (now.isBefore(record.lockedUntil)) {
                return true;
            } else {
                // Lockout has elapsed, cleanup
                attemptsCache.remove(normalizedKey);
                return false;
            }
        }

        return false;
    }

    public int getRemainingAttempts(String key) {
        String normalizedKey = key.toLowerCase().trim();
        AttemptRecord record = attemptsCache.get(normalizedKey);
        if (record == null) {
            return MAX_ATTEMPTS;
        }

        Instant now = Instant.now();
        if (record.lastAttempt != null && now.isAfter(record.lastAttempt.plusSeconds(LOCKOUT_DURATION_SECONDS))) {
            attemptsCache.remove(normalizedKey);
            return MAX_ATTEMPTS;
        }

        return Math.max(0, MAX_ATTEMPTS - record.attempts);
    }

    public void resetCache() {
        attemptsCache.clear();
    }
}
