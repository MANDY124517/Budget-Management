package com.smartbudget.service;

import com.smartbudget.dto.account.AccountDto;
import com.smartbudget.dto.analytics.DashboardOverviewDto;
import com.smartbudget.dto.analytics.InsightDto;
import com.smartbudget.dto.budget.BudgetUtilizationDto;
import com.smartbudget.dto.goal.SavingsGoalDto;
import com.smartbudget.dto.transaction.CategorySpendingDto;
import com.smartbudget.dto.transaction.TransactionDto;
import com.smartbudget.dto.transaction.TransactionFilterRequest;
import com.smartbudget.entity.User;
import com.smartbudget.entity.enums.TransactionType;
import com.smartbudget.exception.ResourceNotFoundException;
import com.smartbudget.repository.AccountRepository;
import com.smartbudget.repository.TransactionRepository;
import com.smartbudget.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class DashboardService {

    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final AccountService accountService;
    private final TransactionService transactionService;
    private final BudgetService budgetService;
    private final SavingsGoalService savingsGoalService;
    private final AnalyticsService analyticsService;

    @Transactional(readOnly = true)
    public DashboardOverviewDto getDashboardOverview(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        LocalDate now = LocalDate.now();
        LocalDate startOfMonth = now.with(TemporalAdjusters.firstDayOfMonth());
        LocalDate endOfMonth = now.with(TemporalAdjusters.lastDayOfMonth());

        // 1. Total Balance
        BigDecimal totalBalance = accountRepository.sumTotalBalanceByUserId(userId);
        if (totalBalance == null) totalBalance = BigDecimal.ZERO;

        // 2. Current Month Income & Expenses
        BigDecimal monthlyIncome = transactionRepository.sumAmountByUserIdAndTypeAndDateRange(
                userId, TransactionType.INCOME, startOfMonth, endOfMonth);
        if (monthlyIncome == null) monthlyIncome = BigDecimal.ZERO;

        BigDecimal monthlyExpenses = transactionRepository.sumAmountByUserIdAndTypeAndDateRange(
                userId, TransactionType.EXPENSE, startOfMonth, endOfMonth);
        if (monthlyExpenses == null) monthlyExpenses = BigDecimal.ZERO;

        BigDecimal monthlySavings = monthlyIncome.subtract(monthlyExpenses);

        BigDecimal savingsRate = BigDecimal.ZERO;
        if (monthlyIncome.compareTo(BigDecimal.ZERO) > 0) {
            savingsRate = monthlySavings.multiply(new BigDecimal("100"))
                    .divide(monthlyIncome, 2, RoundingMode.HALF_UP);
        }

        // 3. Active Budget & Remaining
        BudgetUtilizationDto activeBudget = budgetService.getCurrentBudgetUtilization(userId);
        BigDecimal budgetRemaining = BigDecimal.ZERO;
        if (activeBudget != null) {
            budgetRemaining = activeBudget.getRemainingAmount();
        }

        // 4. Accounts
        List<AccountDto> accounts = accountService.getUserAccounts(userId);

        // 5. Recent Transactions (First page of 7 items)
        TransactionFilterRequest filter = TransactionFilterRequest.builder()
                .page(0)
                .size(7)
                .sort("transactionDate,desc")
                .build();
        List<TransactionDto> recentTransactions = transactionService.getTransactions(userId, filter).getContent();

        // 6. Top Spending Categories
        List<CategorySpendingDto> topCategories = transactionService.getCategorySpendingSummary(
                userId, startOfMonth, endOfMonth);

        // 7. Savings Goals
        List<SavingsGoalDto> goals = savingsGoalService.getUserGoals(userId);

        // 8. AI Insights
        List<InsightDto> insights = analyticsService.getFinancialInsights(userId);

        return DashboardOverviewDto.builder()
                .totalBalance(totalBalance)
                .monthlyIncome(monthlyIncome)
                .monthlyExpenses(monthlyExpenses)
                .monthlySavings(monthlySavings)
                .savingsRate(savingsRate)
                .budgetRemaining(budgetRemaining)
                .currency(user.getDefaultCurrency())
                .accounts(accounts)
                .recentTransactions(recentTransactions)
                .topExpenseCategories(topCategories)
                .activeBudget(activeBudget)
                .activeGoals(goals)
                .topInsights(insights)
                .build();
    }
}
