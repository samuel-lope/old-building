import { useFacade } from '../context/FacadeContext';

export function StatusBar() {
  const { state, layout } = useFacade();
  const winSlots = layout.slots.filter((s) => s.kind === 'window').length;
  const doorSlots = layout.slots.filter((s) => s.kind === 'door').length;

  return (
    <footer className="statusbar">
      <div className="statusbar-group">
        <span>
          DIMENSÕES:{' '}
          <strong id="statDims">
            {layout.bodyWidth}×{layout.totalHeight}u
          </strong>
        </span>
        <span>
          SLOTS:{' '}
          <strong id="statSlots">
            {winSlots} janelas + {doorSlots} {doorSlots === 1 ? 'porta' : 'portas'}
          </strong>
        </span>
        <span>
          MÓDULOS:{' '}
          <strong id="statMods">
            {state.windowLibrary.length} janelas · {state.doorLibrary.length} portas
          </strong>
        </span>
      </div>
      <div className="statusbar-group">
        <span>
          <span className="status-dot" />
          LOCALSTORAGE SINCRONIZADO
        </span>
      </div>
    </footer>
  );
}
