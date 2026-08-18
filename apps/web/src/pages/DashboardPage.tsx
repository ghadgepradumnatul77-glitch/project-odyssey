import { useEffect, useState } from 'react';
import { listCases, type CaseSummary } from '../api/cases.api';
import {
  listAssets, listAuthorities, listDepartments, listJurisdictions, listUsers,
} from '../api/admin.api';
import { useAuth } from '../auth/useAuth';
import { Empty, ErrorState, Loading } from '../components/AsyncState';
import StatusBadge from '../components/StatusBadge';

const roleTitles = {
  OFFICER: 'Operational overview',
  AUDITOR: 'Governance and accountability overview',
  POLICY_ADMIN: 'Persisted policy and risk overview',
  SYSTEM_ADMIN: 'System administration overview',
} as const;

export default function DashboardPage({ onCases, onAdmin }: { onCases(): void; onAdmin(): void }) {
  const { token, user } = useAuth();
  const [cases, setCases] = useState<CaseSummary[]>([]);
  const [adminCounts, setAdminCounts] = useState<number[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    if (!token) return;
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    setAdminCounts(null);
    (async () => {
      const visibleCases = await listCases(token, controller.signal);
      setCases(visibleCases);
      if (user?.role === 'SYSTEM_ADMIN') {
        const registries = await Promise.all([
          listAssets(token, controller.signal),
          listDepartments(token, controller.signal),
          listJurisdictions(token, controller.signal),
          listUsers(token, controller.signal),
          listAuthorities(token, controller.signal),
        ]);
        setAdminCounts(registries.map((records) => records.length));
      }
    })().catch((reason) => {
      if (!controller.signal.aborted) setError(reason);
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false);
    });
    return () => controller.abort();
  }, [reload, token, user?.role]);

  if (loading) return <Loading label="dashboard" />;
  if (error) return <ErrorState error={error} retry={() => setReload((value) => value + 1)} />;

  const highPriority = cases.filter((item) =>
    ['CRITICAL', 'VERY_HIGH'].includes(item.priorityLevel ?? '')).length;
  const lifecycleCounts = Object.entries(cases.reduce<Record<string, number>>((counts, item) => {
    counts[item.status] = (counts[item.status] ?? 0) + 1;
    return counts;
  }, {}));

  return <section aria-labelledby="dashboard-heading">
    <p className="eyebrow">ROLE DASHBOARD</p>
    <h1 id="dashboard-heading">{roleTitles[user!.role]}</h1>
    <p className="summary">Metrics derive only from currently visible persisted records.</p>
    <div className="dashboard-cards">
      <Card count={cases.length} title="Visible cases" />
      <Card count={cases.filter((item) => item.emergencyFlag).length} title="Emergency cases" />
      <Card count={highPriority} title="Critical / Very High priority" />
      {user?.role === 'OFFICER' && <Card count={cases.filter((item) =>
        ['ORP_READY', 'APPROVED', 'EXECUTION', 'VERIFICATION'].includes(item.status)).length}
      title="Cases requiring workflow attention" />}
      {adminCounts && ['Assets', 'Departments', 'Jurisdictions', 'Users', 'Authority grants'].map(
        (title, index) => <Card key={title} count={adminCounts[index]} title={title} />,
      )}
    </div>
    <div className="dashboard-panels">
      <section><h2>Lifecycle distribution</h2>
        {lifecycleCounts.length ? lifecycleCounts.map(([status, count]) =>
          <div className="distribution" key={status}>
            <StatusBadge value={status} /><span>{count}</span>
            <i aria-hidden="true" style={{ width: `${Math.max(5, count / cases.length * 100)}%` }} />
          </div>) : <Empty>No visible cases.</Empty>}
      </section>
      <section><h2>Recent visible cases</h2>
        {cases.slice().sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)).slice(0, 5)
          .map((item) => <button className="dashboard-case" key={item.id} onClick={onCases}>
            <strong>{item.caseNumber}</strong><span>{item.title}</span>
          </button>)}
        <button className="secondary-button" onClick={onCases}>Open Cases</button>
        {user?.role === 'SYSTEM_ADMIN' &&
          <button className="secondary-button" onClick={onAdmin}>Open Administration</button>}
      </section>
    </div>
  </section>;
}

function Card({ count, title }: { count: number; title: string }) {
  return <article className="dashboard-card"><strong>{count}</strong><span>{title}</span></article>;
}
