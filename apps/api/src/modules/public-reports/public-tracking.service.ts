import { CaseStatus, Prisma, PublicReportStatus } from '../../generated/prisma';
import prisma from '../../lib/prisma';

export class PublicTrackingNotFoundError extends Error {}

// New references carry 96 random bits; the six-hex branch preserves existing pilot references.
export const PUBLIC_REPORT_REFERENCE_PATTERN = /^JNV-PUB-\d{8}-(?:[A-F0-9]{24}|[A-F0-9]{6})$/;

export type PublicProgressStage =
  | 'REPORT_RECEIVED'
  | 'UNDER_GOVERNMENT_REVIEW'
  | 'CLOSED_AFTER_REVIEW'
  | 'CASE_RECORDED'
  | 'ASSESSMENT_IN_PROGRESS'
  | 'ACTION_PLANNED'
  | 'ACTION_IN_PROGRESS'
  | 'VERIFICATION'
  | 'RESOLVED';

export type PublicTimelineState = 'COMPLETED' | 'CURRENT' | 'PENDING';

export interface PublicTrackingTimelineItem {
  key: 'RECEIVED' | 'REVIEW' | 'CASE' | 'ASSESSMENT' | 'ACTION' | 'VERIFICATION' | 'RESOLUTION';
  label: string;
  state: PublicTimelineState;
  occurredAt: Date | null;
}

export interface PublicTrackingDto {
  reportReference: string;
  submittedAt: Date;
  category: string;
  title: string;
  locationText: string;
  status: PublicProgressStage;
  statusLabel: string;
  lastProgressAt: Date;
  governedCaseCreated: boolean;
  caseReference: string | null;
  outcome: 'ACTIVE' | 'CLOSED_AFTER_REVIEW' | 'RESOLVED';
  timeline: PublicTrackingTimelineItem[];
}

const trackingSelect = {
  reportNumber: true,
  title: true,
  category: true,
  locationText: true,
  submittedAt: true,
  status: true,
  reviewStartedAt: true,
  decisionAt: true,
  createdCase: {
    select: {
      caseNumber: true,
      status: true,
      createdAt: true,
      closedAt: true,
      inspections: { orderBy: { createdAt: 'asc' as const }, take: 1, select: { createdAt: true } },
      operationalResponsePlans: { orderBy: { createdAt: 'asc' as const }, take: 1, select: { createdAt: true } },
      executionPlans: { orderBy: { createdAt: 'asc' as const }, take: 1, select: { createdAt: true, startedAt: true, completedAt: true } },
      closure: { select: { createdAt: true } }
    }
  }
} satisfies Prisma.PublicReportSelect;

type TrackingRecord = Prisma.PublicReportGetPayload<{ select: typeof trackingSelect }>;

const caseStage: Record<CaseStatus, PublicProgressStage> = {
  NEW: 'CASE_RECORDED',
  INSPECTION_REQUIRED: 'ASSESSMENT_IN_PROGRESS',
  INSPECTION_IN_PROGRESS: 'ASSESSMENT_IN_PROGRESS',
  UNDER_ANALYSIS: 'ASSESSMENT_IN_PROGRESS',
  ORP_READY: 'ACTION_PLANNED',
  UNDER_REVIEW: 'ACTION_PLANNED',
  APPROVED: 'ACTION_IN_PROGRESS',
  EXECUTION: 'ACTION_IN_PROGRESS',
  VERIFICATION: 'VERIFICATION',
  CLOSED: 'RESOLVED',
  CANCELLED: 'RESOLVED'
};

const labels: Record<PublicProgressStage, string> = {
  REPORT_RECEIVED: 'Report received',
  UNDER_GOVERNMENT_REVIEW: 'Under government review',
  CLOSED_AFTER_REVIEW: 'Closed after government review',
  CASE_RECORDED: 'Case recorded',
  ASSESSMENT_IN_PROGRESS: 'Assessment in progress',
  ACTION_PLANNED: 'Government action planned',
  ACTION_IN_PROGRESS: 'Government action in progress',
  VERIFICATION: 'Verification in progress',
  RESOLVED: 'Resolved'
};

