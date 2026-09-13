import pytest
from datetime import date
from fastapi.testclient import TestClient
from app.main import app
from app.models.schemas import TransactionInput
from app.analytics.spending_analyzer import SpendingAnalyzer
from app.forecasting.expense_forecaster import ExpenseForecaster
from app.anomaly.anomaly_detector import AnomalyDetector
from app.scoring.health_scorer import FinancialHealthScorer
from app.insights.insight_generator import InsightGenerator

client = TestClient(app)

@pytest.fixture
def sample_transactions():
    return [
        TransactionInput(id=1, date=date(2026, 6, 1), amount=70000.0, type="INCOME", category="Salary", description="June Salary"),
        TransactionInput(id=2, date=date(2026, 6, 5), amount=15000.0, type="EXPENSE", category="Rent", description="June Rent"),
        TransactionInput(id=3, date=date(2026, 6, 10), amount=8000.0, type="EXPENSE", category="Food", description="Groceries & Dining"),
        TransactionInput(id=4, date=date(2026, 6, 15), amount=4000.0, type="EXPENSE", category="Transport", description="Fuel & Metro"),

        TransactionInput(id=5, date=date(2026, 7, 1), amount=70000.0, type="INCOME", category="Salary", description="July Salary"),
        TransactionInput(id=6, date=date(2026, 7, 5), amount=15000.0, type="EXPENSE", category="Rent", description="July Rent"),
        TransactionInput(id=7, date=date(2026, 7, 10), amount=9500.0, type="EXPENSE", category="Food", description="Groceries & Dining"),
        TransactionInput(id=8, date=date(2026, 7, 15), amount=4200.0, type="EXPENSE", category="Transport", description="Fuel & Metro"),

        TransactionInput(id=9, date=date(2026, 8, 1), amount=75000.0, type="INCOME", category="Salary", description="August Salary"),
        TransactionInput(id=10, date=date(2026, 8, 5), amount=15000.0, type="EXPENSE", category="Rent", description="August Rent"),
        TransactionInput(id=11, date=date(2026, 8, 10), amount=8800.0, type="EXPENSE", category="Food", description="Groceries & Dining"),
        TransactionInput(id=12, date=date(2026, 8, 20), amount=45000.0, type="EXPENSE", category="Food", description="Extreme Luxury Dining Outlier"),
    ]

def test_healthcheck():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "UP"}

def test_spending_analysis(sample_transactions):
    result = SpendingAnalyzer.analyze(sample_transactions)
    assert result.totalIncome == 215000.0
    assert result.totalExpenses == 124500.0
    assert result.totalSavings == 90500.0
    assert result.savingsRate > 40.0
    assert result.highestCategory is not None
    assert result.highestCategory.name == "Food"
    assert len(result.monthlyTrends) == 3

def test_expense_forecasting(sample_transactions):
    result = ExpenseForecaster.forecast(sample_transactions)
    assert result.predictedExpense > 0
    assert result.confidenceScore >= 0.70
    assert result.lowerBound <= result.predictedExpense <= result.upperBound
    assert len(result.historicalAndProjected) >= 3

def test_anomaly_detection(sample_transactions):
    result = AnomalyDetector.detect(sample_transactions)
    assert result.totalAnomaliesDetected >= 1
    anom = [a for a in result.anomalies if a.amount == 45000.0]
    assert len(anom) == 1
    assert anom[0].category == "Food"
    assert anom[0].zScore > 1.7

def test_financial_health_score(sample_transactions):
    result = FinancialHealthScorer.calculate_score(sample_transactions)
    assert 0 <= result.overallScore <= 100
    assert result.tier in ["EXCELLENT", "GOOD", "FAIR", "NEEDS_ATTENTION", "CRITICAL"]
    assert "savingsRate" in result.factors
    assert "budgetDiscipline" in result.factors
    assert "spendingStability" in result.factors

def test_insight_generation(sample_transactions):
    insights = InsightGenerator.generate(sample_transactions, currency="INR")
    assert len(insights) >= 2
    types = [i.type for i in insights]
    assert any("SAVINGS" in t or "CATEGORY" in t or "DAILY" in t for t in types)

def test_api_spending_route():
    payload = {
        "userId": 1,
        "currency": "INR",
        "transactions": [
            {"date": "2026-09-01", "amount": 50000.0, "type": "INCOME", "category": "Salary"},
            {"date": "2026-09-02", "amount": 12000.0, "type": "EXPENSE", "category": "Rent"}
        ]
    }
    response = client.post("/analytics/spending-analysis", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["totalIncome"] == 50000.0
    assert data["totalExpenses"] == 12000.0
    assert data["totalSavings"] == 38000.0
