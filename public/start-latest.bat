@echo off
setlocal enabledelayedexpansion
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

REM ===== ZNAJDZ NAJWYZSZA WERSJE v8.x PRZY UZYCIU POWERSHELL =====
REM PowerShell potrafi porownywac wersje numerycznie (v8.9 < v8.10 < v8.17)
for /f "delims=" %%A in ('powershell -NoProfile -Command "Get-ChildItem -Filter 'viewer-osd-v8.*.html' -ErrorAction SilentlyContinue | Sort-Object {[version]($_ -replace 'viewer-osd-v|\.html', '')} | Select-Object -Last 1 | ForEach-Object {$_.Name}"') do (
    set "htmlFile=%%A"
)

if "!htmlFile!"=="" (
    echo.
    echo WARNING: No viewer-osd-v8.x files found!
    echo Trying to find any viewer-osd file...
    echo.
    
    for /f "delims=" %%A in ('powershell -NoProfile -Command "Get-ChildItem -Filter 'viewer-osd*.html' -ErrorAction SilentlyContinue | Sort-Object LastWriteTime | Select-Object -Last 1 | ForEach-Object {$_.Name}"') do (
        set "htmlFile=%%A"
    )
    
    if "!htmlFile!"=="" (
        echo ERROR: No viewer-osd files found!
        echo Please check that you have viewer-osd-v*.html files in this directory.
        pause
        exit /b 1
    )
)

REM Wyciągnij numer wersji z nazwy pliku (np. v8.20 z viewer-osd-v8.20.html)
for /f "tokens=2 delims=v" %%B in ("!htmlFile!") do (
    for /f "tokens=1 delims=." %%C in ("%%B") do (
        set "latestVersion=v%%C.%%D"
    )
)

REM Fallback - spróbuj inna metoda
if "!latestVersion!"=="" (
    for /f "tokens=3 delims=-." %%B in ("!htmlFile!") do (
        set "latestVersion=v%%B"
    )
)

echo ============================================
echo Found latest version: !htmlFile!
echo Version: !latestVersion!
echo ============================================
echo.
echo Starting Genealog Indexer...
echo Opening: http://localhost:8000/!htmlFile!
echo.
echo Press Ctrl+C in this window to stop the server
echo ============================================
echo.

REM Uruchomienie Python HTTP server w tle i otwarcie przegladarki
echo Starting Python HTTP server on port 8000...
start /B python -m http.server 8000 >nul 2>&1

REM Czekaj chwilejc az serwer sie uruchomi
timeout /t 2 /nobreak >nul

REM Otworz przegladarke z najnowsza wersja
echo Opening browser...
start http://localhost:8000/!htmlFile!

echo.
echo ✅ Server is running at: http://localhost:8000/!htmlFile!
echo.
echo Press Ctrl+C in this window to stop the server
echo.

REM Pozostaw terminal otwarty
pause
