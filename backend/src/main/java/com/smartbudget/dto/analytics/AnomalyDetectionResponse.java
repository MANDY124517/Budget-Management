package com.smartbudget.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnomalyDetectionResponse {
    private int totalAnomaliesDetected;
    private List<AnomalyDto> anomalies;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AnomalyDto {
        private Long transactionId;
        private LocalDate date;
        private String category;
        private String description;
        private BigDecimal amount;
        private BigDecimal categoryMean;
        private BigDecimal deviationPercentage;
        private Double zScore;
        private String severity; // LOW, MEDIUM, HIGH
        private String reason;
    }
}
