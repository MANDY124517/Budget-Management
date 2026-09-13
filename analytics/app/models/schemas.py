from datetime import date, datetime
from decimal import Decimal
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class TransactionInput(BaseModel):
    id: Optional[int] = None
    date: date
    amount: float = Field(gt=0, description="Amount must be positive")
    type: str = Field(description="INCOME, EXPENSE, TRANSFER")
    category: Optional[str] = "General"
    description: Optional[str] = ""

class SpendingAnalysisRequest(BaseModel):
    userId: Optional[int] = None
    currency: Optional[str] = "INR"
    transactions: List[TransactionInput] = []

class HighestCategoryInfo(BaseModel):
    name: str
    amount: float
    percentage: float

class MonthlyTrendPoint(BaseModel):
    month: str
    income: float
    expense: float
    savings: float

class SpendingAnalysisResponse(BaseModel):
    totalIncome: float
    totalExpenses: float
    totalSavings: float
    savingsRate: float
    averageDailyExpense: float
    averageMonthlySpending: float
    highestCategory: Optional[HighestCategoryInfo] = None
    momExpenseGrowthRate: float
    categoryDistribution: Dict[str, float] = {}
    monthlyTrends: List[MonthlyTrendPoint] = []

class ForecastDataPoint(BaseModel):
    month: str
    actualExpense: Optional[float] = None
    projectedExpense: Optional[float] = None
    isProjection: bool = False

class ForecastResponse(BaseModel):
    nextMonth: str
    predictedExpense: float
    lowerBound: float
    upperBound: float
    confidenceScore: float
    modelUsed: str
    rationale: str
    historicalAndProjected: List[ForecastDataPoint] = []

class AnomalyDto(BaseModel):
    transactionId: Optional[int] = None
    date: date
    category: str
    description: Optional[str] = ""
    amount: float
    categoryMean: float
    deviationPercentage: float
    zScore: float
    severity: str # LOW, MEDIUM, HIGH
    reason: str

class AnomalyDetectionResponse(BaseModel):
    totalAnomaliesDetected: int
    anomalies: List[AnomalyDto] = []

class HealthFactor(BaseModel):
    score: int # 0 - 100
    weight: float
    metric: str
    feedback: str

class FinancialHealthScoreResponse(BaseModel):
    overallScore: int
    tier: str # EXCELLENT, GOOD, FAIR, NEEDS_ATTENTION, CRITICAL
    summaryRecommendation: str
    factors: Dict[str, HealthFactor]

class InsightDto(BaseModel):
    id: Optional[int] = None
    type: str # SPENDING_TREND, CATEGORY_SURGE, BUDGET_PACE, GOAL_PROJECTION, SAVINGS_MILESTONE
    title: str
    summary: str
    severity: str # INFO, WARNING, SUCCESS, DANGER
    confidenceScore: float = 0.95
    createdAt: Optional[datetime] = None
