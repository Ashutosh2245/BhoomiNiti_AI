Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host "Starting BhoomiNiti AI - National Land Governance Digital Platform" -ForegroundColor Green
Write-Host "====================================================================" -ForegroundColor Cyan

$baseDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Seed Database
Set-Location "$baseDir\backend"
Write-Host "Seeding SQLite Database..." -ForegroundColor Yellow
python app/seed.py

# Start Backend API
Write-Host "Starting FastAPI Backend Server on http://localhost:8000 ..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$baseDir\backend'; python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

# Start Frontend
Write-Host "Starting React Vite Frontend Server on http://localhost:5173 ..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$baseDir\frontend'; npm run dev"

Write-Host ""
Write-Host "BhoomiNiti AI Platform is launching!" -ForegroundColor Green
Write-Host "Backend API Gateway: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host "Frontend Portal:    http://localhost:5173" -ForegroundColor Cyan
Write-Host "====================================================================" -ForegroundColor Cyan
