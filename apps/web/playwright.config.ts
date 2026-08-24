import { defineConfig, devices } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('.', import.meta.url)), '../..');
const databaseUrl = execFileSync(process.execPath, [resolve(root, 'scripts/c6-e2e-environment.mjs'), 'url'], { encoding: 'utf8' });
const password = process.env.C6_E2E_PASSWORD || 'C6-Synthetic-Only-Password-2026!';

export default defineConfig({
  testDir: './e2e',
  globalTeardown: './e2e/global-teardown.ts',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: 'list',
  use: { baseURL: 'http://127.0.0.1:5174', trace: 'off', screenshot: 'off', video: 'off' },
  projects: [
    { name: 'setup', testMatch: /.*\.setup\.ts/ },
    { name: 'chromium', dependencies: ['setup'], testIgnore: /.*\.setup\.ts/, use: { ...devices['Desktop Chrome'] } }
  ],
  webServer: [
    {
      command: 'node ../../scripts/c6-e2e-environment.mjs prepare && npx tsx src/server.ts',
      cwd: resolve(root, 'apps/api'),
      url: 'http://127.0.0.1:4100/api/v1/health',
      env: { ...process.env, DATABASE_URL: databaseUrl, API_PORT: '4100', ALLOWED_ORIGINS: 'http://127.0.0.1:5174', NODE_ENV: 'test', JWT_SECRET: 'C6-synthetic-browser-JWT-secret-2026-only', C6_E2E_PASSWORD: password },
      reuseExistingServer: false,
      timeout: 120_000
    },
    {
      command: 'npm run dev -- --host 127.0.0.1 --port 5174 --strictPort',
      cwd: resolve(root, 'apps/web'),
      url: 'http://127.0.0.1:5174',
      env: { ...process.env, VITE_API_BASE_URL: 'http://127.0.0.1:4100/api/v1', C6_E2E_PASSWORD: password },
      reuseExistingServer: false,
      timeout: 120_000
    }
  ]
});
