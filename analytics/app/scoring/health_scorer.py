import pandas as pd
import numpy as np
from typing import List, Dict
from app.models.schemas import TransactionInput, FinancialHealthScoreResponse, HealthFactor

class FinancialHealthScorer:

    @staticmethod
    def calculate_score(transactions: List[TransactionInput]) -> FinancialHealthScoreResponse:
        if not transactions:
            return FinancialHealthScorer._default_neutral_response()

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

        # 1. Savings Rate Factor (Weight: 0.30)
        savings_rate = (total_savings / total_income * 100.0) if total_income > 0 else 0.0
        if savings_rate >= 40.0:
            sr_score = min(100, int(85 + (savings_rate - 40.0) * 0.75))
            sr_feedback = "Outstanding savings rate. You retain a strong proportion of your income."
        elif savings_rate >= 20.0:
            sr_score = int(70 + (savings_rate - 20.0) * 0.75)
            sr_feedback = "Good savings rate. Strive to push towards 30%+."
        elif savings_rate >= 0.0:
            sr_score = int(50 + savings_rate * 1.0)
            sr_feedback = "Modest positive savings. Review discretionary expenses to boost retention."
        else:
            sr_score = max(10, int(50 + savings_rate * 0.5))
            sr_feedback = "Monthly expenses exceed income. Prioritize eliminating non-essential outflows."

        # 2. Budget Discipline Factor (Weight: 0.25)
        burn_ratio = (total_expenses / total_income) if total_income > 0 else 1.2
        if burn_ratio <= 0.70:
            bd_score = 95
            bd_feedback = "Excellent expenditure control with low income burn."
        elif burn_ratio <= 0.85:
            bd_score = 82
            bd_feedback = "Healthy spending adherence within sustainable limits."
        elif burn_ratio <= 1.0:
            bd_score = 68
            bd_feedback = "Living close to your income ceiling. Minor buffer exists."
        else:
            bd_score = 35
            bd_feedback = "Deficit spending detected. Immediate budget consolidation recommended."

        # 3. Spending Stability (Weight: 0.20)
        monthly_exp = expense_df.groupby("month_str")["amount"].sum()
        if len(monthly_exp) >= 2:
            cv = float(np.std(monthly_exp) / np.mean(monthly_exp)) if np.mean(monthly_exp) > 0 else 0.0
            if cv < 0.15:
                ss_score = 92
                ss_feedback = f"Remarkably consistent monthly spend (Volatility CV: {cv:.2f})."
            elif cv < 0.30:
                ss_score = 80
                ss_feedback = f"Moderate spending variance across months (Volatility CV: {cv:.2f})."
            else:
                ss_score = 60
                ss_feedback = f"High variance in month-to-month expenses (Volatility CV: {cv:.2f})."
        else:
            ss_score = 75
            ss_feedback = "Baseline spending stability established."

        # 4. Emergency Buffer Factor (Weight: 0.15)
        avg_monthly_exp = float(monthly_exp.mean()) if not monthly_exp.empty else 1.0
        months_runway = (total_savings / avg_monthly_exp) if avg_monthly_exp > 0 else 0.0
        if months_runway >= 6.0:
            eb_score = 98
            eb_feedback = f"Robust emergency runway ({months_runway:.1f} months of expenses)."
        elif months_runway >= 3.0:
            eb_score = 84
            eb_feedback = f"Adequate emergency reserve ({months_runway:.1f} months of expenses)."
        elif months_runway >= 1.0:
            eb_score = 65
            eb_feedback = f"Emerging emergency buffer ({months_runway:.1f} months). Aim for 3-6 months."
        else:
            eb_score = 40
            eb_feedback = "Minimal emergency liquid buffer. Prioritize creating a rainy-day fund."

        # 5. Financial Diversity / Balance (Weight: 0.10)
        categories_count = len(expense_df["category"].unique()) if not expense_df.empty else 0
        fd_score = min(95, 60 + categories_count * 5)
        fd_feedback = f"Expenditure categorized across {categories_count} distinct sectors."

        factors: Dict[str, HealthFactor] = {
            "savingsRate": HealthFactor(
                score=sr_score,
                weight=0.30,
                metric=f"{savings_rate:.1f}% savings rate",
                feedback=sr_feedback
            ),
            "budgetDiscipline": HealthFactor(
                score=bd_score,
                weight=0.25,
                metric=f"{burn_ratio * 100:.1f}% expense-to-income ratio",
                feedback=bd_feedback
            ),
            "spendingStability": HealthFactor(
                score=ss_score,
                weight=0.20,
                metric="Month-over-month predictability",
                feedback=ss_feedback
            ),
            "emergencyBuffer": HealthFactor(
                score=eb_score,
                weight=0.15,
                metric=f"{max(0.0, months_runway):.1f} months runway",
                feedback=eb_feedback
            ),
            "expenseDiversity": HealthFactor(
                score=fd_score,
                weight=0.10,
                metric=f"{categories_count} active categories",
                feedback=fd_feedback
            )
        }

        # Weighted aggregate score
        overall_raw = (
            sr_score * 0.30 +
            bd_score * 0.25 +
            ss_score * 0.20 +
            eb_score * 0.15 +
            fd_score * 0.10
        )
        overall_score = max(0, min(100, int(round(overall_raw))))

        if overall_score >= 85:
            tier = "EXCELLENT"
            rec = "Your financial health is exemplary. Continue maintaining disciplined savings and long-term goal allocations."
        elif overall_score >= 70:
            tier = "GOOD"
            rec = "Solid financial posture. Increasing your monthly savings rate slightly will maximize your emergency resilience."
        elif overall_score >= 55:
            tier = "FAIR"
            rec = "Moderate financial stability. Look into capping high-burn expense categories to build a stronger buffer."
        elif overall_score >= 40:
            tier = "NEEDS_ATTENTION"
            rec = "High expenditure load detected relative to income. Review discretionary recurring costs and set hard budgets."
        else:
            tier = "CRITICAL"
            rec = "Urgent attention required. Expenses are outpacing revenue. Focus on essential needs and debt minimization."

        return FinancialHealthScoreResponse(
            overallScore=overall_score,
            tier=tier,
            summaryRecommendation=rec,
            factors=factors
        )

    @staticmethod
    def _default_neutral_response() -> FinancialHealthScoreResponse:
        return FinancialHealthScoreResponse(
            overallScore=75,
            tier="GOOD",
            summaryRecommendation="Start logging your daily income and expense transactions to generate personalized financial health scoring.",
            factors={
                "savingsRate": HealthFactor(score=75, weight=0.30, metric="N/A", feedback="Awaiting transaction history"),
                "budgetDiscipline": HealthFactor(score=75, weight=0.25, metric="N/A", feedback="Awaiting budget definition"),
                "spendingStability": HealthFactor(score=75, weight=0.20, metric="N/A", feedback="Awaiting multiple cycles"),
                "emergencyBuffer": HealthFactor(score=75, weight=0.15, metric="N/A", feedback="Awaiting savings records"),
                "expenseDiversity": HealthFactor(score=75, weight=0.10, metric="N/A", feedback="Awaiting categorization")
            }
        )
