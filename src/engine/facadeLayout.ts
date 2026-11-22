import type {
  BattlementsStyle,
  BuildingConfig,
  ElevationLevel,
  FacadeLayout,
  FacadeSlot,
  LayoutSection,
  Rect,
  RoofSection
} from '../types/facade';
import { r2 } from './colorUtils';

function computeTypicalGeometry(params: {
  bodyX: number;
  bodyW: number;
  floorY: number;
  floorH: number;
  count: number;
  columnBandsMode: BuildingConfig['columnBandsMode'];
  hasQuoins: boolean;
}): {
  slotPositions: Array<{ x: number; width: number }>;
  centerBand: Rect | null;
  columnBands: Rect[];
} {
  const { bodyX, bodyW, floorY, floorH, count, columnBandsMode, hasQuoins } = params;

  const quoinReserve = hasQuoins ? 12 : 4;
  const edgePilasterW = columnBandsMode === 'edges' || columnBandsMode === 'all_bays'
    ? Math.max(8, Math.min(13, Math.round(bodyW * 0.032)))
    : 0;

  const outerPad = Math.max(16, quoinReserve + edgePilasterW + 8);
  const centerBandW = Math.round(Math.min(28, Math.max(18, bodyW * 0.075)));
  const showCenterBand =
    (columnBandsMode === 'center' || columnBandsMode === 'all_bays') && count % 2 === 0;

  const slotPositions: Array<{ x: number; width: number }> = [];
  const columnBands: Rect[] = [];

  if (columnBandsMode === 'edges' || columnBandsMode === 'all_bays') {
    const pilXLeft = r2(bodyX + (hasQuoins ? 9 : 2));
    const pilXRight = r2(bodyX + bodyW - (hasQuoins ? 9 : 2) - edgePilasterW);
    columnBands.push({ x: pilXLeft, y: floorY, width: edgePilasterW, height: floorH });
    columnBands.push({ x: pilXRight, y: floorY, width: edgePilasterW, height: floorH });
  }

  let centerBand: Rect | null = null;

  if (showCenterBand && count % 2 === 0) {
    const cbx = r2(bodyX + (bodyW - centerBandW) / 2);
    centerBand = { x: cbx, y: floorY, width: centerBandW, height: floorH };
    if (columnBandsMode === 'all_bays') {
      columnBands.push(centerBand);
    }

    const halfCount = count / 2;
    const halfUsableW = (bodyW - centerBandW) / 2 - outerPad - 12;
    const gap = Math.max(11, Math.min(20, (halfUsableW * 0.25) / Math.max(1, halfCount)));
    const slotW = Math.max(24, Math.min(68, (halfUsableW - gap * Math.max(0, halfCount - 1)) / halfCount));
    const sideSpan = slotW * halfCount + gap * (halfCount - 1);
    const leftStart = bodyX + outerPad + (halfUsableW - sideSpan) / 2;
    const rightStart = cbx + centerBandW + 12 + (halfUsableW - sideSpan) / 2;

    for (let i = 0; i < halfCount; i++) {
      slotPositions.push({ x: r2(leftStart + i * (slotW + gap)), width: r2(slotW) });
    }
    for (let i = 0; i < halfCount; i++) {
      slotPositions.push({ x: r2(rightStart + i * (slotW + gap)), width: r2(slotW) });
    }
  } else {
    const usableW = bodyW - outerPad * 2;
    const minGap = columnBandsMode === 'all_bays' ? 14 : 12;
    const gap = Math.max(minGap, Math.min(24, (usableW * 0.26) / Math.max(1, count - 1)));
    const slotW = Math.max(24, Math.min(68, (usableW - gap * (count - 1)) / count));
    const totalW = slotW * count + gap * (count - 1);
    const startX = bodyX + (bodyW - totalW) / 2;

    for (let i = 0; i < count; i++) {
      slotPositions.push({ x: r2(startX + i * (slotW + gap)), width: r2(slotW) });
    }
  }

  // Pilastras intermediárias entre vãos no modo 'all_bays'
  if (columnBandsMode === 'all_bays') {
    const bayPilW = Math.max(7, Math.min(11, Math.round(bodyW * 0.028)));
    for (let i = 0; i < slotPositions.length - 1; i++) {
      const s1 = slotPositions[i];
      const s2 = slotPositions[i + 1];
      const gapCenter = (s1.x + s1.width + s2.x) / 2;
      // Evita duplicar sobre a faixa central quando par
      if (centerBand && Math.abs(gapCenter - (centerBand.x + centerBand.width / 2)) < 4) {
        continue;
      }
      columnBands.push({
        x: r2(gapCenter - bayPilW / 2),
        y: floorY,
        width: bayPilW,
        height: floorH
      });
    }
  }

  return { slotPositions, centerBand, columnBands };
}

