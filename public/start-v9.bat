@echo off
REM ============================================
REM Genealog Indexer v9 - Dynamic Form Launcher
REM ============================================
REM From: j:\projekt 2025\projekt-akta-v2\public\

title Genealog Indexer v9 - Dynamic Forms & Firebase
color 0B

echo.
echo ============================================
echo   Genealog Indexer v9 - Dynamic Forms
echo   ACTA v1 Models + Firebase Integration
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

REM Przejście do folderu głównego projektu (parent directory)
cd /d "%~dp0.."

REM Sprawdzenie czy package.json istnieje
if not exist "package.json" (
    echo ERROR: package.json not found in parent directory!
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
echo Starting Genealog Indexer v9...
echo ============================================
echo.
echo Features:
echo   • Dynamic form rendering with type filtering
echo   • applicableTypes per field (chrzest, male, zgon, urodzenie)
echo   • Type selector dropdown (change act type on-the-fly)
echo   • Custom field addition (Dodaj pole button)
echo   • Reliability score calculation (confidence + DNA + source)
echo   • ACTA v1 EventModel integration
echo   • Firebase Firestore support
echo   • Auto-save on field changes
echo   • Dark theme UI with collapsible sections
echo.
echo Opening: http://localhost:5173/viewer-osd-v9.html
echo.
echo Press Ctrl+C to stop the server
echo ============================================
echo.

call npm run dev

pause
