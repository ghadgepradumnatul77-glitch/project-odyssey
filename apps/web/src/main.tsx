import React from 'react';
import ReactDOM from 'react-dom/client';
import { ShieldCheck, Activity, ClipboardList } from 'lucide-react';
import './styles.css';

function App() {
  return (
    <main className="shell">
      <section className="hero">
        <div className="eyebrow">PROJECT ODYSSEY</div>
        <h1>Operations Center</h1>
        <p>Phase-1 foundation is running. The next build will add identity, bridge assets and case lifecycle.</p>
      </section>

      <section className="grid">
        <article className="card"><Activity size={22}/><h2>API</h2><p>Health endpoint: <code>/api/v1/health</code></p></article>
        <article className="card"><ShieldCheck size={22}/><h2>Governance-first</h2><p>Rules, evidence and human authority remain separate from AI.</p></article>
        <article className="card"><ClipboardList size={22}/><h2>Next</h2><p>BUILD 002: users, roles, departments, jurisdictions and bridge registry.</p></article>
      </section>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
