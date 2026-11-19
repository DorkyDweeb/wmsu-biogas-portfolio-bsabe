export type IllustrationVariant =
  | 'substrate-channel'
  | 'inlet-conduit'
  | 'digester-cutaway'
  | 'plant-layout-3d'
  | 'mixing-inlet'
  | 'safety-manifold'
  | 'utilization-genset';

export type ComplianceStatus = 'Compliant' | 'Partially Compliant' | 'Non-Compliant';

export type ComponentId =
  | 'substrate-source'
  | 'feeding-channel'
  | 'mixing-tank'
  | 'inlet-pipe'
  | 'digester-shell'
  | 'gas-dome'
  | 'safety-skid'
  | 'outlet-tank'
  | 'drainage-trench'
  | 'utilization-genset';

export interface GroupMember {
  id: string;
  name: string;
  role: string;
  contribution: string;
}

export interface ProjectMeta {
  institution: string;
  college: string;
  department: string;
  courseCode: string;
  courseTitle: string;
  schedule: string;
  room: string;
  semester: string;
  projectTitle: string;
  facilityLocation: string;
  assignedStandard: string;
  specificFarm: string;
  groupNumber: string;
  instructor: string;
  submissionDate: string;
  members: GroupMember[];
}

export interface PaesEvaluationItem {
  id: string;
  no: number;
  componentId: ComponentId;
  componentName: string;
  paesReference: string;
  paesSectionTopic: string;
  requirementSummary: string;
  technicalCriteria: string;
  relevanceToCase: string;
  simulatedCondition: string;
  status: ComplianceStatus;
  q1WhatPaesRequires: string;
  q2WhatCaseProvides: string;
  q3DoesItComply: string;
  q4BasisForAssessment: string;
  q5CorrectiveAction: string;
  recommendation: string;
  verificationCaveat: string;
}

export interface SimulatedMetric {
  label: string;
  value: string;
  unit: string;
}

export interface Subsystem3DInfo {
  id: ComponentId;
  hotspotNumber: string;
  shortLabel: string;
  name: string;
  cameraPreset: 'overview' | 'mixing' | 'digester' | 'dome' | 'outlet' | 'utilization';
  simulatedDimensions: string;
  simulatedMaterial: string;
  functionDescription: string;
  complianceStatus: ComplianceStatus;
  paesNote: string;
  illustrationVariant: IllustrationVariant;
  imageCaption: string;
  simulatedMetrics: SimulatedMetric[];
}

export interface SimulatedSpecRow {
  parameter: string;
  simulatedValue: string;
  unit: string;
  basisOrNote: string;
}

export const ILLUSTRATIVE_GALLERY: {
  id: ComponentId;
  title: string;
  caption: string;
  variant: IllustrationVariant;
}[] = [
  {
    id: 'substrate-source',
    title: '01 · Substrate Source & 0.4% Concrete Feeding Channel',
    caption:
      'MATCHES 3D MODEL (WEST BAY): Swine pen manure collection point feeding a nearly flat 0.4% concrete channel vs. PAES 413 Sec. 7.1.1 (≥ 2.0% slope).',
    variant: 'substrate-channel',
  },
  {
    id: 'inlet-pipe',
    title: '02 · Collecting Tank & 0.06 m PVC Inlet Pipe',
    caption:
      'MATCHES 3D MODEL (FEED CONDUIT): Collecting tank with bar screen/agitator feeding an undersized 0.06 m (6 cm) PVC pipe vs. PAES Sec. 6.2 (≥ 0.20 m bore).',
    variant: 'inlet-conduit',
  },
  {
    id: 'digester-shell',
    title: '03 · Anaerobic Digester Cutaway & Fixed Dome',
    caption:
      'MATCHES 3D MODEL (REACTOR CORE): Cutaway reactor receiving the 0.06 m PVC inlet, showing anaerobic slurry, central baffle, CH₄ dome, and outlet pit.',
    variant: 'digester-cutaway',
  },
  {
    id: 'drainage-trench',
    title: '04 · Integrated 3D Plant Layout & Flow Sequence',
    caption:
      'MATCHES 3D MODEL (FULL SITE): End-to-end Green Pastures layout from swine housing source through feeding channel, tank, inlet, digester, and utilization pad.',
    variant: 'plant-layout-3d',
  },
];

