# Product Requirements Document — SmartBudget

**Project Name:** SmartBudget  
**Version:** 1.0  
**Product Type:** Full-Stack Personal Budget & Financial Management Platform

---

## 1. Product Overview

SmartBudget is a web-based budget management system that allows users to track income, expenses, budgets, savings goals, and financial performance from a single dashboard.

The system will combine:

- **React.js** — Frontend/UI
- **Java + Spring Boot** — Core backend and REST APIs
- **Python + FastAPI** — Financial analytics, prediction and intelligent insights
- **PostgreSQL** — Persistent database
- **JWT/OAuth2** — Authentication and authorization
- **Docker** — Application containerization
- **REST APIs** — Communication between frontend and backend

The goal is to give users a clear understanding of where their money comes from, where it goes, whether they are staying within budget, and what their future financial position may look like.

---

## 2. Problem Statement

Many people track their finances using spreadsheets, notes, banking applications, or multiple disconnected applications.

This creates several problems:

- Difficult to understand monthly spending
- No centralized view of income and expenses
- Users forget recurring payments
- Difficult to compare planned vs. actual spending
- No meaningful spending analysis
- Difficult to track savings goals
- No prediction of future expenses
- Financial data becomes fragmented

SmartBudget solves this by providing a centralized platform for **budget planning, transaction tracking, analytics and financial forecasting**.

---

## 3. Product Goals

### Primary Goals

1. Allow users to record and categorize income and expenses.
2. Allow users to create monthly/weekly budgets.
3. Show planned vs. actual spending.
4. Provide useful financial dashboards.
5. Track savings goals.
6. Detect unusual spending patterns.
7. Forecast future spending using Python.
8. Provide actionable financial insights.
9. Maintain secure financial data.
10. Provide a clean and responsive React interface.

---

## 4. Target Users

### Individual Users

People who want to manage:

- Salary
- Freelance income
- Household expenses
- Rent
- Food
- Transportation
- Subscriptions
- Shopping
- Savings

### Students

Useful for tracking:

- Monthly allowance
- Education expenses
- Accommodation
- Food
- Transportation
- Entertainment

### Professionals

Useful for:

- Salary management
- Investment planning
- Monthly budgeting
- Savings targets
- Recurring bills

---

# 5. Core Features

## 5.1 User Authentication

Users should be able to:

- Register
- Login
- Logout
- Reset password
- Update profile
- Change password
- Manage account settings

### Authentication Architecture

```text
React
   ↓
Spring Boot REST API
   ↓
JWT Authentication
   ↓
PostgreSQL
```

Passwords must never be stored as plain text.

Recommended password hashing:

```text
BCrypt / Argon2
```

---

## 5.2 Dashboard

The dashboard is the central screen of the application.

### Dashboard Information

Display:

```text
Current Balance
₹85,400

Monthly Income
₹70,000

Monthly Expenses
₹42,500

Monthly Savings
₹27,500

Budget Remaining
₹12,300
```

### Charts

The dashboard should display:

- Income vs. Expenses
- Expense by Category
- Monthly Spending Trend
- Budget Utilization
- Savings Progress

---

## 5.3 Transaction Management

Users can create financial transactions.

### Transaction Types

```text
INCOME
EXPENSE
TRANSFER
```

### Transaction Fields

```text
Transaction ID
User ID
Amount
Type
Category
Description
Date
Payment Method
Account
Recurring
Notes
Created At
Updated At
```

### Example

```text
Expense

Amount: ₹1,250
Category: Food
Description: Restaurant
Date: 13 September 2026
Payment Method: UPI
Account: Bank Account
```

---

## 5.4 Expense Categories

### Essential

- Rent
- Utilities
- Groceries
- Food
- Transportation
- Healthcare
- Education

### Lifestyle

- Shopping
- Entertainment
- Travel
- Restaurants
- Subscriptions

### Financial

- Investments
- Insurance
- Loan Payment
- Savings

Users should also be able to create custom categories.

---

## 5.5 Income Management

Users can record multiple income sources.

Examples:

```text
Salary
Freelancing
Business
Scholarship
Interest
Investment
Other
```

Each income transaction should include:

```text
Amount
Source
Date
Description
Account
Recurring
```

---

## 5.6 Budget Management

This is the core feature of the application.

Users can create budgets for:

