import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = resolve(__dirname, '../../..');
const schema = readFileSync(resolve(root, 'database/prisma/schema.prisma'), 'utf8');
const sql = readFileSync(resolve(root, 'database/prisma/migrations/20260910090000_add_asset_attention_reviews/migration.sql'), 'utf8');
const reviewModel = schema.match(/model AssetAttentionReview \{[\s\S]*?\n\}/)?.[0] ?? '';
const signalModel = schema.match(/model AssetAttentionReviewSignal \{[\s\S]*?\n\}/)?.[0] ?? '';

describe('P4.3 Asset attention review schema foundation', () => {
  it('defines only the approved controlled human dispositions', () => {
    const values = schema.match(/enum AssetAttentionDisposition \{([\s\S]*?)\}/)?.[1].trim().split(/\s+/);
    expect(values).toEqual(['ACKNOWLEDGED', 'INSPECTION_FOLLOW_UP_RECOMMENDED', 'CASE_REVIEW_RECOMMENDED', 'MONITOR_WITH_RECORDED_RATIONALE', 'DATA_QUALITY_FOLLOW_UP', 'GOVERNED_ESCALATION_RECOMMENDED']);
  });

  it('keeps reviews append-only and stores exact human, scope and projection provenance', () => {
    for (const field of ['assetId', 'caseId', 'reviewerId', 'reviewerRole', 'departmentId', 'jurisdictionId', 'disposition', 'rationale', 'attentionContractVersion', 'attentionCalculationVersion', 'projectionAsOf', 'sourceSetFingerprint', 'clientRequestId', 'supersedesReviewId', 'createdAt']) expect(reviewModel).toMatch(new RegExp(`\\b${field}\\b`));
    expect(reviewModel).not.toMatch(/\bupdatedAt\b|\bdeletedAt\b|\bstatus\b/);
    expect(reviewModel).toContain('@@unique([reviewerId, clientRequestId])');
    expect(reviewModel).toContain('supersedesReviewId          String?                   @unique');
  });

  it('stores controlled selected-signal identity and a fingerprint, never arbitrary snapshots', () => {
    for (const field of ['reviewId', 'category', 'signalCode', 'state', 'evidenceReferenceFingerprint']) expect(signalModel).toMatch(new RegExp(`\\b${field}\\b`));
    expect(signalModel).not.toMatch(/\bJson\b|snapshot|payload|narrative|referenceUrl|reporter/i);
    expect(signalModel).toContain('@@unique([reviewId, category, signalCode, state, evidenceReferenceFingerprint])');
  });

  it('uses an additive, non-destructive migration with required constraints and indexes', () => {
    expect(sql).toContain('CREATE TYPE "AssetAttentionDisposition"');
    expect(sql).toContain('CREATE TABLE "AssetAttentionReview"');
    expect(sql).toContain('CREATE TABLE "AssetAttentionReviewSignal"');
    expect(sql).toContain('AssetAttentionReview_reviewerId_clientRequestId_key');
    expect(sql).toContain('AssetAttentionReview_assetId_createdAt_id_idx');
    expect(sql).toContain('AssetAttentionReview_caseId_createdAt_id_idx');
    for (const target of ['Asset', 'Case', 'User', 'AssetAttentionReview']) expect(sql).toContain(`REFERENCES "${target}"("id") ON DELETE RESTRICT`);
    expect(sql).not.toMatch(/(?:^|;)\s*(?:DROP|TRUNCATE|DELETE|UPDATE)\b/i);
    expect(sql).not.toMatch(/ALTER TABLE "(?:Case|RiskAssessment|OperationalResponsePlan|ExecutionPlan|ExecutionTask)"/);
  });
});
