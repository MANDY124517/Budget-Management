package com.smartbudget.dto.goal;

import com.smartbudget.entity.enums.GoalPriority;
import com.smartbudget.entity.enums.GoalStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SavingsGoalDto {
    private Long id;
    private String name;
    private Long targetAccountId;
    private String targetAccountName;
    private BigDecimal targetAmount;
    private BigDecimal currentAmount;
    private BigDecimal remainingAmount;
    private BigDecimal progressPercentage;
    private LocalDate targetDate;
    private GoalPriority priority;
    private GoalStatus status;
    private String description;
    private BigDecimal requiredMonthlySavings;
    private Instant createdAt;
}
