package com.smartbudget.dto.transaction;

import com.smartbudget.dto.account.AccountDto;
import com.smartbudget.dto.category.CategoryDto;
import com.smartbudget.entity.enums.PaymentMethod;
import com.smartbudget.entity.enums.TransactionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionDto {
    private Long id;
    private AccountDto account;
    private CategoryDto category;
    private AccountDto transferTargetAccount;
    private TransactionType transactionType;
    private BigDecimal amount;
    private String currency;
    private LocalDate transactionDate;
    private String description;
    private PaymentMethod paymentMethod;
    private String notes;
    private Boolean isRecurring;
    private Long recurringTransactionId;
    private Instant createdAt;
}
