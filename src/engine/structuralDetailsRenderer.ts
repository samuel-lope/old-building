import type {
  AtticSection,
  BuildingConfig,
  CorniceSection,
  FacadeLayout,
  FacadeSlot,
  GroundSection,
  Rect,
  RoofSection,
  TypicalSection
} from '../types/facade';
import { darkenHex, r2 } from './colorUtils';
import { buildBattlementsPath, computeBattlementsGeometry } from './facadeLayout';

/**
 * Gera <pattern> de textura de parede (tijolos ou blocos de cantaria).
 */
export function renderWallPatternDefs(building: BuildingConfig): string {
  const pal = building.colors;
  const mortar = darkenHex(pal.wallShadow, 0.14);

  if (building.wallPattern === 'bricks_classic' || building.wallPattern === 'bricks_detailed') {
    const shadeA = darkenHex(pal.wall, 0.08);
    const shadeB = darkenHex(pal.wallShadow, 0.05);
    const detailedBricks =
      building.wallPattern === 'bricks_detailed'
        ? `
          <rect x="0.5" y="0.5" width="11" height="6" fill="${shadeA}" opacity="0.45" />
          <rect x="18.5" y="7.5" width="5" height="6" fill="${shadeB}" opacity="0.38" />
        `
        : '';

    return `
      <pattern id="wallBrickPattern" width="24" height="14" patternUnits="userSpaceOnUse">
        ${detailedBricks}
        <line x1="0" y1="7" x2="24" y2="7" stroke="${mortar}" stroke-opacity="0.34" stroke-width="0.9" />
        <line x1="0" y1="14" x2="24" y2="14" stroke="${mortar}" stroke-opacity="0.34" stroke-width="0.9" />
        <line x1="12" y1="0" x2="12" y2="7" stroke="${mortar}" stroke-opacity="0.34" stroke-width="0.9" />
        <line x1="0" y1="7" x2="0" y2="14" stroke="${mortar}" stroke-opacity="0.34" stroke-width="0.9" />
        <line x1="24" y1="7" x2="24" y2="14" stroke="${mortar}" stroke-opacity="0.34" stroke-width="0.9" />
      </pattern>
    `;
  }

  if (building.wallPattern === 'stone_ashlar') {
    const stoneShade = darkenHex(pal.wall, 0.06);
    return `
      <pattern id="wallStonePattern" width="44" height="22" patternUnits="userSpaceOnUse">
        <rect x="0.5" y="0.5" width="21" height="10" fill="${stoneShade}" opacity="0.28" />
        <line x1="0" y1="11" x2="44" y2="11" stroke="${mortar}" stroke-opacity="0.38" stroke-width="1.1" />
        <line x1="0" y1="22" x2="44" y2="22" stroke="${mortar}" stroke-opacity="0.38" stroke-width="1.1" />
        <line x1="22" y1="0" x2="22" y2="11" stroke="${mortar}" stroke-opacity="0.38" stroke-width="1.1" />
        <line x1="11" y1="11" x2="11" y2="22" stroke="${mortar}" stroke-opacity="0.38" stroke-width="1.1" />
        <line x1="33" y1="11" x2="33" y2="22" stroke="${mortar}" stroke-opacity="0.38" stroke-width="1.1" />
      </pattern>
    `;
  }

  return '';
}

function renderPilasterBand(band: Rect, building: BuildingConfig, elStrokeW: number): string {
  const pal = building.colors;
  const colFill = pal.plinthBand || pal.cornice;
  const capFill = pal.corniceFrieze;
  const lineW = r2(Math.max(0.9, elStrokeW * 0.72));
  const capH = 5;
  const baseH = 5;
  const fluteX1 = r2(band.x + band.width * 0.36);
  const fluteX2 = r2(band.x + band.width * 0.64);

  return `
    <g class="pilaster-band">
      <rect x="${band.x}" y="${band.y}" width="${band.width}" height="${band.height}" fill="${colFill}" stroke="${pal.stroke}" stroke-width="${lineW}" />
      ${
        band.width >= 10
          ? `<line x1="${fluteX1}" y1="${r2(band.y + capH + 3)}" x2="${fluteX1}" y2="${r2(band.y + band.height - baseH - 3)}" stroke="${capFill}" stroke-width="1" opacity="0.7" />
             <line x1="${fluteX2}" y1="${r2(band.y + capH + 3)}" x2="${fluteX2}" y2="${r2(band.y + band.height - baseH - 3)}" stroke="${capFill}" stroke-width="1" opacity="0.7" />`
          : ''
      }
      <rect x="${r2(band.x - 1)}" y="${band.y}" width="${r2(band.width + 2)}" height="${capH}" fill="${capFill}" stroke="${pal.stroke}" stroke-width="${lineW}" />
      <rect x="${r2(band.x - 1)}" y="${r2(band.y + band.height - baseH)}" width="${r2(band.width + 2)}" height="${baseH}" fill="${capFill}" stroke="${pal.stroke}" stroke-width="${lineW}" />
    </g>
  `;
}

function renderQuoinsForSection(
  sec: AtticSection | TypicalSection | GroundSection,
  building: BuildingConfig,
  elStrokeW: number
): string {
  if (!building.hasQuoins) return '';
  const pal = building.colors;
  const qFill = pal.plinthBand || pal.cornice;
  const qAlt = pal.corniceFrieze;
  const lineW = r2(Math.max(0.8, elStrokeW * 0.68));
  const blockH = 11;
  const startY = sec.y + sec.shadowBandHeight + 2;
  const endY = sec.y + sec.height - 3;
  const parts: string[] = [`<g class="wall-quoins">`];

  let row = 0;
  for (let y = startY; y + blockH <= endY; y += blockH + 1.5) {
    const w = row % 2 === 0 ? 11 : 7;
    const fill = row % 2 === 0 ? qFill : qAlt;
    parts.push(
      `<rect x="${r2(sec.x + 1)}" y="${r2(y)}" width="${w}" height="${r2(blockH - 1)}" rx="0.8" fill="${fill}" stroke="${pal.stroke}" stroke-width="${lineW}" />`
    );
    parts.push(
      `<rect x="${r2(sec.x + sec.width - w - 1)}" y="${r2(y)}" width="${w}" height="${r2(blockH - 1)}" rx="0.8" fill="${fill}" stroke="${pal.stroke}" stroke-width="${lineW}" />`
    );
    row++;
  }

  parts.push(`</g>`);
  return parts.join('\n');
}

/**
 * Renderiza texturas de tijolo/pedra, blocos aparentes, cunhais e faixas de colunas em cada pavimento.
 */
