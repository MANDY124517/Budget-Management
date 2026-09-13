package com.smartbudget.controller;

import com.smartbudget.dto.budget.BudgetDto;
import com.smartbudget.dto.budget.BudgetUtilizationDto;
import com.smartbudget.dto.budget.CreateBudgetRequest;
import com.smartbudget.dto.budget.UpdateBudgetRequest;
import com.smartbudget.dto.common.ApiResponse;
import com.smartbudget.security.UserPrincipal;
import com.smartbudget.service.BudgetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/budgets")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService budgetService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<BudgetDto>>> getUserBudgets(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<BudgetDto> budgets = budgetService.getUserBudgets(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(budgets));
    }

    @GetMapping("/current")
    public ResponseEntity<ApiResponse<BudgetUtilizationDto>> getCurrentBudget(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        BudgetUtilizationDto budget = budgetService.getCurrentBudgetUtilization(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(budget));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BudgetDto>> getBudgetById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        BudgetDto budget = budgetService.getBudgetById(id, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(budget));
    }

    @GetMapping("/{id}/utilization")
    public ResponseEntity<ApiResponse<BudgetUtilizationDto>> getBudgetUtilization(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        BudgetUtilizationDto utilization = budgetService.getBudgetUtilization(id, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(utilization));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BudgetDto>> createBudget(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody CreateBudgetRequest request) {
        BudgetDto budget = budgetService.createBudget(userPrincipal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(budget, "Budget created successfully"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<BudgetDto>> updateBudget(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody UpdateBudgetRequest request) {
        BudgetDto budget = budgetService.updateBudget(id, userPrincipal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success(budget, "Budget updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteBudget(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        budgetService.deleteBudget(id, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(null, "Budget deleted successfully"));
    }
}
