import type { BuildingColors, DoorModule, Rect } from '../types/facade';
import { darkenHex, escapeXml, r2 } from './colorUtils';
import { renderGlassPane, renderTopOrnament } from './svgPrimitives';

export interface RenderDoorOptions {
  elementStrokeWidth?: number;
}

export interface RenderedDoorResult {
  defs: string;
  markup: string;
}

interface LeafSpec {
  x: number;
  y: number;
  width: number;
  height: number;
  handleSide: 'left' | 'right' | 'none';
  isSidelight?: boolean;
}

function renderGlassGrid(params: {
  x: number;
  y: number;
  width: number;
  height: number;
  cols: number;
  rows: number;
  mullionT: number;
  uid: string;
  mod: DoorModule;
  strokeColor: string;
  paneStrokeW: number;
  defs: string[];
}): string {
  const {
    x,
    y,
    width,
    height,
    cols,
    rows,
    mullionT,
    uid,
    mod,
    strokeColor,
    paneStrokeW,
    defs
  } = params;
  const cCount = Math.max(1, Math.min(4, cols));
  const rCount = Math.max(1, Math.min(4, rows));
  const availW = Math.max(3, width - mullionT * (cCount - 1));
  const availH = Math.max(3, height - mullionT * (rCount - 1));
  const colW = availW / cCount;
  const rowH = availH / rCount;

  const out: string[] = [];
  for (let r = 0; r < rCount; r++) {
    for (let c = 0; c < cCount; c++) {
      const pane = renderGlassPane({
        x: x + c * (colW + mullionT),
        y: y + r * (rowH + mullionT),
        width: colW,
        height: rowH,
        clipId: `dclip-${uid}-${r}-${c}`,
        glassColor: mod.glassColor,
        reflectionColor: mod.reflectionColor,
        reflectionStyle: mod.reflectionStyle,
        strokeColor,
        strokeWidth: paneStrokeW
      });
      defs.push(pane.def);
      out.push(pane.markup);
    }
  }
  return out.join('\n');
}

function renderRecessedPanels(params: {
  x: number;
  y: number;
  width: number;
  height: number;
  count: 2 | 4;
  fillColor: string;
  strokeColor: string;
  strokeW: number;
}): string {
  const { x, y, width, height, count, fillColor, strokeColor, strokeW } = params;
  const gap = Math.max(2.5, Math.min(4.5, height * 0.06));
  const out: string[] = [];

  if (count === 4 && width >= 14) {
    const colW = (width - gap) / 2;
    const topH = (height - gap) * 0.56;
    const botH = height - gap - topH;
    const boxes = [
      { bx: x, by: y, bw: colW, bh: topH },
      { bx: x + colW + gap, by: y, bw: colW, bh: topH },
      { bx: x, by: y + topH + gap, bw: colW, bh: botH },
      { bx: x + colW + gap, by: y + topH + gap, bw: colW, bh: botH }
    ];
    boxes.forEach((b) => {
      out.push(
        `<rect x="${r2(b.bx)}" y="${r2(b.by)}" width="${r2(b.bw)}" height="${r2(b.bh)}" rx="1" fill="${fillColor}" stroke="${strokeColor}" stroke-width="${strokeW}" />`
      );
    });
  } else {
    const topH = (height - gap) * 0.56;
    const botH = height - gap - topH;
    out.push(
      `<rect x="${r2(x)}" y="${r2(y)}" width="${r2(width)}" height="${r2(topH)}" rx="1" fill="${fillColor}" stroke="${strokeColor}" stroke-width="${strokeW}" />`
    );
    out.push(
      `<rect x="${r2(x)}" y="${r2(y + topH + gap)}" width="${r2(width)}" height="${r2(botH)}" rx="1" fill="${fillColor}" stroke="${strokeColor}" stroke-width="${strokeW}" />`
    );
  }
  return out.join('\n');
}

