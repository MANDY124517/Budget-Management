package com.smartbudget.controller;

import com.smartbudget.dto.common.ApiResponse;
import com.smartbudget.dto.recurring.CreateRecurringTransactionRequest;
import com.smartbudget.dto.recurring.RecurringTransactionDto;
import com.smartbudget.dto.recurring.UpdateRecurringTransactionRequest;
import com.smartbudget.security.UserPrincipal;
import com.smartbudget.service.RecurringTransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recurring")
@RequiredArgsConstructor
public class RecurringTransactionController {

    private final RecurringTransactionService recurringTransactionService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<RecurringTransactionDto>>> getUserRecurringTransactions(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<RecurringTransactionDto> list = recurringTransactionService.getUserRecurringTransactions(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RecurringTransactionDto>> getRecurringTransactionById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        RecurringTransactionDto rec = recurringTransactionService.getRecurringTransactionById(id, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(rec));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<RecurringTransactionDto>> createRecurringTransaction(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody CreateRecurringTransactionRequest request) {
        RecurringTransactionDto rec = recurringTransactionService.createRecurringTransaction(userPrincipal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(rec, "Recurring transaction rule created successfully"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<RecurringTransactionDto>> updateRecurringTransaction(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody UpdateRecurringTransactionRequest request) {
        RecurringTransactionDto rec = recurringTransactionService.updateRecurringTransaction(id, userPrincipal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success(rec, "Recurring transaction rule updated successfully"));
    }

    @PostMapping("/{id}/trigger")
    public ResponseEntity<ApiResponse<Void>> triggerNow(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        recurringTransactionService.triggerNow(id, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(null, "Recurring transaction triggered successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteRecurringTransaction(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        recurringTransactionService.deleteRecurringTransaction(id, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(null, "Recurring transaction rule removed successfully"));
    }
}
