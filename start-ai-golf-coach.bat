@echo off
REM AI Golf Coach — self-starting launcher for Windows.
REM Starts the production server and a public Cloudflare tunnel.
REM Add this script to Windows Task Scheduler (trigger: At log on) for auto-start.

cd /d "%~dp0"

REM 1. Start production server (auto-restart loop)
start "AI Golf Coach Server" cmd /c "node scripts\start-prod.mjs"

REM 2. Wait for server to be ready
timeout /t 8 /nobreak >nul

REM 3. Start public tunnel (quick tunnel; URL printed in the window)
start "AI Golf Coach Tunnel" cmd /c "cloudflared tunnel --url http://localhost:3000"

echo.
echo AI Golf Coach is starting.
echo Server:  http://localhost:3000
echo Tunnel:  see the "Tunnel" window for your public HTTPS URL
echo.
pause
