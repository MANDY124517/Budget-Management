-- =================================================================
-- SmartBudget Database Migration: V1__init_schema.sql
-- Description: Creates 10 core normalized tables, foreign keys, 
--              constraints, and performance indexes.
-- =================================================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    default_currency VARCHAR(3) NOT NULL DEFAULT 'INR',
    role VARCHAR(20) NOT NULL DEFAULT 'ROLE_USER',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 2. Accounts Table
CREATE TABLE IF NOT EXISTS accounts (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    account_type VARCHAR(30) NOT NULL,
    balance NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(3) NOT NULL DEFAULT 'INR',
    institution_name VARCHAR(100),
    account_number_mask VARCHAR(10),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_account_type CHECK (account_type IN ('CHECKING', 'SAVINGS', 'CREDIT_CARD', 'CASH', 'INVESTMENT', 'LOAN'))
);

CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_accounts_user_active ON accounts(user_id, is_active);

-- 3. Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    category_type VARCHAR(20) NOT NULL,
    icon VARCHAR(50) DEFAULT 'tag',
    color VARCHAR(20) DEFAULT '#6366F1',
    is_system_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_category_type CHECK (category_type IN ('INCOME', 'EXPENSE', 'TRANSFER'))
);

CREATE INDEX IF NOT EXISTS idx_categories_user_type ON categories(user_id, category_type);
CREATE INDEX IF NOT EXISTS idx_categories_system_default ON categories(is_system_default);

-- 4. Recurring Transactions Table (Referenced by transactions)
CREATE TABLE IF NOT EXISTS recurring_transactions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    account_id BIGINT NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,
    category_id BIGINT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    transaction_type VARCHAR(20) NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    frequency VARCHAR(20) NOT NULL,
    interval_count INTEGER NOT NULL DEFAULT 1,
    start_date DATE NOT NULL,
    next_execution_date DATE NOT NULL,
    end_date DATE,
    description VARCHAR(255) NOT NULL,
    payment_method VARCHAR(30) DEFAULT 'AUTO_DEBIT',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_recurring_tx_type CHECK (transaction_type IN ('INCOME', 'EXPENSE', 'TRANSFER')),
    CONSTRAINT chk_recurring_amount CHECK (amount > 0),
    CONSTRAINT chk_recurring_frequency CHECK (frequency IN ('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY'))
);

CREATE INDEX IF NOT EXISTS idx_recurring_user ON recurring_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_recurring_next_exec ON recurring_transactions(is_active, next_execution_date);

-- 5. Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    account_id BIGINT NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,
    category_id BIGINT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    transfer_target_account_id BIGINT REFERENCES accounts(id) ON DELETE RESTRICT,
    transaction_type VARCHAR(20) NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'INR',
    transaction_date DATE NOT NULL,
    description VARCHAR(255) NOT NULL,
    payment_method VARCHAR(30) DEFAULT 'OTHER',
    notes TEXT,
    is_recurring BOOLEAN NOT NULL DEFAULT FALSE,
    recurring_transaction_id BIGINT REFERENCES recurring_transactions(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_transaction_type CHECK (transaction_type IN ('INCOME', 'EXPENSE', 'TRANSFER')),
    CONSTRAINT chk_transaction_amount CHECK (amount > 0)
);

CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_account ON transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_type ON transactions(user_id, transaction_type);
CREATE INDEX IF NOT EXISTS idx_transactions_target_account ON transactions(transfer_target_account_id);

-- 6. Budgets Table
CREATE TABLE IF NOT EXISTS budgets (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    period VARCHAR(20) NOT NULL DEFAULT 'MONTHLY',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_budget_amount NUMERIC(15, 2) NOT NULL,
    alert_threshold_percentage NUMERIC(5, 2) NOT NULL DEFAULT 80.00,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_budget_period CHECK (period IN ('WEEKLY', 'MONTHLY', 'YEARLY', 'CUSTOM')),
    CONSTRAINT chk_budget_total_amount CHECK (total_budget_amount > 0)
);

CREATE INDEX IF NOT EXISTS idx_budgets_user_period ON budgets(user_id, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_budgets_user_active ON budgets(user_id, is_active);

-- 7. Budget Categories Table
CREATE TABLE IF NOT EXISTS budget_categories (
    id BIGSERIAL PRIMARY KEY,
    budget_id BIGINT NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
    category_id BIGINT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    allocated_amount NUMERIC(15, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_budget_category UNIQUE (budget_id, category_id),
    CONSTRAINT chk_budget_category_amount CHECK (allocated_amount >= 0)
);

CREATE INDEX IF NOT EXISTS idx_budget_categories_budget ON budget_categories(budget_id);

-- 8. Savings Goals Table
CREATE TABLE IF NOT EXISTS savings_goals (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_account_id BIGINT REFERENCES accounts(id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL,
    target_amount NUMERIC(15, 2) NOT NULL,
    current_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    target_date DATE NOT NULL,
    priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    status VARCHAR(20) NOT NULL DEFAULT 'IN_PROGRESS',
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_goal_target_amount CHECK (target_amount > 0),
    CONSTRAINT chk_goal_current_amount CHECK (current_amount >= 0),
    CONSTRAINT chk_goal_priority CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    CONSTRAINT chk_goal_status CHECK (status IN ('IN_PROGRESS', 'COMPLETED', 'PAUSED', 'CANCELLED'))
);

CREATE INDEX IF NOT EXISTS idx_savings_goals_user ON savings_goals(user_id, status);

-- 9. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL DEFAULT 'INFO',
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_notification_severity CHECK (severity IN ('INFO', 'WARNING', 'DANGER', 'SUCCESS'))
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read, created_at DESC);

-- 10. Financial Insights Table
CREATE TABLE IF NOT EXISTS financial_insights (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    insight_type VARCHAR(50) NOT NULL,
    title VARCHAR(150) NOT NULL,
    summary TEXT NOT NULL,
    confidence_score NUMERIC(4, 2) DEFAULT 0.95,
    insight_data JSONB,
    period_start DATE,
    period_end DATE,
    is_dismissed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_insights_user_created ON financial_insights(user_id, is_dismissed, created_at DESC);
