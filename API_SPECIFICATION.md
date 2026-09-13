# SmartBudget — API Specification

**Protocol:** REST over HTTPS  
**Data Format:** JSON (`application/json`)  
**Security:** JWT in HTTP `Authorization: Bearer <token>`  
**Status Standards:** RFC 7807 Problem Details for Error Payloads  

---

## 1. Unified Response Envelope & Error Format

### 1.1 Success Response Envelope
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully",
  "timestamp": "2026-09-13T12:00:00Z"
}
```

### 1.2 Paginated Response Format
```json
{
  "success": true,
  "data": {
    "content": [ ... ],
    "page": 0,
    "size": 20,
    "totalElements": 156,
    "totalPages": 8,
    "isLast": false
  },
  "timestamp": "2026-09-13T12:00:00Z"
}
```

### 1.3 Error Response Format (RFC 7807 ProblemDetails)
```json
{
  "success": false,
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed on transaction amount",
  "path": "/api/transactions",
  "timestamp": "2026-09-13T12:00:00Z",
  "fieldErrors": [
    {
      "field": "amount",
      "message": "Amount must be greater than 0.00"
    }
  ]
}
```

---

## 2. Authentication & User Management Endpoints (`/api/auth`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new user account |
| `POST` | `/api/auth/login` | Public | Authenticate user & return JWT tokens |
| `POST` | `/api/auth/refresh` | Public / Bearer | Refresh expired access token using refresh token |
| `POST` | `/api/auth/logout` | Authenticated | Invalidate refresh token / session |
| `GET` | `/api/auth/me` | Authenticated | Retrieve current user profile & currency settings |
| `PUT` | `/api/auth/profile` | Authenticated | Update user profile & default currency |
| `PUT` | `/api/auth/change-password` | Authenticated | Secure password change |

### Request: `POST /api/auth/login`
```json
{
  "email": "sarah.finance@example.com",
  "password": "SecurePassword123!"
}
```
### Response: `200 OK`
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsIn...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsIn...",
    "tokenType": "Bearer",
    "expiresInSeconds": 900,
    "user": {
      "id": 1,
      "email": "sarah.finance@example.com",
      "fullName": "Sarah Jenkins",
      "defaultCurrency": "INR"
    }
  }
}
```

---

## 3. Account Management Endpoints (`/api/accounts`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/accounts` | Authenticated | List all active accounts with current balances |
| `POST` | `/api/accounts` | Authenticated | Create a new account |
| `GET` | `/api/accounts/{id}` | Authenticated | Get account details with recent transactions |
| `PUT` | `/api/accounts/{id}` | Authenticated | Update account name, type, institution |
| `DELETE` | `/api/accounts/{id}` | Authenticated | Deactivate / soft delete account |
| `GET` | `/api/accounts/summary` | Authenticated | Total net worth, liquid cash, credit card liabilities |

### Request: `POST /api/accounts`
```json
{
  "name": "HDFC Savings Account",
  "accountType": "SAVINGS",
  "initialBalance": 45000.00,
  "currency": "INR",
  "institutionName": "HDFC Bank",
  "accountNumberMask": "••••1084"
}
```

---

## 4. Category Management Endpoints (`/api/categories`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/categories` | Authenticated | List default and user custom categories |
| `POST` | `/api/categories` | Authenticated | Create custom category |
| `PUT` | `/api/categories/{id}` | Authenticated | Update custom category name, icon, color |
| `DELETE` | `/api/categories/{id}` | Authenticated | Delete custom category (if unused) |

---

## 5. Transaction Management Endpoints (`/api/transactions`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/transactions` | Authenticated | Filter, search & paginate transactions |
| `POST` | `/api/transactions` | Authenticated | Record new INCOME, EXPENSE, or TRANSFER |
| `GET` | `/api/transactions/{id}` | Authenticated | Get transaction details |
| `PUT` | `/api/transactions/{id}` | Authenticated | Edit transaction & re-adjust account balances |
| `DELETE` | `/api/transactions/{id}` | Authenticated | Delete transaction & rollback account balance |
| `GET` | `/api/transactions/export` | Authenticated | Export filtered transactions to CSV |

