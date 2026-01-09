@echo off
echo Starting Vite server for Akta v10...
cd /d "%~dp0"
if not exist node_modules (
    echo Installing dependencies...
    npm install
)
echo Starting development server...
echo.
echo Opening: http://localhost:5173/
echo.
echo Press Ctrl+C to stop the server
echo.
npm run dev