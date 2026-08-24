import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const serviceCoverage: Record<string, string[]> = {
  'risk/risk.service.ts': ['RISK_ASSESSMENT_RECORDED'],
  'policy-registry/policy-registry.service.ts': [
    'POLICY_VERSION_CREATED', 'POLICY_RULE_CREATED', 'POLICY_STATUS_CHANGED',
    'APPROVED_ACTION_VERSION_CREATED', 'APPROVED_ACTION_STATUS_CHANGED'
  ],
  'execution-templates/governed-execution-template.service.ts': [
    'EXECUTION_TEMPLATE_VERSION_CREATED', 'EXECUTION_TEMPLATE_TASK_ADDED', 'EXECUTION_TEMPLATE_STATUS_CHANGED'
  ],
  'authorities/authority.service.ts': ['APPROVAL_AUTHORITY_GRANTED'],
  'decision-packages/decision-package.service.ts': ['DECISION_PACKAGE_PREPARED'],
  'orp/orp.service.ts': ['ACTION_PLAN_CREATED'],
  'decisions/decision.service.ts': ['HUMAN_DECISION_RECORDED'],
  'execution/execution.service.ts': [
    'EXECUTION_PLAN_CREATED', 'EXECUTION_TASK_ASSIGNED', 'EXECUTION_TASK_STARTED',
    'EXECUTION_TASK_BLOCKED', 'EXECUTION_TASK_BLOCKER_RESOLVED',
    'EXECUTION_EVIDENCE_RECORDED', 'EXECUTION_TASK_COMPLETION_SUBMITTED',
    'EXECUTION_TASK_VERIFIED', 'EXECUTION_TASK_CANCELLED'
  ],
  'execution/execution-schedule.service.ts': [
    'EXECUTION_PLAN_SCHEDULE_REVISED', 'EXECUTION_TASK_SCHEDULE_REVISED',
    'EXECUTION_TASK_DEPENDENCY_ADDED', 'EXECUTION_TASK_DEPENDENCY_REMOVED'
  ],
  'closures/case-closure.service.ts': ['CASE_CLOSED'],
  'observations/observation.service.ts': [
    'OBSERVATION_SOURCE_REGISTERED', 'OBSERVATION_SOURCE_DEACTIVATED', 'EXTERNAL_OBSERVATION_INGESTED'
  ],
  'portfolio/portfolio.service.ts': ['CASE_RESOURCE_ESTIMATE_CREATED', 'PORTFOLIO_SCENARIO_CREATED'],
  'predictive-data/predictive-data.service.ts': [
    'PREDICTIVE_FEATURE_SNAPSHOT_CREATED', 'PREDICTIVE_OUTCOME_RECORDED',
    'PREDICTIVE_FEATURE_SNAPSHOT_VOIDED', 'PREDICTIVE_OUTCOME_VOIDED'
  ],
  'predictive-models/predictive-model-governance.service.ts': [
    'PREDICTIVE_DATASET_SNAPSHOT_CREATED', 'PREDICTIVE_MODEL_REGISTERED',
    'PREDICTIVE_MODEL_EVALUATED', 'PREDICTIVE_MODEL_VALIDATED', 'PREDICTIVE_MODEL_APPROVED',
    'PREDICTIVE_MODEL_REJECTED', 'PREDICTIVE_MODEL_ACTIVATED', 'PREDICTIVE_MODEL_REPLACED',
    'PREDICTIVE_MODEL_ROLLED_BACK', 'PREDICTIVE_MODEL_DEPRECATED'
  ]
};

describe('P3.4 protected mutation integration coverage', () => {
  for (const [relativePath, events] of Object.entries(serviceCoverage)) {
    it(`${relativePath} keeps its authoritative event registry transaction-coupled`, () => {
      const source = readFileSync(new URL(`../src/modules/${relativePath}`, import.meta.url), 'utf8');
      expect(source).toMatch(/\$transaction\s*\(/);
      expect(source).toMatch(/appendIntegrityEvent\s*\(\s*tx\s*,/);
      for (const eventType of events) {
        expect(source).toMatch(new RegExp(`eventType\\s*:\\s*['\"]${eventType}['\"]`));
      }
    });
  }

  it('never uses a timestamp as the sole source event identity', () => {
    for (const relativePath of Object.keys(serviceCoverage)) {
      const source = readFileSync(new URL(`../src/modules/${relativePath}`, import.meta.url), 'utf8');
      expect(source).not.toMatch(/sourceEventKey\s*:\s*`[^`]*\$\{(?:new Date\(\)|Date\.now\(\))/);
    }
  });
});
