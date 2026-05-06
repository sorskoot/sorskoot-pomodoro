@echo off
REM Build and Test Script for Pomodoro App
REM Run this script from the Command Prompt (cmd.exe) or PowerShell

cd /d c:\dev\Pomodoro

echo.
echo ================================================================================
echo POMODORO APP - BUILD AND TEST RUNNER
echo ================================================================================
echo.

echo [1/3] Running npm install...
echo ================================================================================
call npm install
if errorlevel 1 (
    echo ERROR: npm install failed with return code %errorlevel%
    goto error
)
echo.
echo ✓ npm install completed successfully
echo.

echo [2/3] Running npm run build...
echo ================================================================================
call npm run build
if errorlevel 1 (
    echo ERROR: npm run build failed with return code %errorlevel%
    goto error
)
echo.
echo ✓ npm run build completed successfully
echo.

echo [3/3] Running npm test...
echo ================================================================================
call npm test
if errorlevel 1 (
    echo ERROR: npm test failed with return code %errorlevel%
    goto error
)
echo.
echo ✓ npm test completed successfully
echo.

echo ================================================================================
echo ALL TASKS COMPLETED SUCCESSFULLY ✓
echo ================================================================================
echo.
goto end

:error
echo.
echo ================================================================================
echo ERRORS DETECTED - See output above for details
echo ================================================================================
pause
exit /b 1

:end
pause
