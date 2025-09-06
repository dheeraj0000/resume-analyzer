import React, { useEffect, useState } from 'react';
import { getHistory, getResume } from './api';

export default function HistoryTab() {
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);

  useEffect(()=>{ load(); }, []);

  async function load() {
    const data = await getHistory();
    setRows(data);
  }

  async function openDetails(id) {
    setSelected(id);
    const d = await getResume(id);
    setDetail(d);
  }

  return (
    <div className="card">
      <h2>History</h2>
      <table className="history">
        <thead><tr><th>Name</th><th>Email</th><th>File</th><th>Rating</th><th>When</th><th>Action</th></tr></thead>
        <tbody>
          {rows.map(r=>(
            <tr key={r.id}>
              <td>{r.name || '-'}</td>
              <td>-</td>
              <td>{r.file_name}</td>
              <td>{r.rating || '-'}</td>
              <td>{new Date(r.created_at).toLocaleString()}</td>
              <td><button onClick={()=>openDetails(r.id)}>Details</button></td>
            </tr>
          ))}
        </tbody>
      </table>

      {detail && <div className="modal">
        <div className="modal-content">
          <button className="close" onClick={()=>{ setDetail(null); setSelected(null); }}>×</button>
          <h3>Resume #{detail.id} - {detail.file_name}</h3>
          <pre style={{whiteSpace:'pre-wrap'}}>{JSON.stringify(detail.structured, null, 2)}</pre>
        </div>
      </div>}
    </div>
  );
}
