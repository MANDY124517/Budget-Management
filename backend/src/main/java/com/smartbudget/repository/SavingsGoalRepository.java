package com.smartbudget.repository;

import com.smartbudget.entity.SavingsGoal;
import com.smartbudget.entity.enums.GoalStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SavingsGoalRepository extends JpaRepository<SavingsGoal, Long> {
    List<SavingsGoal> findByUserIdOrderByTargetDateAsc(Long userId);
    List<SavingsGoal> findByUserIdAndStatus(Long userId, GoalStatus status);
    Optional<SavingsGoal> findByIdAndUserId(Long id, Long userId);
}