export const DEFAULT_PROJECT_META: ProjectMeta = {
  institution: 'Western Mindanao State University',
  college: 'College of Engineering',
  department: 'Agricultural and Biosystems Engineering Department',
  courseCode: 'BABE 101',
  courseTitle: 'BABE 101 – Introduction to Agricultural and Biosystems Engineering',
  schedule: '1:00 – 4:00 W',
  room: 'CET 214',
  semester: 'A.Y. 2026–2027',
  projectTitle: 'GREEN PASTURES SWINE FARM',
  facilityLocation: 'Barangay San Roque, Zamboanga City, Zamboanga Peninsula, Philippines, 7000',
  assignedStandard: 'PAES 413:2001 — Agricultural Structures: Biogas Plant',
  specificFarm: 'Piggery Farm',
  groupNumber: 'Group 8',
  instructor: 'Engr. Ivy Juanillo Santos',
  submissionDate: 'Nov 19, 2026',
  members: [
    {
      id: 'm1',
      name: 'Avenido, Jhon Mark Mabag',
      role: 'Chapters 10–11 Lead (Conclusion & References)',
      contribution:
        'In charge of Chapter 10 (Conclusion) and Chapter 11 (References) synthesis and final PAES 413:2001 closing documentation.',
    },
    {
      id: 'm2',
      name: 'Emit, Reuelfrank Villarosa',
      role: 'Chapters 3, 4, 7 & 8 Lead (Subject, PAES, Docs & Findings)',
      contribution:
        'In charge of Chapters 3 (Simulated Subject), 4 (PAES Requirements), 7 (Documentation), and 8 (Findings and Discussion).',
    },
    {
      id: 'm3',
      name: 'Manayon, Iñigo Josemaria',
      role: 'E-Portfolio Developer & 3D Structural Modeler',
      contribution:
        'In charge of the interactive e-portfolio platform, Blender 3D biogas plant modeling, cutaway illustrations, and system integration.',
    },
    {
      id: 'm4',
      name: 'Sallihani, Haber Nassal',
      role: 'Chapters 5, 6 & 9 Lead (Inspection, Compliance & Recommendations)',
      contribution:
        'In charge of Chapters 5 (Simulated Inspection), 6 (Compliance Evaluation Table), and 9 (Engineering Recommendations).',
    },
    {
      id: 'm5',
      name: 'Tanaga, Krizzel Leonardo',
      role: 'Chapters 1 & 2 Lead (Title Page & Introduction)',
      contribution:
        'In charge of Chapter 1 (Title Page & Academic Ledger) and Chapter 2 (Introduction & Simulated Facility Problem Statement).',
    },
  ],
};

