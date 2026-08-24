import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import {
  createAsset, createAuthority, createDepartment, createJurisdiction, createUser,
  getAssetsPage, getAuthoritiesPage, getUsersPage, listDepartments, listJurisdictions,
  type AdminUserDto, type AssetDto, type AssetInput, type AuthorityDto, type AuthorityInput,
  type DepartmentDto, type JurisdictionDto, type UserInput,
} from '../api/admin.api';
import { useAuth } from '../auth/useAuth';
import { Empty, ErrorState, Loading } from '../components/AsyncState';
import { MutationFeedback } from '../components/workflow/MutationFeedback';
import type { PriorityLevel } from '../api/cases.api';
import type { SystemRole } from '../types/api';
import ObservationSourcesAdmin from '../components/observations/ObservationSourcesAdmin';

export type AdminTab = 'Departments' | 'Jurisdictions' | 'Assets' | 'Users' | 'Approval Authorities';
const tabs: AdminTab[] = ['Departments', 'Jurisdictions', 'Assets', 'Users', 'Approval Authorities'];

export default function AdministrationPage({ initialTab = 'Departments' }: { initialTab?: AdminTab }) {
  const { token } = useAuth();
  const [tab, setTab] = useState<AdminTab>(initialTab);
  const [search, setSearch] = useState('');
  const [departments, setDepartments] = useState<DepartmentDto[]>([]);
  const [jurisdictions, setJurisdictions] = useState<JurisdictionDto[]>([]);
  const [assets, setAssets] = useState<AssetDto[]>([]);
  const [users, setUsers] = useState<AdminUserDto[]>([]);
  const [authorities, setAuthorities] = useState<AuthorityDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [mutationError, setMutationError] = useState<unknown>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [reload, setReload] = useState(0);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pageError, setPageError] = useState<unknown>(null);
  const [showObservationSources, setShowObservationSources] = useState(false);

  useEffect(() => { setTab(initialTab); setSearch(''); }, [initialTab]);

  useEffect(() => {
    if (!token) return;
    const controller = new AbortController();
    if (!departments.length) setLoading(true);
    setError(null);
    const query = new URLSearchParams({ limit: '25' });
    if (search.trim()) query.set('search', search.trim());
    Promise.all([
      listDepartments(token, controller.signal), listJurisdictions(token, controller.signal),
      getAssetsPage(token, query.toString(), controller.signal), getUsersPage(token, query.toString(), controller.signal),
      getAuthoritiesPage(token, query.toString(), controller.signal),
    ]).then(([nextDepartments, nextJurisdictions, nextAssets, nextUsers, nextAuthorities]) => {
      setDepartments(nextDepartments); setJurisdictions(nextJurisdictions); setAssets(nextAssets.items);
      setUsers(nextUsers.items); setAuthorities(nextAuthorities.items);
      setNextCursor(tab === 'Assets' ? nextAssets.nextCursor : tab === 'Users' ? nextUsers.nextCursor
        : tab === 'Approval Authorities' ? nextAuthorities.nextCursor : null);
      setPageError(null);
    }).catch((reason) => {
      if (!controller.signal.aborted) setError(reason);
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false);
    });
    return () => controller.abort();
  }, [reload, search, tab, token]);

  async function loadMore() {
    if (!token || !nextCursor || loadingMore) return;
    setLoadingMore(true); setPageError(null);
    const query = new URLSearchParams({ limit: '25', cursor: nextCursor });
    if (search.trim()) query.set('search', search.trim());
    try {
      const page = tab === 'Assets' ? await getAssetsPage(token, query.toString())
        : tab === 'Users' ? await getUsersPage(token, query.toString())
          : await getAuthoritiesPage(token, query.toString());
      if (tab === 'Assets') setAssets((current) => appendUnique(current, page.items as AssetDto[]));
      else if (tab === 'Users') setUsers((current) => appendUnique(current, page.items as AdminUserDto[]));
      else setAuthorities((current) => appendUnique(current, page.items as AuthorityDto[]));
      setNextCursor(page.nextCursor);
    } catch (reason) { setPageError(reason); } finally { setLoadingMore(false); }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || sending) return;
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const value = (name: string) => String(form.get(name) ?? '').trim();
    setSending(true); setMutationError(null); setSuccess(null);
    try {
      if (tab === 'Departments') {
        await createDepartment({ name: value('name'), code: value('code') }, token);
      } else if (tab === 'Jurisdictions') {
        await createJurisdiction({
          name: value('name'), type: value('type'), departmentId: value('departmentId'),
        }, token);
      } else if (tab === 'Assets') {
        const assetType = parseAssetType(value('assetType'));
        await createAsset({
          assetCode: value('assetCode'), name: value('name'), assetType,
          departmentId: value('departmentId'), jurisdictionId: value('jurisdictionId'),
          conditionStatus: value('conditionStatus') || undefined,
        }, token);
      } else if (tab === 'Users') {
        const role = parseSystemRole(value('role'));
        await createUser({
          employeeCode: value('employeeCode'), name: value('name'), email: value('email'),
          password: value('password'), designation: value('designation'), role,
          departmentId: value('departmentId'), jurisdictionId: value('jurisdictionId'),
        }, token);
      } else {
        await createAuthority({
          userId: value('userId'), departmentId: value('departmentId'),
          jurisdictionId: value('jurisdictionId'), canApprove: form.has('canApprove'),
          canReject: form.has('canReject'),
          canRequestModification: form.has('canRequestModification'),
          canRequestReinspection: form.has('canRequestReinspection'),
          canEscalate: form.has('canEscalate'), canCloseCase: form.has('canCloseCase'),
          maxPriorityLevel: parsePriority(value('maxPriorityLevel')),
          validFrom: value('validFrom') || null, validUntil: value('validUntil') || null,
        }, token);
      }
      formElement.reset();
      setSuccess(`${tab} record created.`);
      setReload((current) => current + 1);
    } catch (reason) {
      setMutationError(reason);
    } finally {
      setSending(false);
    }
  }

  if (loading) return <Loading label="administration registries" />;
  if (error) return <ErrorState error={error} retry={() => setReload((current) => current + 1)} />;
  const rows = tab === 'Departments' ? departments : tab === 'Jurisdictions' ? jurisdictions
    : tab === 'Assets' ? assets : tab === 'Users' ? users : authorities;
  const needle = search.trim().toLowerCase();
  const serverPaged = tab === 'Assets' || tab === 'Users' || tab === 'Approval Authorities';
  const filteredRows = serverPaged ? rows : rows.filter((row) => !needle || recordSearchText(tab, row).includes(needle));

  return <section aria-labelledby="administration-heading">
    <p className="eyebrow">SYSTEM ADMINISTRATION</p>
    <h1 id="administration-heading">Administration</h1>
    <p className="summary">Manage organizational registries and authority configuration.</p>
    <nav className="admin-tabs" aria-label="Administration resources">
      {tabs.map((item) => <button type="button" className={tab === item ? 'active' : ''}
        aria-current={tab === item ? 'page' : undefined}
        onClick={() => { setTab(item); setSearch(''); setMutationError(null); setSuccess(null); }} key={item}>{item}</button>)}
    </nav>
    <button type="button" className="secondary-button" onClick={() => setShowObservationSources((value) => !value)}>{showObservationSources ? 'Hide observation sources' : 'Manage observation sources'}</button>
    {showObservationSources && <ObservationSourcesAdmin/>}<MutationFeedback error={mutationError} success={success} />
    <div className="admin-workbench"><section className="admin-registry" aria-labelledby="registry-heading">
      <div className="admin-register-heading"><div><p className="section-label">PERSISTED REGISTRY</p><h2 id="registry-heading">{tab}</h2></div></div>
      <label className="admin-search">Search {tab.toLowerCase()}<input type="search" value={search}
        onChange={(event) => setSearch(event.target.value)} placeholder="Search persisted records" /></label>
      {filteredRows.length ? <div className="admin-list">{filteredRows.map((row) =>
        <AdminRecord key={row.id} tab={tab} row={row} />)}</div> :
        <Empty>{rows.length ? `No ${tab.toLowerCase()} match this search.` : `No ${tab.toLowerCase()} records are available.`}</Empty>}
      {serverPaged && <div className="pagination-controls" aria-live="polite">
        {pageError ? <MutationFeedback error={pageError} success={null} /> : null}
        {nextCursor ? <button type="button" className="secondary-button" disabled={loadingMore} onClick={loadMore}>
          {loadingMore ? 'Loading more…' : 'Load more'}
        </button> : rows.length > 0 && <p>All matching records loaded.</p>}
      </div>}
    </section><aside className="admin-create-panel"><p className="section-label">ADMINISTRATIVE ACTION</p>
      <form className="workflow-form admin-form" onSubmit={submit} aria-busy={sending}>
        <h2>Create {tab}</h2><Fields tab={tab} departments={departments} jurisdictions={jurisdictions} users={users} />
        <button className="primary-button" disabled={sending}>{sending ? 'Creating…' : 'Create record'}</button>
      </form></aside></div>
  </section>;
}

