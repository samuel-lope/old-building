import { useEffect, useState } from 'react';
import { useFacade } from '../context/FacadeContext';

export function Header() {
  const {
    state,
    toggleSlotGuides,
    toggleDimensions,
    openDocSection,
    openJsonModal,
    resetAll,
    exportCleanSvg
  } = useFacade();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mobileMenuOpen]);

  return (
    <>
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">NY</div>
          <span className="brand-title">NY FACADE STUDIO</span>
          <span className="brand-badge">ETAPA 2.7 — EMBASAMENTOS &amp; TOLDO NO TÉRREO</span>
        </div>

        <div className="topbar-actions desktop-actions">
          <button
            id="btnQuickSlots"
            className={`btn ${state.ui.showSlotGuides ? 'active' : ''}`}
            type="button"
            title="Alternar Guias de Slots"
            onClick={toggleSlotGuides}
          >
            Guias de Slots
          </button>
          <button
            id="btnQuickDims"
            className={`btn ${state.ui.showDimensions ? 'active' : ''}`}
            type="button"
            title="Alternar Cotas e Níveis"
            onClick={toggleDimensions}
          >
            Cotas / Níveis
          </button>
          <button
            id="btnOpenDocs"
            className="btn"
            type="button"
            title="Abrir Documentação Completa das Funcionalidades"
            onClick={() => openDocSection('volumetria')}
          >
            ? Documentação
          </button>
          <button
            id="btnOpenJson"
            className="btn"
            type="button"
            title="Inspecionar ou Importar JSON"
            onClick={openJsonModal}
          >
            JSON do Projeto
          </button>
          <button
            id="btnResetAll"
            className="btn"
            type="button"
            title="Restaurar Padrão da Referência"
            onClick={resetAll}
          >
            Resetar Padrão
          </button>
          <button
            id="btnExportSvg"
            className="btn btn-primary"
            type="button"
            title="Exportar SVG Limpo"
            onClick={exportCleanSvg}
          >
            Exportar SVG
          </button>
        </div>

        <div className="topbar-mobile-actions">
          <button
            className={`btn btn-touch-sm ${state.ui.showSlotGuides ? 'active' : ''}`}
            type="button"
            onClick={toggleSlotGuides}
          >
            Guias
          </button>
          <button
            className={`btn btn-touch-sm ${state.ui.showDimensions ? 'active' : ''}`}
            type="button"
            onClick={toggleDimensions}
          >
            Cotas
          </button>
          <button
            className="btn btn-primary btn-touch-sm"
            type="button"
            onClick={exportCleanSvg}
          >
            SVG
          </button>
          <button
            id="btnMobileActionsMenu"
            className={`btn btn-touch-icon ${mobileMenuOpen ? 'active' : ''}`}
            type="button"
            aria-label="Abrir Menu de Ações"
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((v) => !v)}
          >
            ⋮
          </button>
        </div>
      </header>

      {mobileMenuOpen && (
        <div
          className="mobile-actions-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="Menu rápido de ações"
          onClick={(e) => {
            if (e.target === e.currentTarget) setMobileMenuOpen(false);
          }}
        >
          <div className="mobile-actions-sheet">
            <div className="mobile-actions-head">
              <span className="modal-title">AÇÕES DO PROJETO</span>
              <button
                type="button"
                className="btn btn-touch-sm"
                onClick={() => setMobileMenuOpen(false)}
              >
                Fechar
              </button>
            </div>

            <div className="mobile-actions-list">
              <button
                type="button"
                className={`mobile-action-item ${state.ui.showSlotGuides ? 'active' : ''}`}
                onClick={() => {
                  toggleSlotGuides();
                  setMobileMenuOpen(false);
                }}
              >
                <span>Guias de Slots no SVG</span>
                <span className="mono-val">{state.ui.showSlotGuides ? 'ON' : 'OFF'}</span>
              </button>

              <button
                type="button"
                className={`mobile-action-item ${state.ui.showDimensions ? 'active' : ''}`}
                onClick={() => {
                  toggleDimensions();
                  setMobileMenuOpen(false);
                }}
              >
                <span>Cotas &amp; Níveis Arquitetônicos</span>
                <span className="mono-val">{state.ui.showDimensions ? 'ON' : 'OFF'}</span>
              </button>

              <button
                type="button"
                className="mobile-action-item"
                onClick={() => {
                  setMobileMenuOpen(false);
                  openDocSection('volumetria');
                }}
              >
                <span>? Documentação Completa</span>
                <span className="mono-val">DOCS</span>
              </button>

              <button
                type="button"
                className="mobile-action-item"
                onClick={() => {
                  setMobileMenuOpen(false);
                  openJsonModal();
                }}
              >
                <span>&#123; &#125; JSON Data-Driven do Projeto</span>
                <span className="mono-val">JSON</span>
              </button>

              <button
                type="button"
                className="mobile-action-item mobile-action-item--primary"
                onClick={() => {
                  setMobileMenuOpen(false);
                  exportCleanSvg();
                }}
              >
                <span>⬇ Exportar SVG Limpo</span>
                <span className="mono-val">.SVG</span>
              </button>

              <button
                type="button"
                className="mobile-action-item mobile-action-item--danger"
                onClick={() => {
                  setMobileMenuOpen(false);
                  resetAll();
                }}
              >
                <span>↺ Restaurar Padrão de Referência</span>
                <span className="mono-val">RESET</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