export const SUBSYSTEM_3D_MAP: Record<ComponentId, Subsystem3DInfo> = {
  'substrate-source': {
    id: 'substrate-source',
    hotspotNumber: '01',
    shortLabel: 'Substrate Source',
    name: 'Substrate Source (Swine Pen Manure Collection)',
    cameraPreset: 'mixing',
    simulatedDimensions: 'Swine housing manure washdown apron & raw collection sump (West Intake Bay)',
    simulatedMaterial: 'Concrete floor bay with curb walls, washdown sump, and galvanized steel guard rails',
    functionDescription:
      'Area where raw pig manure and washdown substrate are collected from the swine housing or manure collection point before gravity discharge into the concrete feeding channel.',
    complianceStatus: 'Compliant',
    paesNote:
      'Provides the designated livestock waste collection point upstream of the concrete feeding channel; downstream channel slope and inlet pipe are the evaluated PAES 413:2001 deficiencies.',
    illustrationVariant: 'substrate-channel',
    imageCaption: 'SIMULATED / ILLUSTRATIVE 3D VIEW: Swine pen manure collection bay feeding the concrete channel.',
    simulatedMetrics: [
      { label: 'Primary Feed', value: 'Pig Manure', unit: 'Swine Waste' },
      { label: 'Collection Mode', value: 'Pen Washdown', unit: 'Sump Bay' },
      { label: 'Downstream Unit', value: 'Channel', unit: '0.4% Grade' },
      { label: 'Component No.', value: '01 of 05', unit: 'Main Chain' },
    ],
  },
  'feeding-channel': {
    id: 'feeding-channel',
    hotspotNumber: '02',
    shortLabel: '0.4% Channel',
    name: 'Concrete Feeding Channel (0.4% Measured Slope)',
    cameraPreset: 'mixing',
    simulatedDimensions: 'Open concrete trough @ ~0.4% slope (0.004 m/m) vs. PAES Sec. 7.1.1 minimum 2.0% (0.02 m/m)',
    simulatedMaterial: 'Cast-in-place reinforced concrete open U-channel linking substrate source to collecting tank',
    functionDescription:
      'Carries the collected pig manure substrate by gravity from the substrate source toward the collecting tank. At only 0.4% slope, the shallow grade reduces gravitational driving force and risks solids settling and accumulation.',
    complianceStatus: 'Non-Compliant',
    paesNote:
      'Non-Compliant (PAES 413:2001, Section 7.1.1): Measured slope is ~0.4% (0.004 m/m), below the required minimum slope of 2.0% (0.02 m/m).',
    illustrationVariant: 'substrate-channel',
    imageCaption: 'SIMULATED / ILLUSTRATIVE 3D VIEW: Green Pastures 0.4% concrete feeding channel vs. PAES 413 Sec. 7.1.1 (≥ 2.0%).',
    simulatedMetrics: [
      { label: 'Measured Slope', value: '0.4', unit: '% (0.004 m/m)' },
      { label: 'PAES 7.1.1 Min', value: '2.0', unit: '% (0.02 m/m)' },
      { label: 'Flow Risk', value: 'Settling', unit: 'Low Head' },
      { label: 'Audit Result', value: 'Non-Comp', unit: 'Sec 7.1.1' },
    ],
  },
  'mixing-tank': {
    id: 'mixing-tank',
    hotspotNumber: '03',
    shortLabel: 'Collecting Tank',
    name: 'Collecting & Mixing Tank',
    cameraPreset: 'mixing',
    simulatedDimensions: 'Temporary holding & homogenization chamber upstream of the 0.06 m PVC inlet pipe',
    simulatedMaterial: 'Reinforced concrete walls with coarse bar screen and geared paddle mixer bridge',
    functionDescription:
      'Receives substrate delivered from the concrete feeding channel and temporarily holds and homogenizes it before gravity conveyance through the inlet pipe into the anaerobic digester.',
    complianceStatus: 'Compliant',
    paesNote:
      'Serves as the intermediate holding basin between the concrete feeding channel (0.4% Non-Compliant) and the PVC inlet pipe (0.06 m Non-Compliant).',
    illustrationVariant: 'inlet-conduit',
    imageCaption: 'SIMULATED / ILLUSTRATIVE 3D VIEW: Collecting tank holding substrate prior to the 0.06 m PVC inlet pipe.',
    simulatedMetrics: [
      { label: 'System Role', value: 'Buffer Tank', unit: 'Pre-Inlet' },
      { label: 'Inflow From', value: 'Channel', unit: '0.4% Slope' },
      { label: 'Outflow To', value: '0.06 m PVC', unit: 'Inlet Pipe' },
      { label: 'Component No.', value: '03 of 05', unit: 'Main Chain' },
    ],
  },
  'inlet-pipe': {
    id: 'inlet-pipe',
    hotspotNumber: '04',
    shortLabel: '0.06m PVC Inlet',
    name: 'Undersized PVC Inlet Pipe (0.06 m / 6 cm Ø)',
    cameraPreset: 'mixing',
    simulatedDimensions: '0.06 m (60 mm / 6 cm) internal diameter PVC pipe (PAES Sec 6.2 requires ≥ 0.20 m / 20 cm)',
    simulatedMaterial: 'Polyvinyl chloride (PVC) conduit linking collecting tank to anaerobic digester (material suitability noted as outside Sec 6.2 excerpt)',
    functionDescription:
      'Provides the passage through which pig manure substrate enters the anaerobic digester from the collecting tank. At only 0.06 m (6 cm), the restricted cross-section hinders high-solid swine manure movement and increases blockage likelihood.',
    complianceStatus: 'Non-Compliant',
    paesNote:
      'Non-Compliant (PAES 413:2001, Section 6.2): Simulated PVC inlet pipe diameter is 0.06 m (6 cm), failing the minimum 0.20 m (200 mm / 20 cm) requirement.',
    illustrationVariant: 'inlet-conduit',
    imageCaption: 'SIMULATED / ILLUSTRATIVE 3D VIEW: Undersized 0.06 m (6 cm) PVC inlet pipe vs PAES 413:2001 Sec 6.2 minimum 0.20 m bore.',
    simulatedMetrics: [
      { label: 'Pipe Diameter', value: '0.06', unit: 'm (6 cm / 60 mm)' },
      { label: 'PAES 6.2 Min', value: '0.20', unit: 'm (20 cm / 200 mm)' },
      { label: 'Pipe Material', value: 'PVC', unit: 'Simulated' },
      { label: 'Audit Result', value: 'Non-Comp', unit: 'Sec 6.2' },
    ],
  },
  'digester-shell': {
    id: 'digester-shell',
    hotspotNumber: '05',
    shortLabel: 'Digester',
    name: 'Anaerobic Digester (0.20 m RC & Epoxy)',
    cameraPreset: 'digester',
    simulatedDimensions: '3.40 m internal Ø × 2.10 m wall height · 0.20 m (200 mm) reinforced concrete wall thickness',
    simulatedMaterial: '0.20 m reinforced concrete walls treated with an epoxy waterproof coating',
    functionDescription:
      'Main anaerobic fermentation pit providing an oxygen-free chamber for swine waste digestion. Built with 0.20 m reinforced concrete walls and an epoxy waterproof coating matching structural guidelines for underground agricultural tanks.',
    complianceStatus: 'Compliant',
    paesNote:
      'Compliant (PAES 413:2001 Sec. 7.1 / Ch. 5.2): 0.20 m reinforced concrete walls with epoxy waterproof coating satisfy underground tank structural integrity guidelines.',
    illustrationVariant: 'digester-cutaway',
    imageCaption: 'SIMULATED / ILLUSTRATIVE 3D VIEW: 0.20 m reinforced concrete anaerobic digester with waterproof epoxy lining.',
    simulatedMetrics: [
      { label: 'Wall Thickness', value: '0.20', unit: 'm (200 mm RC)' },
      { label: 'Waterproofing', value: 'Epoxy', unit: 'Coating Applied' },
      { label: 'Active Slurry Vol', value: '19.0', unit: 'm³ (Sim)' },
      { label: 'Audit Result', value: 'Compliant', unit: 'Sec 7.1 / Ch 5.2' },
    ],
  },
  'gas-dome': {
    id: 'gas-dome',
    hotspotNumber: '06',
    shortLabel: 'Gas Holder',
    name: 'Masonry Fixed-Dome Gas Chamber',
    cameraPreset: 'dome',
    simulatedDimensions: '1.15 m hemispherical dome rise (0–10 kPa standard operating pressure range)',
    simulatedMaterial: 'Epoxy-waterproofed masonry/reinforced concrete dome with top turret and airtight outlet seal',
    functionDescription:
      'Collects rising biogas above the slurry surface inside the masonry gas dome and maintains safe working pressure (0 to 10 kPa) paired with the manual brass ball valve and 15 kPa pressure gauge at the gas outlet.',
    complianceStatus: 'Compliant',
    paesNote:
      'Compliant (Ch. 5.2 & Sec. 8.4): Operates safely within the 0–10 kPa pressure range without dangerous pressure buildups inside the masonry gas dome.',
    illustrationVariant: 'digester-cutaway',
    imageCaption: 'SIMULATED / ILLUSTRATIVE 3D VIEW: Masonry gas dome operating within 0–10 kPa protected by outlet valve & gauge.',
    simulatedMetrics: [
      { label: 'Operating Range', value: '0–10', unit: 'kPa (Standard)' },
      { label: 'Gauge Rating', value: '15', unit: 'kPa Max' },
      { label: 'Dome Lining', value: 'Epoxy', unit: 'Waterproofed' },
      { label: 'Audit Result', value: 'Compliant', unit: 'Ch 5.2 / Sec 8.4' },
    ],
  },
  'safety-skid': {
    id: 'safety-skid',
    hotspotNumber: '07',
    shortLabel: 'Gas Outlet & Valve',
    name: 'Gas Outlet Brass Ball Valve & 15 kPa Gauge',
    cameraPreset: 'dome',
    simulatedDimensions: 'Manual brass ball valve + integrated pressure gauge rated up to 15 kPa (0–10 kPa working range)',
    simulatedMaterial: 'Brass ball valve with airtight thread sealing and 15 kPa pressure dial gauge',
    functionDescription:
      'Regulates biogas discharge from the masonry gas dome using a secure manual brass ball valve and integrated pressure gauge rated up to 15 kPa, safely monitoring the 0 to 10 kPa operating pressure range to prevent pressure buildups.',
    complianceStatus: 'Compliant',
    paesNote:
      'Compliant (PAES 413:2001 Sec. 8.4 / Ch. 5.2): Manual brass ball valve and 15 kPa pressure gauge with airtight thread sealing match safe operating pressure guidelines.',
    illustrationVariant: 'safety-manifold',
    imageCaption: 'SIMULATED / ILLUSTRATIVE P&ID: Gas outlet assembly featuring manual brass ball valve and 15 kPa pressure gauge.',
    simulatedMetrics: [
      { label: 'Valve Type', value: 'Brass Ball', unit: 'Manual / Sealed' },
      { label: 'Gauge Rating', value: '15', unit: 'kPa Max' },
      { label: 'Operating Range', value: '0–10', unit: 'kPa Standard' },
      { label: 'Audit Result', value: 'Compliant', unit: 'Sec 8.4 / Ch 5.2' },
    ],
  },
  'outlet-tank': {
    id: 'outlet-tank',
    hotspotNumber: '08',
    shortLabel: 'Outlet Pit',
    name: 'Outlet / Displacement & Sludge Tank',
    cameraPreset: 'outlet',
    simulatedDimensions: '1.80 m × 1.60 m × 1.40 m (4.03 m³ simulated displacement compensation volume)',
    simulatedMaterial: 'Reinforced concrete pit with removable precast safety grating, overflow weir, and sludge suction valve',
    functionDescription:
      'Acts as the hydraulic pressure governor by receiving slurry displaced during biogas accumulation and enabling safe withdrawal of nutrient-rich stabilized bio-fertilizer.',
    complianceStatus: 'Compliant',
    paesNote:
      'Meets PAES 413:2001 volume displacement and safe discharge criteria; secondary wet-season drying bed recommended under PAES 414:2002.',
    illustrationVariant: 'digester-cutaway',
    imageCaption: 'SIMULATED / ILLUSTRATIVE 3D VIEW: Hydraulic compensation chamber balancing dome gas pressure.',
    simulatedMetrics: [
      { label: 'Displacement Vol', value: '4.03', unit: 'm³ (Sim)' },
      { label: 'Effluent Output', value: '0.52', unit: 'm³/day (Sim)' },
      { label: 'VS Reduction', value: '68.5', unit: '% (Sim)' },
      { label: 'Safety Cover', value: 'Steel Grate', unit: 'Installed' },
    ],
  },
  'drainage-trench': {
    id: 'drainage-trench',
    hotspotNumber: '09',
    shortLabel: 'Drainage',
    name: 'Perimeter Groundwater & Drainage Apron',
    cameraPreset: 'overview',
    simulatedDimensions: '150 mm compacted gravel bed; missing upslope perimeter French drain in simulated baseline',
    simulatedMaterial: 'Crushed gravel base beneath concrete foundation slab (upslope diversion swale omitted in baseline)',
    functionDescription:
      'Protects the semi-underground digester shell from hydrostatic groundwater uplift during maintenance dewatering and diverts heavy tropical monsoon runoff away from mixing and outlet pits.',
    complianceStatus: 'Partially Compliant',
    paesNote:
      'Base gravel bedding exists, but omission of perimeter French drain leaves lower walls exposed to seasonal water-table pressure.',
    illustrationVariant: 'plant-layout-3d',
    imageCaption: 'SIMULATED / ILLUSTRATIVE 3D VIEW: Green Pastures 3D site layout, foundation apron, and feeding-to-reactor chain.',
    simulatedMetrics: [
      { label: 'Gravel Sub-Base', value: '150', unit: 'mm Crushed' },
      { label: 'Soil Type', value: 'Clay-Loam', unit: 'Low Perm' },
      { label: 'French Drain', value: 'Omitted', unit: 'Retrofit Req' },
      { label: 'Apron Pad Area', value: '165', unit: 'm² (Sim)' },
    ],
  },
  'utilization-genset': {
    id: 'utilization-genset',
    hotspotNumber: '10',
    shortLabel: 'Generator',
    name: 'Biogas Utilization Skid (5 kVA Genset & Flare)',
    cameraPreset: 'utilization',
    simulatedDimensions: '2.20 m × 1.40 m concrete equipment pad housing simulated 5 kVA biogas genset & boiler flare',
    simulatedMaterial: 'Powder-coated steel canopy, combustion sight-glass flare unit, and perimeter safety bollards',
    functionDescription:
      'Converts scrubbed methane gas into farm electrical power (lighting, washdown booster pumps) and thermal heat for sanitation, protected by perimeter safety bollards and an auxiliary flare burner.',
    complianceStatus: 'Non-Compliant',
    paesNote:
      'Operable only after upstream safety manifold remediation (flame arrestor + H₂S desulfurization) to prevent engine corrosion and flashback.',
    illustrationVariant: 'utilization-genset',
    imageCaption: 'SIMULATED / ILLUSTRATIVE 3D VIEW: 5 kVA biogas-adapted generator set, yellow safety bollards, and excess-gas flare.',
    simulatedMetrics: [
      { label: 'Rated Output', value: '5.0', unit: 'kVA (Sim)' },
      { label: 'Working Load', value: '3.8', unit: 'kW (Sim)' },
      { label: 'Gas Demand', value: '2.1', unit: 'm³/hr (Sim)' },
      { label: 'Bollard Guard', value: '4 × Steel', unit: 'Installed' },
    ],
  },
};

