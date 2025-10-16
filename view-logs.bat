@echo off
REM Backend Log Viewer (Windows Command Prompt)
REM Usage: view-logs.bat [combined|error|clear]

if "%1"=="error" goto error
if "%1"=="clear" goto clear
if "%1"=="help" goto help

:combined
echo.
echo === Combined Logs (All logs) ===
echo File: server\logs\combined.log
echo.
if exist server\logs\combined.log (
    type server\logs\combined.log
) else (
    echo [!] Log file not found. Start the server to generate logs: npm run dev
)
goto end

:error
echo.
echo === Error Logs Only ===
echo File: server\logs\error.log
echo.
if exist server\logs\error.log (
    type server\logs\error.log
) else (
    echo [!] Error log file not found.
)
goto end

:clear
echo.
echo Clearing log files...
if exist server\logs\combined.log (
    type nul > server\logs\combined.log
    echo [OK] Cleared: server\logs\combined.log
)
if exist server\logs\error.log (
    type nul > server\logs\error.log
    echo [OK] Cleared: server\logs\error.log
)
echo.
echo Log files cleared successfully!
goto end

:help
echo.
echo Backend Log Viewer
echo.
echo Usage: view-logs.bat [option]
echo.
echo Options:
echo   combined  - View all logs (default)
echo   error     - View error logs only
echo   clear     - Clear all log files
echo   help      - Show this help message
echo.
echo Examples:
echo   view-logs.bat              - View all logs
echo   view-logs.bat error        - View errors only
echo   view-logs.bat clear        - Clear log files
echo.

:end

