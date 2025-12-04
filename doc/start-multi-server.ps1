# start-multi-server.ps1
param(
    [switch]$Docker
)

if ($Docker) {
    Write-Host "🐳 Starting with Docker Compose..." -ForegroundColor Cyan
    if (Test-Path "docker-compose.multi-server.yml") {
        docker-compose -f docker-compose.multi-server.yml up -d
        Write-Host "✅ All servers started with Docker!" -ForegroundColor Green
        Write-Host "`n🌐 Access URLs:" -ForegroundColor Yellow
        Write-Host "  Server 1: http://localhost:3001" -ForegroundColor White
        Write-Host "  Server 2: http://localhost:3003" -ForegroundColor White
        Write-Host "  Server 3: http://localhost:3005" -ForegroundColor White
        Write-Host "`n💡 View logs: docker-compose -f docker-compose.multi-server.yml logs -f" -ForegroundColor Gray
    } else {
        Write-Host "❌ Error: docker-compose.multi-server.yml not found!" -ForegroundColor Red
        Write-Host "💡 Please create docker-compose.multi-server.yml first (see MULTI_SERVER_SETUP.md)" -ForegroundColor Yellow
    }
    exit
}

Write-Host "🚀 Starting HCM Multi-Server Setup (Manual)..." -ForegroundColor Green

# Check if .env files exist
$backendEnvFiles = @(".env.server1", ".env.server2", ".env.server3")
$frontendEnvFiles = @(".env.local.server1", ".env.local.server2", ".env.local.server3")

$missingFiles = @()
foreach ($file in $backendEnvFiles) {
    if (-not (Test-Path "backend\$file")) {
        $missingFiles += "backend\$file"
    }
}

foreach ($file in $frontendEnvFiles) {
    if (-not (Test-Path "frontend\$file")) {
        $missingFiles += "frontend\$file"
    }
}

if ($missingFiles.Count -gt 0) {
    Write-Host "`n⚠️  Warning: Some environment files are missing:" -ForegroundColor Yellow
    foreach ($file in $missingFiles) {
        Write-Host "  - $file" -ForegroundColor Yellow
    }
    Write-Host "`n💡 Please create these files first (see MULTI_SERVER_SETUP.md for examples)" -ForegroundColor Gray
    $continue = Read-Host "Continue anyway? (y/n)"
    if ($continue -ne "y" -and $continue -ne "Y") {
        exit
    }
}

# Server 1
Write-Host "`n📦 Starting Server 1 (Port 3000/3001)..." -ForegroundColor Cyan
if (Test-Path "backend\.env.server1") {
    Copy-Item "backend\.env.server1" "backend\.env" -Force
    Write-Host "  ✓ Backend env configured" -ForegroundColor Gray
}
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; Write-Host '🔧 Backend Server 1 (Port 3000)' -ForegroundColor Cyan; npm run start:dev"
Start-Sleep -Seconds 3

if (Test-Path "frontend\.env.local.server1") {
    Copy-Item "frontend\.env.local.server1" "frontend\.env.local" -Force
    Write-Host "  ✓ Frontend env configured" -ForegroundColor Gray
}
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; Write-Host '🎨 Frontend Server 1 (Port 3001)' -ForegroundColor Cyan; npm run dev"

# Server 2
Write-Host "`n📦 Starting Server 2 (Port 3002/3003)..." -ForegroundColor Cyan
Start-Sleep -Seconds 5
if (Test-Path "backend\.env.server2") {
    Copy-Item "backend\.env.server2" "backend\.env" -Force
    Write-Host "  ✓ Backend env configured" -ForegroundColor Gray
}
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; Write-Host '🔧 Backend Server 2 (Port 3002)' -ForegroundColor Cyan; `$env:PORT=3002; npm run start:dev"
Start-Sleep -Seconds 3

if (Test-Path "frontend\.env.local.server2") {
    Copy-Item "frontend\.env.local.server2" "frontend\.env.local" -Force
    Write-Host "  ✓ Frontend env configured" -ForegroundColor Gray
}
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; Write-Host '🎨 Frontend Server 2 (Port 3003)' -ForegroundColor Cyan; `$env:PORT=3003; npm run dev"

# Server 3
Write-Host "`n📦 Starting Server 3 (Port 3004/3005)..." -ForegroundColor Cyan
Start-Sleep -Seconds 5
if (Test-Path "backend\.env.server3") {
    Copy-Item "backend\.env.server3" "backend\.env" -Force
    Write-Host "  ✓ Backend env configured" -ForegroundColor Gray
}
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; Write-Host '🔧 Backend Server 3 (Port 3004)' -ForegroundColor Cyan; `$env:PORT=3004; npm run start:dev"
Start-Sleep -Seconds 3

if (Test-Path "frontend\.env.local.server3") {
    Copy-Item "frontend\.env.local.server3" "frontend\.env.local" -Force
    Write-Host "  ✓ Frontend env configured" -ForegroundColor Gray
}
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; Write-Host '🎨 Frontend Server 3 (Port 3005)' -ForegroundColor Cyan; `$env:PORT=3005; npm run dev"

Write-Host "`n✅ All servers started!" -ForegroundColor Green
Write-Host "`n🌐 Access URLs:" -ForegroundColor Yellow
Write-Host "  Server 1: http://localhost:3001" -ForegroundColor White
Write-Host "  Server 2: http://localhost:3003" -ForegroundColor White
Write-Host "  Server 3: http://localhost:3005" -ForegroundColor White
Write-Host "`n💡 Tip: Close individual PowerShell windows to stop each server." -ForegroundColor Gray
Write-Host "💡 Tip: Use '.\start-multi-server.ps1 -Docker' to run with Docker instead" -ForegroundColor Gray

