export type DoorSide = 'left' | 'right' | 'split';
export type GroundDoorCount = 1 | 2;
export type GroundShopMode = 'double' | 'single';
export type ShopFitMode = 'fill' | 'proportional';

export type AspectRatioOption = 'free' | '1:1' | '2:3' | '3:5' | '4:3' | '3:2' | '16:9';
export type DivisionMode = 'uniform' | 'transom';
export type ReflectionStyle = 'diagonal_classic' | 'double' | 'soft' | 'none';
export type TopDetailType = 'none' | 'lintel_flat' | 'lintel_cornice' | 'pediment' | 'arch';
export type BottomDetailType = 'none' | 'sill_flat' | 'sill_cornice' | 'sill_corbels';

export type DoorLeafLayout = 'single' | 'double' | 'sidelight';
export type SidelightSide = 'left' | 'right' | 'both';
export type DoorPanelStyle = 'solid_panels' | 'half_glass' | 'full_glass';
export type DoorHandleStyle = 'knob_classic' | 'handle_vertical' | 'none';
export type DoorThresholdType = 'none' | 'sill_stone' | 'double_step';

export type WallPatternType = 'none' | 'bricks_classic' | 'bricks_detailed' | 'stone_ashlar';
export type BattlementsStyle = 'classic' | 'stepped' | 'arched' | 'pediment' | 'balustrade';
export type ColumnBandsMode = 'none' | 'center' | 'edges' | 'all_bays';
export type CorniceStyle = 'classic' | 'dentils' | 'modillions';
export type PlinthStyle =
  | 'classic_panel'
  | 'rusticated_ashlar'
  | 'molded_wood'
  | 'granite_vented';
export type AwningPlacement = 'full' | 'door_only' | 'shop_only';
export type AwningStyle = 'striped_classic' | 'solid_valance' | 'arched_canopy';
export type GardenStyle = 'iron_rail_hedges' | 'planter_box' | 'flower_bed';
export type EntranceStairsStyle = 'stoop_classic' | 'stoop_iron_rail' | 'wide_steps';
export type FireEscapePlacement = 'left' | 'center' | 'right';

export type SlotZone = 'typical' | 'attic' | 'ground' | 'door';
export type ActiveTab = 'structure' | 'windows' | 'doors' | 'interpolation' | 'guide';
export type MobileSheetSnap = 'collapsed' | 'half' | 'full';

export interface BuildingColors {
  wall: string;
  wallShadow: string;
  cornice: string;
  corniceFrieze: string;
  plinthBand: string;
  door: string;
  stroke: string;
  ironwork: string;
  awning: string;
}

export interface BuildingPalette extends BuildingColors {
  id: string;
  name: string;
}

export interface BuildingConfig {
  bodyWidth: number;
  typicalFloors: number;
  typicalSlotsCount: number;
  battlementsCount: number;
  battlementsStyle: BattlementsStyle;
  hasAttic: boolean;
  hasCenterBand: boolean;
  hasPlinth: boolean;
  plinthStyle: PlinthStyle;
  doorSide: DoorSide;
  groundDoorCount: GroundDoorCount;
  groundShopMode: GroundShopMode;
  shopFitMode: ShopFitMode;
  buildingStrokeWidth: number;
  elementStrokeWidth: number;
  wallPattern: WallPatternType;
  hasQuoins: boolean;
  columnBandsMode: ColumnBandsMode;
  corniceStyle: CorniceStyle;
  corniceHeight: number;
  corniceFlush: boolean;
  hasAwning: boolean;
  awningPlacement: AwningPlacement;
  awningStyle: AwningStyle;
  hasFooterGarden: boolean;
  gardenStyle: GardenStyle;
  hasEntranceStairs: boolean;
  entranceStairsStyle: EntranceStairsStyle;
  hasFireEscape: boolean;
  fireEscapePlacement: FireEscapePlacement;
  paletteId: string;
  colors: BuildingColors;
}

export interface WindowModule {
  id: string;
  name: string;
  widthPct: number;
  heightPct: number;
  aspectRatio: AspectRatioOption;
  frameThickness: number;
  mullionThickness: number;
  cols: number;
  rows: number;
  divisionMode: DivisionMode;
  transomRatio: number;
  reflectionStyle: ReflectionStyle;
  topDetail: TopDetailType;
  bottomDetail: BottomDetailType;
  detailScale: number;
  frameColor: string;
  glassColor: string;
  reflectionColor: string;
  detailColor: string;
  syncDetailColor: boolean;
  strokeColor: string;
  syncStroke: boolean;
}