function timeline(record: TrackingRecord, stage: PublicProgressStage): PublicTrackingTimelineItem[] {
  const target = record.createdCase;
  const inspectionAt = target?.inspections[0]?.createdAt ?? null;
  const planAt = target?.operationalResponsePlans[0]?.createdAt ?? null;
  const execution = target?.executionPlans[0];
  const actionAt = execution?.startedAt ?? execution?.createdAt ?? null;
  const verificationAt = target?.status === CaseStatus.VERIFICATION || target?.status === CaseStatus.CLOSED
    ? execution?.completedAt ?? null : null;
  const resolvedAt = target?.closure?.createdAt ?? target?.closedAt ?? null;
  const dates = [record.submittedAt, record.reviewStartedAt, target?.createdAt ?? null, inspectionAt, planAt ?? actionAt,
    verificationAt, stage === 'CLOSED_AFTER_REVIEW' ? record.decisionAt : resolvedAt];
  const currentIndex = stage === 'REPORT_RECEIVED' ? 0 : stage === 'UNDER_GOVERNMENT_REVIEW' ? 1
    : stage === 'CLOSED_AFTER_REVIEW' ? 6 : stage === 'CASE_RECORDED' ? 2
    : stage === 'ASSESSMENT_IN_PROGRESS' ? 3 : stage === 'ACTION_PLANNED' || stage === 'ACTION_IN_PROGRESS' ? 4
    : stage === 'VERIFICATION' ? 5 : 6;
  const items: Array<[PublicTrackingTimelineItem['key'], string]> = [
    ['RECEIVED', 'Report received'], ['REVIEW', 'Government review'], ['CASE', 'Case recorded'],
    ['ASSESSMENT', 'Assessment'], ['ACTION', 'Government action'], ['VERIFICATION', 'Verification'], ['RESOLUTION', 'Resolution']
  ];
  return items.map(([key, label], index) => ({
    key, label,
    state: index < currentIndex || (stage === 'RESOLVED' && index === currentIndex) || (stage === 'CLOSED_AFTER_REVIEW' && (index === 0 || index === 1 || index === 6)) ? 'COMPLETED' : index === currentIndex ? 'CURRENT' : 'PENDING',
    occurredAt: dates[index]
  }));
}

export function projectPublicTracking(record: TrackingRecord): PublicTrackingDto {
  let status: PublicProgressStage;
  if (record.status === PublicReportStatus.SUBMITTED) status = 'REPORT_RECEIVED';
  else if (record.status === PublicReportStatus.UNDER_REVIEW) status = 'UNDER_GOVERNMENT_REVIEW';
  else if (record.status === PublicReportStatus.REJECTED) status = 'CLOSED_AFTER_REVIEW';
  else if (record.createdCase) status = caseStage[record.createdCase.status];
  else status = 'UNDER_GOVERNMENT_REVIEW';
  const progressTimeline = timeline(record, status);
  const lastProgressAt = progressTimeline.reduce((latest, item) => item.occurredAt && item.occurredAt > latest ? item.occurredAt : latest, record.submittedAt);
  return {
    reportReference: record.reportNumber,
    submittedAt: record.submittedAt,
    category: record.category,
    title: record.title,
    locationText: record.locationText,
    status,
    statusLabel: labels[status],
    lastProgressAt,
    governedCaseCreated: Boolean(record.createdCase),
    caseReference: record.createdCase?.caseNumber ?? null,
    outcome: status === 'CLOSED_AFTER_REVIEW' ? 'CLOSED_AFTER_REVIEW' : status === 'RESOLVED' ? 'RESOLVED' : 'ACTIVE',
    timeline: progressTimeline
  };
}

export async function getPublicTracking(reference: string): Promise<PublicTrackingDto> {
  const record = await prisma.publicReport.findUnique({ where: { reportNumber: reference }, select: trackingSelect });
  if (!record) throw new PublicTrackingNotFoundError();
  return projectPublicTracking(record);
}
