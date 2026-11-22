import type { BuildingColors, Rect, WindowModule } from '../types/facade';
import { darkenHex, escapeXml, parseAspectRatio, r2 } from './colorUtils';
import { renderGlassPane, renderTopOrnament } from './svgPrimitives';

export interface RenderWindowOptions {
  fillSlot?: boolean;
  elementStrokeWidth?: number;
}

export interface RenderedWindowResult {
  defs: string;
  markup: string;
}

export function renderWindowModule(
  slotRect: Rect,
  mod: WindowModule,
  buildingColors: BuildingColors,
  uid: string,
  opts: RenderWindowOptions = {}
): RenderedWindowResult {
  const strokeColor = mod.syncStroke ? buildingColors.stroke : mod.strokeColor;
  const detailColor = mod.syncDetailColor ? buildingColors.cornice : mod.detailColor;
  const detailFrieze = darkenHex(detailColor, 0.22);

  const baseElStroke = opts.elementStrokeWidth ?? 2.4;
  const outerStrokeW = r2(Math.max(1, baseElStroke));
  const paneStrokeW = r2(Math.max(0.8, baseElStroke * 0.72));
  const detStroke = r2(Math.max(0.9, baseElStroke * 0.92));

  let targetW: number;
  let targetH: number;

  if (opts.fillSlot) {
    targetW = slotRect.width;
    targetH = slotRect.height;
  } else {
    targetW = slotRect.width * (mod.widthPct / 100);
    targetH = slotRect.height * (mod.heightPct / 100);

    const ratio = parseAspectRatio(mod.aspectRatio);
    if (ratio) {
      if (targetW / targetH > ratio) {
        targetW = targetH * ratio;
      } else {
        targetH = targetW / ratio;
      }
    }
  }

  const w = Math.max(16, targetW);
  const h = Math.max(16, targetH);
  const wx = r2(slotRect.x + (slotRect.width - w) / 2);
  const wy = r2(slotRect.y + (slotRect.height - h) / 2);

  const maxFrame = Math.min(w, h) * 0.24;
  const frameT = Math.min(mod.frameThickness, maxFrame);
  const mullionT = Math.min(mod.mullionThickness, Math.min(w, h) * 0.12);

  const gx = wx + frameT;
  const gy = wy + frameT;
  const gw = Math.max(6, w - frameT * 2);
  const gh = Math.max(6, h - frameT * 2);

  const cols = Math.max(1, Math.min(6, mod.cols || 1));
  const rows = Math.max(1, Math.min(5, mod.rows || 1));

  const availW = Math.max(4, gw - mullionT * (cols - 1));
  const colW = availW / cols;

  const availH = Math.max(4, gh - mullionT * (rows - 1));
  const rowHeights: number[] = [];
  if (mod.divisionMode === 'transom' && rows > 1) {
    const ratioFrac = Math.max(0.14, Math.min(0.45, (mod.transomRatio || 26) / 100));
    const topH = availH * ratioFrac;
    const restH = (availH - topH) / (rows - 1);
    rowHeights.push(topH);
    for (let r = 1; r < rows; r++) rowHeights.push(restH);
  } else {
    const rh = availH / rows;
    for (let r = 0; r < rows; r++) rowHeights.push(rh);
  }

  const parts: string[] = [];
  const defs: string[] = [];

  parts.push(
    `<g data-window-module="${escapeXml(mod.id)}" stroke-linejoin="round" stroke-linecap="round">`
  );

  parts.push(
    `<rect x="${wx}" y="${wy}" width="${r2(w)}" height="${r2(h)}" rx="1.5" fill="${mod.frameColor}" stroke="${strokeColor}" stroke-width="${outerStrokeW}" />`
  );

  let curY = gy;
  for (let r = 0; r < rows; r++) {
    const ph = rowHeights[r];
    let curX = gx;
    for (let c = 0; c < cols; c++) {
      const pane = renderGlassPane({
        x: curX,
        y: curY,
        width: colW,
        height: ph,
        clipId: `clip-${uid}-${r}-${c}`,
        glassColor: mod.glassColor,
        reflectionColor: mod.reflectionColor,
        reflectionStyle: mod.reflectionStyle,
        strokeColor,
        strokeWidth: paneStrokeW
      });
      defs.push(pane.def);
      parts.push(pane.markup);
      curX += colW + mullionT;
    }
    curY += ph + mullionT;
  }

  const ds = mod.detailScale || 1.0;
  parts.push(
    ...renderTopOrnament({
      topDetail: mod.topDetail,
      wx,
      wy,
      width: w,
      detailScale: ds,
      detailColor,
      detailFrieze,
      strokeColor,
      strokeWidth: detStroke
    })
  );

  const botY = r2(wy + h - 1);
  if (mod.bottomDetail === 'sill_flat') {
    const sh = r2(6 * ds);
    const ov = r2(4 * ds);
    parts.push(
      `<rect x="${r2(wx - ov)}" y="${botY}" width="${r2(w + ov * 2)}" height="${sh}" rx="1.5" fill="${detailColor}" stroke="${strokeColor}" stroke-width="${detStroke}" />`
    );
  } else if (mod.bottomDetail === 'sill_cornice') {
    const sh = r2(5.5 * ds);
    const fh = r2(4.5 * ds);
    const ovS = r2(6.5 * ds);
    const ovF = r2(3 * ds);
    parts.push(
      `<rect x="${r2(wx - ovF)}" y="${r2(botY + sh)}" width="${r2(w + ovF * 2)}" height="${fh}" fill="${detailFrieze}" stroke="${strokeColor}" stroke-width="${detStroke}" />`
    );
    parts.push(
      `<rect x="${r2(wx - ovS)}" y="${botY}" width="${r2(w + ovS * 2)}" height="${sh}" rx="1.5" fill="${detailColor}" stroke="${strokeColor}" stroke-width="${detStroke}" />`
    );
  } else if (mod.bottomDetail === 'sill_corbels') {
    const sh = r2(5.5 * ds);
    const ovS = r2(6.5 * ds);
    const cw = r2(6.5 * ds);
    const ch = r2(7.5 * ds);
    const leftCx = r2(wx + 3);
    const rightCx = r2(wx + w - 3 - cw);
    parts.push(
      `<rect x="${leftCx}" y="${r2(botY + sh)}" width="${cw}" height="${ch}" rx="1" fill="${detailFrieze}" stroke="${strokeColor}" stroke-width="${r2(detStroke * 0.88)}" />`
    );
    parts.push(
      `<rect x="${rightCx}" y="${r2(botY + sh)}" width="${cw}" height="${ch}" rx="1" fill="${detailFrieze}" stroke="${strokeColor}" stroke-width="${r2(detStroke * 0.88)}" />`
    );
    parts.push(
      `<rect x="${r2(wx - ovS)}" y="${botY}" width="${r2(w + ovS * 2)}" height="${sh}" rx="1.5" fill="${detailColor}" stroke="${strokeColor}" stroke-width="${detStroke}" />`
    );
  }

  parts.push(`</g>`);
  return { defs: defs.join('\n'), markup: parts.join('\n') };
}
