import { expect, request, test, type APIRequestContext } from '@playwright/test';

const apiBase = 'http://127.0.0.1:4100/api/v1';
const password = process.env.C6_E2E_PASSWORD || 'C6-Synthetic-Only-Password-2026!';
const credentials = {
  admin: 'c6.admin@example.test', primary: 'c6.primary@example.test', verifier: 'c6.verifier@example.test',
  closer: 'c6.closer@example.test', policy: 'c6.policy@example.test'
};

type Api = Pick<APIRequestContext, 'get' | 'post' | 'patch' | 'dispose'>;
async function login(api: Api, email: string) {
  const response = await api.post('/auth/login', { data: { email, password } });
  const body = await response.json();
  expect(response.ok(), `${email}: ${JSON.stringify(body)}`).toBeTruthy();
  return body.data.accessToken as string;
}
const auth = (token: string) => ({ Authorization: `Bearer ${token}` });
async function data(response: Awaited<ReturnType<APIRequestContext['get']>>) {
  const body = await response.json();
  expect(response.ok(), JSON.stringify(body)).toBeTruthy();
  return body.data;
}

test('creates complete disposable C6 lifecycle fixtures through mounted APIs', async () => {
  const raw = await request.newContext({ baseURL: apiBase });
  const api: Api = {
    get: (path, options) => raw.get(`/api/v1${path}`, options),
    post: (path, options) => raw.post(`/api/v1${path}`, options),
    patch: (path, options) => raw.patch(`/api/v1${path}`, options),
    dispose: () => raw.dispose()
  };
  const tokens = {
    admin: await login(api, credentials.admin), primary: await login(api, credentials.primary),
    verifier: await login(api, credentials.verifier), closer: await login(api, credentials.closer),
    policy: await login(api, credentials.policy)
  };
  const users = await data(await api.get('/users', { headers: auth(tokens.admin) }));
  const primary = users.find((user: any) => user.email === credentials.primary);
  const verifier = users.find((user: any) => user.email === credentials.verifier);
  const assets = await data(await api.get('/assets', { headers: auth(tokens.admin) }));
  const asset = assets.find((item: any) => item.assetCode === 'C6-BROWSER-ASSET-001');
  const departmentId = primary.departmentId, jurisdictionId = primary.jurisdictionId;

  await data(await api.post('/policies', { headers: auth(tokens.admin), data: {
    policyCode: 'C6_GLOBAL_READ_ONLY', versionNumber: 1, title: 'C6 Global Synthetic Read-only Policy',
    sourceTitle: 'Synthetic global test source', sourceReference: 'C6-GLOBAL-SYNTHETIC',
    effectiveFrom: '2026-01-01T00:00:00.000Z'
  } }));
  await data(await api.post('/policies', { headers: auth(tokens.policy), data: {
    policyCode: 'C6_BROWSER_DRAFT', versionNumber: 1, title: 'C6 Browser Lifecycle Draft',
    sourceTitle: 'Synthetic browser test source', sourceReference: 'C6-BROWSER-SYNTHETIC',
    departmentId, jurisdictionId, effectiveFrom: '2026-01-01T00:00:00.000Z'
  } }));

  const policy = await data(await api.post('/policies', { headers: auth(tokens.policy), data: {
    policyCode: 'C6_SYNTHETIC_POLICY', versionNumber: 1, title: 'C6 Synthetic Infrastructure Policy',
    sourceTitle: 'Synthetic C6 test source — not official policy', sourceReference: 'C6-SYNTHETIC-SOURCE',
    departmentId, jurisdictionId, effectiveFrom: '2026-01-01T00:00:00.000Z'
  } }));
  const actions = [];
  for (const spec of [
    { code: 'ACT_C6_SYNTHETIC_INSPECTION', title: 'C6 authorized inspection', classification: 'MANDATORY' },
    { code: 'ACT_C6_SYNTHETIC_TRAFFIC', title: 'C6 traffic assessment', classification: 'RECOMMENDED' }
  ]) {
    const action = await data(await api.post('/approved-actions', { headers: auth(tokens.policy), data: {
      actionCode: spec.code, versionNumber: 1, title: spec.title, category: 'C6_SYNTHETIC',
      description: `${spec.title} for isolated browser validation.`, applicability: { assetTypes: ['FLYOVER'] },
      enforcementClassification: spec.classification, provenancePolicyDocumentId: policy.id,
      sourceReference: 'C6-SYNTHETIC-SOURCE', departmentId, jurisdictionId, effectiveFrom: '2026-01-01T00:00:00.000Z'
    } }));
    actions.push(action);
    await data(await api.post(`/policies/${policy.id}/rules`, { headers: auth(tokens.policy), data: {
      ruleCode: `RULE_${spec.code}`, description: `Synthetic rule for ${spec.title}.`, conditions: { assetTypes: ['FLYOVER'] },
      actionId: action.id, enforcementLevel: spec.classification
    } }));
    for (const status of ['VALIDATION', 'APPROVED', 'ACTIVE']) {
      Object.assign(action, await data(await api.patch(`/approved-actions/${action.id}/lifecycle`, { headers: auth(tokens.policy), data: { status } })));
    }
    const template = await data(await api.post('/execution-templates', { headers: auth(tokens.policy), data: {
      templateCode: `EXEC_${spec.code}`, versionNumber: 1, approvedActionVersionId: action.id,
      title: `${spec.title} workflow`, description: 'Synthetic C6 governed execution template.',
      departmentId, jurisdictionId, effectiveFrom: '2026-01-01T00:00:00.000Z'
    } }));
    await data(await api.post(`/execution-templates/${template.id}/tasks`, { headers: auth(tokens.policy), data: {
      sequenceNumber: 1, taskCode: `TASK_${spec.code}`, title: `${spec.title} task`,
      description: 'Synthetic task requiring evidence and independent verification.', mandatory: true,
      evidenceRequired: true, verificationRequired: true, enabled: true
    } }));
    for (const status of ['VALIDATION', 'APPROVED', 'ACTIVE']) {
      await data(await api.patch(`/execution-templates/${template.id}/lifecycle`, { headers: auth(tokens.policy), data: { status } }));
    }
  }
  for (const status of ['VALIDATION', 'APPROVED', 'ACTIVE']) {
    await data(await api.patch(`/policies/${policy.id}/lifecycle`, { headers: auth(tokens.policy), data: { status, ...(status === 'APPROVED' ? { validationState: 'VALIDATED' } : {}) } }));
  }

  async function createJourney(label: 'CLOSED' | 'BROWSER') {
    const title = `C6 ${label} synthetic public report`;
    const receipt = await data(await api.post('/public-reports', { data: {
      title, description: 'Obviously synthetic C6 infrastructure report for isolated automated validation only.',
      category: 'BRIDGE_OR_FLYOVER', locationText: 'C6 synthetic test location',
      reporterName: 'Synthetic C6 Reporter', reporterContact: 'synthetic-c6-no-contact'
    } }));
    const reports = await data(await api.get('/public-reports', { headers: auth(tokens.admin) }));
    let report = reports.find((item: any) => item.reportNumber === receipt.reportNumber);
    report = await data(await api.post(`/public-reports/${report.id}/review`, { headers: auth(tokens.admin) }));
    report = await data(await api.patch(`/public-reports/${report.id}/routing`, { headers: auth(tokens.admin), data: { departmentId, jurisdictionId, assetId: asset.id } }));
    await data(await api.post(`/public-reports/${report.id}/accept`, { headers: auth(tokens.primary), data: { governmentSummary: 'Synthetic C6 report accepted for governed test assessment.' } }));
    report = await data(await api.get(`/public-reports/${report.id}`, { headers: auth(tokens.primary) }));
    const item = report.createdCase;
    expect(item).toBeTruthy();
    await data(await api.post('/inspections', { headers: auth(tokens.primary), data: {
      caseId: item.id, inspectionDate: '2026-08-23T06:00:00.000Z', structuralCondition: 'POOR', crackSeverity: 'SEVERE',
      corrosionLevel: 'MODERATE', trafficImportance: 'HIGH', hospitalRoute: true, weatherRisk: 'HIGH',
      heavyRainExpected: true, estimatedDailyUsers: 42000, inspectionNotes: 'Synthetic C6 inspection only.'
    } }));
    const firstRisk = await data(await api.post(`/cases/${item.id}/assess-risk`, { headers: auth(tokens.primary) }));
    const repeatedRisk = await data(await api.post(`/cases/${item.id}/assess-risk`, { headers: auth(tokens.primary) }));
    expect(repeatedRisk).toMatchObject({ id: firstRisk.id, reused: true });
    const risks = await data(await api.get(`/cases/${item.id}/risk-assessments`, { headers: auth(tokens.primary) }));
    expect(risks).toHaveLength(1);
    expect((await data(await api.get(`/cases/${item.id}/policy-resolution`, { headers: auth(tokens.primary) }))).status).toBe('RESOLVED');
    expect((await data(await api.get(`/cases/${item.id}/readiness`, { headers: auth(tokens.primary) }))).outcome).toBe('READY');
    const packageResult = await data(await api.post(`/cases/${item.id}/decision-packages`, { headers: auth(tokens.primary) }));
    const decisionPackage = packageResult.decisionPackage ?? packageResult;
    expect(decisionPackage.packageVersion).toBe(1);
    const orp = await data(await api.post(`/cases/${item.id}/orps`, { headers: auth(tokens.primary) }));
    expect(orp).toMatchObject({ versionNumber: 1, governanceMode: 'GOVERNED_POLICY' });
    await data(await api.post(`/orps/${orp.id}/decisions`, { headers: auth(tokens.verifier), data: { decisionType: 'APPROVED', remarks: 'Synthetic C6 approval.' } }));
    const planResult = await data(await api.post(`/orps/${orp.id}/execution-plan`, { headers: auth(tokens.primary) }));
    let plan = planResult.plan ?? planResult;
    plan = await data(await api.get(`/execution-plans/${plan.id}`, { headers: auth(tokens.primary) }));
    expect(plan.tasks.length).toBeGreaterThan(0);
    if (label === 'BROWSER') return { item, report, plan };
    for (const original of plan.tasks) {
      const eligible = await data(await api.get(`/execution-tasks/${original.id}/eligible-assignees`, { headers: auth(tokens.primary) }));
      expect(eligible.map((candidate: any) => candidate.id)).toContain(primary.id);
      let task = await data(await api.patch(`/execution-tasks/${original.id}/assignment`, { headers: auth(tokens.primary), data: { assigneeId: primary.id } }));
      task = await data(await api.patch(`/execution-tasks/${task.id}/status`, { headers: auth(tokens.primary), data: { status: 'IN_PROGRESS' } }));
      await data(await api.post(`/execution-tasks/${task.id}/evidence`, { headers: auth(tokens.primary), data: { evidenceType: 'COMPLETION_NOTE', description: 'Synthetic C6 completion evidence.' } }));
      task = await data(await api.post(`/execution-tasks/${task.id}/submit-completion`, { headers: auth(tokens.primary), data: { completionNote: 'Synthetic C6 completion submission.' } }));
      const selfVerify = await api.post(`/execution-tasks/${task.id}/verify`, { headers: auth(tokens.primary), data: { verificationNote: 'Must be rejected.' } });
      expect(selfVerify.status()).toBe(409);
      expect((await selfVerify.json()).error.code).toBe('FOUR_EYES_VIOLATION');
      task = await data(await api.post(`/execution-tasks/${task.id}/verify`, { headers: auth(tokens.verifier), data: { verificationNote: 'Independent synthetic C6 verification.' } }));
      expect(task).toMatchObject({ status: 'VERIFIED', verifiedBy: { id: verifier.id } });
    }
    const closure = await data(await api.post(`/cases/${item.id}/close`, { headers: auth(tokens.closer), data: {
      closureReason: 'EXECUTION_VERIFIED', closureSummary: 'Synthetic C6 closure after independent verification.'
    } }));
    expect(closure).toBeTruthy();
    const cases = await data(await api.get('/cases', { headers: auth(tokens.primary) }));
    expect(cases.find((entry: any) => entry.id === item.id).status).toBe('CLOSED');
    const tracking = await data(await api.get(`/public/tracking/${report.reportNumber}`));
    expect(tracking.status).toBe('RESOLVED');
    expect(JSON.stringify(tracking)).not.toMatch(/reporter(Name|Contact)|reviewer|verifier|closer|inspectionNote|decisionNote/i);
    return { item, report, plan };
  }

  const closed = await createJourney('CLOSED');
  const browser = await createJourney('BROWSER');
  expect(closed.item.id).not.toBe(browser.item.id);

  async function createRecovery(decisionType: 'MODIFICATION_REQUESTED' | 'REINSPECTION_REQUESTED') {
    const title = `C6 ${decisionType} synthetic recovery report`;
    const receipt = await data(await api.post('/public-reports', { data: {
      title, description: 'Synthetic C6 recovery report used only in the isolated automated schema.',
      category: 'BRIDGE_OR_FLYOVER', locationText: 'C6 synthetic recovery location'
    } }));
    const reports = await data(await api.get('/public-reports', { headers: auth(tokens.admin) }));
    let report = reports.find((entry: any) => entry.reportNumber === receipt.reportNumber);
    await data(await api.post(`/public-reports/${report.id}/review`, { headers: auth(tokens.admin) }));
    await data(await api.patch(`/public-reports/${report.id}/routing`, { headers: auth(tokens.admin), data: { departmentId, jurisdictionId, assetId: asset.id } }));
    await data(await api.post(`/public-reports/${report.id}/accept`, { headers: auth(tokens.primary), data: { governmentSummary: 'Synthetic recovery Case accepted for governed testing.' } }));
    report = await data(await api.get(`/public-reports/${report.id}`, { headers: auth(tokens.primary) }));
    const item = report.createdCase;
    const inspect = (date: string) => api.post('/inspections', { headers: auth(tokens.primary), data: {
      caseId: item.id, inspectionDate: date, structuralCondition: 'POOR', crackSeverity: 'SEVERE',
      corrosionLevel: 'MODERATE', trafficImportance: 'HIGH', hospitalRoute: true, weatherRisk: 'HIGH',
      heavyRainExpected: true, estimatedDailyUsers: 42000, inspectionNotes: 'Synthetic recovery inspection.'
    } });
    const inspection1 = await data(await inspect('2026-08-23T07:00:00.000Z'));
    const risk1 = await data(await api.post(`/cases/${item.id}/assess-risk`, { headers: auth(tokens.primary) }));
    expect((await data(await api.get(`/cases/${item.id}/readiness`, { headers: auth(tokens.primary) }))).outcome).toBe('READY');
    const package1Result = await data(await api.post(`/cases/${item.id}/decision-packages`, { headers: auth(tokens.primary) }));
    const package1 = package1Result.decisionPackage ?? package1Result;
    const orp1 = await data(await api.post(`/cases/${item.id}/orps`, { headers: auth(tokens.primary) }));
    const adverse = await data(await api.post(`/orps/${orp1.id}/decisions`, { headers: auth(tokens.verifier), data: {
      decisionType, reason: `Synthetic C6 ${decisionType} recovery request.`
    } }));
    expect(adverse.decisionType).toBe(decisionType);
    const duplicate = await api.post(`/orps/${orp1.id}/decisions`, { headers: auth(tokens.verifier), data: { decisionType: 'APPROVED' } });
    expect(duplicate.status()).toBe(409);
    const inspection2 = await data(await inspect('2026-08-24T07:00:00.000Z'));
    expect(inspection2.id).not.toBe(inspection1.id);
    const risk2 = await data(await api.post(`/cases/${item.id}/assess-risk`, { headers: auth(tokens.primary) }));
    expect(risk2.id).not.toBe(risk1.id);
    expect(risk2.inspectionId).toBe(inspection2.id);
    expect((await data(await api.get(`/cases/${item.id}/readiness`, { headers: auth(tokens.primary) }))).outcome).toBe('READY');
    const package2Result = await data(await api.post(`/cases/${item.id}/decision-packages`, { headers: auth(tokens.primary) }));
    const package2 = package2Result.decisionPackage ?? package2Result;
    const orp2 = await data(await api.post(`/cases/${item.id}/orps`, { headers: auth(tokens.primary) }));
    expect(package2).toMatchObject({ packageVersion: package1.packageVersion + 1 });
    expect(orp2).toMatchObject({ versionNumber: orp1.versionNumber + 1, decisionPackageId: package2.id, governanceMode: 'GOVERNED_POLICY' });
    expect(await data(await api.get(`/cases/${item.id}/inspections`, { headers: auth(tokens.primary) }))).toHaveLength(2);
    expect(await data(await api.get(`/cases/${item.id}/risk-assessments`, { headers: auth(tokens.primary) }))).toHaveLength(2);
    expect(await data(await api.get(`/cases/${item.id}/decision-packages`, { headers: auth(tokens.primary) }))).toHaveLength(2);
    expect(await data(await api.get(`/cases/${item.id}/orps`, { headers: auth(tokens.primary) }))).toHaveLength(2);
    expect(await data(await api.get(`/cases/${item.id}/decisions`, { headers: auth(tokens.primary) }))).toHaveLength(1);
  }

  await createRecovery('MODIFICATION_REQUESTED');
  await createRecovery('REINSPECTION_REQUESTED');
  await api.dispose();
});
