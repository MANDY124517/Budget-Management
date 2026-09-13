package com.smartbudget.dto.category;

import com.smartbudget.entity.enums.CategoryType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryDto {
    private Long id;
    private String name;
    private CategoryType categoryType;
    private String icon;
    private String color;
    private Boolean isSystemDefault;
}
