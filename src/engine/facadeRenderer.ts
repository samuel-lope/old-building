import type { DoorModule, FacadeLayout, FacadeState, WindowModule } from '../types/facade';
import { escapeXml, r2 } from './colorUtils';
import { renderDoorModule } from './doorRenderer';
import {
  renderCorniceDetails,
  renderEntranceStairs,
  renderFireEscape,
  renderFloorWallDetails,
  renderFooterGarden,
  renderGroundAwning,
  renderGroundPlinth,
  renderRoofBattlements,
  renderWallPatternDefs
} from './structuralDetailsRenderer';
import { renderWindowModule } from './windowRenderer';

export interface RenderFacadeOptions {
  cleanExport?: boolean;
}

export function resolveModuleById(windowLibrary: WindowModule[], id: string): WindowModule {
  return windowLibrary.find((m) => m.id === id) || windowLibrary[0];
}

export function resolveDoorModuleById(doorLibrary: DoorModule[], id: string): DoorModule {
  return doorLibrary.find((d) => d.id === id) || doorLibrary[0];
}

export function renderFacadeSVG(
  layout: FacadeLayout,
  state: FacadeState,
  options: RenderFacadeOptions = {}
): string {
  const isExport = Boolean(options.cleanExport);
  const showGuides = !isExport && state.ui.showSlotGuides;
  const showDims = !isExport && state.ui.showDimensions;
  const selectedId = !isExport ? state.ui.selectedSlotId : null;

  const pal = state.building.colors;
  const sw = layout.strokeWidth;
  const elSw = layout.elementStrokeWidth;
  const { width: vbW, height: vbH } = layout.viewBox;

  const defsArr: string[] = [];
  const bodyParts: string[] = [];

  defsArr.push(`
    <pattern id="techHatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <line x1="0" y1="0" x2="0" y2="8" stroke="${pal.stroke}" stroke-opacity="0.16" stroke-width="1.5" />
    </pattern>
  `);
  const wallPatDef = renderWallPatternDefs(state.building);
  if (wallPatDef) defsArr.push(wallPatDef);

  // CAMADA 1: ESTRUTURA BASE, TEXTURAS, CUNHAIS, COLUNAS E CORNIJAS
  bodyParts.push(
    `<g id="layer-structure" stroke="${pal.stroke}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round">`
  );

  layout.sections.forEach((sec) => {
    if (sec.type === 'attic' || sec.type === 'typical' || sec.type === 'ground') {
      bodyParts.push(`<g id="${sec.id}">`);
      bodyParts.push(
        `<rect x="${sec.x}" y="${sec.y}" width="${sec.width}" height="${sec.height}" fill="${pal.wall}" stroke="none" />`
      );
      bodyParts.push(
        `<rect x="${sec.x}" y="${sec.y}" width="${sec.width}" height="${sec.shadowBandHeight}" fill="${pal.wallShadow}" stroke="none" />`
      );

      // Texturas de tijolos/blocos, cunhais e faixas de colunas
      bodyParts.push(renderFloorWallDetails(sec, state.building, elSw));

      if (sec.type === 'ground' && sec.plinth) {
        bodyParts.push(renderGroundPlinth(sec, state.building, sw, elSw));
      }

      bodyParts.push(
        `<rect x="${sec.x}" y="${sec.y}" width="${sec.width}" height="${sec.height}" fill="none" stroke="${pal.stroke}" stroke-width="${sw}" />`
      );
      bodyParts.push(`</g>`);
    }
  });

  const roof = layout.sections.find((s) => s.type === 'roof_battlements');
  if (roof && roof.type === 'roof_battlements') {
    const renderedRoof = renderRoofBattlements(roof, state.building, sw, elSw);
    if (renderedRoof.defs) defsArr.push(renderedRoof.defs);
    bodyParts.push(renderedRoof.markup);
  }

  const corniceRx = state.building.corniceFlush ? 0 : 3;
  layout.sections.forEach((sec) => {
    if (sec.type === 'cornice') {
      const friezeY = sec.y + sec.mainHeight;
      bodyParts.push(`
        <g id="${sec.id}">
          <rect x="${sec.bodyX}" y="${friezeY}" width="${sec.bodyWidth}" height="${sec.friezeHeight}" fill="${pal.corniceFrieze}" stroke="${pal.stroke}" stroke-width="${sw}" />
          ${renderCorniceDetails(sec, state.building, elSw)}
          <rect x="${sec.x}" y="${sec.y}" width="${sec.width}" height="${sec.mainHeight}" rx="${corniceRx}" ry="${corniceRx}" fill="${pal.cornice}" stroke="${pal.stroke}" stroke-width="${sw}" />
        </g>
      `);
    }
  });

  bodyParts.push(`</g>`);

  // CAMADA 2: MÓDULOS DE JANELA & PORTA INTERPOLADOS
  bodyParts.push(`<g id="layer-modules">`);

  layout.slots.forEach((slot, idx) => {
    if (slot.kind === 'window' && slot.zone !== 'door') {
      const overrideModId = state.slotOverrides[slot.id];
      const zoneModId = state.slotAssignments[slot.zone];
      const mod = resolveModuleById(state.windowLibrary, overrideModId || zoneModId);
      const fillSlot = slot.zone === 'ground' && state.building.shopFitMode === 'fill';
      const rendered = renderWindowModule(slot, mod, pal, `s${idx}`, {
        fillSlot,
        elementStrokeWidth: elSw
      });
      defsArr.push(rendered.defs);
      bodyParts.push(`<g id="slot-render-${slot.id}">${rendered.markup}</g>`);
    } else if (slot.kind === 'door') {
      const overrideDoorId = state.slotOverrides[slot.id];
      const zoneDoorId = state.slotAssignments.door;
      const doorMod = resolveDoorModuleById(state.doorLibrary, overrideDoorId || zoneDoorId);

      if (state.ui.showDoorSketch || isExport) {
        const rendered = renderDoorModule(slot, doorMod, pal, `d${idx}`, {
          elementStrokeWidth: elSw
        });
        defsArr.push(rendered.defs);
        bodyParts.push(`<g id="slot-render-${slot.id}">${rendered.markup}</g>`);
      } else {
        const cx = r2(slot.x + slot.width / 2);
        const cy = r2(slot.y + slot.height / 2);
        bodyParts.push(`
          <g id="door-placeholder">
            <rect x="${slot.x}" y="${slot.y}" width="${slot.width}" height="${slot.height}" rx="2" fill="#FFFFFF" fill-opacity="0.18" />
            <rect x="${slot.x}" y="${slot.y}" width="${slot.width}" height="${slot.height}" rx="2" fill="url(#techHatch)" stroke="${pal.stroke}" stroke-width="2" stroke-dasharray="5 3" />
            <rect x="${r2(cx - 26)}" y="${r2(cy - 14)}" width="52" height="28" rx="2" fill="${pal.stroke}" fill-opacity="0.9" />
            <text x="${cx}" y="${r2(cy - 2)}" text-anchor="middle" fill="#FAF5E8" font-family="monospace" font-size="8" font-weight="700">PORTA</text>
            <text x="${cx}" y="${r2(cy + 9)}" text-anchor="middle" fill="#F3A847" font-family="monospace" font-size="6.8">(Oculta)</text>
          </g>
        `);
      }
    }
  });

  bodyParts.push(`</g>`);

  // CAMADA 3: ELEMENTOS EXTERNOS (TOLDO, JARDIM, ESCADA DE ENTRADA, ESCADA DE INCÊNDIO)
  bodyParts.push(`<g id="layer-exterior-elements">`);
  bodyParts.push(renderFooterGarden(layout, state.building, elSw));
  bodyParts.push(renderEntranceStairs(layout, state.building, elSw));
  bodyParts.push(renderGroundAwning(layout, state.building, elSw));
  bodyParts.push(renderFireEscape(layout, state.building, elSw));
  bodyParts.push(`</g>`);

  // CAMADA 4: GUIAS DE SLOTS & HITBOXES INTERATIVAS (NÃO EXPORTADAS)
  if (!isExport) {
    bodyParts.push(`<g id="layer-interaction">`);

    layout.slots.forEach((slot) => {
      const isSelected = slot.id === selectedId;
      const hasOverride = Boolean(state.slotOverrides[slot.id]);
      const modName =
        slot.kind === 'door'
          ? resolveDoorModuleById(
              state.doorLibrary,
              state.slotOverrides[slot.id] || state.slotAssignments.door
            ).name
          : resolveModuleById(
              state.windowLibrary,
              state.slotOverrides[slot.id] ||
                (slot.zone !== 'door' ? state.slotAssignments[slot.zone] : '')
            ).name;

      if (showGuides) {
        bodyParts.push(
          `<rect x="${slot.x}" y="${slot.y}" width="${slot.width}" height="${slot.height}" fill="none" stroke="${hasOverride ? '#F3A847' : '#FFFFFF'}" stroke-opacity="0.7" stroke-width="1.2" stroke-dasharray="4 3" pointer-events="none" />`
        );
        bodyParts.push(
          `<rect x="${slot.x}" y="${r2(slot.y - 11)}" width="${Math.min(slot.width, 64)}" height="11" rx="1.5" fill="#101217" fill-opacity="0.88" pointer-events="none" />`
        );
        bodyParts.push(
          `<text x="${r2(slot.x + 3)}" y="${r2(slot.y - 3)}" fill="${hasOverride ? '#F3A847' : '#E8EBF0'}" font-family="monospace" font-size="6.5" pointer-events="none">${slot.id}</text>`
        );
      }

      if (isSelected) {
        bodyParts.push(
          `<rect x="${r2(slot.x - 4)}" y="${r2(slot.y - 4)}" width="${r2(slot.width + 8)}" height="${r2(slot.height + 8)}" rx="3" fill="rgba(243,168,71,0.12)" stroke="#F3A847" stroke-width="2.4" stroke-dasharray="5 3" pointer-events="none" />`
        );
      }

      bodyParts.push(
        `<rect class="slot-hitbox" data-slot-id="${slot.id}" data-slot-zone="${slot.zone}" data-slot-label="${escapeXml(slot.label)}" data-slot-dims="${Math.round(slot.width)}×${Math.round(slot.height)}px" data-mod-name="${escapeXml(modName)}" data-override="${hasOverride ? '1' : '0'}" x="${r2(slot.x - 2)}" y="${r2(slot.y - 2)}" width="${r2(slot.width + 4)}" height="${r2(slot.height + 4)}" fill="transparent" stroke="transparent" />`
      );
    });

    bodyParts.push(`</g>`);
  }

  // CAMADA 5: COTAS E NÍVEIS ARQUITETÔNICOS
  if (showDims) {
    const { bodyX, corniceX, topY, bottomY } = layout.bounds;
    const dimStroke = '#6E7687';
    const accent = '#F3A847';
    const leftAxis = corniceX - 18;
    const topAxis = topY - 18;
    const rightAxis = corniceX + layout.corniceWidth + 16;
    const midY = r2((topY + bottomY) / 2);

    bodyParts.push(`<g id="layer-dimensions" font-family="monospace">`);
    bodyParts.push(`
      <line x1="${bodyX}" y1="${topAxis}" x2="${bodyX + layout.bodyWidth}" y2="${topAxis}" stroke="${dimStroke}" stroke-width="1" />
      <line x1="${bodyX}" y1="${topAxis - 4}" x2="${bodyX}" y2="${topY - 5}" stroke="${dimStroke}" stroke-width="1" stroke-dasharray="2 2" />
      <line x1="${bodyX + layout.bodyWidth}" y1="${topAxis - 4}" x2="${bodyX + layout.bodyWidth}" y2="${topY - 5}" stroke="${dimStroke}" stroke-width="1" stroke-dasharray="2 2" />
      <circle cx="${bodyX}" cy="${topAxis}" r="2" fill="${accent}" />
      <circle cx="${bodyX + layout.bodyWidth}" cy="${topAxis}" r="2" fill="${accent}" />
      <rect x="${r2(bodyX + layout.bodyWidth / 2 - 26)}" y="${topAxis - 8}" width="52" height="15" rx="2" fill="#14161B" stroke="#262932" stroke-width="1" />
      <text x="${r2(bodyX + layout.bodyWidth / 2)}" y="${topAxis + 2.5}" text-anchor="middle" fill="${accent}" font-size="8.5" font-weight="600">L:${layout.bodyWidth}u</text>
    `);

    bodyParts.push(
      `<line x1="${leftAxis}" y1="${topY}" x2="${leftAxis}" y2="${bottomY}" stroke="${dimStroke}" stroke-width="1" stroke-dasharray="3 3" />`
    );
    layout.levels.forEach((lvl) => {
      bodyParts.push(`
        <line x1="${leftAxis - 4}" y1="${lvl.y}" x2="${corniceX - 4}" y2="${lvl.y}" stroke="${dimStroke}" stroke-width="1" />
        <circle cx="${leftAxis}" cy="${lvl.y}" r="1.8" fill="${accent}" />
        <text x="${leftAxis - 7}" y="${r2(lvl.y + 3)}" text-anchor="end" fill="#B8C0CE" font-size="8">${lvl.label}</text>
      `);
    });

    bodyParts.push(`
      <line x1="${rightAxis}" y1="${topY}" x2="${rightAxis}" y2="${bottomY}" stroke="${dimStroke}" stroke-width="1" />
      <line x1="${rightAxis - 4}" y1="${topY}" x2="${rightAxis + 4}" y2="${topY}" stroke="${dimStroke}" stroke-width="1" />
      <line x1="${rightAxis - 4}" y1="${bottomY}" x2="${rightAxis + 4}" y2="${bottomY}" stroke="${dimStroke}" stroke-width="1" />
      <text x="${rightAxis + 8}" y="${midY}" text-anchor="middle" fill="${accent}" font-size="8.5" font-weight="600" transform="rotate(90 ${rightAxis + 8} ${midY})">H:${layout.totalHeight}u</text>
    `);
    bodyParts.push(`</g>`);
  }

  return `
    <svg id="${isExport ? 'nyFacadeExport' : 'facadeSvg'}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${vbW} ${vbH}" width="${vbW}" height="${vbH}" style="max-width:100%; height:auto; filter:drop-shadow(0 18px 34px rgba(0,0,0,0.45));">
      <defs>${defsArr.join('\n')}</defs>
      ${bodyParts.join('\n')}
    </svg>
  `;
}
