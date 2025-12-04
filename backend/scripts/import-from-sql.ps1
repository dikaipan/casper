# Import SQL dump to PostgreSQL database
# Usage: .\import-from-sql.ps1 path\to\dump.sql

param(
    [Parameter(Mandatory=$true)]
    [string]$SqlFile
)

if (-not (Test-Path $SqlFile)) {
    Write-Host "❌ Error: File not found: $SqlFile" -ForegroundColor Red
    exit 1
}

Write-Host "🔄 Importing SQL dump..." -ForegroundColor Cyan
Write-Host "📁 File: $SqlFile" -ForegroundColor Cyan
Write-Host ""

# Load database URL from .env
$envFile = Join-Path $PSScriptRoot "..\..\.env"
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^DATABASE_URL=(.+)$') {
            $env:DATABASE_URL = $matches[1]
        }
    }
}

if (-not $env:DATABASE_URL) {
    Write-Host "❌ Error: DATABASE_URL not found in .env" -ForegroundColor Red
    exit 1
}

# Import using psql
try {
    & psql $env:DATABASE_URL -f $SqlFile
    Write-Host ""
    Write-Host "✅ SQL import completed successfully!" -ForegroundColor Green
} catch {
    Write-Host ""
    Write-Host "❌ SQL import failed: $_" -ForegroundColor Red
    exit 1
}