- Monthly
- Weekly
- Yearly
- Category-specific budgets

### Example

```text
September 2026 Budget

Food              ₹8,000
Transportation    ₹4,000
Entertainment     ₹3,000
Shopping          ₹5,000
Subscriptions     ₹2,000
-------------------------
Total             ₹22,000
```

The system compares:

```text
Budget
   ↓
Actual Spending
   ↓
Remaining Amount
   ↓
Utilization %
```

Example:

```text
Food

Budget:       ₹8,000
Spent:        ₹6,400
Remaining:    ₹1,600

Utilization:  80%
```

---

## 5.7 Budget Alerts

The system should automatically notify users when they approach their budget limits.

### 80% Threshold

> You have used 80% of your Food budget.

### 100% Threshold

> Your Food budget has been exceeded by ₹750.

### 120% Threshold

> Your Food spending is 20% above your planned budget.

Users should be able to configure these thresholds.

---

## 5.8 Recurring Transactions

Users should be able to create recurring transactions.

### Example

```text
Netflix
₹649
Monthly
5th of every month
```

```text
Rent
₹15,000
Monthly
1st of every month
```

```text
Salary
₹70,000
Monthly
1st of every month
```

The system automatically generates the transaction when the recurrence date arrives.

---

## 5.9 Savings Goals

Users can create financial goals.

### Example

```text
Goal: New Laptop

Target: ₹100,000
Current: ₹45,000
Remaining: ₹55,000

Progress: 45%
```

### Goal Fields

```text
Goal ID
Name
Target Amount
Current Amount
Target Date
Priority
Description
Status
```

Possible goals:

- Emergency fund
- Laptop
- Car
- Travel
- Education
- House
- Investment

---

# 6. Financial Analytics

Python should be used for the computational and analytics layer rather than duplicating the Java CRUD backend.

### Architecture

```text
React
  ↓
Java Spring Boot
  ↓
PostgreSQL
  ↓
Python Analytics Service
```

Python can calculate:

### Spending Statistics

- Average monthly spending
- Average category spending
- Highest spending category
- Lowest spending category
- Monthly savings rate

### Financial Ratios

```text
Savings Rate =
Savings / Income × 100
```

Example:

```text
Income = ₹70,000
Savings = ₹27,500

Savings Rate = 39.28%
```

---

# 7. Spending Pattern Detection

Python can identify unusual spending.

Example:

```text
Normal Food Spending:
₹6,000–₹8,000/month

Current:
₹12,500

Alert:
Food spending is approximately 60% higher
than your normal monthly average.
```

Potential techniques:

- Moving averages
- Standard deviation
- Z-score
- Isolation Forest
- Clustering

For the first version, use simple statistical analysis before introducing complex ML.

---

# 8. Expense Forecasting

Python can predict expected expenses.

Example historical data:

```text
April      ₹38,000
May        ₹41,000
June       ₹39,500
July       ₹44,000
August     ₹46,000
September  ₹42,500
```

Example forecast:

```text
October estimated spending:

₹44,800
```

Possible technologies:

```text
Python
Pandas
NumPy
Scikit-learn
```

Later versions could use:

```text
Prophet
XGBoost
LSTM
```

Do not start with deep learning. A strong statistical/ML baseline is more appropriate for the first release.

---

# 9. Financial Insights

Python should generate understandable insights rather than exposing raw ML output.

Example insights:

> Your transportation expenses increased by 18% compared with last month.

> You spent ₹3,200 more on entertainment than your monthly average.

> If your current savings rate continues, you are projected to reach your laptop goal in approximately 4 months.

> Your average monthly savings rate is 31%.

---

# 10. Reports

Users should be able to generate reports.

### Monthly Report

```text
September 2026

Total Income       ₹70,000
Total Expenses     ₹42,500
Total Savings      ₹27,500

Savings Rate       39.3%

Highest Category:
Food — ₹8,400

Budget Usage:
76%
```

Reports can eventually be exported as:

- PDF
- CSV
- Excel

---

# 11. Search & Filtering

Transactions should support:

- Search
- Date range
- Category
- Transaction type
- Amount range
- Account
- Payment method

Example:

```text
Show:

Expenses
between ₹500 and ₹2,000
in August
category = Food
```

---

# 12. Accounts

Users can maintain multiple financial accounts.

Examples:

