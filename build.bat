@echo off
cd c:\dev\Pomodoro
echo ==================== npm install ====================
call npm install
echo.
echo ==================== npm run build ====================
call npm run build
echo.
echo ==================== npm test ====================
call npm test
