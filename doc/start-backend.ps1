# HCM Backend Startup Script
Write-Host "🚀 Starting HCM Backend..." -ForegroundColor Cyan

# 1. Kill existing Node processes on port 3001
Write-Host "🔍 Checking for processes on port 3001..." -ForegroundColor Yellow
$port3001 = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue
if ($port3001) {
    $pids = $port3001 | Select-Object -ExpandProperty OwningProcess -Unique
    foreach ($pid in $pids) {
        Write-Host "   ❌ Killing process $pid on port 3001" -ForegroundColor Red
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
    }
    Start-Sleep -Seconds 2
}

# 2. Navigate to backend directory
Set-Location "D:\HCS Cassete management\hcm\backend"

# 3. Set environment variable
$env:PORT = "3001"

# 4. Start backend
Write-Host "✅ Starting backend on port 3001..." -ForegroundColor Green
npm run start:dev

