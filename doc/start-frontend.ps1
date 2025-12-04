# HCM Frontend Startup Script
Write-Host "🚀 Starting HCM Frontend..." -ForegroundColor Cyan

# 1. Kill existing Node processes on port 3000
Write-Host "🔍 Checking for processes on port 3000..." -ForegroundColor Yellow
$port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($port3000) {
    $pids = $port3000 | Select-Object -ExpandProperty OwningProcess -Unique
    foreach ($pid in $pids) {
        Write-Host "   ❌ Killing process $pid on port 3000" -ForegroundColor Red
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
    }
    Start-Sleep -Seconds 2
}

# 2. Navigate to frontend directory
Set-Location "D:\HCS Cassete management\hcm\frontend"

# 3. Start frontend
Write-Host "✅ Starting frontend on port 3000..." -ForegroundColor Green
npm run dev

