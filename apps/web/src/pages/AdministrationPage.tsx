import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import {
  createAsset, createAuthority, createDepartment, createJurisdiction, createUser,
  listAssets, listAuthorities, listDepartments, listJurisdictions, listUsers,
  type AdminUserDto, type AssetDto, type AssetInput, type AuthorityDto, type AuthorityInput,
  type DepartmentDto, type JurisdictionDto, type UserInput,
} from '../api/admin.api';
import { useAuth } from '../auth/useAuth';
import { Empty, ErrorState, Loading } from '../components/AsyncState';
import { MutationFeedback } from '../components/workflow/MutationFeedback';
import type { PriorityLevel } from '../api/cases.api';
import type { SystemRole } from '../types/api';

type Tab = 'Departments' | 'Jurisdictions' | 'Assets' | 'Users' | 'Approval Authorities';
const tabs: Tab[] = ['Departments', 'Jurisdictions', 'Assets', 'Users', 'Approval Authorities'];

export default function AdministrationPage() {
  const { token } = useAuth();
  const [tab, setTab] = useState<Tab>('Departments');
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

  useEffect(() => {
    if (!token) return;
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    Promise.all([
      listDepartments(token, controller.signal), listJurisdictions(token, controller.signal),
      listAssets(token, controller.signal), listUsers(token, controller.signal),
      listAuthorities(token, controller.signal),
    ]).then(([nextDepartments, nextJurisdictions, nextAssets, nextUsers, nextAuthorities]) => {
      setDepartments(nextDepartments); setJurisdictions(nextJurisdictions); setAssets(nextAssets);
      setUsers(nextUsers); setAuthorities(nextAuthorities);
    }).catch((reason) => {
      if (!controller.signal.aborted) setError(reason);
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false);
    });
    return () => controller.abort();
  }, [reload, token]);

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

  return <section aria-labelledby="administration-heading">
    <p className="eyebrow">SYSTEM ADMINISTRATION</p>
    <h1 id="administration-heading">Administration</h1>
    <p className="summary">Registry management is separate from operational workflow authority.</p>
    <nav className="admin-tabs" aria-label="Administration resources">
      {tabs.map((item) => <button type="button" className={tab === item ? 'active' : ''}
        aria-current={tab === item ? 'page' : undefined}
        onClick={() => { setTab(item); setMutationError(null); setSuccess(null); }} key={item}>{item}</button>)}
    </nav>
    <form className="workflow-form admin-form" onSubmit={submit} aria-busy={sending}>
      <h2>Create {tab}</h2>
      <Fields tab={tab} departments={departments} jurisdictions={jurisdictions} users={users} />
      <button className="primary-button" disabled={sending}>{sending ? 'Creating…' : 'Create record'}</button>
    </form>
    <MutationFeedback error={mutationError} success={success} />
    <h2>{tab}</h2>
    {rows.length ? <div className="admin-list">{rows.map((row) =>
      <AdminRecord key={row.id} tab={tab} row={row} />)}</div> :
      <Empty>{`No ${tab.toLowerCase()} records are available.`}</Empty>}
  </section>;
}

function Fields({ tab, departments, jurisdictions, users }: {
  tab: Tab; departments: DepartmentDto[]; jurisdictions: JurisdictionDto[]; users: AdminUserDto[];
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

function AdminRecord({ tab, row }: { tab: Tab; row: DepartmentDto | JurisdictionDto | AssetDto | AdminUserDto | AuthorityDto }) {
  let title: ReactNode; let detail: ReactNode;
  if (tab === 'Departments') { const item = row as DepartmentDto; title = item.name; detail = item.code; }
  else if (tab === 'Jurisdictions') { const item = row as JurisdictionDto; title = item.name; detail = item.type; }
  else if (tab === 'Assets') { const item = row as AssetDto; title = item.name; detail = `${item.assetCode} · ${item.assetType}`; }
  else if (tab === 'Users') { const item = row as AdminUserDto; title = item.name; detail = `${item.designation} · ${item.role}`; }
  else { const item = row as AuthorityDto; title = item.user.name; detail = permissionText(item); }
  return <article><strong>{title}</strong><span>{detail}</span></article>;
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
