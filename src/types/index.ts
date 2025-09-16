export interface BentoCard {
  id: string;
  title: string;
  content?: string;
  image?: string;
  backgroundColor: string;
  backgroundGradient?: string;
  textColor: string;
  size: CardSize;
  type: CardType;
  // New layout controls
  textAlign?: 'left' | 'center' | 'right';
  verticalAlign?: 'top' | 'center' | 'bottom';
  titleFontSize?: number; // px
  contentFontSize?: number; // px
}

export type CardSize = 'small' | 'medium' | 'large' | 'wide' | 'tall' | 'featured';

export type CardType = 'text' | 'image' | 'app' | 'widget';

export type GridLayout = 'wide' | 'mobile' | 'square';

export interface AlignmentDefaults {
  textAlign: 'left' | 'center' | 'right';
  verticalAlign: 'top' | 'center' | 'bottom';
}

export interface GridPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const CARD_SIZES: Record<CardSize, GridPosition> = {
  small: { x: 0, y: 0, width: 1, height: 1 },
  medium: { x: 0, y: 0, width: 2, height: 1 },
  large: { x: 0, y: 0, width: 2, height: 2 },
  wide: { x: 0, y: 0, width: 3, height: 1 },
  tall: { x: 0, y: 0, width: 1, height: 2 },
  featured: { x: 0, y: 0, width: 3, height: 2 },
};