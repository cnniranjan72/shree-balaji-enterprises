@echo off
echo ========================================
echo  Starting GST Billing System - Frontend
echo ========================================
echo.

cd frontend

echo Checking node_modules...
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
) else (
    echo Dependencies already installed.
)

echo.
echo ========================================
echo  Frontend Starting on http://localhost:3000
echo ========================================
echo.

call npm run dev
