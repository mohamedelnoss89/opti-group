@echo off
chcp 65001 >nul
title OptiSize WhatsApp Bot

echo ========================================
echo    OptiSize WhatsApp Bot v3.0
echo    Groq AI + Website API Integration
echo ========================================
echo.

:: Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo Download from: https://nodejs.org/
    pause
    exit /b 1
)

:: Check if dependencies are installed
if not exist "node_modules" (
    echo [INFO] Installing dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install dependencies!
        pause
        exit /b 1
    )
    echo.
)

:: Set environment variables
if "%GROQ_API_KEY%"=="" (
    echo [WARNING] GROQ_API_KEY not set!
    echo Set it with: set GROQ_API_KEY=your_key_here
    echo.
)

if "%WEBSITE_API_URL%"=="" (
    echo [INFO] Using default website URL: http://localhost:3000
    echo To change: set WEBSITE_API_URL=https://your-site.com
    echo.
)

:: Start the bot
echo [START] Starting OptiSize Bot...
echo.
node index.js

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Bot crashed! Check the error above.
    pause
)