function appendUnique<T extends { id: string }>(current: T[], incoming: T[]) {
  const ids = new Set(current.map((item) => item.id));
  return [...current, ...incoming.filter((item) => !ids.has(item.id))];
}

function Fields({ tab, departments, jurisdictions, users }: {
  tab: AdminTab; departments: DepartmentDto[]; jurisdictions: JurisdictionDto[]; users: AdminUserDto[];
}) {
  const [departmentId, setDepartmentId] = useState('');
  useEffect(() => setDepartmentId(''), [tab]);
  const compatibleJurisdictions = jurisdictions.filter((item) => item.departmentId === departmentId);
  const compatibleOfficers = users.filter((item) => item.role === 'OFFICER'
    && (!departmentId || item.departmentId === departmentId));
  const organization = <>
    <label>Department<select name="departmentId" required value={departmentId}
      onChange={(event) => setDepartmentId(event.target.value)}>
      <option value="">Select department</option>{departments.map((item) =>
        <option value={item.id} key={item.id}>{item.name} ({item.code})</option>)}
    </select></label>
    <label>Jurisdiction<select name="jurisdictionId" required disabled={!departmentId}>
      <option value="">{departmentId ? 'Select jurisdiction' : 'Select a department first'}</option>
      {compatibleJurisdictions.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}
    </select></label>
  </>;
  if (tab === 'Departments') return <><label>Name<input name="name" required /></label>
    <label>Code<input name="code" required /></label></>;
  if (tab === 'Jurisdictions') return <><label>Name<input name="name" required /></label>
    <label>Type<input name="type" required /></label><label>Department<select name="departmentId" required>
      <option value="">Select department</option>{departments.map((item) =>
        <option value={item.id} key={item.id}>{item.name}</option>)}</select></label></>;
  if (tab === 'Assets') return <><label>Asset code<input name="assetCode" required /></label>
    <label>Name<input name="name" required /></label><label>Asset type<select name="assetType">
      {['BRIDGE', 'ROAD', 'FLYOVER'].map((item) => <option key={item}>{item}</option>)}</select></label>
    {organization}<label>Condition status<input name="conditionStatus" /></label></>;
  if (tab === 'Users') return <><label>Employee code<input name="employeeCode" required /></label>
    <label>Name<input name="name" required /></label><label>Email<input name="email" type="email" required /></label>
    <label>Password<input name="password" type="password" minLength={8} autoComplete="new-password" required /></label>
    <label>Designation<input name="designation" required /></label><label>System role<select name="role">
      {['OFFICER', 'AUDITOR', 'POLICY_ADMIN', 'SYSTEM_ADMIN'].map((item) =>
        <option key={item}>{item}</option>)}</select></label>{organization}
    <p>OFFICER role alone does not grant approval or closure authority.</p></>;
  return <>{organization}<label>User<select name="userId" required disabled={!departmentId}>
    <option value="">{departmentId ? 'Select eligible officer' : 'Select a department first'}</option>
    {compatibleOfficers.map((item) => <option value={item.id} key={item.id}>
      {item.name} · {item.designation}</option>)}</select></label>
    {(['canApprove', 'canReject', 'canRequestModification', 'canRequestReinspection',
      'canEscalate', 'canCloseCase'] as Array<keyof AuthorityInput>).map((item) =>
      <label className="check-label" key={item}><input type="checkbox" name={item} />
        {item.replace('can', 'Can ')}</label>)}
    <label>Maximum priority<select name="maxPriorityLevel"><option value="">No ceiling</option>
      {['LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH', 'CRITICAL'].map((item) =>
        <option key={item}>{item}</option>)}</select></label>
    <label>Valid from<input name="validFrom" type="datetime-local" /></label>
    <label>Valid until<input name="validUntil" type="datetime-local" /></label></>;
}

