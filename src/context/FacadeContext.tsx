import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { createDefaultDoorLibrary, createDefaultState, STORAGE_KEY } from '../constants/defaults';
import { FEATURE_DOCS } from '../constants/featureDocs';
import { r2 } from '../engine/colorUtils';
import { computeFacadeLayout } from '../engine/facadeLayout';
import {
  renderFacadeSVG,
  resolveDoorModuleById,
  resolveModuleById
} from '../engine/facadeRenderer';
import type {
  ActiveTab,
  BuildingColors,
  BuildingConfig,
  BuildingPalette,
  DoorModule,
  FacadeLayout,
  FacadeState,
  GroundDoorCount,
  GroundShopMode,
  SlotZone,
  WindowModule
} from '../types/facade';

function loadState(): FacadeState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultState();
    const parsed = JSON.parse(raw) as Partial<FacadeState>;
    if (!parsed || !parsed.building || !Array.isArray(parsed.windowLibrary) || parsed.windowLibrary.length === 0) {
      return createDefaultState();
    }
    const def = createDefaultState();
    const migratedLibrary = parsed.windowLibrary.map((m) => ({
      ...m,
      transomRatio: m.transomRatio ?? 26
    }));

    if (!migratedLibrary.some((m) => m.id === 'win-shop-panoramic')) {
      const panoramic = def.windowLibrary.find((m) => m.id === 'win-shop-panoramic');
      if (panoramic) migratedLibrary.splice(3, 0, panoramic);
    }

    const baseDoorTemplate = createDefaultDoorLibrary()[0];
    const migratedDoorLibrary =
      Array.isArray(parsed.doorLibrary) && parsed.doorLibrary.length > 0
        ? parsed.doorLibrary.map((d) => ({
            ...baseDoorTemplate,
            ...d,
            widthPct: Math.max(55, Math.min(100, d.widthPct ?? 100)),
            heightPct: Math.max(55, Math.min(100, d.heightPct ?? 78))
          }))
        : def.doorLibrary;

    const columnBandsMode =
      parsed.building.columnBandsMode ||
      (parsed.building.hasCenterBand === false ? 'none' : 'center');
    const groundDoorCount: GroundDoorCount = parsed.building.groundDoorCount === 2 ? 2 : 1;
    const rawDoorSide = parsed.building.doorSide || 'right';
    const doorSide =
      groundDoorCount === 1 && rawDoorSide === 'split' ? 'right' : rawDoorSide;

    return {
      ...def,
      ...parsed,
      version: def.version,
      building: {
        ...def.building,
        ...parsed.building,
        groundDoorCount,
        doorSide,
        columnBandsMode,
        groundShopMode: parsed.building.groundShopMode || 'double',
        shopFitMode: parsed.building.shopFitMode || 'fill',
        colors: { ...def.building.colors, ...(parsed.building.colors || {}) }
      },
      windowLibrary: migratedLibrary,
      doorLibrary: migratedDoorLibrary,
      slotAssignments: { ...def.slotAssignments, ...(parsed.slotAssignments || {}) },
      slotOverrides: parsed.slotOverrides || {},
      ui: { ...def.ui, ...(parsed.ui || {}) }
    };
  } catch {
    return createDefaultState();
  }
}

interface FacadeContextValue {
  state: FacadeState;
  layout: FacadeLayout;
  editingModule: WindowModule;
  editingDoorModule: DoorModule;
  currentZoom: number;
  toastMessage: string | null;
  isJsonModalOpen: boolean;
  isDocsModalOpen: boolean;
  activeDocSectionId: string;
  showToast: (msg: string) => void;
  setActiveTab: (tab: ActiveTab) => void;
  toggleSlotGuides: () => void;
  toggleDimensions: () => void;
  toggleDoorSketch: () => void;
  updateBuilding: (patch: Partial<BuildingConfig>) => void;
  updateBuildingColor: (key: keyof BuildingColors, value: string) => void;
  applyBuildingPalette: (palette: BuildingPalette) => void;
  setGroundDoorCount: (count: GroundDoorCount) => void;
  setGroundShopMode: (mode: GroundShopMode) => void;
  selectEditingModule: (id: string) => void;
  updateEditingModule: (patch: Partial<WindowModule>) => void;
  createNewModule: () => void;
  duplicateCurrentModule: () => void;
  deleteCurrentModule: () => void;
  selectEditingDoorModule: (id: string) => void;
  updateEditingDoorModule: (patch: Partial<DoorModule>) => void;
  createNewDoorModule: () => void;
  duplicateCurrentDoorModule: () => void;
  deleteCurrentDoorModule: () => void;
  setZoneAssignment: (zone: SlotZone, moduleId: string) => void;
  selectSlot: (slotId: string | null, switchToInterpolation?: boolean) => void;
  setSlotOverride: (slotId: string, moduleId: string | null) => void;
  clearAllOverrides: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  zoomFit: () => void;
  resetAll: () => void;
  exportCleanSvg: () => void;
  openJsonModal: () => void;
  closeJsonModal: () => void;
  importJsonText: (raw: string) => boolean;
  openDocSection: (sectionId?: string) => void;
  closeDocsModal: () => void;
  setActiveDocSectionId: (sectionId: string) => void;
}

