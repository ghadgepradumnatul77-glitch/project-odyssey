import { describe, expect, it } from 'vitest';
// @ts-expect-error operator contract intentionally remains plain ESM
import { PILOT_BACKUP_COMMAND, validatePilotReadiness } from '../../../scripts/pilot-readiness.mjs';

const sha = 'a'.repeat(40);
const valid = () => ({
  contractVersion: 'ODYSSEY_PILOT_READINESS_V1', deploymentMode: 'LOOPBACK_ONLY',
  externalBoundary: { remoteAccessEnabled: false, tlsNetworkBoundaryApproved: false, evidenceReference: null },
  backupSchedule: { configured: true, cadenceHours: 24, command: PILOT_BACKUP_COMMAND, evidenceReference: 'scheduler-record-1' },
  release: { gitSha: sha, evidenceReference: 'release-record-1', images: ['db','migrate','api','web','backup'].map((service) => ({ service, reference: `registry/${service}:pilot`, digest: `sha256:${'b'.repeat(64)}` })) },
  backupGovernance: { encryptedDestinationApproved: true, encryptionEvidenceReference: 'storage-approval-1', retentionOffHostPolicyApproved: true, retentionOffHostEvidenceReference: 'retention-policy-1' },
  owners: { application: 'owner-application', recovery: 'owner-recovery', security: 'owner-security' },
  restoreDrill: { performedAt: '2026-08-15T12:00:00.000Z', evidenceReference: 'restore-drill-1' }
});
const status = (value: ReturnType<typeof validatePilotReadiness>, code: string) => value.find((item: { code: string }) => item.code === code)?.status;
const options = { now: new Date('2026-08-31T12:00:00.000Z'), releaseSha: sha };

describe('bounded pilot readiness evidence', () => {
  it('accepts a complete loopback-only readiness contract', () => expect(validatePilotReadiness(valid(), options).every((item: { status: string }) => item.status === 'PASS')).toBe(true));
  it('requires an exact scheduler command, at-most-24-hour cadence, and evidence', () => { const value=valid(); value.backupSchedule.cadenceHours=25; expect(status(validatePilotReadiness(value,options),'BACKUP_SCHEDULE')).toBe('FAIL'); });
  it('requires approved referenced TLS boundary before remote access', () => { const value=valid(); value.deploymentMode='REMOTE'; value.externalBoundary.remoteAccessEnabled=true; expect(status(validatePilotReadiness(value,options),'EXTERNAL_BOUNDARY')).toBe('FAIL'); value.externalBoundary.tlsNetworkBoundaryApproved=true; value.externalBoundary.evidenceReference='tls-approval-1'; expect(status(validatePilotReadiness(value,options),'EXTERNAL_BOUNDARY')).toBe('PASS'); });
  it('requires three distinct owner assignments', () => { const value=valid(); value.owners.security=value.owners.recovery; expect(status(validatePilotReadiness(value,options),'OWNER_ASSIGNMENTS')).toBe('FAIL'); });
  it('requires encrypted storage and retention/off-host policy approvals', () => { const value=valid(); value.backupGovernance.encryptedDestinationApproved=false; expect(status(validatePilotReadiness(value,options),'BACKUP_GOVERNANCE')).toBe('FAIL'); });
  it('rejects missing or stale restore-drill evidence', () => { const value=valid(); value.restoreDrill.performedAt='2026-01-01T00:00:00.000Z'; expect(status(validatePilotReadiness(value,options),'RESTORE_DRILL_EVIDENCE')).toBe('FAIL'); });
  it('requires matching Git SHA and exact image digests, including AI when enabled', () => { const value=valid(); expect(status(validatePilotReadiness(value,{...options,intelligenceEnabled:true}),'RELEASE_IMAGE_IDENTITIES')).toBe('FAIL'); value.release.images.push({service:'ai',reference:'registry/ai:pilot',digest:`sha256:${'c'.repeat(64)}`}); expect(status(validatePilotReadiness(value,{...options,intelligenceEnabled:true}),'RELEASE_IMAGE_IDENTITIES')).toBe('PASS'); });
});
