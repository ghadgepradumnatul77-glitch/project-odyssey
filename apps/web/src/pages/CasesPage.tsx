import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, SlidersHorizontal, X } from 'lucide-react';
import { getCasesPage, listCases, type CaseSummary } from '../api/cases.api';
import { useAuth } from '../auth/useAuth';
import StatusBadge from '../components/StatusBadge';
import { Empty, ErrorState, Loading } from '../components/AsyncState';
import CaseWorkspace from './CaseWorkspace';

type SortKey = 'priority' | 'created' | 'caseNumber';
const priorityOrder: Record<string, number> = { CRITICAL: 5, VERY_HIGH: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };

export type CasesFilterPreset = 'emergency' | 'priority-attention' | null;
export default function CasesPage({ initialCaseId = null, initialFilter = null }: { initialCaseId?: string | null; initialFilter?: CasesFilterPreset }) {
  const { token, user } = useAuth();
  const [cases, setCases] = useState<CaseSummary[]>([]);
  const [selected, setSelected] = useState<CaseSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [reload, setReload] = useState(0);
  const [search, setSearch] = useState(''); const [status, setStatus] = useState(''); const [risk, setRisk] = useState('');
  const [priority, setPriority] = useState(''); const [emergency, setEmergency] = useState(initialFilter === 'emergency' ? 'true' : ''); const [department, setDepartment] = useState(''); const [jurisdiction, setJurisdiction] = useState('');
  const [priorityPreset, setPriorityPreset] = useState<string[]>(initialFilter === 'priority-attention' ? ['CRITICAL', 'VERY_HIGH'] : []);
  const [sort, setSort] = useState<SortKey>('priority');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    if (!token) return;
    const controller = new AbortController(); if (!cases.length) setLoading(true); setError(null);
    const query = new URLSearchParams();
    if (search.trim()) query.set('search', search.trim()); if (status) query.set('status', status); if (risk) query.set('risk', risk); if (priority) query.set('priority', priority); if (emergency) query.set('emergency', emergency); if (department) query.set('department', department); if (jurisdiction) query.set('jurisdiction', jurisdiction);
    const timer = window.setTimeout(() => getCasesPage(token, query.toString(), controller.signal).then((page) => { setCases(page.items); setNextCursor(page.nextCursor); if (initialCaseId) setSelected(page.items.find((item) => item.id === initialCaseId) ?? null); }).catch((reason) => { if (!controller.signal.aborted) setError(reason); }).finally(() => { if (!controller.signal.aborted) setLoading(false); }), 250);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [department, emergency, initialCaseId, jurisdiction, priority, reload, risk, search, status, token]);

  async function loadMore() {
    if (!token || !nextCursor || loadingMore) return;
    const query = new URLSearchParams({ limit: '25', cursor: nextCursor });
    if (search.trim()) query.set('search', search.trim()); if (status) query.set('status', status); if (risk) query.set('risk', risk); if (priority) query.set('priority', priority); if (emergency) query.set('emergency', emergency); if (department) query.set('department', department); if (jurisdiction) query.set('jurisdiction', jurisdiction);
    setLoadingMore(true); setError(null);
    try { const page = await getCasesPage(token, query.toString()); setCases((current) => [...new Map([...current, ...page.items].map((item) => [item.id, item])).values()]); setNextCursor(page.nextCursor); }
    catch (reason) { setError(reason); } finally { setLoadingMore(false); }
  }

  useEffect(() => {
    setEmergency(initialFilter === 'emergency' ? 'true' : '');
    setPriorityPreset(initialFilter === 'priority-attention' ? ['CRITICAL', 'VERY_HIGH'] : []);
    setPriority('');
  }, [initialFilter]);

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return cases.filter((item) => (!needle || [item.caseNumber, item.title, item.asset.assetCode, item.asset.name].some((value) => value.toLowerCase().includes(needle)))
      && (!status || item.status === status) && (!risk || item.riskLevel === risk)
      && (!priority || item.priorityLevel === priority) && (!priorityPreset.length || priorityPreset.includes(item.priorityLevel ?? ''))
      && (!emergency || String(item.emergencyFlag) === emergency) && (!department || item.asset.department.id === department) && (!jurisdiction || item.asset.jurisdiction.id === jurisdiction))
      .sort((a, b) => sort === 'priority' ? (priorityOrder[b.priorityLevel ?? ''] ?? 0) - (priorityOrder[a.priorityLevel ?? ''] ?? 0) || a.caseNumber.localeCompare(b.caseNumber) : sort === 'created' ? Date.parse(b.createdAt) - Date.parse(a.createdAt) : a.caseNumber.localeCompare(b.caseNumber));
  }, [cases, department, emergency, jurisdiction, priority, priorityPreset, risk, search, sort, status]);
  const clear = () => { setSearch(''); setStatus(''); setRisk(''); setPriority(''); setPriorityPreset([]); setEmergency(''); setDepartment(''); setJurisdiction(''); setSort('priority'); };
  const activeFilters = [search.trim() && `Search: ${search.trim()}`, status && `Status: ${status.replaceAll('_', ' ')}`, risk && `Risk: ${risk.replaceAll('_', ' ')}`, priority && `Priority: ${priority.replaceAll('_', ' ')}`, priorityPreset.length && 'Priority: Critical / Very High', emergency && (emergency === 'true' ? 'Emergency: Yes' : 'Emergency: No'), department && `Department: ${departmentsLabel(cases, department)}`, jurisdiction && `Jurisdiction: ${jurisdictionsLabel(cases, jurisdiction)}`].filter(Boolean) as string[];
  const summaryMetrics = [
    { label: 'Total cases', value: cases.length, tone: 'default' },
    { label: 'Critical priority', value: cases.filter((item) => item.priorityLevel === 'CRITICAL').length, tone: 'critical' },
    { label: 'Emergency', value: cases.filter((item) => item.emergencyFlag).length, tone: 'emergency' },
    { label: 'In execution', value: cases.filter((item) => item.status === 'EXECUTION').length, tone: 'default' },
    { label: 'Closed', value: cases.filter((item) => item.status === 'CLOSED').length, tone: 'default' },
  ];
  async function refreshSelectedCase() { if (!token || !selected) return; const authoritative = await listCases(token); setCases(authoritative); setSelected(authoritative.find((item) => item.id === selected.id) ?? null); }
  if (selected) return <CaseWorkspace caseItem={selected} onBack={() => setSelected(null)} onCaseRefresh={refreshSelectedCase} />;
  const departments = [...new Map(cases.map((item) => [item.asset.department.id, item.asset.department])).values()];
  const jurisdictions = [...new Map(cases.map((item) => [item.asset.jurisdiction.id, item.asset.jurisdiction])).values()];

  return <section aria-labelledby="cases-heading">
    <p className="eyebrow">OPERATIONAL WORKSPACE</p><h1 id="cases-heading">Cases</h1><p className="summary">Cases returned within your authenticated organizational scope.</p>
    {loading ? <Loading label="cases" /> : error ? <ErrorState error={error} retry={() => setReload((v) => v + 1)} /> : <>
      <div className="case-toolbar" aria-label="Case presentation controls">
        <label className="case-search" htmlFor="case-search"><span>Search cases</span><input id="case-search" type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Case number, title or asset" /></label>
        <button type="button" className={filtersOpen ? 'secondary-button active' : 'secondary-button'} aria-expanded={filtersOpen} aria-controls="advanced-case-filters" onClick={() => setFiltersOpen((value) => !value)}><SlidersHorizontal aria-hidden="true" size={17} /> Filters{activeFilters.length ? ` (${activeFilters.length})` : ''}</button>
        <Filter label="Sort by" value={sort} onChange={(v) => setSort(v as SortKey)} values={['priority','created','caseNumber']} labels={['Priority','Created date','Case number']} includeAll={false} />
      </div>
      <dl className="case-summary-strip" aria-label="Operational case summary">
        {summaryMetrics.map((metric) => <div key={metric.label} className={`case-summary-metric ${metric.tone}`}><dt>{metric.label}</dt><dd>{metric.value}</dd></div>)}
      </dl>
      <div id="advanced-case-filters" className={filtersOpen ? 'filters open' : 'filters'} aria-label="Advanced case filters" hidden={!filtersOpen}>
        <Filter label="Status" value={status} onChange={setStatus} values={['NEW','INSPECTION_REQUIRED','INSPECTION_IN_PROGRESS','UNDER_ANALYSIS','ORP_READY','UNDER_REVIEW','APPROVED','EXECUTION','VERIFICATION','CLOSED','CANCELLED']} />
        <Filter label="Risk level" value={risk} onChange={setRisk} values={['VERY_LOW','LOW','MODERATE','HIGH','VERY_HIGH','CRITICAL']} />
        <Filter label="Priority" value={priority} onChange={(value) => { setPriority(value); setPriorityPreset([]); }} values={['LOW','MEDIUM','HIGH','VERY_HIGH','CRITICAL']} />
        <Filter label="Emergency" value={emergency} onChange={setEmergency} values={['true','false']} labels={['Emergency','Not emergency']} />
        {user?.role === 'SYSTEM_ADMIN' && <><Filter label="Department (display only)" value={department} onChange={setDepartment} values={departments.map((v) => v.id)} labels={departments.map((v) => v.name)} /><Filter label="Jurisdiction (display only)" value={jurisdiction} onChange={setJurisdiction} values={jurisdictions.map((v) => v.id)} labels={jurisdictions.map((v) => v.name)} /></>}
      </div>
      {activeFilters.length > 0 && <div className="filter-chips" aria-label="Active filters">{activeFilters.map((label) => <span key={label}>{label}</span>)}<button type="button" onClick={clear}><X aria-hidden="true" size={15} /> Clear all</button></div>}
      <p className="result-count" role="status">{filtered.length} {filtered.length === 1 ? 'case' : 'cases'} shown</p>
      {!filtered.length ? <Empty>No cases match the current presentation filters.</Empty> : <><div className="operational-case-list">{filtered.map((item) => <article key={item.id} className={`operational-case priority-${(item.priorityLevel ?? 'unrated').toLowerCase().replace('_','-')}`}><button className="operational-case-body" onClick={() => setSelected(item)} aria-label={`Open ${item.caseNumber}: ${item.title}`}><span className="case-identity"><span className="case-reference"><strong>{item.caseNumber}</strong>{item.emergencyFlag && <span className="emergency-marker">Emergency</span>}</span><b>{item.title}</b><small>{item.asset.name} · {item.asset.assetCode}</small></span><span className="case-indicators"><span><small>Status</small><StatusBadge value={item.status} /></span><span><small>Risk</small><StatusBadge value={item.riskLevel} kind="risk" emptyLabel="Not assessed" /></span><span><small>Priority</small><StatusBadge value={item.priorityLevel} kind="priority" emptyLabel="Not assessed" /></span></span><span className="case-dates"><small>Created {formatDate(item.createdAt)}</small><small>Updated {formatDate(item.updatedAt)}</small></span><span className="open-affordance">Open workspace <ArrowRight aria-hidden="true" size={17} /></span></button></article>)}</div>{nextCursor && <button type="button" className="secondary-button" onClick={loadMore} disabled={loadingMore} aria-label="Load more cases">{loadingMore ? 'Loading more…' : 'Load more cases'}</button>}</>}
    </>}
  </section>;
}

function Filter({ label, value, onChange, values, labels, includeAll = true }: { label: string; value: string; onChange(value: string): void; values: string[]; labels?: string[]; includeAll?: boolean }) {
  const id = `filter-${label.toLowerCase().replace(/[^a-z]+/g, '-')}`;
  return <div><label htmlFor={id}>{label}</label><select id={id} value={value} onChange={(e) => onChange(e.target.value)}>{includeAll && <option value="">All</option>}{values.map((entry, i) => <option key={entry} value={entry}>{labels?.[i] ?? entry.replaceAll('_',' ')}</option>)}</select></div>;
}
export function formatDate(value: string | null | undefined) { if (!value) return 'Not recorded'; const date = new Date(value); return Number.isNaN(date.getTime()) ? 'Not recorded' : new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(date); }
function departmentsLabel(items: CaseSummary[], id: string) { return items.find((item) => item.asset.department.id === id)?.asset.department.name ?? id; }
function jurisdictionsLabel(items: CaseSummary[], id: string) { return items.find((item) => item.asset.jurisdiction.id === id)?.asset.jurisdiction.name ?? id; }
