package com.smartbudget.dto.goal;

import com.smartbudget.entity.enums.GoalPriority;
import com.smartbudget.entity.enums.GoalStatus;
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
public class UpdateSavingsGoalRequest {

    @NotBlank(message = "Goal name is required")
    @Size(max = 100, message = "Goal name must not exceed 100 characters")
    private String name;

    private Long targetAccountId;

    @NotNull(message = "Target amount is required")
    @DecimalMin(value = "0.01", message = "Target amount must be greater than 0.00")
    private BigDecimal targetAmount;

    @NotNull(message = "Current amount is required")
    @DecimalMin(value = "0.00", message = "Current amount must be non-negative")
    private BigDecimal currentAmount;

    @NotNull(message = "Target date is required")
    private LocalDate targetDate;

    @NotNull(message = "Priority is required")
    private GoalPriority priority;

    @NotNull(message = "Status is required")
    private GoalStatus status;

    private String description;
}
