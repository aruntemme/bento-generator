import { GradientConfig } from '../../types';

// Simple seeded PRNG (Mulberry32)
function createRng(seed: number) {
  let t = seed >>> 0;
  return function rand() {
    t += 0x6D2B79F5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

// Smooth interpolation functions
const smoothstep = (t: number) => t * t * (3 - 2 * t);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// Simplex noise 2D (optimized)
function simplexNoise2D(x: number, y: number): number {
  const F2 = 0.5 * (Math.sqrt(3.0) - 1.0);
  const G2 = (3.0 - Math.sqrt(3.0)) / 6.0;
  
  const s = (x + y) * F2;
  const i = Math.floor(x + s);
  const j = Math.floor(y + s);
  
  const t = (i + j) * G2;
  const X0 = i - t;
  const Y0 = j - t;
  const x0 = x - X0;
  const y0 = y - Y0;
  
  const i1 = x0 > y0 ? 1 : 0;
  const j1 = x0 > y0 ? 0 : 1;
  
  const x1 = x0 - i1 + G2;
  const y1 = y0 - j1 + G2;
  const x2 = x0 - 1.0 + 2.0 * G2;
  const y2 = y0 - 1.0 + 2.0 * G2;
  
  const hash = (ix: number, iy: number) => {
    const n = ix * 374761393 + iy * 668265263;
    const r = Math.sin(n) * 43758.5453;
    return r - Math.floor(r);
  };
  
  let n0 = 0, n1 = 0, n2 = 0;
  
  let t0 = 0.5 - x0 * x0 - y0 * y0;
  if (t0 >= 0) {
    t0 *= t0;
    n0 = t0 * t0 * (hash(i, j) * 2 - 1);
  }
  
  let t1 = 0.5 - x1 * x1 - y1 * y1;
  if (t1 >= 0) {
    t1 *= t1;
    n1 = t1 * t1 * (hash(i + i1, j + j1) * 2 - 1);
  }
  
  let t2 = 0.5 - x2 * x2 - y2 * y2;
  if (t2 >= 0) {
    t2 *= t2;
    n2 = t2 * t2 * (hash(i + 1, j + 1) * 2 - 1);
  }
  
  return 70.0 * (n0 + n1 + n2);
}

// Value noise
function valueNoise2D(x: number, y: number): number {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const x1 = x0 + 1;
  const y1 = y0 + 1;
  
  const sx = x - x0;
  const sy = y - y0;
  
  const hash = (xi: number, yi: number) => {
    const s = xi * 374761393 + yi * 668265263;
    const r = Math.sin(s) * 43758.5453;
    return r - Math.floor(r);
  };
  
  const n00 = hash(x0, y0);
  const n10 = hash(x1, y0);
  const n01 = hash(x0, y1);
  const n11 = hash(x1, y1);
  
  const ix0 = lerp(n00, n10, smoothstep(sx));
  const ix1 = lerp(n01, n11, smoothstep(sx));
  return lerp(ix0, ix1, smoothstep(sy));
}

// FBM (Fractal Brownian Motion)
function fbmNoise(x: number, y: number, octaves = 4): number {
  let value = 0;
  let amplitude = 0.5;
  let frequency = 1;
  for (let i = 0; i < octaves; i++) {
    value += amplitude * simplexNoise2D(x * frequency, y * frequency);
    amplitude *= 0.5;
    frequency *= 2;
  }
  return value * 0.5 + 0.5; // normalize to [0,1]
}

// Worley/Cellular noise
function worleyNoise(x: number, y: number): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  let minDist = 1e9;
  
  for (let yy = -1; yy <= 1; yy++) {
    for (let xx = -1; xx <= 1; xx++) {
      const gx = xi + xx;
      const gy = yi + yy;
      const seed = Math.sin(gx * 127.1 + gy * 311.7) * 43758.5453;
      const fx = gx + (seed - Math.floor(seed));
      const seed2 = Math.sin(gx * 269.5 + gy * 183.3) * 43758.5453;
      const fy = gy + (seed2 - Math.floor(seed2));
      const dx = fx - x;
      const dy = fy - y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < minDist) minDist = d;
    }
  }
  
  return Math.max(0, Math.min(1, minDist * 1.5));
}

