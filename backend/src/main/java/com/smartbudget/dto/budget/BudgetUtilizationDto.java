package com.smartbudget.dto.budget;

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
public class BudgetUtilizationDto {
    private Long budgetId;
    private String name;
    private String period;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal totalBudgetAmount;
    private BigDecimal totalSpent;
    private BigDecimal remainingAmount;
    private BigDecimal utilizationPercentage;
    private BigDecimal alertThreshold;
    private String status; // ON_TRACK, NEAR_LIMIT, EXCEEDED
    private List<CategoryBudgetUtilizationDto> categories;
}
