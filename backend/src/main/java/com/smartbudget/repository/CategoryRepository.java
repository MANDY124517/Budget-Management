package com.smartbudget.repository;

import com.smartbudget.entity.Category;
import com.smartbudget.entity.enums.CategoryType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    
    List<Category> findByIsSystemDefaultTrue();

    @Query("SELECT c FROM Category c WHERE c.isSystemDefault = true OR c.user.id = :userId ORDER BY c.name ASC")
    List<Category> findAllAvailableForUser(@Param("userId") Long userId);

    @Query("SELECT c FROM Category c WHERE (c.isSystemDefault = true OR c.user.id = :userId) AND c.categoryType = :type ORDER BY c.name ASC")
    List<Category> findAvailableForUserAndType(@Param("userId") Long userId, @Param("type") CategoryType type);

    Optional<Category> findByIdAndUserId(Long id, Long userId);
}
