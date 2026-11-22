import { useState } from 'react';
import { BUILDING_PALETTES } from '../../constants/defaults';
import { useFacade } from '../../context/FacadeContext';
import type {
  BuildingColors,
  ColumnBandsMode,
  CorniceStyle,
  EntranceStairsStyle,
  FireEscapePlacement,
  GardenStyle,
  WallPatternType
} from '../../types/facade';
import { HelpButton, HelpPopoverBody } from '../HelpPopover';

const COLOR_FIELDS: Array<{ key: keyof BuildingColors; label: string }> = [
  { key: 'wall', label: 'Parede' },
  { key: 'wallShadow', label: 'Sombra' },
  { key: 'stroke', label: 'Contorno' },
  { key: 'cornice', label: 'Cornija' },
  { key: 'corniceFrieze', label: 'Friso' },
  { key: 'plinthBand', label: 'Cantaria / Faixas' },
  { key: 'door', label: 'Porta Base' },
  { key: 'ironwork', label: 'Ferro / Escada' }
];

export function StructureTab() {
  const {
    state,
    updateBuilding,
    updateBuildingColor,
    applyBuildingPalette,
    setGroundDoorCount,
    setGroundShopMode
  } = useFacade();
  const b = state.building;
  const [openHelp, setOpenHelp] = useState<string | null>(null);
  const toggleHelp = (id: string) => setOpenHelp((cur) => (cur === id ? null : id));

  return (
    <div id="tab-structure" className="tab-pane">
      {/* Volumetria & Pavimentos */}
      <div className="section-card">
        <div className="section-title">
          <span className="section-title-left">
            <span className="section-dot" />
            Volumetria &amp; Pavimentos
          </span>
          <HelpButton
            docId="volumetria"
            isOpen={openHelp === 'volumetria'}
            onToggle={() => toggleHelp('volumetria')}
          />
        </div>
        {openHelp === 'volumetria' && (
          <HelpPopoverBody docId="volumetria" onClose={() => setOpenHelp(null)} />
        )}

        <div className="field">
          <div className="field-row">
            <label className="field-label" htmlFor="inpTypicalFloors">
              Pavimentos Tipo
            </label>
            <span id="valTypicalFloors" className="mono-val">
              {b.typicalFloors}
            </span>
          </div>
          <input
            id="inpTypicalFloors"
            type="range"
            min={1}
            max={6}
            step={1}
            value={b.typicalFloors}
            onChange={(e) => updateBuilding({ typicalFloors: parseInt(e.target.value, 10) })}
          />
        </div>

        <div className="field">
          <div className="field-row">
            <label className="field-label" htmlFor="inpWidth">
              Largura da Fachada
            </label>
            <span id="valWidth" className="mono-val">
              {b.bodyWidth}u
            </span>
          </div>
          <input
            id="inpWidth"
            type="range"
            min={220}
            max={520}
            step={10}
            value={b.bodyWidth}
            onChange={(e) => updateBuilding({ bodyWidth: parseInt(e.target.value, 10) })}
          />
        </div>

        <div className="field">
          <span className="field-label">Janelas por Pavimento Tipo (2 a 6)</span>
          <div id="grpTypicalSlots" className="seg-group seg-5">
            {[2, 3, 4, 5, 6].map((val) => (
              <button
                key={val}
                type="button"
                className={`seg-btn ${b.typicalSlotsCount === val ? 'active' : ''}`}
                onClick={() => updateBuilding({ typicalSlotsCount: val })}
              >
                {val}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <span className="field-label">Quantidade de Seteiras (Ameias)</span>
          <div id="grpBattlements" className="seg-group seg-5">
            {[2, 3, 4, 5, 6].map((val) => (
              <button
                key={val}
                type="button"
                className={`seg-btn ${b.battlementsCount === val ? 'active' : ''}`}
                onClick={() => updateBuilding({ battlementsCount: val })}
              >
                {val}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Traço, Paredes & Colunas */}
      <div className="section-card">
        <div className="section-title">
          <span className="section-title-left">
            <span className="section-dot" />
            Traço, Paredes &amp; Colunas
          </span>
          <HelpButton
            docId="paredes-colunas-contornos"
            isOpen={openHelp === 'paredes-colunas-contornos'}
            onToggle={() => toggleHelp('paredes-colunas-contornos')}
          />
        </div>
        {openHelp === 'paredes-colunas-contornos' && (
          <HelpPopoverBody
            docId="paredes-colunas-contornos"
            onClose={() => setOpenHelp(null)}
          />
        )}

        <div className="field">
          <div className="field-row">
            <label className="field-label" htmlFor="inpBuildingStroke">
              Espessura do Contorno da Edificação
            </label>
            <span id="valBuildingStroke" className="mono-val">
              {Number(b.buildingStrokeWidth ?? 5).toFixed(1)}u
            </span>
          </div>
          <input
            id="inpBuildingStroke"
            type="range"
            min={2}
            max={8}
            step={0.5}
            value={b.buildingStrokeWidth ?? 5}
            onChange={(e) => updateBuilding({ buildingStrokeWidth: parseFloat(e.target.value) })}
          />
        </div>

        <div className="field">
          <div className="field-row">
            <label className="field-label" htmlFor="inpElementStroke">
              Espessura do Contorno dos Elementos
            </label>
            <span id="valElementStroke" className="mono-val">
              {Number(b.elementStrokeWidth ?? 2.4).toFixed(2)}u
            </span>
          </div>
          <input
            id="inpElementStroke"
            type="range"
            min={1}
            max={4.5}
            step={0.25}
            value={b.elementStrokeWidth ?? 2.4}
            onChange={(e) => updateBuilding({ elementStrokeWidth: parseFloat(e.target.value) })}
          />
        </div>

        <div className="field">
          <label className="field-label" htmlFor="selWallPattern">
            Detalhamento das Paredes
          </label>
          <select
            id="selWallPattern"
            className="select-input"
            value={b.wallPattern || 'bricks_classic'}
            onChange={(e) => updateBuilding({ wallPattern: e.target.value as WallPatternType })}
          >
            <option value="none">Alvenaria Lisa (Sem Textura)</option>
            <option value="bricks_classic">Tijolos Clássicos NY</option>
            <option value="bricks_detailed">Tijolos Detalhados + Blocos</option>
            <option value="stone_ashlar">Blocos de Cantaria (Ashlar)</option>
          </select>
        </div>

        <div className="field">
          <span className="field-label">Faixas de Colunas / Pilastras</span>
          <div id="grpColumnBands" className="seg-group seg-4">
            {(
              [
                { val: 'none', label: 'Nenhuma' },
                { val: 'center', label: 'Central' },
                { val: 'edges', label: 'Bordas' },
                { val: 'all_bays', label: 'Entre Vãos' }
              ] as Array<{ val: ColumnBandsMode; label: string }>
            ).map((opt) => (
              <button
                key={opt.val}
                type="button"
                className={`seg-btn ${b.columnBandsMode === opt.val ? 'active' : ''}`}
                onClick={() =>
                  updateBuilding({
                    columnBandsMode: opt.val,
                    hasCenterBand: opt.val === 'center' || opt.val === 'all_bays'
                  })
                }
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <span className="field-label">Ornamento das Cornijas</span>
          <div id="grpCorniceStyle" className="seg-group seg-3">
            {(
              [
                { val: 'classic', label: 'Clássica' },
                { val: 'dentils', label: 'Dentículos' },
                { val: 'modillions', label: 'Mísulas' }
              ] as Array<{ val: CorniceStyle; label: string }>
            ).map((opt) => (
              <button
                key={opt.val}
                type="button"
                className={`seg-btn ${b.corniceStyle === opt.val ? 'active' : ''}`}
                onClick={() => updateBuilding({ corniceStyle: opt.val })}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <label className="toggle-row">
          <div>
            <div className="field-label">Cunhais nas Quinas (Quoins)</div>
            <div className="field-sub">Blocos de pedra alternados nas bordas laterais</div>
          </div>
          <span className="switch">
            <input
              id="chkQuoins"
              type="checkbox"
              checked={b.hasQuoins}
              onChange={(e) => updateBuilding({ hasQuoins: e.target.checked })}
            />
            <span className="switch-track" />
          </span>
        </label>
      </div>

      {/* Composição Estrutural */}
      <div className="section-card">
        <div className="section-title">
          <span className="section-title-left">
            <span className="section-dot" />
            Composição Estrutural &amp; Térreo
          </span>
          <HelpButton
            docId="composicao-estrutural"
            isOpen={openHelp === 'composicao-estrutural'}
            onToggle={() => toggleHelp('composicao-estrutural')}
          />
        </div>
        {openHelp === 'composicao-estrutural' && (
          <HelpPopoverBody docId="composicao-estrutural" onClose={() => setOpenHelp(null)} />
        )}

        <label className="toggle-row">
          <div>
            <div className="field-label">Pavimento Ático</div>
            <div className="field-sub">Nível superior alinhado à prumada dos vãos</div>
          </div>
          <span className="switch">
            <input
              id="chkAttic"
              type="checkbox"
              checked={b.hasAttic}
              onChange={(e) => updateBuilding({ hasAttic: e.target.checked })}
            />
            <span className="switch-track" />
          </span>
        </label>

        <label className="toggle-row">
          <div>
            <div className="field-label">Embasamento no Térreo</div>
            <div className="field-sub">Rodapé de cantaria sob a zona de vitrine</div>
          </div>
          <span className="switch">
            <input
              id="chkPlinth"
              type="checkbox"
              checked={b.hasPlinth}
              onChange={(e) => updateBuilding({ hasPlinth: e.target.checked })}
            />
            <span className="switch-track" />
          </span>
        </label>

        <div className="field">
          <span className="field-label">Portas no Pavimento Térreo (até 1/3 cada)</span>
          <div id="grpGroundDoorCount" className="seg-group seg-2">
            <button
              type="button"
              className={`seg-btn ${b.groundDoorCount !== 2 ? 'active' : ''}`}
              onClick={() => setGroundDoorCount(1)}
            >
              1 Porta
            </button>
            <button
              type="button"
              className={`seg-btn ${b.groundDoorCount === 2 ? 'active' : ''}`}
              onClick={() => setGroundDoorCount(2)}
            >
              2 Portas + 1 Vitrine
            </button>
          </div>
        </div>

        <div className="field">
          <span className="field-label">
            {b.groundDoorCount === 2
              ? 'Arranjo das 2 Portas & Vitrine (1/3 + 1/3 + 1/3)'
              : 'Posição da Porta no Térreo'}
          </span>
          {b.groundDoorCount === 2 ? (
            <div id="grpDoorSide" className="seg-group seg-3">
              <button
                type="button"
                className={`seg-btn ${b.doorSide === 'left' ? 'active' : ''}`}
                onClick={() => updateBuilding({ doorSide: 'left' })}
              >
                ← 2 Esq
              </button>
              <button
                type="button"
                className={`seg-btn ${b.doorSide === 'split' ? 'active' : ''}`}
                onClick={() => updateBuilding({ doorSide: 'split' })}
              >
                Extremidades
              </button>
              <button
                type="button"
                className={`seg-btn ${b.doorSide === 'right' ? 'active' : ''}`}
                onClick={() => updateBuilding({ doorSide: 'right' })}
              >
                2 Dir →
              </button>
            </div>
          ) : (
            <div id="grpDoorSide" className="seg-group seg-2">
              <button
                type="button"
                className={`seg-btn ${b.doorSide === 'left' ? 'active' : ''}`}
                onClick={() => updateBuilding({ doorSide: 'left' })}
              >
                ← Esquerda
              </button>
              <button
                type="button"
                className={`seg-btn ${b.doorSide !== 'left' ? 'active' : ''}`}
                onClick={() => updateBuilding({ doorSide: 'right' })}
              >
                Direita →
              </button>
            </div>
          )}
        </div>

        <div className="field">
          <span className="field-label">Layout da Vitrine no Térreo</span>
          {b.groundDoorCount === 2 ? (
            <div className="field-sub" style={{ padding: '5px 8px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
              1 Vitrine (1/3 do térreo) ativa automaticamente com 2 Portas.
            </div>
          ) : (
            <div id="grpGroundShopMode" className="seg-group seg-2">
              <button
                type="button"
                className={`seg-btn ${b.groundShopMode === 'double' ? 'active' : ''}`}
                onClick={() => setGroundShopMode('double')}
              >
                2 Vitrines
              </button>
              <button
                type="button"
                className={`seg-btn ${b.groundShopMode === 'single' ? 'active' : ''}`}
                onClick={() => setGroundShopMode('single')}
              >
                1 Vitrine Ampla
              </button>
            </div>
          )}
        </div>

        <div className="field">
          <span className="field-label">Ajuste da Vitrine no Vão</span>
          <div id="grpShopFitMode" className="seg-group seg-2">
            <button
              type="button"
              className={`seg-btn ${b.shopFitMode === 'fill' ? 'active' : ''}`}
              onClick={() => updateBuilding({ shopFitMode: 'fill' })}
            >
              Preencher Vão
            </button>
            <button
              type="button"
              className={`seg-btn ${b.shopFitMode === 'proportional' ? 'active' : ''}`}
              onClick={() => updateBuilding({ shopFitMode: 'proportional' })}
            >
              Proporção do Módulo
            </button>
          </div>
        </div>
      </div>

      {/* Elementos Externos & Paisagismo (Jardim, Escada, Escada de Incêndio) */}
      <div className="section-card">
        <div className="section-title">
          <span className="section-title-left">
            <span className="section-dot" />
            Elementos Externos &amp; Paisagismo
          </span>
          <HelpButton
            docId="elementos-externos-fachada"
            isOpen={openHelp === 'elementos-externos-fachada'}
            onToggle={() => toggleHelp('elementos-externos-fachada')}
          />
        </div>
        {openHelp === 'elementos-externos-fachada' && (
          <HelpPopoverBody
            docId="elementos-externos-fachada"
            onClose={() => setOpenHelp(null)}
          />
        )}

        <label className="toggle-row">
          <div>
            <div className="field-label">Jardim no Rodapé</div>
            <div className="field-sub">Floreiras ou sebes com gradil sob a vitrine</div>
          </div>
          <span className="switch">
            <input
              id="chkFooterGarden"
              type="checkbox"
              checked={b.hasFooterGarden}
              onChange={(e) => updateBuilding({ hasFooterGarden: e.target.checked })}
            />
            <span className="switch-track" />
          </span>
        </label>

        {b.hasFooterGarden && (
          <div className="field">
            <span className="field-label">Estilo do Jardim</span>
            <div id="grpGardenStyle" className="seg-group seg-3">
              {(
                [
                  { val: 'iron_rail_hedges', label: 'Gradil + Sebes' },
                  { val: 'planter_box', label: 'Floreira Pedra' },
                  { val: 'flower_bed', label: 'Canteiro Floral' }
                ] as Array<{ val: GardenStyle; label: string }>
              ).map((opt) => (
                <button
                  key={opt.val}
                  type="button"
                  className={`seg-btn ${b.gardenStyle === opt.val ? 'active' : ''}`}
                  onClick={() => updateBuilding({ gardenStyle: opt.val })}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <label className="toggle-row">
          <div>
            <div className="field-label">Escada na Porta de Entrada</div>
            <div className="field-sub">Escadaria frontal (NY Stoop) na porta principal</div>
          </div>
          <span className="switch">
            <input
              id="chkEntranceStairs"
              type="checkbox"
              checked={b.hasEntranceStairs}
              onChange={(e) => updateBuilding({ hasEntranceStairs: e.target.checked })}
            />
            <span className="switch-track" />
          </span>
        </label>

        {b.hasEntranceStairs && (
          <div className="field">
            <span className="field-label">Estilo da Escada de Entrada</span>
            <div id="grpStairsStyle" className="seg-group seg-3">
              {(
                [
                  { val: 'stoop_classic', label: 'Stoop Pedra' },
                  { val: 'stoop_iron_rail', label: 'Corrimão Ferro' },
                  { val: 'wide_steps', label: 'Degraus Largos' }
                ] as Array<{ val: EntranceStairsStyle; label: string }>
              ).map((opt) => (
                <button
                  key={opt.val}
                  type="button"
                  className={`seg-btn ${b.entranceStairsStyle === opt.val ? 'active' : ''}`}
                  onClick={() => updateBuilding({ entranceStairsStyle: opt.val })}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <label className="toggle-row">
          <div>
            <div className="field-label">Escada de Incêndio na Fachada</div>
            <div className="field-sub">Varandas metálicas NY, lances em ziguezague e drop ladder</div>
          </div>
          <span className="switch">
            <input
              id="chkFireEscape"
              type="checkbox"
              checked={b.hasFireEscape}
              onChange={(e) => updateBuilding({ hasFireEscape: e.target.checked })}
            />
            <span className="switch-track" />
          </span>
        </label>

        {b.hasFireEscape && (
          <div className="field">
            <span className="field-label">Prumada da Escada de Incêndio</span>
            <div id="grpFireEscapePlacement" className="seg-group seg-3">
              {(
                [
                  { val: 'left', label: '← Esquerda' },
                  { val: 'center', label: 'Centro' },
                  { val: 'right', label: 'Direita →' }
                ] as Array<{ val: FireEscapePlacement; label: string }>
              ).map((opt) => (
                <button
                  key={opt.val}
                  type="button"
                  className={`seg-btn ${b.fireEscapePlacement === opt.val ? 'active' : ''}`}
                  onClick={() => updateBuilding({ fireEscapePlacement: opt.val })}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Paleta da Estrutura */}
      <div className="section-card">
        <div className="section-title">
          <span className="section-title-left">
            <span className="section-dot" />
            Paleta da Estrutura
          </span>
          <HelpButton
            docId="paleta-estrutura"
            isOpen={openHelp === 'paleta-estrutura'}
            onToggle={() => toggleHelp('paleta-estrutura')}
          />
        </div>
        {openHelp === 'paleta-estrutura' && (
          <HelpPopoverBody docId="paleta-estrutura" onClose={() => setOpenHelp(null)} />
        )}

        <div id="buildingPresetsGrid" className="preset-grid">
          {BUILDING_PALETTES.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`preset-btn ${b.paletteId === p.id ? 'active' : ''}`}
              onClick={() => applyBuildingPalette(p)}
            >
              <span className="swatches">
                <span className="swatch-dot" style={{ background: p.wall }} />
                <span className="swatch-dot" style={{ background: p.cornice }} />
                <span className="swatch-dot" style={{ background: p.stroke }} />
              </span>
              <span>{p.name}</span>
            </button>
          ))}
        </div>

        <div className="color-grid">
          {COLOR_FIELDS.map((cf) => {
            const val = b.colors[cf.key] || '#FAF5E8';
            return (
              <div key={cf.key} className="color-cell">
                <div className="color-cell-label">
                  {cf.label} <span className="color-hex">{val}</span>
                </div>
                <input
                  type="color"
                  value={val}
                  onChange={(e) => updateBuildingColor(cf.key, e.target.value)}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
