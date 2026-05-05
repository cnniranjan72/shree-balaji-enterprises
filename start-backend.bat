@echo off
echo ========================================
echo  Starting GST Billing System - Backend
echo ========================================
echo.

cd backend

echo Checking virtual environment...
if not exist "venv\" (
    echo Creating virtual environment...
    python -m venv venv
)

echo Activating virtual environment...
call venv\Scripts\activate

echo Installing dependencies...
pip install -r requirements.txt --quiet

echo.
echo ========================================
echo  Backend Starting on http://localhost:8000
echo  API Docs: http://localhost:8000/docs
echo ========================================
echo.

python run.py
