package com.smartbudget.dto.analytics;

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
public class InsightDto {
    private Long id;
    private String type; // SPENDING_TREND, CATEGORY_SURGE, BUDGET_PACE, GOAL_PROJECTION, SAVINGS_MILESTONE
    private String title;
    private String summary;
    private String severity; // INFO, WARNING, SUCCESS, DANGER
    private BigDecimal confidenceScore;
    private Instant createdAt;
}
