# Migration Script: Vendor → Pengelola
# This script updates all vendor references to pengelola in the backend

Write-Host "=== BACKEND MIGRATION: VENDOR -> PENGELOLA ===" -ForegroundColor Cyan
Write-Host ""

$startLocation = Get-Location
$backendPath = Split-Path -Parent $MyInvocation.MyCommand.Path

try {
    Set-Location $backendPath
    
    Write-Host "Scanning files in: $backendPath" -ForegroundColor Yellow
    Write-Host ""

    # Get all TypeScript files, excluding node_modules, dist, .git
    $files = Get-ChildItem -Path "src" -Recurse -Include *.ts,*.js -Exclude *.spec.ts,*.test.ts | 
        Where-Object { $_.FullName -notmatch 'node_modules|dist|\.git|coverage' }

    $totalFiles = $files.Count
    Write-Host "Found $totalFiles files to process" -ForegroundColor Green
    Write-Host ""

    $changedFiles = 0
    $totalReplacements = 0

    foreach ($file in $files) {
        $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
        
        if ($null -eq $content) {
            continue
        }

        $originalContent = $content
        $fileReplacements = 0

        # Replace patterns (order matters!)
        $content = $content -replace '\bvendorId\b', 'pengelolaId'
        $content = $content -replace '\bvendorCode\b', 'pengelolaCode'
        $content = $content -replace '\bvendorUser\b', 'pengelolaUser'
        $content = $content -replace '\bvendorUsers\b', 'pengelolaUsers'
        $content = $content -replace '\bVendorUser\b', 'PengelolaUser'
        $content = $content -replace '\bVendorUserRole\b', 'PengelolaUserRole'
        $content = $content -replace '\.vendor\b', '.pengelola'
        $content = $content -replace '\bvendor:', 'pengelola:'
        $content = $content -replace '"vendor"', '"pengelola"'
        $content = $content -replace "'vendor'", "'pengelola'"
        $content = $content -replace '\bvendors\b', 'pengelola'
        $content = $content -replace '\bVendor\b', 'Pengelola'
        $content = $content -replace '\bVENDOR\b', 'PENGELOLA'
        $content = $content -replace '\bvendor_users\b', 'pengelola_users'
        $content = $content -replace '\bvendor_id\b', 'pengelola_id'
        $content = $content -replace '\bvendor_code\b', 'pengelola_code'
        $content = $content -replace '\bBankVendorAssignment\b', 'BankPengelolaAssignment'
        $content = $content -replace '\bbankVendorAssignment\b', 'bankPengelolaAssignment'
        $content = $content -replace '\bbank_vendor_assignments\b', 'bank_pengelola_assignments'
        $content = $content -replace '\bvendorAssignments\b', 'pengelolaAssignments'
        $content = $content -replace 'customerBankId_vendorId', 'customerBankId_pengelolaId'
        $content = $content -replace '\bIN_TRANSIT_TO_VENDOR\b', 'IN_TRANSIT_TO_PENGELOLA'
        $content = $content -replace '\bVENDOR_LOCATION\b', 'PENGELOLA_LOCATION'
        $content = $content -replace '\bVENDOR_ASSIGNMENT\b', 'PENGELOLA_ASSIGNMENT'
        $content = $content -replace '\breceivedAtVendor\b', 'receivedAtPengelola'
        $content = $content -replace '\breceived_at_vendor\b', 'received_at_pengelola'
        $content = $content -replace '\brequestedByVendor\b', 'requestedByPengelola'
        $content = $content -replace '\brequested_by_vendor\b', 'requested_by_pengelola'
        $content = $content -replace '\brequesterVendor\b', 'requesterPengelola'
        $content = $content -replace '\bPMRequesterVendor\b', 'PMRequesterPengelola'
        $content = $content -replace '\bassignVendorToBank\b', 'assignPengelolaToBank'

        if ($content -ne $originalContent) {
            Set-Content -Path $file.FullName -Value $content -NoNewline
            $changedFiles++
            
            $fileReplacements = ($originalContent.Length - $content.Length) / 5
            $totalReplacements += [Math]::Abs($fileReplacements)
            
            Write-Host "Updated: $($file.Name)" -ForegroundColor Green
        }
    }

    Write-Host ""
    Write-Host "=== MIGRATION COMPLETE ===" -ForegroundColor Cyan
    Write-Host "Files changed: $changedFiles / $totalFiles" -ForegroundColor Green
    Write-Host "Estimated replacements: $([Math]::Round($totalReplacements))" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Review changes with: git diff" -ForegroundColor White
    Write-Host "2. Generate Prisma migration: npx prisma migrate dev --name rename-vendor-to-pengelola" -ForegroundColor White
    Write-Host "3. Test the application" -ForegroundColor White
    Write-Host ""

} catch {
    Write-Host "Error occurred during migration" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
} finally {
    Set-Location $startLocation
}
