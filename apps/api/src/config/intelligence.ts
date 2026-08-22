export interface IntelligenceConfig { serviceUrl: string; timeoutMs: number; }

export function getIntelligenceConfig(): IntelligenceConfig {
  const rawUrl = process.env.ODYSSEY_INTELLIGENCE_SERVICE_URL?.trim() || 'http://localhost:8000';
  let url: URL;
  try { url = new URL(rawUrl); } catch { throw new Error('ODYSSEY_INTELLIGENCE_SERVICE_URL must be a valid HTTP(S) URL.'); }
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) throw new Error('ODYSSEY_INTELLIGENCE_SERVICE_URL must be an HTTP(S) URL without credentials.');
  const timeoutMs = Number(process.env.ODYSSEY_INTELLIGENCE_TIMEOUT_MS || 2000);
  if (!Number.isInteger(timeoutMs) || timeoutMs < 100 || timeoutMs > 10000) throw new Error('ODYSSEY_INTELLIGENCE_TIMEOUT_MS must be an integer between 100 and 10000.');
  return { serviceUrl: url.toString().replace(/\/$/, ''), timeoutMs };
}
