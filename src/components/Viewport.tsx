import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFacade } from '../context/FacadeContext';
import {
  renderFacadeSVG,
  resolveDoorModuleById,
  resolveModuleById
} from '../engine/facadeRenderer';
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
  const {
    state,
    layout,
    currentZoom,
    setZoom,
    zoomIn,
    zoomOut,
    zoomFit,
    selectSlot,
    setActiveTab,
    mobileSheetSnap,
    setMobileSheetSnap
  } = useFacade();
  const [tooltip, setTooltip] = useState<TooltipState>(EMPTY_TOOLTIP);

  const canvasScrollRef = useRef<HTMLDivElement | null>(null);
  const pinchStateRef = useRef<{ dist: number; zoom: number } | null>(null);
  const didInitialMobileFitRef = useRef(false);

  const svgMarkup = useMemo(
    () => renderFacadeSVG(layout, state, { cleanExport: false }),
    [layout, state]
  );

  const handleFitZoom = useCallback(() => {
    const el = canvasScrollRef.current;
    if (el && typeof window !== 'undefined' && window.innerWidth <= 920) {
      const availW = Math.max(180, el.clientWidth - 20);
      const availH = Math.max(160, el.clientHeight - 56);
      const effectiveW = Math.min(layout.viewBox.width, availW);
      const effectiveH =
        layout.viewBox.height * (effectiveW / Math.max(1, layout.viewBox.width));
      const nextFit = Math.max(0.4, Math.min(1.0, availH / Math.max(1, effectiveH)));
      setZoom(nextFit);
      return;
    }
    zoomFit();
  }, [layout.viewBox.height, layout.viewBox.width, setZoom, zoomFit]);

  useEffect(() => {
    if (didInitialMobileFitRef.current) return;
    if (typeof window === 'undefined' || window.innerWidth > 920) return;
    didInitialMobileFitRef.current = true;
    const raf = window.requestAnimationFrame(() => {
      handleFitZoom();
    });
    return () => window.cancelAnimationFrame(raf);
  }, [handleFitZoom]);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      pinchStateRef.current = {
        dist: Math.max(10, Math.hypot(dx, dy)),
        zoom: currentZoom
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2 && pinchStateRef.current) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.max(10, Math.hypot(dx, dy));
      const nextZoom = pinchStateRef.current.zoom * (dist / pinchStateRef.current.dist);
      setZoom(nextZoom);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length < 2) {
      pinchStateRef.current = null;
    }
  };

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

  const selectedSlot = layout.slots.find((s) => s.id === state.ui.selectedSlotId) || null;
  const selectedSlotModName = selectedSlot
    ? selectedSlot.kind === 'door'
      ? resolveDoorModuleById(
          state.doorLibrary,
          state.slotOverrides[selectedSlot.id] || state.slotAssignments.door
        ).name
      : resolveModuleById(
          state.windowLibrary,
          state.slotOverrides[selectedSlot.id] ||
            (selectedSlot.zone !== 'door' ? state.slotAssignments[selectedSlot.zone] : '')
        ).name
    : '';
  const selectedSlotOverride = selectedSlot ? Boolean(state.slotOverrides[selectedSlot.id]) : false;

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
            title="Ajustar Zoom à Tela"
            onClick={handleFitZoom}
          >
            FIT
          </button>
          <button
            id="btnMobileToggleSheet"
            className="btn btn-sm btn-mobile-only"
            type="button"
            onClick={() =>
              setMobileSheetSnap(mobileSheetSnap === 'collapsed' ? 'half' : 'collapsed')
            }
          >
            {mobileSheetSnap === 'collapsed' ? 'Controles ▲' : 'Tela Cheia ▼'}
          </button>
        </div>

        <div
          id="canvasScroll"
          ref={canvasScrollRef}
          className="canvas-scroll"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            id="svgStage"
            style={{ transform: `scale(${currentZoom})` }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
            dangerouslySetInnerHTML={{ __html: svgMarkup }}
          />
        </div>

        {selectedSlot && (
          <div id="touchSlotHud" className="touch-slot-hud">
            <div className="touch-slot-info">
              <span className="mono-val">{selectedSlot.id}</span>
              <span className="touch-slot-mod">
                {selectedSlotModName}{' '}
                <small style={{ color: selectedSlotOverride ? 'var(--accent)' : 'var(--text-muted)' }}>
                  ({selectedSlotOverride ? '★ Custom' : 'Zona'})
                </small>
              </span>
            </div>
            <div className="touch-slot-actions">
              <button
                id="btnTouchEditSlot"
                type="button"
                className="btn btn-primary btn-touch-sm"
                onClick={() => {
                  setActiveTab('interpolation');
                  setMobileSheetSnap('half');
                }}
              >
                Trocar Módulo
              </button>
              <button
                id="btnTouchClearSlot"
                type="button"
                className="btn btn-touch-icon"
                aria-label="Desmarcar slot"
                onClick={() => selectSlot(null)}
              >
                ✕
              </button>
            </div>
          </div>
        )}

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
