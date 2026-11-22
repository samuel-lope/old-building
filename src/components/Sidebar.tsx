import { useFacade } from '../context/FacadeContext';
import type { ActiveTab } from '../types/facade';
import { DoorsTab } from './tabs/DoorsTab';
import { GuideTab } from './tabs/GuideTab';
import { InterpolationTab } from './tabs/InterpolationTab';
import { StructureTab } from './tabs/StructureTab';
import { WindowsTab } from './tabs/WindowsTab';

const TABS: Array<{ id: ActiveTab; label: string }> = [
  { id: 'structure', label: '1. Estrutura' },
  { id: 'windows', label: '2. Janelas' },
  { id: 'doors', label: '3. Portas' },
  { id: 'interpolation', label: '4. Slots' },
  { id: 'guide', label: '5. Guia' }
];

export function Sidebar() {
  const { state, setActiveTab } = useFacade();
  const activeTab = state.ui.activeTab;

  return (
    <aside className="sidebar">
      <nav className="tabs-bar" role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="sidebar-body">
        {activeTab === 'structure' && <StructureTab />}
        {activeTab === 'windows' && <WindowsTab />}
        {activeTab === 'doors' && <DoorsTab />}
        {activeTab === 'interpolation' && <InterpolationTab />}
        {activeTab === 'guide' && <GuideTab />}
      </div>
    </aside>
  );
}