export function computeFacadeLayout(
  building: BuildingConfig,
  showDimensions: boolean
): FacadeLayout {
  const STROKE_W = building.buildingStrokeWidth || 5.0;
  const EL_STROKE_W = building.elementStrokeWidth || 2.4;
  const CORNICE_OVERHANG = building.corniceFlush ? 0 : 10;
  const totalCorniceH = Math.max(16, Math.min(56, building.corniceHeight ?? 38));
  const CORNICE_FRIEZE_H = Math.max(5, Math.round(totalCorniceH * (12 / 38)));
  const CORNICE_MAIN_H = totalCorniceH - CORNICE_FRIEZE_H;
  const CORNICE_TOTAL_H = totalCorniceH;
  const SHADOW_BAND_H = 11;

  const ROOF_H = 38;
  const ROOF_NOTCH = 18;
  const ATTIC_H = 68;
  const TYPICAL_H = 126;
  const GROUND_H = 156;
  const PLINTH_H = 32;

  const extraLeft = building.hasFireEscape && building.fireEscapePlacement === 'left' ? 38 : 28;
  const extraRight = building.hasFireEscape && building.fireEscapePlacement === 'right' ? 38 : 28;
  const MARGIN_LEFT = showDimensions ? 76 : extraLeft;
  const MARGIN_RIGHT = showDimensions ? 54 : extraRight;
  const MARGIN_TOP = showDimensions ? 48 : 24;
  const MARGIN_BOTTOM = building.hasEntranceStairs || building.hasFooterGarden ? 50 : 30;

  const bodyW = building.bodyWidth;
  const bodyX = MARGIN_LEFT + CORNICE_OVERHANG;
  const corniceX = MARGIN_LEFT;
  const corniceW = bodyW + CORNICE_OVERHANG * 2;

  const effectiveColumnMode =
    building.columnBandsMode || (building.hasCenterBand ? 'center' : 'none');

  const sections: LayoutSection[] = [];
  const slots: FacadeSlot[] = [];
  let cursorY = MARGIN_TOP;

  // 1. COBERTURA COM SETEIRAS
  sections.push({
    id: 'roof',
    type: 'roof_battlements',
    label: 'Cobertura (Seteiras)',
    x: bodyX,
    y: cursorY,
    width: bodyW,
    height: ROOF_H,
    notchDepth: ROOF_NOTCH,
    battlementsCount: building.battlementsCount,
    battlementsStyle: building.battlementsStyle || 'classic'
  });
  cursorY += ROOF_H;

  // 2. CORNIJA SUPERIOR
  sections.push({
    id: 'cornice-top',
    type: 'cornice',
    x: corniceX,
    bodyX,
    y: cursorY,
    width: corniceW,
    bodyWidth: bodyW,
    mainHeight: CORNICE_MAIN_H,
    friezeHeight: CORNICE_FRIEZE_H,
    height: CORNICE_TOTAL_H
  });
  cursorY += CORNICE_TOTAL_H;

  // 3. PAVIMENTO ÁTICO (sincronizado com a prumada dos pavimentos tipo)
  if (building.hasAttic) {
    const atticY = cursorY;
    const atticCount = Math.max(3, Math.min(6, building.typicalSlotsCount));
    const atticGeom = computeTypicalGeometry({
      bodyX,
      bodyW,
      floorY: atticY,
      floorH: ATTIC_H,
      count: atticCount,
      columnBandsMode: effectiveColumnMode === 'center' ? 'none' : effectiveColumnMode,
      hasQuoins: building.hasQuoins
    });

    sections.push({
      id: 'floor-attic',
      type: 'attic',
      label: 'Pavimento Ático',
      x: bodyX,
      y: atticY,
      width: bodyW,
      height: ATTIC_H,
      shadowBandHeight: SHADOW_BAND_H,
      columnBands: atticGeom.columnBands
    });

    atticGeom.slotPositions.forEach((pos, i) => {
      const slotSize = Math.min(44, Math.max(22, Math.round(pos.width * 0.86)));
      const slotX = pos.x + (pos.width - slotSize) / 2;
      const slotY = atticY + (ATTIC_H - slotSize) / 2 + 2;
      slots.push({
        id: `ATICO_SLOT_${i + 1}`,
        zone: 'attic',
        kind: 'window',
        label: `Ático ${i + 1}`,
        colIndex: i,
        x: r2(slotX),
        y: r2(slotY),
        width: r2(slotSize),
        height: r2(slotSize)
      });
    });

    cursorY += ATTIC_H;

    sections.push({
      id: 'cornice-attic',
      type: 'cornice',
      x: corniceX,
      bodyX,
      y: cursorY,
      width: corniceW,
      bodyWidth: bodyW,
      mainHeight: CORNICE_MAIN_H,
      friezeHeight: CORNICE_FRIEZE_H,
      height: CORNICE_TOTAL_H
    });
    cursorY += CORNICE_TOTAL_H;
  }

  // 4. PAVIMENTOS TIPO (1 A 6) COM 2 A 6 JANELAS POR ANDAR
  const count = Math.max(2, Math.min(6, building.typicalSlotsCount || 2));
  for (let f = 0; f < building.typicalFloors; f++) {
    const floorNum = building.typicalFloors - f;
    const floorY = cursorY;

    const geom = computeTypicalGeometry({
      bodyX,
      bodyW,
      floorY,
      floorH: TYPICAL_H,
      count,
      columnBandsMode: effectiveColumnMode,
      hasQuoins: building.hasQuoins
    });

    sections.push({
      id: `floor-typical-${floorNum}`,
      type: 'typical',
      label: `Pavimento Tipo ${floorNum}`,
      floorNum,
      x: bodyX,
      y: floorY,
      width: bodyW,
      height: TYPICAL_H,
      shadowBandHeight: SHADOW_BAND_H,
      centerBand: geom.centerBand,
      columnBands: geom.columnBands
    });

    const slotH = 88;
    const slotY = floorY + (TYPICAL_H - slotH) / 2 + 2;

    geom.slotPositions.forEach((pos, i) => {
      slots.push({
        id: `TIPO_${floorNum}_SLOT_${i + 1}`,
        zone: 'typical',
        kind: 'window',
        label: `Tipo ${floorNum} · Slot ${i + 1}`,
        floorNum,
        colIndex: i,
        x: pos.x,
        y: r2(slotY),
        width: pos.width,
        height: slotH
      });
    });

    cursorY += TYPICAL_H;

    sections.push({
      id: `cornice-typical-${floorNum}`,
      type: 'cornice',
      x: corniceX,
      bodyX,
      y: cursorY,
      width: corniceW,
      bodyWidth: bodyW,
      mainHeight: CORNICE_MAIN_H,
      friezeHeight: CORNICE_FRIEZE_H,
      height: CORNICE_TOTAL_H
    });
    cursorY += CORNICE_TOTAL_H;
  }

  // 5. PAVIMENTO TÉRREO (REGRA DE 1/3: 1 PORTA + ZONA VITRINE OU 2 PORTAS + 1 VITRINE)
  const groundY = cursorY;
  const groundPadX = building.hasQuoins ? 18 : 14;
  const zoneGap = 14;
  const usableGroundW = bodyW - groundPadX * 2;
  const shopH = 92;
  const shopY = groundY + 20;
  const doorH = GROUND_H;
  const doorY = groundY;
  const plinthY = groundY + GROUND_H - PLINTH_H;

  let shopAreaX = bodyX + groundPadX;
  let shopAreaW = usableGroundW;
  const doorAreas: Array<{ id: string; label: string; rect: Rect }> = [];

  if (building.groundDoorCount === 2) {
    const oneThirdW = r2((usableGroundW - zoneGap * 2) / 3);
    shopAreaW = oneThirdW;

    const col0X = r2(bodyX + groundPadX);
    const col1X = r2(col0X + oneThirdW + zoneGap);
    const col2X = r2(col1X + oneThirdW + zoneGap);

    if (building.doorSide === 'left') {
      doorAreas.push({
        id: 'TERREO_PORTA',
        label: 'Porta Principal 1',
        rect: { x: col0X, y: r2(doorY), width: oneThirdW, height: doorH }
      });
      doorAreas.push({
        id: 'TERREO_PORTA_2',
        label: 'Porta Principal 2',
        rect: { x: col1X, y: r2(doorY), width: oneThirdW, height: doorH }
      });
      shopAreaX = col2X;
    } else if (building.doorSide === 'split') {
      doorAreas.push({
        id: 'TERREO_PORTA',
        label: 'Porta Principal 1 (Esq)',
        rect: { x: col0X, y: r2(doorY), width: oneThirdW, height: doorH }
      });
      shopAreaX = col1X;
      doorAreas.push({
        id: 'TERREO_PORTA_2',
        label: 'Porta Principal 2 (Dir)',
        rect: { x: col2X, y: r2(doorY), width: oneThirdW, height: doorH }
      });
    } else {
      shopAreaX = col0X;
      doorAreas.push({
        id: 'TERREO_PORTA',
        label: 'Porta Principal 1',
        rect: { x: col1X, y: r2(doorY), width: oneThirdW, height: doorH }
      });
      doorAreas.push({
        id: 'TERREO_PORTA_2',
        label: 'Porta Principal 2',
        rect: { x: col2X, y: r2(doorY), width: oneThirdW, height: doorH }
      });
    }
  } else {
    const oneThirdW = r2((usableGroundW - zoneGap) / 3);
    shopAreaW = r2(usableGroundW - zoneGap - oneThirdW);

    const isDoorLeft = building.doorSide === 'left';
    const doorX = isDoorLeft
      ? r2(bodyX + groundPadX)
      : r2(bodyX + bodyW - groundPadX - oneThirdW);
    shopAreaX = isDoorLeft ? r2(doorX + oneThirdW + zoneGap) : r2(bodyX + groundPadX);

    doorAreas.push({
      id: 'TERREO_PORTA',
      label: 'Porta Principal',
      rect: { x: doorX, y: r2(doorY), width: oneThirdW, height: doorH }
    });
  }

  const plinthX = r2(Math.max(bodyX, shopAreaX - 4));
  const plinthMaxW = bodyX + bodyW - plinthX;
  const plinthW = r2(Math.min(plinthMaxW, shopAreaW + 8));

  sections.push({
    id: 'floor-ground',
    type: 'ground',
    label: 'Pavimento Térreo',
    x: bodyX,
    y: groundY,
    width: bodyW,
    height: GROUND_H,
    shadowBandHeight: SHADOW_BAND_H,
    plinth: building.hasPlinth
      ? {
          x: plinthX,
          y: r2(plinthY),
          width: plinthW,
          height: PLINTH_H
        }
      : null,
    shopArea: { x: r2(shopAreaX), y: r2(shopY), width: r2(shopAreaW), height: shopH },
    doorAreas: doorAreas.map((d) => d.rect)
  });

  if (building.groundDoorCount === 2 || building.groundShopMode === 'single') {
    slots.push({
      id: 'gf-shop-single',
      zone: 'ground',
      kind: 'window',
      label: building.groundDoorCount === 2 ? 'Térreo · Vitrine (1/3)' : 'Térreo · Vitrine Ampla',
      x: r2(shopAreaX),
      y: r2(shopY),
      width: r2(shopAreaW),
      height: shopH
    });
  } else {
    const shopGap = 12;
    const singleShopW = (shopAreaW - shopGap) / 2;
    for (let i = 0; i < 2; i++) {
      slots.push({
        id: `gf-shop-${i}`,
        zone: 'ground',
        kind: 'window',
        label: `Térreo · Vitrine ${i + 1}`,
        x: r2(shopAreaX + i * (singleShopW + shopGap)),
        y: r2(shopY),
        width: r2(singleShopW),
        height: shopH
      });
    }
  }

  doorAreas.forEach((d) => {
    slots.push({
      id: d.id,
      zone: 'door',
      kind: 'door',
      label: d.label,
      x: d.rect.x,
      y: d.rect.y,
      width: d.rect.width,
      height: d.rect.height
    });
  });

  cursorY += GROUND_H;

  const topY = MARGIN_TOP;
  const bottomY = cursorY;
  const totalHeight = bottomY - topY;
  const svgWidth = corniceW + MARGIN_LEFT + MARGIN_RIGHT;
  const svgHeight = bottomY + MARGIN_BOTTOM;

  const pxToM = (py: number) => ((bottomY - py) * 0.028).toFixed(2);
  const levels: ElevationLevel[] = [{ label: '+0.00m', y: bottomY }];
  sections.forEach((s) => {
    if (s.type === 'ground' || s.type === 'typical' || s.type === 'attic') {
      levels.push({ label: `+${pxToM(s.y)}m`, y: s.y });
    }
  });
  levels.push({ label: `+${pxToM(topY)}m`, y: topY });

  return {
    strokeWidth: STROKE_W,
    elementStrokeWidth: EL_STROKE_W,
    bodyWidth: bodyW,
    corniceWidth: corniceW,
    totalHeight,
    viewBox: { width: svgWidth, height: svgHeight },
    bounds: { bodyX, corniceX, topY, bottomY },
    sections,
    slots,
    levels
  };
}

