import pandas as pd
import numpy as np
from datetime import datetime, timezone
from typing import List
from app.models.schemas import TransactionInput, InsightDto

class InsightGenerator:

    @staticmethod
    def generate(transactions: List[TransactionInput], currency: str = "INR") -> List[InsightDto]:
        insights: List[InsightDto] = []

        if not transactions or len(transactions) < 2:
            insights.append(InsightDto(
                id=1,
                type="SYSTEM_ONBOARDING",
                title="Welcome to SmartBudget Financial Intelligence",
                summary="As you record more transactions, our AI engine will generate personalized insights, spending trends, and anomaly detection.",
                severity="INFO",
                confidenceScore=1.0,
                createdAt=datetime.now(timezone.utc)
            ))
            return insights

        data = []
        for t in transactions:
            data.append({
                "date": pd.to_datetime(t.date),
                "amount": float(t.amount),
                "type": t.type.upper(),
                "category": t.category or "General"
            })

        df = pd.DataFrame(data)
        df["month_str"] = df["date"].dt.strftime("%Y-%m")

        income_df = df[df["type"] == "INCOME"]
        expense_df = df[df["type"] == "EXPENSE"]

        total_income = float(income_df["amount"].sum()) if not income_df.empty else 0.0
        total_expenses = float(expense_df["amount"].sum()) if not expense_df.empty else 0.0
        total_savings = total_income - total_expenses
        savings_rate = (total_savings / total_income * 100.0) if total_income > 0 else 0.0

        insight_id = 1

        # 1. Savings Rate Insight
        if total_income > 0:
            if savings_rate >= 35.0:
                insights.append(InsightDto(
                    id=insight_id,
                    type="SAVINGS_MILESTONE",
                    title="Exceptional Savings Velocity",
                    summary=f"You are saving {savings_rate:.1f}% of your total income ({currency} {total_savings:,.2f} retained), well above standard financial benchmarks (20%).",
                    severity="SUCCESS",
                    confidenceScore=0.98,
                    createdAt=datetime.now(timezone.utc)
                ))
            elif savings_rate < 10.0:
                insights.append(InsightDto(
                    id=insight_id,
                    type="SAVINGS_WARNING",
                    title="Low Savings Retention",
                    summary=f"Your savings rate is currently {savings_rate:.1f}%. Trimming discretionary expenses could help build a 3-6 month emergency runway.",
                    severity="WARNING",
                    confidenceScore=0.92,
                    createdAt=datetime.now(timezone.utc)
                ))
            insight_id += 1

        # 2. Month-over-Month Category Trend
        if not expense_df.empty:
            months = sorted(expense_df["month_str"].unique())
            if len(months) >= 2:
                latest_m = months[-1]
                prev_m = months[-2]

                latest_cat = expense_df[expense_df["month_str"] == latest_m].groupby("category")["amount"].sum()
                prev_cat = expense_df[expense_df["month_str"] == prev_m].groupby("category")["amount"].sum()

                for cat, curr_amt in latest_cat.items():
                    if cat in prev_cat and prev_cat[cat] > 0:
                        prev_amt = prev_cat[cat]
                        pct_change = ((curr_amt - prev_amt) / prev_amt) * 100.0

                        if pct_change >= 25.0 and curr_amt > 1500:
                            insights.append(InsightDto(
                                id=insight_id,
                                type="CATEGORY_SURGE",
                                title=f"Spending Surge in {cat}",
                                summary=f"Your spending in '{cat}' rose by {pct_change:.1f}% compared with last month ({currency} {curr_amt:,.2f} vs {currency} {prev_amt:,.2f}).",
                                severity="WARNING",
                                confidenceScore=0.94,
                                createdAt=datetime.now(timezone.utc)
                            ))
                            insight_id += 1
                            break

            # 3. Dominant Category Proportion
            cat_totals = expense_df.groupby("category")["amount"].sum()
            top_cat = cat_totals.idxmax()
            top_amt = float(cat_totals.max())
            top_prop = (top_amt / total_expenses * 100.0) if total_expenses > 0 else 0.0

            if top_prop >= 30.0:
                insights.append(InsightDto(
                    id=insight_id,
                    type="SPENDING_DISTRIBUTION",
                    title=f"Concentrated Outflow in {top_cat}",
                    summary=f"'{top_cat}' represents {top_prop:.1f}% of your total expenditure ({currency} {top_amt:,.2f}). Monitor this category closely.",
                    severity="INFO",
                    confidenceScore=0.96,
                    createdAt=datetime.now(timezone.utc)
                ))
                insight_id += 1

        # 4. Recurring and Daily Burn Rate
        num_days = max(1, (df["date"].max() - df["date"].min()).days + 1)
        daily_burn = total_expenses / num_days
        insights.append(InsightDto(
            id=insight_id,
            type="DAILY_BURN_RATE",
            title="Daily Expenditure Pace",
            summary=f"Your average daily spending velocity is {currency} {daily_burn:,.2f} over the analyzed timeframe.",
            severity="INFO",
            confidenceScore=0.99,
            createdAt=datetime.now(timezone.utc)
        ))

        return insights
