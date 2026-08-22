import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export default function globalTeardown() {
  execFileSync(process.execPath, [resolve(fileURLToPath(new URL('.', import.meta.url)), '../../../scripts/c6-e2e-environment.mjs'), 'cleanup'], { stdio: 'inherit' });
}
