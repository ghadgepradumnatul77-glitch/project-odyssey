import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { beforeAll, describe, expect, it } from 'vitest';
const root = resolve(__dirname, '../../../database/prisma/migrations');
const name = '20260921090000_unknown_predictive_provenance';
const sql = readFileSync(resolve(root, name, 'migration.sql'), 'utf8');
it('only extends the enum without defaults, backfill or guard changes', () => {
  expect(sql.replace(/--[^\n]*/g, '').trim()).toBe('ALTER TYPE "PredictiveProvenanceClass" ADD VALUE \'UNKNOWN\';');
});
const container = process.env.P46_UNKNOWN_TEST_CONTAINER;
function run(input: string, runtime = false) {
  return execFileSync('docker', ['exec', '-i', container!, 'psql', '-X', '-qAt', '-v', 'ON_ERROR_STOP=1', '-U', runtime ? 'p46_runtime' : 'guard_owner', '-d', 'p46_guard'], { input, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'], timeout: 60000 }).trim();
}
const facts = () => run(`SELECT jsonb_agg(x ORDER BY x->>'id') FROM (SELECT to_jsonb(s) x FROM "PredictiveFeatureSnapshot" s UNION ALL SELECT to_jsonb(o) FROM "PredictiveOutcome" o) r;`);
describe.skipIf(!container)('isolated UNKNOWN provenance migration', () => {
  beforeAll(() => {
    expect(container).toMatch(/^odyssey-p46-unknown-[a-z0-9-]+$/);
    const meta = JSON.parse(execFileSync('docker', ['inspect', container!], { encoding: 'utf8' }))[0];
    expect(meta.Config.Labels['odyssey.validation']).toBe('p46-unknown');
    expect(run("SELECT count(*) FROM pg_tables WHERE schemaname='public';")).toBe('0');
    for (const entry of readdirSync(root).filter(x => /^\d/.test(x) && x < name).sort()) run(readFileSync(resolve(root, entry, 'migration.sql'), 'utf8'));
    // Reuse the existing guard test's controlled synthetic fixture, never DATABASE_URL.
    const fixture = readFileSync(resolve(__dirname, 'predictive-immutability.migration.test.ts'), 'utf8').match(/run\(`\s*(INSERT INTO "Department"[\s\S]*?)`\);/);
    expect(fixture).not.toBeNull(); run(fixture![1]);
    const before = facts(); run(sql); expect(facts()).toBe(before);
  }, 90000);
  it('preserves existing values and adds UNKNOWN without a default', () => {
    expect(run(`SELECT enum_range(NULL::"PredictiveProvenanceClass")::text;`)).toBe('{PRODUCTION,PILOT,DEMO,SYNTHETIC,TEST,UNKNOWN}');
    expect(run(`SELECT count(*) FROM information_schema.columns WHERE table_name IN ('PredictiveFeatureSnapshot','PredictiveOutcome') AND column_name='provenanceClass' AND column_default IS NOT NULL;`)).toBe('0');
  });
  it('stores UNKNOWN snapshots using runtime INSERT permission', () => {
    run(`INSERT INTO "PredictiveFeatureSnapshot" SELECT 'unknown',"targetType","executionTaskId","caseId","assetId","departmentId","jurisdictionId","predictionTimestamp",'unknown-test',"featurePayload",'UNKNOWN',"sourceReferences",'unknown-source',status,"createdById","createdAt","voidedAt","voidedById","voidReason",NULL FROM "PredictiveFeatureSnapshot" WHERE id='s';`, true);
    expect(run(`SELECT "provenanceClass" FROM "PredictiveFeatureSnapshot" WHERE id='unknown';`)).toBe('UNKNOWN');
  });
  it('retains immutable update/delete enforcement on both predictive tables', () => {
    for (const table of ['PredictiveFeatureSnapshot', 'PredictiveOutcome']) {
      expect(() => run(`UPDATE "${table}" SET "provenanceClass"='UNKNOWN';`, true)).toThrow();
      expect(() => run(`DELETE FROM "${table}";`, true)).toThrow();
    }
    expect(run("SELECT string_agg(tgenabled::text, ',' ORDER BY tgname) FROM pg_trigger WHERE tgname IN ('predictive_feature_snapshot_immutable','predictive_outcome_immutable');")).toBe('A,A');
  });
});
