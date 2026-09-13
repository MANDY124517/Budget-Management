import pandas as pd
import numpy as np
from datetime import datetime
from dateutil.relativedelta import relativedelta
from typing import List
from sklearn.linear_model import Ridge, LinearRegression
from app.models.schemas import TransactionInput, ForecastResponse, ForecastDataPoint

class ExpenseForecaster:

    @staticmethod
    def forecast(transactions: List[TransactionInput]) -> ForecastResponse:
        now = datetime.now()
        next_month_dt = now + relativedelta(months=1)
        next_month_str = next_month_dt.strftime("%Y-%m")

        if not transactions:
            return ForecastResponse(
                nextMonth=next_month_str,
                predictedExpense=0.0,
                lowerBound=0.0,
                upperBound=0.0,
                confidenceScore=0.50,
                modelUsed="NoDataBaseline",
                rationale="No historical transaction data available to forecast expenses.",
                historicalAndProjected=[
                    ForecastDataPoint(month=next_month_str, projectedExpense=0.0, isProjection=True)
                ]
            )

        # Filter only expenses
        expense_records = [
            {"date": pd.to_datetime(t.date), "amount": float(t.amount)}
            for t in transactions if t.type.upper() == "EXPENSE"
        ]

        if not expense_records:
            return ForecastResponse(
                nextMonth=next_month_str,
                predictedExpense=0.0,
                lowerBound=0.0,
                upperBound=0.0,
                confidenceScore=0.60,
                modelUsed="ZeroExpenseBaseline",
                rationale="Zero expense records found in selected historical range.",
                historicalAndProjected=[]
            )

        df = pd.DataFrame(expense_records)
        df["month_str"] = df["date"].dt.strftime("%Y-%m")
        monthly_series = df.groupby("month_str")["amount"].sum().sort_index()

        history_points: List[ForecastDataPoint] = []
        for m_str, val in monthly_series.items():
            history_points.append(ForecastDataPoint(
                month=str(m_str),
                actualExpense=round(float(val), 2),
                isProjection=False
            ))

        n_months = len(monthly_series)
        y = monthly_series.values

        if n_months == 1:
            predicted = float(y[0])
            std_err = predicted * 0.15
            model_name = "SingleMonthBaseline"
            rationale = "Projection based on single active month's expenditure."
            confidence = 0.65
        elif n_months < 4:
            # Weighted moving average (recent months weighted higher)
            weights = np.arange(1, n_months + 1)
            predicted = float(np.dot(y, weights) / weights.sum())
            std_err = float(np.std(y)) if np.std(y) > 0 else predicted * 0.10
            model_name = "WeightedMovingAverage"
            rationale = f"Forecast computed via weighted moving average over {n_months} active months."
            confidence = 0.78
        else:
            # Linear / Ridge Regression on time indices
            X = np.arange(n_months).reshape(-1, 1)
            model = Ridge(alpha=1.0)
            model.fit(X, y)

            next_x = np.array([[n_months]])
            raw_pred = float(model.predict(next_x)[0])
            predicted = max(0.0, raw_pred)

            residuals = y - model.predict(X)
            std_err = float(np.std(residuals)) if np.std(residuals) > 0 else predicted * 0.08
            model_name = "RidgeTimeTrendRegression"
            rationale = f"Ridge time-series regression fitted over {n_months} monthly cycles with trend extrapolation."
            confidence = 0.88

        lower_bound = max(0.0, round(predicted - (1.2 * std_err), 2))
        upper_bound = round(predicted + (1.2 * std_err), 2)
        predicted = round(predicted, 2)

        history_points.append(ForecastDataPoint(
            month=next_month_str,
            projectedExpense=predicted,
            isProjection=True
        ))

        return ForecastResponse(
            nextMonth=next_month_str,
            predictedExpense=predicted,
            lowerBound=lower_bound,
            upperBound=upper_bound,
            confidenceScore=confidence,
            modelUsed=model_name,
            rationale=rationale,
            historicalAndProjected=history_points
        )
