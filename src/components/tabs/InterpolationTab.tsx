import { useState } from 'react';
import { useFacade } from '../../context/FacadeContext';
import { resolveDoorModuleById, resolveModuleById } from '../../engine/facadeRenderer';
import { HelpButton, HelpPopoverBody } from '../HelpPopover';

export function InterpolationTab() {
  const {
    state,
    layout,
    setZoneAssignment,
    setGroundDoorCount,
    setGroundShopMode,
    updateBuilding,
    selectSlot,
    setSlotOverride,
    clearAllOverrides,
    toggleDoorSketch
  } = useFacade();

  const [openHelp, setOpenHelp] = useState<string | null>(null);
  const toggleHelp = (id: string) => setOpenHelp((cur) => (cur === id ? null : id));

  const selectedSlot = layout.slots.find((s) => s.id === state.ui.selectedSlotId);
  const overrideEntries = Object.entries(state.slotOverrides);

  const renderSlotOverrideCard = () => {
    if (!selectedSlot) {
      return (
        <div
          className="field-sub"
          style={{
            padding: 8,
            background: 'var(--bg-input)',
            border: '1px dashed var(--border-strong)',
            borderRadius: 'var(--radius)'
          }}
        >
          Clique em qualquer janela ou porta diretamente no desenho SVG da fachada para selecionar
          um slot individual e aplicar uma sobrescrita.
        </div>
      );
    }

    const isDoor = selectedSlot.kind === 'door';
    const defaultName = isDoor
      ? resolveDoorModuleById(state.doorLibrary, state.slotAssignments.door).name
      : resolveModuleById(
          state.windowLibrary,
          selectedSlot.zone !== 'door' ? state.slotAssignments[selectedSlot.zone] : ''
        ).name;

    return (
      <div className="selected-slot-banner">
        <div className="field-row">
          <span className="mono-val">{selectedSlot.id}</span>
          <button type="button" className="btn btn-sm" onClick={() => selectSlot(null)}>
            Desmarcar
          </button>
        </div>
        <div className="field-sub">
          Zona: <strong>{selectedSlot.label}</strong> (padrão: {defaultName})
        </div>
        <select
          id="selSlotOverride"
          className="select-input"
          value={state.slotOverrides[selectedSlot.id] || '__inherit__'}
          onChange={(e) => setSlotOverride(selectedSlot.id, e.target.value)}
        >
          <option value="__inherit__">↳ Herdar da Zona ({defaultName})</option>
          {isDoor
            ? state.doorLibrary.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.leafLayout})
                </option>
              ))
            : state.windowLibrary.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.cols}×{m.rows})
                </option>
              ))}
        </select>
      </div>
    );
  };

  return (
    <div id="tab-interpolation" className="tab-pane">
      {/* Atribuição por Zona */}
      <div className="section-card">
        <div className="section-title">
          <span className="section-title-left">
            <span className="section-dot" />
            Atribuição por Zona da Fachada
          </span>
          <HelpButton
            docId="interpolacao-slots"
            isOpen={openHelp === 'interpolacao-slots'}
            onToggle={() => toggleHelp('interpolacao-slots')}
          />
        </div>
        {openHelp === 'interpolacao-slots' && (
          <HelpPopoverBody docId="interpolacao-slots" onClose={() => setOpenHelp(null)} />
        )}

        <div className="field">
          <label className="field-label" htmlFor="selZoneTypical">
            Pavimentos Tipo
          </label>
          <select
            id="selZoneTypical"
            className="select-input"
            value={resolveModuleById(state.windowLibrary, state.slotAssignments.typical).id}
            onChange={(e) => setZoneAssignment('typical', e.target.value)}
          >
            {state.windowLibrary.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.cols}×{m.rows})
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label className="field-label" htmlFor="selZoneAttic">
            Pavimento Ático
          </label>
          <select
            id="selZoneAttic"
            className="select-input"
            value={resolveModuleById(state.windowLibrary, state.slotAssignments.attic).id}
            onChange={(e) => setZoneAssignment('attic', e.target.value)}
          >
            {state.windowLibrary.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.cols}×{m.rows})
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label className="field-label" htmlFor="selZoneGround">
            Térreo (Vitrine / Janelas)
          </label>
          <select
            id="selZoneGround"
            className="select-input"
            value={resolveModuleById(state.windowLibrary, state.slotAssignments.ground).id}
            onChange={(e) => setZoneAssignment('ground', e.target.value)}
          >
            {state.windowLibrary.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.cols}×{m.rows})
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label className="field-label" htmlFor="selZoneDoor">
            Térreo (Porta Principal)
          </label>
          <select
            id="selZoneDoor"
            className="select-input"
            value={resolveDoorModuleById(state.doorLibrary, state.slotAssignments.door).id}
            onChange={(e) => setZoneAssignment('door', e.target.value)}
          >
            {state.doorLibrary.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.leafLayout})
              </option>
            ))}
          </select>
        </div>

        <div
          className="field"
          style={{ marginTop: 2, paddingTop: 8, borderTop: '1px solid var(--border)' }}
        >
          <span className="field-label">Atalho Rápido — Portas do Térreo</span>
          <div id="grpGroundDoorCountQuick" className="seg-group seg-2">
            <button
              type="button"
              className={`seg-btn ${state.building.groundDoorCount !== 2 ? 'active' : ''}`}
              onClick={() => setGroundDoorCount(1)}
            >
              1 Porta
            </button>
            <button
              type="button"
              className={`seg-btn ${state.building.groundDoorCount === 2 ? 'active' : ''}`}
              onClick={() => setGroundDoorCount(2)}
            >
              2 Portas + 1 Vitrine
            </button>
          </div>
        </div>

        <div className="field">
          <span className="field-label">Atalho Rápido — Vitrine do Térreo</span>
          <div id="grpGroundShopModeQuick" className="seg-group seg-2">
            <button
              type="button"
              className={`seg-btn ${state.building.groundShopMode === 'double' && state.building.groundDoorCount !== 2 ? 'active' : ''}`}
              disabled={state.building.groundDoorCount === 2}
              onClick={() => setGroundShopMode('double')}
            >
              2 Vitrines
            </button>
            <button
              type="button"
              className={`seg-btn ${state.building.groundShopMode === 'single' || state.building.groundDoorCount === 2 ? 'active' : ''}`}
              onClick={() => setGroundShopMode('single')}
            >
              1 Vitrine
            </button>
          </div>
        </div>

        <div className="field">
          <span className="field-label">Ajuste da Vitrine no Vão</span>
          <div id="grpShopFitModeQuick" className="seg-group seg-2">
            <button
              type="button"
              className={`seg-btn ${state.building.shopFitMode === 'fill' ? 'active' : ''}`}
              onClick={() => updateBuilding({ shopFitMode: 'fill' })}
            >
              Preencher Vão
            </button>
            <button
              type="button"
              className={`seg-btn ${state.building.shopFitMode === 'proportional' ? 'active' : ''}`}
              onClick={() => updateBuilding({ shopFitMode: 'proportional' })}
            >
              Proporcional
            </button>
          </div>
        </div>
      </div>

      {/* Sobrescrita Individual por Slot */}
      <div className="section-card">
        <div className="section-title">
          <span className="section-title-left">
            <span className="section-dot" />
            Sobrescrita Individual por Slot
          </span>
        </div>

        <div id="selectedSlotPanel">{renderSlotOverrideCard()}</div>

        <div className="field" style={{ marginTop: 4 }}>
          <div className="field-row">
            <span className="field-sub">Sobrescritas ativas</span>
            <button
              id="btnClearOverrides"
              className="btn btn-sm"
              type="button"
              onClick={clearAllOverrides}
            >
              Limpar Todas
            </button>
          </div>
          <div id="overridesList" style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {overrideEntries.length === 0 ? (
              <div className="field-sub">Nenhuma sobrescrita individual ativa.</div>
            ) : (
              overrideEntries.map(([sid, mid]) => {
                const name = sid.startsWith('TERREO_PORTA')
                  ? resolveDoorModuleById(state.doorLibrary, mid).name
                  : resolveModuleById(state.windowLibrary, mid).name;
                return (
                  <div key={sid} className="override-chip">
                    <div>
                      <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>
                        {sid}
                      </span>
                      <div className="field-sub">{name}</div>
                    </div>
                    <button
                      type="button"
                      className="btn btn-sm"
                      onClick={() => setSlotOverride(sid, null)}
                    >
                      Herdar
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Visibilidade da Porta */}
      <div className="section-card">
        <div className="section-title">
          <span className="section-title-left">
            <span className="section-dot" />
            Slot da Porta (TERREO_PORTA)
          </span>
        </div>
        <label className="toggle-row">
          <div>
            <div className="field-label">Exibir Módulo da Porta na Prancheta</div>
            <div className="field-sub">Alterna entre o módulo da biblioteca e guia tracejada</div>
          </div>
          <span className="switch">
            <input
              id="chkDoorSketch"
              type="checkbox"
              checked={state.ui.showDoorSketch}
              onChange={toggleDoorSketch}
            />
            <span className="switch-track" />
          </span>
        </label>
      </div>
    </div>
  );
}
