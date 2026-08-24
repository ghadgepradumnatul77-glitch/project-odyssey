import { z } from 'zod';

export const runtimeEnvironments = ['development', 'test', 'staging', 'production'] as const;
export type RuntimeEnvironment = (typeof runtimeEnvironments)[number];
export type TrustProxyConfig = false | 'loopback' | number;

export interface RuntimeConfig {
  environment: RuntimeEnvironment;
  port: number;
  databaseUrl: string;
  auth: { secret: string; issuer: string; audience: string; accessTtlSeconds: number };
  allowedOrigins: string[];
  trustProxy: TrustProxyConfig;
  apiPublicBaseUrl: string;
  webPublicBaseUrl: string;
  intelligence: { enabled: boolean; serviceUrl: string | null; timeoutMs: number };
}

export class ConfigurationError extends Error {
  constructor(public readonly key: string, detail: string) {
    super(`CONFIGURATION_INVALID: ${key} ${detail}`);
  }
}

const unsafeSecrets = new Set(['replace-this-in-development', 'replace-with-a-long-random-secret', 'replace-me', 'changeme', 'secret', 'password']);
const localDatabase = 'postgresql://postgres:postgres@localhost:5432/odyssey';
const testDatabase = 'postgresql://postgres:postgres@localhost:5432/odyssey_test';
const localApi = 'http://localhost:4000/api/v1';
const localWeb = 'http://localhost:5173';

function required(env: NodeJS.ProcessEnv, key: string): string {
  const value = env[key]?.trim();
  if (!value) throw new ConfigurationError(key, 'is required.');
  return value;
}
function integer(env: NodeJS.ProcessEnv, key: string, fallback: number, minimum: number, maximum: number): number {
  const value = Number(env[key] ?? fallback);
  if (!Number.isInteger(value) || value < minimum || value > maximum) throw new ConfigurationError(key, `must be an integer between ${minimum} and ${maximum}.`);
  return value;
}
function httpUrl(key: string, value: string, options: { originOnly?: boolean; forbidCredentials?: boolean } = {}): string {
  let parsed: URL;
  try { parsed = new URL(value); } catch { throw new ConfigurationError(key, 'must be a valid HTTP(S) URL.'); }
  if (!['http:', 'https:'].includes(parsed.protocol)) throw new ConfigurationError(key, 'must use HTTP or HTTPS.');
  if (options.forbidCredentials && (parsed.username || parsed.password)) throw new ConfigurationError(key, 'must not contain credentials.');
  if (options.originOnly && (parsed.pathname !== '/' || parsed.search || parsed.hash)) throw new ConfigurationError(key, 'must contain origins only, without paths, queries, or fragments.');
  return options.originOnly ? parsed.origin : parsed.toString().replace(/\/$/, '');
}
function boolean(env: NodeJS.ProcessEnv, key: string, fallback?: boolean): boolean {
  const raw = env[key]?.trim().toLowerCase();
  if (!raw && fallback !== undefined) return fallback;
  if (raw === 'true') return true;
  if (raw === 'false') return false;
  throw new ConfigurationError(key, 'must be true or false.');
}
function trustProxy(env: NodeJS.ProcessEnv, deployed: boolean): TrustProxyConfig {
  const raw = env.TRUST_PROXY?.trim().toLowerCase();
  if (!raw) {
    if (deployed) throw new ConfigurationError('TRUST_PROXY', 'is required in staging and production.');
    return false;
  }
  if (raw === 'false') return false;
  if (raw === 'loopback') return 'loopback';
  const hops = Number(raw);
  if (Number.isInteger(hops) && hops >= 1 && hops <= 10) return hops;
  throw new ConfigurationError('TRUST_PROXY', 'must be false, loopback, or a hop count from 1 to 10.');
}
function origins(env: NodeJS.ProcessEnv, deployed: boolean): string[] {
  const raw = env.ALLOWED_ORIGINS?.trim();
  if (!raw) {
    if (deployed) throw new ConfigurationError('ALLOWED_ORIGINS', 'is required in staging and production.');
    return [localWeb];
  }
  const values = raw.split(',').map(value => value.trim());
  if (!values.length || values.some(value => !value || value === '*')) throw new ConfigurationError('ALLOWED_ORIGINS', 'must be a comma-separated list of explicit origins.');
  return [...new Set(values.map(value => httpUrl('ALLOWED_ORIGINS', value, { originOnly: true, forbidCredentials: true })) )];
}

