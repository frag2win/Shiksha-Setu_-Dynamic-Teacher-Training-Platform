# Shiksha-Setu Backend

FastAPI-based backend for the Dynamic Teacher Training Platform.

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
```

2. Activate the virtual environment:
```bash
# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create `.env` file:
```bash
copy .env.example .env
```

5. Add your API keys to the `.env` file

6. Run the server:
```bash
python main.py
```

The API will be available at `http://localhost:8000`

API documentation: `http://localhost:8000/docs`

## Project Structure

```
backend/
├── main.py              # FastAPI application entry point
├── config.py            # Configuration management
├── requirements.txt     # Python dependencies
├── .env.example        # Environment variables template
├── models/             # Database models
├── routers/            # API route handlers
├── services/           # Business logic
└── utils/              # Utility functions
```
