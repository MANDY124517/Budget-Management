# SmartBudget — Architecture Documentation

**Version:** 1.0  
**Date:** September 2026  
**Status:** Approved Architectural Blueprint  

---

## 1. Executive Summary

SmartBudget is a production-grade, full-stack personal budget and financial intelligence platform. Designed as a **microservice-lite modular architecture**, it combines the enterprise robustness of **Java Spring Boot**, the analytical power of **Python FastAPI & Scikit-learn**, and the responsive UI capability of **React 19 + TypeScript + Vite + Tailwind CSS**, backed by a normalized **PostgreSQL** relational database.

```
                    ┌─────────────────────────────────────────┐
                    │             React Frontend              │
                    │      (TypeScript / Vite / Tailwind)     │
                    └────────────────────┬────────────────────┘
                                         │
                                         │ HTTPS / REST (JWT in Bearer)
                                         ▼
                    ┌─────────────────────────────────────────┐
                    │         Java 21 Spring Boot API         │
                    │   (Security, Auth, Business Rules, DB)  │
                    └──────────────┬──────────────────┬───────┘
                                   │                  │
                JPA / Flyway / SQL │                  │ REST (Internal JWT/mTLS)
                                   ▼                  ▼
                    ┌──────────────────────┐   ┌───────────────────────────┐
                    │ PostgreSQL Database  │   │   Python FastAPI Engine   │
                    │ (Normalized, NUMERIC)│   │  (Pandas, Scikit-learn,   │
                    └──────────────────────┘   │   Forecasting, Insights)  │
                                               └──────────────┬────────────┘
                                                              │ Direct Read/SQL (Opt)
                                                              └──────────────┘
```

---

## 2. Core Architectural Principles

1. **Precision First (Zero Floating-Point Financials):** All monetary values are strictly represented using `NUMERIC(15,2)` in PostgreSQL, `BigDecimal` in Java, and validated string/decimal wrappers across APIs to eliminate IEEE 754 floating-point inaccuracies.
2. **Modular Monolith for Core Business Logic:** The Java Spring Boot service acts as the central business engine handling identity, tenant isolation, ACID transaction state transitions, double-entry transfer balances, and budget constraints.
3. **Dedicated Python Financial Intelligence Service:** Machine learning, expense forecasting (Linear Regression, Moving Average, Gradient Boosting), anomaly detection (Isolation Forest & Z-Score), and explainable Financial Health Scoring (0–100) run independently in a lightweight, stateless FastAPI microservice.
4. **Strict Tenant Isolation & Security:** Every database query enforces `user_id` ownership. No user can access or manipulate data belonging to another account.
5. **Robust API-First Design:** Clean OpenAPI 3.0 specification, unified error envelope format, strong validation (JSR-380 / Pydantic v2), and pagination on all high-volume endpoints.

---

## 3. System Components & Responsibilities

### 3.1 React Frontend (`/frontend`)
- **Technology Stack:** React 19, TypeScript, Vite, React Router v6, TanStack Query v5, Axios, Tailwind CSS, Recharts, Lucide Icons.
- **Responsibilities:**
  - Modern Fintech dashboard with responsive desktop/tablet/mobile layouts.
  - Interactive data visualization (Income vs. Expense, Monthly Spending Trend, Category Pie Charts, Budget Utilization Gauges, Goal Progress).
  - Client-side validation, JWT lifecycle management (auto-refresh, secure in-memory storage with HttpOnly refresh cookies / local tokens).
  - Real-time notification banners for 80%, 100%, and 120% budget threshold alerts.

### 3.2 Java Spring Boot Backend (`/backend`)
- **Technology Stack:** Java 21, Spring Boot 3.3+, Spring Security 6, Spring Data JPA, Hibernate, Flyway Migration, JJWT, MapStruct, Lombok, Maven.
- **Layered Architecture:**
  ```
  controller/       --> REST endpoints, request mapping, validation triggers
  service/          --> Business logic, balance updates, budget rules, transaction workflows
  repository/       --> Spring Data JPA repositories with optimized JPQL/native queries
  entity/           --> JPA entities mapped to PostgreSQL tables
  dto/              --> Request/Response Data Transfer Objects (no entity leakage)
  mapper/           --> MapStruct type-safe mappers
  security/         --> JWT filter, UserDetailsService, SecurityFilterChain, CORS config
  exception/        --> GlobalExceptionHandler, custom domain exceptions, ProblemDetails
  config/           --> WebClient/RestTemplate, Jackson BigDecimal serialization, OpenAPI
  ```
