package com.smartbudget.dto.transaction;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategorySpendingDto {
    private Long categoryId;
    private String categoryName;
    private String icon;
    private String color;
    private BigDecimal totalAmount;
    private BigDecimal percentage;
}
