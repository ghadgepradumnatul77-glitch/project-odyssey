import { useState, type FormEvent } from 'react';
import { Check, Eye, EyeOff, Landmark, LockKeyhole } from 'lucide-react';
import { isApiClientError } from '../api/errors';
import { useAuth } from '../auth/useAuth';

function loginErrorMessage(error: unknown): string {
  if (!isApiClientError(error)) return 'Unable to sign in right now.';
  if (error.kind === 'network') return 'Unable to reach the JanSeva IntelliGov service.';
  if (error.kind === 'malformed_response') return 'Unable to process the authentication response.';
  if (error.status === 401) return 'Invalid email or password.';
  if (error.status === 429) return 'Too many login attempts. Please wait before trying again.';
  if (error.status === 400) return 'Enter a valid email and password.';
  return 'Unable to sign in right now.';
}

export default function LoginPage({onPublicReporting,onPublicTracking}:{onPublicReporting?:()=>void;onPublicTracking?:()=>void}) {
  const { login, authStatus, sessionMessage } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const busy = authStatus === 'authenticating';

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    if (!email.trim() || !password) {
      setError('Email and password are required.');
      return;
    }
    setError(null);
    try { await login(email.trim(), password); }
    catch (reason) { setError(loginErrorMessage(reason)); }
  }

  return (
    <main className="login-page">
      <section className="login-introduction" aria-labelledby="login-title">
        <div className="login-brand-mark"><Landmark aria-hidden="true" size={30} /><span>Public infrastructure operations</span></div>
        <p className="eyebrow">JANSEVA INTELLIGOV</p>
        <h1 id="login-title">Public Infrastructure<br />Decision Intelligence</h1>
        <p className="login-positioning">Decision Intelligence for Explainable &amp; Accountable Public Infrastructure</p>
        <p className="login-thesis">From infrastructure evidence to accountable action.</p>
        <ul className="login-capabilities" aria-label="Platform capabilities">
          {['Explainable prioritization', 'Human-governed decisions', 'Verifiable execution'].map((item) => <li key={item}><Check aria-hidden="true" size={16} />{item}</li>)}
        </ul>
      </section>
      <section className="login-panel" aria-labelledby="access-title">
        <div className="login-heading">
          <LockKeyhole aria-hidden="true" size={22} />
          <div><p className="section-label">AUTHORIZED PERSONNEL</p><h2 id="access-title">Secure Operations Access</h2></div>
        </div>
        {sessionMessage && <p className="notice" role="status">{sessionMessage}</p>}
        <form onSubmit={submit} noValidate>
          <label htmlFor="email">Government or organizational email</label>
          <input id="email" name="email" type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} disabled={busy} />
          <label htmlFor="password">Password</label>
          <div className="password-field"><input id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} disabled={busy} />
            <button type="button" onClick={() => setShowPassword((value) => !value)} disabled={busy} aria-label={showPassword ? 'Hide password' : 'Show password'} title={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff aria-hidden="true" size={18} /> : <Eye aria-hidden="true" size={18} />}</button></div>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="primary-button" type="submit" disabled={busy} aria-busy={busy}>{busy ? 'Authenticating…' : 'Sign in securely'}</button>
        </form>
        <p className="session-note">For security, this Phase 1 session ends when the browser page is refreshed or closed.</p>
        {onPublicReporting&&<button type="button" className="public-entry" onClick={onPublicReporting}>Report an infrastructure issue</button>}
        {onPublicTracking&&<button type="button" className="public-entry public-entry-secondary" onClick={onPublicTracking}>Track a submitted report</button>}
      </section>
    </main>
  );
}
