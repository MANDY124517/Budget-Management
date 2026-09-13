package com.smartbudget.dto.recurring;

import com.smartbudget.entity.enums.PaymentMethod;
import com.smartbudget.entity.enums.RecurrenceFrequency;
import com.smartbudget.entity.enums.TransactionType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateRecurringTransactionRequest {

    @NotNull(message = "Account ID is required")
    private Long accountId;

    @NotNull(message = "Category ID is required")
    private Long categoryId;

    @NotNull(message = "Transaction type is required")
    private TransactionType transactionType;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0.00")
    private BigDecimal amount;

    @NotNull(message = "Frequency is required")
    private RecurrenceFrequency frequency;

    @Min(value = 1, message = "Interval count must be at least 1")
    private Integer intervalCount;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    private LocalDate nextExecutionDate;
    private LocalDate endDate;

    @NotBlank(message = "Description is required")
    @Size(max = 255, message = "Description must not exceed 255 characters")
    private String description;

    private PaymentMethod paymentMethod;
    private Boolean isActive;
}