export function renderFloorWallDetails(
  sec: AtticSection | TypicalSection | GroundSection,
  building: BuildingConfig,
  elStrokeW: number
): string {
  const pal = building.colors;
  const parts: string[] = [];

  if (building.wallPattern === 'bricks_classic' || building.wallPattern === 'bricks_detailed') {
    parts.push(
      `<rect x="${sec.x}" y="${r2(sec.y + sec.shadowBandHeight)}" width="${sec.width}" height="${r2(sec.height - sec.shadowBandHeight)}" fill="url(#wallBrickPattern)" stroke="none" />`
    );

    if (building.wallPattern === 'bricks_detailed') {
      const brickAccent = darkenHex(pal.wall, 0.16);
      const yMid = r2(sec.y + sec.height * 0.42);
      const yLow = r2(sec.y + sec.height * 0.72);
      parts.push(
        `<g class="brick-clusters" fill="${brickAccent}" opacity="0.35" stroke="none">
          <rect x="${r2(sec.x + 16)}" y="${yMid}" width="11" height="5.5" rx="0.5" />
          <rect x="${r2(sec.x + 28)}" y="${yMid}" width="11" height="5.5" rx="0.5" />
          <rect x="${r2(sec.x + 22)}" y="${r2(yMid + 7)}" width="11" height="5.5" rx="0.5" />
          <rect x="${r2(sec.x + sec.width - 34)}" y="${yLow}" width="11" height="5.5" rx="0.5" />
          <rect x="${r2(sec.x + sec.width - 40)}" y="${r2(yLow + 7)}" width="11" height="5.5" rx="0.5" />
        </g>`
      );
    }
  } else if (building.wallPattern === 'stone_ashlar') {
    parts.push(
      `<rect x="${sec.x}" y="${r2(sec.y + sec.shadowBandHeight)}" width="${sec.width}" height="${r2(sec.height - sec.shadowBandHeight)}" fill="url(#wallStonePattern)" stroke="none" />`
    );
  }

  // Faixas de colunas e pilastras
  if (sec.type === 'typical' && sec.centerBand && building.columnBandsMode !== 'all_bays') {
    parts.push(renderPilasterBand(sec.centerBand, building, elStrokeW));
  }
  if ((sec.type === 'typical' || sec.type === 'attic') && sec.columnBands.length > 0) {
    sec.columnBands.forEach((band) => {
      parts.push(renderPilasterBand(band, building, elStrokeW));
    });
  }

  // Cunhais laterais
  parts.push(renderQuoinsForSection(sec, building, elStrokeW));

  return parts.join('\n');
}

/**
 * Renderiza a cobertura com ameias aplicando a textura de parede selecionada,
 * detalhes internos do estilo (balaustrada/óculo) e pingadeira superior em pedra.
 */
export function renderRoofBattlements(
  roof: RoofSection,
  building: BuildingConfig,
  strokeW: number,
  elStrokeW: number
): { defs: string; markup: string } {
  const pal = building.colors;
  const d = buildBattlementsPath(roof);
  const geom = computeBattlementsGeometry(roof);
  const elLineW = r2(Math.max(0.85, elStrokeW * 0.72));
  const copeSw = r2(Math.max(1.0, elStrokeW * 0.78));

  const defs = `<clipPath id="roofBattlementsClip"><path d="${d}" /></clipPath>`;
  const parts: string[] = [
    `<g id="roof-battlements-group" data-battlements-style="${geom.style}">`
  ];

  // 1. Preenchimento base da alvenaria
  parts.push(`<path d="${d}" fill="${pal.wall}" stroke="none" />`);

  // 2. Textura herdada da configuração das paredes da edificação
  if (building.wallPattern === 'bricks_classic' || building.wallPattern === 'bricks_detailed') {
    parts.push(`<path d="${d}" fill="url(#wallBrickPattern)" stroke="none" />`);
    if (building.wallPattern === 'bricks_detailed') {
      const brickAccent = darkenHex(pal.wall, 0.16);
      const yRow1 = r2(roof.y + roof.height * 0.34);
      const yRow2 = r2(roof.y + roof.height * 0.64);
      const brickClusters: string[] = [];
      for (let bx = roof.x + 10; bx + 24 <= roof.x + roof.width - 10; bx += 54) {
        brickClusters.push(
          `<rect x="${r2(bx)}" y="${yRow1}" width="11" height="5.5" rx="0.5" />`,
          `<rect x="${r2(bx + 18)}" y="${yRow2}" width="11" height="5.5" rx="0.5" />`,
          `<rect x="${r2(bx + 6)}" y="${yRow2}" width="11" height="5.5" rx="0.5" />`
        );
      }
      parts.push(
        `<g class="roof-brick-clusters" clip-path="url(#roofBattlementsClip)" fill="${brickAccent}" opacity="0.35" stroke="none">${brickClusters.join('')}</g>`
      );
    }
  } else if (building.wallPattern === 'stone_ashlar') {
    parts.push(`<path d="${d}" fill="url(#wallStonePattern)" stroke="none" />`);
  }

  // 3. Detalhes arquitetônicos internos específicos por estilo
  if (geom.style === 'balustrade' && geom.bays.length > 0) {
    geom.bays.forEach((bay) => {
      const openX = r2(bay.x + 2.5);
      const openW = r2(Math.max(8, bay.width - 5));
      parts.push(
        `<rect class="balustrade-opening" x="${openX}" y="${r2(bay.openY)}" width="${openW}" height="${r2(bay.openHeight)}" rx="1" fill="${pal.wallShadow}" stroke="${pal.stroke}" stroke-width="${elLineW}" />`
      );
      const balStep = 7.5;
      const balW = 3.2;
      for (let bx = openX + 4; bx + balW <= openX + openW - 3.5; bx += balStep) {
        parts.push(
          `<rect x="${r2(bx)}" y="${r2(bay.openY + 0.8)}" width="${balW}" height="${r2(Math.max(4, bay.openHeight - 1.6))}" rx="0.8" fill="${pal.cornice}" stroke="${pal.stroke}" stroke-width="${r2(Math.max(0.7, elLineW * 0.72))}" />`
        );
      }
    });
  } else if (geom.style === 'pediment' && geom.pediment) {
    const ped = geom.pediment;
    parts.push(
      `<g class="pediment-oculus">
        <circle cx="${r2(ped.oculusCx)}" cy="${r2(ped.oculusCy)}" r="7.5" fill="${pal.cornice}" stroke="${pal.stroke}" stroke-width="${elLineW}" />
        <circle cx="${r2(ped.oculusCx)}" cy="${r2(ped.oculusCy)}" r="3.8" fill="${pal.corniceFrieze}" stroke="${pal.stroke}" stroke-width="${r2(Math.max(0.7, elLineW * 0.7))}" />
      </g>`
    );
  }

  // 4. Contorno estrutural principal da cobertura
  parts.push(
    `<path id="roof-battlements" d="${d}" fill="none" stroke="${pal.stroke}" stroke-width="${strokeW}" />`
  );

  // 5. Pingadeira superior em pedra (coping)
  const copingParts: string[] = [`<g class="roof-coping">`];

  if (geom.style === 'stepped') {
    geom.merlons.forEach((m) => {
      const sw = m.shoulderW ?? 0;
      const sy = m.stepY ?? m.topY;
      copingParts.push(
        `<rect x="${r2(m.x0 - 1)}" y="${r2(sy - 1.8)}" width="${r2(sw + 1.5)}" height="3.8" rx="0.6" fill="${pal.cornice}" stroke="${pal.stroke}" stroke-width="${copeSw}" />`,
        `<rect x="${r2(m.x0 + sw - 1.2)}" y="${r2(m.topY - 2.2)}" width="${r2(Math.max(4, m.x1 - m.x0 - sw * 2 + 2.4))}" height="4.2" rx="0.7" fill="${pal.cornice}" stroke="${pal.stroke}" stroke-width="${copeSw}" />`,
        `<rect x="${r2(m.x1 - sw - 0.5)}" y="${r2(sy - 1.8)}" width="${r2(sw + 1.5)}" height="3.8" rx="0.6" fill="${pal.cornice}" stroke="${pal.stroke}" stroke-width="${copeSw}" />`
      );
    });
  } else if (geom.style === 'arched') {
    geom.merlons.forEach((m) => {
      const springY = m.archSpringY ?? m.topY;
      const ctrlY = m.archCtrlY ?? m.topY;
      const midX = (m.x0 + m.x1) / 2;
      const archPath = `M ${r2(m.x0 - 0.5)} ${r2(springY)} Q ${r2(midX)} ${r2(ctrlY)} ${r2(m.x1 + 0.5)} ${r2(springY)}`;
      copingParts.push(
        `<path d="${archPath}" fill="none" stroke="${pal.stroke}" stroke-width="${r2(4.4 + copeSw * 1.4)}" stroke-linecap="round" />`,
        `<path d="${archPath}" fill="none" stroke="${pal.cornice}" stroke-width="3" stroke-linecap="round" />`
      );
    });
  } else if (geom.style === 'balustrade') {
    geom.bays.forEach((bay) => {
      copingParts.push(
        `<rect x="${r2(bay.x - 0.4)}" y="${r2(bay.railTopY - 1.6)}" width="${r2(bay.width + 0.8)}" height="4.2" rx="0.6" fill="${pal.cornice}" stroke="${pal.stroke}" stroke-width="${copeSw}" />`
      );
    });
    geom.merlons.forEach((m) => {
      copingParts.push(
        `<rect x="${r2(m.x0 - 1.5)}" y="${r2(m.topY - 2.2)}" width="${r2(m.x1 - m.x0 + 3)}" height="4.6" rx="0.8" fill="${pal.cornice}" stroke="${pal.stroke}" stroke-width="${copeSw}" />`
      );
    });
  } else {
    geom.merlons.forEach((m) => {
      copingParts.push(
        `<rect x="${r2(m.x0 - 1.2)}" y="${r2(m.topY - 2)}" width="${r2(m.x1 - m.x0 + 2.4)}" height="4.2" rx="0.7" fill="${pal.cornice}" stroke="${pal.stroke}" stroke-width="${copeSw}" />`
      );
    });
  }

  geom.notches.forEach((nt) => {
    copingParts.push(
      `<rect x="${r2(nt.x0 + 0.5)}" y="${r2(nt.lowY - 1.8)}" width="${r2(Math.max(3, nt.x1 - nt.x0 - 1))}" height="3.2" rx="0.5" fill="${pal.cornice}" stroke="${pal.stroke}" stroke-width="${copeSw}" />`
    );
  });

  if (geom.style === 'pediment' && geom.pediment) {
    const ped = geom.pediment;
    const rakePath = `M ${r2(ped.leftX - 2)} ${r2(ped.eaveY + 0.4)} L ${r2(ped.midX)} ${r2(ped.apexY)} L ${r2(ped.rightX + 2)} ${r2(ped.eaveY + 0.4)}`;
    copingParts.push(
      `<path d="${rakePath}" fill="none" stroke="${pal.stroke}" stroke-width="${r2(4.6 + copeSw * 1.4)}" stroke-linejoin="miter" stroke-linecap="round" />`,
      `<path d="${rakePath}" fill="none" stroke="${pal.cornice}" stroke-width="3.2" stroke-linejoin="miter" stroke-linecap="round" />`
    );
  }

  copingParts.push(`</g>`);
  parts.push(copingParts.join('\n'));
  parts.push(`</g>`);

  return { defs, markup: parts.join('\n') };
}