// Voronoi noise (F1 - F2)
function voronoiNoise(x: number, y: number): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  let minDist1 = 1e9, minDist2 = 1e9;
  
  for (let yy = -1; yy <= 1; yy++) {
    for (let xx = -1; xx <= 1; xx++) {
      const gx = xi + xx;
      const gy = yi + yy;
      const seed = Math.sin(gx * 127.1 + gy * 311.7) * 43758.5453;
      const fx = gx + (seed - Math.floor(seed));
      const seed2 = Math.sin(gx * 269.5 + gy * 183.3) * 43758.5453;
      const fy = gy + (seed2 - Math.floor(seed2));
      const dx = fx - x;
      const dy = fy - y;
      const d = Math.sqrt(dx * dx + dy * dy);
      
      if (d < minDist1) {
        minDist2 = minDist1;
        minDist1 = d;
      } else if (d < minDist2) {
        minDist2 = d;
      }
    }
  }
  
  return Math.max(0, Math.min(1, (minDist2 - minDist1) * 2));
}

// Domain warping
function domainWarpNoise(x: number, y: number, strength: number): number {
  const q = {
    x: fbmNoise(x, y),
    y: fbmNoise(x + 5.2, y + 1.3)
  };
  
  return fbmNoise(x + strength * q.x, y + strength * q.y);
}

// Wave pattern
function waveNoise(x: number, y: number, frequency: number): number {
  return (Math.sin(x * frequency) * Math.cos(y * frequency) + 1) * 0.5;
}

// Get noise value based on warp shape
function getNoise(shape: string, x: number, y: number, warpScale: number): number {
  const nx = x / warpScale;
  const ny = y / warpScale;
  
  switch (shape) {
    case 'simplexNoise':
      return simplexNoise2D(nx, ny) * 0.5 + 0.5;
    case 'valueNoise':
      return valueNoise2D(nx, ny);
    case 'smoothNoise':
      return valueNoise2D(nx, ny);
    case 'worleyNoise':
      return worleyNoise(nx, ny);
    case 'fbmNoise':
      return fbmNoise(nx, ny, 4);
    case 'voronoiNoise':
      return voronoiNoise(nx, ny);
    case 'domainWarping':
      return domainWarpNoise(nx, ny, 4);
    case 'waves':
      return waveNoise(nx, ny, 0.5);
    case 'circular': {
      const cx = 0.5;
      const cy = 0.5;
      const dx = nx / warpScale - cx;
      const dy = ny / warpScale - cy;
      return Math.sqrt(dx * dx + dy * dy);
    }
    case 'oval': {
      const dx2 = (nx / warpScale - 0.5) * 2;
      const dy2 = (ny / warpScale - 0.5);
      return Math.sqrt(dx2 * dx2 + dy2 * dy2);
    }
    case 'rows':
      return (Math.sin(ny * 0.5) + 1) * 0.5;
    case 'columns':
      return (Math.sin(nx * 0.5) + 1) * 0.5;
    case 'flat':
      return 0.5;
    case 'gravity':
      return ny / warpScale / 10;
    default:
      return valueNoise2D(nx, ny);
  }
}

// RGB to LAB color space for better interpolation
function rgbToLab(r: number, g: number, b: number): [number, number, number] {
  // Normalize RGB
  r = r / 255;
  g = g / 255;
  b = b / 255;
  
  // sRGB to linear RGB
  r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
  g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
  b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;
  
  // Linear RGB to XYZ
  let x = r * 0.4124564 + g * 0.3575761 + b * 0.1804375;
  let y = r * 0.2126729 + g * 0.7151522 + b * 0.0721750;
  let z = r * 0.0193339 + g * 0.1191920 + b * 0.9503041;
  
  // XYZ to LAB
  x = x / 0.95047;
  z = z / 1.08883;
  
  x = x > 0.008856 ? Math.pow(x, 1/3) : (7.787 * x + 16/116);
  y = y > 0.008856 ? Math.pow(y, 1/3) : (7.787 * y + 16/116);
  z = z > 0.008856 ? Math.pow(z, 1/3) : (7.787 * z + 16/116);
  
  const L = (116 * y) - 16;
  const A = 500 * (x - y);
  const B = 200 * (y - z);
  
  return [L, A, B];
}

