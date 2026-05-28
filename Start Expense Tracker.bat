@echo off
title Daily Expense Tracker
color 0A

echo.
echo  ============================================
echo       💰 Daily Expense Tracker Launcher
echo  ============================================
echo.
echo  Starting your expense tracker...
echo  Please wait a moment...
echo.

:: Go to the project folder
cd /d "%~dp0"

:: Check if node_modules exists, if not run npm install first
if not exist "node_modules" (
    echo  📦 First-time setup: Installing dependencies...
    echo  This may take a minute...
    echo.
    call npm install
    echo.
)

:: Start Vite dev server in background and open browser
echo  🚀 Launching server at http://localhost:5173
echo.
echo  ✅ Your Expense Tracker will open in your browser shortly.
echo.
echo  ⚠️  Keep this window open while using the app.
echo      Close this window to stop the server.
echo.
echo  ============================================
echo.

:: Wait 2 seconds then open browser
start "" cmd /c "timeout /t 2 /nobreak >nul && start http://localhost:5173"

:: Run the dev server (this keeps the window open)
npm run dev

pause
