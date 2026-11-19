import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { COMPONENT_ORDER, ComponentId } from '../data/portfolioData';
import { createProceduralTextures, ProceduralTextureSet } from './proceduralTextures';

export type CameraPresetKey =
  | 'overview'
  | 'mixing'
  | 'digester'
  | 'dome'
  | 'outlet'
  | 'utilization';

export interface SceneControlState {
  cameraPreset: CameraPresetKey;
  cutaway: boolean;
  explodeAmount: number; // 0 to 1
  flowActive: boolean;
  showComplianceHighlights: boolean;
  showHotspots: boolean;
  retrofitMode: boolean;
  selectedComponent: ComponentId | null;
}

export interface ProjectedHotspot {
  id: ComponentId;
  x: number;
  y: number;
  visible: boolean;
}

interface CameraPreset {
  position: [number, number, number];
  target: [number, number, number];
}

const CAMERA_PRESETS: Record<CameraPresetKey, CameraPreset> = {
  overview: { position: [12.0, 9.2, 15.6], target: [-1.4, 1.4, -0.4] },
  mixing: { position: [-10.8, 5.4, 7.2], target: [-6.8, 1.1, 0.0] },
  digester: { position: [0.4, 4.3, 8.8], target: [0.0, 1.7, 0.0] },
  dome: { position: [3.2, 6.2, 6.8], target: [0.4, 3.0, -0.3] },
  outlet: { position: [9.4, 5.0, 6.2], target: [5.0, 1.4, 0.0] },
  utilization: { position: [9.2, 4.7, -0.4], target: [4.6, 1.3, -4.2] },
};

// Base 3D world-space anchor coordinates for clickable hotspots
const BASE_HOTSPOT_ANCHORS: Record<ComponentId, [number, number, number]> = {
  'substrate-source': [-10.1, 2.05, 0.0],
  'feeding-channel': [-7.52, 1.45, 0.25],
  'mixing-tank': [-5.1, 2.35, 0.0],
  'inlet-pipe': [-2.95, 1.05, 0.75],
  'digester-shell': [-0.6, 1.65, 1.55],
  'gas-dome': [0.0, 4.75, 0.0],
  'safety-skid': [1.6, 2.55, -2.5],
  'outlet-tank': [5.0, 2.15, 0.0],
  'drainage-trench': [0.4, 0.35, 2.85],
  'utilization-genset': [4.6, 2.25, -4.2],
};

// Pre-allocated math helpers (zero GC inside animation loop)
const _v1 = new THREE.Vector3();
const _v2 = new THREE.Vector3();
const _projVec = new THREE.Vector3();
const _mat4 = new THREE.Matrix4();
const _quat = new THREE.Quaternion();
const _scale = new THREE.Vector3();
const _colorNonCompliant = new THREE.Color(0xef4444);
const _colorCompliant = new THREE.Color(0x10b981);

function isContextSoftwareRenderer(gl: WebGLRenderingContext | WebGL2RenderingContext): boolean {
  try {
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) || '');
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return false;
  }
}

function createSafeWebGL2Context(): {
  canvas: HTMLCanvasElement;
  gl: WebGL2RenderingContext;
  antialias: boolean;
} | null {
  if (typeof document === 'undefined') return null;

  const tryCreate = (antialias: boolean): { canvas: HTMLCanvasElement; gl: WebGL2RenderingContext } | null => {
    const canvas = document.createElement('canvas');
    const suppressCreationError = (e: Event) => {
      e.preventDefault();
    };
    canvas.addEventListener('webglcontextcreationerror', suppressCreationError, false);
    try {
      const gl = canvas.getContext('webgl2', {
        alpha: true,
        depth: true,
        stencil: false,
        antialias,
        premultipliedAlpha: true,
        preserveDrawingBuffer: false,
        powerPreference: 'default',
        failIfMajorPerformanceCaveat: false,
      });
      if (gl && !gl.isContextLost()) {
        return { canvas, gl };
      }
    } catch {
      // Ignore unavailable WebGL2 context
    } finally {
      canvas.removeEventListener('webglcontextcreationerror', suppressCreationError, false);
    }
    return null;
  };

  const msaa = tryCreate(true);
  if (msaa) {
    return { ...msaa, antialias: true };
  }
  const basic = tryCreate(false);
  if (basic) {
    return { ...basic, antialias: false };
  }
  return null;
}

export class BiogasPlantController {
  private container: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private controls: OrbitControls;
  private textures: ProceduralTextureSet;
  private envRT: THREE.WebGLRenderTarget | null = null;
  private isSoftwareGl: boolean;

  private clock = new THREE.Clock();
  private frameId = 0;
  private disposed = false;
  private contextIsLost = false;

  // Interactive & animated references
  private clickableObjects: THREE.Object3D[] = [];
  private highlightableGroups = new Map<ComponentId, THREE.Mesh[]>();
  private componentStatusRings = new Map<ComponentId, THREE.Mesh>();

  // Cutaway & Explode groups
  private frontShellGroup = new THREE.Group();
  private frontDomeMesh!: THREE.Mesh;
  private frontWallMesh!: THREE.Mesh;
  private domeCapGroup = new THREE.Group();
  private linerGroup = new THREE.Group();
  private baffleAndSlurryGroup = new THREE.Group();
  private safetyManifoldGroup = new THREE.Group();
  private agitatorBladeGroup = new THREE.Group();
  private anemometerGroup = new THREE.Group();
  private slurrySurfaceMesh!: THREE.Mesh;
  private outletSlurryMesh!: THREE.Mesh;
  private flameGroup = new THREE.Group();
  private flareLight!: THREE.PointLight;
  private reactorGlowLight!: THREE.PointLight;

  // Baseline vs. PAES 413:2001 Retrofit references
  private channelTiltGroup = new THREE.Group();
  private reqSlopeBarMat!: THREE.MeshBasicMaterial;
  private baselineInletPipe!: THREE.Mesh;
  private baselineInletMat!: THREE.MeshStandardMaterial;
  private retrofitInletPipe!: THREE.Mesh;
  private retrofitInletMat!: THREE.MeshStandardMaterial;
  private retrofitFlangeGroup = new THREE.Group();
  private reqBoreMesh!: THREE.Mesh;
  private reqBoreMat!: THREE.MeshBasicMaterial;

  // Instanced particles
  private bubbleMesh!: THREE.InstancedMesh;
  private bubbleData: { angle: number; radius: number; y: number; speed: number; size: number }[] = [];
  private gasFlowMesh!: THREE.InstancedMesh;
  private gasCurve!: THREE.CatmullRomCurve3;
  private gasOffsets: number[] = [];
  private slurryFlowMesh!: THREE.InstancedMesh;
  private inletCurve!: THREE.CatmullRomCurve3;
  private slurryFlowOffsets: number[] = [];

  // State & smooth damping targets
  private state: SceneControlState = {
    cameraPreset: 'overview',
    cutaway: true,
    explodeAmount: 0,
    flowActive: true,
    showComplianceHighlights: true,
    showHotspots: true,
    retrofitMode: false,
    selectedComponent: null,
  };
  private currentExplode = 0;
  private currentCutaway = 1;
  private currentRetrofit = 0;
  private cameraTransitionActive = false;
  private targetCamPos = new THREE.Vector3(...CAMERA_PRESETS.overview.position);
  private targetLookAt = new THREE.Vector3(...CAMERA_PRESETS.overview.target);

  // Raycasting & input
  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2();
  private pointerDownPos = { x: 0, y: 0 };
  private lastHoverCheck = 0;
  private hoveredId: ComponentId | null = null;

  // Projected hotspots buffer (reused every frame)
  private projectedHotspots: ProjectedHotspot[] = COMPONENT_ORDER.map((id) => ({
    id,
    x: 0,
    y: 0,
    visible: true,
  }));

  // Callbacks
  private onSelectCallback: (id: ComponentId | null) => void;
  private onHotspotsUpdateCallback: (hotspots: ProjectedHotspot[]) => void;
  private onContextLostCallback: () => void;
  private onContextRestoredCallback: () => void;

  // Track disposables
  private geometries: THREE.BufferGeometry[] = [];
  private materials: THREE.Material[] = [];

