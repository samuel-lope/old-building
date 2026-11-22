import { describe, expect, it } from 'vitest';
import { createDefaultState } from '../../constants/defaults';
import { FEATURE_DOCS } from '../../constants/featureDocs';
import { renderDoorModule } from '../doorRenderer';
import { computeFacadeLayout } from '../facadeLayout';
import { renderFacadeSVG } from '../facadeRenderer';
import { renderWindowModule } from '../windowRenderer';

describe('Motor Procedural NY Facade Studio (Etapa 2.4)', () => {
  it('calcula layout padrão com porta ocupando exatamente 1/3 da largura útil do térreo', () => {
    const state = createDefaultState();
    const layout = computeFacadeLayout(state.building, true);

    expect(layout.bodyWidth).toBe(280);
    expect(layout.corniceWidth).toBe(300);
    expect(layout.slots.filter((s) => s.zone === 'attic')).toHaveLength(3);
    expect(layout.slots.filter((s) => s.zone === 'typical')).toHaveLength(6);
    expect(layout.slots.filter((s) => s.zone === 'ground')).toHaveLength(2);

    const doorSlots = layout.slots.filter((s) => s.kind === 'door');
    expect(doorSlots).toHaveLength(1);
    expect(doorSlots[0].id).toBe('TERREO_PORTA');
    // usableGroundW = 280 - 36 = 244; (244 - 14) / 3 = 76.67; altura total até a cornija = 156
    expect(doorSlots[0].width).toBeCloseTo(76.67, 1);
    expect(doorSlots[0].height).toBe(156);
  });

  it('permite porta alcançar exatamente o limite inferior da cornija sem ultrapassá-la', () => {
    const state = createDefaultState();
    const layout = computeFacadeLayout(state.building, false);
    const doorSlot = layout.slots.find((s) => s.id === 'TERREO_PORTA')!;
    const cleanDoor = {
      ...state.doorLibrary[0],
      heightPct: 100,
      topDetail: 'none' as const
    };
    const ornamentDoor = {
      ...state.doorLibrary[2],
      heightPct: 100,
      topDetail: 'pediment' as const,
      detailScale: 1.0
    };

    const cleanRes = renderDoorModule(doorSlot, cleanDoor, state.building.colors, 'c1');
    expect(cleanRes.markup).toContain(`y="${doorSlot.y}"`);
    expect(cleanRes.markup).toContain(`height="${doorSlot.height}"`);

    const ornRes = renderDoorModule(doorSlot, ornamentDoor, state.building.colors, 'c2');
    // Com frontão (17u), a moldura começa em doorSlot.y + 17 para o pico tocar doorSlot.y (cornija)
    expect(ornRes.markup).toContain(`y="${doorSlot.y + 17}"`);
  });

  it('suporta 2 portas + 1 vitrine (1/3 + 1/3 + 1/3) nos arranjos left, split e right', () => {
    const state = createDefaultState();
    state.building.bodyWidth = 360;
    state.building.groundDoorCount = 2;
    state.building.hasEntranceStairs = true;

    (['left', 'split', 'right'] as const).forEach((side) => {
      state.building.doorSide = side;
      const layout = computeFacadeLayout(state.building, false);
      const doors = layout.slots.filter((s) => s.kind === 'door').sort((a, b) => a.x - b.x);
      const shops = layout.slots.filter((s) => s.zone === 'ground');

      expect(doors).toHaveLength(2);
      expect(shops).toHaveLength(1);
      expect(shops[0].id).toBe('gf-shop-single');
      expect(doors[0].width).toBeCloseTo(shops[0].width, 1);
      expect(doors[1].width).toBeCloseTo(shops[0].width, 1);

      if (side === 'split') {
        expect(doors[0].x).toBeLessThan(shops[0].x);
        expect(shops[0].x).toBeLessThan(doors[1].x);
      } else if (side === 'left') {
        expect(doors[1].x).toBeLessThan(shops[0].x);
      } else {
        expect(shops[0].x).toBeLessThan(doors[0].x);
      }
    });
  });

  it('suporta 6 janelas por pavimento tipo com faixas de colunas entre vãos sem sobreposição', () => {
    const state = createDefaultState();
    state.building.bodyWidth = 480;
    state.building.typicalFloors = 1;
    state.building.typicalSlotsCount = 6;
    state.building.columnBandsMode = 'all_bays';

    const layout = computeFacadeLayout(state.building, false);
    const typicalSlots = layout.slots
      .filter((s) => s.zone === 'typical')
      .sort((a, b) => a.x - b.x);
    expect(typicalSlots).toHaveLength(6);
    expect(layout.slots.filter((s) => s.zone === 'attic')).toHaveLength(6);

    for (let i = 0; i < typicalSlots.length - 1; i++) {
      expect(typicalSlots[i].x + typicalSlots[i].width).toBeLessThan(typicalSlots[i + 1].x);
    }
  });

  it('alterna corretamente para 1 vitrine ampla no térreo', () => {
    const state = createDefaultState();
    state.building.groundShopMode = 'single';
    const layout = computeFacadeLayout(state.building, false);

    const groundSlots = layout.slots.filter((s) => s.zone === 'ground');
    expect(groundSlots).toHaveLength(1);
    expect(groundSlots[0].id).toBe('gf-shop-single');
  });

  it('renderiza módulo de janela com clipPath por folha e espessura configurável', () => {
    const state = createDefaultState();
    const mod = state.windowLibrary.find((m) => m.id === 'win-tall-2x4-verga')!;
    const res = renderWindowModule(
      { x: 10, y: 10, width: 80, height: 100 },
      mod,
      state.building.colors,
      'test',
      { elementStrokeWidth: 3.5 }
    );

    expect(res.defs).toContain('clip-test-0-0');
    expect(res.defs).toContain('clip-test-3-1');
    expect(res.markup).toContain('stroke-width="3.5"');
  });

  it('renderiza todos os modelos de porta dentro do limite de 1/3 incluindo sidelight duplo e placa de numeração', () => {
    const state = createDefaultState();
    const shopDoor = state.doorLibrary.find((d) => d.id === 'door-shop-transom')!;
    const doubleDoor = state.doorLibrary.find((d) => d.id === 'door-double-grand')!;
    const sidelightDoor = {
      ...state.doorLibrary.find((d) => d.id === 'door-sidelight-modern')!,
      sidelightSide: 'both' as const
    };

    const shopRes = renderDoorModule(
      { x: 10, y: 20, width: 90, height: 108 },
      shopDoor,
      state.building.colors,
      'd1'
    );
    expect(shopRes.markup).toContain('data-door-module="door-shop-transom"');
    expect(shopRes.markup).toContain('>241</text>');
    expect(shopRes.defs).toContain('dclip-d1-tr-0-0');

    const doubleRes = renderDoorModule(
      { x: 10, y: 20, width: 96, height: 108 },
      doubleDoor,
      state.building.colors,
      'd2'
    );
    expect(doubleRes.markup).toContain('data-door-module="door-double-grand"');
    expect(doubleRes.defs).toContain('dclip-d2-l0-hg');

    const sideBothRes = renderDoorModule(
      { x: 10, y: 20, width: 96, height: 108 },
      sidelightDoor,
      state.building.colors,
      'd3'
    );
    expect(sideBothRes.defs).toContain('dclip-d3-l0-sl');
    expect(sideBothRes.defs).toContain('dclip-d3-l2-sl');
  });

  it('renderiza texturas, 2 portas com escadas individuais, jardim e escada de incêndio', () => {
    const state = createDefaultState();
    state.building.groundDoorCount = 2;
    state.building.doorSide = 'split';
    state.building.wallPattern = 'bricks_detailed';
    state.building.hasQuoins = true;
    state.building.hasFooterGarden = true;
    state.building.hasEntranceStairs = true;
    state.building.hasFireEscape = true;
    state.building.buildingStrokeWidth = 6;
    state.building.elementStrokeWidth = 2.0;

    const layout = computeFacadeLayout(state.building, false);
    const svg = renderFacadeSVG(layout, state, { cleanExport: false });

    expect(svg).toContain('id="slot-render-TERREO_PORTA"');
    expect(svg).toContain('id="slot-render-TERREO_PORTA_2"');
    expect(svg).toContain('data-slot-id="TERREO_PORTA_2"');
    expect(svg).toContain('id="wallBrickPattern"');
    expect(svg).toContain('class="wall-quoins"');
    expect(svg).toContain('class="pilaster-band"');
    expect(svg).toContain('id="exterior-footer-garden"');
    expect(svg).toContain('id="exterior-entrance-stairs"');
    expect(svg).toContain('id="exterior-fire-escape"');
    expect(svg).toContain('stroke-width="6"');
  });

  it('expõe documentação completa para todas as 16 seções de funcionalidades', () => {
    expect(FEATURE_DOCS.length).toBe(16);
    FEATURE_DOCS.forEach((doc) => {
      expect(doc.title.length).toBeGreaterThan(3);
      expect(doc.parameters.length).toBeGreaterThan(0);
      expect(doc.tips.length).toBeGreaterThan(0);
    });
  });
});
