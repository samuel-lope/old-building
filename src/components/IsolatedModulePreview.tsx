import { useMemo } from 'react';
import { useFacade } from '../context/FacadeContext';
import { parseAspectRatio } from '../engine/colorUtils';
import { renderWindowModule } from '../engine/windowRenderer';

export function IsolatedModulePreview() {
  const { state, editingModule } = useFacade();
  const pal = state.building.colors;

  const { svgMarkup, ratioLabel, dimLabel } = useMemo(() => {
    const ratio = parseAspectRatio(editingModule.aspectRatio);
    const isWide = Boolean((ratio && ratio > 1.15) || editingModule.cols >= 4);
    const slotRect = isWide
      ? { x: 22, y: 38, width: 136, height: 86 }
      : { x: 46, y: 28, width: 88, height: 106 };

    const res = renderWindowModule(slotRect, editingModule, pal, 'prev', {
      elementStrokeWidth: state.building.elementStrokeWidth
    });
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 162" width="180" height="162">
        <defs>${res.defs}</defs>
        <rect x="${slotRect.x}" y="${slotRect.y}" width="${slotRect.width}" height="${slotRect.height}" fill="${pal.wall}" fill-opacity="0.22" stroke="#F3A847" stroke-opacity="0.45" stroke-width="1" stroke-dasharray="4 3" />
        ${res.markup}
      </svg>
    `;

    return {
      svgMarkup: svg,
      ratioLabel: `PROPORÇÃO: ${editingModule.aspectRatio === 'free' ? 'LIVRE' : editingModule.aspectRatio}`,
      dimLabel: `${editingModule.cols}×${editingModule.rows} VIDRAÇAS · ${editingModule.widthPct}%×${editingModule.heightPct}%`
    };
  }, [editingModule, pal]);

  return (
    <div className="module-preview-box">
      <span id="previewRatioBadge" className="preview-meta-tag">
        {ratioLabel}
      </span>
      <div id="isolatedPreviewStage" dangerouslySetInnerHTML={{ __html: svgMarkup }} />
      <span id="previewDimBadge" className="preview-dim-tag">
        {dimLabel}
      </span>
    </div>
  );
}