const FacadeContext = createContext<FacadeContextValue | null>(null);

export function FacadeProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<FacadeState>(() => loadState());
  const [currentZoom, setCurrentZoom] = useState<number>(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
  const [isDocsModalOpen, setIsDocsModalOpen] = useState(false);
  const [activeDocSectionId, setActiveDocSectionId] = useState(FEATURE_DOCS[0].id);

  const toastTimerRef = useRef<number | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignora silenciosamente se storage estiver bloqueado
    }
  }, [state]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    if (toastTimerRef.current !== null) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage(null);
    }, 2300);
  }, []);

  const layout = useMemo(
    () => computeFacadeLayout(state.building, state.ui.showDimensions),
    [state.building, state.ui.showDimensions]
  );

  const editingModule = useMemo(
    () => resolveModuleById(state.windowLibrary, state.ui.editingModuleId),
    [state.windowLibrary, state.ui.editingModuleId]
  );

  const editingDoorModule = useMemo(
    () => resolveDoorModuleById(state.doorLibrary, state.ui.editingDoorModuleId),
    [state.doorLibrary, state.ui.editingDoorModuleId]
  );

  const setActiveTab = useCallback((tab: ActiveTab) => {
    setState((prev) => ({ ...prev, ui: { ...prev.ui, activeTab: tab } }));
  }, []);

  const toggleSlotGuides = useCallback(() => {
    setState((prev) => ({
      ...prev,
      ui: { ...prev.ui, showSlotGuides: !prev.ui.showSlotGuides }
    }));
  }, []);

  const toggleDimensions = useCallback(() => {
    setState((prev) => ({
      ...prev,
      ui: { ...prev.ui, showDimensions: !prev.ui.showDimensions }
    }));
  }, []);

  const toggleDoorSketch = useCallback(() => {
    setState((prev) => ({
      ...prev,
      ui: { ...prev.ui, showDoorSketch: !prev.ui.showDoorSketch }
    }));
  }, []);

  const updateBuilding = useCallback((patch: Partial<BuildingConfig>) => {
    setState((prev) => ({
      ...prev,
      building: { ...prev.building, ...patch }
    }));
  }, []);

  const updateBuildingColor = useCallback((key: keyof BuildingColors, value: string) => {
    const hex = value.toUpperCase();
    setState((prev) => ({
      ...prev,
      building: {
        ...prev.building,
        paletteId: 'custom',
        colors: { ...prev.building.colors, [key]: hex }
      }
    }));
  }, []);

  const applyBuildingPalette = useCallback((p: BuildingPalette) => {
    setState((prev) => ({
      ...prev,
      building: {
        ...prev.building,
        paletteId: p.id,
        colors: {
          wall: p.wall,
          wallShadow: p.wallShadow,
          cornice: p.cornice,
          corniceFrieze: p.corniceFrieze,
          plinthBand: p.plinthBand,
          door: p.door,
          stroke: p.stroke,
          ironwork: p.ironwork
        }
      }
    }));
  }, []);

  const setGroundDoorCount = useCallback(
    (count: GroundDoorCount) => {
      setState((prev) => {
        if (prev.building.groundDoorCount === count) return prev;
        const nextDoorSide =
          count === 1 && prev.building.doorSide === 'split'
            ? 'right'
            : prev.building.doorSide;
        const nextShopMode = count === 2 ? 'single' : prev.building.groundShopMode;
        const nextSelected =
          count === 1 && prev.ui.selectedSlotId === 'TERREO_PORTA_2'
            ? 'TERREO_PORTA'
            : prev.ui.selectedSlotId;
        return {
          ...prev,
          building: {
            ...prev.building,
            groundDoorCount: count,
            doorSide: nextDoorSide,
            groundShopMode: nextShopMode
          },
          ui: { ...prev.ui, selectedSlotId: nextSelected }
        };
      });
      showToast(
        count === 2
          ? 'Modo 2 Portas + 1 Vitrine ativado (1/3 cada)'
          : 'Modo 1 Porta (até 1/3) ativado'
      );
    },
    [showToast]
  );

  const setGroundShopMode = useCallback(
    (mode: GroundShopMode) => {
      setState((prev) => {
        if (prev.building.groundShopMode === mode) return prev;
        const next = {
          ...prev,
          building: { ...prev.building, groundShopMode: mode },
          slotAssignments: { ...prev.slotAssignments },
          ui: { ...prev.ui }
        };

        if (mode === 'single') {
          next.building.shopFitMode = 'fill';
          if (
            prev.slotAssignments.ground === 'win-ground-2x3' &&
            prev.windowLibrary.some((m) => m.id === 'win-shop-panoramic')
          ) {
            next.slotAssignments.ground = 'win-shop-panoramic';
            showToast('1 Vitrine Ampla ativada (preset Vitrine Panorâmica aplicado)');
          } else {
            showToast('1 Vitrine Ampla ativada');
          }
          if (prev.ui.selectedSlotId === 'gf-shop-0' || prev.ui.selectedSlotId === 'gf-shop-1') {
            next.ui.selectedSlotId = 'gf-shop-single';
          }
        } else {
          if (
            prev.slotAssignments.ground === 'win-shop-panoramic' &&
            prev.windowLibrary.some((m) => m.id === 'win-ground-2x3')
          ) {
            next.slotAssignments.ground = 'win-ground-2x3';
          }
          if (prev.ui.selectedSlotId === 'gf-shop-single') {
            next.ui.selectedSlotId = 'gf-shop-0';
          }
          showToast('Layout de 2 Vitrines ativado');
        }
        return next;
      });
    },
    [showToast]
  );

  // CRUD Biblioteca de Janelas
  const selectEditingModule = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      ui: { ...prev.ui, editingModuleId: id }
    }));
  }, []);

  const updateEditingModule = useCallback((patch: Partial<WindowModule>) => {
    setState((prev) => {
      const targetId = resolveModuleById(prev.windowLibrary, prev.ui.editingModuleId).id;
      return {
        ...prev,
        windowLibrary: prev.windowLibrary.map((m) => (m.id === targetId ? { ...m, ...patch } : m))
      };
    });
  }, []);

  const createNewModule = useCallback(() => {
    const id = 'win-custom-' + Date.now().toString(36).slice(-4);
    setState((prev) => {
      const newMod: WindowModule = {
        id,
        name: `Nova Janela ${prev.windowLibrary.length + 1}`,
        widthPct: 95,
        heightPct: 95,
        aspectRatio: 'free',
        frameThickness: 6,
        mullionThickness: 3.5,
        cols: 2,
        rows: 3,
        divisionMode: 'uniform',
        transomRatio: 26,
        reflectionStyle: 'diagonal_classic',
        topDetail: 'lintel_flat',
        bottomDetail: 'sill_flat',
        detailScale: 1.0,
        frameColor: '#8F5B3C',
        glassColor: '#63B0DF',
        reflectionColor: '#B4E1FA',
        detailColor: '#FAF5E8',
        syncDetailColor: true,
        strokeColor: '#2E1412',
        syncStroke: true
      };
      return {
        ...prev,
        windowLibrary: [...prev.windowLibrary, newMod],
        ui: { ...prev.ui, editingModuleId: id }
      };
    });
    showToast('Novo módulo de janela criado');
  }, [showToast]);

  const duplicateCurrentModule = useCallback(() => {
    const id = 'win-copy-' + Date.now().toString(36).slice(-4);
    setState((prev) => {
      const src = resolveModuleById(prev.windowLibrary, prev.ui.editingModuleId);
      const copy: WindowModule = { ...src, id, name: `${src.name} (Cópia)` };
      return {
        ...prev,
        windowLibrary: [...prev.windowLibrary, copy],
        ui: { ...prev.ui, editingModuleId: id }
      };
    });
    showToast('Módulo duplicado');
  }, [showToast]);

  const deleteCurrentModule = useCallback(() => {
    setState((prev) => {
      if (prev.windowLibrary.length <= 1) return prev;
      const delId = resolveModuleById(prev.windowLibrary, prev.ui.editingModuleId).id;
      const filtered = prev.windowLibrary.filter((m) => m.id !== delId);
      const fallbackId = filtered[0].id;

      const nextAssignments = { ...prev.slotAssignments };
      (['typical', 'attic', 'ground'] as const).forEach((z) => {
        if (nextAssignments[z] === delId) nextAssignments[z] = fallbackId;
      });

      const nextOverrides: Record<string, string> = {};
      Object.entries(prev.slotOverrides).forEach(([sid, mid]) => {
        if (mid !== delId) nextOverrides[sid] = mid;
      });

      return {
        ...prev,
        windowLibrary: filtered,
        slotAssignments: nextAssignments,
        slotOverrides: nextOverrides,
        ui: { ...prev.ui, editingModuleId: fallbackId }
      };
    });
    showToast('Módulo removido da biblioteca');
  }, [showToast]);

  // CRUD Biblioteca de Portas
  const selectEditingDoorModule = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      ui: { ...prev.ui, editingDoorModuleId: id }
    }));
  }, []);

  const updateEditingDoorModule = useCallback((patch: Partial<DoorModule>) => {
    setState((prev) => {
      const targetId = resolveDoorModuleById(prev.doorLibrary, prev.ui.editingDoorModuleId).id;
      return {
        ...prev,
        doorLibrary: prev.doorLibrary.map((d) => (d.id === targetId ? { ...d, ...patch } : d))
      };
    });
  }, []);

  const createNewDoorModule = useCallback(() => {
    const id = 'door-custom-' + Date.now().toString(36).slice(-4);
    setState((prev) => {
      const newDoor: DoorModule = {
        ...createDefaultDoorLibrary()[0],
        id,
        name: `Nova Porta ${prev.doorLibrary.length + 1}`,
        panelStyle: 'half_glass',
        hasTransom: true,
        transomNumber: '101',
        topDetail: 'lintel_flat'
      };
      return {
        ...prev,
        doorLibrary: [...prev.doorLibrary, newDoor],
        ui: { ...prev.ui, editingDoorModuleId: id }
      };
    });
    showToast('Novo módulo de porta criado');
  }, [showToast]);

  const duplicateCurrentDoorModule = useCallback(() => {
    const id = 'door-copy-' + Date.now().toString(36).slice(-4);
    setState((prev) => {
      const src = resolveDoorModuleById(prev.doorLibrary, prev.ui.editingDoorModuleId);
      const copy: DoorModule = { ...src, id, name: `${src.name} (Cópia)` };
      return {
        ...prev,
        doorLibrary: [...prev.doorLibrary, copy],
        ui: { ...prev.ui, editingDoorModuleId: id }
      };
    });
    showToast('Módulo de porta duplicado');
  }, [showToast]);

  const deleteCurrentDoorModule = useCallback(() => {
    setState((prev) => {
      if (prev.doorLibrary.length <= 1) return prev;
      const delId = resolveDoorModuleById(prev.doorLibrary, prev.ui.editingDoorModuleId).id;
      const filtered = prev.doorLibrary.filter((d) => d.id !== delId);
      const fallbackId = filtered[0].id;

      const nextAssignments = { ...prev.slotAssignments };
      if (nextAssignments.door === delId) nextAssignments.door = fallbackId;

      const nextOverrides: Record<string, string> = {};
      Object.entries(prev.slotOverrides).forEach(([sid, mid]) => {
        if (mid !== delId) nextOverrides[sid] = mid;
      });

      return {
        ...prev,
        doorLibrary: filtered,
        slotAssignments: nextAssignments,
        slotOverrides: nextOverrides,
        ui: { ...prev.ui, editingDoorModuleId: fallbackId }
      };
    });
    showToast('Módulo de porta removido da biblioteca');
  }, [showToast]);

  const setZoneAssignment = useCallback((zone: SlotZone, moduleId: string) => {
    setState((prev) => ({
      ...prev,
      slotAssignments: { ...prev.slotAssignments, [zone]: moduleId }
    }));
  }, []);

  const selectSlot = useCallback((slotId: string | null, switchToInterpolation = false) => {
    setState((prev) => ({
      ...prev,
      ui: {
        ...prev.ui,
        selectedSlotId: slotId,
        activeTab: switchToInterpolation ? 'interpolation' : prev.ui.activeTab
      }
    }));
  }, []);

  const setSlotOverride = useCallback((slotId: string, moduleId: string | null) => {
    setState((prev) => {
      const nextOverrides = { ...prev.slotOverrides };
      if (!moduleId || moduleId === '__inherit__') {
        delete nextOverrides[slotId];
      } else {
        nextOverrides[slotId] = moduleId;
      }
      return { ...prev, slotOverrides: nextOverrides };
    });
  }, []);

  const clearAllOverrides = useCallback(() => {
    setState((prev) => ({ ...prev, slotOverrides: {} }));
    showToast('Todas as sobrescritas individuais foram limpas');
  }, [showToast]);

  const zoomIn = useCallback(() => setCurrentZoom((z) => Math.min(2.2, r2(z + 0.15))), []);
  const zoomOut = useCallback(() => setCurrentZoom((z) => Math.max(0.4, r2(z - 0.15))), []);
  const zoomFit = useCallback(() => setCurrentZoom(1), []);

  const resetAll = useCallback(() => {
    setState(createDefaultState());
    setCurrentZoom(1);
    showToast('Projeto restaurado para o padrão de referência');
  }, [showToast]);

  const exportCleanSvg = useCallback(() => {
    try {
      const cleanLayout = computeFacadeLayout(state.building, false);
      const cleanSvg =
        '<?xml version="1.0" encoding="UTF-8"?>\n' +
        renderFacadeSVG(cleanLayout, state, { cleanExport: true }).trim();
      const blob = new Blob([cleanSvg], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ny-facade-etapa2-4-${state.building.typicalFloors}pav.svg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('SVG limpo exportado com sucesso');
    } catch {
      showToast('Erro ao exportar SVG');
    }
  }, [state, showToast]);

  const openJsonModal = useCallback(() => setIsJsonModalOpen(true), []);
  const closeJsonModal = useCallback(() => setIsJsonModalOpen(false), []);

  const importJsonText = useCallback(
    (raw: string): boolean => {
      try {
        const parsed = JSON.parse(raw) as Partial<FacadeState>;
        if (!parsed.building || !Array.isArray(parsed.windowLibrary) || parsed.windowLibrary.length === 0) {
          showToast('JSON inválido: faltam building ou windowLibrary');
          return false;
        }
        const def = createDefaultState();
        const nextDoorLib =
          Array.isArray(parsed.doorLibrary) && parsed.doorLibrary.length > 0
            ? parsed.doorLibrary
            : def.doorLibrary;
        setState((prev) => ({
          ...def,
          ...parsed,
          version: def.version,
          building: {
            ...def.building,
            ...parsed.building,
            colors: { ...def.building.colors, ...(parsed.building?.colors || {}) }
          },
          windowLibrary: parsed.windowLibrary!,
          doorLibrary: nextDoorLib,
          slotAssignments: { ...def.slotAssignments, ...(parsed.slotAssignments || {}) },
          slotOverrides: parsed.slotOverrides || {},
          ui: {
            ...prev.ui,
            editingModuleId: parsed.windowLibrary![0].id,
            editingDoorModuleId: nextDoorLib[0].id,
            selectedSlotId: null
          }
        }));
        setIsJsonModalOpen(false);
        showToast('Configuração JSON importada com sucesso');
        return true;
      } catch {
        showToast('Erro de sintaxe no JSON informado');
        return false;
      }
    },
    [showToast]
  );

  const openDocSection = useCallback((sectionId?: string) => {
    if (sectionId) {
      setActiveDocSectionId(sectionId);
    }
    setIsDocsModalOpen(true);
  }, []);

  const closeDocsModal = useCallback(() => setIsDocsModalOpen(false), []);

  const value: FacadeContextValue = {
    state,
    layout,
    editingModule,
    editingDoorModule,
    currentZoom,
    toastMessage,
    isJsonModalOpen,
    isDocsModalOpen,
    activeDocSectionId,
    showToast,
    setActiveTab,
    toggleSlotGuides,
    toggleDimensions,
    toggleDoorSketch,
    updateBuilding,
    updateBuildingColor,
    applyBuildingPalette,
    setGroundDoorCount,
    setGroundShopMode,
    selectEditingModule,
    updateEditingModule,
    createNewModule,
    duplicateCurrentModule,
    deleteCurrentModule,
    selectEditingDoorModule,
    updateEditingDoorModule,
    createNewDoorModule,
    duplicateCurrentDoorModule,
    deleteCurrentDoorModule,
    setZoneAssignment,
    selectSlot,
    setSlotOverride,
    clearAllOverrides,
    zoomIn,
    zoomOut,
    zoomFit,
    resetAll,
    exportCleanSvg,
    openJsonModal,
    closeJsonModal,
    importJsonText,
    openDocSection,
    closeDocsModal,
    setActiveDocSectionId
  };

  return <FacadeContext.Provider value={value}>{children}</FacadeContext.Provider>;
}

export function useFacade(): FacadeContextValue {
  const ctx = useContext(FacadeContext);
  if (!ctx) {
    throw new Error('useFacade deve ser utilizado dentro de FacadeProvider');
  }
  return ctx;
}
