package com.smartbudget.service;

import com.smartbudget.dto.budget.BudgetUtilizationDto;
import com.smartbudget.entity.Budget;
import com.smartbudget.entity.BudgetCategory;
import com.smartbudget.entity.Category;
import com.smartbudget.entity.User;
import com.smartbudget.entity.enums.BudgetPeriod;
import com.smartbudget.repository.BudgetCategoryRepository;
import com.smartbudget.repository.BudgetRepository;
import com.smartbudget.repository.TransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BudgetServiceTest {

    @Mock
    private BudgetRepository budgetRepository;

    @Mock
    private BudgetCategoryRepository budgetCategoryRepository;

    @Mock
    private TransactionRepository transactionRepository;

    @InjectMocks
    private BudgetService budgetService;

    private User mockUser;
    private Budget mockBudget;
    private Category categoryFood;

    @BeforeEach
    void setUp() {
        mockUser = User.builder().id(1L).email("user@example.com").build();

        mockBudget = Budget.builder()
                .id(10L)
                .user(mockUser)
                .name("September Budget")
                .period(BudgetPeriod.MONTHLY)
                .startDate(LocalDate.of(2026, 9, 1))
                .endDate(LocalDate.of(2026, 9, 30))
                .totalBudgetAmount(new BigDecimal("10000.00"))
                .alertThresholdPercentage(new BigDecimal("80.00"))
                .isActive(true)
                .build();

        categoryFood = Category.builder().id(4L).name("Food").build();
    }

    @Test
    void getBudgetUtilization_CalculatesPercentagesAndThresholdsAccurately() {
        BudgetCategory bc = BudgetCategory.builder()
                .id(1L)
                .budget(mockBudget)
                .category(categoryFood)
                .allocatedAmount(new BigDecimal("8000.00"))
                .build();

        when(budgetRepository.findByIdAndUserId(10L, 1L)).thenReturn(Optional.of(mockBudget));
        when(budgetCategoryRepository.findByBudgetId(10L)).thenReturn(List.of(bc));
        when(transactionRepository.sumExpenseByUserIdAndCategoryAndDateRange(1L, 4L, mockBudget.getStartDate(), mockBudget.getEndDate()))
                .thenReturn(new BigDecimal("6800.00")); // 85% utilization

        BudgetUtilizationDto dto = budgetService.getBudgetUtilization(10L, 1L);

        assertNotNull(dto);
        assertEquals(new BigDecimal("6800.00"), dto.getTotalSpent());
        assertEquals(new BigDecimal("3200.00"), dto.getRemainingAmount());
        assertEquals(new BigDecimal("68.00"), dto.getUtilizationPercentage());

        assertEquals(1, dto.getCategories().size());
        assertEquals(new BigDecimal("85.00"), dto.getCategories().get(0).getUtilizationPercentage());
        assertEquals("WARNING_80_PERCENT", dto.getCategories().get(0).getAlertTriggered());
    }
}
