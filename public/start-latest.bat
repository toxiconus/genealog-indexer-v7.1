@echo off
REM ============================================
REM Genealog Indexer - Auto Latest Version
REM ============================================
REM Automatically finds and launches the latest viewer-osd version

title Genealog Indexer - Latest Version
color 0A

echo.
echo ============================================
echo   Genealog Indexer - Latest Version
echo   Auto-detecting highest version...
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

REM Znajdz najwyzsza wersje v8.x - szukaj pliku viewer-osd-v8.*.html i sortuj numerycznie
setlocal enabledelayedexpansion
set "latestFile="
set "latestVersion=0"

for %%f in (viewer-osd-v8.*.html) do (
    set "filename=%%f"
    
    REM Wyodrebniaj numer wersji - szukaj "v8." i liczb po nim
    for /f "tokens=2 delims=v" %%v in ("!filename!") do (
        set "versionPart=%%v"
        REM Wyodrebniaj liczbe przed .html
        for /f "tokens=1 delims=." %%n in ("!versionPart!") do (
            set "version=%%n"
        )
        REM Wyodrebniaj czesc dziesiętną
        for /f "tokens=2 delims=." %%d in ("!versionPart!") do (
            set "decimal=%%d"
            for /f "tokens=1 delims=. " %%x in ("!decimal!") do (
                set "decimal=%%x"
            )
        )
        REM Porownaj wersje (v8.5 vs v8.6 etc)
        if "!decimal!" gtr "!latestVersion!" (
            set "latestVersion=!decimal!"
            set "latestFile=!filename!"
        )
    )
)

echo Found latest v8 version: !latestFile!
set "htmlFile=!latestFile!"

if "!latestFile!"=="" (
    echo ERROR: No viewer-osd-v8.x files found!
    pause
    exit /b 1
)

echo ============================================
echo Starting Genealog Indexer v!latestVersion!...
echo ============================================
echo.
echo Opening: http://localhost:8000/!htmlFile!
echo.
echo Press Ctrl+C to stop the server
echo ============================================
echo.

REM Uruchomienie Python HTTP server w tle i otwarcie przegladarki
echo Starting Python HTTP server...
start /B python -m http.server 8000 >nul 2>&1

REM Czekaj chwilejc az serwer sie uruchomi
timeout /t 2 /nobreak >nul

REM Otworz przegladarke z najnowsza wersja
start http://localhost:8000/!htmlFile!

echo.
echo Server is running at: http://localhost:8000/!htmlFile!
echo Press Ctrl+C in the command prompt to stop the server
echo.

REM Pozostaw terminal otwarty
pause
