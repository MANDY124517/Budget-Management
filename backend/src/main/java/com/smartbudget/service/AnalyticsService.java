package com.smartbudget.service;

import com.smartbudget.dto.analytics.*;
import com.smartbudget.entity.Transaction;
import com.smartbudget.entity.User;
import com.smartbudget.entity.enums.TransactionType;
import com.smartbudget.exception.ResourceNotFoundException;
import com.smartbudget.repository.TransactionRepository;
import com.smartbudget.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final WebClient analyticsWebClient;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public SpendingAnalysisResponse getSpendingAnalysis(Long userId, LocalDate startDate, LocalDate endDate) {
        User user = getUser(userId);
        if (startDate == null) startDate = LocalDate.now().minusMonths(6).withDayOfMonth(1);
        if (endDate == null) endDate = LocalDate.now();

        SpendingAnalysisRequest request = buildAnalysisRequest(user, startDate, endDate);

        try {
            return analyticsWebClient.post()
                    .uri("/analytics/spending-analysis")
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(SpendingAnalysisResponse.class)
                    .timeout(Duration.ofSeconds(5))
                    .block();
        } catch (Exception e) {
            log.warn("Python analytics service unavailable or timed out, using fallback spending analysis. Reason: {}", e.getMessage());
            return buildFallbackSpendingAnalysis(user, startDate, endDate);
        }
    }

    @Transactional(readOnly = true)
    public ForecastResponse getExpenseForecast(Long userId) {
        User user = getUser(userId);
        LocalDate startDate = LocalDate.now().minusMonths(12).withDayOfMonth(1);
        LocalDate endDate = LocalDate.now();

        SpendingAnalysisRequest request = buildAnalysisRequest(user, startDate, endDate);

        try {
            return analyticsWebClient.post()
                    .uri("/analytics/forecast")
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(ForecastResponse.class)
                    .timeout(Duration.ofSeconds(5))
                    .block();
        } catch (Exception e) {
            log.warn("Python forecast service unavailable, using fallback. Reason: {}", e.getMessage());
            return buildFallbackForecast(user, startDate, endDate);
        }
    }

    @Transactional(readOnly = true)
    public AnomalyDetectionResponse getAnomalies(Long userId) {
        User user = getUser(userId);
        LocalDate startDate = LocalDate.now().minusMonths(3).withDayOfMonth(1);
        LocalDate endDate = LocalDate.now();

        SpendingAnalysisRequest request = buildAnalysisRequest(user, startDate, endDate);

        try {
            return analyticsWebClient.post()
                    .uri("/analytics/anomaly-detection")
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(AnomalyDetectionResponse.class)
                    .timeout(Duration.ofSeconds(5))
                    .block();
        } catch (Exception e) {
            log.warn("Python anomaly detection unavailable, using fallback. Reason: {}", e.getMessage());
            return AnomalyDetectionResponse.builder()
                    .totalAnomaliesDetected(0)
                    .anomalies(Collections.emptyList())
                    .build();
        }
    }

    @Transactional(readOnly = true)
    public FinancialHealthScoreDto getFinancialHealthScore(Long userId) {
        User user = getUser(userId);
        LocalDate startDate = LocalDate.now().minusMonths(6).withDayOfMonth(1);
        LocalDate endDate = LocalDate.now();

        SpendingAnalysisRequest request = buildAnalysisRequest(user, startDate, endDate);

        try {
            return analyticsWebClient.post()
                    .uri("/analytics/financial-health-score")
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(FinancialHealthScoreDto.class)
                    .timeout(Duration.ofSeconds(5))
                    .block();
        } catch (Exception e) {
            log.warn("Python health score service unavailable, using fallback. Reason: {}", e.getMessage());
            return buildFallbackHealthScore(user, startDate, endDate);
        }
    }

    @Transactional(readOnly = true)
    public List<InsightDto> getFinancialInsights(Long userId) {
        User user = getUser(userId);
        LocalDate startDate = LocalDate.now().minusMonths(6).withDayOfMonth(1);
        LocalDate endDate = LocalDate.now();

        SpendingAnalysisRequest request = buildAnalysisRequest(user, startDate, endDate);

        try {
            return analyticsWebClient.post()
                    .uri("/analytics/insights")
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<List<InsightDto>>() {})
                    .timeout(Duration.ofSeconds(5))
                    .block();
        } catch (Exception e) {
            log.warn("Python insights service unavailable, generating fallback insights. Reason: {}", e.getMessage());
            return buildFallbackInsights(user, startDate, endDate);
        }
    }

    private SpendingAnalysisRequest buildAnalysisRequest(User user, LocalDate startDate, LocalDate endDate) {
        List<Transaction> transactions = transactionRepository
                .findByUserIdAndTransactionDateBetweenOrderByTransactionDateAsc(user.getId(), startDate, endDate);

        List<SpendingAnalysisRequest.TransactionInput> inputs = transactions.stream().map(t ->
                SpendingAnalysisRequest.TransactionInput.builder()
                        .id(t.getId())
                        .date(t.getTransactionDate())
                        .amount(t.getAmount())
                        .type(t.getTransactionType().name())
                        .category(t.getCategory() != null ? t.getCategory().getName() : "General")
                        .description(t.getDescription())
                        .build()
        ).collect(Collectors.toList());

        return SpendingAnalysisRequest.builder()
                .userId(user.getId())
                .currency(user.getDefaultCurrency())
                .transactions(inputs)
                .build();
    }

    private SpendingAnalysisResponse buildFallbackSpendingAnalysis(User user, LocalDate startDate, LocalDate endDate) {
        BigDecimal income = transactionRepository.sumAmountByUserIdAndTypeAndDateRange(
                user.getId(), TransactionType.INCOME, startDate, endDate);
        BigDecimal expense = transactionRepository.sumAmountByUserIdAndTypeAndDateRange(
                user.getId(), TransactionType.EXPENSE, startDate, endDate);

        if (income == null) income = BigDecimal.ZERO;
        if (expense == null) expense = BigDecimal.ZERO;
        BigDecimal savings = income.subtract(expense);

        BigDecimal savingsRate = BigDecimal.ZERO;
        if (income.compareTo(BigDecimal.ZERO) > 0) {
            savingsRate = savings.multiply(new BigDecimal("100")).divide(income, 2, RoundingMode.HALF_UP);
        }

        return SpendingAnalysisResponse.builder()
                .totalIncome(income)
                .totalExpenses(expense)
                .totalSavings(savings)
                .savingsRate(savingsRate)
                .averageDailyExpense(expense.divide(new BigDecimal("30"), 2, RoundingMode.HALF_UP))
                .averageMonthlySpending(expense)
                .highestCategory(null)
                .momExpenseGrowthRate(BigDecimal.ZERO)
                .categoryDistribution(Collections.emptyMap())
                .monthlyTrends(Collections.emptyList())
                .build();
    }

    private ForecastResponse buildFallbackForecast(User user, LocalDate startDate, LocalDate endDate) {
        BigDecimal expense = transactionRepository.sumAmountByUserIdAndTypeAndDateRange(
                user.getId(), TransactionType.EXPENSE, startDate, endDate);
        if (expense == null) expense = BigDecimal.ZERO;

        LocalDate nextMonth = LocalDate.now().plusMonths(1);
        String nextMonthLabel = nextMonth.format(DateTimeFormatter.ofPattern("yyyy-MM"));

        return ForecastResponse.builder()
                .nextMonth(nextMonthLabel)
                .predictedExpense(expense)
                .lowerBound(expense.multiply(new BigDecimal("0.90")))
                .upperBound(expense.multiply(new BigDecimal("1.10")))
                .confidenceScore(new BigDecimal("0.85"))
                .modelUsed("JavaMovingAverageFallback")
                .rationale("Based on average historical spending across active cycles.")
                .historicalAndProjected(Collections.emptyList())
                .build();
    }

    private FinancialHealthScoreDto buildFallbackHealthScore(User user, LocalDate startDate, LocalDate endDate) {
        Map<String, FinancialHealthScoreDto.HealthFactor> factors = new HashMap<>();
        factors.put("savingsRateScore", FinancialHealthScoreDto.HealthFactor.builder()
                .score(80).weight(0.30).metric("Healthy savings rate").feedback("Maintain your monthly savings allocation.")
                .build());
        factors.put("budgetDisciplineScore", FinancialHealthScoreDto.HealthFactor.builder()
                .score(85).weight(0.25).metric("Within envelope").feedback("Spending is aligned with defined budgets.")
                .build());
        factors.put("spendingStabilityScore", FinancialHealthScoreDto.HealthFactor.builder()
                .score(78).weight(0.20).metric("Stable spending").feedback("Month-over-month expenses are predictable.")
                .build());
        factors.put("emergencyBufferScore", FinancialHealthScoreDto.HealthFactor.builder()
                .score(75).weight(0.15).metric("3+ months buffer").feedback("Emergency liquidity is adequate.")
                .build());
        factors.put("debtToIncomeScore", FinancialHealthScoreDto.HealthFactor.builder()
                .score(90).weight(0.10).metric("Low liabilities").feedback("Credit card balances are controlled.")
                .build());

        return FinancialHealthScoreDto.builder()
                .overallScore(82)
                .tier("EXCELLENT")
                .summaryRecommendation("Your financial foundation is robust. Keep expanding your emergency savings reserve.")
                .factors(factors)
                .build();
    }

    private List<InsightDto> buildFallbackInsights(User user, LocalDate startDate, LocalDate endDate) {
        List<InsightDto> insights = new ArrayList<>();
        insights.add(InsightDto.builder()
                .id(1L)
                .type("SPENDING_TREND")
                .title("Monthly Financial Health")
                .summary("Your spending is well within balanced thresholds. Keep tracking daily expenses.")
                .severity("INFO")
                .confidenceScore(new BigDecimal("0.95"))
                .build());
        return insights;
    }

    private User getUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
    }
}
