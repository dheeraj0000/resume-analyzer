import React, { useState } from 'react';
import UploadTab from './UploadTab';
import HistoryTab from './HistoryTab';

export default function App() {
  const [active, setActive] = useState('upload');

  return (
    <div className="container">
      <header>
        <h1>Resume Analyzer</h1>
        <nav>
          <button className={active==='upload' ? 'active' : ''} onClick={()=>setActive('upload')}>Live Analysis</button>
          <button className={active==='history' ? 'active' : ''} onClick={()=>setActive('history')}>History</button>
        </nav>
      </header>

      <main>
        {active==='upload' ? <UploadTab /> : <HistoryTab />}
      </main>


    </div>
  );
}
