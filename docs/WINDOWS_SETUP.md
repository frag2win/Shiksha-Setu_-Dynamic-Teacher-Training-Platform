# Quick Start Guide for Windows

## For PowerShell Execution Policy Issues

If you encounter "running scripts is disabled" error, you have two options:

### Option 1: Bypass Policy (Temporary)
```powershell
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
```

### Option 2: Use Command Prompt Instead
Use `cmd` instead of PowerShell for activation:
```cmd
backend\venv\Scripts\activate.bat
```

## Backend Setup (Windows)

```powershell
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate (PowerShell - after setting execution policy)
venv\Scripts\activate

# OR Activate (Command Prompt)
venv\Scripts\activate.bat

# Upgrade pip
python -m pip install --upgrade pip

# Install dependencies
pip install -r requirements.txt

# Copy environment file
copy .env.example .env

# Edit .env and add your GROQ_API_KEY

# Run the server
python main.py
```

## Frontend Setup (Windows)

Open a new terminal:

```powershell
cd frontend
npm install
npm run dev
```

## Verify Installation

Backend: http://localhost:8000
Frontend: http://localhost:3000

API Docs: http://localhost:8000/docs
