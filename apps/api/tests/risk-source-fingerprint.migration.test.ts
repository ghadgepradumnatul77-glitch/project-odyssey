import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('risk source fingerprint migration safety', () => {
  const sql = readFileSync(resolve(__dirname, '../../../database/prisma/migrations/20260823010000_add_risk_source_fingerprint/migration.sql'), 'utf8');

  it('is additive, backfills from immutable inspection fields, and enforces uniqueness', () => {
    expect(sql).toContain('ADD COLUMN "sourceFingerprint" TEXT');
    expect(sql).toContain('UPDATE "RiskAssessment" AS risk');
    expect(sql).toContain('FROM "Inspection" AS inspection');
    expect(sql).toContain('ALTER COLUMN "sourceFingerprint" SET NOT NULL');
    expect(sql).toContain('CREATE UNIQUE INDEX "RiskAssessment_sourceFingerprint_key"');
    expect(sql).toContain("'sha256:'");
  });

  it('does not delete history or mutate deterministic outputs and Case projections', () => {
    expect(sql).not.toMatch(/\b(?:DROP|TRUNCATE|DELETE)\b/i);
    for (const column of ['riskScore', 'riskLevel', 'priorityLevel', 'reasonCodes', 'reasons']) {
      expect(sql).not.toMatch(new RegExp(`SET\\s+"${column}"`, 'i'));
    }
    expect(sql).not.toMatch(/UPDATE\s+"Case"/i);
  });
});
