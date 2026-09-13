package com.smartbudget.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FinancialHealthScoreDto {
    private int overallScore; // 0 - 100
    private String tier; // EXCELLENT, GOOD, FAIR, NEEDS_ATTENTION, CRITICAL
    private String summaryRecommendation;
    private Map<String, HealthFactor> factors;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HealthFactor {
        private int score; // 0 - 100
        private double weight;
        private String metric;
        private String feedback;
    }
}
