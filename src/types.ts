export type CardSize = 'square' | 'wide' | 'portrait' | 'large';

export type TextAlignment = 'left' | 'center' | 'right';
export type TextOrientation = 'horizontal' | 'vertical';
export type VerticalAlignment = 'top' | 'center' | 'bottom';
export type BackgroundStyle = 'fill' | 'border' | 'gradient';

export type GradientMode = 'sharpBezier' | 'softBezier' | 'meshStatic' | 'meshGrid' | 'simple';
export type WarpShape = 
  | 'simplexNoise'
  | 'circular'
  | 'valueNoise'
  | 'worleyNoise'
  | 'fbmNoise'
  | 'voronoiNoise'
  | 'domainWarping'
  | 'waves'
  | 'smoothNoise'
  | 'oval'
  | 'rows'
  | 'columns'
  | 'flat'
  | 'gravity';

export interface GradientConfig {
  mode: GradientMode;
  warpShape: WarpShape;
  warpStrength: number; // 0–1
  warpScale: number; // 1–500
  noiseAmount: number; // 0–1
  seed: number; // deterministic seed
  colors: string[]; // 2–6 colors
  // Optional draggable points corresponding to colors (normalized 0..1)
  points?: { x: number; y: number }[];
}

export interface BentoCard {
  id: string;
  size: CardSize;
  x: number;
  y: number;
  backgroundColor?: string;
  backgroundImage?: string;
  uploadedImageId?: string; // ID to reference uploaded image in storage
  backgroundStyle?: BackgroundStyle;
  gradient?: GradientConfig; // when backgroundStyle === 'gradient'
  borderColor?: string;
  borderWidth?: number;
  text?: string;
  subtitle?: string;
  link?: string;
  textColor?: string;
  textAlignment?: TextAlignment;
  verticalAlignment?: VerticalAlignment;
  textOrientation?: TextOrientation;
  fontSize?: number;
}

export interface BentoLayout {
  id: string;
  name: string;
  cards: BentoCard[];
  createdAt: number;
  updatedAt: number;
  version?: number;
}

export interface GridConfig {
  cols: number;
  rows: number;
  gap: number;
  cellSize: number;
}
