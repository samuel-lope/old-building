import { useEffect, useRef } from 'react';
import { useFacade } from '../context/FacadeContext';
import type { ActiveTab } from '../types/facade';
import { DoorsTab } from './tabs/DoorsTab';
import { GuideTab } from './tabs/GuideTab';
import { InterpolationTab } from './tabs/InterpolationTab';
import { StructureTab } from './tabs/StructureTab';
import { WindowsTab } from './tabs/WindowsTab';

interface TabConfig {
  id: ActiveTab;
  desktopLabel: string;
  mobileLabel: string;
  icon: React.ReactNode;
}

const TABS: TabConfig[] = [
  {
    id: 'structure',
    desktopLabel: '1. Estrutura',
    mobileLabel: 'Estrutura',
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 20V6l4-2 4 2v2l4-2 4 2v12" />
        <path d="M2 20h20" />
        <path d="M8 10h.01M16 10h.01M8 14h.01M16 14h.01" />
      </svg>
    )
  },
  {
    id: 'windows',
    desktopLabel: '2. Janelas',
    mobileLabel: 'Janelas',
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="4" y="3" width="16" height="18" rx="1.5" />
        <line x1="12" y1="3" x2="12" y2="21" />
        <line x1="4" y1="12" x2="20" y2="12" />
      </svg>
    )
  },
  {
    id: 'doors',
    desktopLabel: '3. Portas',
    mobileLabel: 'Portas',
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16" />
        <path d="M4 21h16" />
        <circle cx="15" cy="12" r="1" fill="currentColor" />
      </svg>
    )
  },
  {
    id: 'interpolation',
    desktopLabel: '4. Slots',
    mobileLabel: 'Slots',
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="3" width="8" height="8" rx="1" />
        <rect x="13" y="3" width="8" height="8" rx="1" />
        <rect x="3" y="13" width="8" height="8" rx="1" />
        <rect x="13" y="13" width="8" height="8" rx="1" />
      </svg>
    )
  },
  {
    id: 'guide',
    desktopLabel: '5. Guia',
    mobileLabel: 'Guia',
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M9.5 9.5a2.5 2.5 0 0 1 5 .7c0 1.8-2.5 2.1-2.5 3.6" />
        <circle cx="12" cy="17.2" r="0.8" fill="currentColor" />
      </svg>
    )
  }
];

export function Sidebar() {
  const {
    state,
    layout,
    setActiveTab,
    mobileSheetSnap,
    setMobileSheetSnap,
    cycleMobileSheetSnap
  } = useFacade();
  const activeTab = state.ui.activeTab;
  const activeTabInfo = TABS.find((t) => t.id === activeTab) || TABS[0];

  const bodyRef = useRef<HTMLDivElement | null>(null);
  const dragStartYRef = useRef<number | null>(null);
  const dragMovedRef = useRef(false);

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = 0;
    }
  }, [activeTab]);

  const handleDragTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length !== 1) return;
    dragStartYRef.current = e.touches[0].clientY;
    dragMovedRef.current = false;
  };

  const handleDragTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (dragStartYRef.current === null || e.touches.length !== 1) return;
    const deltaY = e.touches[0].clientY - dragStartYRef.current;
    if (Math.abs(deltaY) < 28) return;

    dragMovedRef.current = true;
    dragStartYRef.current = e.touches[0].clientY;

    if (deltaY < 0) {
      setMobileSheetSnap(mobileSheetSnap === 'collapsed' ? 'half' : 'full');
    } else {
      setMobileSheetSnap(mobileSheetSnap === 'full' ? 'half' : 'collapsed');
    }
  };

  const handleDragTouchEnd = () => {
    dragStartYRef.current = null;
  };

  return (
    <aside className={`sidebar sidebar--snap-${mobileSheetSnap}`}>
      <div className="mobile-sheet-header">
        <div
          className="sheet-drag-zone"
          onTouchStart={handleDragTouchStart}
          onTouchMove={handleDragTouchMove}
          onTouchEnd={handleDragTouchEnd}
          onClick={() => {
            if (!dragMovedRef.current) cycleMobileSheetSnap();
          }}
        >
          <span className="sheet-drag-pill" aria-hidden="true" />
        </div>

        <div className="sheet-header-row">
          <div className="sheet-header-meta">
            <span className="sheet-active-title">{activeTabInfo.desktopLabel}</span>
            <span className="mono-val">
              {layout.bodyWidth}×{layout.totalHeight}u · {state.building.typicalFloors}P
            </span>
          </div>

          <div className="sheet-snap-controls" role="group" aria-label="Altura do painel móvel">
            <button
              id="btnSnapCollapsed"
              type="button"
              className={`btn btn-snap ${mobileSheetSnap === 'collapsed' ? 'active' : ''}`}
              title="Minimizar para ver fachada"
              onClick={() => setMobileSheetSnap('collapsed')}
            >
              ▼
            </button>
            <button
              id="btnSnapHalf"
              type="button"
              className={`btn btn-snap ${mobileSheetSnap === 'half' ? 'active' : ''}`}
              title="Meia tela 9:16"
              onClick={() => setMobileSheetSnap('half')}
            >
              ◐
            </button>
            <button
              id="btnSnapFull"
              type="button"
              className={`btn btn-snap ${mobileSheetSnap === 'full' ? 'active' : ''}`}
              title="Expandir painel"
              onClick={() => setMobileSheetSnap('full')}
            >
              ▲
            </button>
          </div>
        </div>
      </div>

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
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label-desktop">{tab.desktopLabel}</span>
            <span className="tab-label-mobile">{tab.mobileLabel}</span>
          </button>
        ))}
      </nav>

      <div ref={bodyRef} className="sidebar-body">
        {activeTab === 'structure' && <StructureTab />}
        {activeTab === 'windows' && <WindowsTab />}
        {activeTab === 'doors' && <DoorsTab />}
        {activeTab === 'interpolation' && <InterpolationTab />}
        {activeTab === 'guide' && <GuideTab />}
      </div>
    </aside>
  );
}
