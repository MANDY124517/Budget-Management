Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "  Starting SmartBudget React 19 Frontend (Vite)    " -ForegroundColor Green
Write-Host "====================================================" -ForegroundColor Cyan

Set-Location -Path "$PSScriptRoot\frontend"
npm run dev