/**
 * Renderiza dentículos ou mísulas clássicas no friso das cornijas (escaláveis com corniceHeight).
 */
export function renderCorniceDetails(
  sec: CorniceSection,
  building: BuildingConfig,
  elStrokeW: number
): string {
  if (building.corniceStyle === 'classic') return '';
  const pal = building.colors;
  const friezeY = sec.y + sec.mainHeight;
  const strokeW = r2(Math.max(0.75, elStrokeW * 0.55));
  const parts: string[] = [`<g class="cornice-ornaments">`];

  if (building.corniceStyle === 'dentils') {
    const dh = r2(Math.max(3, sec.friezeHeight - 3.5));
    const dw = r2(Math.max(4, Math.min(7, sec.friezeHeight * 0.42)));
    const step = r2(dw * 1.9);
    const dy = r2(friezeY + Math.max(1.0, (sec.friezeHeight - dh) / 2));
    for (let x = sec.bodyX + 5; x + dw <= sec.bodyX + sec.bodyWidth - 5; x += step) {
      parts.push(
        `<rect x="${r2(x)}" y="${dy}" width="${dw}" height="${dh}" fill="${pal.cornice}" stroke="${pal.stroke}" stroke-width="${strokeW}" />`
      );
    }
  } else if (building.corniceStyle === 'modillions') {
    const mh = r2(Math.max(5, sec.friezeHeight + 1.5));
    const mw = r2(Math.max(6.5, Math.min(11, sec.friezeHeight * 0.72)));
    const step = r2(Math.max(15, mw * 2.3));
    for (let x = sec.bodyX + 7; x + mw <= sec.bodyX + sec.bodyWidth - 7; x += step) {
      parts.push(
        `<rect x="${r2(x)}" y="${r2(friezeY - 1)}" width="${mw}" height="${mh}" rx="1" fill="${pal.cornice}" stroke="${pal.stroke}" stroke-width="${r2(strokeW * 1.1)}" />`
      );
    }
  }

  parts.push(`</g>`);
  return parts.join('\n');
}

/**
 * Renderiza o elemento opcional 'Jardim' no rodapé da edificação (sob a zona de vitrine).
 */
