import type {
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
  const CORNICE_OVERHANG = 10;
  const CORNICE_MAIN_H = 26;
  const CORNICE_FRIEZE_H = 12;
  const CORNICE_TOTAL_H = CORNICE_MAIN_H + CORNICE_FRIEZE_H;
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
    battlementsCount: building.battlementsCount
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

export function buildBattlementsPath(sec: RoofSection): string {
  const { x, y, width, height, notchDepth, battlementsCount } = sec;
  const n = battlementsCount;
  const gaps = n - 1;
  const unitW = width / (n + gaps * 1.12);
  const merlonW = unitW;
  const notchW = unitW * 1.12;
  const baseY = y + height;
  const topY = y;
  const lowY = y + notchDepth;

  let d = `M ${r2(x)} ${r2(baseY)} L ${r2(x)} ${r2(topY)}`;
  let cx = x;
  for (let i = 0; i < n; i++) {
    cx += merlonW;
    if (i === n - 1) cx = x + width;
    d += ` L ${r2(cx)} ${r2(topY)}`;
    if (i < n - 1) {
      d += ` L ${r2(cx)} ${r2(lowY)}`;
      cx += notchW;
      d += ` L ${r2(cx)} ${r2(lowY)}`;
      d += ` L ${r2(cx)} ${r2(topY)}`;
    }
  }
  d += ` L ${r2(x + width)} ${r2(baseY)} Z`;
  return d;
}
