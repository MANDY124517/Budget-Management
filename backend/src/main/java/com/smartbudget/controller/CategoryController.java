package com.smartbudget.controller;

import com.smartbudget.dto.category.CategoryDto;
import com.smartbudget.dto.category.CreateCategoryRequest;
import com.smartbudget.dto.category.UpdateCategoryRequest;
import com.smartbudget.dto.common.ApiResponse;
import com.smartbudget.entity.enums.CategoryType;
import com.smartbudget.security.UserPrincipal;
import com.smartbudget.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CategoryDto>>> getCategories(
            @RequestParam(required = false) CategoryType type,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<CategoryDto> categories = categoryService.getCategoriesForUser(userPrincipal.getId(), type);
        return ResponseEntity.ok(ApiResponse.success(categories));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CategoryDto>> createCategory(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody CreateCategoryRequest request) {
        CategoryDto category = categoryService.createCategory(userPrincipal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(category, "Category created successfully"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryDto>> updateCategory(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody UpdateCategoryRequest request) {
        CategoryDto category = categoryService.updateCategory(id, userPrincipal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success(category, "Category updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        categoryService.deleteCategory(id, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(null, "Category deleted successfully"));
    }
}