### Query Parameters for `GET /api/transactions`
- `page`: default `0`
- `size`: default `20`
- `sort`: default `transactionDate,desc`
- `startDate`: `2026-09-01`
- `endDate`: `2026-09-30`
- `type`: `INCOME | EXPENSE | TRANSFER`
- `categoryId`: `12`
- `accountId`: `3`
- `minAmount`: `500.00`
- `maxAmount`: `50000.00`
- `search`: `groceries`

### Request: `POST /api/transactions` (EXPENSE)
```json
{
  "accountId": 1,
  "categoryId": 4,
  "transactionType": "EXPENSE",
  "amount": 1850.50,
  "transactionDate": "2026-09-13",
  "description": "Weekly organic groceries at Nature's Basket",
  "paymentMethod": "UPI",
  "notes": "Essential food items"
}
```

### Request: `POST /api/transactions` (TRANSFER)
```json
{
  "accountId": 1,
  "transferTargetAccountId": 2,
  "transactionType": "TRANSFER",
  "amount": 15000.00,
  "transactionDate": "2026-09-13",
  "description": "Monthly savings transfer to SBI Fixed Deposit",
  "paymentMethod": "NET_BANKING"
}
```

---

## 6. Budget Management Endpoints (`/api/budgets`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/budgets` | Authenticated | List all budgets |
| `POST` | `/api/budgets` | Authenticated | Create budget envelope with category allocations |
| `GET` | `/api/budgets/current` | Authenticated | Get active budget for the current month with real-time utilization |
| `GET` | `/api/budgets/{id}` | Authenticated | Get budget details and category breakdown |
| `PUT` | `/api/budgets/{id}` | Authenticated | Update budget limits & allocations |
| `DELETE` | `/api/budgets/{id}` | Authenticated | Delete budget |

### Response: `GET /api/budgets/current`
```json
{
  "success": true,
  "data": {
    "budgetId": 1,
    "name": "September 2026 Monthly Budget",
    "period": "MONTHLY",
    "startDate": "2026-09-01",
    "endDate": "2026-09-30",
    "totalBudgetAmount": 50000.00,
    "totalSpent": 38450.00,
    "remainingAmount": 11550.00,
    "utilizationPercentage": 76.90,
    "alertThreshold": 80.00,
    "status": "ON_TRACK",
    "categories": [
      {
        "categoryId": 4,
        "categoryName": "Food & Dining",
        "allocatedAmount": 12000.00,
        "spentAmount": 10200.00,
        "remainingAmount": 1800.00,
        "utilizationPercentage": 85.00,
        "isExceeded": false,
        "alertTriggered": "WARNING_80_PERCENT"
      },
      {
        "categoryId": 5,
        "categoryName": "Transportation",
        "allocatedAmount": 6000.00,
        "spentAmount": 3200.00,
        "remainingAmount": 2800.00,
        "utilizationPercentage": 53.33,
        "isExceeded": false,
        "alertTriggered": null
      }
    ]
  }
}
```

---

## 7. Savings Goals Endpoints (`/api/goals`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/goals` | Authenticated | List savings goals with progress % and status |
| `POST` | `/api/goals` | Authenticated | Create new savings goal |
| `GET` | `/api/goals/{id}` | Authenticated | Get goal metrics, remaining amount, monthly required |
| `PUT` | `/api/goals/{id}` | Authenticated | Update goal target or deadline |
| `POST` | `/api/goals/{id}/contribute` | Authenticated | Allocate savings funds to goal |
| `DELETE` | `/api/goals/{id}` | Authenticated | Remove goal |

---

