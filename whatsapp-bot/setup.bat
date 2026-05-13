@echo off
chcp 65001 >nul
title OptiSize Bot Setup

echo ========================================
echo    OptiSize Bot - First Time Setup
echo ========================================
echo.

:: Install Node.js check
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo Download from: https://nodejs.org/
    echo Choose LTS version, install with default settings
    pause
    exit /b 1
)

echo [OK] Node.js found:
node --version
echo.

:: Install dependencies
echo [1/3] Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies!
    pause
    exit /b 1
)
echo [OK] Dependencies installed!
echo.

:: Set Groq API Key
echo [2/3] Groq API Key Setup
echo.
if "%GROQ_API_KEY%"=="" (
    echo Your Groq API Key is not set.
    echo Get a FREE key from: https://console.groq.com
    echo.
    set /p GROQ_API_KEY="Enter your Groq API Key: "
)

echo [OK] API Key set: %GROQ_API_KEY:~0,8%...
echo.

:: Website URL
echo [3/3] Website URL
echo.
echo The bot needs to connect to the OptiSize website API
echo to sync subscription codes.
echo.
echo Default: http://localhost:3000
echo If deploying on a server, enter the server URL.
echo.
set /p WEBSITE_API_URL="Enter website URL (press Enter for default): "
if "%WEBSITE_API_URL%"=="" set WEBSITE_API_URL=http://localhost:3000

echo.
echo ========================================
echo    Setup Complete!
echo ========================================
echo.
echo Groq API Key: %GROQ_API_KEY:~0,8%...
echo Website URL: %WEBSITE_API_URL%
echo.
echo To start the bot, run: start.bat
echo Or: set GROQ_API_KEY=%GROQ_API_KEY% ^&^& node index.js
echo.
pause
