import { FEATURE_DOCS } from '../constants/featureDocs';
import { useFacade } from '../context/FacadeContext';

interface HelpPopoverProps {
  docId: string;
}

export function HelpButton({
  docId,
  isOpen,
  onToggle
}: {
  docId: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const doc = FEATURE_DOCS.find((d) => d.id === docId);
  if (!doc) return null;

  return (
    <button
      type="button"
      className={`help-btn ${isOpen ? 'active' : ''}`}
      title={`Ajuda: ${doc.title}`}
      aria-label={`Ajuda sobre ${doc.title}`}
      aria-expanded={isOpen}
      onClick={onToggle}
    >
      ?
    </button>
  );
}

export function HelpPopoverBody({ docId, onClose }: HelpPopoverProps & { onClose: () => void }) {
  const { openDocSection } = useFacade();
  const doc = FEATURE_DOCS.find((d) => d.id === docId);
  if (!doc) return null;

  return (
    <div className="help-popover" role="region" aria-label={`Documentação de ${doc.title}`}>
      <p className="help-popover-summary">{doc.summary}</p>
      <p className="help-popover-tech">{doc.howItWorks}</p>
      {doc.tips.length > 0 && (
        <ul className="help-popover-tips">
          {doc.tips.map((tip, idx) => (
            <li key={idx}>{tip}</li>
          ))}
        </ul>
      )}
      <div className="help-popover-footer">
        <button
          type="button"
          className="btn btn-sm"
          onClick={() => {
            onClose();
            openDocSection(doc.id);
          }}
        >
          Ver tabela de parâmetros →
        </button>
        <button type="button" className="btn btn-sm" onClick={onClose}>
          Fechar
        </button>
      </div>
    </div>
  );
}
