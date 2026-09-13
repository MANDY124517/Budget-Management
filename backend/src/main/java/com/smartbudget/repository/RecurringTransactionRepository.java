package com.smartbudget.repository;

import com.smartbudget.entity.RecurringTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface RecurringTransactionRepository extends JpaRepository<RecurringTransaction, Long> {
    List<RecurringTransaction> findByUserIdOrderByNextExecutionDateAsc(Long userId);
    List<RecurringTransaction> findByUserIdAndIsActiveTrue(Long userId);
    Optional<RecurringTransaction> findByIdAndUserId(Long id, Long userId);

    @Query("SELECT r FROM RecurringTransaction r WHERE r.isActive = true AND r.nextExecutionDate <= :date")
    List<RecurringTransaction> findDueRecurringTransactions(@Param("date") LocalDate date);
}
