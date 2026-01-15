@echo off
REM ============================================
REM Genealog Indexer v8.5 - Act Boundaries
REM ============================================

title Genealog Indexer v8.5 - Act Boundaries Only
color 0A

echo.
echo ============================================
echo   Genealog Indexer v8.5
echo   Act Boundary Marking
echo ============================================
echo.

REM Sprawdzenie czy Python jest zainstalowany
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Python not found!
    echo Please install Python 3.x from python.org
    pause
    exit /b 1
)

REM Zabij istniejace procesy Python uzywajace portu 8000
echo Killing existing processes on port 8000...
powershell -Command "Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }" >nul 2>&1

REM Alternatywna metoda dla starszych systemow
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000 ^| findstr LISTENING') do (
    echo Killing process %%a using port 8000...
    taskkill /PID %%a /F >nul 2>&1
)

REM Czekaj chwilejc az procesy zostana zabite
timeout /t 1 /nobreak >nul

echo ============================================
echo Starting Genealog Indexer v8.5...
echo ============================================
echo.
echo Features:
echo   - Mark act boundaries on images
echo   - Context menu for acts (rename, delete, etc.)
echo   - Image context menu (batch operations)
echo.
echo Opening: http://localhost:8000/viewer-osd-v8.5.html
echo.
echo Press Ctrl+C to stop the server
echo ============================================
echo.

REM Uruchomienie Python HTTP server w tle i otwarcie przegladarki
echo Starting Python HTTP server...
start /B python -m http.server 8000 >nul 2>&1

REM Czekaj chwilejc az serwer sie uruchomi
timeout /t 2 /nobreak >nul

REM Otworz przegladarke
start http://localhost:8000/viewer-osd-v8.5.html

echo.
echo Server is running at: http://localhost:8000/viewer-osd-v8.5.html
echo Press Ctrl+C in the command prompt to stop the server
echo.

