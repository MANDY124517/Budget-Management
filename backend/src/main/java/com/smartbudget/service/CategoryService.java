package com.smartbudget.service;

import com.smartbudget.dto.category.CategoryDto;
import com.smartbudget.dto.category.CreateCategoryRequest;
import com.smartbudget.dto.category.UpdateCategoryRequest;
import com.smartbudget.entity.Category;
import com.smartbudget.entity.User;
import com.smartbudget.entity.enums.CategoryType;
import com.smartbudget.exception.BadRequestException;
import com.smartbudget.exception.ResourceNotFoundException;
import com.smartbudget.repository.CategoryRepository;
import com.smartbudget.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<CategoryDto> getCategoriesForUser(Long userId, CategoryType type) {
        List<Category> categories;
        if (type != null) {
            categories = categoryRepository.findAvailableForUserAndType(userId, type);
        } else {
            categories = categoryRepository.findAllAvailableForUser(userId);
        }
        return categories.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional
    public CategoryDto createCategory(Long userId, CreateCategoryRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Category category = Category.builder()
                .user(user)
                .name(request.getName().trim())
                .categoryType(request.getCategoryType())
                .icon(request.getIcon() != null ? request.getIcon().trim() : "tag")
                .color(request.getColor() != null ? request.getColor().trim() : "#6366F1")
                .isSystemDefault(false)
                .build();

        Category saved = categoryRepository.save(category);
        return mapToDto(saved);
    }

    @Transactional
    public CategoryDto updateCategory(Long categoryId, Long userId, UpdateCategoryRequest request) {
        Category category = categoryRepository.findByIdAndUserId(categoryId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Custom category not found with id: " + categoryId));

        if (Boolean.TRUE.equals(category.getIsSystemDefault())) {
            throw new BadRequestException("System default categories cannot be modified");
        }

        category.setName(request.getName().trim());
        category.setCategoryType(request.getCategoryType());
        if (request.getIcon() != null) category.setIcon(request.getIcon().trim());
        if (request.getColor() != null) category.setColor(request.getColor().trim());

        Category updated = categoryRepository.save(category);
        return mapToDto(updated);
    }

    @Transactional
    public void deleteCategory(Long categoryId, Long userId) {
        Category category = categoryRepository.findByIdAndUserId(categoryId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Custom category not found with id: " + categoryId));

        if (Boolean.TRUE.equals(category.getIsSystemDefault())) {
            throw new BadRequestException("System default categories cannot be deleted");
        }

        categoryRepository.delete(category);
    }

    public CategoryDto mapToDto(Category category) {
        if (category == null) return null;
        return CategoryDto.builder()
                .id(category.getId())
                .name(category.getName())
                .categoryType(category.getCategoryType())
                .icon(category.getIcon())
                .color(category.getColor())
                .isSystemDefault(category.getIsSystemDefault())
                .build();
    }
}
