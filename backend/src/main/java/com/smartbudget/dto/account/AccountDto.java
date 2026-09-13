package com.smartbudget.dto.account;

import com.smartbudget.entity.enums.AccountType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AccountDto {
    private Long id;
    private String name;
    private AccountType accountType;
    private BigDecimal balance;
    private String currency;
    private String institutionName;
    private String accountNumberMask;
    private Boolean isActive;
    private Instant createdAt;
}