export const COMPONENT_ORDER: ComponentId[] = [
  'substrate-source',
  'feeding-channel',
  'mixing-tank',
  'inlet-pipe',
  'digester-shell',
  'gas-dome',
  'safety-skid',
  'outlet-tank',
  'drainage-trench',
  'utilization-genset',
];

export const GREEN_PASTURES_MAIN_COMPONENTS = [
  {
    no: 1,
    component: 'Substrate source',
    functionInFacility: 'Area where pig manure is collected from the swine housing or manure collection point.',
    componentId: 'substrate-source' as ComponentId,
  },
  {
    no: 2,
    component: 'Concrete feeding channel',
    functionInFacility: 'Carries the collected substrate from its source toward the collecting tank (measured slope: 0.4%).',
    componentId: 'feeding-channel' as ComponentId,
  },
  {
    no: 3,
    component: 'Collecting tank',
    functionInFacility: 'Receives and temporarily holds the substrate before it is conveyed into the digester.',
    componentId: 'mixing-tank' as ComponentId,
  },
  {
    no: 4,
    component: 'Inlet pipe',
    functionInFacility: 'Provides the passage through which substrate enters the anaerobic digester (measured: 0.06 m PVC).',
    componentId: 'inlet-pipe' as ComponentId,
  },
  {
    no: 5,
    component: 'Anaerobic digester',
    functionInFacility: 'Contains the organic waste during anaerobic digestion and supports biogas production.',
    componentId: 'digester-shell' as ComponentId,
  },
];