- **Responsibilities:**
  - User authentication (BCrypt hashing, JWT issuance & verification).
  - Account balance integrity during transaction creation, editing, deletion, and transfers.
  - Automated recurring transaction execution via Spring `@Scheduled` background tasks.
  - Proxying and enriching requests to the Python Analytics engine.

### 3.3 PostgreSQL Database (`/database`)
- **Technology Stack:** PostgreSQL 16+.
- **Responsibilities:**
  - Full relational schema (10 normalized core tables).
  - ACID transactions for multi-account transfers and balance rollbacks.
  - Foreign keys with `ON DELETE CASCADE` or `RESTRICT` depending on data retention rules.
  - B-tree composite indexes on `(user_id, transaction_date)`, `(user_id, category_id)`, `(user_id, status)`.
  - Schema migrations tracked version-by-version using Flyway.

### 3.4 Python FastAPI Analytics Service (`/analytics`)
- **Technology Stack:** Python 3.12+, FastAPI, Uvicorn, Pandas, NumPy, Scikit-learn, Pydantic v2.
- **Responsibilities:**
  - **Spending Analytics:** Aggregates, category breakdowns, growth rates, month-over-month variances.
  - **Expense Forecasting:** Baseline Moving Averages, Multi-variable Linear Regression, and Ridge/RandomForest regressors predicting next month's spending with confidence intervals.
  - **Anomaly Detection:** Outlier detection on transaction amounts per category using Z-score (>2.5σ) and Isolation Forest.
  - **Financial Health Score:** Transparent 0–100 score computed from 5 weighted components (Savings Rate, Budget Adherence, Spending Stability, Emergency Fund, Debt Ratio).
  - **Human-Readable Insights:** Natural-language financial commentary grounded in verified user statistics.

---

## 4. Communication & Data Flow

### 4.1 Synchronous Flow for Standard Operations
```
[Browser] --- (HTTPS / JWT) ---> [Spring Boot] ---> [PostgreSQL]
```

### 4.2 Analytics & AI/ML Request Flow
```
[Browser] 
   │ 1. GET /api/analytics/dashboard-insights
   ▼
[Spring Boot Backend]
   │ 2. Fetch User's 6-12 month Transaction & Budget History
   ▼
[PostgreSQL Database]
   │ 3. Return Historical Records
   ▼
[Spring Boot Backend]
   │ 4. POST http://analytics:8001/analytics/full-analysis (JSON Payload)
   ▼
[Python FastAPI Service]
   │ 5. Execute ML pipelines (Pandas/Scikit-learn/IsolationForest)
   │ 6. Generate Health Score, Forecasts, Anomalies, Insights
   ▼
[Spring Boot Backend]
   │ 7. Cache or persist high-level metrics & audit insights
   ▼
[Browser / React UI] (Render interactive charts & insights)
```

---

## 5. Security & Tenant Isolation

1. **Authentication:**
   - Stateless JWT tokens signed with HMAC-SHA256 / RSA with configurable TTL (e.g. 15-minute access token, 7-day refresh token).
   - Standard BCrypt work factor of 12.
2. **Authorization:**
   - PreAuthorize `@PreAuthorize("isAuthenticated()")` and tenant verification at service/repository level.
   - Example: `transactionRepository.findByIdAndUserId(id, currentUser.getId())`.
3. **Data Protection:**
   - No banking credentials (CVV, PINs, bank passwords) stored or collected.
   - Environment variables for all secrets (`JWT_SECRET`, `POSTGRES_PASSWORD`, `INTERNAL_API_KEY`).
   - Strict CORS configuration whitelisting the React origin.
   - Content Security Policy (CSP), X-Content-Type-Options, X-Frame-Options headers enforced.

---

## 6. Deployment & Container Architecture

The system is fully containerized using Docker and orchestrated with Docker Compose:

```
docker-compose.yml
├── postgres       :5432  (Data persistence with named volume)
├── backend        :8080  (Spring Boot Java 21, depends_on: postgres)
├── analytics      :8001  (FastAPI Python 3.12, internal network)
└── frontend       :3000  (Vite dev server / Nginx production build)
```
