const fs = require('node:fs');
const path = require('node:path');

function copyGeneratedPrisma(source = path.resolve(__dirname, '../src/generated/prisma'), target = path.resolve(__dirname, '../dist/generated/prisma')) {
  if (!fs.existsSync(path.join(source, 'index.js'))) throw new Error(`Generated Prisma client is missing at ${source}. Run prisma generate before building.`);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.cpSync(source, target, { recursive: true, force: true });
  if (!fs.existsSync(path.join(target, 'index.js'))) throw new Error(`Generated Prisma client was not copied to ${target}.`);
  return target;
}

if (require.main === module) {
  const targetFlag = process.argv.indexOf('--target');
  const target = targetFlag >= 0 ? path.resolve(process.argv[targetFlag + 1]) : undefined;
  console.log(`Prisma runtime copied to ${copyGeneratedPrisma(undefined, target)}.`);
}

module.exports = { copyGeneratedPrisma };
