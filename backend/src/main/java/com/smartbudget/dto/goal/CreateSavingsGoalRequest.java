package com.smartbudget.dto.goal;

import com.smartbudget.entity.enums.GoalPriority;
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

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateSavingsGoalRequest {

    @NotBlank(message = "Goal name is required")
    @Size(max = 100, message = "Goal name must not exceed 100 characters")
    private String name;

    private Long targetAccountId;

    @NotNull(message = "Target amount is required")
    @DecimalMin(value = "0.01", message = "Target amount must be greater than 0.00")
    private BigDecimal targetAmount;

    @Builder.Default
    private BigDecimal currentAmount = BigDecimal.ZERO;

    @NotNull(message = "Target date is required")
    private LocalDate targetDate;

    @Builder.Default
    private GoalPriority priority = GoalPriority.MEDIUM;

    private String description;
}
