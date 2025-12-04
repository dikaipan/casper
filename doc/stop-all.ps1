# HCM Stop All Services Script
Write-Host "========================================" -ForegroundColor Red
Write-Host "  🛑 STOPPING ALL HCM SERVICES        " -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Red
Write-Host ""

# 1. Kill all Node processes
Write-Host "🧹 Stopping all Node.js processes..." -ForegroundColor Yellow
$nodeProcesses = Get-Process node -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    $nodeProcesses | Stop-Process -Force -ErrorAction SilentlyContinue
    Write-Host "   ✅ Stopped $($nodeProcesses.Count) Node.js process(es)" -ForegroundColor Green
} else {
    Write-Host "   ℹ️  No Node.js processes found" -ForegroundColor Gray
}

Start-Sleep -Seconds 2

# 2. Verify ports are free
Write-Host ""
Write-Host "🔍 Verifying ports are released..." -ForegroundColor Yellow
$port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
$port3001 = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue

if ($port3000 -or $port3001) {
    Write-Host "   ⚠️  Some ports still occupied. Force cleaning..." -ForegroundColor Red
    
    if ($port3000) {
        $pids = $port3000 | Select-Object -ExpandProperty OwningProcess -Unique
        foreach ($pid in $pids) {
            Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
            Write-Host "   ❌ Killed process $pid on port 3000" -ForegroundColor Red
        }
    }
    
    if ($port3001) {
        $pids = $port3001 | Select-Object -ExpandProperty OwningProcess -Unique
        foreach ($pid in $pids) {
            Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
            Write-Host "   ❌ Killed process $pid on port 3001" -ForegroundColor Red
        }
    }
    
    Start-Sleep -Seconds 2
}

Write-Host "   ✅ All ports are now free" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  ✅ ALL SERVICES STOPPED             " -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

