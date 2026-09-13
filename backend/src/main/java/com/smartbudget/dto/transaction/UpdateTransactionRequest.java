package com.smartbudget.dto.transaction;

import com.smartbudget.entity.enums.PaymentMethod;
import com.smartbudget.entity.enums.TransactionType;
import jakarta.validation.constraints.DecimalMin;
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
public class UpdateTransactionRequest {

    @NotNull(message = "Account ID is required")
    private Long accountId;

    @NotNull(message = "Category ID is required")
    private Long categoryId;

    private Long transferTargetAccountId;

    @NotNull(message = "Transaction type is required")
    private TransactionType transactionType;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0.00")
    private BigDecimal amount;

    @NotNull(message = "Transaction date is required")
    private LocalDate transactionDate;

    @NotBlank(message = "Description is required")
    @Size(max = 255, message = "Description must not exceed 255 characters")
    private String description;

    @Builder.Default
    private PaymentMethod paymentMethod = PaymentMethod.OTHER;

    private String notes;
}
