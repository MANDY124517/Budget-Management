package com.smartbudget.controller;

import com.smartbudget.dto.common.ApiResponse;
import com.smartbudget.dto.goal.ContributeGoalRequest;
import com.smartbudget.dto.goal.CreateSavingsGoalRequest;
import com.smartbudget.dto.goal.SavingsGoalDto;
import com.smartbudget.dto.goal.UpdateSavingsGoalRequest;
import com.smartbudget.security.UserPrincipal;
import com.smartbudget.service.SavingsGoalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/goals")
@RequiredArgsConstructor
public class SavingsGoalController {

    private final SavingsGoalService savingsGoalService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<SavingsGoalDto>>> getUserGoals(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<SavingsGoalDto> goals = savingsGoalService.getUserGoals(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(goals));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SavingsGoalDto>> getGoalById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        SavingsGoalDto goal = savingsGoalService.getGoalById(id, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(goal));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<SavingsGoalDto>> createGoal(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody CreateSavingsGoalRequest request) {
        SavingsGoalDto goal = savingsGoalService.createGoal(userPrincipal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(goal, "Savings goal created successfully"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<SavingsGoalDto>> updateGoal(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody UpdateSavingsGoalRequest request) {
        SavingsGoalDto goal = savingsGoalService.updateGoal(id, userPrincipal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success(goal, "Savings goal updated successfully"));
    }

    @PostMapping("/{id}/contribute")
    public ResponseEntity<ApiResponse<SavingsGoalDto>> contributeToGoal(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody ContributeGoalRequest request) {
        SavingsGoalDto goal = savingsGoalService.contributeToGoal(id, userPrincipal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success(goal, "Contribution added successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteGoal(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        savingsGoalService.deleteGoal(id, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(null, "Savings goal deleted successfully"));
    }
}
