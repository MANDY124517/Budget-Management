package com.smartbudget.dto.budget;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryBudgetUtilizationDto {
    private Long categoryId;
    private String categoryName;
    private String categoryIcon;
    private String categoryColor;
    private BigDecimal allocatedAmount;
    private BigDecimal spentAmount;
    private BigDecimal remainingAmount;
    private BigDecimal utilizationPercentage;
    private Boolean isExceeded;
    private String alertTriggered; // null, WARNING_80_PERCENT, WARNING_100_PERCENT, WARNING_120_PERCENT
}