function renderDoorLeaf(params: {
  leaf: LeafSpec;
  mod: DoorModule;
  leafColor: string;
  panelInsetColor: string;
  strokeColor: string;
  baseStrokeW: number;
  uid: string;
  defs: string[];
}): string {
  const { leaf, mod, leafColor, panelInsetColor, strokeColor, baseStrokeW, uid, defs } = params;
  const lx = r2(leaf.x);
  const ly = r2(leaf.y);
  const lw = r2(leaf.width);
  const lh = r2(leaf.height);
  const leafStrokeW = r2(Math.max(0.9, baseStrokeW * 0.84));
  const innerStrokeW = r2(Math.max(0.75, baseStrokeW * 0.65));

  const out: string[] = [];

  if (leaf.isSidelight) {
    const pad = Math.max(2, Math.min(3.5, lw * 0.16));
    const kickH = mod.hasKickplate ? Math.max(5, Math.min(9.5, lh * 0.11)) : 0;
    const innerH = Math.max(14, lh - pad * 2 - kickH - (kickH > 0 ? 2 : 0));
    const baseRatio =
      mod.panelStyle === 'half_glass'
        ? Math.max(0.24, 1 - Math.max(0.35, Math.min(0.7, (mod.glassRatio || 52) / 100)))
        : 0.22;
    const railGap = 3;
    const baseH = Math.max(7, (innerH - railGap) * baseRatio);
    const glassH = Math.max(10, innerH - railGap - baseH);

    out.push(
      `<rect x="${lx}" y="${ly}" width="${lw}" height="${lh}" fill="${mod.frameColor}" stroke="${strokeColor}" stroke-width="${leafStrokeW}" />`
    );
    out.push(
      renderGlassGrid({
        x: lx + pad,
        y: ly + pad,
        width: Math.max(4, lw - pad * 2),
        height: glassH,
        cols: 1,
        rows: Math.max(2, mod.glassRows),
        mullionT: 2,
        uid: `${uid}-sl`,
        mod,
        strokeColor,
        paneStrokeW: innerStrokeW,
        defs
      })
    );
    out.push(
      `<rect x="${r2(lx + pad)}" y="${r2(ly + pad + glassH + railGap)}" width="${r2(Math.max(4, lw - pad * 2))}" height="${r2(baseH)}" rx="0.8" fill="${panelInsetColor}" stroke="${strokeColor}" stroke-width="${innerStrokeW}" />`
    );
    return out.join('\n');
  }

  out.push(
    `<rect x="${lx}" y="${ly}" width="${lw}" height="${lh}" fill="${leafColor}" stroke="${strokeColor}" stroke-width="${leafStrokeW}" />`
  );

  const pad = Math.max(3, Math.min(6.5, lw * 0.12));
  const kickH = mod.hasKickplate ? Math.max(5, Math.min(9.5, lh * 0.11)) : 0;
  const cx = lx + pad;
  const cy = ly + pad;
  const cw = Math.max(5, lw - pad * 2);
  const ch = Math.max(8, lh - pad * 2 - kickH - (kickH > 0 ? 2 : 0));

  if (mod.panelStyle === 'solid_panels') {
    out.push(
      renderRecessedPanels({
        x: cx,
        y: cy,
        width: cw,
        height: ch,
        count: mod.panelCount,
        fillColor: panelInsetColor,
        strokeColor,
        strokeW: innerStrokeW
      })
    );
  } else if (mod.panelStyle === 'half_glass') {
    const ratio = Math.max(0.35, Math.min(0.7, (mod.glassRatio || 52) / 100));
    const railGap = Math.max(3, Math.min(5, ch * 0.08));
    const glassH = Math.max(8, (ch - railGap) * ratio);
    const lowerH = Math.max(6, ch - railGap - glassH);

    out.push(
      `<rect x="${r2(cx - 1)}" y="${r2(cy - 1)}" width="${r2(cw + 2)}" height="${r2(glassH + 2)}" fill="${mod.frameColor}" stroke="${strokeColor}" stroke-width="${innerStrokeW}" />`
    );
    out.push(
      renderGlassGrid({
        x: cx,
        y: cy,
        width: cw,
        height: glassH,
        cols: mod.glassCols,
        rows: mod.glassRows,
        mullionT: 2.1,
        uid: `${uid}-hg`,
        mod,
        strokeColor,
        paneStrokeW: innerStrokeW,
        defs
      })
    );
    out.push(
      `<rect x="${r2(cx)}" y="${r2(cy + glassH + railGap)}" width="${r2(cw)}" height="${r2(lowerH)}" rx="1" fill="${panelInsetColor}" stroke="${strokeColor}" stroke-width="${innerStrokeW}" />`
    );
  } else if (mod.panelStyle === 'full_glass') {
    out.push(
      `<rect x="${r2(cx - 1)}" y="${r2(cy - 1)}" width="${r2(cw + 2)}" height="${r2(ch + 2)}" fill="${mod.frameColor}" stroke="${strokeColor}" stroke-width="${innerStrokeW}" />`
    );
    out.push(
      renderGlassGrid({
        x: cx,
        y: cy,
        width: cw,
        height: ch,
        cols: mod.glassCols,
        rows: mod.glassRows,
        mullionT: 2.2,
        uid: `${uid}-fg`,
        mod,
        strokeColor,
        paneStrokeW: innerStrokeW,
        defs
      })
    );
  }

  if (mod.hasKickplate && kickH > 0) {
    out.push(
      `<rect x="${r2(lx + 2)}" y="${r2(ly + lh - kickH - 1)}" width="${r2(lw - 4)}" height="${r2(kickH)}" rx="0.8" fill="${mod.hardwareColor}" stroke="${strokeColor}" stroke-width="${r2(Math.max(0.7, innerStrokeW * 0.85))}" />`
    );
  }

  if (mod.handleStyle !== 'none' && leaf.handleSide !== 'none') {
    const edgeOffset = Math.max(4, Math.min(6, pad * 0.78));
    const hx =
      leaf.handleSide === 'right' ? r2(lx + lw - edgeOffset) : r2(lx + edgeOffset);
    const hy = r2(ly + lh * 0.54);
    const hwStroke = r2(Math.max(0.7, baseStrokeW * 0.52));

    if (mod.handleStyle === 'knob_classic') {
      out.push(
        `<rect x="${r2(hx - 1.8)}" y="${r2(hy - 4.2)}" width="3.6" height="8.4" rx="1" fill="${mod.hardwareColor}" stroke="${strokeColor}" stroke-width="${hwStroke}" />`
      );
      out.push(
        `<circle cx="${hx}" cy="${hy}" r="2.3" fill="${mod.hardwareColor}" stroke="${strokeColor}" stroke-width="${hwStroke}" />`
      );
    } else if (mod.handleStyle === 'handle_vertical') {
      const barH = Math.max(10, Math.min(18, lh * 0.2));
      out.push(
        `<rect x="${r2(hx - 1.5)}" y="${r2(hy - barH / 2)}" width="3" height="${r2(barH)}" rx="1.2" fill="${mod.hardwareColor}" stroke="${strokeColor}" stroke-width="${hwStroke}" />`
      );
    }
  }

  return out.join('\n');
}

