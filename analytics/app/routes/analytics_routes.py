from fastapi import APIRouter, HTTPException
from typing import List
from app.models.schemas import (
    SpendingAnalysisRequest,
    SpendingAnalysisResponse,
    ForecastResponse,
    AnomalyDetectionResponse,
    FinancialHealthScoreResponse,
    InsightDto
)
from app.analytics.spending_analyzer import SpendingAnalyzer
from app.forecasting.expense_forecaster import ExpenseForecaster
from app.anomaly.anomaly_detector import AnomalyDetector
from app.scoring.health_scorer import FinancialHealthScorer
from app.insights.insight_generator import InsightGenerator

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.post("/spending-analysis", response_model=SpendingAnalysisResponse)
async def analyze_spending(request: SpendingAnalysisRequest):
    try:
        return SpendingAnalyzer.analyze(request.transactions)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Spending analysis calculation error: {str(e)}")

@router.post("/forecast", response_model=ForecastResponse)
async def forecast_expenses(request: SpendingAnalysisRequest):
    try:
        return ExpenseForecaster.forecast(request.transactions)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Expense forecasting error: {str(e)}")

@router.post("/anomaly-detection", response_model=AnomalyDetectionResponse)
async def detect_anomalies(request: SpendingAnalysisRequest):
    try:
        return AnomalyDetector.detect(request.transactions)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Anomaly detection error: {str(e)}")

@router.post("/financial-health-score", response_model=FinancialHealthScoreResponse)
async def calculate_health_score(request: SpendingAnalysisRequest):
    try:
        return FinancialHealthScorer.calculate_score(request.transactions)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Health score calculation error: {str(e)}")

@router.post("/insights", response_model=List[InsightDto])
async def generate_insights(request: SpendingAnalysisRequest):
    try:
        return InsightGenerator.generate(request.transactions, currency=request.currency or "INR")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Insight generation error: {str(e)}")
