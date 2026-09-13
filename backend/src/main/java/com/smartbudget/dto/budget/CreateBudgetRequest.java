package com.smartbudget.dto.budget;

import com.smartbudget.entity.enums.BudgetPeriod;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
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
public class CreateBudgetRequest {

    @NotBlank(message = "Budget name is required")
    @Size(max = 100, message = "Budget name must not exceed 100 characters")
    private String name;

    @NotNull(message = "Budget period is required")
    private BudgetPeriod period;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    private LocalDate endDate;

    @NotNull(message = "Total budget amount is required")
    @DecimalMin(value = "0.01", message = "Budget amount must be greater than 0.00")
    private BigDecimal totalBudgetAmount;

    @Builder.Default
    private BigDecimal alertThresholdPercentage = new BigDecimal("80.00");

    private List<CategoryAllocationRequest> categoryAllocations;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryAllocationRequest {
        @NotNull(message = "Category ID is required")
        private Long categoryId;

        @NotNull(message = "Allocated amount is required")
        @DecimalMin(value = "0.00", message = "Allocated amount must be non-negative")
        private BigDecimal allocatedAmount;
    }
}
