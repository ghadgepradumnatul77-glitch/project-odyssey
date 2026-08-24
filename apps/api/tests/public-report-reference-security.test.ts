import { describe, expect, it, vi } from 'vitest';

const create = vi.hoisted(() => vi.fn(async ({ data }) => ({
  reportNumber: data.reportNumber,
  status: 'SUBMITTED',
  submittedAt: new Date('2026-08-24T00:00:00Z')
})));
vi.mock('../src/lib/prisma', () => ({ default: { publicReport: { create } } }));

import { createCitizenPublicReport } from '../src/modules/public-reports/public-report.service';
import { PUBLIC_REPORT_REFERENCE_PATTERN } from '../src/modules/public-reports/public-tracking.service';

describe('citizen tracking reference security', () => {
  it('issues 96-bit random references and retains legacy lookup compatibility', async () => {
    const result = await createCitizenPublicReport({
      title: 'Unsafe bridge surface', description: 'The bridge surface has a large visible defect.',
      category: 'BRIDGE_OR_FLYOVER', locationText: 'Public bridge'
    });
    expect(result.reportNumber).toMatch(/^JNV-PUB-\d{8}-[A-F0-9]{24}$/);
    expect(PUBLIC_REPORT_REFERENCE_PATTERN.test(result.reportNumber)).toBe(true);
    expect(PUBLIC_REPORT_REFERENCE_PATTERN.test('JNV-PUB-20260819-12EE4F')).toBe(true);
    expect(PUBLIC_REPORT_REFERENCE_PATTERN.test('JNV-PUB-20260819-123456789012')).toBe(false);
  });
});
