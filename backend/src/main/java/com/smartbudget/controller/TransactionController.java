package com.smartbudget.controller;

import com.smartbudget.dto.common.ApiResponse;
import com.smartbudget.dto.common.PagedResponse;
import com.smartbudget.dto.transaction.*;
import com.smartbudget.security.UserPrincipal;
import com.smartbudget.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<TransactionDto>>> getTransactions(
            @ModelAttribute TransactionFilterRequest filter,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        PagedResponse<TransactionDto> response = transactionService.getTransactions(userPrincipal.getId(), filter);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TransactionDto>> getTransactionById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        TransactionDto transaction = transactionService.getTransactionById(id, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(transaction));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TransactionDto>> createTransaction(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody CreateTransactionRequest request) {
        TransactionDto transaction = transactionService.createTransaction(userPrincipal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(transaction, "Transaction recorded successfully"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TransactionDto>> updateTransaction(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody UpdateTransactionRequest request) {
        TransactionDto transaction = transactionService.updateTransaction(id, userPrincipal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success(transaction, "Transaction updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTransaction(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        transactionService.deleteTransaction(id, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(null, "Transaction deleted successfully"));
    }

    @GetMapping("/category-summary")
    public ResponseEntity<ApiResponse<List<CategorySpendingDto>>> getCategorySpendingSummary(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        
        if (startDate == null) startDate = LocalDate.now().withDayOfMonth(1);
        if (endDate == null) endDate = LocalDate.now();

        List<CategorySpendingDto> summary = transactionService.getCategorySpendingSummary(
                userPrincipal.getId(), startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(summary));
    }

    @GetMapping("/export/csv")
    public ResponseEntity<String> exportTransactionsCsv(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        if (startDate == null) startDate = LocalDate.now().minusMonths(1).withDayOfMonth(1);
        if (endDate == null) endDate = LocalDate.now();

        String csvData = transactionService.exportTransactionsCsv(userPrincipal.getId(), startDate, endDate);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv"));
        headers.setContentDispositionFormData("attachment", "smartbudget_transactions_" + LocalDate.now() + ".csv");

        return new ResponseEntity<>(csvData, headers, HttpStatus.OK);
    }
}
