export const PILOT_READINESS_CONTRACT = 'ODYSSEY_PILOT_READINESS_V1';
export const PILOT_RESTORE_DRILL_MAX_AGE_DAYS = 90;
export const PILOT_BACKUP_COMMAND = 'docker compose --env-file .env.pilot --profile backup run --rm backup';

const pass = (code, detail) => ({ code, status: 'PASS', detail });
const fail = (code, detail) => ({ code, status: 'FAIL', detail });
const reference = (value) => typeof value === 'string' && value.trim().length >= 3 && !/replace|example|todo|tbd/i.test(value);
const digest = (value) => typeof value === 'string' && /^sha256:[0-9a-f]{64}$/.test(value);

export function validatePilotReadiness(value, { now = new Date(), releaseSha = null, intelligenceEnabled = false } = {}) {
  const results = [];
  const contract = value && typeof value === 'object' ? value : {};
  results.push(contract.contractVersion === PILOT_READINESS_CONTRACT
    ? pass('READINESS_CONTRACT', 'Pilot readiness evidence uses the supported contract.')
    : fail('READINESS_CONTRACT', 'Pilot readiness evidence is missing or uses an unsupported contract.'));

  const schedule = contract.backupSchedule || {};
  results.push(schedule.configured === true && Number(schedule.cadenceHours) > 0 && Number(schedule.cadenceHours) <= 24
    && schedule.command === PILOT_BACKUP_COMMAND && reference(schedule.evidenceReference)
    ? pass('BACKUP_SCHEDULE', 'Host scheduler evidence invokes the validated backup command at least every 24 hours.')
    : fail('BACKUP_SCHEDULE', 'A host scheduler must invoke the exact validated backup command at least every 24 hours and have an evidence reference.'));

  const boundary = contract.externalBoundary || {};
  const loopback = contract.deploymentMode === 'LOOPBACK_ONLY' && boundary.remoteAccessEnabled === false;
  const remote = contract.deploymentMode === 'REMOTE' && boundary.remoteAccessEnabled === true
    && boundary.tlsNetworkBoundaryApproved === true && reference(boundary.evidenceReference);
  results.push(loopback || remote
    ? pass('EXTERNAL_BOUNDARY', loopback ? 'Deployment remains loopback-only.' : 'Remote access has an approved TLS/network boundary declaration.')
    : fail('EXTERNAL_BOUNDARY', 'Remote access requires an approved TLS/network boundary reference; otherwise deployment must remain loopback-only.'));

  const owners = contract.owners || {};
  const ownerValues = [owners.application, owners.recovery, owners.security];
  results.push(ownerValues.every(reference) && new Set(ownerValues.map((item) => item.trim().toLowerCase())).size === 3
    ? pass('OWNER_ASSIGNMENTS', 'Application, recovery, and security ownership assignments are present and distinct.')
    : fail('OWNER_ASSIGNMENTS', 'Distinct application, recovery, and security owner references are required.'));

  const backup = contract.backupGovernance || {};
  results.push(backup.encryptedDestinationApproved === true && backup.retentionOffHostPolicyApproved === true
    && reference(backup.encryptionEvidenceReference) && reference(backup.retentionOffHostEvidenceReference)
    ? pass('BACKUP_GOVERNANCE', 'Encrypted destination and retention/off-host policy approvals are recorded.')
    : fail('BACKUP_GOVERNANCE', 'Protected encrypted storage and approved retention/off-host policy references are required.'));

  const drill = contract.restoreDrill || {};
  const performedAt = new Date(drill.performedAt);
  const ageMs = now.getTime() - performedAt.getTime();
  const maxAgeMs = PILOT_RESTORE_DRILL_MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
  results.push(Number.isFinite(performedAt.getTime()) && ageMs >= 0 && ageMs <= maxAgeMs && reference(drill.evidenceReference)
    ? pass('RESTORE_DRILL_EVIDENCE', `Initial restore-drill evidence is present and no older than ${PILOT_RESTORE_DRILL_MAX_AGE_DAYS} days.`)
    : fail('RESTORE_DRILL_EVIDENCE', `A restore drill from the previous ${PILOT_RESTORE_DRILL_MAX_AGE_DAYS} days and its evidence reference are required.`));

  const release = contract.release || {};
  const requiredServices = ['db', 'migrate', 'api', 'web', 'backup', ...(intelligenceEnabled ? ['ai'] : [])];
  const images = Array.isArray(release.images) ? release.images : [];
  const imageMap = new Map(images.map((item) => [item?.service, item]));
  const imagesValid = requiredServices.every((service) => {
    const image = imageMap.get(service);
    return image && reference(image.reference) && digest(image.digest);
  });
  const shaValid = /^[0-9a-f]{40}$/.test(release.gitSha || '') && (!releaseSha || release.gitSha === releaseSha);
  results.push(shaValid && imagesValid && reference(release.evidenceReference)
    ? pass('RELEASE_IMAGE_IDENTITIES', 'Git release and exact required image digests are recorded.')
    : fail('RELEASE_IMAGE_IDENTITIES', 'Published Git SHA, exact required image digests, and release evidence reference are required.'));

  return results;
}

export function parsePilotReadiness(text) {
  const value = JSON.parse(text);
  if (!value || Array.isArray(value) || typeof value !== 'object') throw new Error('PILOT_READINESS_OBJECT_REQUIRED');
  return value;
}
