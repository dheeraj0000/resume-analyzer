import React, { useState } from 'react';
import { uploadResume } from './api';

export default function UploadTab() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    if(!file) return setError('Select a PDF file first');
    setLoading(true);
    setError(null);
    try {
      const data = await uploadResume(file);
      setResult(data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>Upload Resume (PDF)</h2>
      <form onSubmit={onSubmit}>
        <input type="file" accept="application/pdf" onChange={e=>setFile(e.target.files[0])} />
        <button type="submit" disabled={loading}>{loading ? 'Analyzing...' : 'Upload & Analyze'}</button>
      </form>

      {error && <div className="error">{error}</div>}

      {result && (
        <div className="result">
          <h3>Analysis Result</h3>
          <p><strong>ID:</strong> {result.id}</p>
          <p><strong>Created:</strong> {result.created_at}</p>

          <h4>Personal</h4>
          <pre>{JSON.stringify(result.structured.personal || {}, null, 2)}</pre>

          <h4>Summary</h4>
          <p>{result.structured.summary || result.structured.raw || 'No summary'}</p>

          <h4>Skills</h4>
          <p><strong>Technical:</strong> {(result.structured.technical_skills||[]).join(', ')}</p>
          <p><strong>Soft:</strong> {(result.structured.soft_skills||[]).join(', ')}</p>

          <h4>AI Feedback</h4>
          <p><strong>Rating:</strong> {result.structured.rating || 'N/A'}</p>
          <p><strong>Improvements:</strong></p>
          <ul>{(result.structured.improvements||[]).map((i,idx)=><li key={idx}>{i}</li>)}</ul>

          <h4>Upskill Suggestions</h4>
          <ul>{(result.structured.upskill_suggestions||[]).map((i,idx)=><li key={idx}>{i}</li>)}</ul>
        </div>
      )}
    </div>
  );
}