export interface DoorModule {
  id: string;
  name: string;
  widthPct: number;
  heightPct: number;
  frameThickness: number;
  leafLayout: DoorLeafLayout;
  sidelightSide: SidelightSide;
  panelStyle: DoorPanelStyle;
  panelCount: 2 | 4;
  glassRatio: number;
  glassCols: number;
  glassRows: number;
  hasTransom: boolean;
  transomRatio: number;
  transomCols: number;
  transomNumber: string;
  reflectionStyle: ReflectionStyle;
  handleStyle: DoorHandleStyle;
  hasKickplate: boolean;
  topDetail: TopDetailType;
  hasPilasters: boolean;
  thresholdType: DoorThresholdType;
  detailScale: number;
  leafColor: string;
  syncLeafColor: boolean;
  frameColor: string;
  glassColor: string;
  reflectionColor: string;
  hardwareColor: string;
  detailColor: string;
  syncDetailColor: boolean;
  strokeColor: string;
  syncStroke: boolean;
}

export interface SlotAssignments {
  typical: string;
  attic: string;
  ground: string;
  door: string;
}

export type SlotOverrides = Record<string, string>;

export interface UIState {
  activeTab: ActiveTab;
  editingModuleId: string;
  editingDoorModuleId: string;
  selectedSlotId: string | null;
  showSlotGuides: boolean;
  showDimensions: boolean;
  showDoorSketch: boolean;
  mobileSheetSnap?: MobileSheetSnap;
}

export interface FacadeState {
  version: string;
  building: BuildingConfig;
  windowLibrary: WindowModule[];
  doorLibrary: DoorModule[];
  slotAssignments: SlotAssignments;
  slotOverrides: SlotOverrides;
  ui: UIState;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface RoofSection extends Rect {
  id: string;
  type: 'roof_battlements';
  label: string;
  notchDepth: number;
  battlementsCount: number;
  battlementsStyle: BattlementsStyle;
}

export interface CorniceSection {
  id: string;
  type: 'cornice';
  x: number;
  bodyX: number;
  y: number;
  width: number;
  bodyWidth: number;
  mainHeight: number;
  friezeHeight: number;
  height: number;
}

export interface AtticSection extends Rect {
  id: string;
  type: 'attic';
  label: string;
  shadowBandHeight: number;
  columnBands: Rect[];
}

export interface TypicalSection extends Rect {
  id: string;
  type: 'typical';
  label: string;
  floorNum: number;
  shadowBandHeight: number;
  centerBand: Rect | null;
  columnBands: Rect[];
}

export interface GroundSection extends Rect {
  id: string;
  type: 'ground';
  label: string;
  shadowBandHeight: number;
  plinth: Rect | null;
  shopArea: Rect;
  doorAreas: Rect[];
}

export type LayoutSection =
  | RoofSection
  | CorniceSection
  | AtticSection
  | TypicalSection
  | GroundSection;

export interface FacadeSlot extends Rect {
  id: string;
  zone: SlotZone;
  kind: 'window' | 'door';
  label: string;
  floorNum?: number;
  colIndex?: number;
}

export interface ElevationLevel {
  label: string;
  y: number;
}

export interface FacadeLayout {
  strokeWidth: number;
  elementStrokeWidth: number;
  bodyWidth: number;
  corniceWidth: number;
  totalHeight: number;
  viewBox: { width: number; height: number };
  bounds: {
    bodyX: number;
    corniceX: number;
    topY: number;
    bottomY: number;
  };
  sections: LayoutSection[];
  slots: FacadeSlot[];
  levels: ElevationLevel[];
}

export interface FeatureParameterDoc {
  name: string;
  control: string;
  rangeOrOptions: string;
  defaultValue: string;
  behavior: string;
}

export interface FeatureDocSection {
  id: string;
  category: 'Estrutura' | 'Janelas' | 'Portas' | 'Interpolação' | 'Ferramentas & Edge';
  tabLabel: string;
  title: string;
  summary: string;
  howItWorks: string;
  parameters: FeatureParameterDoc[];
  tips: string[];
}
