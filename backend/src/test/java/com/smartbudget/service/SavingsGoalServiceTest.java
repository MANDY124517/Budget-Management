package com.smartbudget.service;

import com.smartbudget.dto.goal.SavingsGoalDto;
import com.smartbudget.entity.SavingsGoal;
import com.smartbudget.entity.User;
import com.smartbudget.entity.enums.GoalPriority;
import com.smartbudget.entity.enums.GoalStatus;
import com.smartbudget.repository.SavingsGoalRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SavingsGoalServiceTest {

    @Mock
    private SavingsGoalRepository savingsGoalRepository;

    @InjectMocks
    private SavingsGoalService savingsGoalService;

    private User mockUser;
    private SavingsGoal mockGoal;

    @BeforeEach
    void setUp() {
        mockUser = User.builder().id(1L).email("user@example.com").build();

        mockGoal = SavingsGoal.builder()
                .id(1L)
                .user(mockUser)
                .name("MacBook Pro")
                .targetAmount(new BigDecimal("100000.00"))
                .currentAmount(new BigDecimal("40000.00"))
                .targetDate(LocalDate.now().plusMonths(6))
                .priority(GoalPriority.HIGH)
                .status(GoalStatus.IN_PROGRESS)
                .build();
    }

    @Test
    void getGoalById_CalculatesProgressAndMonthlyPace() {
        when(savingsGoalRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(mockGoal));

        SavingsGoalDto dto = savingsGoalService.getGoalById(1L, 1L);

        assertNotNull(dto);
        assertEquals(new BigDecimal("40.00"), dto.getProgressPercentage());
        assertEquals(new BigDecimal("60000.00"), dto.getRemainingAmount());
        assertEquals(new BigDecimal("10000.00"), dto.getRequiredMonthlySavings());
    }
}
