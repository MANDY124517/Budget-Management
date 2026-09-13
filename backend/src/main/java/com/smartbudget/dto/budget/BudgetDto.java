package com.smartbudget.dto.budget;

import com.smartbudget.entity.enums.BudgetPeriod;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BudgetDto {
    private Long id;
    private String name;
    private BudgetPeriod period;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal totalBudgetAmount;
    private BigDecimal alertThresholdPercentage;
    private Boolean isActive;
    private List<BudgetCategoryDto> categories;
    private Instant createdAt;
}