// LAB to RGB
function labToRgb(L: number, A: number, B: number): [number, number, number] {
  let y = (L + 16) / 116;
  let x = A / 500 + y;
  let z = y - B / 200;
  
  x = x > 0.206897 ? Math.pow(x, 3) : (x - 16/116) / 7.787;
  y = y > 0.206897 ? Math.pow(y, 3) : (y - 16/116) / 7.787;
  z = z > 0.206897 ? Math.pow(z, 3) : (z - 16/116) / 7.787;
  
  x = x * 0.95047;
  z = z * 1.08883;
  
  // XYZ to linear RGB
  let r = x *  3.2404542 + y * -1.5371385 + z * -0.4985314;
  let g = x * -0.9692660 + y *  1.8760108 + z *  0.0415560;
  let b = x *  0.0556434 + y * -0.2040259 + z *  1.0572252;
  
  // Linear RGB to sRGB
  r = r > 0.0031308 ? 1.055 * Math.pow(r, 1/2.4) - 0.055 : 12.92 * r;
  g = g > 0.0031308 ? 1.055 * Math.pow(g, 1/2.4) - 0.055 : 12.92 * g;
  b = b > 0.0031308 ? 1.055 * Math.pow(b, 1/2.4) - 0.055 : 12.92 * b;
  
  return [
    Math.max(0, Math.min(255, Math.round(r * 255))),
    Math.max(0, Math.min(255, Math.round(g * 255))),
    Math.max(0, Math.min(255, Math.round(b * 255)))
  ];
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16)
  ];
}

// Smooth color interpolation in LAB space
function samplePalette(colors: string[], t: number): { r: number; g: number; b: number } {
  if (colors.length === 1) {
    const [r, g, b] = hexToRgb(colors[0]);
    return { r, g, b };
  }
  
  const clamped = Math.max(0, Math.min(1, t));
  const scaled = clamped * (colors.length - 1);
  const i = Math.floor(scaled);
  const frac = scaled - i;
  
  const [r0, g0, b0] = hexToRgb(colors[i]);
  const [r1, g1, b1] = hexToRgb(colors[Math.min(i + 1, colors.length - 1)]);
  
  // Convert to LAB
  const [L0, A0, B0] = rgbToLab(r0, g0, b0);
  const [L1, A1, B1] = rgbToLab(r1, g1, b1);
  
  // Interpolate in LAB space
  const L = lerp(L0, L1, smoothstep(frac));
  const A = lerp(A0, A1, smoothstep(frac));
  const B = lerp(B0, B1, smoothstep(frac));
  
  // Convert back to RGB
  const [r, g, b] = labToRgb(L, A, B);
  
  return { r, g, b };
}

// Base gradient calculation based on mode
function baseGradientT(mode: string, x: number, y: number, w: number, h: number, rng: () => number): number {
  switch (mode) {
    case 'simple':
    case 'softBezier':
    case 'sharpBezier':
      // Vertical gradient (top to bottom)
      return y / h;
      
    case 'meshStatic':
    case 'meshGrid': {
      // Mesh-based gradient with noise
      const gridX = Math.floor((x / w) * 4);
      const gridY = Math.floor((y / h) * 4);
      const seed = gridX * 100 + gridY;
      const localRng = createRng(seed);
      const base = localRng();
      const noise = (rng() - 0.5) * 0.3;
      return Math.max(0, Math.min(1, base + noise));
    }
      
    default:
      return y / h;
  }
}

