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

REM Sprawdzenie czy Python jest zainstalowany
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Python not found!
    echo Please install Python from https://python.org/
    pause
    exit /b 1
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
echo Opening: http://localhost:8000/viewer-osd-v9.html
echo.
echo Press Ctrl+C to stop the server
echo ============================================
echo.

REM Uruchomienie Python HTTP server w tle i otwarcie przeglądarki
echo Starting Python HTTP server...
start /B python -m http.server 8000 >nul 2>&1

REM Czekaj chwilę aż serwer się uruchomi
timeout /t 2 /nobreak >nul

REM Otwórz przeglądarkę
start http://localhost:8000/viewer-osd-v9.html

echo.
echo Server is running at: http://localhost:8000/viewer-osd-v9.html
echo Press Ctrl+C in the command prompt to stop the server
echo.
