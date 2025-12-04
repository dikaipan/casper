# Fix Frontend Build Issues
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  🔧 FIXING FRONTEND BUILD ISSUES     " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Stop all Node processes
Write-Host "🛑 Stopping all Node.js processes..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Write-Host "   ✅ All Node processes stopped" -ForegroundColor Green
Write-Host ""

# 2. Navigate to frontend
Set-Location "D:\HCS Cassete management\hcm\frontend"

# 3. Delete .next folder (build cache)
Write-Host "🗑️  Deleting .next build cache..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Path ".next" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "   ✅ .next folder deleted" -ForegroundColor Green
} else {
    Write-Host "   ℹ️  .next folder not found (already clean)" -ForegroundColor Gray
}
Write-Host ""

# 4. Clear node_modules/.cache (if exists)
Write-Host "🗑️  Clearing node_modules cache..." -ForegroundColor Yellow
if (Test-Path "node_modules/.cache") {
    Remove-Item -Path "node_modules/.cache" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "   ✅ Cache cleared" -ForegroundColor Green
} else {
    Write-Host "   ℹ️  No cache folder found" -ForegroundColor Gray
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Green
Write-Host "  ✅ FRONTEND BUILD CACHE CLEARED     " -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Run: .\start-all.ps1" -ForegroundColor White
Write-Host "   2. Wait for services to start" -ForegroundColor White
Write-Host "   3. Open browser: http://localhost:3000" -ForegroundColor White
Write-Host ""

