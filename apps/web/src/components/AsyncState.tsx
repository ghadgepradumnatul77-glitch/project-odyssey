import { isApiClientError } from '../api/errors';

export function safeErrorMessage(error: unknown) {
  if (!isApiClientError(error)) return 'This data is currently unavailable.';
  if (error.code === 'REPORTING_DATA_INTEGRITY_ERROR') return 'The authoritative workflow record could not be presented because related records are inconsistent.';
  if (error.code === 'INVALID_INPUT') return 'The requested reporting page could not be loaded. Refresh and try again.';
  if (error.status === 403) return 'You do not have authority to view this information.';
  if (error.status === 404) return 'Case unavailable or no longer accessible.';
  if (error.status === 409) return 'This information changed during the workflow. Refresh and try again.';
  if (error.kind === 'network') return 'The service could not be reached. Check your connection and retry.';
  return 'This data is currently unavailable.';
}
export function Loading({ label }: { label: string }) { return <p className="async-state" role="status">Loading {label}…</p>; }
export function Empty({ children }: { children: string }) { return <p className="async-state empty-state">{children}</p>; }
export function ErrorState({ error, retry }: { error: unknown; retry?(): void }) { return <div className="async-state error-state" role="alert"><p>{safeErrorMessage(error)}</p>{retry && <button className="secondary-button" onClick={retry}>Retry</button>}</div>; }
