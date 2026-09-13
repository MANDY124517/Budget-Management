package com.smartbudget.dto.analytics;

import com.smartbudget.dto.account.AccountDto;
import com.smartbudget.dto.budget.BudgetUtilizationDto;
import com.smartbudget.dto.goal.SavingsGoalDto;
import com.smartbudget.dto.transaction.CategorySpendingDto;
import com.smartbudget.dto.transaction.TransactionDto;
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
public class DashboardOverviewDto {
    private BigDecimal totalBalance;
    private BigDecimal monthlyIncome;
    private BigDecimal monthlyExpenses;
    private BigDecimal monthlySavings;
    private BigDecimal savingsRate;
    private BigDecimal budgetRemaining;
    private String currency;

    private List<AccountDto> accounts;
    private List<TransactionDto> recentTransactions;
    private List<CategorySpendingDto> topExpenseCategories;
    private BudgetUtilizationDto activeBudget;
    private List<SavingsGoalDto> activeGoals;
    private List<InsightDto> topInsights;
}
