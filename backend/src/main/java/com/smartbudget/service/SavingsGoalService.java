package com.smartbudget.service;

import com.smartbudget.dto.goal.ContributeGoalRequest;
import com.smartbudget.dto.goal.CreateSavingsGoalRequest;
import com.smartbudget.dto.goal.SavingsGoalDto;
import com.smartbudget.dto.goal.UpdateSavingsGoalRequest;
import com.smartbudget.entity.Account;
import com.smartbudget.entity.SavingsGoal;
import com.smartbudget.entity.User;
import com.smartbudget.entity.enums.GoalStatus;
import com.smartbudget.exception.BadRequestException;
import com.smartbudget.exception.ResourceNotFoundException;
import com.smartbudget.repository.AccountRepository;
import com.smartbudget.repository.SavingsGoalRepository;
import com.smartbudget.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SavingsGoalService {

    private final SavingsGoalRepository savingsGoalRepository;
    private final UserRepository userRepository;
    private final AccountRepository accountRepository;

    @Transactional(readOnly = true)
    public List<SavingsGoalDto> getUserGoals(Long userId) {
        return savingsGoalRepository.findByUserIdOrderByTargetDateAsc(userId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SavingsGoalDto getGoalById(Long goalId, Long userId) {
        SavingsGoal goal = savingsGoalRepository.findByIdAndUserId(goalId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Savings goal not found with id: " + goalId));
        return mapToDto(goal);
    }

    @Transactional
    public SavingsGoalDto createGoal(Long userId, CreateSavingsGoalRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Account targetAccount = null;
        if (request.getTargetAccountId() != null) {
            targetAccount = accountRepository.findByIdAndUserId(request.getTargetAccountId(), userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Target account not found with id: " + request.getTargetAccountId()));
        }

        SavingsGoal goal = SavingsGoal.builder()
                .user(user)
                .targetAccount(targetAccount)
                .name(request.getName().trim())
                .targetAmount(request.getTargetAmount())
                .currentAmount(request.getCurrentAmount() != null ? request.getCurrentAmount() : BigDecimal.ZERO)
                .targetDate(request.getTargetDate())
                .priority(request.getPriority())
                .status(GoalStatus.IN_PROGRESS)
                .description(request.getDescription())
                .build();

        if (goal.getCurrentAmount().compareTo(goal.getTargetAmount()) >= 0) {
            goal.setStatus(GoalStatus.COMPLETED);
        }

        SavingsGoal saved = savingsGoalRepository.save(goal);
        return mapToDto(saved);
    }

    @Transactional
    public SavingsGoalDto updateGoal(Long goalId, Long userId, UpdateSavingsGoalRequest request) {
        SavingsGoal goal = savingsGoalRepository.findByIdAndUserId(goalId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Savings goal not found with id: " + goalId));

        Account targetAccount = null;
        if (request.getTargetAccountId() != null) {
            targetAccount = accountRepository.findByIdAndUserId(request.getTargetAccountId(), userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Target account not found with id: " + request.getTargetAccountId()));
        }

        goal.setName(request.getName().trim());
        goal.setTargetAccount(targetAccount);
        goal.setTargetAmount(request.getTargetAmount());
        goal.setCurrentAmount(request.getCurrentAmount());
        goal.setTargetDate(request.getTargetDate());
        goal.setPriority(request.getPriority());
        goal.setStatus(request.getStatus());
        goal.setDescription(request.getDescription());

        if (goal.getCurrentAmount().compareTo(goal.getTargetAmount()) >= 0 && goal.getStatus() == GoalStatus.IN_PROGRESS) {
            goal.setStatus(GoalStatus.COMPLETED);
        }

        SavingsGoal updated = savingsGoalRepository.save(goal);
        return mapToDto(updated);
    }

    @Transactional
    public SavingsGoalDto contributeToGoal(Long goalId, Long userId, ContributeGoalRequest request) {
        SavingsGoal goal = savingsGoalRepository.findByIdAndUserId(goalId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Savings goal not found with id: " + goalId));

        if (request.getSourceAccountId() != null) {
            Account account = accountRepository.findByIdAndUserId(request.getSourceAccountId(), userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Source account not found with id: " + request.getSourceAccountId()));

            if (account.getBalance().compareTo(request.getAmount()) < 0) {
                throw new BadRequestException("Insufficient balance in source account for goal contribution");
            }
            account.setBalance(account.getBalance().subtract(request.getAmount()));
            accountRepository.save(account);
        }

        goal.setCurrentAmount(goal.getCurrentAmount().add(request.getAmount()));
        if (goal.getCurrentAmount().compareTo(goal.getTargetAmount()) >= 0) {
            goal.setStatus(GoalStatus.COMPLETED);
        }

        SavingsGoal updated = savingsGoalRepository.save(goal);
        return mapToDto(updated);
    }

    @Transactional
    public void deleteGoal(Long goalId, Long userId) {
        SavingsGoal goal = savingsGoalRepository.findByIdAndUserId(goalId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Savings goal not found with id: " + goalId));

        savingsGoalRepository.delete(goal);
    }

    public SavingsGoalDto mapToDto(SavingsGoal goal) {
        if (goal == null) return null;

        BigDecimal remaining = goal.getTargetAmount().subtract(goal.getCurrentAmount());
        if (remaining.compareTo(BigDecimal.ZERO) < 0) {
            remaining = BigDecimal.ZERO;
        }

        BigDecimal progressPct = BigDecimal.ZERO;
        if (goal.getTargetAmount().compareTo(BigDecimal.ZERO) > 0) {
            progressPct = goal.getCurrentAmount().multiply(new BigDecimal("100"))
                    .divide(goal.getTargetAmount(), 2, RoundingMode.HALF_UP);
            if (progressPct.compareTo(new BigDecimal("100.00")) > 0) {
                progressPct = new BigDecimal("100.00");
            }
        }

        long monthsRemaining = ChronoUnit.MONTHS.between(LocalDate.now(), goal.getTargetDate());
        if (monthsRemaining <= 0) {
            monthsRemaining = 1;
        }

        BigDecimal requiredMonthly = remaining.divide(BigDecimal.valueOf(monthsRemaining), 2, RoundingMode.HALF_UP);

        return SavingsGoalDto.builder()
                .id(goal.getId())
                .name(goal.getName())
                .targetAccountId(goal.getTargetAccount() != null ? goal.getTargetAccount().getId() : null)
                .targetAccountName(goal.getTargetAccount() != null ? goal.getTargetAccount().getName() : null)
                .targetAmount(goal.getTargetAmount())
                .currentAmount(goal.getCurrentAmount())
                .remainingAmount(remaining)
                .progressPercentage(progressPct)
                .targetDate(goal.getTargetDate())
                .priority(goal.getPriority())
                .status(goal.getStatus())
                .description(goal.getDescription())
                .requiredMonthlySavings(requiredMonthly)
                .createdAt(goal.getCreatedAt())
                .build();
    }
}
