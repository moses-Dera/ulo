@echo off
REM ==============================================================================
REM Ụlọ System - Defense Day 1-Click Shutdown Script (Windows Batch)
REM ==============================================================================
TITLE Stop Ulo Defense Environment
CLS

echo Stopping Docker containers...
docker compose down

echo Stopping node processes...
taskkill /F /IM node.exe >nul 2>&1

echo.
echo [DONE] All defense services have been cleanly shut down.
pause
