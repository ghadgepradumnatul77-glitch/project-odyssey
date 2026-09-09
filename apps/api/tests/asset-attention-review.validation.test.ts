import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { attentionCategories, attentionReasonCodes, attentionStates } from '../src/modules/assets/asset-attention.contracts';
import { attentionDispositions, attentionReviewErrors, assetAttentionReviewError } from '../src/modules/assets/asset-attention-review.contracts';
import { validateAssetAttentionReview } from '../src/modules/assets/asset-attention-review.validation';

const digest = `sha256:${'a'.repeat(64)}`;
const signal = { category: 'EVIDENCE_COVERAGE_GAP', signalCode: 'NO_INSPECTION_EVIDENCE', state: 'PRESENT', evidenceReferenceFingerprint: digest };
const valid = () => ({ disposition: 'ACKNOWLEDGED', rationale: ' Reviewed the available evidence. ', clientRequestId: ' request-1 ', expectedSourceSetFingerprint: digest, selectedSignals: [{ ...signal }] });
const reject = (input: unknown) => expect(validateAssetAttentionReview(input)).toEqual(assetAttentionReviewError('INVALID_REVIEW_INPUT'));

describe('Asset attention review pure validation', () => {
  it.each(attentionDispositions)('accepts approved disposition %s and normalizes text', disposition => {
    const result = validateAssetAttentionReview({ ...valid(), disposition });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.rationale).toBe('Reviewed the available evidence.');
      expect(result.data.clientRequestId).toBe('request-1');
    }
  });
  it('matches the persisted disposition enum without importing Prisma', () => {
    const schema = readFileSync(resolve(__dirname, '../../../database/prisma/schema.prisma'), 'utf8');
    expect(schema.match(/enum AssetAttentionDisposition \{([^}]+)\}/)?.[1].trim().split(/\s+/)).toEqual(attentionDispositions);
  });
  it.each(['APPROVED', 'EXECUTE', 'acknowledged', '', null])('rejects unsupported disposition %s', disposition => reject({ ...valid(), disposition }));
  it.each(['rationale', 'clientRequestId'])('requires bounded text for %s', field => {
    const limit = field === 'rationale' ? 2000 : 100;
    for (const value of [undefined, null, '', ' \n\t ', 42, 'x'.repeat(limit + 1)]) reject({ ...valid(), [field]: value });
    expect(validateAssetAttentionReview({ ...valid(), [field]: 'x'.repeat(limit) }).success).toBe(true);
  });
  it.each(['caseId', 'supersedesReviewId'])('validates optional UUID %s', field => {
    expect(validateAssetAttentionReview({ ...valid(), [field]: '123e4567-e89b-42d3-a456-426614174000' }).success).toBe(true);
    for (const value of ['', null, 12, 'case-1', 'x'.repeat(1000)]) reject({ ...valid(), [field]: value });
  });
  it.each(['expectedSourceSetFingerprint', 'evidenceReferenceFingerprint'])('requires canonical SHA-256 for %s', field => {
    for (const value of ['', null, 'a'.repeat(64), `sha256:${'A'.repeat(64)}`, `sha256:${'g'.repeat(64)}`, `sha256:${'a'.repeat(63)}`, `${digest}\n`]) {
      reject(field === 'expectedSourceSetFingerprint' ? { ...valid(), [field]: value } : { ...valid(), selectedSignals: [{ ...signal, [field]: value }] });
    }
  });
  it('requires one to 100 signals and rejects duplicates', () => {
    for (const selectedSignals of [undefined, null, [], {}, [signal, { ...signal }]]) reject({ ...valid(), selectedSignals });
    const selectedSignals = Array.from({ length: 100 }, (_, i) => ({ ...signal, evidenceReferenceFingerprint: `sha256:${i.toString(16).padStart(64, '0')}` }));
    expect(validateAssetAttentionReview({ ...valid(), selectedSignals }).success).toBe(true);
    reject({ ...valid(), selectedSignals: [...selectedSignals, { ...signal }] });
  });
  it('accepts controlled vocabulary and preserves unknown/conflict without assigning authority', () => {
    for (const [field, values] of [['category', attentionCategories], ['signalCode', attentionReasonCodes], ['state', attentionStates]] as const) {
      for (const value of values) expect(validateAssetAttentionReview({ ...valid(), selectedSignals: [{ ...signal, [field]: value }] }).success).toBe(true);
      for (const value of ['invented', null, '', 1]) reject({ ...valid(), selectedSignals: [{ ...signal, [field]: value }] });
    }
  });
  it.each(['reviewerId', 'reviewerRole', 'userId', 'role', 'departmentId', 'jurisdictionId', 'assetId', 'createdAt', 'projectionAsOf', 'attentionContractVersion', 'attentionCalculationVersion', 'sourceSetFingerprint', 'riskScore', 'riskLevel', 'priorityLevel', 'status', 'workflow', 'task', 'taskId', 'approval', 'decision', 'execute', 'selectedSignalsExtra'])('rejects client-owned override %s', field => reject({ ...valid(), [field]: 'sensitive-value' }));
  it.each(['reviewerId', 'riskScore', 'evidenceReferences', 'snapshot', 'payload', 'narrative', 'url'])('rejects extra signal field %s', field => reject({ ...valid(), selectedSignals: [{ ...signal, [field]: 'sensitive-value' }] }));
  it('does not leak values or arbitrary property names and does not mutate input', () => {
    const input = valid();
    const before = JSON.stringify(input);
    Object.freeze(input.selectedSignals[0]); Object.freeze(input.selectedSignals); Object.freeze(input);
    expect(validateAssetAttentionReview(input).success).toBe(true);
    expect(JSON.stringify(input)).toBe(before);
    const result = validateAssetAttentionReview({ ...valid(), 'Bearer secret-token': 'reporter@example.com' });
    expect(JSON.stringify(result)).not.toMatch(/secret-token|reporter@example|Bearer/);
    for (const value of [null, undefined, [], 'secret', 42]) reject(value);
  });
  it('exposes only fixed error contracts for stale, replay conflicts, links and authorization', () => {
    for (const code of Object.keys(attentionReviewErrors) as (keyof typeof attentionReviewErrors)[]) {
      expect(assetAttentionReviewError(code)).toEqual({ success: false, error: { code, message: attentionReviewErrors[code].message } });
    }
    expect(attentionReviewErrors.STALE_PROJECTION.status).toBe(409);
    expect(attentionReviewErrors.IDEMPOTENCY_CONFLICT.status).toBe(409);
    expect(attentionReviewErrors.RESOURCE_NOT_FOUND.status).toBe(404);
  });
});
