@echo off
REM ==============================================================================
REM Ụlọ System - Defense Day 1-Click Startup Script (Windows Batch)
REM ==============================================================================
TITLE Ulo Project Defense 1-Click Launcher
CLS

echo ========================================================================
echo    [LAUNCHING ULỌ PROJECT DEFENSE ENVIRONMENT]
echo ========================================================================
echo.

REM 1. Start Docker containers (PostgreSQL 17 + Adminer)
echo [1/4] Starting Docker Database and Adminer Containers...
docker compose up -d postgres adminer
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to start Docker containers. Make sure Docker Desktop is running!
    pause
    exit /b %ERRORLEVEL%
)

echo [INFO] Waiting for PostgreSQL to initialize (5 seconds)...
timeout /t 5 /nobreak >nul

REM 2. Synchronize Database Schema
echo [2/4] Synchronizing Schema with Drizzle...
call npm run db:push

REM 3. Seed Fresh Defense Data
echo [3/4] Seeding University Demonstration Data...
call npm run db:seed

REM 4. Launch Next.js Application
echo.
echo ========================================================================
echo    SYSTEM READY FOR DEFENSE PRESENTATION
echo    --------------------------------------------------------------------
echo    Student / Public Portal: http://localhost:3000
echo    Adminer Live DB Viewer:  http://localhost:8080
echo    (System: PostgreSQL, Server: postgres, User: postgres, Pass: postgrespassword, DB: ulo)
echo ========================================================================
echo.
echo Starting Next.js Dev Server (Press Ctrl+C to stop)...
call npm run dev
