from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.analytics_routes import router as analytics_router

app = FastAPI(
    title="SmartBudget Financial Analytics & ML Microservice",
    description="Statistical spending analysis, time-series forecasting, anomaly detection, explainable financial health scoring, and natural language insights.",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(analytics_router)

@app.get("/")
def root():
    return {
        "service": "SmartBudget Analytics & ML Engine",
        "status": "healthy",
        "version": "1.0.0"
    }

@app.get("/health")
def health():
    return {"status": "UP"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8001, reload=True)
