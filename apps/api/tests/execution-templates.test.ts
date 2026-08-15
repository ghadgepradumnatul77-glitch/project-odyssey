import { describe, expect, it } from 'vitest';
import { EXECUTION_TEMPLATE_VERSION, translateActionsToTasks } from '../src/modules/execution/execution-templates';
describe('execution templates', () => {
  it('deterministically expands recommendations', () => { expect(EXECUTION_TEMPLATE_VERSION).toBe('ODYSSEY_EXECUTION_V1'); const r=translateActionsToTasks(['ACT_INSPECT_DETAILED','ACT_TRAFFIC_MANAGEMENT']); expect(r.missing).toBeNull(); expect(r.tasks.map(t=>[t.sequenceNumber,t.sourceActionCode,t.templateTaskKey])).toEqual([[1,'ACT_INSPECT_DETAILED','PREPARE_ASSESSMENT'],[2,'ACT_INSPECT_DETAILED','RECORD_ASSESSMENT'],[3,'ACT_TRAFFIC_MANAGEMENT','PREPARE_TRAFFIC_PLAN']]); });
  it('deduplicates recommendations', () => expect(translateActionsToTasks(['ACT_INCREASE_MONITORING','ACT_INCREASE_MONITORING']).tasks).toHaveLength(1));
  it('rejects unknown codes atomically', () => expect(translateActionsToTasks(['ACT_INCREASE_MONITORING','UNKNOWN'])).toEqual({missing:'UNKNOWN',tasks:[]}));
  it('contains all approved action codes', () => expect(translateActionsToTasks(['ACT_INSPECT_DETAILED','ACT_RESTRICT_HEAVY_VEHICLES','ACT_TEMP_STABILIZATION','ACT_INCREASE_MONITORING','ACT_TRAFFIC_MANAGEMENT','ACT_ESCALATE_AUTHORITY','ACT_PERMANENT_REPAIR_PLANNING']).missing).toBeNull());
});
