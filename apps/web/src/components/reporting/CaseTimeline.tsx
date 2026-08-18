import { useCallback, useEffect, useRef, useState } from 'react';
import { getCaseTimeline, type TimelineEventDto } from '../../api/reporting.api';
import { useAuth } from '../../auth/useAuth';
import { ErrorState, Loading } from '../AsyncState';
import { humanize } from '../StatusBadge';
import { formatDate } from '../../pages/CasesPage';

const metadataLabels: Record<string, string> = { versionNumber: 'ORP version', decisionType: 'Decision', sequenceNumber: 'Task sequence', taskSequenceNumber: 'Task sequence', sourceActionCode: 'Source action', isMandatory: 'Mandatory', evidenceType: 'Evidence type', capturedAt: 'Captured' };
const keyFor = (event: TimelineEventDto) => `${event.occurredAt}|${event.eventType}|${event.source.type}|${event.source.id}`;

export default function CaseTimeline({ caseId }: { caseId: string }) {
  const { token } = useAuth(); const [events, setEvents] = useState<TimelineEventDto[]>([]); const [nextCursor, setNextCursor] = useState<string | null>(null); const [loading, setLoading] = useState(true); const [pageLoading, setPageLoading] = useState(false); const [error, setError] = useState<unknown>(null); const [pageError, setPageError] = useState<unknown>(null); const [reload, setReload] = useState(0); const requested = useRef(new Set<string>());
  useEffect(() => { if (!token) return; const controller = new AbortController(); setLoading(true); setError(null); setEvents([]); setNextCursor(null); requested.current.clear(); getCaseTimeline(caseId, token, { limit: 100 }, controller.signal).then((result) => { setEvents(result.events); setNextCursor(result.page.nextCursor); }).catch((reason) => { if (!controller.signal.aborted) setError(reason); }).finally(() => { if (!controller.signal.aborted) setLoading(false); }); return () => controller.abort(); }, [caseId, reload, token]);
  const loadMore = useCallback(async () => { if (!token || !nextCursor || pageLoading || requested.current.has(nextCursor)) return; const cursor = nextCursor; requested.current.add(cursor); setPageLoading(true); setPageError(null); try { const result = await getCaseTimeline(caseId, token, { limit: 100, cursor }); setEvents((current) => { const existing = new Set(current.map(keyFor)); return [...current, ...result.events.filter((item) => !existing.has(keyFor(item)))]; }); setNextCursor(result.page.nextCursor); } catch (reason) { requested.current.delete(cursor); setPageError(reason); } finally { setPageLoading(false); } }, [caseId, nextCursor, pageLoading, token]);
  if (loading) return <div aria-busy="true"><Loading label="case timeline" /></div>;
  if (error) return <ErrorState error={error} retry={() => setReload((v) => v + 1)} />;
  return <section className="case-timeline" aria-labelledby="timeline-heading" aria-busy={pageLoading}>
    <div className="report-heading"><p className="eyebrow">AUTHORITATIVE EVENT RECORD</p><h2 id="timeline-heading">Case Timeline</h2><p>Events appear in the exact chronological order supplied by the reporting service.</p></div>
    {!events.length ? <p className="lifecycle-empty">No timeline events are available for this case.</p> : <ol className="timeline-list">{events.map((event) => <li key={keyFor(event)}><span className="timeline-marker" aria-hidden="true" /><article><p className="event-type">{humanize(event.eventType)}</p><h3>{event.summary}</h3><time dateTime={event.occurredAt}>{formatDate(event.occurredAt)}</time><p className="event-actor">{event.actor ? `${event.actor.name} · ${event.actor.designation}` : 'Recorded by the system workflow'}</p><SafeMetadata metadata={event.metadata} /></article></li>)}</ol>}
    {pageError ? <div className="pagination-error"><ErrorState error={pageError} retry={loadMore} /></div> : null}
    {nextCursor && <button className="secondary-button load-more" disabled={pageLoading} onClick={loadMore}>{pageLoading ? 'Loading more…' : 'Load more'}</button>}
    <p className="sr-status" role="status">{pageLoading ? 'Loading more timeline events.' : `${events.length} timeline events displayed.`}</p>
  </section>;
}
function SafeMetadata({ metadata }: { metadata: Record<string, unknown> }) { const safe = Object.entries(metadata).filter(([key, value]) => key in metadataLabels && ['string','number','boolean'].includes(typeof value)); if (!safe.length) return null; return <dl className="event-metadata">{safe.map(([key,value]) => <div key={key}><dt>{metadataLabels[key]}</dt><dd>{key === 'capturedAt' && typeof value === 'string' ? formatDate(value) : key === 'isMandatory' ? (value ? 'Yes' : 'No') : typeof value === 'string' ? humanize(value) : String(value)}</dd></div>)}</dl>; }
