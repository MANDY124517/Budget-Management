package com.smartbudget.controller;

import com.smartbudget.dto.analytics.DashboardOverviewDto;
import com.smartbudget.dto.common.ApiResponse;
import com.smartbudget.security.UserPrincipal;
import com.smartbudget.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/overview")
    public ResponseEntity<ApiResponse<DashboardOverviewDto>> getDashboardOverview(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        DashboardOverviewDto overview = dashboardService.getDashboardOverview(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(overview));
    }
}
