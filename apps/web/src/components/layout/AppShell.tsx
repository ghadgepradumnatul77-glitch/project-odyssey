import { useState } from 'react';
import { useAuth } from '../../auth/useAuth';
import AppHeader from './AppHeader';
import Sidebar, { navigationForRole } from './Sidebar';
import CasesPage from '../../pages/CasesPage';
import DashboardPage from '../../pages/DashboardPage';
import AdministrationPage from '../../pages/AdministrationPage';

export default function AppShell() {
  const { user, organization, logout } = useAuth();
  const [activeItem, setActiveItem] = useState('dashboard');
  if (!user) return null;
  const selected = navigationForRole(user.role).find((item) => item.id === activeItem) ?? navigationForRole(user.role)[0];
  return (
    <div className="application-shell">
      <Sidebar role={user.role} activeItem={selected.id} onSelect={setActiveItem} />
      <div className="application-main">
        <AppHeader user={user} organization={organization} onLogout={logout} />
        <main className="workspace" tabIndex={-1}>
          {selected.id === 'cases' ? <CasesPage /> : selected.id === 'dashboard' ? <DashboardPage onCases={() => setActiveItem('cases')} onAdmin={() => setActiveItem('administration')} /> : selected.id === 'administration' ? <AdministrationPage /> : <>
          <p className="eyebrow">PROTECTED WORKSPACE</p><h1>{selected.label}</h1>
          <p className="summary">{selected.description} will be implemented in a later Odyssey frontend phase.</p>
          {user.role === 'SYSTEM_ADMIN' && selected.id === 'dashboard' && <div className="boundary-note"><strong>Administrative boundary</strong><p>System administrators have global read and registry administration access. Operational officer actions require the appropriate officer identity and authority.</p></div>}
          </>}
        </main>
      </div>
    </div>
  );
}
