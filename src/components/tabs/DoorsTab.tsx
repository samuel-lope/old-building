import { useState } from 'react';
import { useFacade } from '../../context/FacadeContext';
import { renderDoorModule } from '../../engine/doorRenderer';
import type {
  DoorHandleStyle,
  DoorLeafLayout,
  DoorPanelStyle,
  DoorThresholdType,
  ReflectionStyle,
  SidelightSide,
  TopDetailType
} from '../../types/facade';
import { HelpButton, HelpPopoverBody } from '../HelpPopover';
import { IsolatedDoorPreview } from '../IsolatedDoorPreview';

export function DoorsTab() {
  const {
    state,
    editingDoorModule: mod,
    selectEditingDoorModule,
    updateEditingDoorModule,
    createNewDoorModule,
    duplicateCurrentDoorModule,
    deleteCurrentDoorModule
  } = useFacade();
  const pal = state.building.colors;

  const [openHelp, setOpenHelp] = useState<string | null>(null);
  const toggleHelp = (id: string) => setOpenHelp((cur) => (cur === id ? null : id));

  return (
    <div id="tab-doors" className="tab-pane">
      {/* Preview Isolado */}
      <div className="section-card" style={{ padding: 10 }}>
        <div className="section-title">
          <span className="section-title-left">
            <span className="section-dot" />
            Preview Isolado da Porta
          </span>
          <div className="section-title-right">
            <span id="previewDoorModId" className="mono-val">
              {mod.id}
            </span>
            <HelpButton
              docId="preview-biblioteca-portas"
              isOpen={openHelp === 'preview-biblioteca-portas'}
              onToggle={() => toggleHelp('preview-biblioteca-portas')}
            />
          </div>
        </div>
        {openHelp === 'preview-biblioteca-portas' && (
          <HelpPopoverBody
            docId="preview-biblioteca-portas"
            onClose={() => setOpenHelp(null)}
          />
        )}
        <IsolatedDoorPreview />
      </div>

      {/* Biblioteca de Portas */}
      <div className="section-card">
        <div className="section-title">
          <span className="section-title-left">
            <span className="section-dot" />
            Biblioteca de Portas
          </span>
          <div style={{ display: 'flex', gap: 4 }}>
            <button
              id="btnNewDoorMod"
              className="btn btn-sm btn-primary"
              type="button"
              onClick={createNewDoorModule}
            >
              + Novo
            </button>
            <button
              id="btnDupDoorMod"
              className="btn btn-sm"
              type="button"
              title="Duplicar módulo de porta atual"
              onClick={duplicateCurrentDoorModule}
            >
              Duplicar
            </button>
            <button
              id="btnDelDoorMod"
              className="btn btn-sm btn-danger"
              type="button"
              title="Excluir módulo de porta atual"
              disabled={state.doorLibrary.length <= 1}
              onClick={deleteCurrentDoorModule}
            >
              Excluir
            </button>
          </div>
        </div>

        <div id="doorLibraryList" className="library-list">
          {state.doorLibrary.map((d, idx) => {
            const thumb = renderDoorModule({ x: 4, y: 2, width: 18, height: 26 }, d, pal, `dth${idx}`);
            const thumbSvg = `<defs>${thumb.defs}</defs>${thumb.markup}`;
            return (
              <div
                key={d.id}
                className={`library-item ${d.id === mod.id ? 'active' : ''}`}
                onClick={() => selectEditingDoorModule(d.id)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0 }}>
                  <div className="library-thumb">
                    <svg
                      viewBox="0 0 26 30"
                      width={24}
                      height={28}
                      dangerouslySetInnerHTML={{ __html: thumbSvg }}
                    />
                  </div>
                  <div className="library-item-info">
                    <span className="library-item-name">{d.name}</span>
                    <span className="library-item-meta">
                      {d.leafLayout === 'single'
                        ? '1 Folha'
                        : d.leafLayout === 'double'
                          ? '2 Folhas'
                          : 'Sidelight'}{' '}
                      · {d.hasTransom ? 'c/ Bandeira' : 'Sem Bandeira'} ·{' '}
                      {d.panelStyle === 'solid_panels'
                        ? 'Almofadada'
                        : d.panelStyle === 'half_glass'
                          ? 'Meio-Vidro'
                          : 'Vidro Total'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Folhas, Bandeira & Geometria no Vão */}
      <div className="section-card">
        <div className="section-title">
          <span className="section-title-left">
            <span className="section-dot" />
            Folhas, Bandeira &amp; Geometria
          </span>
          <HelpButton
            docId="folhas-bandeira-porta"
            isOpen={openHelp === 'folhas-bandeira-porta'}
            onToggle={() => toggleHelp('folhas-bandeira-porta')}
          />
        </div>
        {openHelp === 'folhas-bandeira-porta' && (
          <HelpPopoverBody
            docId="folhas-bandeira-porta"
            onClose={() => setOpenHelp(null)}
          />
        )}

        <div className="field">
          <label className="field-label" htmlFor="inpDoorModName">
            Nome do Módulo de Porta
          </label>
          <input
            id="inpDoorModName"
            className="text-input"
            type="text"
            value={mod.name}
            onChange={(e) =>
              updateEditingDoorModule({ name: e.target.value || 'Porta sem nome' })
            }
          />
        </div>

        <div className="field">
          <span className="field-label">Configuração de Folhas</span>
          <div id="grpDoorLeafLayout" className="seg-group seg-3">
            {(
              [
                { val: 'single', label: 'Folha Única' },
                { val: 'double', label: 'Dupla' },
                { val: 'sidelight', label: 'Sidelight' }
              ] as Array<{ val: DoorLeafLayout; label: string }>
            ).map((opt) => (
              <button
                key={opt.val}
                type="button"
                className={`seg-btn ${mod.leafLayout === opt.val ? 'active' : ''}`}
                onClick={() => updateEditingDoorModule({ leafLayout: opt.val })}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {mod.leafLayout === 'sidelight' && (
          <div className="field">
            <span className="field-label">Lado da Lateral Fixa (Sidelight)</span>
            <div className="seg-group seg-3">
              {(
                [
                  { val: 'left', label: '← Esquerda' },
                  { val: 'both', label: 'Ambas' },
                  { val: 'right', label: 'Direita →' }
                ] as Array<{ val: SidelightSide; label: string }>
              ).map((side) => (
                <button
                  key={side.val}
                  type="button"
                  className={`seg-btn ${mod.sidelightSide === side.val ? 'active' : ''}`}
                  onClick={() => updateEditingDoorModule({ sidelightSide: side.val })}
                >
                  {side.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="field">
          <div className="field-row">
            <label className="field-label" htmlFor="inpDoorWidthPct">
              Largura no Vão (até 1/3 do Térreo)
            </label>
            <span className="mono-val">{Math.min(100, mod.widthPct)}%</span>
          </div>
          <input
            id="inpDoorWidthPct"
            type="range"
            min={55}
            max={100}
            step={1}
            value={Math.min(100, mod.widthPct)}
            onChange={(e) => updateEditingDoorModule({ widthPct: parseInt(e.target.value, 10) })}
          />
        </div>

        <div className="field">
          <div className="field-row">
            <label className="field-label" htmlFor="inpDoorHeightPct">
              Altura no Vão (até a Cornija)
            </label>
            <span className="mono-val">{Math.min(100, mod.heightPct)}%</span>
          </div>
          <input
            id="inpDoorHeightPct"
            type="range"
            min={55}
            max={100}
            step={1}
            value={Math.min(100, mod.heightPct)}
            onChange={(e) => updateEditingDoorModule({ heightPct: parseInt(e.target.value, 10) })}
          />
        </div>

        <div className="field">
          <div className="field-row">
            <label className="field-label" htmlFor="inpDoorFrameThick">
              Espessura do Batente Externo
            </label>
            <span className="mono-val">{Number(mod.frameThickness).toFixed(1)}u</span>
          </div>
          <input
            id="inpDoorFrameThick"
            type="range"
            min={3}
            max={9}
            step={0.5}
            value={mod.frameThickness}
            onChange={(e) =>
              updateEditingDoorModule({ frameThickness: parseFloat(e.target.value) })
            }
          />
        </div>

        <label className="toggle-row">
          <div>
            <div className="field-label">Bandeira Superior (Transom)</div>
            <div className="field-sub">Visor superior envidraçado + numeração</div>
          </div>
          <span className="switch">
            <input
              id="chkDoorTransom"
              type="checkbox"
              checked={mod.hasTransom}
              onChange={(e) => updateEditingDoorModule({ hasTransom: e.target.checked })}
            />
            <span className="switch-track" />
          </span>
        </label>

        {mod.hasTransom && (
          <>
            <div className="field">
              <div className="field-row">
                <label className="field-label" htmlFor="inpDoorTransomRatio">
                  Altura da Bandeira
                </label>
                <span className="mono-val">{mod.transomRatio}%</span>
              </div>
              <input
                id="inpDoorTransomRatio"
                type="range"
                min={16}
                max={38}
                step={1}
                value={mod.transomRatio}
                onChange={(e) =>
                  updateEditingDoorModule({ transomRatio: parseInt(e.target.value, 10) })
                }
              />
            </div>

            <div className="field">
              <span className="field-label">Divisões da Bandeira (1 a 4)</span>
              <div className="seg-group seg-4">
                {[1, 2, 3, 4].map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`seg-btn ${mod.transomCols === c ? 'active' : ''}`}
                    onClick={() => updateEditingDoorModule({ transomCols: c })}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="field">
              <label className="field-label" htmlFor="inpDoorNumber">
                Número do Edifício na Bandeira (Opcional)
              </label>
              <input
                id="inpDoorNumber"
                className="text-input"
                type="text"
                maxLength={6}
                placeholder="Ex: 241"
                value={mod.transomNumber}
                onChange={(e) => updateEditingDoorModule({ transomNumber: e.target.value })}
              />
            </div>
          </>
        )}
      </div>

      {/* Painéis Internos & Ferragens */}
      <div className="section-card">
        <div className="section-title">
          <span className="section-title-left">
            <span className="section-dot" />
            Composição da Folha &amp; Ferragens
          </span>
          <HelpButton
            docId="paineis-ferragens-porta"
            isOpen={openHelp === 'paineis-ferragens-porta'}
            onToggle={() => toggleHelp('paineis-ferragens-porta')}
          />
        </div>
        {openHelp === 'paineis-ferragens-porta' && (
          <HelpPopoverBody
            docId="paineis-ferragens-porta"
            onClose={() => setOpenHelp(null)}
          />
        )}

        <div className="field">
          <span className="field-label">Estilo da Folha</span>
          <div id="grpDoorPanelStyle" className="seg-group seg-3">
            {(
              [
                { val: 'solid_panels', label: 'Almofadada' },
                { val: 'half_glass', label: 'Meio-Vidro' },
                { val: 'full_glass', label: 'Vidro Total' }
              ] as Array<{ val: DoorPanelStyle; label: string }>
            ).map((opt) => (
              <button
                key={opt.val}
                type="button"
                className={`seg-btn ${mod.panelStyle === opt.val ? 'active' : ''}`}
                onClick={() => updateEditingDoorModule({ panelStyle: opt.val })}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {mod.panelStyle === 'solid_panels' && (
          <div className="field">
            <span className="field-label">Quantidade de Almofadas</span>
            <div className="seg-group seg-2">
              {([2, 4] as const).map((cnt) => (
                <button
                  key={cnt}
                  type="button"
                  className={`seg-btn ${mod.panelCount === cnt ? 'active' : ''}`}
                  onClick={() => updateEditingDoorModule({ panelCount: cnt })}
                >
                  {cnt} Painéis
                </button>
              ))}
            </div>
          </div>
        )}

        {mod.panelStyle === 'half_glass' && (
          <div className="field">
            <div className="field-row">
              <label className="field-label" htmlFor="inpDoorGlassRatio">
                Altura do Visor de Vidro
              </label>
              <span className="mono-val">{mod.glassRatio}%</span>
            </div>
            <input
              id="inpDoorGlassRatio"
              type="range"
              min={35}
              max={70}
              step={1}
              value={mod.glassRatio}
              onChange={(e) =>
                updateEditingDoorModule({ glassRatio: parseInt(e.target.value, 10) })
              }
            />
          </div>
        )}

        {mod.panelStyle !== 'solid_panels' && (
          <>
            <div className="field">
              <span className="field-label">Colunas no Visor de Vidro (1 a 3)</span>
              <div className="seg-group seg-3">
                {[1, 2, 3].map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`seg-btn ${mod.glassCols === c ? 'active' : ''}`}
                    onClick={() => updateEditingDoorModule({ glassCols: c })}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="field">
              <span className="field-label">Linhas no Visor de Vidro (1 a 3)</span>
              <div className="seg-group seg-3">
                {[1, 2, 3].map((r) => (
                  <button
                    key={r}
                    type="button"
                    className={`seg-btn ${mod.glassRows === r ? 'active' : ''}`}
                    onClick={() => updateEditingDoorModule({ glassRows: r })}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        <div className="field">
          <label className="field-label" htmlFor="selDoorReflection">
            Estilo de Reflexo no Vidro
          </label>
          <select
            id="selDoorReflection"
            className="select-input"
            value={mod.reflectionStyle}
            onChange={(e) =>
              updateEditingDoorModule({ reflectionStyle: e.target.value as ReflectionStyle })
            }
          >
            <option value="diagonal_classic">Diagonal Clássico (Referência NY)</option>
            <option value="double">Duplo Reflexo Paralelo</option>
            <option value="soft">Reflexo Suave de Canto</option>
            <option value="none">Sem Reflexo</option>
          </select>
        </div>

        <div className="field">
          <span className="field-label">Maçaneta / Puxador</span>
          <div className="seg-group seg-3">
            {(
              [
                { val: 'knob_classic', label: 'Clássica' },
                { val: 'handle_vertical', label: 'Puxador' },
                { val: 'none', label: 'Nenhum' }
              ] as Array<{ val: DoorHandleStyle; label: string }>
            ).map((opt) => (
              <button
                key={opt.val}
                type="button"
                className={`seg-btn ${mod.handleStyle === opt.val ? 'active' : ''}`}
                onClick={() => updateEditingDoorModule({ handleStyle: opt.val })}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <label className="toggle-row">
          <div>
            <div className="field-label">Chapa de Proteção Inferior (Kickplate)</div>
            <div className="field-sub">Barra metálica no rodapé da folha</div>
          </div>
          <span className="switch">
            <input
              type="checkbox"
              checked={mod.hasKickplate}
              onChange={(e) => updateEditingDoorModule({ hasKickplate: e.target.checked })}
            />
            <span className="switch-track" />
          </span>
        </label>
      </div>

      {/* Portal, Pilastras & Soleira */}
      <div className="section-card">
        <div className="section-title">
          <span className="section-title-left">
            <span className="section-dot" />
            Portal, Pilastras &amp; Soleira
          </span>
          <HelpButton
            docId="portal-soleira-cores"
            isOpen={openHelp === 'portal-soleira-cores'}
            onToggle={() => toggleHelp('portal-soleira-cores')}
          />
        </div>
        {openHelp === 'portal-soleira-cores' && (
          <HelpPopoverBody
            docId="portal-soleira-cores"
            onClose={() => setOpenHelp(null)}
          />
        )}

        <div className="field">
          <label className="field-label" htmlFor="selDoorTopDetail">
            Cabeceira / Verga Superior
          </label>
          <select
            id="selDoorTopDetail"
            className="select-input"
            value={mod.topDetail}
            onChange={(e) =>
              updateEditingDoorModule({ topDetail: e.target.value as TopDetailType })
            }
          >
            <option value="none">Nenhuma (Batente Limpo)</option>
            <option value="lintel_flat">Verga Reta</option>
            <option value="lintel_cornice">Cornija Saliente c/ Friso</option>
            <option value="pediment">Frontão Clássico</option>
            <option value="arch">Arco Rebaixado c/ Pedra-Chave</option>
          </select>
        </div>

        <label className="toggle-row">
          <div>
            <div className="field-label">Pilastras Laterais Clássicas</div>
            <div className="field-sub">Colunas laterais em cantaria flanqueando a porta</div>
          </div>
          <span className="switch">
            <input
              type="checkbox"
              checked={mod.hasPilasters}
              onChange={(e) => updateEditingDoorModule({ hasPilasters: e.target.checked })}
            />
            <span className="switch-track" />
          </span>
        </label>

        <div className="field">
          <span className="field-label">Base / Soleira</span>
          <div className="seg-group seg-3">
            {(
              [
                { val: 'none', label: 'Nenhuma' },
                { val: 'sill_stone', label: 'Soleira' },
                { val: 'double_step', label: '2 Degraus NY' }
              ] as Array<{ val: DoorThresholdType; label: string }>
            ).map((opt) => (
              <button
                key={opt.val}
                type="button"
                className={`seg-btn ${mod.thresholdType === opt.val ? 'active' : ''}`}
                onClick={() => updateEditingDoorModule({ thresholdType: opt.val })}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <div className="field-row">
            <label className="field-label" htmlFor="inpDoorDetailScale">
              Projeção dos Ornamentos do Portal
            </label>
            <span className="mono-val">{Number(mod.detailScale).toFixed(1)}×</span>
          </div>
          <input
            id="inpDoorDetailScale"
            type="range"
            min={0.6}
            max={1.5}
            step={0.1}
            value={mod.detailScale}
            onChange={(e) => updateEditingDoorModule({ detailScale: parseFloat(e.target.value) })}
          />
        </div>
      </div>

      {/* Cores da Porta */}
      <div className="section-card">
        <div className="section-title">
          <span className="section-title-left">
            <span className="section-dot" />
            Cores da Porta &amp; Sincronização
          </span>
        </div>

        <div className="color-cell">
          <div className="color-cell-label">
            Folha da Porta
            <label className="inline-check">
              <input
                type="checkbox"
                checked={mod.syncLeafColor}
                onChange={(e) => updateEditingDoorModule({ syncLeafColor: e.target.checked })}
              />
              Sincronizar c/ Porta do Prédio
            </label>
          </div>
          <input
            type="color"
            value={mod.syncLeafColor ? pal.door : mod.leafColor}
            disabled={mod.syncLeafColor}
            onChange={(e) => updateEditingDoorModule({ leafColor: e.target.value.toUpperCase() })}
          />
        </div>

        <div className="color-grid">
          <div className="color-cell">
            <div className="color-cell-label">
              Batente <span className="color-hex">{mod.frameColor}</span>
            </div>
            <input
              type="color"
              value={mod.frameColor}
              onChange={(e) =>
                updateEditingDoorModule({ frameColor: e.target.value.toUpperCase() })
              }
            />
          </div>
          <div className="color-cell">
            <div className="color-cell-label">
              Ferragens <span className="color-hex">{mod.hardwareColor}</span>
            </div>
            <input
              type="color"
              value={mod.hardwareColor}
              onChange={(e) =>
                updateEditingDoorModule({ hardwareColor: e.target.value.toUpperCase() })
              }
            />
          </div>
          <div className="color-cell">
            <div className="color-cell-label">
              Vidro <span className="color-hex">{mod.glassColor}</span>
            </div>
            <input
              type="color"
              value={mod.glassColor}
              onChange={(e) =>
                updateEditingDoorModule({ glassColor: e.target.value.toUpperCase() })
              }
            />
          </div>
          <div className="color-cell">
            <div className="color-cell-label">
              Reflexo <span className="color-hex">{mod.reflectionColor}</span>
            </div>
            <input
              type="color"
              value={mod.reflectionColor}
              onChange={(e) =>
                updateEditingDoorModule({ reflectionColor: e.target.value.toUpperCase() })
              }
            />
          </div>
        </div>

        <div className="color-cell">
          <div className="color-cell-label">
            Portal (Verga / Pilastras / Degraus)
            <label className="inline-check">
              <input
                type="checkbox"
                checked={mod.syncDetailColor}
                onChange={(e) => updateEditingDoorModule({ syncDetailColor: e.target.checked })}
              />
              Sincronizar c/ Cornija
            </label>
          </div>
          <input
            type="color"
            value={mod.syncDetailColor ? pal.cornice : mod.detailColor}
            disabled={mod.syncDetailColor}
            onChange={(e) =>
              updateEditingDoorModule({ detailColor: e.target.value.toUpperCase() })
            }
          />
        </div>

        <div className="color-cell">
          <div className="color-cell-label">
            Contorno da Porta
            <label className="inline-check">
              <input
                type="checkbox"
                checked={mod.syncStroke}
                onChange={(e) => updateEditingDoorModule({ syncStroke: e.target.checked })}
              />
              Sincronizar c/ Prédio
            </label>
          </div>
          <input
            type="color"
            value={mod.syncStroke ? pal.stroke : mod.strokeColor}
            disabled={mod.syncStroke}
            onChange={(e) =>
              updateEditingDoorModule({ strokeColor: e.target.value.toUpperCase() })
            }
          />
        </div>
      </div>
    </div>
  );
}
