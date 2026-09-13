package com.smartbudget.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SpendingAnalysisResponse {
    private BigDecimal totalIncome;
    private BigDecimal totalExpenses;
    private BigDecimal totalSavings;
    private BigDecimal savingsRate;
    private BigDecimal averageDailyExpense;
    private BigDecimal averageMonthlySpending;
    private HighestCategoryInfo highestCategory;
    private BigDecimal momExpenseGrowthRate;
    private Map<String, BigDecimal> categoryDistribution;
    private List<MonthlyTrendPoint> monthlyTrends;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HighestCategoryInfo {
        private String name;
        private BigDecimal amount;
        private BigDecimal percentage;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyTrendPoint {
        private String month;
        private BigDecimal income;
        private BigDecimal expense;
        private BigDecimal savings;
    }
}
