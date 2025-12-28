@echo off
REM Genealog Indexer Server Launcher
REM Lokalizacja: j:\projekt 2025\projekt-akta-v2\

title Genealog Indexer v3.2 - Server
color 0A

echo.
echo ========================================
echo   Genealog Indexer v3.2 - Server
echo   Starting Vite Dev Server...
echo ========================================
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

REM Start serwera
echo Starting server on http://localhost:5173/viewer-osd.html
echo.
echo Press Ctrl+C to stop the server
echo.
call npm run dev

pause
