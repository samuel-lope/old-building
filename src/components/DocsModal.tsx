import { useEffect, useMemo, useState } from 'react';
import { FEATURE_DOCS } from '../constants/featureDocs';
import { useFacade } from '../context/FacadeContext';

export function DocsModal() {
  const { isDocsModalOpen, closeDocsModal, activeDocSectionId, setActiveDocSectionId } = useFacade();
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!isDocsModalOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeDocsModal();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isDocsModalOpen, closeDocsModal]);

  const filteredDocs = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return FEATURE_DOCS;
    return FEATURE_DOCS.filter(
      (doc) =>
        doc.title.toLowerCase().includes(q) ||
        doc.summary.toLowerCase().includes(q) ||
        doc.howItWorks.toLowerCase().includes(q) ||
        doc.category.toLowerCase().includes(q) ||
        doc.parameters.some(
          (p) => p.name.toLowerCase().includes(q) || p.behavior.toLowerCase().includes(q)
        )
    );
  }, [query]);

  const activeDoc =
    filteredDocs.find((d) => d.id === activeDocSectionId) ||
    filteredDocs[0] ||
    FEATURE_DOCS[0];

  if (!isDocsModalOpen) return null;

  return (
    <div
      id="docsModal"
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Documentação do NY Facade Studio"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeDocsModal();
      }}
    >
      <div className="modal-box docs-modal-box">
        <div className="modal-header">
          <span className="modal-title">
            DOCUMENTAÇÃO INTERATIVA — FUNCIONALIDADES &amp; MOTOR SVG
          </span>
          <button className="btn btn-sm" type="button" onClick={closeDocsModal}>
            Fechar (Esc)
          </button>
        </div>

        <div className="docs-layout">
          <aside className="docs-nav">
            <input
              type="search"
              className="text-input"
              placeholder="Buscar funcionalidade ou parâmetro..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {filteredDocs.length === 0 ? (
              <div className="field-sub">Nenhum tópico encontrado para &ldquo;{query}&rdquo;.</div>
            ) : (
              filteredDocs.map((doc) => (
                <button
                  key={doc.id}
                  type="button"
                  className={`docs-nav-item ${activeDoc.id === doc.id ? 'active' : ''}`}
                  onClick={() => setActiveDocSectionId(doc.id)}
                >
                  <span className="docs-nav-item-cat">
                    {doc.category} · {doc.tabLabel}
                  </span>
                  <span className="docs-nav-item-title">{doc.title}</span>
                </button>
              ))
            )}
          </aside>

          <section className="docs-content">
            <article className="docs-article">
              <div className="field-row">
                <span className="guide-category">
                  {activeDoc.category} · {activeDoc.tabLabel}
                </span>
                <span className="mono-val">ID: {activeDoc.id}</span>
              </div>

              <h2 className="docs-article-title">{activeDoc.title}</h2>
              <p style={{ color: 'var(--text-main)' }}>{activeDoc.summary}</p>

              <div className="docs-box">
                <div className="section-title" style={{ marginBottom: 6 }}>
                  <span className="section-title-left">
                    <span className="section-dot" />
                    Como Funciona (Comportamento Procedural)
                  </span>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>{activeDoc.howItWorks}</p>
              </div>

              <div className="docs-box" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="docs-table">
                  <thead>
                    <tr>
                      <th>Parâmetro</th>
                      <th>Controle</th>
                      <th>Faixa / Opções</th>
                      <th>Padrão</th>
                      <th>Impacto na Fachada</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeDoc.parameters.map((param) => (
                      <tr key={param.name}>
                        <td data-label="Parâmetro" style={{ fontWeight: 600, color: '#FFFFFF' }}>
                          {param.name}
                        </td>
                        <td
                          data-label="Controle"
                          style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5 }}
                        >
                          {param.control}
                        </td>
                        <td data-label="Faixa / Opções" style={{ color: 'var(--accent)' }}>
                          {param.rangeOrOptions}
                        </td>
                        <td
                          data-label="Padrão"
                          style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5 }}
                        >
                          {param.defaultValue}
                        </td>
                        <td data-label="Impacto" style={{ color: 'var(--text-muted)' }}>
                          {param.behavior}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {activeDoc.tips.length > 0 && (
                <div className="docs-box">
                  <div className="section-title" style={{ marginBottom: 6 }}>
                    <span className="section-title-left">
                      <span className="section-dot" />
                      Boas Práticas &amp; Notas Técnicas
                    </span>
                  </div>
                  <ul className="help-popover-tips">
                    {activeDoc.tips.map((tip, i) => (
                      <li key={i} style={{ fontSize: 11.5 }}>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </article>
          </section>
        </div>
      </div>
    </div>
  );
}
