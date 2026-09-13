Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "  Starting SmartBudget Python FastAPI ML Engine     " -ForegroundColor Green
Write-Host "====================================================" -ForegroundColor Cyan

Set-Location -Path "$PSScriptRoot\analytics"
& "C:\Users\M S I\AppData\Local\Python\bin\python.exe" -m uvicorn app.main:app --host 127.0.0.1 --port 8001 --reload

