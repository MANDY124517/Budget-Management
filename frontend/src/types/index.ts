export type AccountType = 'CHECKING' | 'SAVINGS' | 'CREDIT_CARD' | 'CASH' | 'INVESTMENT' | 'LOAN';
export type CategoryType = 'INCOME' | 'EXPENSE' | 'TRANSFER';
export type TransactionType = 'INCOME' | 'EXPENSE' | 'TRANSFER';
export type PaymentMethod = 'UPI' | 'DEBIT_CARD' | 'CREDIT_CARD' | 'CASH' | 'NET_BANKING' | 'AUTO_DEBIT' | 'OTHER';
export type BudgetPeriod = 'WEEKLY' | 'MONTHLY' | 'YEARLY' | 'CUSTOM';
export type GoalPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type GoalStatus = 'IN_PROGRESS' | 'COMPLETED' | 'PAUSED' | 'CANCELLED';
export type RecurrenceFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
export type NotificationSeverity = 'INFO' | 'WARNING' | 'DANGER' | 'SUCCESS';

export interface User {
  id: number;
  email: string;
  fullName: string;
  defaultCurrency: string;
  role: string;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresInSeconds: number;
  user: User;
}

export interface Account {
  id: number;
  name: string;
  accountType: AccountType;
  balance: number;
  currency: string;
  institutionName?: string;
  accountNumberMask?: string;
  isActive: boolean;
  createdAt: string;
}

export interface AccountSummary {
  netWorth: number;
  totalCashAndBank: number;
  totalCreditCardLiabilities: number;
  totalInvestments: number;
  activeAccountsCount: number;
  accounts: Account[];
}

export interface Category {
  id: number;
  name: string;
  categoryType: CategoryType;
  icon: string;
  color: string;
  isSystemDefault: boolean;
}

export interface Transaction {
  id: number;
  account: Account;
  category: Category;
  transferTargetAccount?: Account;
  transactionType: TransactionType;
  amount: number;
  currency: string;
  transactionDate: string;
  description: string;
  paymentMethod: PaymentMethod;
  notes?: string;
  isRecurring: boolean;
  recurringTransactionId?: number;
  createdAt: string;
}

export interface TransactionFilter {
  startDate?: string;
  endDate?: string;
  type?: TransactionType;
  categoryId?: number;
  accountId?: number;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export interface CategorySpending {
  categoryId: number;
  categoryName: string;
  icon: string;
  color: string;
  totalAmount: number;
  percentage: number;
}

export interface CategoryBudgetUtilization {
  categoryId: number;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  allocatedAmount: number;
  spentAmount: number;
  remainingAmount: number;
  utilizationPercentage: number;
  isExceeded: boolean;
  alertTriggered?: 'WARNING_80_PERCENT' | 'WARNING_100_PERCENT' | 'WARNING_120_PERCENT' | null;
}

export interface BudgetUtilization {
  budgetId: number;
  name: string;
  period: string;
  startDate: string;
  endDate: string;
  totalBudgetAmount: number;
  totalSpent: number;
  remainingAmount: number;
  utilizationPercentage: number;
  alertThreshold: number;
  status: 'ON_TRACK' | 'NEAR_LIMIT' | 'EXCEEDED';
  categories: CategoryBudgetUtilization[];
}

export interface BudgetCategoryAllocation {
  id?: number;
  categoryId: number;
  categoryName?: string;
  categoryIcon?: string;
  categoryColor?: string;
  allocatedAmount: number;
}

export interface Budget {
  id: number;
  name: string;
  period: BudgetPeriod;
  startDate: string;
  endDate: string;
  totalBudgetAmount: number;
  alertThresholdPercentage: number;
  isActive: boolean;
  categories: BudgetCategoryAllocation[];
  createdAt: string;
}

export interface SavingsGoal {
  id: number;
  name: string;
  targetAccountId?: number;
  targetAccountName?: string;
  targetAmount: number;
  currentAmount: number;
  remainingAmount: number;
  progressPercentage: number;
  targetDate: string;
  priority: GoalPriority;
  status: GoalStatus;
  description?: string;
  requiredMonthlySavings: number;
  createdAt: string;
}

export interface RecurringTransaction {
  id: number;
  account: Account;
  category: Category;
  transactionType: TransactionType;
  amount: number;
  frequency: RecurrenceFrequency;
  intervalCount: number;
  startDate: string;
  nextExecutionDate: string;
  endDate?: string;
  description: string;
  paymentMethod: PaymentMethod;
  isActive: boolean;
  createdAt: string;
}

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  notificationType: string;
  severity: NotificationSeverity;
  isRead: boolean;
  metadata?: string;
  createdAt: string;
}

export interface Insight {
  id: number;
  type: string;
  title: string;
  summary: string;
  severity: 'INFO' | 'WARNING' | 'SUCCESS' | 'DANGER';
  confidenceScore: number;
  createdAt: string;
}

export interface HealthFactor {
  score: number;
  weight: number;
  metric: string;
  feedback: string;
}

export interface FinancialHealthScore {
  overallScore: number;
  tier: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'NEEDS_ATTENTION' | 'CRITICAL';
  summaryRecommendation: string;
  factors: Record<string, HealthFactor>;
}

export interface ForecastDataPoint {
  month: string;
  actualExpense?: number;
  projectedExpense?: number;
  isProjection: boolean;
}

export interface ForecastResponse {
  nextMonth: string;
  predictedExpense: number;
  lowerBound: number;
  upperBound: number;
  confidenceScore: number;
  modelUsed: string;
  rationale: string;
  historicalAndProjected: ForecastDataPoint[];
}

export interface Anomaly {
  transactionId?: number;
  date: string;
  category: string;
  description: string;
  amount: number;
  categoryMean: number;
  deviationPercentage: number;
  zScore: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  reason: string;
}

export interface AnomalyDetectionResponse {
  totalAnomaliesDetected: number;
  anomalies: Anomaly[];
}

export interface SpendingAnalysis {
  totalIncome: number;
  totalExpenses: number;
  totalSavings: number;
  savingsRate: number;
  averageDailyExpense: number;
  averageMonthlySpending: number;
  highestCategory?: {
    name: string;
    amount: number;
    percentage: number;
  };
  momExpenseGrowthRate: number;
  categoryDistribution: Record<string, number>;
  monthlyTrends: {
    month: string;
    income: number;
    expense: number;
    savings: number;
  }[];
}

export interface DashboardOverview {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlySavings: number;
  savingsRate: number;
  budgetRemaining: number;
  currency: string;
  accounts: Account[];
  recentTransactions: Transaction[];
  topExpenseCategories: CategorySpending[];
  activeBudget?: BudgetUtilization;
  activeGoals: SavingsGoal[];
  topInsights: Insight[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  isLast: boolean;
}
