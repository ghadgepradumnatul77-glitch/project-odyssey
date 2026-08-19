import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle, ArrowRight, BadgeCheck, BriefcaseBusiness, Building2, FileWarning,
  Gauge, Landmark, MapPin, Settings, ShieldCheck, Users, Warehouse,
  type LucideIcon,
} from 'lucide-react';
import { listCases, type CaseSummary } from '../api/cases.api';
import {
  listAssets, listAuthorities, listDepartments, listJurisdictions, listUsers,
  type AdminUserDto, type AssetDto, type AuthorityDto, type DepartmentDto, type JurisdictionDto,
} from '../api/admin.api';
import { useAuth } from '../auth/useAuth';
import { Empty, ErrorState, Loading } from '../components/AsyncState';
import StatusBadge, { humanize } from '../components/StatusBadge';
import { formatDate } from './CasesPage';
import type { AdminTab } from './AdministrationPage';
import type { CasesFilterPreset } from './CasesPage';

const roleTitles = {
  OFFICER: 'Operational overview', AUDITOR: 'Governance and accountability overview',
  POLICY_ADMIN: 'Persisted policy and risk overview', SYSTEM_ADMIN: 'System administration overview',
} as const;
const priorityOrder: Record<string, number> = { CRITICAL: 5, VERY_HIGH: 4, HIGH: 3, MEDIUM: 2, MODERATE: 2, LOW: 1 };
const priorityLabels = ['CRITICAL', 'VERY_HIGH', 'HIGH', 'MODERATE', 'LOW'];

interface AdminData {
  assets: AssetDto[]; departments: DepartmentDto[]; jurisdictions: JurisdictionDto[];
  users: AdminUserDto[]; authorities: AuthorityDto[];
}

