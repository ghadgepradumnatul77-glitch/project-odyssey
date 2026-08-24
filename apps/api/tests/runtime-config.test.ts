import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { ConfigurationError, isCorsOriginAllowed, parseRuntimeConfig, redactedRuntimeSummary } from '../src/config/runtime';

const deployed = (overrides: NodeJS.ProcessEnv = {}): NodeJS.ProcessEnv => ({
  NODE_ENV: 'production',
  DATABASE_URL: 'postgresql://odyssey:injected@database.internal:5432/odyssey',
  JWT_SECRET: 'deployment-secret-with-at-least-thirty-two-characters',
  ALLOWED_ORIGINS: 'https://app.example.gov.in',
  API_PUBLIC_BASE_URL: 'https://api.example.gov.in/api/v1',
  WEB_PUBLIC_BASE_URL: 'https://app.example.gov.in',
  TRUST_PROXY: 'loopback',
  ODYSSEY_INTELLIGENCE_ENABLED: 'false',
  ...overrides
});

describe('central runtime configuration', () => {
  it('applies environment-scoped development and test defaults', () => {
    const development = parseRuntimeConfig({ NODE_ENV: 'development' });
    expect(development).toMatchObject({ environment: 'development', port: 4000, allowedOrigins: ['http://localhost:5173'], trustProxy: false });
    expect(development.intelligence).toMatchObject({ enabled: true, serviceUrl: 'http://localhost:8000' });
    const test = parseRuntimeConfig({ NODE_ENV: 'test' });
    expect(test.databaseUrl).toContain('odyssey_test');
    expect(test.trustProxy).toBe(false);
  });

  it.each(['preview', 'e2e', 'PRODUCTION'])('rejects unknown environment %s', NODE_ENV => {
    expect(() => parseRuntimeConfig({ NODE_ENV })).toThrow(/NODE_ENV/);
  });

  it.each([
    ['JWT_SECRET', { JWT_SECRET: undefined }],
    ['JWT_SECRET', { JWT_SECRET: '   ' }],
    ['JWT_SECRET', { JWT_SECRET: 'replace-with-a-long-random-secret' }],
    ['DATABASE_URL', { DATABASE_URL: undefined }],
    ['DATABASE_URL', { DATABASE_URL: 'postgresql://localhost/odyssey' }],
    ['ALLOWED_ORIGINS', { ALLOWED_ORIGINS: undefined }],
    ['API_PUBLIC_BASE_URL', { API_PUBLIC_BASE_URL: undefined }],
    ['WEB_PUBLIC_BASE_URL', { WEB_PUBLIC_BASE_URL: undefined }],
    ['TRUST_PROXY', { TRUST_PROXY: undefined }],
    ['ODYSSEY_INTELLIGENCE_ENABLED', { ODYSSEY_INTELLIGENCE_ENABLED: undefined }]
  ])('fails production closed for %s', (key, overrides) => {
    expect(() => parseRuntimeConfig(deployed(overrides))).toThrow(new RegExp(key));
  });

  it('parses multiple explicit origins and rejects malformed or wildcard origins', () => {
    const config = parseRuntimeConfig(deployed({ ALLOWED_ORIGINS: 'https://one.example.gov.in, https://two.example.gov.in' }));
    expect(config.allowedOrigins).toEqual(['https://one.example.gov.in', 'https://two.example.gov.in']);
    expect(isCorsOriginAllowed(config, 'https://one.example.gov.in')).toBe(true);
    expect(isCorsOriginAllowed(config, 'https://unknown.example.gov.in')).toBe(false);
    expect(isCorsOriginAllowed(config, undefined)).toBe(true);
    for (const ALLOWED_ORIGINS of ['*', 'not-a-url', 'https://app.example.gov.in/path']) expect(() => parseRuntimeConfig(deployed({ ALLOWED_ORIGINS }))).toThrow(/ALLOWED_ORIGINS/);
  });

  it.each([['false', false], ['loopback', 'loopback'], ['2', 2]] as const)('maps trusted proxy value %s', (value, expected) => {
    expect(parseRuntimeConfig(deployed({ TRUST_PROXY: value })).trustProxy).toBe(expected);
  });

  it.each(['true', 'all', '0', '11', 'private'])('rejects unsafe trusted proxy value %s', value => {
    expect(() => parseRuntimeConfig(deployed({ TRUST_PROXY: value }))).toThrow(/TRUST_PROXY/);
  });

  it('requires an explicit non-local advisory URL only when enabled in production', () => {
    const disabled = parseRuntimeConfig(deployed());
    expect(disabled.intelligence).toEqual({ enabled: false, serviceUrl: null, timeoutMs: 2000 });
    expect(() => parseRuntimeConfig(deployed({ ODYSSEY_INTELLIGENCE_ENABLED: 'true' }))).toThrow(/ODYSSEY_INTELLIGENCE_SERVICE_URL/);
    expect(() => parseRuntimeConfig(deployed({ ODYSSEY_INTELLIGENCE_ENABLED: 'true', ODYSSEY_INTELLIGENCE_SERVICE_URL: 'http://localhost:8000' }))).toThrow(/ODYSSEY_INTELLIGENCE_SERVICE_URL/);
    expect(parseRuntimeConfig(deployed({ ODYSSEY_INTELLIGENCE_ENABLED: 'true', ODYSSEY_INTELLIGENCE_SERVICE_URL: 'https://advisory.internal' })).intelligence.enabled).toBe(true);
  });

  it('never echoes supplied secrets in configuration errors or summaries', () => {
    const supplied = 'sensitive-database-credential';
    let error: unknown;
    try { parseRuntimeConfig(deployed({ DATABASE_URL: `postgresql://${supplied}@localhost:5432/odyssey` })); } catch (value) { error = value; }
    expect(error).toBeInstanceOf(ConfigurationError);
    expect(String(error)).not.toContain(supplied);
    const summary = JSON.stringify(redactedRuntimeSummary(parseRuntimeConfig(deployed())));
    expect(summary).not.toContain('deployment-secret');
    expect(summary).not.toContain('postgresql://');
  });

  it('prevents the actual destructive browser-test helper from running in production', () => {
    const helper = resolve(__dirname, '../../../scripts/c6-e2e-environment.mjs');
    const result = spawnSync(process.execPath, [helper, 'url'], { encoding: 'utf8', env: { ...process.env, NODE_ENV: 'production' } });
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain('TEST_HELPER_FORBIDDEN_IN_PRODUCTION');
  });

  it('keeps weather disabled by default and permits only explicit local evaluation',()=>{expect(parseRuntimeConfig({NODE_ENV:'test'}).weatherProvider).toMatchObject({enabled:false,provider:'OPEN_METEO',deploymentClass:'DISABLED',baseUrl:'https://api.open-meteo.com'});expect(parseRuntimeConfig({NODE_ENV:'test',ODYSSEY_WEATHER_PROVIDER_ENABLED:'true',ODYSSEY_WEATHER_PROVIDER_DEPLOYMENT_CLASS:'EVALUATION_ONLY'}).weatherProvider.enabled).toBe(true)});

  it('fails closed for arbitrary provider endpoints, mismatched classification, and deployed evaluation',()=>{expect(()=>parseRuntimeConfig({NODE_ENV:'test',ODYSSEY_WEATHER_PROVIDER_BASE_URL:'http://localhost:9000'})).toThrow(/ODYSSEY_WEATHER_PROVIDER_BASE_URL/);expect(()=>parseRuntimeConfig({NODE_ENV:'test',ODYSSEY_WEATHER_PROVIDER_ENABLED:'true',ODYSSEY_WEATHER_PROVIDER_DEPLOYMENT_CLASS:'DISABLED'})).toThrow(/ODYSSEY_WEATHER_PROVIDER_DEPLOYMENT_CLASS/);expect(()=>parseRuntimeConfig(deployed({ODYSSEY_WEATHER_PROVIDER_ENABLED:'true',ODYSSEY_WEATHER_PROVIDER_DEPLOYMENT_CLASS:'EVALUATION_ONLY'}))).toThrow(/ODYSSEY_WEATHER_PROVIDER_ENABLED/)});
});
