@echo off
cd /d "%~dp0"

echo.
echo ========================================
echo   Genealog Indexer v10 - START
echo ========================================
echo.
echo Uruchamianie serwera HTTP na porcie 8000...
echo.

REM Uruchom serwer w tle
start python -m http.server 8000

REM Czekaj aż serwer się uruchomi
timeout /t 2 /nobreak

REM Otwórz przeglądarkę
echo Otwieranie przeglądarki...
start http://localhost:8000/

echo.
echo ========================================
echo   Serwer działa na: http://localhost:8000/
echo   Aby zatrzymać: Zamknij okno serwera
echo ========================================
echo.