export interface BattlementMerlonSpan {
  x0: number;
  x1: number;
  topY: number;
  shoulderW?: number;
  stepY?: number;
  archSpringY?: number;
  archCtrlY?: number;
}

export interface BattlementNotchSpan {
  x0: number;
  x1: number;
  lowY: number;
}

export interface BalustradeBay {
  x: number;
  width: number;
  railTopY: number;
  openY: number;
  openHeight: number;
}

export interface PedimentGeometry {
  leftX: number;
  midX: number;
  rightX: number;
  eaveY: number;
  apexY: number;
  oculusCx: number;
  oculusCy: number;
}

export interface BattlementsGeometry {
  style: BattlementsStyle;
  baseY: number;
  topY: number;
  lowY: number;
  merlons: BattlementMerlonSpan[];
  notches: BattlementNotchSpan[];
  pediment: PedimentGeometry | null;
  bays: BalustradeBay[];
}

export function computeBattlementsGeometry(sec: RoofSection): BattlementsGeometry {
  const { x, y, width, height, notchDepth } = sec;
  const n = Math.max(2, Math.min(6, sec.battlementsCount || 4));
  const style: BattlementsStyle = sec.battlementsStyle || 'classic';
  const baseY = y + height;
  const topY = y;
  const lowY = y + notchDepth;

  const merlons: BattlementMerlonSpan[] = [];
  const notches: BattlementNotchSpan[] = [];
  const bays: BalustradeBay[] = [];
  let pediment: PedimentGeometry | null = null;

  if (style === 'pediment') {
    const midX = x + width / 2;
    const pedW = width * 0.42;
    const pedLeft = midX - pedW / 2;
    const pedRight = midX + pedW / 2;
    const eaveY = y + notchDepth * 0.72;
    const sideTopY = y + notchDepth * 0.35;
    const sideCount = Math.max(1, Math.floor(n / 2));
    const wingW = (width - pedW) / 2;
    const wingUnit = wingW / (sideCount + sideCount * 0.9);
    const sMerlonW = wingUnit;
    const sNotchW = wingUnit * 0.9;

    pediment = {
      leftX: pedLeft,
      midX,
      rightX: pedRight,
      eaveY,
      apexY: topY,
      oculusCx: midX,
      oculusCy: y + height * 0.56
    };

    let lx = x;
    for (let j = 0; j < sideCount; j++) {
      const mx0 = lx;
      const mx1 = lx + sMerlonW;
      merlons.push({ x0: mx0, x1: mx1, topY: sideTopY });
      const nx1 = j === sideCount - 1 ? pedLeft : mx1 + sNotchW;
      notches.push({ x0: mx1, x1: nx1, lowY });
      lx = nx1;
    }

    let rx = pedRight;
    for (let j = 0; j < sideCount; j++) {
      const nx0 = rx;
      const nx1 = nx0 + sNotchW;
      notches.push({ x0: nx0, x1: nx1, lowY });
      const mx1 = j === sideCount - 1 ? x + width : nx1 + sMerlonW;
      merlons.push({ x0: nx1, x1: mx1, topY: sideTopY });
      rx = mx1;
    }

    return { style, baseY, topY, lowY, merlons, notches, pediment, bays };
  }

  if (style === 'balustrade') {
    const pierW = Math.max(14, Math.min(26, width / (n * 2.3)));
    const gaps = n - 1;
    const bayW = (width - n * pierW) / gaps;
    const railTopY = y + 5;
    const openY = railTopY + 5;
    const openHeight = Math.max(8, height - 18);

    for (let i = 0; i < n; i++) {
      const px0 = x + i * (pierW + bayW);
      const px1 = i === n - 1 ? x + width : px0 + pierW;
      merlons.push({ x0: px0, x1: px1, topY });
      if (i < gaps) {
        const bx = px1;
        const nextPx = x + (i + 1) * (pierW + bayW);
        bays.push({
          x: bx,
          width: nextPx - bx,
          railTopY,
          openY,
          openHeight
        });
      }
    }

    return { style, baseY, topY, lowY, merlons, notches, pediment, bays };
  }

  const gaps = n - 1;
  const unitW = width / (n + gaps * 1.12);
  const merlonW = unitW;
  const notchW = unitW * 1.12;

  let cx = x;
  for (let i = 0; i < n; i++) {
    const mx0 = cx;
    const mx1 = i === n - 1 ? x + width : cx + merlonW;
    const mw = mx1 - mx0;

    if (style === 'stepped') {
      merlons.push({
        x0: mx0,
        x1: mx1,
        topY,
        shoulderW: mw * 0.24,
        stepY: y + notchDepth * 0.45
      });
    } else if (style === 'arched') {
      const archSpringY = y + Math.min(11, Math.max(6, mw * 0.3));
      const archCtrlY = 2 * topY - archSpringY;
      merlons.push({
        x0: mx0,
        x1: mx1,
        topY,
        archSpringY,
        archCtrlY
      });
    } else {
      merlons.push({ x0: mx0, x1: mx1, topY });
    }

    cx = mx1;
    if (i < n - 1) {
      const nx0 = cx;
      const nx1 = cx + notchW;
      notches.push({ x0: nx0, x1: nx1, lowY });
      cx = nx1;
    }
  }

  return { style, baseY, topY, lowY, merlons, notches, pediment, bays };
}

