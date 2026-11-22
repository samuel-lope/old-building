import { useFacade } from '../context/FacadeContext';

export function Toast() {
  const { toastMessage } = useFacade();

  return (
    <div id="toast" className={`toast ${toastMessage ? 'show' : ''}`} role="status" aria-live="polite">
      <span className="toast-dot" />
      <span id="toastText">{toastMessage || 'Salvo'}</span>
    </div>
  );
}
