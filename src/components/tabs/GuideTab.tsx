import { FEATURE_DOCS } from '../../constants/featureDocs';
import { useFacade } from '../../context/FacadeContext';

export function GuideTab() {
  const { openDocSection } = useFacade();

  return (
    <div id="tab-guide" className="tab-pane">
      <div className="section-card">
        <div className="section-title">
          <span className="section-title-left">
            <span className="section-dot" />
            Guia Rápido das Funcionalidades
          </span>
          <button
            type="button"
            className="btn btn-sm btn-primary"
            onClick={() => openDocSection(FEATURE_DOCS[0].id)}
          >
            Abrir Central Completa
          </button>
        </div>
        <p className="field-sub" style={{ lineHeight: 1.5 }}>
          Explore a documentação técnica de cada módulo do NY Facade Studio. Você também pode
          clicar no botão <strong style={{ color: 'var(--accent)' }}>?</strong> em qualquer seção
          das abas anteriores para consultar ajuda contextual imediata.
        </p>
      </div>

      <div className="section-card">
        <div className="section-title">
          <span className="section-title-left">
            <span className="section-dot" />
            Catálogo de Funcionalidades ({FEATURE_DOCS.length})
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {FEATURE_DOCS.map((doc) => (
            <div key={doc.id} className="guide-card">
              <div className="guide-card-head">
                <span className="guide-category">
                  {doc.category} · {doc.tabLabel}
                </span>
                <button
                  type="button"
                  className="btn btn-sm"
                  onClick={() => openDocSection(doc.id)}
                >
                  Detalhes ({doc.parameters.length})
                </button>
              </div>
              <div className="field-label">{doc.title}</div>
              <div className="field-sub" style={{ lineHeight: 1.45 }}>
                {doc.summary}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="section-card">
        <div className="section-title">
          <span className="section-title-left">
            <span className="section-dot" />
            Endpoints Cloudflare Workers
          </span>
        </div>
        <div className="field-sub" style={{ fontFamily: 'var(--font-mono)', lineHeight: 1.65 }}>
          <div>GET /api/health → status e versão do Worker</div>
          <div>GET /api/docs → JSON completo desta documentação</div>
          <div>GET /api/presets → paletas e biblioteca padrão</div>
          <div>GET /* → SPA React via env.ASSETS</div>
        </div>
      </div>
    </div>
  );
}
