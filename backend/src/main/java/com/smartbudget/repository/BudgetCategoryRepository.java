package com.smartbudget.repository;

import com.smartbudget.entity.BudgetCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BudgetCategoryRepository extends JpaRepository<BudgetCategory, Long> {
    List<BudgetCategory> findByBudgetId(Long budgetId);
    Optional<BudgetCategory> findByBudgetIdAndCategoryId(Long budgetId, Long categoryId);
    void deleteByBudgetId(Long budgetId);
}
