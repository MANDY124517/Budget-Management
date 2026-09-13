package com.smartbudget.controller;

import com.smartbudget.dto.analytics.*;
import com.smartbudget.dto.common.ApiResponse;
import com.smartbudget.security.UserPrincipal;
import com.smartbudget.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/spending")
    public ResponseEntity<ApiResponse<SpendingAnalysisResponse>> getSpendingAnalysis(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        SpendingAnalysisResponse response = analyticsService.getSpendingAnalysis(userPrincipal.getId(), startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/forecast")
    public ResponseEntity<ApiResponse<ForecastResponse>> getExpenseForecast(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        ForecastResponse response = analyticsService.getExpenseForecast(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/anomalies")
    public ResponseEntity<ApiResponse<AnomalyDetectionResponse>> getAnomalies(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        AnomalyDetectionResponse response = analyticsService.getAnomalies(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/health-score")
    public ResponseEntity<ApiResponse<FinancialHealthScoreDto>> getFinancialHealthScore(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        FinancialHealthScoreDto response = analyticsService.getFinancialHealthScore(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/insights")
    public ResponseEntity<ApiResponse<List<InsightDto>>> getFinancialInsights(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<InsightDto> response = analyticsService.getFinancialInsights(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
