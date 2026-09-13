package com.smartbudget.dto.recurring;

import com.smartbudget.dto.account.AccountDto;
import com.smartbudget.dto.category.CategoryDto;
import com.smartbudget.entity.enums.PaymentMethod;
import com.smartbudget.entity.enums.RecurrenceFrequency;
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
public class RecurringTransactionDto {
    private Long id;
    private AccountDto account;
    private CategoryDto category;
    private TransactionType transactionType;
    private BigDecimal amount;
    private RecurrenceFrequency frequency;
    private Integer intervalCount;
    private LocalDate startDate;
    private LocalDate nextExecutionDate;
    private LocalDate endDate;
    private String description;
    private PaymentMethod paymentMethod;
    private Boolean isActive;
    private Instant createdAt;
}