function AdminRecord({ tab, row }: { tab: AdminTab; row: DepartmentDto | JurisdictionDto | AssetDto | AdminUserDto | AuthorityDto }) {
  let title: ReactNode; let detail: ReactNode;
  if (tab === 'Departments') { const item = row as DepartmentDto; title = item.name; detail = item.code; }
  else if (tab === 'Jurisdictions') { const item = row as JurisdictionDto; title = item.name; detail = item.type; }
  else if (tab === 'Assets') { const item = row as AssetDto; title = item.name; detail = `${item.assetCode} · ${item.assetType}`; }
  else if (tab === 'Users') { const item = row as AdminUserDto; title = item.name; detail = `${item.designation} · ${item.role}`; }
  else { const item = row as AuthorityDto; title = item.user.name; detail = permissionText(item); }
  return <article><strong>{title}</strong><span>{detail}</span></article>;
}

function recordSearchText(tab: AdminTab, row: DepartmentDto | JurisdictionDto | AssetDto | AdminUserDto | AuthorityDto) {
  if (tab === 'Departments') { const item = row as DepartmentDto; return `${item.name} ${item.code}`.toLowerCase(); }
  if (tab === 'Jurisdictions') { const item = row as JurisdictionDto; return `${item.name} ${item.type} ${item.department.name}`.toLowerCase(); }
  if (tab === 'Assets') { const item = row as AssetDto; return `${item.name} ${item.assetCode} ${item.assetType} ${item.department.name} ${item.jurisdiction.name}`.toLowerCase(); }
  if (tab === 'Users') { const item = row as AdminUserDto; return `${item.name} ${item.employeeCode} ${item.designation} ${item.role} ${item.status}`.toLowerCase(); }
  const item = row as AuthorityDto; return `${item.user.name} ${item.user.designation} ${item.department.name} ${item.jurisdiction.name} ${permissionText(item)}`.toLowerCase();
}

function permissionText(authority: AuthorityDto) {
  const expired = authority.validUntil && Date.parse(authority.validUntil) < Date.now();
  return `${expired ? 'Expired' : authority.isActive ? 'Active' : 'Inactive'} authority grant`;
}
function parseAssetType(value: string): AssetInput['assetType'] {
  if (value === 'BRIDGE' || value === 'ROAD' || value === 'FLYOVER') return value;
  throw new Error('Invalid asset type');
}
function parseSystemRole(value: string): SystemRole {
  if (value === 'OFFICER' || value === 'AUDITOR' || value === 'POLICY_ADMIN' || value === 'SYSTEM_ADMIN') return value;
  throw new Error('Invalid system role');
}
function parsePriority(value: string): PriorityLevel | null {
  if (!value) return null;
  if (value === 'LOW' || value === 'MEDIUM' || value === 'HIGH' || value === 'VERY_HIGH' || value === 'CRITICAL') return value;
  throw new Error('Invalid priority ceiling');
}
