Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "  Starting SmartBudget Spring Boot Core Backend     " -ForegroundColor Green
Write-Host "====================================================" -ForegroundColor Cyan

if (-not $env:JAVA_HOME) {
    $env:JAVA_HOME = "C:\Program Files\Java\jdk-26.0.2.1"
}

# Test if PostgreSQL is actively listening on port 5432
$pgAvailable = $false
try {
    $tcp = New-Object System.Net.Sockets.TcpClient
    $tcp.Connect("127.0.0.1", 5432)
    $pgAvailable = $tcp.Connected
    $tcp.Close()
} catch {
    $pgAvailable = $false
}

if ($pgAvailable) {
    Write-Host "Detected active PostgreSQL on port 5432. Using PostgreSQL profile..." -ForegroundColor Green
    & "$PSScriptRoot\mvnw.cmd" spring-boot:run
} else {
    Write-Host "PostgreSQL not detected on port 5432. Booting with local embedded database profile (H2/PostgreSQL mode)..." -ForegroundColor Yellow
    Write-Host "Data will be persisted in ./backend/data/smartbudget_db" -ForegroundColor Gray
    & "$PSScriptRoot\mvnw.cmd" spring-boot:run "-Dspring-boot.run.profiles=local"
}