```text
HDFC Bank
SBI Bank
Cash
UPI
Credit Card
Savings Account
```

Each account should maintain its own balance.

Example:

```text
HDFC Bank       ₹52,000
SBI Bank        ₹31,500
Cash             ₹2,500
Credit Card     -₹4,000
------------------------
Net Balance     ₹82,000
```

---

# 13. PostgreSQL Database Design

Recommended initial structure:

```text
users
  │
  ├── accounts
  │
  ├── transactions
  │       │
  │       └── categories
  │
  ├── budgets
  │
  ├── savings_goals
  │
  ├── recurring_transactions
  │
  └── notifications
```

### Main Tables

```text
users
accounts
transactions
categories
budgets
budget_categories
savings_goals
recurring_transactions
notifications
financial_insights
```

---

# 14. Example Database Schema

## users

```text
id
name
email
password_hash
currency
created_at
updated_at
```

## accounts

```text
id
user_id
name
type
balance
currency
created_at
```

## transactions

```text
id
user_id
account_id
category_id
type
amount
description
transaction_date
payment_method
is_recurring
created_at
updated_at
```

## categories

```text
id
user_id
name
type
icon
created_at
```

## budgets

```text
id
user_id
name
amount
period
start_date
end_date
created_at
```

## savings_goals

```text
id
user_id
name
target_amount
current_amount
target_date
priority
status
created_at
```

---

# 15. Backend Architecture

Use a microservice-lite architecture rather than turning the application into an unnecessarily complex distributed system.

```text
                 ┌───────────────┐
                 │    React      │
                 │   Frontend    │
                 └───────┬───────┘
                         │
                         │ REST API
                         ▼
                ┌──────────────────┐
                │  Java Spring     │
                │     Boot         │
                │                  │
                │ Authentication   │
                │ Transactions     │
                │ Budgets          │
                │ Accounts         │
                │ Goals            │
                └────────┬─────────┘
                         │
                         ▼
                ┌──────────────────┐
                │   PostgreSQL     │
                └────────┬─────────┘
                         │
                         │ Analytics Data
                         ▼
                ┌──────────────────┐
                │ Python FastAPI   │
                │                  │
                │ Analytics        │
                │ Forecasting      │
                │ Anomaly Detection│
                │ Insights         │
                └──────────────────┘
```

---

# 16. Java Responsibilities

Use **Spring Boot**.

Java should handle the core business logic:

```text
Authentication
Authorization
Users
Accounts
Transactions
Categories
Budgets
Savings Goals
Recurring Transactions
Notifications
Reports
```

### Suggested Java Stack

```text
Java 21+
Spring Boot
Spring Security
Spring Data JPA
Hibernate
JWT
Bean Validation
Maven
JUnit
Mockito
```

---

# 17. Python Responsibilities

Python should be a separate analytics service.

### Suggested Stack

```text
Python 3.12+
FastAPI
Pandas
NumPy
Scikit-learn
Pydantic
```

### Python APIs

```http
POST /analytics/spending
POST /analytics/forecast
POST /analytics/anomaly-detection
POST /analytics/savings-projection
GET  /analytics/insights/{userId}
```

---

# 18. React Responsibilities

React should provide:

```text
Dashboard
Login/Register
Transactions
Budgets
Accounts
Savings Goals
Analytics
Reports
Settings
Notifications
```

### Recommended Stack

```text
React
TypeScript
Vite
React Router
TanStack Query
Axios
Recharts
Tailwind CSS
```

---

# 19. API Design

## Authentication

```http
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
```

## Transactions

```http
GET    /api/transactions
POST   /api/transactions
GET    /api/transactions/{id}
PUT    /api/transactions/{id}
DELETE /api/transactions/{id}
```

## Budgets

```http
GET    /api/budgets
POST   /api/budgets
GET    /api/budgets/{id}
PUT    /api/budgets/{id}
DELETE /api/budgets/{id}
```

## Accounts

```http
GET    /api/accounts
POST   /api/accounts
PUT    /api/accounts/{id}
DELETE /api/accounts/{id}
```

## Goals

```http
GET    /api/goals
POST   /api/goals
PUT    /api/goals/{id}
DELETE /api/goals/{id}
```

---

# 20. Analytics APIs

Python:

```http
POST /api/analytics/spending-analysis
```

Request:

```json
{
  "userId": 123,
  "startDate": "2026-01-01",
  "endDate": "2026-09-30"
}
```

Response:

```json
{
  "totalIncome": 630000,
  "totalExpenses": 382000,
  "savingsRate": 39.36,
  "highestCategory": "Food",
  "forecastNextMonth": 45200
}
```

---

# 21. Security Requirements

Because this application handles financial information, security is a core requirement.

Requirements:

- Password hashing
- JWT authentication
- Role-based authorization
- HTTPS
- Input validation
- SQL injection protection
- CORS configuration
- Rate limiting
- Secure HTTP headers
- Database constraints
- Audit logs
- No financial credentials stored

The system must **never store bank passwords, UPI PINs, card CVVs, or banking credentials.**

---

# 22. Non-Functional Requirements

## Performance

Normal API requests:

```text
< 500 ms
```

Dashboard:

```text
< 2 seconds
```

## Availability

Target:

```text
99%+
```

## Scalability

The system should eventually support:

```text
10,000+ users
100,000+ transactions
```

without requiring a major architectural redesign.

---

# 23. UI Pages

The React application should contain:

```text
/
├── Login
├── Register
├── Dashboard
├── Transactions
│   ├── All Transactions
│   ├── Add Transaction
│   └── Transaction Details
├── Budgets
├── Accounts
├── Savings Goals
├── Analytics
├── Reports
├── Notifications
└── Settings
```

---

# 24. Dashboard UI

Suggested layout:

```text
┌───────────────────────────────────────────────────────┐
│ SmartBudget                    🔔     Profile          │
├──────────────┬────────────────────────────────────────┤
│              │                                        │
│ Dashboard    │  Total Balance                         │
│              │  ₹82,000                               │
│ Transactions │                                        │
│              │  Income      Expenses      Savings     │
│ Budgets      │  ₹70K         ₹42.5K       ₹27.5K      │
│              │                                        │
│ Accounts     │  ┌──────────────────────────────────┐ │
│              │  │     Income vs Expense Chart       │ │
│ Goals        │  │                                  │ │
│              │  └──────────────────────────────────┘ │
│ Analytics    │                                        │
│              │  Spending by Category                 │
│ Reports      │  Food          25%                    │
│              │  Transport     15%                    │
│ Settings     │  Shopping      20%                    │
│              │                                        │
└──────────────┴────────────────────────────────────────┘
```

---

# 25. MVP

Do not build everything at once.

## Phase 1 — MVP

Build:

- Registration/Login
- Dashboard
- Accounts
- Income
- Expenses
- Categories
- Transactions
- Monthly budgets
- Basic charts
- PostgreSQL database

Initial technology:

```text
React
   +
Java Spring Boot
   +
PostgreSQL
```

---

# 26. Phase 2

Add:

- Recurring transactions
- Savings goals
- Notifications
- Advanced filtering
- Monthly reports
- CSV export
- PDF reports

---

# 27. Phase 3 — AI/ML

Add:

### Spending Prediction

Predict next month's expenses.

### Anomaly Detection

Detect unusual spending.

### Financial Insights

Explain spending behavior.

### Savings Prediction

Predict when the user will reach a savings goal.

---

# 28. Phase 4 — Advanced Features

Potential future features:

- Email notifications
- Multi-currency support
- Family/shared budgets
- Investment tracking
- Debt tracking
- Subscription tracking
- Financial health score
- Automatic transaction categorization
- Bank transaction imports
- Mobile application
- AI financial assistant

For bank integrations, use appropriate regulated/open-banking providers where available rather than implementing credential handling yourself.

---

# 29. Financial Health Score

A strong portfolio feature would be a **Financial Health Score**.

Example:

```text
Financial Health

████████████████░░░░ 82/100

Savings Rate        90/100
Budget Discipline   78/100
Spending Stability  81/100
Emergency Fund      75/100
Debt Management     85/100
```

Python calculates the score from multiple financial indicators.

---

# 30. Suggested ML Pipeline

```text
PostgreSQL
     ↓
Transaction Data
     ↓
Pandas
     ↓
Data Cleaning
     ↓
Feature Engineering
     ↓
        ┌───────────────┐
        │               │
        ▼               ▼
  Forecasting      Anomaly Detection
        │               │
        └───────┬───────┘
                ▼
        Financial Insights
                ↓
             FastAPI
                ↓
             React
```