export function renderFooterGarden(
  layout: FacadeLayout,
  building: BuildingConfig,
  elStrokeW: number
): string {
  if (!building.hasFooterGarden) return '';
  const ground = layout.sections.find((s): s is GroundSection => s.type === 'ground');
  if (!ground) return '';

  const pal = building.colors;
  const lineW = r2(Math.max(0.9, elStrokeW * 0.78));
  const baseY = layout.bounds.bottomY;
  const gx = r2(ground.shopArea.x - 4);
  const gw = r2(Math.max(40, ground.shopArea.width + 8));

  const leafDark = '#29633B';
  const leafMid = '#3F8B54';
  const leafLight = '#63B375';
  const flowerA = '#F3A847';
  const flowerB = '#E06055';
  const ironColor = pal.ironwork || '#262A34';
  const stoneColor = pal.cornice;
  const stoneShadow = pal.corniceFrieze;

  const parts: string[] = [`<g id="exterior-footer-garden" stroke-linejoin="round" stroke-linecap="round">`];

  if (building.gardenStyle === 'iron_rail_hedges') {
    // Sebe verde atrás do gradil
    const bushStep = 14;
    for (let bx = gx + 9; bx <= gx + gw - 9; bx += bushStep) {
      const r = 8.5;
      parts.push(
        `<circle cx="${r2(bx)}" cy="${r2(baseY - 11)}" r="${r}" fill="${leafDark}" stroke="${pal.stroke}" stroke-width="${lineW}" />`
      );
      parts.push(
        `<circle cx="${r2(bx - 1.5)}" cy="${r2(baseY - 12.5)}" r="${r2(r * 0.62)}" fill="${leafMid}" stroke="none" />`
      );
    }
    // Mureta em cantaria
    parts.push(
      `<rect x="${gx}" y="${r2(baseY - 6)}" width="${gw}" height="8" rx="1" fill="${stoneColor}" stroke="${pal.stroke}" stroke-width="${lineW}" />`
    );
    // Gradil de ferro forjado frontal
    const railTopY = r2(baseY - 20);
    const barW = r2(Math.max(1, elStrokeW * 0.62));
    parts.push(
      `<line x1="${gx}" y1="${railTopY}" x2="${r2(gx + gw)}" y2="${railTopY}" stroke="${ironColor}" stroke-width="${r2(barW * 1.4)}" />`
    );
    for (let rx = gx + 4; rx <= gx + gw - 4; rx += 7.5) {
      parts.push(
        `<line x1="${r2(rx)}" y1="${r2(baseY - 6)}" x2="${r2(rx)}" y2="${r2(railTopY - 2)}" stroke="${ironColor}" stroke-width="${barW}" />`
      );
      parts.push(
        `<polygon points="${r2(rx - 1.5)},${r2(railTopY - 1)} ${r2(rx)},${r2(railTopY - 4.5)} ${r2(rx + 1.5)},${r2(railTopY - 1)}" fill="${ironColor}" />`
      );
    }
  } else if (building.gardenStyle === 'planter_box') {
    // Floreira em pedra com arbustos e flores
    const bushStep = 15;
    for (let bx = gx + 10; bx <= gx + gw - 10; bx += bushStep) {
      parts.push(
        `<circle cx="${r2(bx)}" cy="${r2(baseY - 14)}" r="8" fill="${leafDark}" stroke="${pal.stroke}" stroke-width="${lineW}" />`
      );
      parts.push(
        `<circle cx="${r2(bx - 1)}" cy="${r2(baseY - 15.5)}" r="5" fill="${leafLight}" stroke="none" />`
      );
      parts.push(
        `<circle cx="${r2(bx + 2.5)}" cy="${r2(baseY - 14)}" r="1.8" fill="${flowerA}" stroke="${pal.stroke}" stroke-width="0.6" />`
      );
    }
    parts.push(
      `<rect x="${gx}" y="${r2(baseY - 10)}" width="${gw}" height="12" rx="1.2" fill="${stoneColor}" stroke="${pal.stroke}" stroke-width="${lineW}" />`
    );
    parts.push(
      `<rect x="${r2(gx - 2)}" y="${r2(baseY - 11.5)}" width="${r2(gw + 4)}" height="3.5" rx="1" fill="${stoneShadow}" stroke="${pal.stroke}" stroke-width="${lineW}" />`
    );
  } else {
    // flower_bed: canteiro floral denso
    const step = 12;
    for (let bx = gx + 8; bx <= gx + gw - 8; bx += step) {
      parts.push(
        `<circle cx="${r2(bx)}" cy="${r2(baseY - 10)}" r="7.5" fill="${leafMid}" stroke="${pal.stroke}" stroke-width="${lineW}" />`
      );
      const flColor = Math.round(bx) % 2 === 0 ? flowerA : flowerB;
      parts.push(
        `<circle cx="${r2(bx - 2)}" cy="${r2(baseY - 12)}" r="2.2" fill="${flColor}" stroke="${pal.stroke}" stroke-width="0.7" />`
      );
      parts.push(
        `<circle cx="${r2(bx + 2.5)}" cy="${r2(baseY - 9)}" r="1.9" fill="${flowerA}" stroke="${pal.stroke}" stroke-width="0.7" />`
      );
    }
    parts.push(
      `<rect x="${gx}" y="${r2(baseY - 5)}" width="${gw}" height="7" rx="1" fill="${stoneShadow}" stroke="${pal.stroke}" stroke-width="${lineW}" />`
    );
  }

  parts.push(`</g>`);
  return parts.join('\n');
}

/**
 * Renderiza o elemento opcional 'Escada' em todas as portas de entrada (NY Stoop).
 */
export function renderEntranceStairs(
  layout: FacadeLayout,
  building: BuildingConfig,
  elStrokeW: number
): string {
  if (!building.hasEntranceStairs) return '';
  const doorSlots = layout.slots.filter((s): s is FacadeSlot => s.kind === 'door');
  if (doorSlots.length === 0) return '';

  const pal = building.colors;
  const lineW = r2(Math.max(0.9, elStrokeW * 0.8));
  const stepCount = building.entranceStairsStyle === 'wide_steps' ? 3 : 4;
  const stepH = 5.2;
  const stepColor = pal.cornice;
  const riserColor = pal.corniceFrieze;
  const ironColor = pal.ironwork || '#262A34';
  const maxStepExpand = doorSlots.length > 1 ? 2.6 : 4.5;

  const parts: string[] = [`<g id="exterior-entrance-stairs" stroke-linejoin="round" stroke-linecap="round">`];

  doorSlots.forEach((doorSlot) => {
    const topY = doorSlot.y + doorSlot.height - 1;

    for (let i = 0; i < stepCount; i++) {
      const expand =
        building.entranceStairsStyle === 'wide_steps'
          ? (i + 1) * maxStepExpand
          : (i + 1) * 1.2;
      const sx = r2(doorSlot.x - expand);
      const sw = r2(doorSlot.width + expand * 2);
      const sy = r2(topY + i * stepH);
      parts.push(
        `<rect x="${sx}" y="${sy}" width="${sw}" height="${stepH}" rx="0.8" fill="${i % 2 === 0 ? stepColor : riserColor}" stroke="${pal.stroke}" stroke-width="${lineW}" />`
      );
    }

    const totalH = stepCount * stepH;
    const botY = r2(topY + totalH);

    if (building.entranceStairsStyle === 'stoop_classic') {
      const cheekW = 5.5;
      const leftX = r2(doorSlot.x - cheekW - 1);
      const rightX = r2(doorSlot.x + doorSlot.width + 1);
      [leftX, rightX].forEach((cx) => {
        parts.push(
          `<rect x="${cx}" y="${r2(topY - 3)}" width="${cheekW}" height="${r2(totalH + 3)}" rx="1" fill="${riserColor}" stroke="${pal.stroke}" stroke-width="${lineW}" />`
        );
        parts.push(
          `<rect x="${r2(cx - 0.8)}" y="${r2(botY - 12)}" width="${r2(cheekW + 1.6)}" height="12" rx="1" fill="${stepColor}" stroke="${pal.stroke}" stroke-width="${lineW}" />`
        );
      });
    } else if (building.entranceStairsStyle === 'stoop_iron_rail') {
      const barW = r2(Math.max(1.1, elStrokeW * 0.7));
      const leftTopX = r2(doorSlot.x - 1);
      const leftBotX = r2(doorSlot.x - stepCount * 1.2 - 1);
      const rightTopX = r2(doorSlot.x + doorSlot.width + 1);
      const rightBotX = r2(doorSlot.x + doorSlot.width + stepCount * 1.2 + 1);
      const railTopOffset = 18;

      [
        { tx: leftTopX, bx: leftBotX },
        { tx: rightTopX, bx: rightBotX }
      ].forEach(({ tx, bx }) => {
        for (let k = 0; k <= 3; k++) {
          const frac = k / 3;
          const px = r2(tx + (bx - tx) * frac);
          const pyBot = r2(topY + totalH * frac);
          const pyTop = r2(pyBot - railTopOffset);
          parts.push(
            `<line x1="${px}" y1="${pyBot}" x2="${px}" y2="${pyTop}" stroke="${ironColor}" stroke-width="${barW}" />`
          );
        }
        parts.push(
          `<line x1="${tx}" y1="${r2(topY - railTopOffset)}" x2="${bx}" y2="${r2(botY - railTopOffset)}" stroke="${ironColor}" stroke-width="${r2(barW * 1.45)}" />`
        );
        parts.push(
          `<circle cx="${bx}" cy="${r2(botY - railTopOffset)}" r="2.2" fill="${ironColor}" />`
        );
      });
    }
  });

  parts.push(`</g>`);
  return parts.join('\n');
}

