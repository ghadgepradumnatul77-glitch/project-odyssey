import { useState } from 'react';
import { useAuth } from '../../auth/useAuth';
import AppHeader from './AppHeader';
import Sidebar, { navigationForRole } from './Sidebar';
import CasesPage, { type CasesFilterPreset } from '../../pages/CasesPage';
import DashboardPage from '../../pages/DashboardPage';
import AdministrationPage, { type AdminTab } from '../../pages/AdministrationPage';
import PublicReportsPage from '../../pages/PublicReportsPage';
import InfrastructureMapPage from '../../pages/InfrastructureMapPage';
import PolicyActionsPage from '../../pages/PolicyActionsPage';

export default function AppShell() {
  const { user, organization, logout } = useAuth();
  const [activeItem, setActiveItem] = useState('dashboard');
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [selectedPublicReportId, setSelectedPublicReportId] = useState<string | null>(null);
  const [casesFilter, setCasesFilter] = useState<CasesFilterPreset>(null);
  const [administrationTab, setAdministrationTab] = useState<AdminTab>('Departments');
  if (!user) return null;
  const selected = navigationForRole(user.role).find((item) => item.id === activeItem) ?? navigationForRole(user.role)[0];
  return (
    <div className="application-shell">
      <Sidebar role={user.role} activeItem={selected.id} onSelect={(item) => { if (item === 'cases') { setSelectedCaseId(null); setCasesFilter(null); } setActiveItem(item); }} />
      <div className="application-main">
        <AppHeader user={user} organization={organization} onLogout={logout} />
        <main className="workspace" tabIndex={-1}>
          {selected.id === 'public-reports' ? <PublicReportsPage initialReportId={selectedPublicReportId} onOpenCase={(caseId)=>{setCasesFilter(null);setSelectedCaseId(caseId);setActiveItem('cases');}} /> : selected.id === 'infrastructure-map' ? <InfrastructureMapPage onOpenReport={(reportId)=>{setSelectedPublicReportId(reportId);setActiveItem('public-reports');}} onOpenCase={(caseId)=>{setCasesFilter(null);setSelectedCaseId(caseId);setActiveItem('cases');}} /> : selected.id === 'cases' ? <CasesPage initialCaseId={selectedCaseId} initialFilter={casesFilter} /> : selected.id === 'dashboard' ? <DashboardPage
            onCases={(filter) => { setSelectedCaseId(null); setCasesFilter(filter ?? null); setActiveItem('cases'); }}
            onCase={(caseId) => { setCasesFilter(null); setSelectedCaseId(caseId); setActiveItem('cases'); }}
            onAdmin={(tab) => { setAdministrationTab(tab ?? 'Departments'); setActiveItem('administration'); }}
          /> : selected.id === 'administration' ? <AdministrationPage initialTab={administrationTab} /> : selected.id === 'policy-actions'?<PolicyActionsPage/> : <>
          <p className="eyebrow">PROTECTED WORKSPACE</p><h1>{selected.label}</h1>
          <p className="summary">{selected.description} will be implemented in a later product phase.</p>
          {user.role === 'SYSTEM_ADMIN' && selected.id === 'dashboard' && <div className="boundary-note"><strong>Administrative boundary</strong><p>System administrators have global read and registry administration access. Operational officer actions require the appropriate officer identity and authority.</p></div>}
          </>}
        </main>
      </div>
    </div>
  );
}