export const GREEN_PASTURES_PROCESS_STEPS = [
  'Pig Manure Collection',
  'Concrete Feeding Channel',
  'Collecting Tank',
  'Inlet Pipe',
  'Anaerobic Digester',
];

export const SIMULATED_SPECS: SimulatedSpecRow[] = [
  {
    parameter: 'Facility type',
    simulatedValue: 'Swine waste-to-biogas plant',
    unit: 'Classification',
    basisOrNote: 'Hypothetical facility (Green Pastures Swine Farm Biogas Plant, Brgy. San Roque, Zamboanga City)',
  },
  {
    parameter: 'Primary substrate',
    simulatedValue: 'Pig manure',
    unit: 'Organic feedstock',
    basisOrNote: 'Organic waste from swine production',
  },
  {
    parameter: 'Inlet pipe material',
    simulatedValue: 'PVC',
    unit: 'Conduit material',
    basisOrNote: 'Material stated in the scenario; material suitability is not determined by Section 6.2 excerpt alone.',
  },
  {
    parameter: 'Inlet pipe diameter',
    simulatedValue: '0.06 m (6 cm)',
    unit: '60 mm Ø (Simulated)',
    basisOrNote: 'Simulated measured value — falls below PAES 413:2001 Section 6.2 minimum (Non-Compliant)',
  },
  {
    parameter: 'PAES minimum inlet pipe diameter',
    simulatedValue: '0.20 m (20 cm)',
    unit: '200 mm Ø (Standard)',
    basisOrNote: 'PAES 413:2001, Section 6.2 — “The minimum diameter of the inlet pipe shall be 0.2 m.”',
  },
  {
    parameter: 'Concrete feeding channel slope',
    simulatedValue: '0.4%',
    unit: '0.004 m/m (Simulated)',
    basisOrNote: 'Simulated measured value — nearly flat gradient below PAES 413:2001 Section 7.1.1 (Non-Compliant)',
  },
  {
    parameter: 'PAES minimum channel slope',
    simulatedValue: '2.0%',
    unit: '0.02 m/m (Standard)',
    basisOrNote: 'PAES 413:2001, Section 7.1.1 — Minimum slope from substrate source to collecting tank.',
  },
  {
    parameter: 'Processing capacity',
    simulatedValue: 'Not yet specified',
    unit: 'Pending group design',
    basisOrNote: 'Must be supplied if required by the group’s final facility design (Sections 5–11 pending).',
  },
  {
    parameter: 'Overall facility dimensions',
    simulatedValue: 'Not yet specified',
    unit: 'Pending layout',
    basisOrNote: 'Must be supplied in the simulated layout if required (Sections 5–11 pending).',
  },
];

