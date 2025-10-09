import { CardSize, GridConfig } from '../types';

export const GRID_CONFIG: GridConfig = {
  cols: 12,
  rows: 6,
  gap: 16,
  cellSize: 80,
};

export const getCardDimensions = (size: CardSize): { width: number; height: number } => {
  switch (size) {
    case 'square':
      return { width: 2, height: 2 };
    case 'wide':
      return { width: 4, height: 2 };
    case 'portrait':
      return { width: 2, height: 4 };
    case 'large':
      return { width: 4, height: 4 };
    default:
      return { width: 2, height: 2 };
  }
};

export const snapToGrid = (value: number, cellSize: number, gap: number): number => {
  const gridStep = cellSize + gap;
  return Math.round(value / gridStep);
};

export const gridToPixels = (gridValue: number, cellSize: number, gap: number): number => {
  return gridValue * (cellSize + gap);
};

export const isValidPosition = (
  x: number,
  y: number,
  size: CardSize,
  cols: number,
  rows: number
): boolean => {
  const { width, height } = getCardDimensions(size);
  return x >= 0 && y >= 0 && x + width <= cols && y + height <= rows;
};

export const checkCollision = (
  card1: { x: number; y: number; size: CardSize },
  card2: { x: number; y: number; size: CardSize }
): boolean => {
  const dims1 = getCardDimensions(card1.size);
  const dims2 = getCardDimensions(card2.size);

  return !(
    card1.x + dims1.width <= card2.x ||
    card2.x + dims2.width <= card1.x ||
    card1.y + dims1.height <= card2.y ||
    card2.y + dims2.height <= card1.y
  );
};