export default function DashboardPage({ onCases, onCase, onAdmin }: {
  onCases(filter?: CasesFilterPreset): void; onCase(caseId: string): void; onAdmin(tab?: AdminTab): void;
}) {
  const { token, user, organization } = useAuth();
  const [cases, setCases] = useState<CaseSummary[]>([]);
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    if (!token) return;
    const controller = new AbortController(); setLoading(true); setError(null); setAdminData(null);
    (async () => {
      setCases(await listCases(token, controller.signal));
      if (user?.role === 'SYSTEM_ADMIN') {
        const [assets, departments, jurisdictions, users, authorities] = await Promise.all([
          listAssets(token, controller.signal), listDepartments(token, controller.signal),
          listJurisdictions(token, controller.signal), listUsers(token, controller.signal),
          listAuthorities(token, controller.signal),
        ]);
        setAdminData({ assets, departments, jurisdictions, users, authorities });
      }
    })().catch((reason) => { if (!controller.signal.aborted) setError(reason); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [reload, token, user?.role]);

  const rankedCases = useMemo(() => cases.slice().sort((a, b) =>
    (priorityOrder[b.priorityLevel ?? ''] ?? 0) - (priorityOrder[a.priorityLevel ?? ''] ?? 0)
    || Number(b.emergencyFlag) - Number(a.emergencyFlag)
    || Date.parse(b.updatedAt) - Date.parse(a.updatedAt)), [cases]);

  if (loading) return <Loading label="command overview" />;
  if (error) return <ErrorState error={error} retry={() => setReload((value) => value + 1)} />;
  const highest = rankedCases[0];
  const highPriority = cases.filter((item) => ['CRITICAL', 'VERY_HIGH'].includes(item.priorityLevel ?? '')).length;

  return <section className="command-dashboard" aria-labelledby="dashboard-heading">
    <header className="command-heading">
      <div><p className="eyebrow">JANSEVA INTELLIGOV COMMAND OVERVIEW</p>
        <h1 id="dashboard-heading">{roleTitles[user!.role]}</h1>
        <p className="summary">Persisted infrastructure, governance and workflow information within your authorized scope.</p>
      </div>
      <div className="command-context" aria-label="Current organizational context">
        <Landmark aria-hidden="true" size={20} /><span>Assigned organization</span>
        <strong>{organization?.departmentName ?? 'Assigned department'}</strong>
        <small>{organization?.jurisdictionName ?? 'Assigned jurisdiction'}</small>
      </div>
    </header>

    <div className="metric-groups" aria-label="Persisted overview metrics"><section><h2>Operational</h2><div className="kpi-grid">
      <Metric icon={BriefcaseBusiness} count={cases.length} label="Visible cases" detail="Authorized case scope" onActivate={() => onCases(null)} />
      <Metric icon={AlertTriangle} count={cases.filter((item) => item.emergencyFlag).length} label="Emergency cases" detail="Persisted emergency flag" tone="danger" onActivate={() => onCases('emergency')} />
      <Metric icon={Gauge} count={highPriority} label="Critical / Very High" detail="Priority attention" tone="warning" onActivate={() => onCases('priority-attention')} />
      {user?.role === 'OFFICER' && <Metric icon={FileWarning} count={cases.filter((item) =>
        ['ORP_READY', 'APPROVED', 'EXECUTION', 'VERIFICATION'].includes(item.status)).length}
      label="Workflow attention" detail="Visible active stages" />}</div></section>
      {adminData && <><section><h2>Infrastructure</h2><div className="kpi-grid"><Metric icon={Warehouse} count={adminData.assets.length} label="Assets" detail="Infrastructure registry" onActivate={() => onAdmin('Assets')} /></div></section>
        <section><h2>Governance</h2><div className="kpi-grid"><Metric icon={Building2} count={adminData.departments.length} label="Departments" detail="Organizational coverage" onActivate={() => onAdmin('Departments')} />
        <Metric icon={MapPin} count={adminData.jurisdictions.length} label="Jurisdictions" detail="Administrative scope" onActivate={() => onAdmin('Jurisdictions')} />
        <Metric icon={Users} count={adminData.users.length} label="Users" detail={`${adminData.users.filter((item) => item.status === 'ACTIVE').length} active records`} onActivate={() => onAdmin('Users')} />
        <Metric icon={ShieldCheck} count={activeAuthorities(adminData.authorities)} label="Active authority grants" detail={`${adminData.authorities.length} persisted grants`} onActivate={() => onAdmin('Approval Authorities')} /></div></section></>}
    </div>

    {highest ? <CriticalAttention item={highest} onOpen={() => onCase(highest.id)} /> :
      <div className="command-panel"><Empty>No visible cases require presentation.</Empty></div>}

    <div className="command-grid">
      <DistributionPanel cases={cases} />
      <RecentCases cases={rankedCases.slice(0, 5)} onOpen={onCase} onCases={onCases} />
    </div>

    {adminData && <div className="command-grid lower-grid">
      <OrganizationPanel data={adminData} organization={organization} />
      <QuickActions onCases={onCases} onAdmin={onAdmin} />
    </div>}
  </section>;
}

function Metric({ icon: Icon, count, label, detail, tone = 'default', onActivate }: {
  icon: LucideIcon; count: number; label: string;
  detail: string; tone?: 'default' | 'danger' | 'warning'; onActivate?: () => void;
}) {
  const content = <><span className="kpi-icon"><Icon aria-hidden="true" size={20} /></span>
    <strong>{count.toLocaleString('en-IN')}</strong><span>{label}</span><small>{detail}</small>{onActivate && <ArrowRight className="kpi-arrow" aria-hidden="true" size={17} />}</>;
  return onActivate ? <button type="button" className={`kpi-card interactive ${tone}`} onClick={onActivate} aria-label={`Open ${label}`}>{content}</button> : <article className={`kpi-card ${tone}`}>
    {content}
  </article>;
}

function CriticalAttention({ item, onOpen }: { item: CaseSummary; onOpen(): void }) {
  return <article className={`attention-card priority-${(item.priorityLevel ?? 'unrated').toLowerCase().replace('_', '-')}`}>
    <div className="attention-signal"><AlertTriangle aria-hidden="true" size={22} />
      <div><p className="section-label">CRITICAL INFRASTRUCTURE ATTENTION</p>
        <span>Highest persisted priority in the current visible case set</span></div>
    </div>
    <div className="attention-body">
      <div><span className="fact-label">Case</span><p className="case-number">{item.caseNumber}</p><h2>{item.title}</h2>
        <span className="fact-label">Asset</span><p className="attention-asset">{item.asset.name} <span>·</span> {item.asset.assetCode}</p></div>
      <div className="attention-badges"><span className="fact-label">Workflow state</span><StatusBadge value={item.status} />
        <span className="fact-label">Risk</span><StatusBadge value={item.riskLevel} kind="risk" /><span className="fact-label">Priority</span><StatusBadge value={item.priorityLevel} kind="priority" />
        {item.emergencyFlag && <span className="emergency-marker">Emergency case</span>}</div>
    </div>
    <dl className="attention-facts"><div><dt>Department</dt><dd>{item.asset.department.name}</dd></div>
      <div><dt>Jurisdiction</dt><dd>{item.asset.jurisdiction.name}</dd></div>
      <div><dt>Last updated</dt><dd>{formatDate(item.updatedAt)}</dd></div></dl>
    <CompactWorkflow status={item.status} />
    <button className="attention-action" onClick={onOpen}>Open Case <ArrowRight aria-hidden="true" size={18} /></button>
  </article>;
}

const workflowStages = ['Case','Inspection','Risk','Action Plan','Decision','Execution','Verification','Closure'];
function workflowIndex(status: string) { if (status === 'NEW') return 0; if (status.startsWith('INSPECTION')) return 1; if (status === 'UNDER_ANALYSIS') return 2; if (status === 'ORP_READY') return 3; if (status === 'UNDER_REVIEW') return 4; if (status === 'APPROVED' || status === 'EXECUTION') return 5; if (status === 'VERIFICATION') return 6; if (status === 'CLOSED') return 7; return 0; }
function CompactWorkflow({ status }: { status: string }) { const current = workflowIndex(status); return <ol className="compact-workflow" aria-label={`Workflow position: ${workflowStages[current]}`}>{workflowStages.map((stage,index) => <li className={status === 'CLOSED' || index < current ? 'complete' : index === current ? 'current' : 'future'} key={stage}><span aria-hidden="true">{index < workflowStages.length - 1 ? '→' : ''}</span><strong>{stage}</strong></li>)}</ol>; }

function DistributionPanel({ cases }: { cases: CaseSummary[] }) {
  const priorities = priorityLabels.map((label) => ({ label, count: cases.filter((item) =>
    (item.priorityLevel === label || (label === 'MODERATE' && item.priorityLevel === 'MEDIUM'))).length }));
  const lifecycle = Object.entries(cases.reduce<Record<string, number>>((counts, item) => {
    counts[item.status] = (counts[item.status] ?? 0) + 1; return counts;
  }, {})).sort((a, b) => b[1] - a[1]);
  return <section className="command-panel distribution-panel"><div className="panel-heading">
    <div><p className="section-label">CASE DISTRIBUTION</p><h2>Priority and lifecycle</h2></div>
    <span>{cases.length} visible</span></div>
    <h3>Priority</h3>{priorities.map(({ label, count }) => <Bar key={label} label={humanize(label)} count={count} total={cases.length} />)}
    <h3>Lifecycle status</h3>{lifecycle.length ? lifecycle.slice(0, 6).map(([label, count]) =>
      <Bar key={label} label={humanize(label)} count={count} total={cases.length} />) : <Empty>No lifecycle data available.</Empty>}
  </section>;
}

function Bar({ label, count, total }: { label: string; count: number; total: number }) {
  return <div className="data-bar"><div><span>{label}</span><strong>{count}</strong></div>
    <div className="bar-track" aria-label={`${label}: ${count} of ${total}`}><i aria-hidden="true"
      style={{ width: `${total ? count / total * 100 : 0}%` }} /></div></div>;
}

function RecentCases({ cases, onOpen, onCases }: { cases: CaseSummary[]; onOpen(id: string): void; onCases(): void }) {
  return <section className="command-panel recent-panel"><div className="panel-heading">
    <div><p className="section-label">PRIORITY REGISTER</p><h2>Recent visible cases</h2></div>
    <button className="text-action" onClick={onCases}>View all <ArrowRight aria-hidden="true" size={16} /></button></div>
    {cases.length ? <div className="recent-list">{cases.map((item) => <button key={item.id} onClick={() => onOpen(item.id)}>
      <span className="recent-severity" aria-hidden="true" /><span className="recent-case-main"><strong>{item.caseNumber}</strong>
        <small>{item.title}</small><em>{item.asset.name}</em></span><span className="recent-case-status">
        <StatusBadge value={item.priorityLevel} kind="priority" /><StatusBadge value={item.status} />
        <small>{formatDate(item.updatedAt)}</small></span><ArrowRight aria-hidden="true" size={17} /></button>)}</div> :
      <Empty>No recently visible cases.</Empty>}
  </section>;
}

function OrganizationPanel({ data, organization }: { data: AdminData; organization: ReturnType<typeof useAuth>['organization'] }) {
  return <section className="command-panel organization-panel"><div className="panel-heading"><div>
    <p className="section-label">ORGANIZATION &amp; COVERAGE</p><h2>Administrative footprint</h2></div><BadgeCheck aria-hidden="true" size={23} /></div>
    <p>{organization?.departmentName ?? 'Assigned department'} <span>·</span> {organization?.jurisdictionName ?? 'Assigned jurisdiction'}</p>
    <dl><div><dt>Departments</dt><dd>{data.departments.length}</dd></div><div><dt>Jurisdictions</dt><dd>{data.jurisdictions.length}</dd></div>
      <div><dt>Registered assets</dt><dd>{data.assets.length}</dd></div><div><dt>Officer records</dt><dd>{data.users.filter((item) => item.role === 'OFFICER').length}</dd></div>
      <div><dt>Active authorities</dt><dd>{activeAuthorities(data.authorities)}</dd></div></dl>
  </section>;
}

function QuickActions({ onCases, onAdmin }: { onCases(): void; onAdmin(tab?: AdminTab): void }) {
  const actions: Array<[string, AdminTab, LucideIcon]> = [
    ['Manage departments', 'Departments', Building2], ['Manage jurisdictions', 'Jurisdictions', MapPin],
    ['Manage assets', 'Assets', Warehouse], ['Manage users', 'Users', Users],
    ['Manage approval authorities', 'Approval Authorities', ShieldCheck],
  ];
  return <section className="command-panel quick-panel"><div className="panel-heading"><div>
    <p className="section-label">AUTHORIZED SHORTCUTS</p><h2>Quick actions</h2></div><Settings aria-hidden="true" size={22} /></div>
    <button onClick={onCases}><BriefcaseBusiness aria-hidden="true" size={18} /><span><strong>Open cases</strong><small>Review global visible case records</small></span><ArrowRight aria-hidden="true" size={16} /></button>
    {actions.map(([label, tab, Icon]) => <button key={tab} onClick={() => onAdmin(tab)}><Icon aria-hidden="true" size={18} />
      <span><strong>{label}</strong><small>Open {tab.toLowerCase()} registry</small></span><ArrowRight aria-hidden="true" size={16} /></button>)}
    <p>Registry access does not grant operational workflow authority.</p>
  </section>;
}

function activeAuthorities(authorities: AuthorityDto[]) {
  const now = Date.now(); return authorities.filter((item) => item.isActive
    && (!item.validFrom || Date.parse(item.validFrom) <= now)
    && (!item.validUntil || Date.parse(item.validUntil) >= now)).length;
}
