import { spawn, spawnSync } from 'node:child_process';
import process from 'node:process';

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const npmCli = process.env.npm_execpath;
const children = new Set();
let stopping = false;

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

function stop(exitCode = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) {
    if (!child.pid) continue;
    if (process.platform === 'win32') spawnSync('taskkill', ['/pid', String(child.pid), '/t', '/f'], { windowsHide: true, stdio: 'ignore' });
    else child.kill('SIGTERM');
  }
  process.exitCode = exitCode;
  setTimeout(() => process.exit(exitCode), 1500).unref();
}

process.once('SIGINT', () => stop(0));
process.once('SIGTERM', () => stop(0));

const root = new URL('..', import.meta.url);
start('JanSeva API', new URL('apps/api/', root), ['run', 'dev']);
start('JanSeva frontend', new URL('apps/web/', root), ['run', 'dev', '--', '--host', 'localhost', '--strictPort']);
