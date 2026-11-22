import { useMemo } from 'react';
import { useFacade } from '../context/FacadeContext';
import { renderDoorModule } from '../engine/doorRenderer';

const LAYOUT_LABELS: Record<string, string> = {
  single: 'FOLHA ÚNICA',
  double: 'FOLHA DUPLA',
  sidelight: 'C/ LATERAL FIXA'
};

const STYLE_LABELS: Record<string, string> = {
  solid_panels: 'ALMOFADADA',
  half_glass: 'MEIO-VIDRO',
  full_glass: 'VIDRO INTEGRAL'
};

export function IsolatedDoorPreview() {
  const { state, editingDoorModule } = useFacade();
  const pal = state.building.colors;

  const { svgMarkup, layoutLabel, styleLabel } = useMemo(() => {
    const slotRect = { x: 42, y: 20, width: 96, height: 134 };

    const res = renderDoorModule(slotRect, editingDoorModule, pal, 'doorprev', {
      elementStrokeWidth: state.building.elementStrokeWidth
    });
    const corniceY = slotRect.y;
    const floorY = slotRect.y + slotRect.height;

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180" width="180" height="180">
        <defs>${res.defs}</defs>
        <line x1="16" y1="${corniceY}" x2="164" y2="${corniceY}" stroke="${pal.cornice}" stroke-opacity="0.55" stroke-width="2" stroke-dasharray="4 3" />
        <line x1="16" y1="${floorY}" x2="164" y2="${floorY}" stroke="#4A5162" stroke-width="1.2" stroke-dasharray="3 3" />
        <rect x="${slotRect.x}" y="${slotRect.y}" width="${slotRect.width}" height="${slotRect.height}" fill="${pal.wall}" fill-opacity="0.22" stroke="#F3A847" stroke-opacity="0.45" stroke-width="1" stroke-dasharray="4 3" />
        ${res.markup}
      </svg>
    `;

    return {
      svgMarkup: svg,
      layoutLabel: `${LAYOUT_LABELS[editingDoorModule.leafLayout] || 'ÚNICA'} · ${Math.min(100, editingDoorModule.widthPct)}%×${Math.min(100, editingDoorModule.heightPct)}%`,
      styleLabel: `${STYLE_LABELS[editingDoorModule.panelStyle] || 'PORTA'}${
        editingDoorModule.hasTransom ? ' + BANDEIRA' : ''
      }`
    };
  }, [editingDoorModule, pal, state.building.elementStrokeWidth]);

  return (
    <div className="module-preview-box" style={{ height: 196 }}>
      <span id="previewDoorLayoutBadge" className="preview-meta-tag">
        {layoutLabel}
      </span>
      <div id="isolatedDoorPreviewStage" dangerouslySetInnerHTML={{ __html: svgMarkup }} />
      <span id="previewDoorStyleBadge" className="preview-dim-tag">
        {styleLabel}
      </span>
    </div>
  );
}
