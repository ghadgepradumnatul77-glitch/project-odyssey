import { useEffect, useMemo, useState } from 'react';
import { listCases, type CaseSummary } from '../api/cases.api';
import { useAuth } from '../auth/useAuth';
import StatusBadge from '../components/StatusBadge';
import { Empty, ErrorState, Loading } from '../components/AsyncState';
import CaseWorkspace from './CaseWorkspace';

type SortKey = 'priority' | 'created' | 'caseNumber';
const priorityOrder: Record<string, number> = { CRITICAL: 5, VERY_HIGH: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };

export default function CasesPage() {
  const { token, user } = useAuth();
  const [cases, setCases] = useState<CaseSummary[]>([]);
  const [selected, setSelected] = useState<CaseSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [reload, setReload] = useState(0);
  const [search, setSearch] = useState(''); const [status, setStatus] = useState(''); const [risk, setRisk] = useState('');
  const [priority, setPriority] = useState(''); const [emergency, setEmergency] = useState(''); const [department, setDepartment] = useState(''); const [jurisdiction, setJurisdiction] = useState('');
  const [sort, setSort] = useState<SortKey>('priority');

  useEffect(() => {
    if (!token) return;
    const controller = new AbortController(); setLoading(true); setError(null);
    listCases(token, controller.signal).then(setCases).catch((reason) => { if (!controller.signal.aborted) setError(reason); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [reload, token]);

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return cases.filter((item) => (!needle || [item.caseNumber, item.title, item.asset.assetCode, item.asset.name].some((value) => value.toLowerCase().includes(needle)))
      && (!status || item.status === status) && (!risk || item.riskLevel === risk) && (!priority || item.priorityLevel === priority)
      && (!emergency || String(item.emergencyFlag) === emergency) && (!department || item.asset.department.id === department) && (!jurisdiction || item.asset.jurisdiction.id === jurisdiction))
      .sort((a, b) => sort === 'priority' ? (priorityOrder[b.priorityLevel ?? ''] ?? 0) - (priorityOrder[a.priorityLevel ?? ''] ?? 0) || a.caseNumber.localeCompare(b.caseNumber) : sort === 'created' ? Date.parse(b.createdAt) - Date.parse(a.createdAt) : a.caseNumber.localeCompare(b.caseNumber));
  }, [cases, department, emergency, jurisdiction, priority, risk, search, sort, status]);
  const clear = () => { setSearch(''); setStatus(''); setRisk(''); setPriority(''); setEmergency(''); setDepartment(''); setJurisdiction(''); setSort('priority'); };
  async function refreshSelectedCase() { if (!token || !selected) return; const authoritative = await listCases(token); setCases(authoritative); setSelected(authoritative.find((item) => item.id === selected.id) ?? null); }
  if (selected) return <CaseWorkspace caseItem={selected} onBack={() => setSelected(null)} onCaseRefresh={refreshSelectedCase} />;
  const departments = [...new Map(cases.map((item) => [item.asset.department.id, item.asset.department])).values()];
  const jurisdictions = [...new Map(cases.map((item) => [item.asset.jurisdiction.id, item.asset.jurisdiction])).values()];

  return <section aria-labelledby="cases-heading">
    <p className="eyebrow">OPERATIONAL WORKSPACE</p><h1 id="cases-heading">Cases</h1><p className="summary">Cases returned within your authenticated organizational scope.</p>
    {loading ? <Loading label="cases" /> : error ? <ErrorState error={error} retry={() => setReload((v) => v + 1)} /> : <>
      <div className="filters" aria-label="Case presentation filters">
        <div><label htmlFor="case-search">Search cases</label><input id="case-search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Case number, title, asset" /></div>
        <Filter label="Status" value={status} onChange={setStatus} values={['NEW','INSPECTION_REQUIRED','INSPECTION_IN_PROGRESS','UNDER_ANALYSIS','ORP_READY','UNDER_REVIEW','APPROVED','EXECUTION','VERIFICATION','CLOSED','CANCELLED']} />
        <Filter label="Risk level" value={risk} onChange={setRisk} values={['VERY_LOW','LOW','MODERATE','HIGH','VERY_HIGH','CRITICAL']} />
        <Filter label="Priority" value={priority} onChange={setPriority} values={['LOW','MEDIUM','HIGH','VERY_HIGH','CRITICAL']} />
        <Filter label="Emergency" value={emergency} onChange={setEmergency} values={['true','false']} labels={['Emergency','Not emergency']} />
        {user?.role === 'SYSTEM_ADMIN' && <><Filter label="Department (display only)" value={department} onChange={setDepartment} values={departments.map((v) => v.id)} labels={departments.map((v) => v.name)} /><Filter label="Jurisdiction (display only)" value={jurisdiction} onChange={setJurisdiction} values={jurisdictions.map((v) => v.id)} labels={jurisdictions.map((v) => v.name)} /></>}
        <Filter label="Sort by" value={sort} onChange={(v) => setSort(v as SortKey)} values={['priority','created','caseNumber']} labels={['Priority','Created date','Case number']} includeAll={false} />
        <button type="button" className="secondary-button clear-filters" onClick={clear}>Clear filters</button>
      </div>
      <p className="result-count" role="status">{filtered.length} {filtered.length === 1 ? 'case' : 'cases'} shown</p>
      {!filtered.length ? <Empty>No cases match the current presentation filters.</Empty> : <div className="case-table-wrap"><table className="case-table"><thead><tr><th>Case</th><th>Asset</th><th>Status</th><th>Risk</th><th>Priority</th><th>Emergency</th><th>Created</th></tr></thead><tbody>{filtered.map((item) => <tr key={item.id}><td><button className="case-link" onClick={() => setSelected(item)}><strong>{item.caseNumber}</strong><span>{item.title}</span></button></td><td><strong>{item.asset.name}</strong><span>{item.asset.assetCode} · {item.asset.assetType}</span></td><td><StatusBadge value={item.status} /></td><td><StatusBadge value={item.riskLevel} kind="risk" /></td><td><StatusBadge value={item.priorityLevel} kind="priority" /></td><td>{item.emergencyFlag ? <span className="emergency-marker">Yes — emergency</span> : 'No'}</td><td>{formatDate(item.createdAt)}</td></tr>)}</tbody></table></div>}
    </>}
  </section>;
}

function Filter({ label, value, onChange, values, labels, includeAll = true }: { label: string; value: string; onChange(value: string): void; values: string[]; labels?: string[]; includeAll?: boolean }) {
  const id = `filter-${label.toLowerCase().replace(/[^a-z]+/g, '-')}`;
  return <div><label htmlFor={id}>{label}</label><select id={id} value={value} onChange={(e) => onChange(e.target.value)}>{includeAll && <option value="">All</option>}{values.map((entry, i) => <option key={entry} value={entry}>{labels?.[i] ?? entry.replaceAll('_',' ')}</option>)}</select></div>;
}
export function formatDate(value: string | null | undefined) { if (!value) return 'Not recorded'; const date = new Date(value); return Number.isNaN(date.getTime()) ? 'Not recorded' : new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(date); }
