@echo off
echo Starting Shiksha-Setu - Dynamic Teacher Training Platform
echo ==========================================================
echo.

:: Start Backend
echo Starting Backend Server...
cd backend
start "Shiksha-Setu Backend" cmd /k "venv\Scripts\activate && python main.py"
echo Backend started at http://localhost:8000
cd ..

:: Wait a moment for backend to start
timeout /t 3 /nobreak > nul

:: Start Frontend
echo Starting Frontend Server...
cd frontend
start "Shiksha-Setu Frontend" cmd /k "npm run dev"
echo Frontend started at http://localhost:3000
cd ..

echo.
echo ==========================================================
echo Both servers are running in separate windows!
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:3000
echo API Docs: http://localhost:8000/docs
echo.
echo Close the terminal windows to stop the servers
echo ==========================================================
pause
