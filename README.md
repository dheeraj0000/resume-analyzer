# Resume Analyzer - Full Stack Project

This repository contains a full-stack Resume Analyzer application (React frontend + Node/Express backend + PostgreSQL).

**What it does**
- Upload a PDF resume and receive structured extraction + AI feedback.
- Stores analyses in PostgreSQL.
- Historical viewer to browse previous analyses.

**Disclaimer**
This project includes a *placeholder* Gemini/LLM integration. You'll need to provide API credentials and may need to adapt the request code to the exact Gemini API you have access to (instructions below).

## Folder structure

- backend/ - Node.js + Express backend
- frontend/ - React frontend
- sample_data/ - place a few PDF resumes here for testing (not provided)
- screenshots/ - add screenshots of the UI here

## Setup (local)

Prerequisites:
- Node.js >= 18, npm
- PostgreSQL
- (Optional) ngrok for local HTTPS testing if needed

### 1) Database

Create a PostgreSQL database and run this SQL to create the table:

```sql
CREATE TABLE resumes (
  id SERIAL PRIMARY KEY,
  file_name TEXT NOT NULL,
  parsed_text TEXT,
  structured jsonb,
  rating NUMERIC,
  created_at TIMESTAMP DEFAULT NOW()
);
```

Set environment variables (you can create a `.env` in backend/):
- `DATABASE_URL` - e.g. `postgresql://user:pass@localhost:5432/resumadb`
- `PORT` - backend port (default 4000)
- `GEMINI_API_KEY` - (or your LLM API key)
- `GEMINI_MODEL` - model name if required

### 2) Backend

```
cd backend
npm install
npm run dev
```

Endpoints:
- `POST /api/upload` - multipart/form-data `file` (PDF). Returns structured analysis JSON.
- `GET /api/history` - returns list of previous analyses (id, name, rating, created_at).
- `GET /api/resume/:id` - full stored analysis for id.

### 3) Frontend

```
cd frontend
npm install
npm start
```

### Notes on Gemini / LLM
The backend contains a helper `llm.js` with a placeholder function `callGemini(prompt)` which you should adapt to your access method for Google Gemini (or swap to OpenAI). The function expects an API key in `GEMINI_API_KEY`.

### Deployment
- Deploy backend to any Node host (Heroku, Railway, Render).
- Set `DATABASE_URL` appropriately.
- Serve frontend via Vercel/Netlify and point API requests to the deployed backend.

If you want help deploying it (e.g., creating a Render app), tell me and I will provide step-by-step instructions.

---


