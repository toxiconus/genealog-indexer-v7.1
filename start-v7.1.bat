@echo off
REM ============================================
REM Genealog Indexer v7.1 - Akt Mode Launcher
REM ============================================
REM Lokalizacja: j:\projekt 2025\projekt-akta-v2\

title Genealog Indexer v7.1 - Akt Mode
color 0A

echo.
echo ============================================
echo   Genealog Indexer v7.1 - Akt Mode
echo   Enhanced Ergonomic Act Processing
echo ============================================
echo.

REM Sprawdzenie czy Node.js jest zainstalowany
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Przejście do folderu projektu
cd /d "%~dp0"

REM Sprawdzenie czy package.json istnieje
if not exist "package.json" (
    echo ERROR: package.json not found!
    echo This file should be in: %cd%
    pause
    exit /b 1
)

REM Sprawdzenie czy node_modules istnieje, jeśli nie - instalacja
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    echo.
)

echo ============================================
echo Starting Genealog Indexer v7.1...
echo ============================================
echo.
echo Features:
echo   • Card-style act buttons (fishy design)
echo   • Arrow key navigation (Left/Right)
echo   • Clean act-focused workflow
echo   • Heavy-Duty postprocessing preset
echo.
echo Opening: http://localhost:5173/viewer-osd-v9.html
echo.
echo Press Ctrl+C to stop the server
echo ============================================
echo.

call npm run dev

pause
