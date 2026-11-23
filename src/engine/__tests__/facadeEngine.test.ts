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

  it('aplica textura de tijolos/pedra e pingadeira em todos os 5 estilos de ameias', () => {
    const baseState = createDefaultState();
    baseState.building.wallPattern = 'bricks_detailed';

    (['classic', 'stepped', 'arched', 'pediment', 'balustrade'] as const).forEach((style) => {
      const state = {
        ...baseState,
        building: { ...baseState.building, battlementsStyle: style }
      };
      const layout = computeFacadeLayout(state.building, false);
      const svg = renderFacadeSVG(layout, state, { cleanExport: true });

      expect(svg).toContain(`data-battlements-style="${style}"`);
      expect(svg).toContain('id="roofBattlementsClip"');
      expect(svg).toContain('fill="url(#wallBrickPattern)"');
      expect(svg).toContain('class="roof-brick-clusters"');
      expect(svg).toContain('class="roof-coping"');

      if (style === 'balustrade') {
        expect(svg).toContain('class="balustrade-opening"');
      }
      if (style === 'pediment') {
        expect(svg).toContain('class="pediment-oculus"');
      }
    });

    const ashlarState = {
      ...baseState,
      building: {
        ...baseState.building,
        wallPattern: 'stone_ashlar' as const,
        battlementsStyle: 'arched' as const
      }
    };
    const ashlarSvg = renderFacadeSVG(
      computeFacadeLayout(ashlarState.building, false),
      ashlarState,
      { cleanExport: true }
    );
    expect(ashlarSvg).toContain('fill="url(#wallStonePattern)"');
  });

  it('ajusta espessura vertical e alinhamento lateral rente das cornijas', () => {
    const thinState = createDefaultState();
    thinState.building.corniceHeight = 20;
    thinState.building.corniceFlush = true;

    const thinLayout = computeFacadeLayout(thinState.building, false);
    const thinCornice = thinLayout.sections.find((s) => s.type === 'cornice')!;
    if (thinCornice.type !== 'cornice') throw new Error('Esperada seção cornice');

    expect(thinCornice.height).toBe(20);
    expect(thinCornice.mainHeight + thinCornice.friezeHeight).toBe(20);
    expect(thinLayout.corniceWidth).toBe(thinLayout.bodyWidth);
    expect(thinLayout.bounds.corniceX).toBe(thinLayout.bounds.bodyX);

    const thinSvg = renderFacadeSVG(thinLayout, thinState, { cleanExport: true });
    expect(thinSvg).toContain('rx="0" ry="0"');

    const thickState = createDefaultState();
    thickState.building.corniceHeight = 52;
    const thickLayout = computeFacadeLayout(thickState.building, false);
    const thickCornice = thickLayout.sections.find((s) => s.type === 'cornice')!;
    if (thickCornice.type !== 'cornice') throw new Error('Esperada seção cornice');

    expect(thickCornice.height).toBe(52);
    // 4 cornijas (topo, ático, tipo 2, tipo 1): diferença total = 4 * (52 - 20) = 128u
    expect(thickLayout.totalHeight - thinLayout.totalHeight).toBe(128);
  });

  it('renderiza os 4 estilos selecionáveis de embasamento no rodapé do térreo', () => {
    const baseState = createDefaultState();

    (['classic_panel', 'rusticated_ashlar', 'molded_wood', 'granite_vented'] as const).forEach(
      (style) => {
        const state = {
          ...baseState,
          building: { ...baseState.building, hasPlinth: true, plinthStyle: style }
        };
        const layout = computeFacadeLayout(state.building, false);
        const svg = renderFacadeSVG(layout, state, { cleanExport: true });

        expect(svg).toContain(`id="ground-plinth" data-plinth-style="${style}"`);
        if (style === 'granite_vented') {
          expect(svg).toContain('class="plinth-vent-grille"');
        }
      }
    );
  });

  it('renderiza toldo logo abaixo da cornija nas 3 abrangências (full, door_only, shop_only) e 3 estilos', () => {
    const baseState = createDefaultState();
    baseState.building.hasAwning = true;
    baseState.building.groundDoorCount = 2;
    baseState.building.doorSide = 'split';

    const layout = computeFacadeLayout(baseState.building, false);
    const ground = layout.sections.find((s) => s.type === 'ground');
    if (!ground || ground.type !== 'ground') throw new Error('Esperada seção ground');

    const expectedTopY = ground.y + 1;

    // 1) Largura total do térreo
    const fullState = {
      ...baseState,
      building: { ...baseState.building, awningPlacement: 'full' as const, awningStyle: 'solid_valance' as const }
    };
    const fullSvg = renderFacadeSVG(layout, fullState, { cleanExport: true });
    expect(fullSvg).toContain('data-awning-placement="full"');
    expect(fullSvg).toContain('data-awning-style="solid_valance"');
    expect(fullSvg).toContain(`data-awning-id="awning-full" data-top-y="${expectedTopY}" data-width="${ground.width + 8}"`);

    // 2) Somente acima das portas (2 portas -> 2 toldos individuais)
    const doorState = {
      ...baseState,
      building: { ...baseState.building, awningPlacement: 'door_only' as const, awningStyle: 'arched_canopy' as const }
    };
    const doorSvg = renderFacadeSVG(layout, doorState, { cleanExport: true });
    expect(doorSvg).toContain('data-awning-placement="door_only"');
    expect(doorSvg).toContain('data-awning-id="awning-door-1"');
    expect(doorSvg).toContain('data-awning-id="awning-door-2"');

    // 3) Somente acima da vitrine
    const shopState = {
      ...baseState,
      building: { ...baseState.building, awningPlacement: 'shop_only' as const, awningStyle: 'striped_classic' as const }
    };
    const shopSvg = renderFacadeSVG(layout, shopState, { cleanExport: true });
    expect(shopSvg).toContain('data-awning-placement="shop_only"');
    expect(shopSvg).toContain('class="awning-valance-scalloped"');
    expect(shopSvg).toContain(
      `data-awning-id="awning-shop" data-top-y="${expectedTopY}" data-width="${Math.round((ground.shopArea.width + 8) * 100) / 100}"`
    );
  });

  it('expõe documentação completa para todas as 16 seções incluindo navegação mobile 9:16', () => {
    expect(FEATURE_DOCS.length).toBe(16);
    FEATURE_DOCS.forEach((doc) => {
      expect(doc.title.length).toBeGreaterThan(3);
      expect(doc.parameters.length).toBeGreaterThan(0);
      expect(doc.tips.length).toBeGreaterThan(0);
    });
    const toolsDoc = FEATURE_DOCS.find((d) => d.id === 'ferramentas-viewport-export')!;
    expect(toolsDoc.howItWorks).toContain('9:16');
    expect(
      toolsDoc.parameters.some((p) => p.name.includes('Bottom Dock') || p.name.includes('Mobile'))
    ).toBe(true);
  });
});
