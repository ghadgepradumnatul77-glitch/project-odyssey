import { readFileSync } from 'node:fs';
import { createServer } from 'node:net';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const commands = new Set(['attach','build','config','cp','create','down','events','exec','images','kill','logs','pause','port','ps','pull','push','restart','rm','run','start','stats','stop','top','unpause','up','version','wait','watch']);

function envFileFrom(args) {
  let value = null;
  for (let index = 0; index < args.length; index += 1) {
    if (args[index] === '--env-file') value = args[index + 1] ?? null;
    else if (args[index].startsWith('--env-file=')) value = args[index].slice('--env-file='.length);
  }
  return value;
}

function parseEnv(path) {
  if (!path) return {};
  const result = {};
  for (const raw of readFileSync(resolve(root, path), 'utf8').split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const separator = line.indexOf('=');
    if (separator < 1) continue;
    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    result[key] = value;
  }
  return result;
}

export function probePort(port) {
  return new Promise((resolveProbe, reject) => {
    const server = createServer();
    server.unref();
    server.once('error', reject);
    server.listen({ host: '0.0.0.0', port, exclusive: true }, () => server.close(() => resolveProbe()));
  });
}

function compose(args, capture = false) {
  return spawnSync('docker', ['compose', ...args], { cwd: root, encoding: 'utf8', stdio: capture ? 'pipe' : 'inherit' });
}

function serviceAlreadyExists(globalArgs, service) {
  const result = compose([...globalArgs, 'ps', '-q', service], true);
  return result.status === 0 && result.stdout.trim().length > 0;
}

async function check(service, port) {
  try { await probePort(port); }
  catch {
    console.error(`PILOT_PORT_COLLISION: Host port ${port} for ${service} is unavailable. Startup aborted; no alternate port was selected.`);
    return false;
  }
  return true;
}

async function main(args) {
  if (args[0] === '--check-port') return (await check(args[1] || 'service', Number(args[2]))) ? 0 : 1;
  const commandIndex = args.findIndex((value) => commands.has(value));
  if (commandIndex < 0) return compose(args).status ?? 1;
  if (args[commandIndex] === 'up') {
    const values = { ...parseEnv(envFileFrom(args)), ...process.env };
    const globalArgs = args.slice(0, commandIndex);
    const targets = [
      ['api', Number(values.ODYSSEY_API_PORT || 4000)],
      ['web', Number(values.ODYSSEY_WEB_PORT || 8080)]
    ];
    for (const [service, port] of targets) {
      if (!Number.isInteger(port) || port < 1 || port > 65535) {
        console.error(`PILOT_PORT_INVALID: ${service} host port must be an integer from 1 to 65535.`);
        return 1;
      }
      if (!serviceAlreadyExists(globalArgs, service) && !(await check(service, port))) return 1;
    }
  }
  const result = compose(args);
  return result.status ?? 1;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exitCode = await main(process.argv.slice(2));
