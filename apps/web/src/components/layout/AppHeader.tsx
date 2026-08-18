import { LogOut } from 'lucide-react';
import type { OrganizationContext } from '../../api/auth.api';
import type { SafeUser } from '../../types/api';

const roleLabels = { OFFICER: 'Officer', AUDITOR: 'Auditor', POLICY_ADMIN: 'Policy administrator', SYSTEM_ADMIN: 'System administrator' } as const;
export default function AppHeader({ user, organization, onLogout }: { user: SafeUser; organization: OrganizationContext | null; onLogout(): void }) {
  return (
    <header className="app-header">
      <div><p className="section-label">ASSIGNED ORGANIZATION</p><p className="organization-name">{organization?.departmentName ?? 'Assigned department'} <span aria-hidden="true">·</span> {organization?.jurisdictionName ?? 'Assigned jurisdiction'}</p></div>
      <div className="identity-actions">
        <div className="identity"><strong>{user.name}</strong><span>{user.designation}</span><span className="role-badge">{roleLabels[user.role]}</span></div>
        <button className="secondary-button" type="button" onClick={onLogout}><LogOut aria-hidden="true" size={17} /> Log out</button>
      </div>
    </header>
  );
}
