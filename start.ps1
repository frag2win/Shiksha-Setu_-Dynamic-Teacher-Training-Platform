# Shiksha-Setu Startup Script
# PowerShell script to start both backend and frontend servers

Write-Host "Starting Shiksha-Setu - Dynamic Teacher Training Platform" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

# Set execution policy for current session
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force

# Refresh PATH to include Node.js
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# Start Backend
Write-Host "Starting Backend Server..." -ForegroundColor Yellow
$backendPath = Join-Path $PSScriptRoot "backend"
$backendScript = {
    Set-Location $args[0]
    & "venv\Scripts\Activate.ps1"
    python main.py
}
$backendJob = Start-Job -ScriptBlock $backendScript -ArgumentList $backendPath
Write-Host "Backend started (Job ID: $($backendJob.Id)) at http://localhost:8000" -ForegroundColor Green

# Wait for backend to initialize
Start-Sleep -Seconds 3

# Start Frontend
Write-Host ""
Write-Host "Starting Frontend Server..." -ForegroundColor Yellow
$frontendPath = Join-Path $PSScriptRoot "frontend"
$frontendScript = {
    Set-Location $args[0]
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
    npm run dev
}
$frontendJob = Start-Job -ScriptBlock $frontendScript -ArgumentList $frontendPath
Write-Host "Frontend started (Job ID: $($frontendJob.Id)) at http://localhost:3000" -ForegroundColor Green

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Both servers are running!" -ForegroundColor Green
Write-Host "Backend:  http://localhost:8000" -ForegroundColor White
Write-Host "Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "API Docs: http://localhost:8000/docs" -ForegroundColor White
Write-Host ""
Write-Host "To view logs, use:" -ForegroundColor Yellow
Write-Host "  Backend:  Receive-Job $($backendJob.Id) -Keep" -ForegroundColor Gray
Write-Host "  Frontend: Receive-Job $($frontendJob.Id) -Keep" -ForegroundColor Gray
Write-Host ""
Write-Host "To stop servers, use:" -ForegroundColor Yellow
Write-Host "  Stop-Job $($backendJob.Id),$($frontendJob.Id)" -ForegroundColor Gray
Write-Host "  Remove-Job $($backendJob.Id),$($frontendJob.Id)" -ForegroundColor Gray
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to exit (servers will continue running)" -ForegroundColor Yellow
Write-Host "or close PowerShell to stop all jobs" -ForegroundColor Yellow

# Keep script running and show periodic status
try {
    while ($true) {
        Start-Sleep -Seconds 10
        $backendState = (Get-Job $backendJob.Id).State
        $frontendState = (Get-Job $frontendJob.Id).State
        
        if ($backendState -ne "Running" -or $frontendState -ne "Running") {
            Write-Host ""
            Write-Host "WARNING: One or more servers stopped!" -ForegroundColor Red
            Write-Host "Backend:  $backendState" -ForegroundColor $(if ($backendState -eq "Running") { "Green" } else { "Red" })
            Write-Host "Frontend: $frontendState" -ForegroundColor $(if ($frontendState -eq "Running") { "Green" } else { "Red" })
            break
        }
    }
} finally {
    Write-Host ""
    Write-Host "Stopping servers..." -ForegroundColor Yellow
    Stop-Job $backendJob.Id,$frontendJob.Id -ErrorAction SilentlyContinue
    Remove-Job $backendJob.Id,$frontendJob.Id -ErrorAction SilentlyContinue
    Write-Host "All servers stopped." -ForegroundColor Green
}
