package com.smartbudget.service;

import com.smartbudget.dto.recurring.CreateRecurringTransactionRequest;
import com.smartbudget.dto.recurring.RecurringTransactionDto;
import com.smartbudget.dto.recurring.UpdateRecurringTransactionRequest;
import com.smartbudget.dto.transaction.CreateTransactionRequest;
import com.smartbudget.entity.Account;
import com.smartbudget.entity.Category;
import com.smartbudget.entity.RecurringTransaction;
import com.smartbudget.entity.User;
import com.smartbudget.entity.enums.NotificationSeverity;
import com.smartbudget.entity.enums.RecurrenceFrequency;
import com.smartbudget.exception.ResourceNotFoundException;
import com.smartbudget.repository.AccountRepository;
import com.smartbudget.repository.CategoryRepository;
import com.smartbudget.repository.RecurringTransactionRepository;
import com.smartbudget.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class RecurringTransactionService {

    private final RecurringTransactionRepository recurringTransactionRepository;
    private final AccountRepository accountRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final TransactionService transactionService;
    private final AccountService accountService;
    private final CategoryService categoryService;
    private final NotificationService notificationService;

    @Transactional(readOnly = true)
    public List<RecurringTransactionDto> getUserRecurringTransactions(Long userId) {
        return recurringTransactionRepository.findByUserIdOrderByNextExecutionDateAsc(userId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public RecurringTransactionDto getRecurringTransactionById(Long id, Long userId) {
        RecurringTransaction rec = recurringTransactionRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Recurring transaction not found with id: " + id));
        return mapToDto(rec);
    }

    @Transactional
    public RecurringTransactionDto createRecurringTransaction(Long userId, CreateRecurringTransactionRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Account account = accountRepository.findByIdAndUserId(request.getAccountId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found with id: " + request.getAccountId()));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        RecurringTransaction rec = RecurringTransaction.builder()
                .user(user)
                .account(account)
                .category(category)
                .transactionType(request.getTransactionType())
                .amount(request.getAmount())
                .frequency(request.getFrequency())
                .intervalCount(request.getIntervalCount() != null ? request.getIntervalCount() : 1)
                .startDate(request.getStartDate())
                .nextExecutionDate(request.getStartDate())
                .endDate(request.getEndDate())
                .description(request.getDescription().trim())
                .paymentMethod(request.getPaymentMethod())
                .isActive(true)
                .build();

        RecurringTransaction saved = recurringTransactionRepository.save(rec);
        return mapToDto(saved);
    }

    @Transactional
    public RecurringTransactionDto updateRecurringTransaction(Long id, Long userId, UpdateRecurringTransactionRequest request) {
        RecurringTransaction rec = recurringTransactionRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Recurring transaction not found with id: " + id));

        Account account = accountRepository.findByIdAndUserId(request.getAccountId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found with id: " + request.getAccountId()));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        rec.setAccount(account);
        rec.setCategory(category);
        rec.setTransactionType(request.getTransactionType());
        rec.setAmount(request.getAmount());
        rec.setFrequency(request.getFrequency());
        if (request.getIntervalCount() != null) rec.setIntervalCount(request.getIntervalCount());
        rec.setStartDate(request.getStartDate());
        if (request.getNextExecutionDate() != null) rec.setNextExecutionDate(request.getNextExecutionDate());
        rec.setEndDate(request.getEndDate());
        rec.setDescription(request.getDescription().trim());
        if (request.getPaymentMethod() != null) rec.setPaymentMethod(request.getPaymentMethod());
        if (request.getIsActive() != null) rec.setIsActive(request.getIsActive());

        RecurringTransaction updated = recurringTransactionRepository.save(rec);
        return mapToDto(updated);
    }

    @Transactional
    public void deleteRecurringTransaction(Long id, Long userId) {
        RecurringTransaction rec = recurringTransactionRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Recurring transaction not found with id: " + id));

        recurringTransactionRepository.delete(rec);
    }

    @Transactional
    public void triggerNow(Long id, Long userId) {
        RecurringTransaction rec = recurringTransactionRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Recurring transaction not found with id: " + id));

        executeRecurringTransaction(rec, LocalDate.now());
    }

    @Scheduled(cron = "0 0 1 * * ?") // Runs daily at 01:00 AM UTC
    @Transactional
    public void processDueRecurringTransactions() {
        LocalDate today = LocalDate.now();
        List<RecurringTransaction> dueItems = recurringTransactionRepository.findDueRecurringTransactions(today);
        log.info("Processing {} due recurring transactions on {}", dueItems.size(), today);

        for (RecurringTransaction rec : dueItems) {
            try {
                executeRecurringTransaction(rec, rec.getNextExecutionDate());
            } catch (Exception e) {
                log.error("Failed to execute recurring transaction ID {}", rec.getId(), e);
            }
        }
    }

    private void executeRecurringTransaction(RecurringTransaction rec, LocalDate executionDate) {
        // Create the actual transaction
        CreateTransactionRequest txReq = CreateTransactionRequest.builder()
                .accountId(rec.getAccount().getId())
                .categoryId(rec.getCategory().getId())
                .transactionType(rec.getTransactionType())
                .amount(rec.getAmount())
                .currency(rec.getAccount().getCurrency())
                .transactionDate(executionDate)
                .description(rec.getDescription())
                .paymentMethod(rec.getPaymentMethod())
                .notes("Auto-generated from recurring transaction #" + rec.getId())
                .build();

        transactionService.createTransaction(rec.getUser().getId(), txReq);

        // Send alert notification
        notificationService.createNotification(
                rec.getUser().getId(),
                "Recurring " + rec.getTransactionType() + " Executed",
                "Processed scheduled " + rec.getDescription() + " for " + rec.getAccount().getCurrency() + " " + rec.getAmount(),
                "RECURRING_EXECUTED",
                NotificationSeverity.INFO,
                null
        );

        // Calculate next execution date
        LocalDate nextDate = computeNextDate(rec.getNextExecutionDate(), rec.getFrequency(), rec.getIntervalCount());

        if (rec.getEndDate() != null && nextDate.isAfter(rec.getEndDate())) {
            rec.setIsActive(false);
        } else {
            rec.setNextExecutionDate(nextDate);
        }

        recurringTransactionRepository.save(rec);
    }

    private LocalDate computeNextDate(LocalDate current, RecurrenceFrequency frequency, int interval) {
        return switch (frequency) {
            case DAILY -> current.plusDays(interval);
            case WEEKLY -> current.plusWeeks(interval);
            case MONTHLY -> current.plusMonths(interval);
            case QUARTERLY -> current.plusMonths(3L * interval);
            case YEARLY -> current.plusYears(interval);
        };
    }

    public RecurringTransactionDto mapToDto(RecurringTransaction rec) {
        if (rec == null) return null;
        return RecurringTransactionDto.builder()
                .id(rec.getId())
                .account(accountService.mapToDto(rec.getAccount()))
                .category(categoryService.mapToDto(rec.getCategory()))
                .transactionType(rec.getTransactionType())
                .amount(rec.getAmount())
                .frequency(rec.getFrequency())
                .intervalCount(rec.getIntervalCount())
                .startDate(rec.getStartDate())
                .nextExecutionDate(rec.getNextExecutionDate())
                .endDate(rec.getEndDate())
                .description(rec.getDescription())
                .paymentMethod(rec.getPaymentMethod())
                .isActive(rec.getIsActive())
                .createdAt(rec.getCreatedAt())
                .build();
    }
}