export function parseRuntimeConfig(env: NodeJS.ProcessEnv): RuntimeConfig {
  const environmentValue = env.NODE_ENV?.trim() || 'development';
  const parsedEnvironment = z.enum(runtimeEnvironments).safeParse(environmentValue);
  if (!parsedEnvironment.success) throw new ConfigurationError('NODE_ENV', `must be one of ${runtimeEnvironments.join(', ')}.`);
  const environment = parsedEnvironment.data;
  const deployed = environment === 'staging' || environment === 'production';
  const secret = deployed ? required(env, 'JWT_SECRET') : env.JWT_SECRET?.trim() || 'odyssey-development-only-secret-change-before-deployment';
  if (deployed && (secret.length < 32 || unsafeSecrets.has(secret.toLowerCase()) || /^replace-/i.test(secret))) throw new ConfigurationError('JWT_SECRET', 'must be a non-placeholder value of at least 32 characters.');
  const databaseUrl = deployed ? required(env, 'DATABASE_URL') : env.DATABASE_URL?.trim() || (environment === 'test' ? testDatabase : localDatabase);
  if (deployed && /localhost|127\.0\.0\.1|replace-|USER:PASSWORD/i.test(databaseUrl)) throw new ConfigurationError('DATABASE_URL', 'must be an explicit non-placeholder deployment database URL.');
  const apiPublicBaseUrl = deployed ? required(env, 'API_PUBLIC_BASE_URL') : env.API_PUBLIC_BASE_URL?.trim() || localApi;
  const webPublicBaseUrl = deployed ? required(env, 'WEB_PUBLIC_BASE_URL') : env.WEB_PUBLIC_BASE_URL?.trim() || localWeb;
  const intelligenceEnabled = boolean(env, 'ODYSSEY_INTELLIGENCE_ENABLED', deployed ? undefined : true);
  const configuredIntelligenceUrl = env.ODYSSEY_INTELLIGENCE_SERVICE_URL?.trim();
  if (intelligenceEnabled && deployed && !configuredIntelligenceUrl) throw new ConfigurationError('ODYSSEY_INTELLIGENCE_SERVICE_URL', 'is required when advisory intelligence is enabled.');
  const serviceUrl = intelligenceEnabled ? httpUrl('ODYSSEY_INTELLIGENCE_SERVICE_URL', configuredIntelligenceUrl || 'http://localhost:8000', { forbidCredentials: true }) : null;
  if (deployed && serviceUrl && /localhost|127\.0\.0\.1/.test(new URL(serviceUrl).hostname)) throw new ConfigurationError('ODYSSEY_INTELLIGENCE_SERVICE_URL', 'must not silently use a local deployment address.');
  return {
    environment,
    port: integer(env, 'API_PORT', 4000, 1, 65535),
    databaseUrl,
    auth: {
      secret,
      issuer: env.JWT_ISSUER?.trim() || 'project-odyssey-api',
      audience: env.JWT_AUDIENCE?.trim() || 'project-odyssey-clients',
      accessTtlSeconds: integer(env, 'JWT_ACCESS_TTL_SECONDS', 900, 60, 3600)
    },
    allowedOrigins: origins(env, deployed),
    trustProxy: trustProxy(env, deployed),
    apiPublicBaseUrl: httpUrl('API_PUBLIC_BASE_URL', apiPublicBaseUrl, { forbidCredentials: true }),
    webPublicBaseUrl: httpUrl('WEB_PUBLIC_BASE_URL', webPublicBaseUrl, { forbidCredentials: true }),
    intelligence: { enabled: intelligenceEnabled, serviceUrl, timeoutMs: integer(env, 'ODYSSEY_INTELLIGENCE_TIMEOUT_MS', 2000, 100, 10000) }
  };
}

let cached: RuntimeConfig | undefined;
export function getRuntimeConfig(): RuntimeConfig { return cached ??= parseRuntimeConfig(process.env); }
export function resetRuntimeConfigForTests(): void { cached = undefined; }
export function redactedRuntimeSummary(config: RuntimeConfig) {
  return { environment: config.environment, port: config.port, allowedOrigins: config.allowedOrigins, trustProxy: config.trustProxy, apiPublicBaseUrl: config.apiPublicBaseUrl, webPublicBaseUrl: config.webPublicBaseUrl, databaseConfigured: Boolean(config.databaseUrl), jwtConfigured: Boolean(config.auth.secret), intelligenceEnabled: config.intelligence.enabled, intelligenceServiceOrigin: config.intelligence.serviceUrl ? new URL(config.intelligence.serviceUrl).origin : null };
}
export function isCorsOriginAllowed(config: RuntimeConfig, origin: string | undefined): boolean { return !origin || config.allowedOrigins.includes(origin); }
