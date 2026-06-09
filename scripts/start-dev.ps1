# ExpenseFlow - Development startup script (Windows)
# Requires Docker Desktop running for MongoDB

Write-Host "ExpenseFlow Dev Startup" -ForegroundColor Cyan

# Start MongoDB via Docker
Write-Host "`nStarting MongoDB..." -ForegroundColor Yellow
docker compose -f "$PSScriptRoot\..\docker-compose.yml" up -d mongodb 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Docker failed. Please start Docker Desktop, or install MongoDB locally." -ForegroundColor Red
    Write-Host "MongoDB URI: mongodb://127.0.0.1:27017/expense_management" -ForegroundColor Gray
    exit 1
}

Start-Sleep -Seconds 3

# Seed database
Write-Host "`nSeeding database..." -ForegroundColor Yellow
Set-Location "$PSScriptRoot\..\backend"
npm run seed

Write-Host "`nStarting backend (port 5000)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\..\backend'; npm run dev"

Start-Sleep -Seconds 2

Write-Host "Starting frontend (port 3000)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\..\frontend'; npm run dev"

Write-Host "`nDone! Open http://localhost:3000" -ForegroundColor Cyan
Write-Host "Demo login: demo@expenseflow.com / demo12345" -ForegroundColor Gray
