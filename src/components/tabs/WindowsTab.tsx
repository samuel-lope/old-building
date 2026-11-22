import { useState } from 'react';
import { useFacade } from '../../context/FacadeContext';
import { renderWindowModule } from '../../engine/windowRenderer';
import type {
  AspectRatioOption,
  BottomDetailType,
  DivisionMode,
  ReflectionStyle,
  TopDetailType
} from '../../types/facade';
import { HelpButton, HelpPopoverBody } from '../HelpPopover';
import { IsolatedModulePreview } from '../IsolatedModulePreview';

const ASPECT_RATIOS: Array<{ val: AspectRatioOption; label: string }> = [
  { val: 'free', label: 'Livre' },
  { val: '1:1', label: '1:1' },
  { val: '2:3', label: '2:3' },
  { val: '3:5', label: '3:5' },
  { val: '4:3', label: '4:3' },
  { val: '3:2', label: '3:2' },
  { val: '16:9', label: '16:9' }
];

export function WindowsTab() {
  const {
    state,
    editingModule: mod,
    selectEditingModule,
    updateEditingModule,
    createNewModule,
    duplicateCurrentModule,
    deleteCurrentModule
  } = useFacade();
  const pal = state.building.colors;

  const [openHelp, setOpenHelp] = useState<string | null>(null);
  const toggleHelp = (id: string) => setOpenHelp((cur) => (cur === id ? null : id));

  return (
    <div id="tab-windows" className="tab-pane">
      {/* Preview Isolado */}
      <div className="section-card" style={{ padding: 10 }}>
        <div className="section-title">
          <span className="section-title-left">
            <span className="section-dot" />
            Preview Isolado do Módulo
          </span>
          <div className="section-title-right">
            <span id="previewModId" className="mono-val">
              {mod.id}
            </span>
            <HelpButton
              docId="preview-biblioteca-janelas"
              isOpen={openHelp === 'preview-biblioteca-janelas'}
              onToggle={() => toggleHelp('preview-biblioteca-janelas')}
            />
          </div>
        </div>
        {openHelp === 'preview-biblioteca-janelas' && (
          <HelpPopoverBody
            docId="preview-biblioteca-janelas"
            onClose={() => setOpenHelp(null)}
          />
        )}
        <IsolatedModulePreview />
      </div>

      {/* Biblioteca de Módulos */}
      <div className="section-card">
        <div className="section-title">
          <span className="section-title-left">
            <span className="section-dot" />
            Biblioteca de Módulos
          </span>
          <div style={{ display: 'flex', gap: 4 }}>
            <button
              id="btnNewMod"
              className="btn btn-sm btn-primary"
              type="button"
              onClick={createNewModule}
            >
              + Novo
            </button>
            <button
              id="btnDupMod"
              className="btn btn-sm"
              type="button"
              title="Duplicar módulo atual"
              onClick={duplicateCurrentModule}
            >
              Duplicar
            </button>
            <button
              id="btnDelMod"
              className="btn btn-sm btn-danger"
              type="button"
              title="Excluir módulo atual"
              disabled={state.windowLibrary.length <= 1}
              onClick={deleteCurrentModule}
            >
              Excluir
            </button>
          </div>
        </div>

        <div id="windowLibraryList" className="library-list">
          {state.windowLibrary.map((m, idx) => {
            const thumb = renderWindowModule({ x: 3, y: 3, width: 20, height: 24 }, m, pal, `th${idx}`);
            const thumbSvg = `<defs>${thumb.defs}</defs>${thumb.markup}`;
            return (
              <div
                key={m.id}
                className={`library-item ${m.id === mod.id ? 'active' : ''}`}
                onClick={() => selectEditingModule(m.id)}
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
                    <span className="library-item-name">{m.name}</span>
                    <span className="library-item-meta">
                      {m.cols}×{m.rows} · {m.aspectRatio === 'free' ? 'Livre' : m.aspectRatio} ·{' '}
                      {m.topDetail !== 'none' || m.bottomDetail !== 'none' ? 'Ornamentada' : 'Flat'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Geometria, Base, Altura & Proporção */}
      <div className="section-card">
        <div className="section-title">
          <span className="section-title-left">
            <span className="section-dot" />
            Geometria, Base, Altura &amp; Proporção
          </span>
          <HelpButton
            docId="geometria-janela"
            isOpen={openHelp === 'geometria-janela'}
            onToggle={() => toggleHelp('geometria-janela')}
          />
        </div>
        {openHelp === 'geometria-janela' && (
          <HelpPopoverBody docId="geometria-janela" onClose={() => setOpenHelp(null)} />
        )}

        <div className="field">
          <label className="field-label" htmlFor="inpModName">
            Nome do Módulo
          </label>
          <input
            id="inpModName"
            className="text-input"
            type="text"
            placeholder="Ex: Janela NY 2x3 Clássica"
            value={mod.name}
            onChange={(e) => updateEditingModule({ name: e.target.value || 'Módulo sem nome' })}
          />
        </div>

        <div className="field">
          <span className="field-label">Proporção (Aspect Ratio)</span>
          <div id="grpAspectRatio" className="seg-wrap">
            {ASPECT_RATIOS.map((ar) => (
              <button
                key={ar.val}
                type="button"
                className={`seg-btn ${mod.aspectRatio === ar.val ? 'active' : ''}`}
                onClick={() => updateEditingModule({ aspectRatio: ar.val })}
              >
                {ar.label}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <div className="field-row">
            <label className="field-label" htmlFor="inpModWidthPct">
              Base / Largura no Slot
            </label>
            <span id="valModWidthPct" className="mono-val">
              {mod.widthPct}%
            </span>
          </div>
          <input
            id="inpModWidthPct"
            type="range"
            min={50}
            max={105}
            step={1}
            value={mod.widthPct}
            onChange={(e) => updateEditingModule({ widthPct: parseInt(e.target.value, 10) })}
          />
        </div>

        <div className="field">
          <div className="field-row">
            <label className="field-label" htmlFor="inpModHeightPct">
              Altura no Slot
            </label>
            <span id="valModHeightPct" className="mono-val">
              {mod.heightPct}%
            </span>
          </div>
          <input
            id="inpModHeightPct"
            type="range"
            min={45}
            max={105}
            step={1}
            value={mod.heightPct}
            onChange={(e) => updateEditingModule({ heightPct: parseInt(e.target.value, 10) })}
          />
        </div>

        <div className="field">
          <div className="field-row">
            <label className="field-label" htmlFor="inpFrameThick">
              Espessura da Moldura Externa
            </label>
            <span id="valFrameThick" className="mono-val">
              {Number(mod.frameThickness).toFixed(1)}u
            </span>
          </div>
          <input
            id="inpFrameThick"
            type="range"
            min={3}
            max={12}
            step={0.5}
            value={mod.frameThickness}
            onChange={(e) => updateEditingModule({ frameThickness: parseFloat(e.target.value) })}
          />
        </div>

        <div className="field">
          <div className="field-row">
            <label className="field-label" htmlFor="inpMullionThick">
              Espessura das Divisórias (Pinázios)
            </label>
            <span id="valMullionThick" className="mono-val">
              {Number(mod.mullionThickness).toFixed(1)}u
            </span>
          </div>
          <input
            id="inpMullionThick"
            type="range"
            min={1.5}
            max={8}
            step={0.5}
            value={mod.mullionThickness}
            onChange={(e) => updateEditingModule({ mullionThickness: parseFloat(e.target.value) })}
          />
        </div>
      </div>

      {/* Divisão entre Vidraças */}
      <div className="section-card">
        <div className="section-title">
          <span className="section-title-left">
            <span className="section-dot" />
            Divisão entre Vidraças
          </span>
          <HelpButton
            docId="divisao-vidracas-reflexos"
            isOpen={openHelp === 'divisao-vidracas-reflexos'}
            onToggle={() => toggleHelp('divisao-vidracas-reflexos')}
          />
        </div>
        {openHelp === 'divisao-vidracas-reflexos' && (
          <HelpPopoverBody
            docId="divisao-vidracas-reflexos"
            onClose={() => setOpenHelp(null)}
          />
        )}

        <div className="field">
          <span className="field-label">Colunas de Vidraças (1 a 6)</span>
          <div id="grpGlassCols" className="seg-group seg-6">
            {[1, 2, 3, 4, 5, 6].map((c) => (
              <button
                key={c}
                type="button"
                className={`seg-btn ${mod.cols === c ? 'active' : ''}`}
                onClick={() => updateEditingModule({ cols: c })}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <span className="field-label">Linhas de Vidraças</span>
          <div id="grpGlassRows" className="seg-group seg-5">
            {[1, 2, 3, 4, 5].map((r) => (
              <button
                key={r}
                type="button"
                className={`seg-btn ${mod.rows === r ? 'active' : ''}`}
                onClick={() => updateEditingModule({ rows: r })}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <span className="field-label">Modo de Divisão Vertical</span>
          <div id="grpDivMode" className="seg-group seg-2">
            <button
              type="button"
              className={`seg-btn ${mod.divisionMode === 'uniform' ? 'active' : ''}`}
              onClick={() => updateEditingModule({ divisionMode: 'uniform' as DivisionMode })}
            >
              Uniforme
            </button>
            <button
              type="button"
              className={`seg-btn ${mod.divisionMode === 'transom' ? 'active' : ''}`}
              onClick={() =>
                updateEditingModule({
                  divisionMode: 'transom' as DivisionMode,
                  rows: mod.rows < 2 ? 2 : mod.rows
                })
              }
            >
              Com Bandeira
            </button>
          </div>
        </div>

        {mod.divisionMode === 'transom' && mod.rows > 1 && (
          <div id="wrapTransomRatio" className="field">
            <div className="field-row">
              <label className="field-label" htmlFor="inpTransomRatio">
                Altura da Bandeira Superior
              </label>
              <span id="valTransomRatio" className="mono-val">
                {mod.transomRatio || 26}%
              </span>
            </div>
            <input
              id="inpTransomRatio"
              type="range"
              min={14}
              max={45}
              step={1}
              value={mod.transomRatio || 26}
              onChange={(e) =>
                updateEditingModule({ transomRatio: parseInt(e.target.value, 10) })
              }
            />
          </div>
        )}

        <div className="field">
          <label className="field-label" htmlFor="selReflection">
            Estilo de Reflexo no Vidro
          </label>
          <select
            id="selReflection"
            className="select-input"
            value={mod.reflectionStyle}
            onChange={(e) =>
              updateEditingModule({ reflectionStyle: e.target.value as ReflectionStyle })
            }
          >
            <option value="diagonal_classic">Diagonal Clássico (Referência NY)</option>
            <option value="double">Duplo Reflexo Paralelo</option>
            <option value="soft">Reflexo Suave de Canto</option>
            <option value="none">Sem Reflexo</option>
          </select>
        </div>
      </div>

      {/* Detalhes Superior & Inferior */}
      <div className="section-card">
        <div className="section-title">
          <span className="section-title-left">
            <span className="section-dot" />
            Detalhes Superior &amp; Inferior
          </span>
          <HelpButton
            docId="detalhes-arquitetonicos"
            isOpen={openHelp === 'detalhes-arquitetonicos'}
            onToggle={() => toggleHelp('detalhes-arquitetonicos')}
          />
        </div>
        {openHelp === 'detalhes-arquitetonicos' && (
          <HelpPopoverBody
            docId="detalhes-arquitetonicos"
            onClose={() => setOpenHelp(null)}
          />
        )}

        <div className="field">
          <label className="field-label" htmlFor="selTopDetail">
            Acabamento Superior (Verga / Cabeceira)
          </label>
          <select
            id="selTopDetail"
            className="select-input"
            value={mod.topDetail}
            onChange={(e) => updateEditingModule({ topDetail: e.target.value as TopDetailType })}
          >
            <option value="none">Nenhum (Esquadria Limpa)</option>
            <option value="lintel_flat">Verga Reta</option>
            <option value="lintel_cornice">Verga Saliente c/ Friso</option>
            <option value="pediment">Frontão / Cornija Clássica</option>
            <option value="arch">Arco Rebaixado c/ Pedra-Chave</option>
          </select>
        </div>

        <div className="field">
          <label className="field-label" htmlFor="selBottomDetail">
            Acabamento Inferior (Peitoril / Base)
          </label>
          <select
            id="selBottomDetail"
            className="select-input"
            value={mod.bottomDetail}
            onChange={(e) =>
              updateEditingModule({ bottomDetail: e.target.value as BottomDetailType })
            }
          >
            <option value="none">Nenhum (Esquadria Limpa)</option>
            <option value="sill_flat">Peitoril Reto</option>
            <option value="sill_cornice">Peitoril Saliente c/ Friso</option>
            <option value="sill_corbels">Peitoril Duplo (c/ Consolos)</option>
          </select>
        </div>

        <div className="field">
          <div className="field-row">
            <label className="field-label" htmlFor="inpDetailScale">
              Altura / Projeção dos Detalhes
            </label>
            <span id="valDetailScale" className="mono-val">
              {Number(mod.detailScale).toFixed(1)}×
            </span>
          </div>
          <input
            id="inpDetailScale"
            type="range"
            min={0.6}
            max={1.6}
            step={0.1}
            value={mod.detailScale}
            onChange={(e) => updateEditingModule({ detailScale: parseFloat(e.target.value) })}
          />
        </div>
      </div>

      {/* Cores do Módulo */}
      <div className="section-card">
        <div className="section-title">
          <span className="section-title-left">
            <span className="section-dot" />
            Cores do Módulo
          </span>
          <HelpButton
            docId="cores-modulo"
            isOpen={openHelp === 'cores-modulo'}
            onToggle={() => toggleHelp('cores-modulo')}
          />
        </div>
        {openHelp === 'cores-modulo' && (
          <HelpPopoverBody docId="cores-modulo" onClose={() => setOpenHelp(null)} />
        )}

        <div className="color-grid">
          <div className="color-cell">
            <div className="color-cell-label">
              Esquadria <span className="color-hex">{mod.frameColor}</span>
            </div>
            <input
              type="color"
              value={mod.frameColor}
              onChange={(e) => updateEditingModule({ frameColor: e.target.value.toUpperCase() })}
            />
          </div>
          <div className="color-cell">
            <div className="color-cell-label">
              Vidro Base <span className="color-hex">{mod.glassColor}</span>
            </div>
            <input
              type="color"
              value={mod.glassColor}
              onChange={(e) => updateEditingModule({ glassColor: e.target.value.toUpperCase() })}
            />
          </div>
          <div className="color-cell" style={{ gridColumn: 'span 2' }}>
            <div className="color-cell-label">
              Reflexo do Vidro <span className="color-hex">{mod.reflectionColor}</span>
            </div>
            <input
              type="color"
              value={mod.reflectionColor}
              onChange={(e) =>
                updateEditingModule({ reflectionColor: e.target.value.toUpperCase() })
              }
            />
          </div>
        </div>

        <div className="color-cell">
          <div className="color-cell-label">
            Detalhes (Verga / Peitoril)
            <label className="inline-check">
              <input
                type="checkbox"
                checked={mod.syncDetailColor}
                onChange={(e) => updateEditingModule({ syncDetailColor: e.target.checked })}
              />
              Sincronizar c/ Cornija
            </label>
          </div>
          <input
            type="color"
            value={mod.syncDetailColor ? pal.cornice : mod.detailColor}
            disabled={mod.syncDetailColor}
            onChange={(e) => updateEditingModule({ detailColor: e.target.value.toUpperCase() })}
          />
        </div>

        <div className="color-cell">
          <div className="color-cell-label">
            Contorno da Esquadria
            <label className="inline-check">
              <input
                type="checkbox"
                checked={mod.syncStroke}
                onChange={(e) => updateEditingModule({ syncStroke: e.target.checked })}
              />
              Sincronizar c/ Prédio
            </label>
          </div>
          <input
            type="color"
            value={mod.syncStroke ? pal.stroke : mod.strokeColor}
            disabled={mod.syncStroke}
            onChange={(e) => updateEditingModule({ strokeColor: e.target.value.toUpperCase() })}
          />
        </div>
      </div>
    </div>
  );
}