## 8. Recurring Transactions Endpoints (`/api/recurring`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/recurring` | Authenticated | List active scheduled recurring rules |
| `POST` | `/api/recurring` | Authenticated | Create recurrence rule (Salary, Rent, Subscriptions) |
| `PUT` | `/api/recurring/{id}` | Authenticated | Edit schedule or amount |
| `POST` | `/api/recurring/{id}/trigger-now` | Authenticated | Manually execute transaction immediately |
| `DELETE` | `/api/recurring/{id}` | Authenticated | Cancel recurrence rule |

---

## 9. Python FastAPI Analytics Endpoints (`http://analytics:8001`)

The Java Spring Boot backend delegates mathematical, ML, and NLP tasks to the Python service.

### 9.1 `POST /analytics/spending-analysis`
Computes monthly trends, savings rates, MoM changes, top spend categories.
```json
// Request
{
  "userId": 1,
  "currency": "INR",
  "transactions": [
    {
      "id": 101,
      "date": "2026-09-02",
      "amount": 1200.00,
      "type": "EXPENSE",
      "category": "Food"
    }
  ]
}

// Response
{
  "totalIncome": 75000.00,
  "totalExpenses": 42500.00,
  "totalSavings": 32500.00,
  "savingsRate": 43.33,
  "averageDailyExpense": 1416.67,
  "highestCategory": { "name": "Food", "amount": 12800.00, "percentage": 30.12 },
  "momExpenseGrowthRate": -4.20
}
```

### 9.2 `POST /analytics/forecast`
Applies time-series regression and moving averages to project future expenses.
```json
// Response
{
  "nextMonth": "2026-10",
  "predictedExpense": 44150.00,
  "lowerBound": 41200.00,
  "upperBound": 47100.00,
  "confidenceScore": 0.88,
  "modelUsed": "RidgeRegressionBaseline"
}
```

### 9.3 `POST /analytics/anomaly-detection`
Runs Z-score and Isolation Forest to flag unusual expenses.
```json
// Response
{
  "anomalies": [
    {
      "transactionId": 142,
      "date": "2026-09-10",
      "category": "Shopping",
      "amount": 24500.00,
      "categoryMean": 4200.00,
      "zScore": 3.42,
      "severity": "HIGH",
      "reason": "Transaction amount is 483% above your 6-month average for Shopping."
    }
  ]
}
```

### 9.4 `POST /analytics/financial-health-score`
Transparent 0–100 score calculation with sub-factor breakdown and recommendations.
```json
// Response
{
  "overallScore": 84,
  "tier": "EXCELLENT",
  "factors": {
    "savingsRateScore": { "score": 92, "weight": 0.30, "metric": "43.3% savings rate" },
    "budgetDisciplineScore": { "score": 82, "weight": 0.25, "metric": "76.9% utilization" },
    "spendingStabilityScore": { "score": 80, "weight": 0.20, "metric": "Low MoM volatility (CV=0.12)" },
    "emergencyBufferScore": { "score": 78, "weight": 0.15, "metric": "3.8 months of runway" },
    "debtToIncomeScore": { "score": 90, "weight": 0.10, "metric": "Minimal credit card revolving" }
  },
  "summaryRecommendation": "Your financial health is strong. Boosting your emergency fund to 6 months will maximize resilience."
}
```

### 9.5 `POST /analytics/insights`
Generates natural-language insights from calculated statistics.
```json
// Response
{
  "insights": [
    {
      "type": "SPENDING_TREND",
      "title": "Dining Spending Surge",
      "summary": "Your Food & Dining expenses increased by 18.4% compared with August.",
      "severity": "WARNING"
    },
    {
      "type": "GOAL_PROJECTION",
      "title": "Laptop Goal on Track",
      "summary": "At your current monthly savings velocity of ₹27,500, you will reach your 'MacBook Pro' goal in 3.2 months (by December 2026).",
      "severity": "SUCCESS"
    }
  ]
}
```

---

## 10. Dashboard & Aggregation Endpoints (`/api/dashboard`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/dashboard/overview` | Authenticated | Aggregated snapshot (balances, monthly metrics, budget pace, recent transactions) |
| `GET` | `/api/dashboard/analytics` | Authenticated | Combined ML metrics, health score, forecast, and actionable insights |
