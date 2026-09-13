package com.smartbudget.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SpendingAnalysisRequest {
    private Long userId;
    private String currency;
    private List<TransactionInput> transactions;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TransactionInput {
        private Long id;
        private LocalDate date;
        private BigDecimal amount;
        private String type; // INCOME, EXPENSE, TRANSFER
        private String category;
        private String description;
    }
}
