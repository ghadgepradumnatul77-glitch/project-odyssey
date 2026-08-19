import { LogOut } from 'lucide-react';
import type { OrganizationContext } from '../../api/auth.api';
import type { SafeUser } from '../../types/api';

const roleLabels = { OFFICER: 'Officer', AUDITOR: 'Auditor', POLICY_ADMIN: 'Policy administrator', SYSTEM_ADMIN: 'System administrator' } as const;
export default function AppHeader({ user, organization, onLogout }: { user: SafeUser; organization: OrganizationContext | null; onLogout(): void }) {
  const displayName = user.role === 'SYSTEM_ADMIN' && user.name.trim().toLowerCase() === 'odyssey system administrator' ? 'System Administrator' : user.name;
  return (
    <header className="app-header">
      <div className="header-command-meta"><div className="header-product"><strong>JanSeva IntelliGov</strong><span>Decision Intelligence for Explainable &amp; Accountable Public Infrastructure</span></div>
        <div><p className="section-label">ASSIGNED ORGANIZATION</p><p className="organization-name">{organization?.departmentName ?? 'Assigned department'} <span aria-hidden="true">·</span> {organization?.jurisdictionName ?? 'Assigned jurisdiction'}</p></div></div>
      <div className="identity-actions">
        <div className="identity"><strong>{displayName}</strong><span>{user.designation}</span><span className="role-badge">{roleLabels[user.role]}</span></div>
        <button className="secondary-button" type="button" onClick={onLogout}><LogOut aria-hidden="true" size={17} /> Log out</button>
      </div>
    </header>
  );
}