/**
 * Renderiza o elemento opcional 'Escada de Incêndio' metálica na fachada (NY Fire Escape).
 */
export function renderFireEscape(
  layout: FacadeLayout,
  building: BuildingConfig,
  elStrokeW: number
): string {
  if (!building.hasFireEscape) return '';

  const pal = building.colors;
  const ironColor = pal.ironwork || '#262A34';
  const strokeW = r2(Math.max(1.1, elStrokeW * 0.72));
  const thinW = r2(Math.max(0.85, elStrokeW * 0.52));

  // Coleta as prumadas disponíveis dos pavimentos tipo (ordenados de cima para baixo)
  const typicalSlots = layout.slots.filter((s) => s.zone === 'typical');
  if (typicalSlots.length === 0) return '';

  const colCount = Math.max(2, building.typicalSlotsCount || 2);
  let targetCol = 0;
  if (building.fireEscapePlacement === 'center') {
    targetCol = Math.floor((colCount - 1) / 2);
  } else if (building.fireEscapePlacement === 'right') {
    targetCol = colCount - 1;
  }

  // Agrupa um slot por pavimento tipo (de cima para baixo em Y)
  const floorSlots = typicalSlots
    .filter((s) => (s.colIndex ?? 0) === targetCol)
    .sort((a, b) => a.y - b.y);

  if (floorSlots.length === 0) return '';

  const parts: string[] = [`<g id="exterior-fire-escape" stroke-linejoin="round" stroke-linecap="round">`];

  const balconies = floorSlots.map((slot) => {
    const balW = r2(slot.width + 20);
    const balX = r2(slot.x - 10);
    const deckY = r2(slot.y + slot.height - 4);
    const railH = 22;
    return { balX, balW, deckY, railH, slot };
  });

  // Escada vertical de acesso à cobertura acima da varanda mais alta
  const topBal = balconies[0];
  const roofTopY = layout.bounds.topY + 12;
  const roofLadX = r2(topBal.balX + 6);
  parts.push(
    `<line x1="${roofLadX}" y1="${roofTopY}" x2="${roofLadX}" y2="${topBal.deckY}" stroke="${ironColor}" stroke-width="${strokeW}" />`
  );
  parts.push(
    `<line x1="${r2(roofLadX + 8)}" y1="${roofTopY}" x2="${r2(roofLadX + 8)}" y2="${topBal.deckY}" stroke="${ironColor}" stroke-width="${strokeW}" />`
  );
  for (let ry = roofTopY + 5; ry < topBal.deckY - 4; ry += 8) {
    parts.push(
      `<line x1="${roofLadX}" y1="${r2(ry)}" x2="${r2(roofLadX + 8)}" y2="${r2(ry)}" stroke="${ironColor}" stroke-width="${thinW}" />`
    );
  }

  // Lances diagonais em ziguezague entre pavimentos
  for (let i = 0; i < balconies.length - 1; i++) {
    const upper = balconies[i];
    const lower = balconies[i + 1];
    const goRight = i % 2 === 0;
    const x1 = r2(goRight ? upper.balX + 12 : upper.balX + upper.balW - 12);
    const y1 = r2(upper.deckY);
    const x2 = r2(goRight ? lower.balX + lower.balW - 10 : lower.balX + 10);
    const y2 = r2(lower.deckY);

    // Longarinas duplas e corrimão
    parts.push(
      `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${ironColor}" stroke-width="${r2(strokeW * 1.25)}" />`
    );
    parts.push(
      `<line x1="${r2(x1 + 5)}" y1="${y1}" x2="${r2(x2 + 5)}" y2="${y2}" stroke="${ironColor}" stroke-width="${r2(strokeW * 1.1)}" />`
    );
    parts.push(
      `<line x1="${x1}" y1="${r2(y1 - 14)}" x2="${x2}" y2="${r2(y2 - 14)}" stroke="${ironColor}" stroke-width="${thinW}" />`
    );

    const steps = 8;
    for (let k = 1; k < steps; k++) {
      const t = k / steps;
      const sx = r2(x1 + (x2 - x1) * t);
      const sy = r2(y1 + (y2 - y1) * t);
      parts.push(
        `<line x1="${sx}" y1="${sy}" x2="${r2(sx + 5)}" y2="${sy}" stroke="${ironColor}" stroke-width="${thinW}" />`
      );
    }
  }

  // Varandas gradeadas e mãos-francesas por andar
  balconies.forEach((b) => {
    // Mãos-francesas triangulares inferiores
    const brLeft = r2(b.balX + 6);
    const brRight = r2(b.balX + b.balW - 6);
    [brLeft, brRight].forEach((bx) => {
      parts.push(
        `<polyline points="${bx},${r2(b.deckY + 4)} ${bx},${r2(b.deckY + 15)} ${r2(bx + (bx === brLeft ? 10 : -10))},${r2(b.deckY + 4)}" fill="none" stroke="${ironColor}" stroke-width="${strokeW}" />`
      );
    });

    // Plataforma treliçada
    parts.push(
      `<rect x="${b.balX}" y="${b.deckY}" width="${b.balW}" height="4.5" fill="${ironColor}" stroke="${pal.stroke}" stroke-width="${r2(thinW * 0.9)}" />`
    );

    // Guarda-corpo frontal
    const railTop = r2(b.deckY - b.railH);
    parts.push(
      `<rect x="${b.balX}" y="${railTop}" width="${b.balW}" height="${b.railH}" fill="none" stroke="${ironColor}" stroke-width="${strokeW}" />`
    );
    parts.push(
      `<line x1="${b.balX}" y1="${r2(railTop + 5)}" x2="${r2(b.balX + b.balW)}" y2="${r2(railTop + 5)}" stroke="${ironColor}" stroke-width="${thinW}" />`
    );
    for (let px = b.balX + 6; px <= b.balX + b.balW - 5; px += 6.5) {
      parts.push(
        `<line x1="${r2(px)}" y1="${railTop}" x2="${r2(px)}" y2="${b.deckY}" stroke="${ironColor}" stroke-width="${thinW}" />`
      );
    }
  });

  // Drop ladder retrátil saindo do 1º pavimento tipo em direção ao térreo
  const lowBal = balconies[balconies.length - 1];
  const dropX = r2(
    building.fireEscapePlacement === 'right' ? lowBal.balX + lowBal.balW - 14 : lowBal.balX + 6
  );
  const dropTop = r2(lowBal.deckY - 12);
  const dropBot = r2(lowBal.deckY + 72);
  parts.push(
    `<line x1="${dropX}" y1="${dropTop}" x2="${dropX}" y2="${dropBot}" stroke="${ironColor}" stroke-width="${strokeW}" />`
  );
  parts.push(
    `<line x1="${r2(dropX + 8)}" y1="${dropTop}" x2="${r2(dropX + 8)}" y2="${dropBot}" stroke="${ironColor}" stroke-width="${strokeW}" />`
  );
    for (let ry = dropTop + 6; ry <= dropBot - 4; ry += 8) {
      parts.push(
        `<line x1="${dropX}" y1="${r2(ry)}" x2="${r2(dropX + 8)}" y2="${r2(ry)}" stroke="${ironColor}" stroke-width="${thinW}" />`
      );
    }

  parts.push(`</g>`);
  return parts.join('\n');
}

