import { useState, type FormEvent } from 'react';
import { Landmark, LockKeyhole } from 'lucide-react';
import { isApiClientError } from '../api/errors';
import { useAuth } from '../auth/useAuth';

function loginErrorMessage(error: unknown): string {
  if (!isApiClientError(error)) return 'Unable to sign in right now.';
  if (error.kind === 'network') return 'Unable to reach the Odyssey API.';
  if (error.kind === 'malformed_response') return 'Unable to process the authentication response.';
  if (error.status === 401) return 'Invalid email or password.';
  if (error.status === 429) return 'Too many login attempts. Please wait before trying again.';
  if (error.status === 400) return 'Enter a valid email and password.';
  return 'Unable to sign in right now.';
}

export default function LoginPage() {
  const { login, authStatus, sessionMessage } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const busy = authStatus === 'authenticating';

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
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
        <Landmark aria-hidden="true" size={30} />
        <p className="eyebrow">PROJECT ODYSSEY</p>
        <h1 id="login-title">Infrastructure Decision &amp; Accountability Platform</h1>
        <p>Secure access to evidence-led infrastructure workflows, human decisions, and accountable execution.</p>
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
          <input id="password" name="password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} disabled={busy} />
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="primary-button" type="submit" disabled={busy} aria-busy={busy}>{busy ? 'Signing in…' : 'Sign in securely'}</button>
        </form>
        <p className="session-note">For security, this Phase 1 session ends when the browser page is refreshed or closed.</p>
      </section>
    </main>
  );
}
