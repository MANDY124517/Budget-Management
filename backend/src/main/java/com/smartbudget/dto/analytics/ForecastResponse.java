package com.smartbudget.dto.analytics;

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
public class ForecastResponse {
    private String nextMonth;
    private BigDecimal predictedExpense;
    private BigDecimal lowerBound;
    private BigDecimal upperBound;
    private BigDecimal confidenceScore;
    private String modelUsed;
    private String rationale;
    private List<ForecastDataPoint> historicalAndProjected;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ForecastDataPoint {
        private String month;
        private BigDecimal actualExpense;
        private BigDecimal projectedExpense;
        private Boolean isProjection;
    }
}
