const express = require('express');
const multer = require('multer');
const pdf = require('pdf-parse');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { Pool } = require('pg');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const upload = multer({ dest: 'uploads/' });

/**
 * Helper: Call Gemini or other LLM
 * NOTE: This is a placeholder. Adapt to the exact API you have access to.
 */
async function callGemini(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    // For offline / testing, return a mocked response structure
    return {
      personal: { name: "John Doe", email: "john@example.com", phone: "1234567890", linkedin: "" },
      summary: "Experienced software engineer...",
      experience: [],
      education: [],
      projects: [],
      certifications: [],
      technical_skills: ["JavaScript", "React", "Node.js"],
      soft_skills: ["Communication", "Teamwork"],
      rating: 7.5,
      improvements: ["Add measurable achievements", "Quantify results"],
      upskill_suggestions: ["TypeScript", "System Design"]
    };
  }

  const model = process.env.GEMINI_MODEL || 'gemini-1.0';
  const url = process.env.GEMINI_ENDPOINT || 'https://api.example-gemini.com/v1/generate';
  const body = {
    model,
    prompt,
    max_output_tokens: 800
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error('LLM API error: ' + txt);
  }

  const data = await res.json();
  const output = data.output_text || data.result || JSON.stringify(data);

  try {
    const parsed = JSON.parse(output);
    return parsed;
  } catch (err) {
    return { raw: output };
  }
}

// Upload and analyze endpoint
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    if (req.file.mimetype !== 'application/pdf') {
      const ext = path.extname(req.file.originalname).toLowerCase();
      if (ext !== '.pdf') {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ error: 'Only PDF files are allowed' });
      }
    }

    const dataBuffer = fs.readFileSync(req.file.path);
    const pdfData = await pdf(dataBuffer);
    const text = pdfData.text || '';

    const prompt = `
Extract the following fields from the resume text delimited by triple backticks.
Return a JSON object with keys:
- personal: { name, email, phone, linkedin, portfolio }
- summary
- experience: [{title, company, start_date, end_date, description}]
- education: [{degree, institution, start_date, end_date}]
- projects: [{name, description, tech_stack}]
- certifications: [{name, issuer, year}]
- technical_skills: [ ... ]
- soft_skills: [ ... ]
- rating: number (1-10)
- improvements: [ ... ]
- upskill_suggestions: [ ... ]

Resume Text:
\`\`\`
${text}
\`\`\`
Respond with ONLY valid JSON.
`;

    let llmResult;
    try {
      llmResult = await callGemini(prompt);
    } catch (err) {
      console.error('LLM error', err);
      llmResult = { raw: 'LLM failed: ' + String(err) };
    }

    const insertQuery =
      "INSERT INTO resumes (file_name, parsed_text, structured, rating) VALUES ($1, $2, $3, $4) RETURNING id, created_at";
    const rating = (llmResult && llmResult.rating) ? llmResult.rating : null;
    const structured = llmResult || {};
    const result = await pool.query(insertQuery, [
      req.file.originalname,
      text,
      structured,
      rating
    ]);

    fs.unlinkSync(req.file.path);

    res.json({
      id: result.rows[0].id,
      created_at: result.rows[0].created_at,
      structured
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error', details: String(err) });
  }
});

// History endpoint
app.get('/api/history', async (req, res) => {
  try {
    const q = await pool.query(
      "SELECT id, file_name, (structured->'personal'->>'name') as name, rating, created_at FROM resumes ORDER BY created_at DESC"
    );

    res.json(q.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: String(err) });
  }
});

// Resume detail
app.get('/api/resume/:id', async (req, res) => {
  try {
    const q = await pool.query(
      "SELECT * FROM resumes WHERE id=$1",
      [req.params.id]
    );
    if (q.rowCount === 0)
      return res.status(404).json({ error: 'Not found' });
    res.json(q.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: String(err) });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log('Server started on port', PORT));
