#!/bin/bash

echo "Starting Shiksha-Setu - Dynamic Teacher Training Platform"
echo "=========================================================="

# Start Backend
echo ""
echo "Starting Backend Server..."
cd backend

# Activate virtual environment and start server
if [ -f "venv/bin/activate" ]; then
    source venv/bin/activate
    python main.py &
    BACKEND_PID=$!
    echo "Backend started (PID: $BACKEND_PID) at http://localhost:8000"
else
    echo "Error: Virtual environment not found. Run setup first."
    exit 1
fi

cd ..

# Start Frontend
echo ""
echo "Starting Frontend Server..."
cd frontend

if [ -f "package.json" ]; then
    npm run dev &
    FRONTEND_PID=$!
    echo "Frontend started (PID: $FRONTEND_PID) at http://localhost:3000"
else
    echo "Error: package.json not found. Run 'npm install' first."
    exit 1
fi

cd ..

echo ""
echo "=========================================================="
echo "Both servers are running!"
echo "Backend:  http://localhost:8000"
echo "Frontend: http://localhost:3000"
echo "API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop both servers"
echo "=========================================================="

# Wait for background processes
wait
