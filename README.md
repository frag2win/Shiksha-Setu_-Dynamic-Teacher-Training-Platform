# Shiksha-Setu: Dynamic Teacher Training Platform

A GenAI-powered platform that transforms standard teacher training manuals into personalized, context-aware micro-learning modules for government school teachers across India.

## Project Overview

Shiksha-Setu addresses the critical challenge of "one-size-fits-all" teacher training by leveraging RAG (Retrieval-Augmented Generation) to adapt state-level training materials for hyper-local classroom realities.

### Key Features

- **Smart Manual Ingestion**: Upload PDF training manuals with RAG-based indexing
- **Cluster Profile Builder**: Define school clusters by language, infrastructure, and challenges
- **AI Pedagogical Adaptation**: Generate context-specific training modules using Groq (Llama 3)
- **Side-by-Side Comparison**: Review original vs. adapted content before distribution
- **Multilingual Support**: Translate modules into regional languages
- **WhatsApp Integration**: Distribute bite-sized content directly to teachers

## Documentation

All product requirements and technical specifications are available in the `/PRD` folder:

- [Product Requirements Document](PRD/Shiksha-Setu_Product_Requirements_Document.md)
- [Developer Checklist](PRD/Shiksha-Setu_Developer_Checklist.md)
- [AI Prompts & Demo Script](PRD/Shiksha-Setu_AI_Prompts_and_Demo.md)

## Tech Stack

**Backend:**
- Python (FastAPI/Flask)
- ChromaDB (Vector Database)
- Groq API (Llama 3)
- SQLite (Cluster Profiles)

**Frontend:**
- React/Next.js
- Split-screen comparison interface
- PDF viewer integration

## Prerequisites

Before starting, ensure you have the following installed:
- **Python 3.10+** (for backend)
- **Node.js 18+** (for frontend) - [Download here](https://nodejs.org/)
- **Git** (for version control)

## Getting Started

### Backend Setup

1. Navigate to backend folder:
```powershell
cd backend
```

2. Create and activate virtual environment:
```powershell
python -m venv venv
venv\Scripts\Activate.ps1
```

3. Install dependencies:
```powershell
pip install -r requirements.txt
```

4. Set up environment variables:
```powershell
copy .env.example .env
```
Edit `.env` and add your `GROQ_API_KEY`

5. Run the server:
```powershell
python main.py
```

Backend will be available at http://localhost:8000

### Frontend Setup

1. Navigate to frontend folder:
```powershell
cd frontend
```

2. Install dependencies:
```powershell
npm install
```

3. Run development server:
```powershell
npm run dev
```

Frontend will be available at http://localhost:3000

For Windows-specific issues, see [WINDOWS_SETUP.md](WINDOWS_SETUP.md)

### Quick Start (All Platforms)

Use the provided startup scripts to launch both servers at once:

**Windows (PowerShell):**
```powershell
.\start.ps1
```

**Windows (Command Prompt):**
```cmd
start.bat
```

**Linux/Mac:**
```bash
chmod +x start.sh
./start.sh
```

## Contributing

Please read [copilot-instructions.md](.github/copilot-instructions.md) for coding standards and documentation guidelines.

## Project Status

Status: Build Ready / Hackathon Final  
Version: 1.2  
Last Updated: January 12, 2026

## License

To be determined
