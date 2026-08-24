import { BookOpenCheck, BriefcaseBusiness, ClipboardList, DatabaseZap, LayoutDashboard, Map, Settings, WalletCards } from 'lucide-react';
import type { SystemRole } from '../../types/api';

export interface NavigationItem { id: string; label: string; description: string; }
export function navigationForRole(role: SystemRole): NavigationItem[] {
  const items = [
    { id: 'dashboard', label: 'Dashboard', description: 'Operational overview' },
    ...(['OFFICER','SYSTEM_ADMIN'].includes(role) ? [{ id: 'public-reports', label: 'Public Reports', description: 'Citizen infrastructure intake' }] : []),
    ...(['OFFICER','SYSTEM_ADMIN'].includes(role) ? [{ id: 'infrastructure-map', label: 'Infrastructure Map', description: 'Geospatial infrastructure intelligence' }] : []),
    { id: 'cases', label: 'Cases', description: 'Infrastructure case workspace' },
    { id: 'portfolio-planning', label: 'Portfolio Planning', description: 'Governed cost and scenario support' }
  ];
  if (role === 'POLICY_ADMIN' || role === 'SYSTEM_ADMIN') items.push({id:'policy-actions',label:'Policy & Actions',description:'Governed planning inputs'});
  if (role === 'AUDITOR' || role === 'SYSTEM_ADMIN') items.push({id:'predictive-readiness',label:'Predictive Data',description:'Governed collection readiness'});
  if (role === 'SYSTEM_ADMIN') items.push({ id: 'administration', label: 'Administration', description: 'Registry and authority management' });
  return items;
}

const icons = { dashboard: LayoutDashboard, 'public-reports': ClipboardList, 'infrastructure-map': Map, cases: BriefcaseBusiness, 'portfolio-planning': WalletCards, 'policy-actions': BookOpenCheck, 'predictive-readiness': DatabaseZap, administration: Settings };
export default function Sidebar({ role, activeItem, onSelect }: { role: SystemRole; activeItem: string; onSelect(id: string): void }) {
  return (
    <aside className="sidebar">
      <div className="brand"><img className="brand-emblem" src="/assets/state-emblem-of-india.svg" alt="State Emblem of India" /><div><strong>JANSEVA INTELLIGOV</strong><span>Operations workspace</span></div></div>
      <nav aria-label="Primary navigation">
        {navigationForRole(role).map((item) => {
          const Icon = icons[item.id as keyof typeof icons];
          return <button key={item.id} type="button" className={activeItem === item.id ? 'nav-item active' : 'nav-item'} aria-current={activeItem === item.id ? 'page' : undefined} onClick={() => onSelect(item.id)}><Icon aria-hidden="true" size={19} /><span><strong>{item.label}</strong><small>{item.description}</small></span></button>;
        })}
      </nav>
      <p className="scope-note">Navigation reflects your role for usability. The governed service remains authoritative.</p>
    </aside>
  );
}
