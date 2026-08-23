import { execFileSync } from 'node:child_process';
import {
  cpSync, existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

const apiRoot = resolve(__dirname, '..');
const repoRoot = resolve(apiRoot, '../..');
const copyScript = join(apiRoot, 'scripts/copy-generated-prisma.cjs');
const temporary: string[] = [];
const makeTemp = () => {
  const directory = mkdtempSync(join(tmpdir(), 'janseva-runtime-'));
  temporary.push(directory);
  return directory;
};

afterEach(() => {
  for (const directory of temporary.splice(0)) rmSync(directory, { recursive: true, force: true });
});

describe('immutable local runtime architecture', () => {
  it('publishes versioned builds and starts through the current-runtime pointer', () => {
    const pkg = JSON.parse(readFileSync(join(apiRoot, 'package.json'), 'utf8'));
    expect(pkg.scripts.build).toBe('node scripts/build-runtime.cjs');
    expect(pkg.scripts.dev).toBe('npm run build && node scripts/start-runtime.cjs');
    expect(pkg.scripts.start).toBe('node scripts/start-runtime.cjs');
  });

  it('fails when the generated Prisma source is missing', () => {
    const root = makeTemp();
    const module = require(copyScript);
    expect(() => module.copyGeneratedPrisma(join(root, 'missing'), join(root, 'target')))
      .toThrow(/Generated Prisma source is incomplete/);
  });

  it('copies and validates a complete generated Prisma runtime', () => {
    const target = join(makeTemp(), 'target');
    execFileSync(process.execPath, [copyScript, '--target', target], { stdio: 'pipe' });
    expect(readFileSync(join(target, 'index.js'), 'utf8')).toContain('PrismaClient');
    expect(readFileSync(join(target, 'schema.prisma'), 'utf8')).toContain('datasource db');
    expect(existsSync(join(target, 'runtime/library.js'))).toBe(true);
    expect(existsSync(join(target, 'query_engine-windows.dll.node.tmp22100'))).toBe(false);
  });

  it('replaces stale destinations instead of overlaying them', () => {
    const target = join(makeTemp(), 'target');
    mkdirSync(target, { recursive: true });
    writeFileSync(join(target, 'stale.txt'), 'stale');
    require(copyScript).copyGeneratedPrisma(undefined, target);
    expect(existsSync(join(target, 'stale.txt'))).toBe(false);
    expect(existsSync(join(target, 'index.js'))).toBe(true);
  });

  it('never publishes an incomplete staged runtime', () => {
    const root = makeTemp();
    const source = join(root, 'source');
    const target = join(root, 'target');
    mkdirSync(source);
    writeFileSync(join(source, 'index.js'), 'module.exports = {}');
    expect(() => require(copyScript).copyGeneratedPrisma(source, target)).toThrow(/missing index\.d\.ts/);
    expect(existsSync(target)).toBe(false);
  });

  it('does not contain process-kill or retry behavior in the build/copy scripts', () => {
    const content = [
      readFileSync(copyScript, 'utf8'),
      readFileSync(join(apiRoot, 'scripts/build-runtime.cjs'), 'utf8')
    ].join('\n');
    expect(content).not.toMatch(/taskkill|Stop-Process|kill\s*\(/);
    expect(content).not.toMatch(/setInterval|while\s*\(true\)/);
    expect(content).toContain('PRISMA_RUNTIME_IN_USE');
  });

  it('keeps each published build independent from an older runtime', () => {
    const root = makeTemp();
    const first = join(root, 'one');
    const second = join(root, 'two');
    const source = join(apiRoot, 'src/generated/prisma');
    cpSync(source, first, { recursive: true });
    require(copyScript).copyGeneratedPrisma(source, second);
    expect(existsSync(join(first, 'index.js'))).toBe(true);
    expect(existsSync(join(second, 'index.js'))).toBe(true);
  });

  it('supervises only owned children and waits for their process trees to exit', () => {
    const pkg = JSON.parse(readFileSync(join(repoRoot, 'package.json'), 'utf8'));
    const supervisor = readFileSync(join(repoRoot, 'scripts/dev.mjs'), 'utf8');
    expect(pkg.scripts.dev).toBe('node scripts/dev.mjs');
    expect(supervisor).toContain('apps/api/');
    expect(supervisor).toContain('apps/web/');
    expect(supervisor).toContain('--strictPort');
    expect(supervisor).toContain('processExists(child.pid)');
    expect(supervisor).toContain('Date.now() + 5000');
    expect(supervisor).toContain("spawnSync('taskkill'");
    expect(supervisor).toContain("String(child.pid)");
    expect(supervisor).not.toContain('taskkill /im');
  });

  it('provides controlled backend port-collision diagnostics', () => {
    const server = readFileSync(join(apiRoot, 'src/server.ts'), 'utf8');
    expect(server).toContain('ODYSSEY_API_PORT_IN_USE');
    expect(server).toContain("error.code === 'EADDRINUSE'");
  });
});
