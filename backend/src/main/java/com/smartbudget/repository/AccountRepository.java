package com.smartbudget.repository;

import com.smartbudget.entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {
    List<Account> findByUserIdAndIsActiveTrue(Long userId);
    List<Account> findByUserId(Long userId);
    Optional<Account> findByIdAndUserId(Long id, Long userId);
    Optional<Account> findByIdAndUserIdAndIsActiveTrue(Long id, Long userId);

    @Query("SELECT COALESCE(SUM(a.balance), 0) FROM Account a WHERE a.user.id = :userId AND a.isActive = true")
    BigDecimal sumTotalBalanceByUserId(@Param("userId") Long userId);
}
