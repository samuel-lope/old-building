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

  return (
    <header className="topbar">
      <div className="brand">
        <div className="brand-mark">NY</div>
        <span className="brand-title">NY FACADE STUDIO</span>
        <span className="brand-badge">ETAPA 2.4 — PORTAS 1/3 + 2 PORTAS + DETALHAMENTO</span>
      </div>

      <div className="topbar-actions">
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
    </header>
  );
}
