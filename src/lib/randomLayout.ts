import { BentoCard, CardSize } from '../types';
import { GRID_CONFIG, isValidPosition, checkCollision } from '../utils/gridUtils';
import { templates } from './templates';

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function weightedRandomSize(): CardSize {
  // Higher chance for smaller cards to improve fit
  const weighted: CardSize[] = [
    'square','square','square','square', // 4x
    'wide','wide',                       // 2x
    'portrait','portrait',               // 2x
    'large'                              // 1x
  ];
  return pickRandom(weighted);
}

function findEmptySpotFor(cards: BentoCard[], size: CardSize): { x: number; y: number } | null {
  for (let y = 0; y < GRID_CONFIG.rows; y++) {
    for (let x = 0; x < GRID_CONFIG.cols; x++) {
      if (!isValidPosition(x, y, size, GRID_CONFIG.cols, GRID_CONFIG.rows)) continue;
      const hasCollision = cards.some((c) => checkCollision({ x, y, size }, c));
      if (!hasCollision) return { x, y };
    }
  }
  return null;
}

function mixStyle(): Partial<BentoCard> {
  const pool = templates.flatMap(t => t.cards);
  const source = pickRandom(pool);

  const mixed: Partial<BentoCard> = {};
  if (source.backgroundStyle) mixed.backgroundStyle = source.backgroundStyle;
  if (source.backgroundColor) mixed.backgroundColor = source.backgroundColor;
  if (source.borderColor) mixed.borderColor = source.borderColor;
  if (typeof source.borderWidth === 'number') mixed.borderWidth = source.borderWidth;
  if (source.backgroundImage) mixed.backgroundImage = source.backgroundImage;
  if (source.text) mixed.text = source.text;
  if (source.subtitle) mixed.subtitle = source.subtitle;
  if (source.link) mixed.link = source.link;
  if (source.textColor) mixed.textColor = source.textColor;
  if (source.textAlignment) mixed.textAlignment = source.textAlignment;
  if (source.verticalAlignment) mixed.verticalAlignment = source.verticalAlignment;
  if (source.textOrientation) mixed.textOrientation = source.textOrientation;
  if (typeof source.fontSize === 'number') mixed.fontSize = source.fontSize;

  // Fallbacks for readability
  if (!mixed.backgroundColor && !mixed.backgroundImage && mixed.backgroundStyle !== 'border') {
    mixed.backgroundColor = '#f3f4f6';
  }
  if (!mixed.textColor) mixed.textColor = '#1f2937';

  return mixed;
}

export function generateRandomLayout(): BentoCard[] {
  const result: BentoCard[] = [];

  // Choose a target number of cards aiming for a nice density
  const targetCount = Math.floor(Math.random() * 5) + 8; // 8-12 cards
  const sizes: CardSize[] = [];
  for (let i = 0; i < targetCount; i++) {
    sizes.push(weightedRandomSize());
  }

  for (let i = 0; i < sizes.length; i++) {
    const size = sizes[i];
    const spot = findEmptySpotFor(result, size);
    if (!spot) {
      // Try a couple alternative sizes to increase fit probability
      const altSizes: CardSize[] = ['square', 'wide', 'portrait', 'large'];
      let placed = false;
      for (const alt of altSizes) {
        const altSpot = findEmptySpotFor(result, alt);
        if (altSpot) {
          const style = mixStyle();
          result.push({
            id: `temp-${Date.now()}-${i}`,
            size: alt,
            x: altSpot.x,
            y: altSpot.y,
            ...style,
          });
          placed = true;
          break;
        }
      }
      if (!placed) continue;
    } else {
      const style = mixStyle();
      result.push({
        id: `temp-${Date.now()}-${i}`,
        size,
        x: spot.x,
        y: spot.y,
        ...style,
      });
    }
  }

  return result;
}