/**
 * Renderiza estilos selecionáveis de Embasamento no rodapé do pavimento térreo.
 */
export function renderGroundPlinth(
  sec: GroundSection,
  building: BuildingConfig,
  strokeW: number,
  elStrokeW: number
): string {
  if (!sec.plinth) return '';
  const pl = sec.plinth;
  const pal = building.colors;
  const style = building.plinthStyle || 'classic_panel';
  const baseFill = pal.plinthBand || pal.cornice;
  const trimFill = pal.corniceFrieze;
  const capFill = pal.cornice;
  const lineW = r2(Math.max(0.85, elStrokeW * 0.72));
  const perimW = r2(Math.max(1.0, strokeW * 0.58));
  const capH = 4.5;
  const baseH = 4.0;

  const panelsCount =
    building.groundDoorCount === 2 || building.groundShopMode === 'single' ? 1 : 2;
  const parts: string[] = [`<g id="ground-plinth" data-plinth-style="${style}">`];

  parts.push(
    `<rect x="${pl.x}" y="${pl.y}" width="${pl.width}" height="${pl.height}" fill="${baseFill}" stroke="none" />`
  );

  if (style === 'rusticated_ashlar') {
    const startY = pl.y + capH + 1;
    const availH = pl.height - capH - 2;
    const rowH = availH / 2;
    const usableW = pl.width - 4;
    const cols = Math.max(2, Math.round(usableW / 28));
    const blockW = usableW / cols;

    for (let row = 0; row < 2; row++) {
      const ry = r2(startY + row * rowH);
      const bh = r2(Math.max(5, rowH - 1.5));
      if (row === 0) {
        for (let c = 0; c < cols; c++) {
          const bx = r2(pl.x + 2 + c * blockW);
          const bw = r2(Math.max(6, blockW - 1.5));
          const bFill = c % 2 === 0 ? baseFill : trimFill;
          parts.push(
            `<rect x="${bx}" y="${ry}" width="${bw}" height="${bh}" rx="1" fill="${bFill}" stroke="${pal.stroke}" stroke-width="${lineW}" />`,
            `<rect x="${r2(bx + 2.2)}" y="${r2(ry + 2)}" width="${r2(Math.max(2, bw - 4.4))}" height="${r2(Math.max(2, bh - 4))}" rx="0.5" fill="none" stroke="${darkenHex(trimFill, 0.14)}" stroke-width="${r2(Math.max(0.65, lineW * 0.65))}" />`
          );
        }
      } else {
        const widths = [blockW * 0.5];
        for (let c = 0; c < cols - 1; c++) widths.push(blockW);
        widths.push(blockW * 0.5);
        let curX = pl.x + 2;
        widths.forEach((w, idx) => {
          const bx = r2(curX);
          const bw = r2(Math.max(5, w - 1.5));
          const bFill = idx % 2 === 1 ? baseFill : trimFill;
          parts.push(
            `<rect x="${bx}" y="${ry}" width="${bw}" height="${bh}" rx="1" fill="${bFill}" stroke="${pal.stroke}" stroke-width="${lineW}" />`
          );
          if (bw >= 9) {
            parts.push(
              `<rect x="${r2(bx + 2.2)}" y="${r2(ry + 2)}" width="${r2(bw - 4.4)}" height="${r2(Math.max(2, bh - 4))}" rx="0.5" fill="none" stroke="${darkenHex(trimFill, 0.14)}" stroke-width="${r2(Math.max(0.65, lineW * 0.65))}" />`
            );
          }
          curX += w;
        });
      }
    }
    parts.push(
      `<rect x="${r2(pl.x - 1)}" y="${pl.y}" width="${r2(pl.width + 2)}" height="${capH}" rx="0.7" fill="${capFill}" stroke="${pal.stroke}" stroke-width="${lineW}" />`
    );
  } else if (style === 'molded_wood') {
    const woodTint = darkenHex(baseFill, 0.08);
    const woodDeep = darkenHex(baseFill, 0.17);
    const pilW = 5.5;
    const footH = 5;
    parts.push(
      `<rect x="${pl.x}" y="${pl.y}" width="${pl.width}" height="${pl.height}" fill="${woodTint}" stroke="none" />`,
      `<rect x="${r2(pl.x - 1)}" y="${pl.y}" width="${r2(pl.width + 2)}" height="${capH}" rx="0.6" fill="${capFill}" stroke="${pal.stroke}" stroke-width="${lineW}" />`,
      `<rect x="${pl.x}" y="${r2(pl.y + pl.height - footH)}" width="${pl.width}" height="${footH}" fill="${woodDeep}" stroke="${pal.stroke}" stroke-width="${lineW}" />`
    );
    const innerTop = r2(pl.y + capH + 2.5);
    const innerH = r2(Math.max(8, pl.height - capH - footH - 5));
    const bayCount = panelsCount * 2;
    const bayAreaW = pl.width - pilW * (bayCount + 1) - 4;
    const bayW = bayAreaW / bayCount;

    for (let i = 0; i <= bayCount; i++) {
      const px = r2(pl.x + 2 + i * (bayW + pilW));
      parts.push(
        `<rect x="${px}" y="${r2(pl.y + capH)}" width="${pilW}" height="${r2(pl.height - capH - footH)}" fill="${capFill}" stroke="${pal.stroke}" stroke-width="${r2(lineW * 0.85)}" />`
      );
      if (i < bayCount) {
        const bx = r2(px + pilW + 1.5);
        const bw = r2(Math.max(6, bayW - 3));
        parts.push(
          `<rect x="${bx}" y="${innerTop}" width="${bw}" height="${innerH}" rx="0.8" fill="${woodDeep}" stroke="${pal.stroke}" stroke-width="${lineW}" />`,
          `<rect x="${r2(bx + 2.2)}" y="${r2(innerTop + 2.2)}" width="${r2(Math.max(2, bw - 4.4))}" height="${r2(Math.max(3, innerH - 4.4))}" rx="0.5" fill="${baseFill}" stroke="${pal.stroke}" stroke-width="${r2(lineW * 0.7)}" />`
        );
      }
    }
  } else if (style === 'granite_vented') {
    const graniteFace = darkenHex(trimFill, 0.12);
    const ironColor = pal.ironwork || '#262A34';
    parts.push(
      `<rect x="${pl.x}" y="${r2(pl.y + capH)}" width="${pl.width}" height="${r2(pl.height - capH)}" fill="${graniteFace}" stroke="none" />`,
      `<rect x="${r2(pl.x - 1)}" y="${pl.y}" width="${r2(pl.width + 2)}" height="5" rx="0.6" fill="${capFill}" stroke="${pal.stroke}" stroke-width="${lineW}" />`
    );

    const ventsCount = panelsCount;
    const ventGap = 12;
    const padX = 12;
    const maxBayW = (pl.width - padX * 2 - ventGap * (ventsCount - 1)) / ventsCount;
    const ventW = r2(Math.max(16, Math.min(44, maxBayW * 0.72)));
    const ventH = 14;
    const ventY = r2(pl.y + 5 + (pl.height - 5 - ventH) / 2);

    if (ventsCount === 2) {
      const midJointX = r2(pl.x + pl.width / 2);
      parts.push(
        `<line x1="${midJointX}" y1="${r2(pl.y + 5)}" x2="${midJointX}" y2="${r2(pl.y + pl.height)}" stroke="${pal.stroke}" stroke-width="${r2(lineW * 0.85)}" />`
      );
    }

    for (let i = 0; i < ventsCount; i++) {
      const bayCenter = pl.x + (pl.width * (i + 0.5)) / ventsCount;
      const vx = r2(bayCenter - ventW / 2);
      parts.push(
        `<rect class="plinth-vent-grille" x="${vx}" y="${ventY}" width="${ventW}" height="${ventH}" rx="1" fill="${ironColor}" stroke="${pal.stroke}" stroke-width="${lineW}" />`
      );
      for (let ly = ventY + 3.5; ly <= ventY + ventH - 3; ly += 3.2) {
        parts.push(
          `<line x1="${r2(vx + 2.5)}" y1="${r2(ly)}" x2="${r2(vx + ventW - 2.5)}" y2="${r2(ly)}" stroke="${pal.corniceFrieze}" stroke-width="0.9" />`
        );
      }
    }
  } else {
    // 'classic_panel'
    parts.push(
      `<rect x="${pl.x}" y="${r2(pl.y + pl.height - baseH)}" width="${pl.width}" height="${baseH}" fill="${trimFill}" stroke="${pal.stroke}" stroke-width="${lineW}" />`,
      `<rect x="${r2(pl.x - 1)}" y="${pl.y}" width="${r2(pl.width + 2)}" height="${capH}" rx="0.6" fill="${capFill}" stroke="${pal.stroke}" stroke-width="${lineW}" />`
    );
    const padX = 7;
    const gap = 8;
    const panelW = (pl.width - padX * 2 - gap * (panelsCount - 1)) / panelsCount;
    const panelY = r2(pl.y + capH + 3);
    const panelH = r2(Math.max(8, pl.height - capH - baseH - 6));

    for (let i = 0; i < panelsCount; i++) {
      const px = r2(pl.x + padX + i * (panelW + gap));
      const pw = r2(Math.max(10, panelW));
      parts.push(
        `<rect x="${px}" y="${panelY}" width="${pw}" height="${panelH}" rx="1" fill="${trimFill}" stroke="${pal.stroke}" stroke-width="${lineW}" />`,
        `<rect x="${r2(px + 2.5)}" y="${r2(panelY + 2.5)}" width="${r2(Math.max(4, pw - 5))}" height="${r2(Math.max(4, panelH - 5))}" rx="0.6" fill="${baseFill}" stroke="${pal.stroke}" stroke-width="${r2(lineW * 0.72)}" />`
      );
    }
  }

  parts.push(
    `<rect x="${pl.x}" y="${pl.y}" width="${pl.width}" height="${pl.height}" fill="none" stroke="${pal.stroke}" stroke-width="${perimW}" />`,
    `</g>`
  );
  return parts.join('\n');
}

