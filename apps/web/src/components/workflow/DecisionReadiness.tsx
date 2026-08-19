import { useEffect, useState } from 'react';
import { getCaseReadiness, type ReadinessDto } from '../../api/readiness.api';
import { useAuth } from '../../auth/useAuth';
import { ErrorState, Loading } from '../AsyncState';

const statusSymbol: Record<string, string> = { PASS: '✓', NOT_REQUIRED: '—', NOT_APPLICABLE: '—', INCOMPLETE: '○', BLOCKED: '!' };
const outcomeLabel = { READY: 'READY', NOT_READY: 'NOT READY', BLOCKED: 'BLOCKED' } as const;

export default function DecisionReadiness({ caseId, refreshKey = 0 }: { caseId: string; refreshKey?: number }) {
  const { token } = useAuth();
  const [value, setValue] = useState<ReadinessDto | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [reload, setReload] = useState(0);
  useEffect(() => {
    if (!token) return;
    const controller = new AbortController();
    setLoading(true); setError(null);
    getCaseReadiness(caseId, token, controller.signal).then(setValue).catch((reason) => { if (!controller.signal.aborted) setError(reason); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [caseId, refreshKey, reload, token]);

  return <section className="decision-readiness" aria-labelledby="decision-readiness-heading">
    <p className="section-label">DECISION READINESS</p>
    <h3 id="decision-readiness-heading">Governed input assessment</h3>
    {loading ? <Loading label="decision readiness" /> : error ? <ErrorState error={error} retry={() => setReload((current) => current + 1)} /> : value && <>
      <div className={`readiness-outcome readiness-${value.outcome.toLowerCase().replace('_', '-')}`} role="status">
        <strong>{outcomeLabel[value.outcome]}</strong>
        <span>{value.outcome === 'READY' ? 'Required governed inputs are available.' : value.outcome === 'NOT_READY' ? 'Normal workflow work is still required.' : 'A governance issue must be resolved before proceeding.'}</span>
      </div>
      <ul className="readiness-checks" aria-label="Decision readiness checks">
        {value.checks.map((item) => <li key={item.dimension} className={`readiness-check-${item.status.toLowerCase().replace('_', '-')}`}>
          <span aria-hidden="true">{statusSymbol[item.status]}</span><div><strong>{item.label}</strong><small>{item.status.replaceAll('_', ' ')}</small>
          {item.reasons.map((reason) => <p key={`${item.dimension}-${reason.code}`}>{reason.message} <code>{reason.code}</code></p>)}</div>
        </li>)}
      </ul>
      <p className="readiness-disclaimer">Decision readiness confirms that required governed inputs are available. It does not approve an action or replace officer judgment.</p>
      <small className="record-meta">Assessment contract: {value.assessmentVersion}</small>
    </>}
  </section>;
}
