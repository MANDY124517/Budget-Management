package com.smartbudget.controller;

import com.smartbudget.dto.account.AccountDto;
import com.smartbudget.dto.account.AccountSummaryDto;
import com.smartbudget.dto.account.CreateAccountRequest;
import com.smartbudget.dto.account.UpdateAccountRequest;
import com.smartbudget.dto.common.ApiResponse;
import com.smartbudget.security.UserPrincipal;
import com.smartbudget.service.AccountService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/accounts")
@RequiredArgsConstructor
public class AccountController {

    private final AccountService accountService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AccountDto>>> getUserAccounts(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<AccountDto> accounts = accountService.getUserAccounts(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(accounts));
    }

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<AccountSummaryDto>> getAccountSummary(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        AccountSummaryDto summary = accountService.getAccountSummary(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(summary));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AccountDto>> getAccountById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        AccountDto account = accountService.getAccountById(id, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(account));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AccountDto>> createAccount(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody CreateAccountRequest request) {
        AccountDto account = accountService.createAccount(userPrincipal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(account, "Account created successfully"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AccountDto>> updateAccount(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody UpdateAccountRequest request) {
        AccountDto account = accountService.updateAccount(id, userPrincipal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success(account, "Account updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAccount(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        accountService.deleteAccount(id, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(null, "Account deactivated successfully"));
    }
}
