import { spawn, spawnSync } from 'node:child_process';
import process from 'node:process';

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const npmCli = process.env.npm_execpath;
const children = new Set();
let stopping = false;
const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
function processExists(pid) {
  try { process.kill(pid, 0); return true; } catch { return false; }
}

function start(label, cwd, args) {
  const command = npmCli ? process.execPath : npm;
  const commandArgs = npmCli ? [npmCli, ...args] : args;
  const child = spawn(command, commandArgs, { cwd, stdio: 'inherit', env: process.env, windowsHide: true, shell: !npmCli && process.platform === 'win32' });
  children.add(child);
  child.once('error', (error) => {
    console.error(`${label} failed to start: ${error.message}`);
    stop(1);
  });
  child.once('exit', (code, signal) => {
    children.delete(child);
    if (stopping) return;
    console.error(`${label} exited${signal ? ` from ${signal}` : ` with code ${code ?? 1}`}. Stopping the local JanSeva workspace.`);
    stop(code && code !== 0 ? code : 1);
  });
  return child;
}

async function stop(exitCode = 0) {
  if (stopping) return;
  stopping = true;
  const owned = [...children];
  for (const child of owned) {
    if (!child.pid) continue;
    if (process.platform === 'win32') {
      const result = spawnSync('taskkill', ['/pid', String(child.pid), '/t', '/f'], { windowsHide: true, stdio: 'ignore' });
      if (result.status !== 0 && processExists(child.pid)) {
        console.error(`Could not stop owned ${child.pid}; no unrelated process was targeted.`);
      }
    }
    else child.kill('SIGTERM');
  }
  const deadline = Date.now() + 5000;
  while (owned.some((child) => child.pid && processExists(child.pid)) && Date.now() < deadline) await delay(50);
  const remaining = owned.filter((child) => child.pid && processExists(child.pid));
  if (remaining.length) console.error('Owned development children did not confirm exit within 5 seconds.');
  process.exit(exitCode);
}

process.once('SIGINT', () => void stop(0));
process.once('SIGTERM', () => void stop(0));

const root = new URL('..', import.meta.url);
start('JanSeva API', new URL('apps/api/', root), ['run', 'dev']);
start('JanSeva frontend', new URL('apps/web/', root), ['run', 'dev', '--', '--host', 'localhost', '--strictPort']);
