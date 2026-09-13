package com.smartbudget.dto.account;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AccountSummaryDto {
    private BigDecimal netWorth;
    private BigDecimal totalCashAndBank;
    private BigDecimal totalCreditCardLiabilities;
    private BigDecimal totalInvestments;
    private int activeAccountsCount;
    private List<AccountDto> accounts;
}
