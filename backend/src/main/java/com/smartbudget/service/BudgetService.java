package com.smartbudget.service;

import com.smartbudget.dto.budget.*;
import com.smartbudget.entity.Budget;
import com.smartbudget.entity.BudgetCategory;
import com.smartbudget.entity.Category;
import com.smartbudget.entity.User;
import com.smartbudget.exception.ResourceNotFoundException;
import com.smartbudget.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final BudgetCategoryRepository budgetCategoryRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;

    @Transactional(readOnly = true)
    public List<BudgetDto> getUserBudgets(Long userId) {
        return budgetRepository.findByUserIdAndIsActiveTrueOrderByStartDateDesc(userId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BudgetDto getBudgetById(Long budgetId, Long userId) {
        Budget budget = budgetRepository.findByIdAndUserId(budgetId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Budget not found with id: " + budgetId));
        return mapToDto(budget);
    }

    @Transactional
    public BudgetDto createBudget(Long userId, CreateBudgetRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Budget budget = Budget.builder()
                .user(user)
                .name(request.getName().trim())
                .period(request.getPeriod())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .totalBudgetAmount(request.getTotalBudgetAmount())
                .alertThresholdPercentage(request.getAlertThresholdPercentage() != null ? request.getAlertThresholdPercentage() : new BigDecimal("80.00"))
                .isActive(true)
                .build();

        Budget savedBudget = budgetRepository.save(budget);

        if (request.getCategoryAllocations() != null && !request.getCategoryAllocations().isEmpty()) {
            for (CreateBudgetRequest.CategoryAllocationRequest alloc : request.getCategoryAllocations()) {
                Category category = categoryRepository.findById(alloc.getCategoryId())
                        .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + alloc.getCategoryId()));

                BudgetCategory bc = BudgetCategory.builder()
                        .budget(savedBudget)
                        .category(category)
                        .allocatedAmount(alloc.getAllocatedAmount())
                        .build();
                budgetCategoryRepository.save(bc);
            }
        }

        return getBudgetById(savedBudget.getId(), userId);
    }

    @Transactional
    public BudgetDto updateBudget(Long budgetId, Long userId, UpdateBudgetRequest request) {
        Budget budget = budgetRepository.findByIdAndUserId(budgetId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Budget not found with id: " + budgetId));

        budget.setName(request.getName().trim());
        budget.setPeriod(request.getPeriod());
        budget.setStartDate(request.getStartDate());
        budget.setEndDate(request.getEndDate());
        budget.setTotalBudgetAmount(request.getTotalBudgetAmount());
        if (request.getAlertThresholdPercentage() != null) {
            budget.setAlertThresholdPercentage(request.getAlertThresholdPercentage());
        }
        if (request.getIsActive() != null) {
            budget.setIsActive(request.getIsActive());
        }

        budgetRepository.save(budget);

        if (request.getCategoryAllocations() != null) {
            budgetCategoryRepository.deleteByBudgetId(budgetId);
            for (CreateBudgetRequest.CategoryAllocationRequest alloc : request.getCategoryAllocations()) {
                Category category = categoryRepository.findById(alloc.getCategoryId())
                        .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + alloc.getCategoryId()));

                BudgetCategory bc = BudgetCategory.builder()
                        .budget(budget)
                        .category(category)
                        .allocatedAmount(alloc.getAllocatedAmount())
                        .build();
                budgetCategoryRepository.save(bc);
            }
        }

        return getBudgetById(budgetId, userId);
    }

    @Transactional
    public void deleteBudget(Long budgetId, Long userId) {
        Budget budget = budgetRepository.findByIdAndUserId(budgetId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Budget not found with id: " + budgetId));

        budgetRepository.delete(budget);
    }

    @Transactional(readOnly = true)
    public BudgetUtilizationDto getBudgetUtilization(Long budgetId, Long userId) {
        Budget budget = budgetRepository.findByIdAndUserId(budgetId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Budget not found with id: " + budgetId));

        return calculateUtilization(budget, userId);
    }

    @Transactional(readOnly = true)
    public BudgetUtilizationDto getCurrentBudgetUtilization(Long userId) {
        LocalDate today = LocalDate.now();
        List<Budget> activeBudgets = budgetRepository.findActiveBudgetsForDate(userId, today);

        if (activeBudgets.isEmpty()) {
            return null;
        }

        return calculateUtilization(activeBudgets.get(0), userId);
    }

    private BudgetUtilizationDto calculateUtilization(Budget budget, Long userId) {
        List<BudgetCategory> budgetCategories = budgetCategoryRepository.findByBudgetId(budget.getId());

        BigDecimal totalSpent = BigDecimal.ZERO;
        List<CategoryBudgetUtilizationDto> categoryDtos = new ArrayList<>();

        for (BudgetCategory bc : budgetCategories) {
            BigDecimal spent = transactionRepository.sumExpenseByUserIdAndCategoryAndDateRange(
                    userId, bc.getCategory().getId(), budget.getStartDate(), budget.getEndDate()
            );
            if (spent == null) spent = BigDecimal.ZERO;
            totalSpent = totalSpent.add(spent);

            BigDecimal remaining = bc.getAllocatedAmount().subtract(spent);
            BigDecimal utilPct = BigDecimal.ZERO;
            if (bc.getAllocatedAmount().compareTo(BigDecimal.ZERO) > 0) {
                utilPct = spent.multiply(new BigDecimal("100")).divide(bc.getAllocatedAmount(), 2, RoundingMode.HALF_UP);
            }

            boolean isExceeded = spent.compareTo(bc.getAllocatedAmount()) > 0;
            String alertTriggered = null;
            if (utilPct.compareTo(new BigDecimal("120.00")) >= 0) {
                alertTriggered = "WARNING_120_PERCENT";
            } else if (utilPct.compareTo(new BigDecimal("100.00")) >= 0) {
                alertTriggered = "WARNING_100_PERCENT";
            } else if (utilPct.compareTo(budget.getAlertThresholdPercentage()) >= 0) {
                alertTriggered = "WARNING_80_PERCENT";
            }

            categoryDtos.add(CategoryBudgetUtilizationDto.builder()
                    .categoryId(bc.getCategory().getId())
                    .categoryName(bc.getCategory().getName())
                    .categoryIcon(bc.getCategory().getIcon())
                    .categoryColor(bc.getCategory().getColor())
                    .allocatedAmount(bc.getAllocatedAmount())
                    .spentAmount(spent)
                    .remainingAmount(remaining)
                    .utilizationPercentage(utilPct)
                    .isExceeded(isExceeded)
                    .alertTriggered(alertTriggered)
                    .build());
        }

        BigDecimal remainingTotal = budget.getTotalBudgetAmount().subtract(totalSpent);
        BigDecimal totalUtilPct = BigDecimal.ZERO;
        if (budget.getTotalBudgetAmount().compareTo(BigDecimal.ZERO) > 0) {
            totalUtilPct = totalSpent.multiply(new BigDecimal("100")).divide(budget.getTotalBudgetAmount(), 2, RoundingMode.HALF_UP);
        }

        String overallStatus = "ON_TRACK";
        if (totalUtilPct.compareTo(new BigDecimal("100.00")) >= 0) {
            overallStatus = "EXCEEDED";
        } else if (totalUtilPct.compareTo(budget.getAlertThresholdPercentage()) >= 0) {
            overallStatus = "NEAR_LIMIT";
        }

        return BudgetUtilizationDto.builder()
                .budgetId(budget.getId())
                .name(budget.getName())
                .period(budget.getPeriod().name())
                .startDate(budget.getStartDate())
                .endDate(budget.getEndDate())
                .totalBudgetAmount(budget.getTotalBudgetAmount())
                .totalSpent(totalSpent)
                .remainingAmount(remainingTotal)
                .utilizationPercentage(totalUtilPct)
                .alertThreshold(budget.getAlertThresholdPercentage())
                .status(overallStatus)
                .categories(categoryDtos)
                .build();
    }

    private BudgetDto mapToDto(Budget budget) {
        List<BudgetCategoryDto> categories = budgetCategoryRepository.findByBudgetId(budget.getId()).stream()
                .map(bc -> BudgetCategoryDto.builder()
                        .id(bc.getId())
                        .categoryId(bc.getCategory().getId())
                        .categoryName(bc.getCategory().getName())
                        .categoryIcon(bc.getCategory().getIcon())
                        .categoryColor(bc.getCategory().getColor())
                        .allocatedAmount(bc.getAllocatedAmount())
                        .build())
                .collect(Collectors.toList());

        return BudgetDto.builder()
                .id(budget.getId())
                .name(budget.getName())
                .period(budget.getPeriod())
                .startDate(budget.getStartDate())
                .endDate(budget.getEndDate())
                .totalBudgetAmount(budget.getTotalBudgetAmount())
                .alertThresholdPercentage(budget.getAlertThresholdPercentage())
                .isActive(budget.getIsActive())
                .categories(categories)
                .createdAt(budget.getCreatedAt())
                .build();
    }
}
