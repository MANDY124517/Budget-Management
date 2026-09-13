import pandas as pd
import numpy as np
from typing import List
from sklearn.ensemble import IsolationForest
from app.models.schemas import TransactionInput, AnomalyDetectionResponse, AnomalyDto

class AnomalyDetector:

    @staticmethod
    def detect(transactions: List[TransactionInput]) -> AnomalyDetectionResponse:
        expense_txs = [t for t in transactions if t.type.upper() == "EXPENSE"]

        if len(expense_txs) < 3:
            return AnomalyDetectionResponse(totalAnomaliesDetected=0, anomalies=[])

        data = []
        for t in expense_txs:
            data.append({
                "id": t.id,
                "date": t.date,
                "amount": float(t.amount),
                "category": t.category or "General",
                "description": t.description or ""
            })

        df = pd.DataFrame(data)
        anomalies: List[AnomalyDto] = []

        # Group by category and compute statistical bounds
        for cat_name, cat_df in df.groupby("category"):
            amounts = cat_df["amount"].values
            n_samples = len(amounts)

            cat_mean = float(np.mean(amounts))
            cat_std = float(np.std(amounts))
            cat_median = float(np.median(amounts))

            # Modified Z-score using Median Absolute Deviation (MAD) for robust outlier detection
            mad = float(np.median(np.abs(amounts - cat_median)))
            if mad == 0:
                mad = cat_std if cat_std > 0 else 1.0

            # Isolation Forest if enough observations exist
            use_iso_forest = n_samples >= 10
            iso_preds = None
            if use_iso_forest:
                iso = IsolationForest(contamination=0.05, random_state=42)
                iso_preds = iso.fit_predict(amounts.reshape(-1, 1))

            for idx, (_, row) in enumerate(cat_df.iterrows()):
                amt = float(row["amount"])
                z_score = (amt - cat_mean) / cat_std if cat_std > 0 else 0.0
                mod_z_score = 0.6745 * (amt - cat_median) / mad

                is_anomaly = False
                severity = "LOW"

                if z_score >= 2.5 or mod_z_score >= 3.0:
                    is_anomaly = True
                    severity = "HIGH"
                elif z_score >= 1.7 or mod_z_score >= 2.2 or (amt >= cat_median * 2.5 and amt > 1000):
                    is_anomaly = True
                    severity = "MEDIUM"
                elif use_iso_forest and iso_preds is not None and iso_preds[idx] == -1 and amt > cat_mean:
                    is_anomaly = True
                    severity = "LOW"

                if is_anomaly:
                    dev_pct = round(((amt - cat_median) / cat_median * 100.0), 2) if cat_median > 0 else 0.0
                    reason = (
                        f"Unusual spending detected: ₹{amt:,.2f} is {dev_pct:.1f}% higher "
                        f"than your typical median of ₹{cat_median:,.2f} for '{cat_name}'."
                    )

                    anomalies.append(AnomalyDto(
                        transactionId=int(row["id"]) if row["id"] is not None else None,
                        date=row["date"],
                        category=cat_name,
                        description=str(row["description"]),
                        amount=round(amt, 2),
                        categoryMean=round(cat_mean, 2),
                        deviationPercentage=dev_pct,
                        zScore=round(float(max(z_score, mod_z_score)), 2),
                        severity=severity,
                        reason=reason
                    ))

        anomalies.sort(key=lambda a: a.zScore, reverse=True)

        return AnomalyDetectionResponse(
            totalAnomaliesDetected=len(anomalies),
            anomalies=anomalies
        )
