import { CheckCircle2, Code2, Server } from 'lucide-react';
import { API_BASE_URL } from './config/env';

export default function App() {
  return (
    <main className="shell">
      <header className="masthead">
        <p className="eyebrow">PROJECT ODYSSEY</p>
        <h1>Frontend foundation ready</h1>
        <p className="summary">
          A secure, accessible foundation for public-infrastructure decision support and human accountability.
        </p>
      </header>

      <section className="status-panel" aria-labelledby="foundation-status">
        <div>
          <p className="section-label">FOUNDATION STATUS</p>
          <h2 id="foundation-status">Build system configured</h2>
        </div>
        <span className="status-badge"><CheckCircle2 aria-hidden="true" size={18} /> Ready</span>
      </section>

      <section className="foundation-grid" aria-label="Frontend foundation details">
        <article className="foundation-card">
          <Code2 aria-hidden="true" size={22} />
          <h2>Application stack</h2>
          <p>React, strict TypeScript, and Vite provide the browser application foundation.</p>
        </article>
        <article className="foundation-card">
          <Server aria-hidden="true" size={22} />
          <h2>API configuration</h2>
          <p>Configured through <code>VITE_API_BASE_URL</code>.</p>
          <p className="endpoint" aria-label={`Configured API endpoint ${API_BASE_URL}`}>{API_BASE_URL}</p>
        </article>
      </section>
    </main>
  );
}