/**
 * Renderiza o elemento 'Toldo' (Awning) no pavimento térreo logo abaixo da cornija:
 * largura total do térreo ('full'), somente acima da(s) porta(s) ('door_only') ou somente acima da vitrine ('shop_only').
 */
export function renderGroundAwning(
  layout: FacadeLayout,
  building: BuildingConfig,
  elStrokeW: number
): string {
  if (!building.hasAwning) return '';
  const ground = layout.sections.find((s): s is GroundSection => s.type === 'ground');
  if (!ground) return '';

  const pal = building.colors;
  const placement = building.awningPlacement || 'shop_only';
  const style = building.awningStyle || 'striped_classic';
  const awningColor = pal.awning || '#A63A2B';
  const stripeAlt = '#FAF5E8';
  const awningDark = darkenHex(awningColor, 0.22);
  const ironColor = pal.ironwork || '#262A34';
  const lineW = r2(Math.max(0.95, elStrokeW * 0.78));
  const thinW = r2(Math.max(0.75, elStrokeW * 0.55));

  const topY = r2(ground.y + 1);
  const slopeH = 17;
  const valanceH = 6;
  const frontY = r2(topY + slopeH);

  let spans: Array<{ id: string; x: number; width: number }> = [];
  if (placement === 'full') {
    spans = [{ id: 'awning-full', x: r2(ground.x - 4), width: r2(ground.width + 8) }];
  } else if (placement === 'door_only') {
    spans = ground.doorAreas.map((d, idx) => ({
      id: `awning-door-${idx + 1}`,
      x: r2(d.x - 4),
      width: r2(d.width + 8)
    }));
  } else {
    spans = [
      { id: 'awning-shop', x: r2(ground.shopArea.x - 4), width: r2(ground.shopArea.width + 8) }
    ];
  }

  if (spans.length === 0) return '';

  const parts: string[] = [
    `<g id="exterior-ground-awning" data-awning-placement="${placement}" data-awning-style="${style}" stroke-linejoin="round" stroke-linecap="round">`
  ];

  spans.forEach((span) => {
    const outX = 4;
    const topLeft = span.x;
    const topRight = span.x + span.width;
    const frontLeft = span.x - outX;
    const frontRight = span.x + span.width + outX;
    const frontWidth = frontRight - frontLeft;

    parts.push(
      `<g class="awning-unit" data-awning-id="${span.id}" data-top-y="${topY}" data-width="${span.width}">`
    );

    // Sombra projetada sobre a fachada abaixo do toldo
    parts.push(
      `<polygon points="${r2(frontLeft + 2)},${r2(frontY + valanceH)} ${r2(frontRight - 2)},${r2(frontY + valanceH)} ${r2(topRight - 1)},${r2(frontY + valanceH + 5)} ${r2(topLeft + 1)},${r2(frontY + valanceH + 5)}" fill="#0E0F12" fill-opacity="0.22" stroke="none" />`
    );

    if (style === 'arched_canopy') {
      const archSpringY = r2(topY + 11);
      const archCtrlY = r2(topY - 7);
      const midX = r2((topLeft + topRight) / 2);
      const canopyBody = `M ${r2(frontLeft)} ${frontY} L ${r2(topLeft)} ${archSpringY} Q ${midX} ${archCtrlY} ${r2(topRight)} ${archSpringY} L ${r2(frontRight)} ${frontY} Z`;

      parts.push(
        `<path d="${canopyBody}" fill="${awningColor}" stroke="${pal.stroke}" stroke-width="${lineW}" />`
      );

      // Nervuras curvas metálicas da marquise
      [0.25, 0.5, 0.75].forEach((t) => {
        const fx = r2(frontLeft + frontWidth * t);
        const tx = r2(topLeft + span.width * t);
        const archOffset = Math.sin(t * Math.PI) * 9;
        const ty = r2(archSpringY - archOffset);
        parts.push(
          `<line x1="${tx}" y1="${ty}" x2="${fx}" y2="${frontY}" stroke="${awningDark}" stroke-width="${thinW}" />`
        );
      });

      // Saia frontal curva/reta com friso e medalhão central
      parts.push(
        `<rect x="${r2(frontLeft)}" y="${frontY}" width="${r2(frontWidth)}" height="${valanceH}" rx="1.2" fill="${awningDark}" stroke="${pal.stroke}" stroke-width="${lineW}" />`,
        `<line x1="${r2(frontLeft + 3)}" y1="${r2(frontY + 2)}" x2="${r2(frontRight - 3)}" y2="${r2(frontY + 2)}" stroke="${pal.cornice}" stroke-width="1.2" />`,
        `<rect x="${r2(midX - 11)}" y="${r2(frontY + 0.8)}" width="22" height="${r2(valanceH - 1.6)}" rx="1" fill="${pal.cornice}" stroke="${pal.stroke}" stroke-width="${thinW}" />`
      );
    } else if (style === 'solid_valance') {
      // Barra de fixação superior
      parts.push(
        `<rect x="${r2(topLeft)}" y="${topY}" width="${r2(span.width)}" height="3.2" fill="${ironColor}" stroke="${pal.stroke}" stroke-width="${thinW}" />`,
        `<polygon points="${r2(topLeft)},${r2(topY + 3)} ${r2(topRight)},${r2(topY + 3)} ${r2(frontRight)},${frontY} ${r2(frontLeft)},${frontY}" fill="${awningColor}" stroke="${pal.stroke}" stroke-width="${lineW}" />`
      );

      const seamCount = Math.max(3, Math.round(span.width / 26));
      for (let s = 1; s < seamCount; s++) {
        const frac = s / seamCount;
        const sx1 = r2(topLeft + span.width * frac);
        const sx2 = r2(frontLeft + frontWidth * frac);
        parts.push(
          `<line x1="${sx1}" y1="${r2(topY + 3)}" x2="${sx2}" y2="${frontY}" stroke="${awningDark}" stroke-width="${thinW}" />`
        );
      }

      // Saia frontal sólida c/ faixa contrastante
      parts.push(
        `<rect x="${r2(frontLeft)}" y="${frontY}" width="${r2(frontWidth)}" height="${valanceH}" rx="0.6" fill="${awningDark}" stroke="${pal.stroke}" stroke-width="${lineW}" />`,
        `<line x1="${r2(frontLeft + 2)}" y1="${r2(frontY + valanceH - 2)}" x2="${r2(frontRight - 2)}" y2="${r2(frontY + valanceH - 2)}" stroke="${pal.cornice}" stroke-width="1.4" />`
      );
    } else {
      // 'striped_classic'
      parts.push(
        `<rect x="${r2(topLeft)}" y="${topY}" width="${r2(span.width)}" height="3.2" fill="${ironColor}" stroke="${pal.stroke}" stroke-width="${thinW}" />`
      );

      let stripeCount = Math.max(5, Math.round(span.width / 11));
      if (stripeCount % 2 === 0) stripeCount += 1;

      for (let k = 0; k < stripeCount; k++) {
        const t0 = k / stripeCount;
        const t1 = (k + 1) / stripeCount;
        const xTop0 = r2(topLeft + span.width * t0);
        const xTop1 = r2(topLeft + span.width * t1);
        const xBot0 = r2(frontLeft + frontWidth * t0);
        const xBot1 = r2(frontLeft + frontWidth * t1);
        const fill = k % 2 === 0 ? awningColor : stripeAlt;

        parts.push(
          `<polygon points="${xTop0},${r2(topY + 3)} ${xTop1},${r2(topY + 3)} ${xBot1},${frontY} ${xBot0},${frontY}" fill="${fill}" stroke="${pal.stroke}" stroke-width="${r2(thinW * 0.85)}" />`
        );
      }

      // Saia ondulada (scalloped valance)
      parts.push(`<g class="awning-valance-scalloped">`);
      for (let k = 0; k < stripeCount; k++) {
        const t0 = k / stripeCount;
        const t1 = (k + 1) / stripeCount;
        const vx0 = r2(frontLeft + frontWidth * t0);
        const vx1 = r2(frontLeft + frontWidth * t1);
        const vMid = r2((vx0 + vx1) / 2);
        const fill = k % 2 === 0 ? awningColor : stripeAlt;
        const scD = `M ${vx0} ${frontY} L ${vx1} ${frontY} L ${vx1} ${r2(frontY + valanceH - 2.2)} Q ${vMid} ${r2(frontY + valanceH + 1.8)} ${vx0} ${r2(frontY + valanceH - 2.2)} Z`;
        parts.push(
          `<path d="${scD}" fill="${fill}" stroke="${pal.stroke}" stroke-width="${r2(thinW * 0.9)}" />`
        );
      }
      parts.push(`</g>`);
    }

    // Braços metálicos de sustentação nas extremidades
    [
      { top: topLeft + 1, front: frontLeft + 2 },
      { top: topRight - 1, front: frontRight - 2 }
    ].forEach(({ top, front }) => {
      parts.push(
        `<line x1="${r2(top)}" y1="${r2(frontY + 4)}" x2="${r2(front)}" y2="${frontY}" stroke="${ironColor}" stroke-width="${lineW}" />`
      );
    });

    parts.push(`</g>`);
  });

  parts.push(`</g>`);
  return parts.join('\n');
}
