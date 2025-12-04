# HCM Complete Startup Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  🚀 HCM CASSETTE MANAGEMENT SYSTEM    " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Kill ALL existing Node processes
Write-Host "🧹 Cleaning up existing Node processes..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 3

# 2. Check ports
Write-Host "🔍 Verifying ports are free..." -ForegroundColor Yellow
$port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
$port3001 = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue

if ($port3000 -or $port3001) {
    Write-Host "   ⚠️  Ports still occupied. Forcing cleanup..." -ForegroundColor Red
    if ($port3000) {
        $port3000 | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }
    }
    if ($port3001) {
        $port3001 | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }
    }
    Start-Sleep -Seconds 3
}

Write-Host "   ✅ Ports 3000 and 3001 are now free" -ForegroundColor Green
Write-Host ""

# 3. Start Backend (in background)
Write-Host "🔧 Starting BACKEND on port 3001..." -ForegroundColor Cyan
$backendJob = Start-Job -ScriptBlock {
    Set-Location "D:\HCS Cassete management\hcm\backend"
    $env:PORT = "3001"
    npm run start:dev
}

# 4. Wait for backend to be ready
Write-Host "   ⏳ Waiting for backend to start..." -ForegroundColor Yellow
$backendReady = $false
$attempts = 0
$maxAttempts = 30

while (-not $backendReady -and $attempts -lt $maxAttempts) {
    Start-Sleep -Seconds 2
    $attempts++
    $port3001Check = Get-NetTCPConnection -LocalPort 3001 -State Listen -ErrorAction SilentlyContinue
    if ($port3001Check) {
        $backendReady = $true
        Write-Host "   ✅ Backend is ready on port 3001" -ForegroundColor Green
    } else {
        Write-Host "   ⏳ Attempt $attempts/$maxAttempts..." -ForegroundColor Yellow
    }
}

if (-not $backendReady) {
    Write-Host "   ❌ Backend failed to start!" -ForegroundColor Red
    Stop-Job $backendJob -ErrorAction SilentlyContinue
    Remove-Job $backendJob -ErrorAction SilentlyContinue
    exit 1
}

Write-Host ""

# 5. Start Frontend (in background)
Write-Host "🎨 Starting FRONTEND on port 3000..." -ForegroundColor Cyan
$frontendJob = Start-Job -ScriptBlock {
    Set-Location "D:\HCS Cassete management\hcm\frontend"
    npm run dev
}

# 6. Wait for frontend to be ready
Write-Host "   ⏳ Waiting for frontend to start..." -ForegroundColor Yellow
$frontendReady = $false
$attempts = 0
$maxAttempts = 30

while (-not $frontendReady -and $attempts -lt $maxAttempts) {
    Start-Sleep -Seconds 2
    $attempts++
    $port3000Check = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
    if ($port3000Check) {
        $frontendReady = $true
        Write-Host "   ✅ Frontend is ready on port 3000" -ForegroundColor Green
    } else {
        Write-Host "   ⏳ Attempt $attempts/$maxAttempts..." -ForegroundColor Yellow
    }
}

if (-not $frontendReady) {
    Write-Host "   ❌ Frontend failed to start!" -ForegroundColor Red
    Stop-Job $frontendJob -ErrorAction SilentlyContinue
    Remove-Job $frontendJob -ErrorAction SilentlyContinue
    Stop-Job $backendJob -ErrorAction SilentlyContinue
    Remove-Job $backendJob -ErrorAction SilentlyContinue
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  ✅ ALL SERVICES ARE RUNNING!        " -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "📍 Backend:  http://localhost:3001" -ForegroundColor Cyan
Write-Host "📍 Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop all services..." -ForegroundColor Yellow
Write-Host ""

# 7. Keep script running and monitor jobs
try {
    while ($true) {
        Start-Sleep -Seconds 5
        
        # Check if jobs are still running
        $backendStatus = Get-Job -Id $backendJob.Id -ErrorAction SilentlyContinue
        $frontendStatus = Get-Job -Id $frontendJob.Id -ErrorAction SilentlyContinue
        
        if (-not $backendStatus -or $backendStatus.State -eq "Failed") {
            Write-Host "❌ Backend job failed!" -ForegroundColor Red
            break
        }
        if (-not $frontendStatus -or $frontendStatus.State -eq "Failed") {
            Write-Host "❌ Frontend job failed!" -ForegroundColor Red
            break
        }
    }
} finally {
    # Cleanup on exit
    Write-Host ""
    Write-Host "🛑 Stopping all services..." -ForegroundColor Yellow
    Stop-Job $backendJob -ErrorAction SilentlyContinue
    Stop-Job $frontendJob -ErrorAction SilentlyContinue
    Remove-Job $backendJob -ErrorAction SilentlyContinue
    Remove-Job $frontendJob -ErrorAction SilentlyContinue
    
    # Kill any remaining Node processes
    Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    
    Write-Host "✅ All services stopped cleanly" -ForegroundColor Green
}

