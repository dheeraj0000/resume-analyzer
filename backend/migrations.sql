-- Run this in your Postgres database
CREATE TABLE IF NOT EXISTS resumes (
  id SERIAL PRIMARY KEY,
  file_name TEXT NOT NULL,
  parsed_text TEXT,
  structured JSONB,
  rating NUMERIC,
  created_at TIMESTAMP DEFAULT NOW()
);