export async function generateGradientDataURL(
  config: GradientConfig,
  width: number,
  height: number,
  opts?: { qualityScale?: number; signal?: AbortSignal }
): Promise<string> {
  // Use higher resolution for better quality
  const scale = Math.max(1, Math.min(3, opts?.qualityScale ?? 1.5));
  const scaledWidth = Math.floor(width * scale);
  const scaledHeight = Math.floor(height * scale);
  
  const canvas = typeof OffscreenCanvas !== 'undefined' 
    ? (new OffscreenCanvas(scaledWidth, scaledHeight) as unknown as HTMLCanvasElement)
    : document.createElement('canvas');
  
  canvas.width = scaledWidth;
  canvas.height = scaledHeight;
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) return '';
  
  const imageData = ctx.createImageData(scaledWidth, scaledHeight);
  const data = imageData.data;
  
  const rng = createRng(config.seed >>> 0);
  
  const warpScale = Math.max(1, config.warpScale);
  const warpStrength = Math.max(0, Math.min(1, config.warpStrength));
  const noiseAmount = Math.max(0, Math.min(0.5, config.noiseAmount));
  
  for (let y = 0; y < scaledHeight; y++) {
    for (let x = 0; x < scaledWidth; x++) {
      if (opts?.signal?.aborted) return '';
      // Get noise-based warp
      const n = getNoise(config.warpShape, x, y, warpScale);
      const warp = (n - 0.5) * 2 * warpStrength * scaledHeight * 0.3;
      
      // Calculate base gradient position with warp
      let t = baseGradientT(
        config.mode,
        x,
        y + warp,
        scaledWidth,
        scaledHeight,
        rng
      );

      // If points are provided, blend based on nearest point influence
      if (config.points && config.points.length === config.colors.length) {
        const px = x / scaledWidth;
        const py = y / scaledHeight;
        // compute nearest two points
        let nearest = 0, second = 0;
        let d1 = Infinity, d2 = Infinity;
        for (let i = 0; i < config.points.length; i++) {
          const p = config.points[i];
          const dx = px - p.x; const dy = py - p.y;
          const d = dx * dx + dy * dy;
          if (d < d1) { d2 = d1; second = nearest; d1 = d; nearest = i; }
          else if (d < d2) { d2 = d; second = i; }
        }
        const w1 = 1 / (d1 + 1e-6);
        const w2 = 1 / (d2 + 1e-6);
        t = w2 / (w1 + w2); // position between the two nearest colors
        const colorA = samplePalette([config.colors[nearest], config.colors[nearest]], 0);
        const colorB = samplePalette([config.colors[second], config.colors[second]], 0);
        const grain = (rng() - 0.5) * 2 * 20 * noiseAmount;
        const i = (y * scaledWidth + x) * 4;
        data[i + 0] = Math.max(0, Math.min(255, Math.round(colorA.r * (1 - t) + colorB.r * t) + grain));
        data[i + 1] = Math.max(0, Math.min(255, Math.round(colorA.g * (1 - t) + colorB.g * t) + grain));
        data[i + 2] = Math.max(0, Math.min(255, Math.round(colorA.b * (1 - t) + colorB.b * t) + grain));
        data[i + 3] = 255;
        continue;
      }
      
      // Apply curve based on mode
      if (config.mode === 'sharpBezier') {
        const s = 3.0;
        t = Math.pow(t, s) / (Math.pow(t, s) + Math.pow(1 - t, s));
      } else if (config.mode === 'softBezier') {
        t = smoothstep(t);
      }
      
      // Sample color from palette
      const color = samplePalette(config.colors, t);
      
      // Add subtle grain
      const grain = (rng() - 0.5) * 2 * 20 * noiseAmount;
      
      const i = (y * scaledWidth + x) * 4;
      data[i + 0] = Math.max(0, Math.min(255, color.r + grain));
      data[i + 1] = Math.max(0, Math.min(255, color.g + grain));
      data[i + 2] = Math.max(0, Math.min(255, color.b + grain));
      data[i + 3] = 255;
    }
  }
  
  ctx.putImageData(imageData, 0, 0);
  
  // Convert to blob/dataURL
  if (typeof OffscreenCanvas !== 'undefined' && canvas instanceof OffscreenCanvas) {
    const blob = await canvas.convertToBlob({ type: 'image/png' });
    return URL.createObjectURL(blob);
  }
  
  return canvas.toDataURL('image/png', 1.0);
}
