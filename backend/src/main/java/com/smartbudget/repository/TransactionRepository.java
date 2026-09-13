package com.smartbudget.repository;

import com.smartbudget.entity.Transaction;
import com.smartbudget.entity.enums.TransactionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long>, JpaSpecificationExecutor<Transaction> {

    Optional<Transaction> findByIdAndUserId(Long id, Long userId);

    Page<Transaction> findByUserId(Long userId, Pageable pageable);

    @Query("SELECT t FROM Transaction t WHERE t.user.id = :userId " +
           "AND (:startDate IS NULL OR t.transactionDate >= :startDate) " +
           "AND (:endDate IS NULL OR t.transactionDate <= :endDate) " +
           "AND (:type IS NULL OR t.transactionType = :type) " +
           "AND (:categoryId IS NULL OR t.category.id = :categoryId) " +
           "AND (:accountId IS NULL OR t.account.id = :accountId) " +
           "AND (:search IS NULL OR LOWER(t.description) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(t.notes) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY t.transactionDate DESC, t.id DESC")
    Page<Transaction> filterTransactions(
            @Param("userId") Long userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("type") TransactionType type,
            @Param("categoryId") Long categoryId,
            @Param("accountId") Long accountId,
            @Param("search") String search,
            Pageable pageable
    );

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t " +
           "WHERE t.user.id = :userId AND t.transactionType = :type " +
           "AND t.transactionDate >= :startDate AND t.transactionDate <= :endDate")
    BigDecimal sumAmountByUserIdAndTypeAndDateRange(
            @Param("userId") Long userId,
            @Param("type") TransactionType type,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t " +
           "WHERE t.user.id = :userId AND t.category.id = :categoryId " +
           "AND t.transactionType = 'EXPENSE' " +
           "AND t.transactionDate >= :startDate AND t.transactionDate <= :endDate")
    BigDecimal sumExpenseByUserIdAndCategoryAndDateRange(
            @Param("userId") Long userId,
            @Param("categoryId") Long categoryId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    @Query("SELECT t.category.id AS categoryId, t.category.name AS categoryName, " +
           "t.category.icon AS icon, t.category.color AS color, SUM(t.amount) AS totalAmount " +
           "FROM Transaction t " +
           "WHERE t.user.id = :userId AND t.transactionType = 'EXPENSE' " +
           "AND t.transactionDate >= :startDate AND t.transactionDate <= :endDate " +
           "GROUP BY t.category.id, t.category.name, t.category.icon, t.category.color " +
           "ORDER BY totalAmount DESC")
    List<CategorySpendingProjection> findCategorySpendingSummary(
            @Param("userId") Long userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    List<Transaction> findByUserIdAndTransactionDateBetweenOrderByTransactionDateAsc(
            Long userId, LocalDate startDate, LocalDate endDate
    );

    interface CategorySpendingProjection {
        Long getCategoryId();
        String getCategoryName();
        String getIcon();
        String getColor();
        BigDecimal getTotalAmount();
    }
}
