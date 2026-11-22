import { useMemo, useState } from 'react';
import { useFacade } from '../context/FacadeContext';
import { renderFacadeSVG } from '../engine/facadeRenderer';
import { StatusBar } from './StatusBar';

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  slotId: string;
  slotDims: string;
  modName: string;
  slotLabel: string;
  isOverride: boolean;
}

const EMPTY_TOOLTIP: TooltipState = {
  visible: false,
  x: 0,
  y: 0,
  slotId: '',
  slotDims: '',
  modName: '',
  slotLabel: '',
  isOverride: false
};

export function Viewport() {
  const { state, layout, currentZoom, zoomIn, zoomOut, zoomFit, selectSlot } = useFacade();
  const [tooltip, setTooltip] = useState<TooltipState>(EMPTY_TOOLTIP);

  const svgMarkup = useMemo(
    () => renderFacadeSVG(layout, state, { cleanExport: false }),
    [layout, state]
  );

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as Element | null;
    const hit = target?.closest('.slot-hitbox') as HTMLElement | null;
    if (!hit) {
      if (tooltip.visible) setTooltip(EMPTY_TOOLTIP);
      return;
    }

    setTooltip({
      visible: true,
      x: e.clientX + 14,
      y: e.clientY + 14,
      slotId: hit.dataset.slotId || '',
      slotDims: hit.dataset.slotDims || '',
      modName: hit.dataset.modName || '',
      slotLabel: hit.dataset.slotLabel || hit.dataset.slotZone || '',
      isOverride: hit.dataset.override === '1'
    });
  };

  const handleMouseLeave = () => {
    if (tooltip.visible) setTooltip(EMPTY_TOOLTIP);
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as Element | null;
    const hit = target?.closest('.slot-hitbox') as HTMLElement | null;
    if (!hit?.dataset.slotId) return;
    selectSlot(hit.dataset.slotId, true);
  };

  return (
    <>
      <main className="viewport-wrap">
        <div className="viewport-toolbar">
          <button
            id="btnZoomOut"
            className="btn btn-icon"
            type="button"
            title="Diminuir Zoom"
            onClick={zoomOut}
          >
            −
          </button>
          <span id="zoomLabel" className="zoom-readout">
            {Math.round(currentZoom * 100)}%
          </span>
          <button
            id="btnZoomIn"
            className="btn btn-icon"
            type="button"
            title="Aumentar Zoom"
            onClick={zoomIn}
          >
            +
          </button>
          <button
            id="btnZoomFit"
            className="btn btn-sm"
            type="button"
            title="Ajustar Zoom"
            onClick={zoomFit}
          >
            FIT
          </button>
        </div>

        <div id="canvasScroll" className="canvas-scroll">
          <div
            id="svgStage"
            style={{ transform: `scale(${currentZoom})` }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
            dangerouslySetInnerHTML={{ __html: svgMarkup }}
          />
        </div>

        <StatusBar />
      </main>

      <div
        id="slotTooltip"
        className={`slot-tooltip ${tooltip.visible ? 'visible' : ''}`}
        style={{ left: tooltip.x, top: tooltip.y }}
      >
        {tooltip.visible && (
          <>
            <div className="tt-id">
              {tooltip.slotId}{' '}
              <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>
                ({tooltip.slotDims})
              </span>
            </div>
            <div>{tooltip.modName}</div>
            <div className="tt-sub">
              {tooltip.slotLabel} ·{' '}
              {tooltip.isOverride ? '★ Sobrescrita individual' : 'Herdado da zona'}
            </div>
          </>
        )}
      </div>
    </>
  );
}
