package com.smartbudget.dto.account;

import com.smartbudget.entity.enums.AccountType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateAccountRequest {

    @NotBlank(message = "Account name is required")
    @Size(max = 100, message = "Account name must not exceed 100 characters")
    private String name;

    @NotNull(message = "Account type is required")
    private AccountType accountType;

    @Builder.Default
    private BigDecimal initialBalance = BigDecimal.ZERO;

    @Builder.Default
    private String currency = "INR";

    private String institutionName;
    private String accountNumberMask;
}
