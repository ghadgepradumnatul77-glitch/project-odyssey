export const humanize = (value: string | null | undefined) => value ? value.replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase()) : 'Not assigned';
export default function StatusBadge({ value, kind = 'status' }: { value: string | null | undefined; kind?: 'status' | 'risk' | 'priority' }) {
  return <span className={`status-chip ${kind} value-${(value ?? 'none').toLowerCase().replaceAll('_', '-')}`}>{humanize(value)}</span>;
}