  constructor(
    container: HTMLElement,
    callbacks: {
      onSelect: (id: ComponentId | null) => void;
      onHotspotsUpdate: (hotspots: ProjectedHotspot[]) => void;
      onContextLost: () => void;
      onContextRestored: () => void;
    }
  ) {
    this.container = container;
    this.onSelectCallback = callbacks.onSelect;
    this.onHotspotsUpdateCallback = callbacks.onHotspotsUpdate;
    this.onContextLostCallback = callbacks.onContextLost;
    this.onContextRestoredCallback = callbacks.onContextRestored;

    const webgl = createSafeWebGL2Context();
    if (!webgl) {
      throw new Error('WEBGL_UNAVAILABLE');
    }

    this.renderer = new THREE.WebGLRenderer({
      canvas: webgl.canvas,
      context: webgl.gl,
      antialias: webgl.antialias,
      powerPreference: 'default',
      failIfMajorPerformanceCaveat: false,
    });

    this.isSoftwareGl = isContextSoftwareRenderer(webgl.gl);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.12;
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 1.5));
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const width = container.clientWidth || 960;
    const height = container.clientHeight || 540;
    this.renderer.setSize(width, height);
    this.renderer.domElement.style.display = 'block';
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    container.appendChild(this.renderer.domElement);

    // Scene & horizon-matched fog
    this.scene = new THREE.Scene();
    const skyColor = 0x0b1320;
    this.scene.background = new THREE.Color(skyColor);
    this.scene.fog = new THREE.FogExp2(skyColor, 0.016);

    // Studio environment reflection via RoomEnvironment (guarded for constrained WebGL drivers)
    try {
      const pmrem = new THREE.PMREMGenerator(this.renderer);
      const roomEnv = new RoomEnvironment();
      this.envRT = pmrem.fromScene(roomEnv, 0.04);
      this.scene.environment = this.envRT.texture;
      roomEnv.dispose();
      pmrem.dispose();
    } catch {
      this.envRT = null;
    }

    // Camera
    this.camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 160);
    this.camera.position.set(...CAMERA_PRESETS.overview.position);

    // Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = !this.isSoftwareGl;
    this.controls.dampingFactor = 0.07;
    this.controls.minDistance = 4.5;
    this.controls.maxDistance = 32;
    this.controls.maxPolarAngle = Math.PI * 0.47;
    this.controls.target.set(...CAMERA_PRESETS.overview.target);
    this.controls.update();

    this.controls.addEventListener('start', () => {
      this.cameraTransitionActive = false;
    });

    this.textures = createProceduralTextures(this.renderer.capabilities.getMaxAnisotropy());

    this.setupLighting();
    this.buildEnvironmentTerrain();
    this.buildBiogasPlant();

    if (!this.isSoftwareGl) {
      this.renderer.compile(this.scene, this.camera);
    }

    this.bindEvents();
    this.startLoop();
  }

  private trackGeo<T extends THREE.BufferGeometry>(geo: T): T {
    this.geometries.push(geo);
    return geo;
  }

  private trackMat<T extends THREE.Material>(mat: T): T {
    this.materials.push(mat);
    return mat;
  }

  private registerPart(id: ComponentId, mesh: THREE.Mesh) {
    mesh.userData.componentId = id;
    this.clickableObjects.push(mesh);
    const arr = this.highlightableGroups.get(id) ?? [];
    arr.push(mesh);
    this.highlightableGroups.set(id, arr);
  }

  private setupLighting() {
    const hemi = new THREE.HemisphereLight(0xc2e5ff, 0x3f352b, 0.8);
    hemi.position.set(0, 30, 0);
    this.scene.add(hemi);

    // Warm sun key light
    const sun = new THREE.DirectionalLight(0xfff2de, 2.25);
    sun.position.set(14, 18, 12);
    sun.castShadow = !this.isSoftwareGl;
    sun.shadow.mapSize.set(this.isSoftwareGl ? 512 : 1024, this.isSoftwareGl ? 512 : 1024);
    sun.shadow.camera.near = 2;
    sun.shadow.camera.far = 48;
    const d = 13;
    sun.shadow.camera.left = -d;
    sun.shadow.camera.right = d;
    sun.shadow.camera.top = d;
    sun.shadow.camera.bottom = -d;
    sun.shadow.bias = -0.0005;
    sun.shadow.normalBias = 0.025;
    this.scene.add(sun);

    // Cool rim backlight
    const rim = new THREE.DirectionalLight(0x38bdf8, 0.85);
    rim.position.set(-14, 9, -12);
    this.scene.add(rim);

    // Dynamic teal interior reactor light (illuminates anaerobic slurry + bubbles during cutaway)
    this.reactorGlowLight = new THREE.PointLight(0x2dd4bf, 2.2, 6.5, 1.5);
    this.reactorGlowLight.position.set(0, 2.25, 0.6);
    this.scene.add(this.reactorGlowLight);

    // Dynamic methane flare light
    this.flareLight = new THREE.PointLight(0x38bdf8, 2.4, 5.5, 1.6);
    this.flareLight.position.set(5.35, 1.85, -4.2);
    this.scene.add(this.flareLight);
  }

  private buildEnvironmentTerrain() {
    const groundGeo = this.trackGeo(new THREE.CircleGeometry(70, 64));
    const groundMat = this.trackMat(
      new THREE.MeshStandardMaterial({
        map: this.textures.groundMap,
        roughness: 0.92,
        metalness: 0.02,
        color: 0x354b3a,
      })
    );
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.02;
    ground.receiveShadow = true;
    this.scene.add(ground);

    const grid = new THREE.GridHelper(30, 30, 0x334155, 0x1e293b);
    grid.position.y = 0.005;
    (grid.material as THREE.Material).transparent = true;
    (grid.material as THREE.Material).opacity = 0.22;
    this.scene.add(grid);

    // Concrete Plant Pad (extended west to accommodate Swine Pen Substrate Source & Feeding Channel)
    const padGeo = this.trackGeo(new THREE.BoxGeometry(20.6, 0.16, 10.8));
    const padMat = this.trackMat(
      new THREE.MeshStandardMaterial({
        map: this.textures.concreteMap,
        bumpMap: this.textures.concreteBump,
        bumpScale: 0.015,
        color: 0x94a3b8,
        roughness: 0.85,
        metalness: 0.05,
      })
    );
    const pad = new THREE.Mesh(padGeo, padMat);
    pad.position.set(-2.2, 0.08, -1.2);
    pad.receiveShadow = true;
    this.scene.add(pad);

    // Walkway concrete border curbing
    const walkwayMat = this.trackMat(
      new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.8, metalness: 0.08 })
    );
    const frontWalkway = new THREE.Mesh(this.trackGeo(new THREE.BoxGeometry(19.6, 0.02, 1.0)), walkwayMat);
    frontWalkway.position.set(-2.2, 0.17, 3.35);
    frontWalkway.receiveShadow = true;
    this.scene.add(frontWalkway);

    // Telemetry / Weather Mast on rear-left pad corner
    const mastPole = new THREE.Mesh(
      this.trackGeo(new THREE.CylinderGeometry(0.05, 0.07, 4.2, 10)),
      this.trackMat(new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.3, metalness: 0.85 }))
    );
    mastPole.position.set(-10.8, 2.26, -5.0);
    mastPole.castShadow = true;
    this.scene.add(mastPole);

    this.anemometerGroup.position.set(-10.8, 4.38, -5.0);
    const arm1 = new THREE.Mesh(
      this.trackGeo(new THREE.BoxGeometry(0.6, 0.03, 0.03)),
      this.trackMat(new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.4 }))
    );
    const arm2 = arm1.clone();
    arm2.rotation.y = Math.PI / 2;
    this.anemometerGroup.add(arm1, arm2);
    this.scene.add(this.anemometerGroup);

    // Perimeter fence posts
    const postGeo = this.trackGeo(new THREE.CylinderGeometry(0.06, 0.07, 1.15, 8));
    const postMat = this.trackMat(new THREE.MeshStandardMaterial({ color: 0x5c4632, roughness: 0.88 }));
    const postCount = 24;
    const postInst = new THREE.InstancedMesh(postGeo, postMat, postCount);
    postInst.castShadow = true;
    for (let i = 0; i < postCount; i++) {
      const t = i / (postCount - 1);
      _v1.set(-14 + t * 28, 0.56, -9.5);
      _quat.identity();
      _scale.set(1, 1, 1);
      _mat4.compose(_v1, _quat, _scale);
      postInst.setMatrixAt(i, _mat4);
    }
    postInst.computeBoundingSphere();
    this.scene.add(postInst);

    // Perimeter tropical tree silhouettes (InstancedMesh)
    const treeCount = 26;
    const trunkGeo = this.trackGeo(new THREE.CylinderGeometry(0.14, 0.24, 2.2, 7));
    const trunkMat = this.trackMat(new THREE.MeshStandardMaterial({ color: 0x4b382a, roughness: 0.92 }));
    const canopyGeo = this.trackGeo(new THREE.DodecahedronGeometry(1.35, 1));
    const canopyMat = this.trackMat(new THREE.MeshStandardMaterial({ color: 0x2f5a38, roughness: 0.85 }));

    const trunks = new THREE.InstancedMesh(trunkGeo, trunkMat, treeCount);
    const canopies = new THREE.InstancedMesh(canopyGeo, canopyMat, treeCount);
    const tint = new THREE.Color();

    for (let i = 0; i < treeCount; i++) {
      const angle = (i / treeCount) * Math.PI * 1.45 - Math.PI * 1.22;
      const dist = 17 + (i % 4) * 3.8;
      const tx = Math.cos(angle) * dist;
      const tz = Math.sin(angle) * dist - 2;
      const s = 0.85 + ((i * 37) % 30) / 100;

      _v1.set(tx, 1.05 * s, tz);
      _quat.identity();
      _scale.set(s, s, s);
      _mat4.compose(_v1, _quat, _scale);
      trunks.setMatrixAt(i, _mat4);

      _v1.set(tx, 2.55 * s, tz);
      _scale.set(s * 1.1, s * 0.95, s * 1.1);
      _mat4.compose(_v1, _quat, _scale);
      canopies.setMatrixAt(i, _mat4);

      tint.setHSL(0.35 + ((i % 5) - 2) * 0.015, 0.36, 0.26 + (i % 3) * 0.03);
      canopies.setColorAt(i, tint);
    }
    trunks.computeBoundingSphere();
    canopies.computeBoundingSphere();
    if (canopies.instanceColor) canopies.instanceColor.needsUpdate = true;
    this.scene.add(trunks, canopies);
  }

  private buildBiogasPlant() {
    const concreteMat = this.trackMat(
      new THREE.MeshStandardMaterial({
        map: this.textures.concreteMap,
        bumpMap: this.textures.concreteBump,
        bumpScale: 0.02,
        color: 0xb6bec7,
        roughness: 0.82,
        metalness: 0.04,
      })
    );

    const cutawayConcreteMat = this.trackMat(
      new THREE.MeshStandardMaterial({
        map: this.textures.concreteMap,
        bumpMap: this.textures.concreteBump,
        bumpScale: 0.02,
        color: 0xb6bec7,
        roughness: 0.82,
        metalness: 0.04,
        transparent: true,
        opacity: 1,
      })
    );

    const darkConcreteMat = this.trackMat(
      new THREE.MeshStandardMaterial({
        map: this.textures.concreteMap,
        color: 0x64748b,
        roughness: 0.88,
        metalness: 0.05,
      })
    );

    const steelMat = this.trackMat(
      new THREE.MeshStandardMaterial({
        map: this.textures.steelMap,
        color: 0xd0d7de,
        roughness: 0.28,
        metalness: 0.86,
      })
    );

    const brassMat = this.trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xd99b26,
        roughness: 0.24,
        metalness: 0.9,
      })
    );

    const upvcMat = this.trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x3b82f6,
        roughness: 0.32,
        metalness: 0.06,
      })
    );

    const gasPipeMat = this.trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        roughness: 0.3,
        metalness: 0.55,
      })
    );

    const handrailMat = this.trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xeab308,
        roughness: 0.38,
        metalness: 0.4,
      })
    );

    const slurryMat = this.trackMat(
      new THREE.MeshPhysicalMaterial({
        color: 0x264b3d,
        roughness: 0.2,
        metalness: 0.02,
        clearcoat: 0.72,
        clearcoatRoughness: 0.18,
      })
    );

    const gasLinerMat = this.trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x0f766e,
        roughness: 0.42,
        metalness: 0.12,
        side: THREE.DoubleSide,
      })
    );

    // ------------------------------------------------------------------
    // 1. GROUNDWATER DRAINAGE & GRAVEL APRON (drainage-trench)
    // ------------------------------------------------------------------
    const drainGroup = new THREE.Group();
    const gravelRingGeo = this.trackGeo(new THREE.RingGeometry(2.35, 3.05, 48));
    const gravelMat = this.trackMat(
      new THREE.MeshStandardMaterial({
        map: this.textures.gravelMap,
        roughness: 0.95,
        metalness: 0.02,
        color: 0x94a3b8,
      })
    );
    const gravelRing = new THREE.Mesh(gravelRingGeo, gravelMat);
    gravelRing.rotation.x = -Math.PI / 2;
    gravelRing.position.set(0, 0.175, 0);
    gravelRing.receiveShadow = true;
    this.registerPart('drainage-trench', gravelRing);
    drainGroup.add(gravelRing);

    // Upslope French drain deficiency indicator bar
    const swaleGeo = this.trackGeo(new THREE.BoxGeometry(7.2, 0.08, 0.36));
    const swaleMat = this.trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xd97706,
        roughness: 0.55,
        metalness: 0.15,
      })
    );
    const swaleMesh = new THREE.Mesh(swaleGeo, swaleMat);
    swaleMesh.position.set(0, 0.19, -3.55);
    this.registerPart('drainage-trench', swaleMesh);
    drainGroup.add(swaleMesh);
    this.scene.add(drainGroup);

    // ------------------------------------------------------------------
    // 2. SUBSTRATE SOURCE, 0.4% CONCRETE FEEDING CHANNEL & COLLECTING TANK
    // ------------------------------------------------------------------
    // 2A. Swine Housing Substrate Source Apron (x = -10.1)
    const sourceGroup = new THREE.Group();
    sourceGroup.position.set(-10.1, 0.16, 0);

    const penFloor = new THREE.Mesh(this.trackGeo(new THREE.BoxGeometry(2.2, 0.62, 2.8)), darkConcreteMat);
    penFloor.position.set(0, 0.31, 0);
    penFloor.castShadow = true;
    penFloor.receiveShadow = true;
    this.registerPart('substrate-source', penFloor);
    sourceGroup.add(penFloor);

    // Low concrete pen curb walls + galvanized swine pen guard rails
    const penBackWall = new THREE.Mesh(this.trackGeo(new THREE.BoxGeometry(0.14, 0.65, 2.8)), concreteMat);
    penBackWall.position.set(-1.03, 0.94, 0);
    const penSideN = new THREE.Mesh(this.trackGeo(new THREE.BoxGeometry(2.2, 0.65, 0.14)), concreteMat);
    penSideN.position.set(0, 0.94, -1.33);
    const penSideS = penSideN.clone();
    penSideS.position.set(0, 0.94, 1.33);
    this.registerPart('substrate-source', penBackWall);
    this.registerPart('substrate-source', penSideN);
    this.registerPart('substrate-source', penSideS);
    sourceGroup.add(penBackWall, penSideN, penSideS);

    const penRailPostPositions: [number, number][] = [
      [-0.95, -1.25],
      [0.95, -1.25],
      [-0.95, 1.25],
      [0.95, 1.25],
    ];
    penRailPostPositions.forEach(([px, pz]) => {
      const pPost = new THREE.Mesh(this.trackGeo(new THREE.CylinderGeometry(0.035, 0.035, 0.62, 8)), steelMat);
      pPost.position.set(px, 1.54, pz);
      this.registerPart('substrate-source', pPost);
      sourceGroup.add(pPost);
    });
    const penRailN = new THREE.Mesh(this.trackGeo(new THREE.BoxGeometry(1.94, 0.04, 0.04)), handrailMat);
    penRailN.position.set(0, 1.78, -1.25);
    const penRailS = penRailN.clone();
    penRailS.position.set(0, 1.78, 1.25);
    this.registerPart('substrate-source', penRailN);
    this.registerPart('substrate-source', penRailS);
    sourceGroup.add(penRailN, penRailS);

    // Raw manure washdown sump at source discharge
    const rawSump = new THREE.Mesh(this.trackGeo(new THREE.BoxGeometry(1.3, 0.14, 1.6)), slurryMat);
    rawSump.position.set(0.15, 0.66, 0);
    this.registerPart('substrate-source', rawSump);
    sourceGroup.add(rawSump);
    this.scene.add(sourceGroup);

    // 2B. Concrete Feeding Channel (x = -9.05 to x = -6.05) — pivots smoothly from 0.4% Baseline to >= 2.0% PAES Retrofit
    const channelGroup = new THREE.Group();
    const channelLen = 3.05;

    // Pivot at collecting-tank discharge lip (-6.05, 0.85, 0) so east connection stays anchored as west end elevates
    this.channelTiltGroup.position.set(-6.05, 0.85, 0);
    this.channelTiltGroup.rotation.z = -0.004; // Baseline 0.4% nearly flat measured slope

    // Deep concrete foundation skirt keeps channel solidly grounded even when elevated to PAES >= 2.0% retrofit slope
    const channelBed = new THREE.Mesh(this.trackGeo(new THREE.BoxGeometry(channelLen, 1.06, 0.72)), concreteMat);
    channelBed.position.set(-1.47, -0.54, 0);
    channelBed.castShadow = true;
    channelBed.receiveShadow = true;
    this.registerPart('feeding-channel', channelBed);

    const chWallN = new THREE.Mesh(this.trackGeo(new THREE.BoxGeometry(channelLen, 0.34, 0.1)), concreteMat);
    chWallN.position.set(-1.47, 0.14, -0.31);
    chWallN.castShadow = true;
    this.registerPart('feeding-channel', chWallN);

    const chWallS = new THREE.Mesh(this.trackGeo(new THREE.BoxGeometry(channelLen, 0.34, 0.1)), concreteMat);
    chWallS.position.set(-1.47, 0.14, 0.31);
    chWallS.castShadow = true;
    this.registerPart('feeding-channel', chWallS);

    // Slurry ribbon inside the feeding channel
    const chSlurry = new THREE.Mesh(this.trackGeo(new THREE.BoxGeometry(channelLen - 0.05, 0.1, 0.48)), slurryMat);
    chSlurry.position.set(-1.47, 0.04, 0);
    this.registerPart('feeding-channel', chSlurry);

    this.channelTiltGroup.add(channelBed, chWallN, chWallS, chSlurry);

    // Visual PAES Sec 7.1.1 reference slope benchmark rail (crimson in baseline, emerald when retrofit aligns with it)
    this.reqSlopeBarMat = this.trackMat(
      new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.82 })
    );
    const reqSlopeBar = new THREE.Mesh(this.trackGeo(new THREE.BoxGeometry(channelLen, 0.035, 0.035)), this.reqSlopeBarMat);
    reqSlopeBar.position.set(-7.52, 1.32, 0.39);
    reqSlopeBar.rotation.z = -0.085;
    this.registerPart('feeding-channel', reqSlopeBar);

    channelGroup.add(this.channelTiltGroup, reqSlopeBar);
    this.scene.add(channelGroup);

    // 2C. Collecting Tank (x = -5.1)
    const mixingGroup = new THREE.Group();
    mixingGroup.position.set(-5.1, 0.16, 0);

    const mBase = new THREE.Mesh(this.trackGeo(new THREE.BoxGeometry(2.1, 0.16, 1.8)), darkConcreteMat);
    mBase.position.y = 0.08;
    mBase.castShadow = true;
    mBase.receiveShadow = true;
    this.registerPart('mixing-tank', mBase);
    mixingGroup.add(mBase);

    const wallSpecs: [number, number, number, number, number, number][] = [
      [2.1, 1.35, 0.16, 0, 0.83, -0.82],
      [2.1, 1.35, 0.16, 0, 0.83, 0.82],
      [0.16, 1.35, 1.48, -0.97, 0.83, 0],
      [0.16, 1.35, 1.48, 0.97, 0.83, 0],
    ];
    wallSpecs.forEach(([w, h, d, x, y, z]) => {
      const wall = new THREE.Mesh(this.trackGeo(new THREE.BoxGeometry(w, h, d)), concreteMat);
      wall.position.set(x, y, z);
      wall.castShadow = true;
      wall.receiveShadow = true;
      this.registerPart('mixing-tank', wall);
      mixingGroup.add(wall);
    });

    const mixSlurry = new THREE.Mesh(this.trackGeo(new THREE.BoxGeometry(1.76, 0.75, 1.46)), slurryMat);
    mixSlurry.position.set(0, 0.56, 0);
    this.registerPart('mixing-tank', mixSlurry);
    mixingGroup.add(mixSlurry);

    const screenFrame = new THREE.Mesh(this.trackGeo(new THREE.BoxGeometry(0.06, 1.05, 1.42)), steelMat);
    screenFrame.position.set(0.45, 0.92, 0);
    screenFrame.rotation.z = -0.25;
    this.registerPart('mixing-tank', screenFrame);
    mixingGroup.add(screenFrame);

    const bridge = new THREE.Mesh(this.trackGeo(new THREE.BoxGeometry(2.2, 0.08, 0.24)), steelMat);
    bridge.position.set(0, 1.55, 0);
    bridge.castShadow = true;
    this.registerPart('mixing-tank', bridge);
    mixingGroup.add(bridge);

    // Safety yellow handrail on tank bridge
    const railTop = new THREE.Mesh(this.trackGeo(new THREE.BoxGeometry(2.15, 0.04, 0.04)), handrailMat);
    railTop.position.set(0, 2.02, -0.1);
    const railPostL = new THREE.Mesh(this.trackGeo(new THREE.CylinderGeometry(0.02, 0.02, 0.48, 8)), handrailMat);
    railPostL.position.set(-0.98, 1.79, -0.1);
    const railPostR = railPostL.clone();
    railPostR.position.set(0.98, 1.79, -0.1);
    this.registerPart('mixing-tank', railTop);
    mixingGroup.add(railTop, railPostL, railPostR);

    const motor = new THREE.Mesh(this.trackGeo(new THREE.CylinderGeometry(0.18, 0.2, 0.34, 16)), brassMat);
    motor.position.set(-0.2, 1.76, 0);
    motor.castShadow = true;
    this.registerPart('mixing-tank', motor);
    mixingGroup.add(motor);

    this.agitatorBladeGroup.position.set(-0.2, 0.9, 0);
    const shaft = new THREE.Mesh(this.trackGeo(new THREE.CylinderGeometry(0.035, 0.035, 1.4, 12)), steelMat);
    shaft.position.y = 0.15;
    const blade1 = new THREE.Mesh(this.trackGeo(new THREE.BoxGeometry(0.85, 0.14, 0.04)), steelMat);
    blade1.position.y = -0.35;
    const blade2 = new THREE.Mesh(this.trackGeo(new THREE.BoxGeometry(0.04, 0.14, 0.85)), steelMat);
    blade2.position.y = -0.15;
    this.agitatorBladeGroup.add(shaft, blade1, blade2);
    mixingGroup.add(this.agitatorBladeGroup);

    this.scene.add(mixingGroup);

    // ------------------------------------------------------------------
    // 3. PVC INLET PIPE (inlet-pipe) — 0.06 m Baseline vs. >= 0.20 m PAES 413 Sec 6.2 Retrofit
    // ------------------------------------------------------------------
    this.baselineInletMat = this.trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xe2e8f0,
        roughness: 0.26,
        metalness: 0.06,
        transparent: true,
        opacity: 1,
      })
    );

    this.inletCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-4.15, 0.82, 0),
      new THREE.Vector3(-3.0, 0.58, 0),
      new THREE.Vector3(-1.9, 0.38, 0),
      new THREE.Vector3(-1.35, 0.34, 0),
    ]);
    // Slender 0.045 radius visually highlights the undersized 0.06 m (6 cm) baseline PVC pipe
    const inletGeo = this.trackGeo(new THREE.TubeGeometry(this.inletCurve, 24, 0.045, 14, false));
    this.baselineInletPipe = new THREE.Mesh(inletGeo, this.baselineInletMat);
    this.baselineInletPipe.castShadow = true;
    this.registerPart('inlet-pipe', this.baselineInletPipe);
    this.scene.add(this.baselineInletPipe);

    // PAES 413:2001 Sec 6.2 Compliant Retrofit Pipe (>= 0.20 m / 20 cm full-bore uPVC)
    this.retrofitInletMat = this.trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x34d399,
        roughness: 0.28,
        metalness: 0.12,
        transparent: true,
        opacity: 0,
      })
    );
    const retrofitInletGeo = this.trackGeo(new THREE.TubeGeometry(this.inletCurve, 28, 0.14, 18, false));
    this.retrofitInletPipe = new THREE.Mesh(retrofitInletGeo, this.retrofitInletMat);
    this.retrofitInletPipe.castShadow = true;
    this.retrofitInletPipe.visible = false;
    this.registerPart('inlet-pipe', this.retrofitInletPipe);
    this.scene.add(this.retrofitInletPipe);

    // Reinforced coupling collars shown when the 0.20 m retrofit pipe is active
    const collarGeo = this.trackGeo(new THREE.CylinderGeometry(0.185, 0.185, 0.12, 18));
    const collarWest = new THREE.Mesh(collarGeo, steelMat);
    collarWest.position.set(-3.88, 0.76, 0);
    collarWest.rotation.z = Math.PI / 2 - 0.2;
    const collarEast = new THREE.Mesh(collarGeo, steelMat);
    collarEast.position.set(-2.12, 0.42, 0);
    collarEast.rotation.z = Math.PI / 2 - 0.18;
    this.registerPart('inlet-pipe', collarWest);
    this.registerPart('inlet-pipe', collarEast);
    this.retrofitFlangeGroup.add(collarWest, collarEast);
    this.retrofitFlangeGroup.visible = false;
    this.scene.add(this.retrofitFlangeGroup);

    // Translucent PAES Sec 6.2 0.20 m (20 cm) Required Diameter Comparison Sleeve around the 6 cm pipe
    const reqBoreGeo = this.trackGeo(new THREE.CylinderGeometry(0.14, 0.14, 1.35, 18, 1, true));
    this.reqBoreMat = this.trackMat(
      new THREE.MeshBasicMaterial({
        color: 0xef4444,
        wireframe: true,
        transparent: true,
        opacity: 0.55,
      })
    );
    this.reqBoreMesh = new THREE.Mesh(reqBoreGeo, this.reqBoreMat);
    this.reqBoreMesh.position.set(-2.95, 0.57, 0);
    this.reqBoreMesh.rotation.z = Math.PI / 2 - 0.19;
    this.registerPart('inlet-pipe', this.reqBoreMesh);

    const flange = new THREE.Mesh(this.trackGeo(new THREE.CylinderGeometry(0.16, 0.16, 0.09, 16)), steelMat);
    flange.position.set(-2.12, 0.42, 0);
    flange.rotation.z = Math.PI / 2 - 0.18;
    this.registerPart('inlet-pipe', flange);
    this.scene.add(this.reqBoreMesh, flange);

    // Animated restricted slurry droplets along the narrow 0.06 m PVC inlet pipe
    const slurryDropCount = 10;
    const dropGeo = this.trackGeo(new THREE.SphereGeometry(0.036, 8, 8));
    const dropMat = this.trackMat(
      new THREE.MeshBasicMaterial({ color: 0x34d399, transparent: true, opacity: 0.88 })
    );
    this.slurryFlowMesh = new THREE.InstancedMesh(dropGeo, dropMat, slurryDropCount);
    this.slurryFlowMesh.frustumCulled = false;
    for (let i = 0; i < slurryDropCount; i++) {
      this.slurryFlowOffsets.push(i / slurryDropCount);
    }
    this.scene.add(this.slurryFlowMesh);

    // ------------------------------------------------------------------
    // 4. ANAEROBIC DIGESTER & INTERNAL BAFFLE (digester-shell)
    // ------------------------------------------------------------------
    const digesterRoot = new THREE.Group();
    digesterRoot.position.set(0, 0.16, 0);

    const floorDisk = new THREE.Mesh(
      this.trackGeo(new THREE.CylinderGeometry(2.3, 2.35, 0.18, 48)),
      darkConcreteMat
    );
    floorDisk.position.y = 0.09;
    floorDisk.receiveShadow = true;
    this.registerPart('digester-shell', floorDisk);
    digesterRoot.add(floorDisk);

    const backWallGeo = this.trackGeo(
      new THREE.CylinderGeometry(2.15, 2.15, 2.25, 48, 1, true, Math.PI * 0.5, Math.PI)
    );
    const backWallMat = concreteMat.clone();
    backWallMat.side = THREE.DoubleSide;
    this.trackMat(backWallMat);
    const backWall = new THREE.Mesh(backWallGeo, backWallMat);
    backWall.position.y = 1.3;
    backWall.castShadow = true;
    backWall.receiveShadow = true;
    this.registerPart('digester-shell', backWall);
    digesterRoot.add(backWall);

    const outerBackGeo = this.trackGeo(
      new THREE.CylinderGeometry(2.3, 2.3, 2.25, 48, 1, true, Math.PI * 0.5, Math.PI)
    );
    const outerBack = new THREE.Mesh(outerBackGeo, concreteMat);
    outerBack.position.y = 1.3;
    outerBack.castShadow = true;
    this.registerPart('digester-shell', outerBack);
    digesterRoot.add(outerBack);

    const frontWallGeo = this.trackGeo(
      new THREE.CylinderGeometry(2.28, 2.28, 2.25, 48, 1, false, -Math.PI * 0.5, Math.PI)
    );
    this.frontWallMesh = new THREE.Mesh(frontWallGeo, cutawayConcreteMat);
    this.frontWallMesh.position.y = 1.3;
    this.registerPart('digester-shell', this.frontWallMesh);
    this.frontShellGroup.add(this.frontWallMesh);

    const baffleMesh = new THREE.Mesh(
      this.trackGeo(new THREE.BoxGeometry(0.18, 1.35, 3.85)),
      darkConcreteMat
    );
    baffleMesh.position.set(0, 0.85, 0);
    baffleMesh.castShadow = true;
    this.registerPart('digester-shell', baffleMesh);
    this.baffleAndSlurryGroup.add(baffleMesh);

    const slurryCyl = new THREE.Mesh(
      this.trackGeo(new THREE.CylinderGeometry(2.08, 2.08, 1.72, 48)),
      slurryMat
    );
    slurryCyl.position.y = 1.04;
    this.registerPart('digester-shell', slurryCyl);

    const surfaceGeo = this.trackGeo(new THREE.CircleGeometry(2.07, 48, 0, Math.PI * 2));
    surfaceGeo.rotateX(-Math.PI / 2);
    this.slurrySurfaceMesh = new THREE.Mesh(surfaceGeo, slurryMat);
    this.slurrySurfaceMesh.position.y = 1.92;
    this.registerPart('digester-shell', this.slurrySurfaceMesh);
    this.baffleAndSlurryGroup.add(slurryCyl, this.slurrySurfaceMesh);

    // Rising methane bubbles inside digester
    const bubbleCount = 100;
    const bubbleGeo = this.trackGeo(new THREE.SphereGeometry(0.048, 10, 10));
    const bubbleMat = this.trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x5eead4,
        emissive: 0x14b8a6,
        emissiveIntensity: 0.85,
        roughness: 0.15,
        metalness: 0.1,
      })
    );
    this.bubbleMesh = new THREE.InstancedMesh(bubbleGeo, bubbleMat, bubbleCount);
    this.bubbleMesh.frustumCulled = false;
    for (let i = 0; i < bubbleCount; i++) {
      this.bubbleData.push({
        angle: (i * 2.39996) % (Math.PI * 2),
        radius: 0.3 + ((i * 19) % 100) / 62,
        y: 0.35 + ((i * 37) % 100) / 60,
        speed: 0.38 + ((i * 13) % 10) * 0.05,
        size: 0.68 + ((i * 7) % 8) * 0.1,
      });
    }
    this.baffleAndSlurryGroup.add(this.bubbleMesh);
    digesterRoot.add(this.baffleAndSlurryGroup);

    // ------------------------------------------------------------------
    // 5. FIXED-DOME GAS CHAMBER & GAS-PROOFING LINER (gas-dome)
    // ------------------------------------------------------------------
    const linerGeo = this.trackGeo(
      new THREE.SphereGeometry(2.14, 48, 24, Math.PI * 0.5, Math.PI, 0, Math.PI * 0.5)
    );
    const linerMesh = new THREE.Mesh(linerGeo, gasLinerMat);
    linerMesh.position.y = 2.42;
    linerMesh.scale.set(1, 0.72, 1);
    this.registerPart('gas-dome', linerMesh);
    this.linerGroup.add(linerMesh);
    digesterRoot.add(this.linerGroup);

    const backDomeGeo = this.trackGeo(
      new THREE.SphereGeometry(2.3, 48, 24, Math.PI * 0.5, Math.PI, 0, Math.PI * 0.5)
    );
    const backDomeMat = concreteMat.clone();
    backDomeMat.side = THREE.DoubleSide;
    this.trackMat(backDomeMat);
    const backDome = new THREE.Mesh(backDomeGeo, backDomeMat);
    backDome.position.y = 2.42;
    backDome.scale.set(1, 0.74, 1);
    backDome.castShadow = true;
    this.registerPart('gas-dome', backDome);
    this.domeCapGroup.add(backDome);

    const frontDomeGeo = this.trackGeo(
      new THREE.SphereGeometry(2.3, 48, 24, -Math.PI * 0.5, Math.PI, 0, Math.PI * 0.5)
    );
    this.frontDomeMesh = new THREE.Mesh(frontDomeGeo, cutawayConcreteMat);
    this.frontDomeMesh.position.y = 2.42;
    this.frontDomeMesh.scale.set(1, 0.74, 1);
    this.registerPart('gas-dome', this.frontDomeMesh);
    this.frontShellGroup.add(this.frontDomeMesh);

    const collar = new THREE.Mesh(
      this.trackGeo(new THREE.TorusGeometry(2.3, 0.1, 14, 48)),
      darkConcreteMat
    );
    collar.rotation.x = Math.PI / 2;
    collar.position.y = 2.42;
    this.registerPart('gas-dome', collar);
    this.domeCapGroup.add(collar);

    const turret = new THREE.Mesh(this.trackGeo(new THREE.CylinderGeometry(0.55, 0.62, 0.34, 24)), steelMat);
    turret.position.y = 4.14;
    turret.castShadow = true;
    this.registerPart('gas-dome', turret);

    const valveStem = new THREE.Mesh(this.trackGeo(new THREE.CylinderGeometry(0.06, 0.06, 0.45, 12)), brassMat);
    valveStem.position.set(0, 4.45, 0);
    const handwheel = new THREE.Mesh(
      this.trackGeo(new THREE.TorusGeometry(0.16, 0.03, 10, 20)),
      this.trackMat(new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.35, metalness: 0.3 }))
    );
    handwheel.rotation.x = Math.PI / 2;
    handwheel.position.set(0, 4.66, 0);
    this.registerPart('gas-dome', valveStem);
    this.registerPart('gas-dome', handwheel);
    this.domeCapGroup.add(turret, valveStem, handwheel);

    digesterRoot.add(this.domeCapGroup, this.frontShellGroup);
    this.scene.add(digesterRoot);

    // ------------------------------------------------------------------
    // 6. GAS SAFETY MANIFOLD, MANOMETER & H2S SCRUBBER (safety-skid)
    // ------------------------------------------------------------------
    this.safetyManifoldGroup.position.set(1.6, 0.16, -2.5);

    const rackFrame = new THREE.Mesh(this.trackGeo(new THREE.BoxGeometry(1.6, 2.2, 0.12)), steelMat);
    rackFrame.position.set(0, 1.1, -0.2);
    rackFrame.castShadow = true;
    this.registerPart('safety-skid', rackFrame);
    this.safetyManifoldGroup.add(rackFrame);

    const dialHousing = new THREE.Mesh(this.trackGeo(new THREE.CylinderGeometry(0.24, 0.24, 0.1, 24)), brassMat);
    dialHousing.rotation.x = Math.PI / 2;
    dialHousing.position.set(-0.4, 1.75, -0.08);
    const dialFace = new THREE.Mesh(
      this.trackGeo(new THREE.CircleGeometry(0.21, 24)),
      this.trackMat(new THREE.MeshStandardMaterial({ map: this.textures.gaugeMap, roughness: 0.4 }))
    );
    dialFace.position.set(-0.4, 1.75, -0.025);
    this.registerPart('safety-skid', dialHousing);
    this.registerPart('safety-skid', dialFace);

    const scrubberBody = new THREE.Mesh(
      this.trackGeo(new THREE.CylinderGeometry(0.26, 0.26, 1.15, 20)),
      this.trackMat(new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.42, metalness: 0.45 }))
    );
    scrubberBody.position.set(0.38, 0.95, 0);
    scrubberBody.castShadow = true;
    this.registerPart('safety-skid', scrubberBody);

    const flameArrestor = new THREE.Mesh(this.trackGeo(new THREE.CylinderGeometry(0.14, 0.14, 0.34, 16)), brassMat);
    flameArrestor.rotation.z = Math.PI / 2;
    flameArrestor.position.set(-0.05, 1.4, 0);
    this.registerPart('safety-skid', flameArrestor);

    this.safetyManifoldGroup.add(dialHousing, dialFace, scrubberBody, flameArrestor);
    this.scene.add(this.safetyManifoldGroup);

    // ------------------------------------------------------------------
    // 7. OUTLET / DISPLACEMENT & SLUDGE TANK (outlet-tank) at x = +5.0
    // ------------------------------------------------------------------
    const outletGroup = new THREE.Group();
    outletGroup.position.set(5.0, 0.16, 0);

    const oBase = new THREE.Mesh(this.trackGeo(new THREE.BoxGeometry(2.3, 0.16, 2.0)), darkConcreteMat);
    oBase.position.y = 0.08;
    oBase.receiveShadow = true;
    this.registerPart('outlet-tank', oBase);
    outletGroup.add(oBase);

    const oWalls: [number, number, number, number, number, number][] = [
      [2.3, 1.55, 0.16, 0, 0.93, -0.92],
      [2.3, 1.55, 0.16, 0, 0.93, 0.92],
      [0.16, 1.55, 1.68, -1.07, 0.93, 0],
      [0.16, 1.35, 1.68, 1.07, 0.83, 0],
    ];
    oWalls.forEach(([w, h, d, x, y, z]) => {
      const m = new THREE.Mesh(this.trackGeo(new THREE.BoxGeometry(w, h, d)), concreteMat);
      m.position.set(x, y, z);
      m.castShadow = true;
      m.receiveShadow = true;
      this.registerPart('outlet-tank', m);
      outletGroup.add(m);
    });

    this.outletSlurryMesh = new THREE.Mesh(this.trackGeo(new THREE.BoxGeometry(1.96, 1.05, 1.66)), slurryMat);
    this.outletSlurryMesh.position.set(0, 0.72, 0);
    this.registerPart('outlet-tank', this.outletSlurryMesh);
    outletGroup.add(this.outletSlurryMesh);

    for (let i = -3; i <= 3; i++) {
      const bar = new THREE.Mesh(this.trackGeo(new THREE.BoxGeometry(2.05, 0.04, 0.05)), steelMat);
      bar.position.set(0, 1.72, i * 0.24);
      this.registerPart('outlet-tank', bar);
      outletGroup.add(bar);
    }

    const outPipe = new THREE.Mesh(this.trackGeo(new THREE.CylinderGeometry(0.12, 0.12, 2.2, 14)), upvcMat);
    outPipe.rotation.z = Math.PI / 2;
    outPipe.position.set(-2.05, 0.72, 0);
    this.registerPart('outlet-tank', outPipe);
    outletGroup.add(outPipe);

    this.scene.add(outletGroup);

    // ------------------------------------------------------------------
    // 8. BIOGAS UTILIZATION SKID & GAS PIPELINE (utilization-genset)
    // ------------------------------------------------------------------
    const utilGroup = new THREE.Group();
    utilGroup.position.set(4.6, 0.16, -4.2);

    const skidPad = new THREE.Mesh(this.trackGeo(new THREE.BoxGeometry(2.6, 0.14, 1.7)), darkConcreteMat);
    skidPad.position.y = 0.07;
    skidPad.receiveShadow = true;
    this.registerPart('utilization-genset', skidPad);

    const gensetBody = new THREE.Mesh(
      this.trackGeo(new THREE.BoxGeometry(1.35, 0.92, 0.85)),
      this.trackMat(new THREE.MeshStandardMaterial({ color: 0x0f766e, roughness: 0.35, metalness: 0.5 }))
    );
    gensetBody.position.set(-0.4, 0.6, 0);
    gensetBody.castShadow = true;
    this.registerPart('utilization-genset', gensetBody);

    const exhaust = new THREE.Mesh(this.trackGeo(new THREE.CylinderGeometry(0.06, 0.06, 0.9, 12)), steelMat);
    exhaust.position.set(-0.75, 1.4, -0.2);
    this.registerPart('utilization-genset', exhaust);

    const flareStand = new THREE.Mesh(this.trackGeo(new THREE.CylinderGeometry(0.11, 0.15, 1.25, 16)), steelMat);
    flareStand.position.set(0.75, 0.75, 0);
    flareStand.castShadow = true;
    this.registerPart('utilization-genset', flareStand);

    const flameMat = this.trackMat(
      new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.92,
      })
    );
    const outerFlame = new THREE.Mesh(this.trackGeo(new THREE.ConeGeometry(0.16, 0.5, 12)), flameMat);
    outerFlame.position.y = 0.24;
    const innerFlame = new THREE.Mesh(
      this.trackGeo(new THREE.ConeGeometry(0.08, 0.3, 10)),
      this.trackMat(new THREE.MeshBasicMaterial({ color: 0xe0f2fe }))
    );
    innerFlame.position.y = 0.17;
    this.flameGroup.add(outerFlame, innerFlame);
    this.flameGroup.position.set(0.75, 1.4, 0);
    utilGroup.add(this.flameGroup);

    const bollardPos: [number, number][] = [
      [-1.18, -0.74],
      [1.18, -0.74],
      [-1.18, 0.74],
      [1.18, 0.74],
    ];
    bollardPos.forEach(([bx, bz]) => {
      const b = new THREE.Mesh(this.trackGeo(new THREE.CylinderGeometry(0.055, 0.055, 0.72, 10)), gasPipeMat);
      b.position.set(bx, 0.46, bz);
      b.castShadow = true;
      this.registerPart('utilization-genset', b);
      utilGroup.add(b);
    });

    utilGroup.add(skidPad, gensetBody, exhaust, flareStand);
    this.scene.add(utilGroup);

    this.gasCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 4.5, 0),
      new THREE.Vector3(0.8, 4.45, -1.3),
      new THREE.Vector3(1.6, 2.0, -2.5),
      new THREE.Vector3(2.8, 1.4, -3.3),
      new THREE.Vector3(4.2, 0.95, -4.2),
    ]);
    const gasTube = new THREE.Mesh(
      this.trackGeo(new THREE.TubeGeometry(this.gasCurve, 40, 0.055, 10, false)),
      gasPipeMat
    );
    gasTube.castShadow = true;
    this.registerPart('safety-skid', gasTube);
    this.scene.add(gasTube);

    const gasCount = 16;
    const pulseGeo = this.trackGeo(new THREE.SphereGeometry(0.08, 10, 10));
    const pulseMat = this.trackMat(
      new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.88 })
    );
    this.gasFlowMesh = new THREE.InstancedMesh(pulseGeo, pulseMat, gasCount);
    this.gasFlowMesh.frustumCulled = false;
    for (let i = 0; i < gasCount; i++) {
      this.gasOffsets.push(i / gasCount);
    }
    this.scene.add(this.gasFlowMesh);

    const statusMap: [ComponentId, [number, number, number], number, number][] = [
      ['substrate-source', [-10.1, 0.19, 0], 1.65, 0x10b981],
      ['feeding-channel', [-7.52, 0.19, 0], 1.25, 0xef4444],
      ['mixing-tank', [-5.1, 0.19, 0], 1.35, 0x10b981],
      ['inlet-pipe', [-2.95, 0.19, 0], 0.95, 0xef4444],
      ['digester-shell', [0, 0.19, 0], 2.55, 0x10b981],
      ['safety-skid', [1.6, 0.19, -2.5], 1.15, 0x10b981],
      ['outlet-tank', [5.0, 0.19, 0], 1.45, 0x10b981],
      ['utilization-genset', [4.6, 0.19, -4.2], 1.55, 0xef4444],
    ];
    statusMap.forEach(([id, pos, rad, color]) => {
      const rGeo = this.trackGeo(new THREE.RingGeometry(rad, rad + 0.09, 36));
      const rMat = this.trackMat(
        new THREE.MeshBasicMaterial({
          color,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.72,
        })
      );
      const ring = new THREE.Mesh(rGeo, rMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(pos[0], pos[1], pos[2]);
      this.componentStatusRings.set(id, ring);
      this.scene.add(ring);
    });
  }

  public updateState(next: Partial<SceneControlState>) {
    if (next.cameraPreset && next.cameraPreset !== this.state.cameraPreset) {
      const preset = CAMERA_PRESETS[next.cameraPreset];
      this.targetCamPos.set(...preset.position);
      this.targetLookAt.set(...preset.target);
      this.cameraTransitionActive = true;
    }
    this.state = { ...this.state, ...next };

    this.componentStatusRings.forEach((ring) => {
      ring.visible = this.state.showComplianceHighlights;
    });

    this.highlightableGroups.forEach((meshes, id) => {
      const isSelected = this.state.selectedComponent === id;
      meshes.forEach((mesh) => {
        const mat = mesh.material as THREE.MeshStandardMaterial;
        if (mat && 'emissive' in mat) {
          if (isSelected) {
            mat.emissive.setHex(0x0ea5e9);
            mat.emissiveIntensity = 0.28;
          } else {
            mat.emissive.setHex(0x000000);
            mat.emissiveIntensity = 0;
          }
        }
      });
    });
  }

  public focusComponent(id: ComponentId) {
    const presetMap: Record<ComponentId, CameraPresetKey> = {
      'substrate-source': 'mixing',
      'feeding-channel': 'mixing',
      'mixing-tank': 'mixing',
      'inlet-pipe': 'mixing',
      'digester-shell': 'digester',
      'gas-dome': 'dome',
      'safety-skid': 'dome',
      'outlet-tank': 'outlet',
      'drainage-trench': 'overview',
      'utilization-genset': 'utilization',
    };
    this.updateState({
      selectedComponent: id,
      cameraPreset: presetMap[id],
    });
  }

  private updateHotspotProjections() {
    const width = this.container.clientWidth || 960;
    const height = this.container.clientHeight || 540;

    for (let i = 0; i < COMPONENT_ORDER.length; i++) {
      const id = COMPONENT_ORDER[i];
      const base = BASE_HOTSPOT_ANCHORS[id];
      let ax = base[0];
      let ay = base[1];
      const az = base[2];

      if (id === 'gas-dome') {
        ay += this.currentExplode * 2.6;
      } else if (id === 'safety-skid') {
        ax += this.currentExplode * 1.1;
      } else if (id === 'feeding-channel') {
        ay += this.currentRetrofit * 0.16;
      }

      _projVec.set(ax, ay, az);
      _projVec.project(this.camera);

      const inFront = _projVec.z >= -1 && _projVec.z <= 1;
      const sx = ((_projVec.x + 1) * 0.5) * width;
      const sy = ((-_projVec.y + 1) * 0.5) * height;
      const inBounds = sx >= 16 && sx <= width - 16 && sy >= 16 && sy <= height - 16;

      this.projectedHotspots[i].x = sx;
      this.projectedHotspots[i].y = sy;
      this.projectedHotspots[i].visible = this.state.showHotspots && inFront && inBounds;
    }

    this.onHotspotsUpdateCallback(this.projectedHotspots);
  }

  private bindEvents() {
    const canvas = this.renderer.domElement;

    const onResize = () => {
      if (this.disposed) return;
      const w = this.container.clientWidth || 960;
      const h = this.container.clientHeight || 540;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    const updatePointer = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      this.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const onPointerDown = (e: PointerEvent) => {
      this.pointerDownPos = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = (e: PointerEvent) => {
      const dx = e.clientX - this.pointerDownPos.x;
      const dy = e.clientY - this.pointerDownPos.y;
      if (Math.hypot(dx, dy) > 6) return;

      updatePointer(e);
      this.raycaster.setFromCamera(this.pointer, this.camera);
      const hits = this.raycaster.intersectObjects(this.clickableObjects, false);
      const visibleHit = hits.find((h) => h.object.visible);
      if (visibleHit && visibleHit.object.userData.componentId) {
        const id = visibleHit.object.userData.componentId as ComponentId;
        this.focusComponent(id);
        this.onSelectCallback(id);
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      const now = performance.now();
      if (now - this.lastHoverCheck < 50) return;
      this.lastHoverCheck = now;

      updatePointer(e);
      this.raycaster.setFromCamera(this.pointer, this.camera);
      const hits = this.raycaster.intersectObjects(this.clickableObjects, false);
      const visibleHit = hits.find((h) => h.object.visible);
      const nextHover = visibleHit ? (visibleHit.object.userData.componentId as ComponentId) : null;
      if (nextHover !== this.hoveredId) {
        this.hoveredId = nextHover;
        canvas.style.cursor = nextHover ? 'pointer' : 'grab';
      }
    };

    const onContextLost = (e: Event) => {
      e.preventDefault();
      this.contextIsLost = true;
      cancelAnimationFrame(this.frameId);
      clearTimeout(this.frameId);
      this.onContextLostCallback();
    };
    const onContextRestored = () => {
      this.contextIsLost = false;
      this.onContextRestoredCallback();
      this.startLoop();
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('webglcontextlost', onContextLost);
    canvas.addEventListener('webglcontextrestored', onContextRestored);

    this.unbindEvents = () => {
      window.removeEventListener('resize', onResize);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('webglcontextlost', onContextLost);
      canvas.removeEventListener('webglcontextrestored', onContextRestored);
    };
  }

  private unbindEvents: () => void = () => {};

  private afterDraw(cb: () => void) {
    if (this.disposed || this.contextIsLost) return;
    const gl = this.renderer.getContext() as WebGL2RenderingContext;
    if (!gl || !gl.fenceSync) {
      this.frameId = window.setTimeout(cb, 80);
      return;
    }
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush();
    const poll = () => {
      if (this.disposed || this.contextIsLost) return;
      const state = sync ? gl.getSyncParameter(sync, gl.SYNC_STATUS) : gl.SIGNALED;
      if (state === gl.UNSIGNALED) {
        this.frameId = window.setTimeout(poll, 5);
      } else {
        if (sync) gl.deleteSync(sync);
        this.frameId = window.setTimeout(cb, 80);
      }
    };
    this.frameId = window.setTimeout(poll, 5);
  }

  private startLoop() {
    const tick = () => {
      if (this.disposed || this.contextIsLost) return;
      const delta = Math.min(this.clock.getDelta(), 0.1);
      const elapsed = this.clock.getElapsedTime();

      if (this.cameraTransitionActive) {
        this.camera.position.x = THREE.MathUtils.damp(this.camera.position.x, this.targetCamPos.x, 5.5, delta);
        this.camera.position.y = THREE.MathUtils.damp(this.camera.position.y, this.targetCamPos.y, 5.5, delta);
        this.camera.position.z = THREE.MathUtils.damp(this.camera.position.z, this.targetCamPos.z, 5.5, delta);

        this.controls.target.x = THREE.MathUtils.damp(this.controls.target.x, this.targetLookAt.x, 5.5, delta);
        this.controls.target.y = THREE.MathUtils.damp(this.controls.target.y, this.targetLookAt.y, 5.5, delta);
        this.controls.target.z = THREE.MathUtils.damp(this.controls.target.z, this.targetLookAt.z, 5.5, delta);

        if (
          this.camera.position.distanceTo(this.targetCamPos) < 0.04 &&
          this.controls.target.distanceTo(this.targetLookAt) < 0.04
        ) {
          this.cameraTransitionActive = false;
        }
      }
      this.controls.update();

      const targetCut = this.state.cutaway ? 1 : 0;
      this.currentCutaway = THREE.MathUtils.damp(this.currentCutaway, targetCut, 7, delta);
      this.currentExplode = THREE.MathUtils.damp(this.currentExplode, this.state.explodeAmount, 7, delta);
      const targetRetrofit = this.state.retrofitMode ? 1 : 0;
      this.currentRetrofit = THREE.MathUtils.damp(this.currentRetrofit, targetRetrofit, 6.5, delta);

      // Live PAES 413:2001 Retrofit geometry & audit indicator interpolation
      this.channelTiltGroup.rotation.z = THREE.MathUtils.lerp(-0.004, -0.085, this.currentRetrofit);
      this.reqSlopeBarMat.color.lerpColors(_colorNonCompliant, _colorCompliant, this.currentRetrofit);

      const baseOpacity = Math.max(0, 1 - this.currentRetrofit * 1.4);
      this.baselineInletMat.opacity = baseOpacity;
      this.baselineInletPipe.visible = baseOpacity > 0.03;

      const boreWireOpacity = Math.max(0, 0.55 * (1 - this.currentRetrofit * 1.3));
      this.reqBoreMat.opacity = boreWireOpacity;
      this.reqBoreMesh.visible = boreWireOpacity > 0.02;

      const retroOpacity = Math.min(1, this.currentRetrofit * 1.15);
      this.retrofitInletMat.opacity = retroOpacity;
      this.retrofitInletPipe.visible = this.currentRetrofit > 0.02;
      this.retrofitFlangeGroup.visible = this.currentRetrofit > 0.04;
      const flangeScale = 0.25 + this.currentRetrofit * 0.75;
      this.retrofitFlangeGroup.scale.set(1, flangeScale, flangeScale);

      const channelRing = this.componentStatusRings.get('feeding-channel');
      if (channelRing) {
        (channelRing.material as THREE.MeshBasicMaterial).color.lerpColors(
          _colorNonCompliant,
          _colorCompliant,
          this.currentRetrofit
        );
      }
      const inletRing = this.componentStatusRings.get('inlet-pipe');
      if (inletRing) {
        (inletRing.material as THREE.MeshBasicMaterial).color.lerpColors(
          _colorNonCompliant,
          _colorCompliant,
          this.currentRetrofit
        );
      }

      const cutSlide = this.currentCutaway * 1.4;
      this.frontShellGroup.position.z = cutSlide + this.currentExplode * 1.2;
      const shellOpacity = Math.max(0, 1 - this.currentCutaway);
      const frontMat = this.frontWallMesh.material as THREE.MeshStandardMaterial;
      frontMat.opacity = shellOpacity;
      this.frontShellGroup.visible = shellOpacity > 0.04;

      this.domeCapGroup.position.y = this.currentExplode * 2.6;
      this.linerGroup.position.y = this.currentExplode * 1.35;
      this.safetyManifoldGroup.position.x = 1.6 + this.currentExplode * 1.1;

      this.reactorGlowLight.intensity = 0.6 + this.currentCutaway * 1.9;
      this.anemometerGroup.rotation.y += delta * 2.4;

      if (this.state.flowActive) {
        this.agitatorBladeGroup.rotation.y += delta * 1.9;
        this.slurrySurfaceMesh.position.y = 1.92 + Math.sin(elapsed * 1.6) * 0.025;
        this.outletSlurryMesh.position.y = 0.72 + Math.sin(elapsed * 0.9) * 0.03;

        // Rising CH4 bubbles
        for (let i = 0; i < this.bubbleData.length; i++) {
          const b = this.bubbleData[i];
          b.y += b.speed * delta;
          if (b.y > 1.9) b.y = 0.28;
          const bx = Math.cos(b.angle + elapsed * 0.15) * b.radius;
          const bz = Math.sin(b.angle + elapsed * 0.15) * b.radius;
          _v1.set(bx, b.y, bz);
          _quat.identity();
          const s = b.size * (0.85 + 0.3 * (b.y / 1.9));
          _scale.set(s, s, s);
          _mat4.compose(_v1, _quat, _scale);
          this.bubbleMesh.setMatrixAt(i, _mat4);
        }
        this.bubbleMesh.instanceMatrix.needsUpdate = true;

        // Slurry flow droplets along inlet pipe (faster & fuller in >= 0.20 m PAES retrofit)
        const slurrySpeed = THREE.MathUtils.lerp(0.34, 0.68, this.currentRetrofit);
        const slurryDropScale = THREE.MathUtils.lerp(0.95, 1.48, this.currentRetrofit);
        this.slurryFlowMesh.visible = true;
        for (let i = 0; i < this.slurryFlowOffsets.length; i++) {
          this.slurryFlowOffsets[i] = (this.slurryFlowOffsets[i] + delta * slurrySpeed) % 1;
          this.inletCurve.getPointAt(this.slurryFlowOffsets[i], _v1);
          _quat.identity();
          _scale.set(slurryDropScale, slurryDropScale, slurryDropScale);
          _mat4.compose(_v1, _quat, _scale);
          this.slurryFlowMesh.setMatrixAt(i, _mat4);
        }
        this.slurryFlowMesh.instanceMatrix.needsUpdate = true;

        // Methane gas pulses along yellow gas line
        this.gasFlowMesh.visible = true;
        for (let i = 0; i < this.gasOffsets.length; i++) {
          this.gasOffsets[i] = (this.gasOffsets[i] + delta * 0.24) % 1;
          this.gasCurve.getPointAt(this.gasOffsets[i], _v1);
          _quat.identity();
          _scale.set(1, 1, 1);
          _mat4.compose(_v1, _quat, _scale);
          this.gasFlowMesh.setMatrixAt(i, _mat4);
        }
        this.gasFlowMesh.instanceMatrix.needsUpdate = true;

        const fScale = 0.92 + Math.sin(elapsed * 18) * 0.12 + Math.cos(elapsed * 29) * 0.08;
        this.flameGroup.visible = true;
        this.flameGroup.scale.set(1, fScale, 1);
        this.flareLight.intensity = 2.0 + Math.sin(elapsed * 16) * 0.6;
      } else {
        this.flameGroup.visible = false;
        this.flareLight.intensity = 0;
        this.slurryFlowMesh.visible = false;
        this.gasFlowMesh.visible = false;
      }

      // Project 3D hotspot anchors into viewport pixels
      this.updateHotspotProjections();

      this.renderer.render(this.scene, this.camera);

      if (this.isSoftwareGl) {
        this.afterDraw(tick);
      } else {
        this.frameId = requestAnimationFrame(tick);
      }
    };

    if (this.isSoftwareGl) {
      this.frameId = window.setTimeout(tick, 16);
    } else {
      this.frameId = requestAnimationFrame(tick);
    }
  }

  public dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.frameId);
    clearTimeout(this.frameId);
    this.unbindEvents();
    this.controls.dispose();
    this.textures.dispose();
    this.envRT?.dispose();
    this.geometries.forEach((g) => g.dispose());
    this.materials.forEach((m) => m.dispose());
    this.renderer.dispose();
    if (this.renderer.domElement.parentNode === this.container) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
