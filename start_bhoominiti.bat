@echo off
echo ====================================================================
echo Starting BhoomiNiti AI - National Land Governance Digital Platform
echo ====================================================================

cd /d "%~dp0backend"
echo Seeding SQLite Database...
python app/seed.py

echo Starting FastAPI Backend Server on http://localhost:8000 ...
start "BhoomiNiti Backend API" cmd /k "python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

cd /d "%~dp0frontend"
echo Starting React Vite Frontend Server on http://localhost:5173 ...
start "BhoomiNiti Frontend UI" cmd /k "npm run dev"

echo.
echo BhoomiNiti AI Platform is launching!
echo Backend API Gateway: http://localhost:8000/docs
echo Frontend Portal:    http://localhost:5173
echo ====================================================================
