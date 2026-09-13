-- =================================================================
-- SmartBudget Database Migration: V2__seed_default_categories.sql
-- Description: Seeds standardized system default categories with 
--              Lucide icon names and modern aesthetic hex colors.
-- =================================================================

INSERT INTO categories (user_id, name, category_type, icon, color, is_system_default) VALUES
-- Essential Expenses
(NULL, 'Housing & Rent', 'EXPENSE', 'home', '#3B82F6', TRUE),
(NULL, 'Utilities & Bills', 'EXPENSE', 'zap', '#06B6D4', TRUE),
(NULL, 'Groceries', 'EXPENSE', 'shopping-cart', '#10B981', TRUE),
(NULL, 'Food & Dining', 'EXPENSE', 'utensils', '#F59E0B', TRUE),
(NULL, 'Transportation', 'EXPENSE', 'car', '#6366F1', TRUE),
(NULL, 'Healthcare & Medical', 'EXPENSE', 'heart-pulse', '#EF4444', TRUE),
(NULL, 'Education', 'EXPENSE', 'graduation-cap', '#8B5CF6', TRUE),

-- Lifestyle Expenses
(NULL, 'Shopping & Apparel', 'EXPENSE', 'shopping-bag', '#EC4899', TRUE),
(NULL, 'Entertainment & Leisure', 'EXPENSE', 'film', '#F97316', TRUE),
(NULL, 'Travel & Holidays', 'EXPENSE', 'plane', '#14B8A6', TRUE),
(NULL, 'Subscriptions & SaaS', 'EXPENSE', 'repeat', '#A855F7', TRUE),
(NULL, 'Personal Care', 'EXPENSE', 'sparkles', '#D946EF', TRUE),

-- Financial Expenses
(NULL, 'Investments', 'EXPENSE', 'trending-up', '#059669', TRUE),
(NULL, 'Insurance', 'EXPENSE', 'shield-check', '#0284C7', TRUE),
(NULL, 'Loan & EMI Repayment', 'EXPENSE', 'credit-card', '#DC2626', TRUE),
(NULL, 'General Miscellaneous', 'EXPENSE', 'help-circle', '#64748B', TRUE),

-- Income Sources
(NULL, 'Salary & Wages', 'INCOME', 'briefcase', '#10B981', TRUE),
(NULL, 'Freelance & Consulting', 'INCOME', 'laptop', '#06B6D4', TRUE),
(NULL, 'Business Revenue', 'INCOME', 'building', '#3B82F6', TRUE),
(NULL, 'Dividends & Interest', 'INCOME', 'percent', '#8B5CF6', TRUE),
(NULL, 'Gifts & Grants', 'INCOME', 'gift', '#EC4899', TRUE),
(NULL, 'Other Income', 'INCOME', 'plus-circle', '#64748B', TRUE),

-- Transfer
(NULL, 'Account Transfer', 'TRANSFER', 'arrow-left-right', '#6366F1', TRUE);