export function buildBattlementsPath(sec: RoofSection): string {
  const geom = computeBattlementsGeometry(sec);
  const { style, baseY, topY, lowY, merlons, notches, pediment, bays } = geom;
  const { x, width } = sec;

  if (style === 'pediment' && pediment) {
    const half = Math.floor(merlons.length / 2);
    const leftMerlons = merlons.slice(0, half);
    const leftNotches = notches.slice(0, half);
    const rightNotches = notches.slice(half);
    const rightMerlons = merlons.slice(half);

    let d = `M ${r2(x)} ${r2(baseY)} L ${r2(x)} ${r2(leftMerlons[0].topY)}`;
    for (let j = 0; j < leftMerlons.length; j++) {
      const m = leftMerlons[j];
      const nt = leftNotches[j];
      d += ` L ${r2(m.x1)} ${r2(m.topY)} L ${r2(nt.x0)} ${r2(nt.lowY)} L ${r2(nt.x1)} ${r2(nt.lowY)}`;
      if (j < leftMerlons.length - 1) {
        d += ` L ${r2(leftMerlons[j + 1].x0)} ${r2(leftMerlons[j + 1].topY)}`;
      }
    }

    d += ` L ${r2(pediment.leftX)} ${r2(pediment.eaveY)} L ${r2(pediment.midX)} ${r2(pediment.apexY)} L ${r2(pediment.rightX)} ${r2(pediment.eaveY)} L ${r2(pediment.rightX)} ${r2(lowY)}`;

    for (let j = 0; j < rightMerlons.length; j++) {
      const nt = rightNotches[j];
      const m = rightMerlons[j];
      d += ` L ${r2(nt.x1)} ${r2(nt.lowY)} L ${r2(m.x0)} ${r2(m.topY)} L ${r2(m.x1)} ${r2(m.topY)}`;
      if (j < rightMerlons.length - 1) {
        d += ` L ${r2(m.x1)} ${r2(lowY)}`;
      }
    }

    d += ` L ${r2(x + width)} ${r2(baseY)} Z`;
    return d;
  }

  if (style === 'balustrade') {
    let d = `M ${r2(x)} ${r2(baseY)} L ${r2(x)} ${r2(topY)}`;
    for (let i = 0; i < merlons.length; i++) {
      const m = merlons[i];
      d += ` L ${r2(m.x1)} ${r2(topY)}`;
      if (i < bays.length) {
        const bay = bays[i];
        d += ` L ${r2(bay.x)} ${r2(bay.railTopY)} L ${r2(bay.x + bay.width)} ${r2(bay.railTopY)} L ${r2(merlons[i + 1].x0)} ${r2(topY)}`;
      }
    }
    d += ` L ${r2(x + width)} ${r2(baseY)} Z`;
    return d;
  }

  if (style === 'stepped') {
    const firstStepY = merlons[0].stepY ?? topY;
    let d = `M ${r2(x)} ${r2(baseY)} L ${r2(x)} ${r2(firstStepY)}`;
    for (let i = 0; i < merlons.length; i++) {
      const m = merlons[i];
      const sw = m.shoulderW ?? 0;
      const sy = m.stepY ?? topY;
      d += ` L ${r2(m.x0 + sw)} ${r2(sy)} L ${r2(m.x0 + sw)} ${r2(m.topY)} L ${r2(m.x1 - sw)} ${r2(m.topY)} L ${r2(m.x1 - sw)} ${r2(sy)} L ${r2(m.x1)} ${r2(sy)}`;
      if (i < notches.length) {
        const nt = notches[i];
        const nextSy = merlons[i + 1].stepY ?? topY;
        d += ` L ${r2(nt.x0)} ${r2(nt.lowY)} L ${r2(nt.x1)} ${r2(nt.lowY)} L ${r2(nt.x1)} ${r2(nextSy)}`;
      }
    }
    d += ` L ${r2(x + width)} ${r2(baseY)} Z`;
    return d;
  }

  if (style === 'arched') {
    const firstSpring = merlons[0].archSpringY ?? topY;
    let d = `M ${r2(x)} ${r2(baseY)} L ${r2(x)} ${r2(firstSpring)}`;
    for (let i = 0; i < merlons.length; i++) {
      const m = merlons[i];
      const springY = m.archSpringY ?? topY;
      const ctrlY = m.archCtrlY ?? topY;
      const midX = (m.x0 + m.x1) / 2;
      d += ` Q ${r2(midX)} ${r2(ctrlY)} ${r2(m.x1)} ${r2(springY)}`;
      if (i < notches.length) {
        const nt = notches[i];
        const nextSpring = merlons[i + 1].archSpringY ?? topY;
        d += ` L ${r2(nt.x0)} ${r2(nt.lowY)} L ${r2(nt.x1)} ${r2(nt.lowY)} L ${r2(nt.x1)} ${r2(nextSpring)}`;
      }
    }
    d += ` L ${r2(x + width)} ${r2(baseY)} Z`;
    return d;
  }

  // 'classic'
  let d = `M ${r2(x)} ${r2(baseY)} L ${r2(x)} ${r2(topY)}`;
  for (let i = 0; i < merlons.length; i++) {
    const m = merlons[i];
    d += ` L ${r2(m.x1)} ${r2(m.topY)}`;
    if (i < notches.length) {
      const nt = notches[i];
      d += ` L ${r2(nt.x0)} ${r2(nt.lowY)} L ${r2(nt.x1)} ${r2(nt.lowY)} L ${r2(merlons[i + 1].x0)} ${r2(merlons[i + 1].topY)}`;
    }
  }
  d += ` L ${r2(x + width)} ${r2(baseY)} Z`;
  return d;
}
