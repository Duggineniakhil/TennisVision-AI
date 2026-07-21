@echo off
echo Starting TennisVision-AI Backend...

cd /d "%~dp0"
call ..\venv\Scripts\activate.bat

echo Virtual environment activated. Starting FastAPI...
python -m uvicorn app.main:app --reload --port 8000
