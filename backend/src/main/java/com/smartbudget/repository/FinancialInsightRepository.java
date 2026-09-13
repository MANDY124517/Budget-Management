package com.smartbudget.repository;

import com.smartbudget.entity.FinancialInsight;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FinancialInsightRepository extends JpaRepository<FinancialInsight, Long> {
    List<FinancialInsight> findByUserIdAndIsDismissedFalseOrderByCreatedAtDesc(Long userId);
    Optional<FinancialInsight> findByIdAndUserId(Long id, Long userId);
}
