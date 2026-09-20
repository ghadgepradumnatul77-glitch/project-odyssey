import {readFileSync,readdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {execFileSync} from 'node:child_process';
import {beforeAll,describe,expect,it} from 'vitest';
const directory=resolve(__dirname,'../../../database/prisma/migrations');
const name='20260920090000_execution_provenance_foundation';
const sql=readFileSync(resolve(directory,name,'migration.sql'),'utf8');
it('migration adds false capabilities and nullable declarations without backfill',()=>{
 expect(sql.match(/BOOLEAN NOT NULL DEFAULT false/g)).toHaveLength(2);
 expect(sql).toContain('num_nonnulls');expect(sql).toContain('IN (0, 6)');
 expect(sql).not.toMatch(/(?:^|;)\s*(UPDATE|DELETE|TRUNCATE|DROP)\s/im);
 expect(sql).not.toContain('DEFAULT \'PILOT\'');
});
const container=process.env.P46_PROVENANCE_TEST_CONTAINER;
function run(input:string){return execFileSync('docker',['exec','-i',container!,'psql','-X','-q','-t','-A','-v','ON_ERROR_STOP=1','-U','provenance_owner','-d','p46_provenance'],{input,encoding:'utf8',stdio:['pipe','pipe','pipe'],timeout:60000}).trim();}
function rejected(statement:string){expect(()=>run(statement)).toThrow();}
const original=()=>run(`SELECT jsonb_agg(x ORDER BY x->>'id') FROM (SELECT to_jsonb(a)-ARRAY['canDeclareNonOperationalProvenance','canDeclareOperationalProvenance'] AS x FROM "ApprovalAuthority" a UNION ALL SELECT to_jsonb(p)-ARRAY['provenanceClassification','provenanceDeclaredById','provenanceDeclaredAt','provenanceAuthorityGrantId','provenanceEvidenceReference','provenanceContractVersion'] FROM "ExecutionPlan" p) r;`);
describe.skipIf(!container)('isolated provenance migration',()=>{
 beforeAll(()=>{
  expect(container).toMatch(/^odyssey-p46-provenance-[a-z0-9-]+$/);
  const meta=JSON.parse(execFileSync('docker',['inspect',container!],{encoding:'utf8'}))[0];
  expect(meta.Config.Labels['odyssey.validation']).toMatch(/^p46-provenance-/);
  expect(run("SELECT count(*) FROM pg_tables WHERE schemaname='public';")).toBe('0');
  for(const entry of readdirSync(directory).filter(x=>/^\d/.test(x)&&x<name).sort())run(readFileSync(resolve(directory,entry,'migration.sql'),'utf8'));
  run(`
INSERT INTO "Department" (id,name,code) VALUES ('d','Synthetic','P46');
INSERT INTO "Jurisdiction" (id,name,type,"departmentId") VALUES ('j','Synthetic','DIVISION','d');
INSERT INTO "User" (id,"employeeCode",name,email,"passwordHash",designation,"departmentId","jurisdictionId","updatedAt") VALUES ('u','P46','Synthetic','p46@example.invalid','DISABLED','Test','d','j',now());
INSERT INTO "Asset" (id,"assetCode",name,"assetType","departmentId","jurisdictionId","updatedAt") VALUES ('a','P46','Synthetic','BRIDGE','d','j',now());
INSERT INTO "Case" (id,"caseNumber","assetId",title,"updatedAt") VALUES ('c','P46','a','Synthetic',now());
INSERT INTO "Inspection" (id,"caseId","inspectorId","inspectionDate","structuralCondition","crackSeverity","corrosionLevel","trafficImportance","hospitalRoute","weatherRisk","heavyRainExpected","updatedAt") VALUES ('i','c','u',now(),'GOOD','MINOR','LOW','LOW',false,'LOW',false,now());
INSERT INTO "RiskAssessment" (id,"caseId","inspectionId","riskScore","riskLevel","priorityLevel","reasonCodes",reasons,"sourceFingerprint") VALUES ('r','c','i',1,'LOW','LOW','[]','[]','p46');
INSERT INTO "OperationalResponsePlan" (id,"caseId","riskAssessmentId","versionNumber",urgency,"recommendedActionCodes","temporaryMeasures",reasons,"alternativeActionCodes","updatedAt") VALUES ('o','c','r',1,'LOW','[]','[]','[]','[]',now());
INSERT INTO "ApprovalAuthority" (id,"userId","departmentId","jurisdictionId","canApprove","updatedAt") VALUES ('grant','u','d','j',true,now());
INSERT INTO "OrpDecision" (id,"caseId","orpId","reviewerId","authorityGrantId","decisionType") VALUES ('decision','c','o','u','grant','APPROVED');
INSERT INTO "ExecutionPlan" (id,"orpId","caseId","approvalDecisionId","createdById","updatedAt") VALUES ('plan','o','c','decision','u',now());
`);
  const before=original();run(sql.replace(/COMMIT;\s*$/,'ROLLBACK;'));expect(original()).toBe(before);
  expect(run("SELECT count(*) FROM information_schema.columns WHERE table_name='ExecutionPlan' AND column_name='provenanceClassification';")).toBe('0');
  run(sql);expect(original()).toBe(before);
 },90000);
 it('preserves old rows with false capabilities and null provenance',()=>{
  expect(run('SELECT "canApprove", "canDeclareOperationalProvenance", "canDeclareNonOperationalProvenance" FROM "ApprovalAuthority";')).toBe('t|f|f');
  expect(run('SELECT num_nonnulls("provenanceClassification","provenanceDeclaredById","provenanceDeclaredAt","provenanceAuthorityGrantId","provenanceEvidenceReference","provenanceContractVersion") FROM "ExecutionPlan";')).toBe('0');
 });
 it('defaults new grants false and round-trips independent explicit capabilities',()=>{
  run(`INSERT INTO "ApprovalAuthority" (id,"userId","departmentId","jurisdictionId","updatedAt") VALUES ('new','u','d','j',now());`);
  expect(run(`SELECT "canDeclareOperationalProvenance", "canDeclareNonOperationalProvenance" FROM "ApprovalAuthority" WHERE id='new';`)).toBe('f|f');
  run(`UPDATE "ApprovalAuthority" SET "canDeclareNonOperationalProvenance"=true WHERE id='new';`);
  expect(run(`SELECT "canApprove", "canDeclareOperationalProvenance", "canDeclareNonOperationalProvenance" FROM "ApprovalAuthority" WHERE id='new';`)).toBe('f|f|t');
 });
 const declaration=(classification='PILOT',actor='u',grant='grant',reference='PILOT:2026-001',version='ODYSSEY_EXECUTION_PROVENANCE_V1')=>`UPDATE "ExecutionPlan" SET "provenanceClassification"='${classification}',"provenanceDeclaredById"='${actor}',"provenanceDeclaredAt"=now(),"provenanceAuthorityGrantId"='${grant}',"provenanceEvidenceReference"='${reference}',"provenanceContractVersion"='${version}' WHERE id='plan';`;
 it.each(['PILOT','PRODUCTION','SYNTHETIC','DEMO'])('represents complete %s declarations without persisting test changes',value=>{run('BEGIN;'+declaration(value)+'ROLLBACK;');});
 it('rejects incomplete/invalid values, missing FKs and invalid references/contracts',()=>{
  rejected(`UPDATE "ExecutionPlan" SET "provenanceClassification"='PILOT';`);
  rejected(declaration('TEST'));rejected(declaration('DEMO','missing'));rejected(declaration('DEMO','u','missing'));
  rejected(declaration('DEMO','u','grant','a'.repeat(201)));rejected(declaration('DEMO','u','grant','bad ref'));rejected(declaration('DEMO','u','grant','REF','unknown'));
 });
});
