import { parseRuntimeConfig } from './runtime';

export interface AuthConfig {
  secret: Uint8Array;
  issuer: string;
  audience: string;
  accessTtlSeconds: number;
}

let cachedConfig: AuthConfig | undefined;

export function getAuthConfig(): AuthConfig {
  if (cachedConfig) return cachedConfig;

  const runtime = parseRuntimeConfig(process.env);

  cachedConfig = {
    secret: new TextEncoder().encode(runtime.auth.secret),
    issuer: runtime.auth.issuer,
    audience: runtime.auth.audience,
    accessTtlSeconds: runtime.auth.accessTtlSeconds
  };
  return cachedConfig;
}

export function resetAuthConfigForTests(): void {
  cachedConfig = undefined;
}