export function renderDoorModule(
  slotRect: Rect,
  mod: DoorModule,
  buildingColors: BuildingColors,
  uid: string,
  opts: RenderDoorOptions = {}
): RenderedDoorResult {
  const strokeColor = mod.syncStroke ? buildingColors.stroke : mod.strokeColor;
  const detailColor = mod.syncDetailColor ? buildingColors.cornice : mod.detailColor;
  const detailFrieze = darkenHex(detailColor, 0.22);
  const leafColor = mod.syncLeafColor ? buildingColors.door : mod.leafColor;
  const panelInsetColor = darkenHex(leafColor, 0.16);

  const baseStrokeW = opts.elementStrokeWidth ?? 2.4;
  const outerStrokeW = r2(Math.max(1, baseStrokeW * 1.05));
  const detStrokeW = r2(Math.max(0.9, baseStrokeW * 0.9));
  const ds = mod.detailScale || 1.0;

  // Contenção estrita: largura <= 1/3 e altura até o limite da cornija (descontando ornamento superior)
  let topOrnH = 0;
  if (mod.topDetail === 'lintel_flat') topOrnH = Math.max(0, 7 * ds - 1);
  else if (mod.topDetail === 'lintel_cornice') topOrnH = Math.max(0, 11 * ds - 1);
  else if (mod.topDetail === 'pediment') topOrnH = Math.max(0, 18 * ds - 1);
  else if (mod.topDetail === 'arch') topOrnH = Math.max(0, 10.5 * ds);

  const pctW = Math.max(55, Math.min(100, mod.widthPct || 100));
  const pctH = Math.max(55, Math.min(100, mod.heightPct || 100));
  const totalOuterW = Math.max(24, slotRect.width * (pctW / 100));
  const rawH = Math.max(36, slotRect.height * (pctH / 100));
  const h = r2(Math.min(rawH, Math.max(36, slotRect.height - topOrnH)));

  const pilW = mod.hasPilasters
    ? r2(Math.max(3.5, Math.min(6.5, totalOuterW * 0.085)) * Math.min(1.15, ds))
    : 0;
  const w = mod.hasPilasters ? Math.max(20, totalOuterW - pilW * 2) : totalOuterW;
  const portalX = r2(slotRect.x + (slotRect.width - totalOuterW) / 2);
  const wx = r2(portalX + pilW);
  const wy = r2(slotRect.y + slotRect.height - h);

  const frameT = Math.min(mod.frameThickness, Math.min(w, h) * 0.2);

  const parts: string[] = [];
  const defs: string[] = [];

  parts.push(
    `<g data-door-module="${escapeXml(mod.id)}" stroke-linejoin="round" stroke-linecap="round">`
  );

  if (mod.hasPilasters && pilW > 0) {
    const capH = r2(5 * ds);
    const baseH = r2(6 * ds);
    const leftPx = portalX;
    const rightPx = r2(wx + w);
    [leftPx, rightPx].forEach((px) => {
      parts.push(
        `<rect x="${px}" y="${wy}" width="${pilW}" height="${r2(h)}" fill="${detailColor}" stroke="${strokeColor}" stroke-width="${detStrokeW}" />`
      );
      parts.push(
        `<rect x="${r2(px - 0.8)}" y="${wy}" width="${r2(pilW + 1.6)}" height="${capH}" fill="${detailFrieze}" stroke="${strokeColor}" stroke-width="${r2(detStrokeW * 0.85)}" />`
      );
      parts.push(
        `<rect x="${r2(px - 0.8)}" y="${r2(wy + h - baseH)}" width="${r2(pilW + 1.6)}" height="${baseH}" fill="${detailFrieze}" stroke="${strokeColor}" stroke-width="${r2(detStrokeW * 0.85)}" />`
      );
    });
  }

  parts.push(
    `<rect x="${wx}" y="${wy}" width="${r2(w)}" height="${r2(h)}" rx="1.2" fill="${mod.frameColor}" stroke="${strokeColor}" stroke-width="${outerStrokeW}" />`
  );

  const ix = wx + frameT;
  const iy = wy + frameT;
  const iw = Math.max(12, w - frameT * 2);
  const ih = Math.max(20, h - frameT);

  let leavesY = iy;
  let leavesH = ih;

  if (mod.hasTransom) {
    const tRatio = Math.max(0.16, Math.min(0.38, (mod.transomRatio || 22) / 100));
    const barH = Math.max(2.5, Math.min(4.5, frameT * 0.72));
    const transomH = Math.max(7, (ih - barH) * tRatio);

    parts.push(
      renderGlassGrid({
        x: ix,
        y: iy,
        width: iw,
        height: transomH,
        cols: mod.transomCols,
        rows: 1,
        mullionT: 2.1,
        uid: `${uid}-tr`,
        mod,
        strokeColor,
        paneStrokeW: r2(Math.max(0.75, baseStrokeW * 0.65)),
        defs
      })
    );

    const numText = mod.transomNumber.trim().slice(0, 6);
    if (numText) {
      const fontSize = Math.max(5.5, Math.min(10.5, transomH * 0.58));
      const badgeW = r2(Math.min(iw - 4, Math.max(14, numText.length * fontSize * 0.68 + 6)));
      const badgeH = r2(Math.min(transomH - 2, fontSize + 4));
      const numX = r2(ix + iw / 2);
      const badgeY = r2(iy + (transomH - badgeH) / 2);
      const numY = r2(iy + transomH / 2 + fontSize * 0.34);

      parts.push(
        `<rect x="${r2(numX - badgeW / 2)}" y="${badgeY}" width="${badgeW}" height="${badgeH}" rx="1.2" fill="${strokeColor}" fill-opacity="0.88" stroke="${detailColor}" stroke-width="0.9" />`
      );
      parts.push(
        `<text x="${numX}" y="${numY}" text-anchor="middle" fill="#FAF5E8" font-family="monospace" font-size="${r2(fontSize)}" font-weight="700">${escapeXml(numText)}</text>`
      );
    }

    parts.push(
      `<rect x="${r2(ix - 0.5)}" y="${r2(iy + transomH)}" width="${r2(iw + 1)}" height="${r2(barH)}" fill="${mod.frameColor}" stroke="${strokeColor}" stroke-width="${r2(Math.max(0.8, baseStrokeW * 0.75))}" />`
    );

    leavesY = iy + transomH + barH;
    leavesH = Math.max(14, ih - transomH - barH);
  }

  const leaves: LeafSpec[] = [];
  const seam = 2;

  if (mod.leafLayout === 'double') {
    const lw = (iw - seam) / 2;
    leaves.push({
      x: ix,
      y: leavesY,
      width: lw,
      height: leavesH,
      handleSide: 'right'
    });
    leaves.push({
      x: ix + lw + seam,
      y: leavesY,
      width: lw,
      height: leavesH,
      handleSide: 'left'
    });
  } else if (mod.leafLayout === 'sidelight') {
    if (mod.sidelightSide === 'both') {
      const sideW = Math.max(6, iw * 0.22);
      const mainW = Math.max(12, iw - sideW * 2 - seam * 2);
      leaves.push({
        x: ix,
        y: leavesY,
        width: sideW,
        height: leavesH,
        handleSide: 'none',
        isSidelight: true
      });
      leaves.push({
        x: ix + sideW + seam,
        y: leavesY,
        width: mainW,
        height: leavesH,
        handleSide: 'right'
      });
      leaves.push({
        x: ix + sideW + seam + mainW + seam,
        y: leavesY,
        width: sideW,
        height: leavesH,
        handleSide: 'none',
        isSidelight: true
      });
    } else {
      const sideW = Math.max(7, iw * 0.28);
      const mainW = Math.max(10, iw - sideW - seam);
      if (mod.sidelightSide === 'left') {
        leaves.push({
          x: ix,
          y: leavesY,
          width: sideW,
          height: leavesH,
          handleSide: 'none',
          isSidelight: true
        });
        leaves.push({
          x: ix + sideW + seam,
          y: leavesY,
          width: mainW,
          height: leavesH,
          handleSide: 'left'
        });
      } else {
        leaves.push({
          x: ix,
          y: leavesY,
          width: mainW,
          height: leavesH,
          handleSide: 'right'
        });
        leaves.push({
          x: ix + mainW + seam,
          y: leavesY,
          width: sideW,
          height: leavesH,
          handleSide: 'none',
          isSidelight: true
        });
      }
    }
  } else {
    leaves.push({
      x: ix,
      y: leavesY,
      width: iw,
      height: leavesH,
      handleSide: 'right'
    });
  }

  leaves.forEach((leaf, idx) => {
    parts.push(
      renderDoorLeaf({
        leaf,
        mod,
        leafColor,
        panelInsetColor,
        strokeColor,
        baseStrokeW,
        uid: `${uid}-l${idx}`,
        defs
      })
    );
  });

  // Astrágalo / junta central em portas duplas
  if (mod.leafLayout === 'double') {
    const astragalX = r2(ix + (iw - seam) / 2);
    parts.push(
      `<rect x="${astragalX}" y="${r2(leavesY)}" width="${seam}" height="${r2(leavesH)}" fill="${mod.frameColor}" stroke="${strokeColor}" stroke-width="0.9" />`
    );
  }

  // Ornamento Superior ancorado na largura total do portal (batente + pilastras)
  parts.push(
    ...renderTopOrnament({
      topDetail: mod.topDetail,
      wx: portalX,
      wy,
      width: totalOuterW,
      detailScale: ds,
      detailColor,
      detailFrieze,
      strokeColor,
      extraOverhang: 0,
      strokeWidth: detStrokeW
    })
  );

  // Soleira / Degraus na base
  const botY = r2(wy + h - 1);
  if (mod.thresholdType === 'sill_stone') {
    const sh = r2(5.5 * ds);
    const ov = r2(3 * ds);
    parts.push(
      `<rect x="${r2(portalX - ov)}" y="${botY}" width="${r2(totalOuterW + ov * 2)}" height="${sh}" rx="1.2" fill="${detailColor}" stroke="${strokeColor}" stroke-width="${detStrokeW}" />`
    );
  } else if (mod.thresholdType === 'double_step') {
    const s1h = r2(4.5 * ds);
    const s2h = r2(5.5 * ds);
    const ov1 = r2(2.5 * ds);
    const ov2 = r2(5 * ds);
    parts.push(
      `<rect x="${r2(portalX - ov1)}" y="${r2(botY - s1h + 1)}" width="${r2(totalOuterW + ov1 * 2)}" height="${s1h}" rx="1" fill="${detailColor}" stroke="${strokeColor}" stroke-width="${r2(detStrokeW * 0.9)}" />`
    );
    parts.push(
      `<rect x="${r2(portalX - ov2)}" y="${r2(botY + 1)}" width="${r2(totalOuterW + ov2 * 2)}" height="${s2h}" rx="1" fill="${detailFrieze}" stroke="${strokeColor}" stroke-width="${detStrokeW}" />`
    );
  }

  parts.push(`</g>`);
  return { defs: defs.join('\n'), markup: parts.join('\n') };
}
