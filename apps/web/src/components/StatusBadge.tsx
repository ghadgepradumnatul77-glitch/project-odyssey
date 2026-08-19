const presentationTerms: Record<string, string> = { ORP_READY: 'Plan Ready', ORP_GENERATED: 'Action Plan Generated', ORP_DECIDED: 'Action Plan Decision' };
export const humanize = (value: string | null | undefined) => value ? presentationTerms[value] ?? value.replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase()) : 'Not assigned';
export default function StatusBadge({ value, kind = 'status', emptyLabel }: { value: string | null | undefined; kind?: 'status' | 'risk' | 'priority'; emptyLabel?: string }) {
  return <span className={`status-chip ${kind} value-${(value ?? 'none').toLowerCase().replaceAll('_', '-')}`}>{value ? humanize(value) : (emptyLabel ?? humanize(value))}</span>;
}
