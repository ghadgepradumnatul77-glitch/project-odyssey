export const EXECUTION_TEMPLATE_VERSION = 'ODYSSEY_EXECUTION_V1';

export interface ExecutionTaskTemplate {
  templateTaskKey: string;
  title: string;
  description: string;
  category: string;
  isMandatory: boolean;
}

const templates: Record<string, ExecutionTaskTemplate[]> = {
  ACT_INSPECT_DETAILED: [
    { templateTaskKey: 'PREPARE_ASSESSMENT', title: 'Prepare detailed engineering assessment', description: 'Define the safe scope, qualified personnel, records, and access needed for a detailed structural assessment.', category: 'ASSESSMENT', isMandatory: true },
    { templateTaskKey: 'RECORD_ASSESSMENT', title: 'Conduct and record detailed engineering assessment', description: 'Perform the authorized assessment and record findings and supporting references; this record does not itself authorize remedial work.', category: 'ASSESSMENT', isMandatory: true }
  ],
  ACT_RESTRICT_HEAVY_VEHICLES: [{ templateTaskKey: 'PREPARE_RESTRICTION_COORDINATION', title: 'Prepare heavy-vehicle restriction coordination record', description: 'Prepare the technical recommendation and coordination record required for competent authorities to consider a restriction; do not issue or enforce an order.', category: 'INTERIM_SAFETY', isMandatory: true }],
  ACT_TEMP_STABILIZATION: [{ templateTaskKey: 'PLAN_STABILIZATION', title: 'Prepare temporary stabilization work plan', description: 'Document a qualified engineering stabilization plan, prerequisites, controls, and evidence requirements before separately authorized field work.', category: 'INTERIM_SAFETY', isMandatory: true }],
  ACT_INCREASE_MONITORING: [{ templateTaskKey: 'PLAN_MONITORING', title: 'Establish enhanced monitoring plan', description: 'Define monitoring frequency, responsible personnel, measurements, escalation thresholds, and recordkeeping.', category: 'MONITORING', isMandatory: true }],
  ACT_TRAFFIC_MANAGEMENT: [{ templateTaskKey: 'PREPARE_TRAFFIC_PLAN', title: 'Prepare traffic-management plan', description: 'Prepare a coordination proposal for competent review; do not close roads, deploy personnel, or activate diversions.', category: 'TRAFFIC', isMandatory: true }],
  ACT_ESCALATE_AUTHORITY: [{ templateTaskKey: 'RECORD_ESCALATION_REQUIREMENT', title: 'Record authority-coordination requirement', description: 'Identify the competent authority and prepare an internal coordination record; plan creation does not claim escalation occurred.', category: 'GOVERNANCE', isMandatory: true }],
  ACT_PERMANENT_REPAIR_PLANNING: [{ templateTaskKey: 'PREPARE_REPAIR_PLAN', title: 'Prepare permanent repair planning package', description: 'Prepare technical scope, options, dependencies, and evidence for later human review without making procurement or budget commitments.', category: 'REMEDIATION', isMandatory: true }]
};

export function translateActionsToTasks(actionCodes: string[]) {
  const unique = [...new Set(actionCodes)];
  const missing = unique.find((code) => !templates[code]);
  if (missing) return { missing, tasks: [] as Array<ExecutionTaskTemplate & { sourceActionCode: string; sequenceNumber: number }> };
  let sequenceNumber = 0;
  return {
    missing: null,
    tasks: unique.flatMap((sourceActionCode) => templates[sourceActionCode].map((task) => ({
      ...task, sourceActionCode, sequenceNumber: ++sequenceNumber
    })))
  };
}
