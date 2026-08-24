import { useEffect, useState } from 'react';
import { fetchAssetWeather, getAssetObservations, type Observation } from '../../api/observations.api';
import { useAuth } from '../../auth/useAuth';
import { Empty, ErrorState, Loading } from '../AsyncState';
import StatusBadge, { humanize } from '../StatusBadge';

export default function ExternalObservations({ assetId }: { assetId: string }) {
  const { token, user } = useAuth();
  const [items, setItems] = useState<Observation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [pageError, setPageError] = useState<unknown>(null);
  const [fetchError, setFetchError] = useState<unknown>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [next, setNext] = useState<string | null>(null);
  const [more, setMore] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [reload, setReload] = useState(0);
  useEffect(() => {
    if (!token) return;
    const controller = new AbortController(); setLoading(true); setError(null);
    getAssetObservations(assetId, token, 'limit=25', controller.signal).then(page => { setItems(page.items); setNext(page.nextCursor); }).catch(reason => { if (!controller.signal.aborted) setError(reason); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [assetId, reload, token]);
  async function load() { if (!token || !next) return; setMore(true); setPageError(null); try { const page = await getAssetObservations(assetId, token, `limit=25&cursor=${encodeURIComponent(next)}`); setItems(old => [...old, ...page.items.filter(item => !old.some(existing => existing.id === item.id))]); setNext(page.nextCursor); } catch (reason) { setPageError(reason); } finally { setMore(false); } }
  async function fetchWeather() { if (!token || fetching) return; setFetching(true); setFetchError(null); setSuccess(null); try { const value = await fetchAssetWeather(assetId, token); setSuccess(value.idempotentReplay ? 'The current provider record was already ingested.' : 'Weather context fetched and recorded.'); setReload(value => value + 1); } catch (reason) { setFetchError(reason); } finally { setFetching(false); } }
  return <section className="external-observations">
    <p className="section-label">CONTEXTUAL EXTERNAL EVIDENCE</p><h2>External observations</h2>
    <p className="condition-disclosure">External weather data provides contextual evidence. It does not automatically change ODYSSEY risk, priority, approval, or execution decisions.</p>
    {user?.role === 'OFFICER' && <button className="secondary-button" disabled={fetching} onClick={fetchWeather}>{fetching ? 'Fetching weather…' : 'Fetch weather context'}</button>}
    {success && <p role="status">{success}</p>}{Boolean(fetchError) && <ErrorState error={fetchError} retry={fetchWeather} />}
    {loading ? <Loading label="external observations" /> : error ? <ErrorState error={error} retry={() => setReload(value => value + 1)} /> : !items.length ? <Empty>No external observations are available for this asset.</Empty> : <div className="history-list">{items.map(item => {
      const modelDerived = item.sourceMetadata?.dataSemantics === 'CURRENT_MODEL_DERIVED'; const openMeteo = item.sourceMetadata?.providerId === 'OPEN_METEO';
      return <article className="history-card" key={item.id}><div className="card-heading"><h3>{humanize(item.observationType)}</h3><StatusBadge value={item.qualityState} /><StatusBadge value={item.validationState} /></div><p><strong>{item.source.name}</strong> · {item.source.sourceCode} v{item.source.versionNumber}</p><p>{modelDerived ? 'Provider-valid time' : 'Observed'} {new Date(item.observedAt).toLocaleString('en-IN')} · Ingested {new Date(item.ingestedAt).toLocaleString('en-IN')}</p>{modelDerived && <p>Current model-derived weather describes provider output for the stated valid time and is not a verified infrastructure condition.</p>}<dl className="detail-grid compact">{Object.entries(item.normalizedData).map(([key, value]) => <div className="detail" key={key}><dt>{humanize(key)}</dt><dd>{String(value)}</dd></div>)}</dl><p className="record-meta">Provenance recorded · source record {item.sourceRecordId}</p>{openMeteo && <p className="record-meta"><a href="https://open-meteo.com/" target="_blank" rel="noreferrer">Weather data by Open-Meteo.com</a> · Evaluation integration</p>}</article>;
    })}</div>}
    {pageError ? <ErrorState error={pageError} retry={load} /> : next ? <button className="secondary-button" disabled={more} onClick={load}>{more ? 'Loading more…' : 'Load more'}</button> : items.length > 0 && <p>All observations loaded.</p>}
  </section>;
}
