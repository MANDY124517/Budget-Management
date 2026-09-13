package com.smartbudget.service;

import com.smartbudget.dto.common.PagedResponse;
import com.smartbudget.dto.transaction.*;
import com.smartbudget.entity.Account;
import com.smartbudget.entity.Category;
import com.smartbudget.entity.Transaction;
import com.smartbudget.entity.User;
import com.smartbudget.entity.enums.TransactionType;
import com.smartbudget.exception.BadRequestException;
import com.smartbudget.exception.ResourceNotFoundException;
import com.smartbudget.repository.AccountRepository;
import com.smartbudget.repository.CategoryRepository;
import com.smartbudget.repository.TransactionRepository;
import com.smartbudget.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final AccountService accountService;
    private final CategoryService categoryService;

    @Transactional(readOnly = true)
    public PagedResponse<TransactionDto> getTransactions(Long userId, TransactionFilterRequest filter) {
        String[] sortParams = filter.getSort().split(",");
        String sortField = sortParams[0];
        Sort.Direction direction = sortParams.length > 1 && sortParams[1].equalsIgnoreCase("asc")
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;

        Pageable pageable = PageRequest.of(filter.getPage(), filter.getSize(), Sort.by(direction, sortField));

        Page<Transaction> page = transactionRepository.filterTransactions(
                userId,
                filter.getStartDate(),
                filter.getEndDate(),
                filter.getType(),
                filter.getCategoryId(),
                filter.getAccountId(),
                filter.getSearch(),
                pageable
        );

        return PagedResponse.<TransactionDto>builder()
                .content(page.getContent().stream().map(this::mapToDto).collect(Collectors.toList()))
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .isLast(page.isLast())
                .build();
    }

    @Transactional(readOnly = true)
    public TransactionDto getTransactionById(Long transactionId, Long userId) {
        Transaction transaction = transactionRepository.findByIdAndUserId(transactionId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with id: " + transactionId));
        return mapToDto(transaction);
    }

    @Transactional
    public TransactionDto createTransaction(Long userId, CreateTransactionRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Account account = accountRepository.findByIdAndUserId(request.getAccountId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found with id: " + request.getAccountId()));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        Account transferTargetAccount = null;
        if (request.getTransactionType() == TransactionType.TRANSFER) {
            if (request.getTransferTargetAccountId() == null) {
                throw new BadRequestException("Transfer target account ID is required for transfer transactions");
            }
            if (request.getAccountId().equals(request.getTransferTargetAccountId())) {
                throw new BadRequestException("Source and target accounts must be different for transfers");
            }
            transferTargetAccount = accountRepository.findByIdAndUserId(request.getTransferTargetAccountId(), userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Target account not found with id: " + request.getTransferTargetAccountId()));
        }

        // Apply balance update
        applyBalanceEffect(account, transferTargetAccount, request.getTransactionType(), request.getAmount());

        Transaction transaction = Transaction.builder()
                .user(user)
                .account(account)
                .category(category)
                .transferTargetAccount(transferTargetAccount)
                .transactionType(request.getTransactionType())
                .amount(request.getAmount())
                .currency(request.getCurrency() != null ? request.getCurrency().toUpperCase().trim() : user.getDefaultCurrency())
                .transactionDate(request.getTransactionDate())
                .description(request.getDescription().trim())
                .paymentMethod(request.getPaymentMethod())
                .notes(request.getNotes())
                .isRecurring(false)
                .build();

        Transaction saved = transactionRepository.save(transaction);
        return mapToDto(saved);
    }

    @Transactional
    public TransactionDto updateTransaction(Long transactionId, Long userId, UpdateTransactionRequest request) {
        Transaction transaction = transactionRepository.findByIdAndUserId(transactionId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with id: " + transactionId));

        Account newAccount = accountRepository.findByIdAndUserId(request.getAccountId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found with id: " + request.getAccountId()));

        Category newCategory = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        Account newTransferTargetAccount = null;
        if (request.getTransactionType() == TransactionType.TRANSFER) {
            if (request.getTransferTargetAccountId() == null) {
                throw new BadRequestException("Transfer target account ID is required for transfers");
            }
            if (request.getAccountId().equals(request.getTransferTargetAccountId())) {
                throw new BadRequestException("Source and target accounts must be different for transfers");
            }
            newTransferTargetAccount = accountRepository.findByIdAndUserId(request.getTransferTargetAccountId(), userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Target account not found with id: " + request.getTransferTargetAccountId()));
        }

        // 1. Revert original balance effect
        revertBalanceEffect(transaction.getAccount(), transaction.getTransferTargetAccount(), transaction.getTransactionType(), transaction.getAmount());

        // 2. Apply new balance effect
        applyBalanceEffect(newAccount, newTransferTargetAccount, request.getTransactionType(), request.getAmount());

        // 3. Update entity fields
        transaction.setAccount(newAccount);
        transaction.setCategory(newCategory);
        transaction.setTransferTargetAccount(newTransferTargetAccount);
        transaction.setTransactionType(request.getTransactionType());
        transaction.setAmount(request.getAmount());
        transaction.setTransactionDate(request.getTransactionDate());
        transaction.setDescription(request.getDescription().trim());
        transaction.setPaymentMethod(request.getPaymentMethod());
        transaction.setNotes(request.getNotes());

        Transaction updated = transactionRepository.save(transaction);
        return mapToDto(updated);
    }

    @Transactional
    public void deleteTransaction(Long transactionId, Long userId) {
        Transaction transaction = transactionRepository.findByIdAndUserId(transactionId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with id: " + transactionId));

        // Revert balance effect
        revertBalanceEffect(transaction.getAccount(), transaction.getTransferTargetAccount(), transaction.getTransactionType(), transaction.getAmount());

        transactionRepository.delete(transaction);
    }

    @Transactional(readOnly = true)
    public List<CategorySpendingDto> getCategorySpendingSummary(Long userId, LocalDate startDate, LocalDate endDate) {
        List<TransactionRepository.CategorySpendingProjection> results =
                transactionRepository.findCategorySpendingSummary(userId, startDate, endDate);

        BigDecimal totalExpenses = results.stream()
                .map(TransactionRepository.CategorySpendingProjection::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return results.stream().map(p -> {
            BigDecimal percentage = BigDecimal.ZERO;
            if (totalExpenses.compareTo(BigDecimal.ZERO) > 0) {
                percentage = p.getTotalAmount()
                        .multiply(new BigDecimal("100"))
                        .divide(totalExpenses, 2, RoundingMode.HALF_UP);
            }
            return CategorySpendingDto.builder()
                    .categoryId(p.getCategoryId())
                    .categoryName(p.getCategoryName())
                    .icon(p.getIcon())
                    .color(p.getColor())
                    .totalAmount(p.getTotalAmount())
                    .percentage(percentage)
                    .build();
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public String exportTransactionsCsv(Long userId, LocalDate startDate, LocalDate endDate) {
        List<Transaction> transactions = transactionRepository.findByUserIdAndTransactionDateBetweenOrderByTransactionDateAsc(
                userId, startDate, endDate);

        StringBuilder sb = new StringBuilder();
        sb.append("Transaction ID,Date,Type,Amount,Currency,Category,Account,Description,Payment Method\n");

        for (Transaction t : transactions) {
            sb.append(t.getId()).append(",")
                    .append(t.getTransactionDate()).append(",")
                    .append(t.getTransactionType()).append(",")
                    .append(t.getAmount()).append(",")
                    .append(t.getCurrency()).append(",")
                    .append("\"").append(t.getCategory().getName()).append("\",")
                    .append("\"").append(t.getAccount().getName()).append("\",")
                    .append("\"").append(t.getDescription().replace("\"", "\"\"")).append("\",")
                    .append(t.getPaymentMethod())
                    .append("\n");
        }

        return sb.toString();
    }

    private void applyBalanceEffect(Account source, Account target, TransactionType type, BigDecimal amount) {
        if (type == TransactionType.INCOME) {
            source.setBalance(source.getBalance().add(amount));
            accountRepository.save(source);
        } else if (type == TransactionType.EXPENSE) {
            source.setBalance(source.getBalance().subtract(amount));
            accountRepository.save(source);
        } else if (type == TransactionType.TRANSFER) {
            source.setBalance(source.getBalance().subtract(amount));
            target.setBalance(target.getBalance().add(amount));
            accountRepository.save(source);
            accountRepository.save(target);
        }
    }

    private void revertBalanceEffect(Account source, Account target, TransactionType type, BigDecimal amount) {
        if (type == TransactionType.INCOME) {
            source.setBalance(source.getBalance().subtract(amount));
            accountRepository.save(source);
        } else if (type == TransactionType.EXPENSE) {
            source.setBalance(source.getBalance().add(amount));
            accountRepository.save(source);
        } else if (type == TransactionType.TRANSFER) {
            source.setBalance(source.getBalance().add(amount));
            if (target != null) {
                target.setBalance(target.getBalance().subtract(amount));
                accountRepository.save(target);
            }
            accountRepository.save(source);
        }
    }

    public TransactionDto mapToDto(Transaction transaction) {
        if (transaction == null) return null;
        return TransactionDto.builder()
                .id(transaction.getId())
                .account(accountService.mapToDto(transaction.getAccount()))
                .category(categoryService.mapToDto(transaction.getCategory()))
                .transferTargetAccount(transaction.getTransferTargetAccount() != null ? accountService.mapToDto(transaction.getTransferTargetAccount()) : null)
                .transactionType(transaction.getTransactionType())
                .amount(transaction.getAmount())
                .currency(transaction.getCurrency())
                .transactionDate(transaction.getTransactionDate())
                .description(transaction.getDescription())
                .paymentMethod(transaction.getPaymentMethod())
                .notes(transaction.getNotes())
                .isRecurring(transaction.getIsRecurring())
                .recurringTransactionId(transaction.getRecurringTransaction() != null ? transaction.getRecurringTransaction().getId() : null)
                .createdAt(transaction.getCreatedAt())
                .build();
    }
}
