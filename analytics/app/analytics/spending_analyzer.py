import pandas as pd
import numpy as np
from typing import List, Dict
from app.models.schemas import (
    TransactionInput,
    SpendingAnalysisResponse,
    HighestCategoryInfo,
    MonthlyTrendPoint
)

class SpendingAnalyzer:

    @staticmethod
    def analyze(transactions: List[TransactionInput]) -> SpendingAnalysisResponse:
        if not transactions:
            return SpendingAnalysisResponse(
                totalIncome=0.0,
                totalExpenses=0.0,
                totalSavings=0.0,
                savingsRate=0.0,
                averageDailyExpense=0.0,
                averageMonthlySpending=0.0,
                highestCategory=None,
                momExpenseGrowthRate=0.0,
                categoryDistribution={},
                monthlyTrends=[]
            )

        data = []
        for t in transactions:
            data.append({
                "id": t.id,
                "date": pd.to_datetime(t.date),
                "amount": float(t.amount),
                "type": t.type.upper(),
                "category": t.category or "General",
                "description": t.description or ""
            })

        df = pd.DataFrame(data)
        df["month_str"] = df["date"].dt.strftime("%Y-%m")

        # Income & Expense separation
        income_df = df[df["type"] == "INCOME"]
        expense_df = df[df["type"] == "EXPENSE"]

        total_income = float(income_df["amount"].sum()) if not income_df.empty else 0.0
        total_expenses = float(expense_df["amount"].sum()) if not expense_df.empty else 0.0
        total_savings = total_income - total_expenses
        savings_rate = round((total_savings / total_income * 100.0), 2) if total_income > 0 else 0.0

        # Category distribution
        category_dist: Dict[str, float] = {}
        highest_cat_info = None

        if not expense_df.empty:
            cat_grouped = expense_df.groupby("category")["amount"].sum()
            category_dist = {str(k): round(float(v), 2) for k, v in cat_grouped.items()}

            top_cat = cat_grouped.idxmax()
            top_amount = float(cat_grouped.max())
            top_pct = round((top_amount / total_expenses * 100.0), 2) if total_expenses > 0 else 0.0

            highest_cat_info = HighestCategoryInfo(
                name=str(top_cat),
                amount=round(top_amount, 2),
                percentage=top_pct
            )

        # Monthly Trends
        all_months = sorted(df["month_str"].unique())
        monthly_trends: List[MonthlyTrendPoint] = []
        monthly_expenses_list = []

        for m in all_months:
            m_inc = float(income_df[income_df["month_str"] == m]["amount"].sum()) if not income_df.empty else 0.0
            m_exp = float(expense_df[expense_df["month_str"] == m]["amount"].sum()) if not expense_df.empty else 0.0
            m_sav = m_inc - m_exp
            monthly_expenses_list.append(m_exp)

            monthly_trends.append(MonthlyTrendPoint(
                month=m,
                income=round(m_inc, 2),
                expense=round(m_exp, 2),
                savings=round(m_sav, 2)
            ))

        # Month-over-Month Expense Growth Rate (Latest vs Previous Month)
        mom_growth = 0.0
        if len(monthly_expenses_list) >= 2:
            prev_m = monthly_expenses_list[-2]
            curr_m = monthly_expenses_list[-1]
            if prev_m > 0:
                mom_growth = round(((curr_m - prev_m) / prev_m * 100.0), 2)

        # Average Monthly and Daily Spending
        num_months = max(1, len(all_months))
        avg_monthly = round(total_expenses / num_months, 2)

        total_days = max(1, (df["date"].max() - df["date"].min()).days + 1) if not df.empty else 30
        avg_daily = round(total_expenses / total_days, 2)

        return SpendingAnalysisResponse(
            totalIncome=round(total_income, 2),
            totalExpenses=round(total_expenses, 2),
            totalSavings=round(total_savings, 2),
            savingsRate=savings_rate,
            averageDailyExpense=avg_daily,
            averageMonthlySpending=avg_monthly,
            highestCategory=highest_cat_info,
            momExpenseGrowthRate=mom_growth,
            categoryDistribution=category_dist,
            monthlyTrends=monthly_trends
        )
