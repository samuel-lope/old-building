import { useEffect, useState } from 'react';
import { useFacade } from '../context/FacadeContext';

export function JsonModal() {
  const { state, isJsonModalOpen, closeJsonModal, importJsonText, showToast } = useFacade();
  const [text, setText] = useState('');

  const formatCurrentState = () => {
    const exportObj = {
      version: state.version,
      building: state.building,
      windowLibrary: state.windowLibrary,
      doorLibrary: state.doorLibrary,
      slotAssignments: state.slotAssignments,
      slotOverrides: state.slotOverrides
    };
    setText(JSON.stringify(exportObj, null, 2));
  };

  useEffect(() => {
    if (isJsonModalOpen) {
      formatCurrentState();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isJsonModalOpen]);

  useEffect(() => {
    if (!isJsonModalOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeJsonModal();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isJsonModalOpen, closeJsonModal]);

  if (!isJsonModalOpen) return null;

  const handleCopy = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        showToast('JSON copiado para a área de transferência');
        return;
      }
      showToast('Área de transferência indisponível neste navegador');
    } catch {
      showToast('Não foi possível copiar automaticamente');
    }
  };

  return (
    <div
      id="jsonModal"
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeJsonModal();
      }}
    >
      <div className="modal-box">
        <div className="modal-header">
          <span className="modal-title">SCHEMA JSON DO PROJETO — DATA-DRIVEN STATE</span>
          <button id="btnCloseJson" className="btn btn-sm" type="button" onClick={closeJsonModal}>
            Fechar (Esc)
          </button>
        </div>
        <div className="modal-body">
          <div className="field-sub">
            Inspecione o estado completo (<code style={{ color: 'var(--accent)' }}>building</code>
            , <code style={{ color: 'var(--accent)' }}>windowLibrary</code>,{' '}
            <code style={{ color: 'var(--accent)' }}>doorLibrary</code>,{' '}
            <code style={{ color: 'var(--accent)' }}>slotAssignments</code>,{' '}
            <code style={{ color: 'var(--accent)' }}>slotOverrides</code>) ou cole um JSON válido
            abaixo para restaurar o projeto.
          </div>
          <textarea
            id="jsonTextarea"
            className="json-textarea"
            spellCheck={false}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>
        <div className="modal-footer">
          <button id="btnCopyJson" className="btn" type="button" onClick={handleCopy}>
            Copiar JSON
          </button>
          <div style={{ display: 'flex', gap: 8 }}>
            <button id="btnFormatJson" className="btn" type="button" onClick={formatCurrentState}>
              Recarregar Atual
            </button>
            <button
              id="btnImportJson"
              className="btn btn-primary"
              type="button"
              onClick={() => importJsonText(text)}
            >
              Aplicar / Importar JSON
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
