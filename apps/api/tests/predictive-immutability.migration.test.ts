import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { beforeAll, describe, expect, it } from 'vitest';

const migration = resolve(__dirname, '../../../database/prisma/migrations/20260919180000_guard_predictive_records/migration.sql');
const sql = readFileSync(migration, 'utf8');
it('adds transactional database guards without rewriting data or workflow tables', () => {
  expect(sql).toContain('BEGIN;'); expect(sql).toContain('COMMIT;');
  expect(sql).toContain('to_jsonb(NEW) - mutable_fields');
  expect(sql.match(/BEFORE UPDATE OR DELETE/g)).toHaveLength(2);
  expect(sql.match(/ENABLE ALWAYS TRIGGER/g)).toHaveLength(2);
  expect(sql).not.toMatch(/(?:^|;)\s*(?:UPDATE|DELETE|TRUNCATE|DROP|INSERT)\s/im);
  expect(sql).not.toMatch(/ALTER TABLE public."(?:Case|ExecutionTask|RiskAssessment)"/);
});

// Opt in only with a disposable, previously migrated (28 migrations) database.
// Never reads DATABASE_URL and never targets canonical data.
const container = process.env.P46_GUARD_TEST_CONTAINER;
const url = process.env.P46_GUARD_TEST_URL;
function run(statement: string, runtime = false) {
  return execFileSync('docker', ['exec', '-i', container!, 'psql', '-X', '-q', '-t', '-A', '-v', 'ON_ERROR_STOP=1', '-U', runtime ? 'p46_runtime' : 'guard_owner', '-d', 'p46_guard'], { input: statement, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'], timeout: 30000 }).trim();
}
function denied(statement: string, code: string) {
  try { run(statement, true); throw new Error('Mutation unexpectedly succeeded'); }
  catch (e) { expect(String((e as { stderr?: string }).stderr)).toContain(code); }
}
const facts = () => run(`SELECT jsonb_agg(row ORDER BY row->>'id') FROM (
 SELECT to_jsonb(s) AS row FROM "PredictiveFeatureSnapshot" s
 UNION ALL SELECT to_jsonb(o) AS row FROM "PredictiveOutcome" o) records;`);

describe.skipIf(!container || !url)('isolated PostgreSQL predictive guards', () => {
  beforeAll(() => {
    expect(container).toMatch(/^odyssey-p46-guard-[a-z0-9-]+$/);
    const parsed = new URL(url!);
    expect(parsed.hostname).toBe('127.0.0.1'); expect(parsed.pathname).toBe('/p46_guard');
    const metadata = JSON.parse(execFileSync('docker', ['inspect', container!], { encoding: 'utf8' }))[0];
    expect(metadata.Config.Labels['odyssey.validation']).toMatch(/^p46-guard-/);
    expect(metadata.NetworkSettings.Ports['5432/tcp'][0].HostIp).toBe('127.0.0.1');
    expect(metadata.NetworkSettings.Ports['5432/tcp'][0].HostPort).toBe(parsed.port);
    expect(run('SELECT count(*) FROM "ExecutionTask";')).toBe('0');
    expect(run('SELECT count(*) FROM "_prisma_migrations" WHERE finished_at IS NOT NULL;')).toBe('28');
    run(`
INSERT INTO "Department" (id,name,code) VALUES ('d','Synthetic guard test','GUARD');
INSERT INTO "Jurisdiction" (id,name,type,"departmentId") VALUES ('j','Synthetic','DIVISION','d');
INSERT INTO "User" (id,"employeeCode",name,email,"passwordHash",designation,"departmentId","jurisdictionId","updatedAt") VALUES ('u','GUARD','Synthetic','guard@example.invalid','DISABLED','Test','d','j',now());
INSERT INTO "Asset" (id,"assetCode",name,"assetType","departmentId","jurisdictionId","updatedAt") VALUES ('a','GUARD','Synthetic','BRIDGE','d','j',now());
INSERT INTO "Case" (id,"caseNumber","assetId",title,"updatedAt") VALUES ('c','GUARD','a','Synthetic',now());
INSERT INTO "Inspection" (id,"caseId","inspectorId","inspectionDate","structuralCondition","crackSeverity","corrosionLevel","trafficImportance","hospitalRoute","weatherRisk","heavyRainExpected","updatedAt") VALUES ('i','c','u',now(),'GOOD','MINOR','LOW','LOW',false,'LOW',false,now());
INSERT INTO "RiskAssessment" (id,"caseId","inspectionId","riskScore","riskLevel","priorityLevel","reasonCodes",reasons,"sourceFingerprint") VALUES ('r','c','i',1,'LOW','LOW','[]','[]','guard-risk');
INSERT INTO "OperationalResponsePlan" (id,"caseId","riskAssessmentId","versionNumber",urgency,"recommendedActionCodes","temporaryMeasures",reasons,"alternativeActionCodes","updatedAt") VALUES ('o','c','r',1,'LOW','[]','[]','[]','[]',now());
INSERT INTO "ApprovalAuthority" (id,"userId","departmentId","jurisdictionId","updatedAt") VALUES ('auth','u','d','j',now());
INSERT INTO "OrpDecision" (id,"caseId","orpId","reviewerId","authorityGrantId","decisionType") VALUES ('decision','c','o','u','auth','APPROVED');
INSERT INTO "ExecutionPlan" (id,"orpId","caseId","approvalDecisionId","createdById","updatedAt") VALUES ('plan','o','c','decision','u',now());
INSERT INTO "ExecutionTask" (id,"executionPlanId","sequenceNumber","sourceActionCode","templateTaskKey","titleSnapshot","descriptionSnapshot","categorySnapshot","updatedAt") VALUES ('task','plan',1,'TEST','TEST','Synthetic','Synthetic','TEST',now());
INSERT INTO "PredictiveFeatureSnapshot" (id,"targetType","executionTaskId","caseId","assetId","departmentId","jurisdictionId","predictionTimestamp","featureContractVersion","featurePayload","provenanceClass","sourceReferences","sourceFingerprint","createdById") VALUES ('s','TASK_LATENESS','task','c','a','d','j','2026-01-01','guard-v1','{"test":true}','SYNTHETIC','{}','guard-source','u');
INSERT INTO "PredictiveOutcome" (id,"snapshotId","outcomeContractVersion","outcomeTimestamp","outcomeValue","provenanceClass","sourceReferences","sourceFingerprint","recordedById") VALUES ('out','s','guard-v1','2026-01-02','LATE','SYNTHETIC','{}','guard-outcome','u');
CREATE ROLE p46_runtime LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE;
GRANT CONNECT ON DATABASE p46_guard TO p46_runtime;
GRANT USAGE ON SCHEMA public TO p46_runtime;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO p46_runtime;
`);
    const before = facts();
    // Transactional DDL rollback leaves the pre-migration rows and schema intact.
    run(sql.replace(/COMMIT;\s*$/, 'ROLLBACK;'));
    expect(facts()).toBe(before);
    expect(run("SELECT count(*) FROM pg_trigger WHERE tgname IN ('predictive_feature_snapshot_immutable','predictive_outcome_immutable');")).toBe('0');
    execFileSync(process.execPath, [require.resolve('prisma/build/index.js'), 'migrate', 'deploy', '--schema', resolve(__dirname, '../../../database/prisma/schema.prisma')], { cwd: resolve(__dirname, '..'), env: { ...process.env, DATABASE_URL: url }, stdio: 'pipe', timeout: 60000 });
    expect(facts()).toBe(before);
    expect(run('SELECT count(*) FROM "_prisma_migrations" WHERE finished_at IS NOT NULL;')).toBe('29');
  }, 90000);

  it('preserves insertion and read behavior under runtime grants', () => {
    run(`INSERT INTO "PredictiveFeatureSnapshot" SELECT 's2',"targetType","executionTaskId","caseId","assetId","departmentId","jurisdictionId","predictionTimestamp",'guard-v2',"featurePayload","provenanceClass","sourceReferences",'guard-source-2',status,"createdById","createdAt","voidedAt","voidedById","voidReason",NULL FROM "PredictiveFeatureSnapshot" WHERE id='s';`, true);
    run(`INSERT INTO "PredictiveOutcome" SELECT 'out2','s2',"outcomeContractVersion","outcomeTimestamp","outcomeValue","provenanceClass","sourceReferences",'guard-outcome-2',status,"recordedById","recordedAt","voidedAt","voidedById","voidReason",NULL FROM "PredictiveOutcome" WHERE id='out';`, true);
    expect(run('SELECT count(*) FROM "PredictiveOutcome";', true)).toBe('2');
  });

  it.each([
    ['PredictiveFeatureSnapshot','id',"'changed'"],
    ['PredictiveFeatureSnapshot','predictionTimestamp',"'2026-02-01'"],
    ['PredictiveFeatureSnapshot','featurePayload',"'{\"changed\":true}'::jsonb"],
    ['PredictiveFeatureSnapshot','featureContractVersion',"'changed'"],
    ['PredictiveFeatureSnapshot','sourceFingerprint',"'changed'"],
    ['PredictiveFeatureSnapshot','provenanceClass',"'PILOT'"],
    ['PredictiveFeatureSnapshot','sourceReferences',"'{\"changed\":true}'::jsonb"],
    ['PredictiveOutcome','id',"'changed'"],
    ['PredictiveOutcome','outcomeTimestamp',"'2026-02-01'"],
    ['PredictiveOutcome','outcomeValue',"'ON_TIME'"],
    ['PredictiveOutcome','outcomeContractVersion',"'changed'"],
    ['PredictiveOutcome','sourceFingerprint',"'changed'"],
    ['PredictiveOutcome','provenanceClass',"'PILOT'"],
    ['PredictiveOutcome','sourceReferences',"'{\"changed\":true}'::jsonb"],
  ])('rejects immutable %s.%s updates', (table, field, value) => {
    denied(`UPDATE "${table}" SET "${field}"=${value};`, 'PREDICTIVE_RECORD_FACTS_IMMUTABLE');
  });

  it.each(['PredictiveFeatureSnapshot','PredictiveOutcome'])('rejects deletion and invalid lifecycle edits on %s', table => {
    denied(`DELETE FROM "${table}";`, 'PREDICTIVE_RECORD_DELETE_FORBIDDEN');
    denied(`UPDATE "${table}" SET status='VOID';`, 'PREDICTIVE_RECORD_VOID_TRANSITION_REQUIRED');
    denied(`UPDATE "${table}" SET "voidReason"='unaccompanied edit';`, 'PREDICTIVE_RECORD_VOID_TRANSITION_REQUIRED');
    run(`UPDATE "${table}" SET status=status;`, true);
  });

  it('allows governed void with replacement, freezes it, and supports transaction rollback', () => {
    for (const [table, key, replacement] of [['PredictiveFeatureSnapshot','replacementSnapshotId','s2'],['PredictiveOutcome','replacementOutcomeId','out2']]) {
      const record = table==='PredictiveOutcome'?'out':'s';
      const statement=`UPDATE "${table}" SET status='VOID',"voidedAt"=now(),"voidedById"='u',"voidReason"='Synthetic correction',"${key}"='${replacement}' WHERE id='${record}';`;
      const before=facts(); run('BEGIN;'+statement+'ROLLBACK;',true); expect(facts()).toBe(before);
      run(statement,true); expect(run(`SELECT status FROM "${table}" WHERE id='${record}';`,true)).toBe('VOID');
      denied(`UPDATE "${table}" SET status='ACTIVE' WHERE id='${record}';`,'PREDICTIVE_RECORD_VOID_TRANSITION_REQUIRED');
      denied(`UPDATE "${table}" SET "voidReason"='rewrite' WHERE id='${record}';`,'PREDICTIVE_RECORD_VOID_TRANSITION_REQUIRED');
    }
  });

  it('runtime cannot disable triggers or use replica mode to bypass enforcement', () => {
    denied('ALTER TABLE "PredictiveFeatureSnapshot" DISABLE TRIGGER predictive_feature_snapshot_immutable;', 'must be owner');
    denied("SET session_replication_role='replica';", 'permission denied');
    expect(run("SELECT string_agg(tgenabled::text, ',' ORDER BY tgname) FROM pg_trigger WHERE tgname IN ('predictive_feature_snapshot_immutable','predictive_outcome_immutable');")).toBe('A,A');
  });
});
