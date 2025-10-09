export type CardSize = 'square' | 'wide' | 'portrait' | 'large';

export type TextAlignment = 'left' | 'center' | 'right';
export type TextOrientation = 'horizontal' | 'vertical';
export type VerticalAlignment = 'top' | 'center' | 'bottom';
export type BackgroundStyle = 'fill' | 'border';

export interface BentoCard {
  id: string;
  size: CardSize;
  x: number;
  y: number;
  backgroundColor?: string;
  backgroundImage?: string;
  uploadedImageId?: string; // ID to reference uploaded image in storage
  backgroundStyle?: BackgroundStyle;
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
