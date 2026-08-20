import { isApiClientError } from '../../api/errors';

export function mutationMessage(error: unknown) {
  if (!isApiClientError(error)) return 'The action could not be recorded. Please try again.';
  if (error.code === 'FOUR_EYES_VIOLATION') return 'Independent verification is required. The same officer cannot verify this recorded completion.';
  if (error.code === 'EVIDENCE_REQUIRED') return 'At least one evidence record is required before recorded completion can proceed.';
  if (error.code === 'EXECUTION_TEMPLATE_NOT_GOVERNED') return 'Execution cannot be prepared because an authorized execution template has not been established for this action version.';
  if (error.code === 'EXECUTION_TEMPLATE_GOVERNANCE_CONFLICT') return 'Execution cannot be prepared because multiple applicable authorized templates create an unresolved governance conflict.';
  if (error.code === 'GOVERNED_ORP_INTEGRITY_ERROR') return 'Execution cannot be prepared because the governed Action Plan provenance is inconsistent.';
  if (error.status === 400) return 'Review the form fields and provide valid required information.';
  if (error.status === 403) return 'You do not have authority for this action.';
  if (error.status === 404) return 'Resource unavailable or outside your accessible scope.';
  if (error.status === 409) return 'The workflow changed since this view was loaded. Refresh the current records and review the latest state before trying again.';
  if (error.status === 429) return 'Too many requests were made. Wait briefly before trying again.';
  if (error.kind === 'network') return 'The service could not be reached. Check your connection and try again.';
  return 'The action could not be recorded due to a server problem.';
}
export function MutationFeedback({ error, success }: { error: unknown; success: string | null }) { return <div aria-live="polite">{error ? <p className="mutation-message error" role="alert">{mutationMessage(error)}</p> : success ? <p className="mutation-message success" role="status">{success}</p> : null}</div>; }
