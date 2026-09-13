package com.smartbudget.config;

import com.smartbudget.entity.Category;
import com.smartbudget.entity.enums.CategoryType;
import com.smartbudget.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final CategoryRepository categoryRepository;

    @Override
    public void run(String... args) {
        if (categoryRepository.findByIsSystemDefaultTrue().isEmpty()) {
            log.info("Seeding system default categories...");

            List<Category> defaultCategories = List.of(
                    // Essential Expenses
                    buildCategory("Housing & Rent", CategoryType.EXPENSE, "home", "#3B82F6"),
                    buildCategory("Utilities & Bills", CategoryType.EXPENSE, "zap", "#06B6D4"),
                    buildCategory("Groceries", CategoryType.EXPENSE, "shopping-cart", "#10B981"),
                    buildCategory("Food & Dining", CategoryType.EXPENSE, "utensils", "#F59E0B"),
                    buildCategory("Transportation", CategoryType.EXPENSE, "car", "#6366F1"),
                    buildCategory("Healthcare & Medical", CategoryType.EXPENSE, "heart-pulse", "#EF4444"),
                    buildCategory("Education", CategoryType.EXPENSE, "graduation-cap", "#8B5CF6"),

                    // Lifestyle Expenses
                    buildCategory("Shopping & Apparel", CategoryType.EXPENSE, "shopping-bag", "#EC4899"),
                    buildCategory("Entertainment & Leisure", CategoryType.EXPENSE, "film", "#F97316"),
                    buildCategory("Travel & Holidays", CategoryType.EXPENSE, "plane", "#14B8A6"),
                    buildCategory("Subscriptions & SaaS", CategoryType.EXPENSE, "repeat", "#A855F7"),
                    buildCategory("Personal Care", CategoryType.EXPENSE, "sparkles", "#D946EF"),

                    // Financial Expenses
                    buildCategory("Investments", CategoryType.EXPENSE, "trending-up", "#059669"),
                    buildCategory("Insurance", CategoryType.EXPENSE, "shield-check", "#0284C7"),
                    buildCategory("Loan & EMI Repayment", CategoryType.EXPENSE, "credit-card", "#DC2626"),
                    buildCategory("General Miscellaneous", CategoryType.EXPENSE, "help-circle", "#64748B"),

                    // Income Sources
                    buildCategory("Salary & Wages", CategoryType.INCOME, "briefcase", "#10B981"),
                    buildCategory("Freelance & Consulting", CategoryType.INCOME, "laptop", "#06B6D4"),
                    buildCategory("Business Revenue", CategoryType.INCOME, "building", "#3B82F6"),
                    buildCategory("Dividends & Interest", CategoryType.INCOME, "percent", "#8B5CF6"),
                    buildCategory("Gifts & Grants", CategoryType.INCOME, "gift", "#EC4899"),
                    buildCategory("Other Income", CategoryType.INCOME, "plus-circle", "#64748B"),

                    // Transfer
                    buildCategory("Account Transfer", CategoryType.TRANSFER, "arrow-left-right", "#6366F1")
            );

            categoryRepository.saveAll(defaultCategories);
            log.info("Successfully seeded {} system categories.", defaultCategories.size());
        }
    }

    private Category buildCategory(String name, CategoryType type, String icon, String color) {
        return Category.builder()
                .name(name)
                .categoryType(type)
                .icon(icon)
                .color(color)
                .isSystemDefault(true)
                .build();
    }
}
