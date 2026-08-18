import { BriefcaseBusiness, LayoutDashboard, Settings } from 'lucide-react';
import type { SystemRole } from '../../types/api';

export interface NavigationItem { id: string; label: string; description: string; }
export function navigationForRole(role: SystemRole): NavigationItem[] {
  const items = [
    { id: 'dashboard', label: 'Dashboard', description: 'Operational overview' },
    { id: 'cases', label: 'Cases', description: 'Infrastructure case workspace' }
  ];
  if (role === 'SYSTEM_ADMIN') items.push({ id: 'administration', label: 'Administration', description: 'Registry and authority management' });
  return items;
}

const icons = { dashboard: LayoutDashboard, cases: BriefcaseBusiness, administration: Settings };
export default function Sidebar({ role, activeItem, onSelect }: { role: SystemRole; activeItem: string; onSelect(id: string): void }) {
  return (
    <aside className="sidebar">
      <div className="brand"><span className="brand-mark" aria-hidden="true">O</span><div><strong>PROJECT ODYSSEY</strong><span>Operations workspace</span></div></div>
      <nav aria-label="Primary navigation">
        {navigationForRole(role).map((item) => {
          const Icon = icons[item.id as keyof typeof icons];
          return <button key={item.id} type="button" className={activeItem === item.id ? 'nav-item active' : 'nav-item'} aria-current={activeItem === item.id ? 'page' : undefined} onClick={() => onSelect(item.id)}><Icon aria-hidden="true" size={19} /><span><strong>{item.label}</strong><small>{item.description}</small></span></button>;
        })}
      </nav>
      <p className="scope-note">Navigation reflects your role for usability. The Odyssey API remains authoritative.</p>
    </aside>
  );
}
