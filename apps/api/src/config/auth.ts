const DEFAULT_ISSUER = 'project-odyssey-api';
const DEFAULT_AUDIENCE = 'project-odyssey-clients';
const DEFAULT_TTL_SECONDS = 900;
const DEVELOPMENT_SECRET = 'odyssey-development-only-secret-change-before-deployment';
const UNSAFE_SECRETS = new Set([
  'replace-this-in-development',
  'replace-me',
  'changeme',
  'secret',
  'password'
]);

export interface AuthConfig {
  secret: Uint8Array;
  issuer: string;
  audience: string;
  accessTtlSeconds: number;
}

let cachedConfig: AuthConfig | undefined;

export function getAuthConfig(): AuthConfig {
  if (cachedConfig) return cachedConfig;

  const environment = process.env.NODE_ENV || 'development';
  const configuredSecret = process.env.JWT_SECRET?.trim();
  const isProduction = environment === 'production';

  if (isProduction && (!configuredSecret || UNSAFE_SECRETS.has(configuredSecret.toLowerCase()) || configuredSecret.length < 32)) {
    throw new Error('JWT_SECRET must be configured with a non-placeholder value of at least 32 characters in production.');
  }

  const secret = configuredSecret && !UNSAFE_SECRETS.has(configuredSecret.toLowerCase())
    ? configuredSecret
    : DEVELOPMENT_SECRET;
  const ttl = Number(process.env.JWT_ACCESS_TTL_SECONDS || DEFAULT_TTL_SECONDS);
  if (!Number.isInteger(ttl) || ttl < 60 || ttl > 3600) {
    throw new Error('JWT_ACCESS_TTL_SECONDS must be an integer between 60 and 3600.');
  }

  cachedConfig = {
    secret: new TextEncoder().encode(secret),
    issuer: process.env.JWT_ISSUER?.trim() || DEFAULT_ISSUER,
    audience: process.env.JWT_AUDIENCE?.trim() || DEFAULT_AUDIENCE,
    accessTtlSeconds: ttl
  };
  return cachedConfig;
}

export function resetAuthConfigForTests(): void {
  cachedConfig = undefined;
}
