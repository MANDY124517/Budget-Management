-- =================================================================
-- SmartBudget Database Initialization Script
-- =================================================================

-- Create database if not exists (Postgres creates specified DB via env var)
-- CREATE DATABASE smartbudget_db;

-- Enable UUID and cryptographic extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE smartbudget_db TO postgres;
