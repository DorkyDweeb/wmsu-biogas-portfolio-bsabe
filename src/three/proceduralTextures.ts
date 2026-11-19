import * as THREE from 'three';

export interface ProceduralTextureSet {
  concreteMap: THREE.CanvasTexture;
  concreteBump: THREE.CanvasTexture;
  steelMap: THREE.CanvasTexture;
  gravelMap: THREE.CanvasTexture;
  groundMap: THREE.CanvasTexture;
  gaugeMap: THREE.CanvasTexture;
  dispose: () => void;
}

function makeCanvas(width: number, height: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('2D canvas context unavailable for procedural textures.');
  }
  return [canvas, ctx];
}

export function createProceduralTextures(maxAnisotropy: number): ProceduralTextureSet {
  const aniso = Math.min(Math.max(maxAnisotropy, 1), 8);

  // 1. Concrete formwork albedo + bump map
  const [cCanvas, cCtx] = makeCanvas(512, 512);
  cCtx.fillStyle = '#9aa3ad';
  cCtx.fillRect(0, 0, 512, 512);

  // Subtle aggregate speckle
  for (let i = 0; i < 6500; i++) {
    const x = (Math.sin(i * 12.9898) * 43758.5453) % 1;
    const y = (Math.sin(i * 78.233) * 19341.123) % 1;
    const px = Math.abs(x) * 512;
    const py = Math.abs(y) * 512;
    const shade = 135 + ((i * 37) % 45);
    cCtx.fillStyle = `rgb(${shade}, ${shade + 4}, ${shade + 8})`;
    cCtx.fillRect(px, py, 2, 2);
  }
  // Formwork panel seam lines
  cCtx.strokeStyle = 'rgba(55, 65, 81, 0.28)';
  cCtx.lineWidth = 2;
  for (let y = 64; y < 512; y += 64) {
    cCtx.beginPath();
    cCtx.moveTo(0, y);
    cCtx.lineTo(512, y);
    cCtx.stroke();
  }
  for (let x = 128; x < 512; x += 128) {
    cCtx.beginPath();
    cCtx.moveTo(x, 0);
    cCtx.lineTo(x, 512);
    cCtx.stroke();
  }

  const concreteMap = new THREE.CanvasTexture(cCanvas);
  concreteMap.colorSpace = THREE.SRGBColorSpace;
  concreteMap.wrapS = concreteMap.wrapT = THREE.RepeatWrapping;
  concreteMap.repeat.set(2, 2);
  concreteMap.anisotropy = aniso;

  const [cbCanvas, cbCtx] = makeCanvas(256, 256);
  cbCtx.fillStyle = '#808080';
  cbCtx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 4000; i++) {
    const px = Math.abs((Math.sin(i * 19.13) * 14321.9) % 1) * 256;
    const py = Math.abs((Math.sin(i * 51.77) * 9143.3) % 1) * 256;
    const v = 100 + (i % 60);
    cbCtx.fillStyle = `rgb(${v},${v},${v})`;
    cbCtx.fillRect(px, py, 2, 2);
  }
  const concreteBump = new THREE.CanvasTexture(cbCanvas);
  concreteBump.wrapS = concreteBump.wrapT = THREE.RepeatWrapping;
  concreteBump.repeat.set(2, 2);
  concreteBump.anisotropy = aniso;

  // 2. Brushed stainless / industrial steel
  const [sCanvas, sCtx] = makeCanvas(256, 256);
  sCtx.fillStyle = '#b9c4cf';
  sCtx.fillRect(0, 0, 256, 256);
  for (let y = 0; y < 256; y += 2) {
    const lum = 175 + ((y * 17) % 24);
    sCtx.fillStyle = `rgba(${lum}, ${lum + 6}, ${lum + 12}, 0.5)`;
    sCtx.fillRect(0, y, 256, 1);
  }
  const steelMap = new THREE.CanvasTexture(sCanvas);
  steelMap.colorSpace = THREE.SRGBColorSpace;
  steelMap.wrapS = steelMap.wrapT = THREE.RepeatWrapping;
  steelMap.anisotropy = aniso;

  // 3. Crushed gravel drainage aggregate
  const [gCanvas, gCtx] = makeCanvas(256, 256);
  gCtx.fillStyle = '#646e78';
  gCtx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 1200; i++) {
    const px = Math.abs((Math.sin(i * 31.7) * 24112.5) % 1) * 256;
    const py = Math.abs((Math.sin(i * 63.1) * 17233.7) % 1) * 256;
    const r = 2 + (i % 4);
    const v = 80 + ((i * 23) % 75);
    gCtx.fillStyle = `rgb(${v}, ${v - 4}, ${v - 8})`;
    gCtx.beginPath();
    gCtx.arc(px, py, r, 0, Math.PI * 2);
    gCtx.fill();
  }
  const gravelMap = new THREE.CanvasTexture(gCanvas);
  gravelMap.colorSpace = THREE.SRGBColorSpace;
  gravelMap.wrapS = gravelMap.wrapT = THREE.RepeatWrapping;
  gravelMap.repeat.set(4, 4);
  gravelMap.anisotropy = aniso;

  // 4. Agricultural ground pad / tropical loam & grass perimeter
  const [tCanvas, tCtx] = makeCanvas(512, 512);
  tCtx.fillStyle = '#2d4132';
  tCtx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 8000; i++) {
    const px = Math.abs((Math.sin(i * 17.3) * 41231.1) % 1) * 512;
    const py = Math.abs((Math.sin(i * 44.9) * 23981.4) % 1) * 512;
    const g = 55 + ((i * 13) % 30);
    tCtx.fillStyle = `rgb(${g - 15}, ${g + 12}, ${g - 10})`;
    tCtx.fillRect(px, py, 3, 3);
  }
  const groundMap = new THREE.CanvasTexture(tCanvas);
  groundMap.colorSpace = THREE.SRGBColorSpace;
  groundMap.wrapS = groundMap.wrapT = THREE.RepeatWrapping;
  groundMap.repeat.set(10, 10);
  groundMap.anisotropy = aniso;

  // 5. Crisp industrial pressure gauge dial
  const [dCanvas, dCtx] = makeCanvas(256, 256);
  dCtx.fillStyle = '#f8fafc';
  dCtx.beginPath();
  dCtx.arc(128, 128, 124, 0, Math.PI * 2);
  dCtx.fill();
  dCtx.strokeStyle = '#0f172a';
  dCtx.lineWidth = 6;
  dCtx.stroke();

  // Arc ticks
  for (let i = 0; i <= 20; i++) {
    const angle = (Math.PI * 0.75) + (i / 20) * (Math.PI * 1.5);
    const rOut = 104;
    const rIn = i % 5 === 0 ? 84 : 94;
    dCtx.strokeStyle = i >= 16 ? '#dc2626' : '#334155';
    dCtx.lineWidth = i % 5 === 0 ? 4 : 2;
    dCtx.beginPath();
    dCtx.moveTo(128 + Math.cos(angle) * rIn, 128 + Math.sin(angle) * rIn);
    dCtx.lineTo(128 + Math.cos(angle) * rOut, 128 + Math.sin(angle) * rOut);
    dCtx.stroke();
  }
  dCtx.fillStyle = '#0f172a';
  dCtx.font = 'bold 20px monospace';
  dCtx.textAlign = 'center';
  dCtx.fillText('kPa / mmH2O', 128, 178);
  // Needle
  dCtx.strokeStyle = '#dc2626';
  dCtx.lineWidth = 4;
  dCtx.beginPath();
  dCtx.moveTo(128, 128);
  dCtx.lineTo(128 + Math.cos(-0.6) * 76, 128 + Math.sin(-0.6) * 76);
  dCtx.stroke();
  dCtx.fillStyle = '#0f172a';
  dCtx.beginPath();
  dCtx.arc(128, 128, 9, 0, Math.PI * 2);
  dCtx.fill();

  const gaugeMap = new THREE.CanvasTexture(dCanvas);
  gaugeMap.colorSpace = THREE.SRGBColorSpace;
  gaugeMap.anisotropy = aniso;

  return {
    concreteMap,
    concreteBump,
    steelMap,
    gravelMap,
    groundMap,
    gaugeMap,
    dispose: () => {
      concreteMap.dispose();
      concreteBump.dispose();
      steelMap.dispose();
      gravelMap.dispose();
      groundMap.dispose();
      gaugeMap.dispose();
    },
  };
}