export interface GreenPasturesPaesClause {
  id: string;
  sectionLabel: string;
  title: string;
  excerptQuote: string;
  paesNumberAndTitle: string;
  relevantProvision: string;
  applicableRequirement: string;
  technicalParameter: string;
  simulatedValue: string;
  relevanceToCase: string;
  whyRelevant: string;
  paesMinimumCriterion: string;
  simulatedMeasurement: string;
  result: 'Non-compliant';
  componentId: ComponentId;
}

export const GREEN_PASTURES_PAES_CLAUSES: GreenPasturesPaesClause[] = [
  {
    id: 'gp-sec-6-2',
    sectionLabel: '4.2',
    title: 'PAES 413:2001, Section 6.2 – Inlet Pipe',
    excerptQuote: '“The minimum diameter of the inlet pipe shall be 0.2 m.”',
    paesNumberAndTitle: 'PAES 413:2001 – Agricultural Structures – Biogas Plant',
    relevantProvision: 'Section 6.2 – Inlet pipe',
    applicableRequirement: 'The minimum diameter of the inlet pipe shall be 0.2 m.',
    technicalParameter: 'Minimum diameter = 0.20 m = 200 mm = 20 cm',
    simulatedValue: '0.06 m = 60 mm = 6 cm',
    relevanceToCase:
      'The inlet pipe conveys the substrate into the digester. Its diameter affects the available passage for manure and solids.',
    whyRelevant:
      'The simulated inlet pipe is smaller than the minimum diameter stated in Section 6.2. Since swine manure may contain solids, a restricted pipe opening may hinder substrate movement and increase the risk of clogging. The pipe diameter is therefore a direct and measurable criterion for evaluating this part of the feeding system.',
    paesMinimumCriterion: 'Diameter ≥ 0.20 m',
    simulatedMeasurement: '0.06 m',
    result: 'Non-compliant',
    componentId: 'inlet-pipe',
  },
  {
    id: 'gp-sec-7-1-1',
    sectionLabel: '4.3',
    title: 'PAES 413:2001, Section 7.1.1 – Concrete Feeding Channels',
    excerptQuote:
      '“Concrete channels shall be provided from the source of substrate to the collecting tank with a minimum slope of 2%.”',
    paesNumberAndTitle: 'PAES 413:2001 – Agricultural Structures – Biogas Plant',
    relevantProvision: 'Section 7.1.1 – Concrete channels',
    applicableRequirement:
      'Concrete channels from the substrate source to the collecting tank shall have a minimum slope of 2%.',
    technicalParameter: 'Minimum slope = 2% = 0.02 m/m',
    simulatedValue: '0.4% = 0.004 m/m',
    relevanceToCase:
      'The channel conveys substrate from the source to the collecting tank. The slope supports gravity-driven movement.',
    whyRelevant:
      'The simulated channel slope is lower than the minimum required by Section 7.1.1. A shallow channel may not provide enough gravitational fall to move the substrate effectively. This may result in slow movement, solids settling, or waste accumulation in the channel.',
    paesMinimumCriterion: 'Slope ≥ 2.0%',
    simulatedMeasurement: '0.4%',
    result: 'Non-compliant',
    componentId: 'feeding-channel',
  },
];

export const GREEN_PASTURES_CH5_INSPECTION = {
  intro: [
    'The researchers used a systematic inspection approach based on the operational and physical parameters established in the assigned task.',
    'The primary objective of this simulated inspection was to evaluate whether the facility structural standards and hydraulic transport mechanisms followed the provisions of PAES 413:2001 (Agricultural Structures – Biogas Plant). The inspection combined dimensional verification, hydraulic assessment, and comparative benchmarking against national agricultural engineering standards.',
  ],
  subsection51Intro:
    'The simulated inspection began at the farm’s solid-liquid waste collection pit and traced the substrate flow path leading directly into the anaerobic digestion chamber.',
  inletPipeAudit: {
    componentId: 'inlet-pipe' as ComponentId,
    title: 'Evaluation of the Inlet Pipe Size',
    fieldMeasurement:
      'When measuring the PVC pipe that leads slurry into the digester, the team found it had an inner diameter of 0.06 meters (60 mm). A 0.06-meter pipe is below the size required by the standard. Because swine manure contains solid waste, leftover feeds, and washing debris, a narrow pipe will easily trap these materials, causing frequent clogs that stop daily loading and disrupt the biogas production process.',
    paesRequirement:
      'PAES 413:2001 states that a biogas plant inlet pipe must have a minimum diameter of 0.20 meters (200 mm) to handle solid-heavy agricultural waste safely.',
  },
  feedingChannelAudit: {
    componentId: 'feeding-channel' as ComponentId,
    title: 'Evaluation of the Feeding Channel Slope',
    fieldMeasurement:
      'Using a leveling tool, the researchers measured the slope of the concrete feeding channel that guides the manure slurry from the collection path/tank toward the inlet pipe. The slope was roughly 0.4%, which is much too flat. Without enough tilt, the slurry moves too slowly, causing heavy manure solids and grit to settle and pile up along the bottom of the channel. Over time, this buildup stops the flow before the waste can reach the digester.',
    paesRequirement:
      'The standard requires a minimum channel slope of 2.0% to ensure that heavy slurry moves smoothly by gravity.',
  },
  subsection52Intro:
    'The researchers also inspected the main structure and gas storage components to check for overall safety and stability:',
  digesterWallAudit: {
    componentId: 'digester-shell' as ComponentId,
    title: 'Digester Wall Structure',
    summary:
      'The main fermentation pit is built with reinforced concrete walls (0.20 meters thick) treated with an epoxy waterproof coating. This matches standard structural safety guidelines for underground agricultural tanks.',
  },
  gasOutletAudit: {
    componentId: 'safety-skid' as ComponentId,
    title: 'Gas Outlet and Valves',
    summary:
      'The gas outlet features a secure manual brass ball valve and an integrated pressure gauge rated up to 15 kPa with airtight thread sealing. This safely matches the standard operating pressure range (0 to 10 kPa) and prevents dangerous pressure buildups inside the masonry gas dome.',
  },
  summary53:
    'While the main digester tank and gas safety equipment are well-built and compliant, the facility has critical problems in its feeding and inlet path. The combination of an undersized inlet pipe (0.06 m) and a flat feeding channel (0.4%) creates a high risk of constant clogging, messy backups, and interrupted gas production, making the feeding/inlet system Non-Compliant with PAES 413:2001.',
};