---

# 31. Project Structure

## Java Backend

```text
budget-management-backend/
│
├── src/main/java/com/smartbudget/
│
├── controller/
├── service/
├── repository/
├── entity/
├── dto/
├── mapper/
├── security/
├── exception/
├── config/
└── BudgetManagementApplication.java
```

## Python Analytics Service

```text
budget-analytics/
│
├── app/
│   ├── main.py
│   ├── routes/
│   ├── services/
│   ├── models/
│   ├── analytics/
│   ├── forecasting/
│   └── utils/
│
├── tests/
├── requirements.txt
└── Dockerfile
```

## React Frontend

```text
budget-management-frontend/
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── layouts/
│   ├── hooks/
│   ├── services/
│   ├── api/
│   ├── types/
│   ├── utils/
│   └── App.tsx
│
├── package.json
└── Dockerfile
```

---

# 32. Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript |
| UI | Tailwind CSS |
| Charts | Recharts |
| Backend | Java |
| Framework | Spring Boot |
| Security | Spring Security + JWT |
| ORM | Hibernate/JPA |
| Database | PostgreSQL |
| Analytics | Python |
| Python API | FastAPI |
| Data Science | Pandas + NumPy |
| ML | Scikit-learn |
| API | REST |
| Testing | JUnit + Mockito + Pytest |
| Build | Maven + npm |
| Containerization | Docker |
| Version Control | Git/GitHub |

---

# 33. Success Metrics

The system should be considered successful when a user can:

1. Register and securely log in.
2. Add their bank/cash accounts.
3. Record income and expenses.
4. Categorize transactions.
5. Create a monthly budget.
6. See budget utilization.
7. Track savings.
8. Analyze spending.
9. Receive budget alerts.
10. View predicted future expenses.
11. Understand their financial health.

---

# 34. Key Product Differentiator

The project should **not** be just another CRUD expense tracker.

A basic implementation is:

```text
React → Java → PostgreSQL
Add/Edit/Delete Expenses
```

That is useful for learning, but it does not demonstrate the full potential of the technology stack.

A stronger portfolio project is:

```text
React Dashboard
       +
Java Financial Backend
       +
PostgreSQL Financial Data Model
       +
Python Analytics/ML Engine
```

The system should be able to answer:

- Where am I spending the most?
- Am I going to exceed my budget?
- How much will I probably spend next month?
- Why did my spending increase?
- When will I reach my savings goal?
- How healthy is my current financial behavior?

---

# 35. Final Architecture

```text
                         SMARTBUDGET
                              │
             ┌────────────────┴────────────────┐
             │                                 │
             ▼                                 ▼
       React + TypeScript                 Authentication
             │                                 │
             └──────────────┬──────────────────┘
                            ▼
                   Java Spring Boot
                            │
          ┌─────────────────┼─────────────────┐
          │                 │                 │
          ▼                 ▼                 ▼
     Transactions        Budgets           Accounts
          │                 │                 │
          └─────────────────┼─────────────────┘
                            ▼
                       PostgreSQL
                            │
                            ▼
                    Python Analytics
                            │
              ┌─────────────┼─────────────┐
              ▼             ▼             ▼
          Forecasting   Anomaly       Financial
                        Detection      Insights
              │             │             │
              └─────────────┼─────────────┘
                            ▼
                       React Charts
                            │
                            ▼
                    User Dashboard
```

---

## 36. Recommended Development Strategy

Build the project in this order:

```text
STEP 1
PostgreSQL schema
        ↓
STEP 2
Java Spring Boot backend
        ↓
STEP 3
Authentication + JWT
        ↓
STEP 4
Transaction APIs
        ↓
STEP 5
Budget + Account APIs
        ↓
STEP 6
React frontend
        ↓
STEP 7
Dashboard + Charts
        ↓
STEP 8
Savings Goals + Recurring Transactions
        ↓
STEP 9
Python FastAPI analytics service
        ↓
STEP 10
Spending analysis
        ↓
STEP 11
Forecasting
        ↓
STEP 12
Anomaly detection
        ↓
STEP 13
Financial Health Score
        ↓
STEP 14
Docker + Testing + Deployment
```

This approach gives you a functioning product early while gradually adding the more impressive analytics and ML components.
