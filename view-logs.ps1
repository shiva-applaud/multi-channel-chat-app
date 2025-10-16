# View Backend Logs Script
# Usage: .\view-logs.ps1 [combined|error|tail|clear]

param(
    [Parameter(Position=0)]
    [ValidateSet('combined', 'error', 'tail', 'clear', 'help')]
    [string]$Action = 'combined'
)

$combinedLog = "server\logs\combined.log"
$errorLog = "server\logs\error.log"

function Show-Help {
    Write-Host "Backend Log Viewer" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Usage: .\view-logs.ps1 [option]" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Options:" -ForegroundColor Green
    Write-Host "  combined  - View all logs (default)"
    Write-Host "  error     - View error logs only"
    Write-Host "  tail      - Follow logs in real-time (Ctrl+C to stop)"
    Write-Host "  clear     - Clear all log files"
    Write-Host "  help      - Show this help message"
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor Green
    Write-Host "  .\view-logs.ps1              # View all logs"
    Write-Host "  .\view-logs.ps1 error        # View errors only"
    Write-Host "  .\view-logs.ps1 tail         # Follow logs in real-time"
    Write-Host "  .\view-logs.ps1 clear        # Clear log files"
}

function Show-LogFile {
    param([string]$LogFile, [string]$Title)
    
    if (Test-Path $LogFile) {
        Write-Host "`n=== $Title ===" -ForegroundColor Cyan
        Write-Host "File: $LogFile" -ForegroundColor Gray
        Write-Host "Size: $((Get-Item $LogFile).Length / 1KB) KB" -ForegroundColor Gray
        Write-Host ""
        Get-Content $LogFile -Tail 100
    } else {
        Write-Host "`n[!] Log file not found: $LogFile" -ForegroundColor Yellow
        Write-Host "    Start the server to generate logs: npm run dev" -ForegroundColor Gray
    }
}

switch ($Action) {
    'combined' {
        Show-LogFile -LogFile $combinedLog -Title "Combined Logs (Last 100 lines)"
    }
    'error' {
        Show-LogFile -LogFile $errorLog -Title "Error Logs (Last 100 lines)"
    }
    'tail' {
        Write-Host "Following logs in real-time (Press Ctrl+C to stop)..." -ForegroundColor Cyan
        Write-Host ""
        if (Test-Path $combinedLog) {
            Get-Content $combinedLog -Wait -Tail 20
        } else {
            Write-Host "[!] Log file not found. Start the server first: npm run dev" -ForegroundColor Yellow
        }
    }
    'clear' {
        Write-Host "Clearing log files..." -ForegroundColor Yellow
        if (Test-Path $combinedLog) {
            Clear-Content $combinedLog
            Write-Host "[✓] Cleared: $combinedLog" -ForegroundColor Green
        }
        if (Test-Path $errorLog) {
            Clear-Content $errorLog
            Write-Host "[✓] Cleared: $errorLog" -ForegroundColor Green
        }
        Write-Host "`nLog files cleared successfully!" -ForegroundColor Green
    }
    'help' {
        Show-Help
    }
}