export const PAES_EVALUATION_ITEMS: PaesEvaluationItem[] = [
  {
    id: 'eval-1',
    no: 1,
    componentId: 'inlet-pipe',
    componentName: 'Minimum Inlet Pipe Diameter (0.20 m)',
    paesReference: 'PAES 413:2001, Section 6.2 — Inlet Pipe',
    paesSectionTopic: 'Solid-Heavy Swine Slurry Conveyance & Blockage Prevention',
    requirementSummary:
      'PAES 413:2001 Sec. 6.2: Minimum inlet pipe diameter of 0.20 m (200 mm) to safely handle solid-heavy agricultural waste.',
    technicalCriteria:
      'Minimum internal pipe diameter D ≥ 0.20 m (200 mm / 20 cm) for unobstructed gravity entry into the anaerobic digester.',
    relevanceToCase:
      'Swine manure contains solid waste, leftover feeds, and washing debris that easily trap inside narrow conduits.',
    simulatedCondition:
      'SIMULATED: Facility utilizes an undersized PVC inlet conduit with a measured inner diameter (D) of 0.06 m (60 mm / 6 cm).',
    status: 'Non-Compliant',
    q1WhatPaesRequires:
      'PAES 413:2001 (Section 6.2) requires a biogas plant inlet pipe to have a minimum internal diameter of 0.20 meters (200 mm / 20 cm) to convey solid-heavy agricultural waste safely.',
    q2WhatCaseProvides:
      'The simulated Green Pastures facility uses a PVC inlet pipe with a measured inner diameter of only 0.06 meters (60 mm / 6 cm).',
    q3DoesItComply: 'No — Non-Compliant (0.06 m < 0.20 m minimum).',
    q4BasisForAssessment:
      'A 0.06 m bore has less than one-tenth the cross-sectional flow area of a 0.20 m pipe. Solid swine manure, leftover feeds, and washing debris will easily trap inside the narrow PVC conduit, causing frequent clogs that halt daily loading and disrupt biogas production.',
    q5CorrectiveAction:
      'Replace the 0.06 m PVC inlet conduit with an approved inlet pipe having a minimum internal diameter of 0.20 m (200 mm) sloped cleanly into the fermentation chamber.',
    recommendation:
      'Replace the 0.06 m PVC inlet pipe with a minimum 0.20 m (200 mm) internal diameter conduit in accordance with PAES 413:2001 Sec. 6.2.',
    verificationCaveat:
      'All measurements are simulated for educational evaluation; field replacement must verify wall penetration watertightness.',
  },
  {
    id: 'eval-2',
    no: 2,
    componentId: 'feeding-channel',
    componentName: 'Feeding Channel Gradient (≥ 2.0%)',
    paesReference: 'PAES 413:2001, Section 6.2 / Section 7.1.1 — Concrete Feeding Channels',
    paesSectionTopic: 'Gravity-Driven Substrate Flow & Solids Settlement Prevention',
    requirementSummary:
      'PAES 413:2001 Sec. 6.2 / Sec. 7.1.1: Concrete feeding channels shall maintain a minimum slope of 2.0% (0.02 m/m).',
    technicalCriteria:
      'Minimum longitudinal channel gradient ≥ 2.0% (0.02 m/m) from substrate source to collecting tank/inlet path.',
    relevanceToCase:
      'Gravity-driven slurry transport relies on sufficient gradient to keep heavy swine manure solids and grit suspended.',
    simulatedCondition:
      'SIMULATED: Concrete transition feeding channel connecting the collection tank/source to the inlet has a measured slope of 0.4% (0.004 m/m).',
    status: 'Non-Compliant',
    q1WhatPaesRequires:
      'PAES 413:2001 requires a minimum concrete feeding channel slope of 2.0% (0.02 m/m) so heavy livestock slurry moves smoothly by gravity.',
    q2WhatCaseProvides:
      'Using a simulated leveling check, the concrete feeding channel has a nearly flat measured slope of roughly 0.4% (0.004 m/m).',
    q3DoesItComply: 'No — Non-Compliant (0.4% < 2.0% minimum).',
    q4BasisForAssessment:
      'A 0.4% gradient is five times flatter than the 2.0% minimum requirement. Without adequate tilt, slurry velocity drops, causing heavy manure solids and grit to settle and accumulate along the channel bed until flow stalls before reaching the digester.',
    q5CorrectiveAction:
      'Re-grade and reconstruct the concrete feeding channel bed to achieve a continuous minimum slope of at least 2.0% (0.02 m/m).',
    recommendation:
      'Re-slope the concrete feeding channel floor to ≥ 2.0% (0.02 m/m) to restore self-cleansing gravity flow and prevent solids deposition.',
    verificationCaveat:
      'Confirm finished invert elevations with a spirit or laser level during simulated reconstruction.',
  },
  {
    id: 'eval-3',
    no: 3,
    componentId: 'digester-shell',
    componentName: 'Digester Tank Structural Integrity',
    paesReference: 'PAES 413:2001, Section 7.1 — Digester Tank Structural Integrity',
    paesSectionTopic: 'Underground Fermentation Pit Wall Thickness & Waterproofing',
    requirementSummary:
      'PAES 413:2001 Sec. 7.1: Fermentation pit shall have structurally sound reinforced concrete walls with waterproof sealing.',
    technicalCriteria:
      '0.20 m reinforced concrete underground tank walls with continuous interior epoxy waterproof coating.',
    relevanceToCase:
      'Prevents groundwater infiltration, slurry exfiltration, and structural failure under surrounding soil and liquid loads.',
    simulatedCondition:
      'SIMULATED: Reinforced concrete fermentation pit wall thickness of 0.20 m treated with an epoxy waterproof coating.',
    status: 'Compliant',
    q1WhatPaesRequires:
      'PAES 413:2001 requires underground biogas digester tanks to meet structural wall strength and waterproof containment guidelines.',
    q2WhatCaseProvides:
      'The main fermentation pit is built with 0.20 m thick reinforced concrete walls treated with an epoxy waterproof coating.',
    q3DoesItComply: 'Yes — Compliant.',
    q4BasisForAssessment:
      'The 0.20 m reinforced concrete wall thickness and continuous epoxy waterproof coating satisfy structural stability and impermeability guidelines for underground agricultural tanks.',
    q5CorrectiveAction:
      'No structural retrofit required; continue periodic visual inspection of the waterproof epoxy lining during scheduled desludging.',
    recommendation:
      'Maintain existing 0.20 m reinforced concrete wall structure and inspect epoxy waterproof coating integrity during routine tank maintenance.',
    verificationCaveat:
      'Simulated structural inspection values based on Chapter 5.2 assessment parameters.',
  },
  {
    id: 'eval-4',
    no: 4,
    componentId: 'safety-skid',
    componentName: 'Gas Outlet Pressure & Valve Rating',
    paesReference: 'PAES 413:2001, Section 8.4 — Gas Outlet Pressure & Valve Rating',
    paesSectionTopic: 'Operating Pressure Monitoring & Airtight Gas Isolation',
    requirementSummary:
      'PAES 413:2001 Sec. 8.4: Gas outlet must provide secure isolation and pressure monitoring suited to the 0–10 kPa operating range.',
    technicalCriteria:
      'Manual brass ball valve, airtight thread sealing, and pressure gauge rated above 0–10 kPa operating pressure (15 kPa rating).',
    relevanceToCase:
      'Prevents uncontrolled gas leaks and dangerous over-pressurization inside the masonry gas dome.',
    simulatedCondition:
      'SIMULATED: Installed manual brass ball valve and integrated pressure gauge rated up to 15 kPa with airtight thread sealing.',
    status: 'Compliant',
    q1WhatPaesRequires:
      'PAES 413:2001 requires secure gas outlet shutoff valving and pressure monitoring capable of safely handling the standard 0–10 kPa operating envelope.',
    q2WhatCaseProvides:
      'The gas outlet is fitted with a manual brass ball valve and an integrated pressure gauge rated up to 15 kPa with airtight thread sealing.',
    q3DoesItComply: 'Yes — Compliant.',
    q4BasisForAssessment:
      'The 15 kPa gauge rating provides a safe margin above the 0–10 kPa standard operating range, and the airtight-sealed brass ball valve enables positive shutoff and prevents pressure buildup inside the masonry gas dome.',
    q5CorrectiveAction:
      'No modification needed; verify gauge zero-calibration and thread soap-bubble tightness during routine preventive checks.',
    recommendation:
      'Retain the manual brass ball valve and 15 kPa pressure gauge assembly and log daily dome pressure readings within the 0–10 kPa operating band.',
    verificationCaveat:
      'Simulated valve and gauge specifications aligned with Chapter 5.2 and Chapter 6 findings.',
  },
];

export interface ReferenceEntry {
  id: string;
  citation: string;
  category: string;
  url?: string;
}

export const REFERENCES_LIST: ReferenceEntry[] = [
  {
    id: 'ref-1',
    citation:
      'Philippine Agricultural Engineering Standards (PAES). (2001). PAES 413:2001 – Agricultural structures – Biogas plant (Sections 6.2 and 7.1.1). Excerpts supplied in the project materials.',
    category: 'Primary Assigned Standard · Course Project Excerpts',
  },
  {
    id: 'ref-2',
    citation:
      'Agricultural Machinery Testing and Evaluation Center. (2001). Agricultural structures – Biogas plant (PAES 413:2001). University of the Philippines Los Baños.',
    category: 'Standard Issuing Institution · AMTEC UPLB',
    url: 'https://amtec.uplb.edu.ph/wp-content/uploads/2020/06/PNS-PAES-413-2001',
  },
];
