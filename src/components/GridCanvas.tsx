import React, { useState, useRef, useCallback } from 'react';
import { BentoCard as BentoCardType, CardSize } from '../types';
import { GRID_CONFIG, snapToGrid, isValidPosition, checkCollision, getCardDimensions } from '../utils/gridUtils';
import BentoCard from './BentoCard';

interface GridCanvasProps {
  cards: BentoCardType[];
  onCardsChange: (cardsOrUpdater: BentoCardType[] | ((prev: BentoCardType[]) => BentoCardType[])) => void;
  onEditCard: (card: BentoCardType) => void;
}

const GridCanvas: React.FC<GridCanvasProps> = ({ cards, onCardsChange, onEditCard }) => {
  const [draggedCard, setDraggedCard] = useState<BentoCardType | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [hoverPosition, setHoverPosition] = useState<{ x: number; y: number } | null>(null);
  const [isValidDrop, setIsValidDrop] = useState<boolean>(false);
  const dragOverTimeoutRef = useRef<number | null>(null);

  // Add padding to the canvas (32px on all sides)
  const CANVAS_PADDING = 32;
  const gridWidth = GRID_CONFIG.cols * (GRID_CONFIG.cellSize + GRID_CONFIG.gap) - GRID_CONFIG.gap;
  const gridHeight = GRID_CONFIG.rows * (GRID_CONFIG.cellSize + GRID_CONFIG.gap) - GRID_CONFIG.gap;
  const canvasWidth = gridWidth + (CANVAS_PADDING * 2);
  const canvasHeight = gridHeight + (CANVAS_PADDING * 2);

  const handleDragStart = (e: React.DragEvent, card: BentoCardType) => {
    setDraggedCard(card);
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = useCallback(() => {
    // Clear all drag-related states when drag ends
    if (dragOverTimeoutRef.current !== null) {
      cancelAnimationFrame(dragOverTimeoutRef.current);
      dragOverTimeoutRef.current = null;
    }
    setDraggedCard(null);
    setHoverPosition(null);
    setIsValidDrop(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    if (!draggedCard) return;

    // Capture values immediately (before async callback)
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const clientX = e.clientX;
    const clientY = e.clientY;

    // Throttle updates using requestAnimationFrame
    if (dragOverTimeoutRef.current !== null) {
      cancelAnimationFrame(dragOverTimeoutRef.current);
    }

    dragOverTimeoutRef.current = window.requestAnimationFrame(() => {
      const pixelX = clientX - rect.left - dragOffset.x - CANVAS_PADDING;
      const pixelY = clientY - rect.top - dragOffset.y - CANVAS_PADDING;

      const gridX = snapToGrid(pixelX, GRID_CONFIG.cellSize, GRID_CONFIG.gap);
      const gridY = snapToGrid(pixelY, GRID_CONFIG.cellSize, GRID_CONFIG.gap);

      // Only update if position changed
      if (hoverPosition?.x !== gridX || hoverPosition?.y !== gridY) {
        setHoverPosition({ x: gridX, y: gridY });

        const valid = isValidPosition(gridX, gridY, draggedCard.size, GRID_CONFIG.cols, GRID_CONFIG.rows);
        if (!valid) {
          setIsValidDrop(false);
        } else {
          const otherCards = cards.filter((c) => c.id !== draggedCard.id);
          const hasCollision = otherCards.some((c) =>
            checkCollision({ ...draggedCard, x: gridX, y: gridY }, c)
          );
          setIsValidDrop(!hasCollision);
        }
      }

      dragOverTimeoutRef.current = null;
    });
  }, [draggedCard, dragOffset, hoverPosition, cards]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedCard) return;

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const pixelX = e.clientX - rect.left - dragOffset.x - CANVAS_PADDING;
    const pixelY = e.clientY - rect.top - dragOffset.y - CANVAS_PADDING;

    const gridX = snapToGrid(pixelX, GRID_CONFIG.cellSize, GRID_CONFIG.gap);
    const gridY = snapToGrid(pixelY, GRID_CONFIG.cellSize, GRID_CONFIG.gap);

    if (!isValidPosition(gridX, gridY, draggedCard.size, GRID_CONFIG.cols, GRID_CONFIG.rows)) {
      setDraggedCard(null);
      setHoverPosition(null);
      setIsValidDrop(false);
      return;
    }

    // Store original position
    const originalX = draggedCard.x;
    const originalY = draggedCard.y;
    const originalSize = draggedCard.size;

    const otherCards = cards.filter((c) => c.id !== draggedCard.id);
    
    // Find cards that would collide with the new position
    const collidingCards = otherCards.filter((c) =>
      checkCollision({ ...draggedCard, x: gridX, y: gridY }, c)
    );

    if (collidingCards.length === 0) {
      // No collision, simple move
      const updatedCards = cards.map((c) =>
        c.id === draggedCard.id ? { ...c, x: gridX, y: gridY } : c
      );
      onCardsChange(updatedCards);
    } else {
      // Try to swap/rearrange cards
      const swapResult = trySwapCards(draggedCard, { x: gridX, y: gridY }, collidingCards, otherCards);
      
      if (swapResult) {
        onCardsChange(swapResult);
      } else {
        // Swap failed, card returns to original position
        console.log('Cannot swap: not enough space');
      }
    }

    setDraggedCard(null);
    setHoverPosition(null);
    setIsValidDrop(false);
  };

  const trySwapCards = (
    draggedCard: BentoCardType,
    newPosition: { x: number; y: number },
    collidingCards: BentoCardType[],
    otherCards: BentoCardType[]
  ): BentoCardType[] | null => {
    // First, try simple 1:1 swap if only one colliding card
    if (collidingCards.length === 1) {
      const targetCard = collidingCards[0];
      const draggedDims = getCardDimensions(draggedCard.size);
      const targetDims = getCardDimensions(targetCard.size);
      
      // Check if sizes are compatible (same dimensions)
      if (draggedDims.width === targetDims.width && draggedDims.height === targetDims.height) {
        // Simple position swap
        const updatedCards = cards.map((c) => {
          if (c.id === draggedCard.id) {
            return { ...c, x: newPosition.x, y: newPosition.y };
          }
          if (c.id === targetCard.id) {
            return { ...c, x: draggedCard.x, y: draggedCard.y };
          }
          return c;
        });
        
        // Verify no overlaps in result
        if (validateNoOverlaps(updatedCards)) {
          return updatedCards;
        }
      }
    }

    // Try to shift cards along (for reordering scenarios)
    const shiftResult = tryShiftCards(draggedCard, newPosition, collidingCards);
    if (shiftResult && validateNoOverlaps(shiftResult)) {
      return shiftResult;
    }

    // Calculate the area occupied by dragged card's original position
    const originalArea = {
      x: draggedCard.x,
      y: draggedCard.y,
      size: draggedCard.size
    };

    // Try to fit all colliding cards into the original position
    const rearrangedCards: BentoCardType[] = [];
    const remainingSpace = [originalArea];
    
    for (const collidingCard of collidingCards) {
      let placed = false;
      
      // Try each available space
      for (let i = 0; i < remainingSpace.length; i++) {
        const space = remainingSpace[i];
        
        // Check if colliding card fits in this space
        if (canFitInSpace(collidingCard, space)) {
          // Place the card
          rearrangedCards.push({ ...collidingCard, x: space.x, y: space.y });
          
          // Remove used space and add remaining spaces
          remainingSpace.splice(i, 1);
          const newSpaces = getLeftoverSpaces(space, collidingCard.size);
          remainingSpace.push(...newSpaces);
          
          placed = true;
          break;
        }
      }
      
      if (!placed) {
        // Can't fit this card in original space, try to find another spot
        const excludeIds = [draggedCard.id, ...collidingCards.map(c => c.id)];
        const newSpot = findEmptySpot(collidingCard.size, excludeIds);
        
        if (newSpot) {
          rearrangedCards.push({ ...collidingCard, x: newSpot.x, y: newSpot.y });
        } else {
          // Can't place this card anywhere, swap fails
          return null;
        }
      }
    }

    // Apply the changes
    const updatedCards = cards.map((c) => {
      if (c.id === draggedCard.id) {
        return { ...c, x: newPosition.x, y: newPosition.y };
      }
      const rearranged = rearrangedCards.find((rc) => rc.id === c.id);
      return rearranged || c;
    });

    // Final validation to prevent overlaps
    if (!validateNoOverlaps(updatedCards)) {
      return null;
    }

    return updatedCards;
  };

  const tryShiftCards = (
    draggedCard: BentoCardType,
    newPosition: { x: number; y: number },
    collidingCards: BentoCardType[]
  ): BentoCardType[] | null => {
    const draggedDims = getCardDimensions(draggedCard.size);
    const shiftedCards: Map<string, { x: number; y: number }> = new Map();
    
    // Determine shift direction based on position change
    const deltaX = newPosition.x - draggedCard.x;
    const deltaY = newPosition.y - draggedCard.y;
    
    // Calculate how much space the dragged card needs
    const needsShiftRight = deltaX < 0; // Moving left, need to shift others right
    const needsShiftDown = deltaY < 0; // Moving up, need to shift others down
    
    // Try to shift all colliding cards in the opposite direction
    for (const collidingCard of collidingCards) {
      const collidingDims = getCardDimensions(collidingCard.size);
      let newX = collidingCard.x;
      let newY = collidingCard.y;
      
      if (needsShiftRight) {
        // Shift right by the width of the dragged card
        newX = collidingCard.x + draggedDims.width;
      } else if (deltaX > 0) {
        // Moving right, shift others left (to original position of dragged card)
        newX = draggedCard.x;
      }
      
      if (needsShiftDown) {
        // Shift down by the height of the dragged card
        newY = collidingCard.y + draggedDims.height;
      } else if (deltaY > 0) {
        // Moving down, shift others up (to original position of dragged card)
        newY = draggedCard.y;
      }
      
      // Validate new position
      if (!isValidPosition(newX, newY, collidingCard.size, GRID_CONFIG.cols, GRID_CONFIG.rows)) {
        return null;
      }
      
      shiftedCards.set(collidingCard.id, { x: newX, y: newY });
    }
    
    // Apply shifts and check for overlaps
    const updatedCards = cards.map((c) => {
      if (c.id === draggedCard.id) {
        return { ...c, x: newPosition.x, y: newPosition.y };
      }
      const shifted = shiftedCards.get(c.id);
      if (shifted) {
        return { ...c, x: shifted.x, y: shifted.y };
      }
      return c;
    });
    
    return updatedCards;
  };

  const validateNoOverlaps = useCallback((cardsToValidate: BentoCardType[]): boolean => {
    // Early exit for small arrays
    if (cardsToValidate.length < 2) return true;
    
    for (let i = 0; i < cardsToValidate.length; i++) {
      for (let j = i + 1; j < cardsToValidate.length; j++) {
        if (checkCollision(cardsToValidate[i], cardsToValidate[j])) {
          return false;
        }
      }
    }
    return true;
  }, []);

  const canFitInSpace = (
    card: BentoCardType,
    space: { x: number; y: number; size: CardSize }
  ): boolean => {
    const cardDims = getCardDimensions(card.size);
    const spaceDims = getCardDimensions(space.size);
    
    // Check if card dimensions fit within space at space's position
    return (
      isValidPosition(space.x, space.y, card.size, GRID_CONFIG.cols, GRID_CONFIG.rows) &&
      cardDims.width <= spaceDims.width &&
      cardDims.height <= spaceDims.height
    );
  };

  const getLeftoverSpaces = (
    space: { x: number; y: number; size: CardSize },
    usedSize: CardSize
  ): Array<{ x: number; y: number; size: CardSize }> => {
    const spaceDims = getCardDimensions(space.size);
    const usedDims = getCardDimensions(usedSize);
    const leftoverSpaces: Array<{ x: number; y: number; size: CardSize }> = [];

    // Calculate remaining width and height
    const remainingWidth = spaceDims.width - usedDims.width;
    const remainingHeight = spaceDims.height - usedDims.height;

    // Add right space if any
    if (remainingWidth >= 2) {
      const rightSize = getSizeFromDimensions(remainingWidth, spaceDims.height);
      if (rightSize) {
        leftoverSpaces.push({
          x: space.x + usedDims.width,
          y: space.y,
          size: rightSize
        });
      }
    }

    // Add bottom space if any
    if (remainingHeight >= 2) {
      const bottomSize = getSizeFromDimensions(usedDims.width, remainingHeight);
      if (bottomSize) {
        leftoverSpaces.push({
          x: space.x,
          y: space.y + usedDims.height,
          size: bottomSize
        });
      }
    }

    return leftoverSpaces;
  };

  const getSizeFromDimensions = (width: number, height: number): CardSize | null => {
    if (width === 2 && height === 2) return 'square';
    if (width === 4 && height === 2) return 'wide';
    if (width === 2 && height === 4) return 'portrait';
    if (width === 4 && height === 4) return 'large';
    return null;
  };

  const handleDelete = useCallback((id: string) => {
    onCardsChange((prev) => prev.filter((c) => c.id !== id));
  }, [onCardsChange]);

  const handleResize = useCallback((id: string, newSize: CardSize) => {
    onCardsChange((prev) => {
      const card = prev.find((c) => c.id === id);
      if (!card) return prev;

      // Try to resize in-place first
      if (isValidPosition(card.x, card.y, newSize, GRID_CONFIG.cols, GRID_CONFIG.rows)) {
        const otherCards = prev.filter((c) => c.id !== id);
        const hasCollision = otherCards.some((c) =>
          checkCollision({ ...card, size: newSize }, c)
        );
        if (!hasCollision) {
          return prev.map((c) => (c.id === id ? { ...c, size: newSize } : c));
        }
      }

      // If in-place fails (too big or collides), try to find a new empty spot
      for (let y = 0; y < GRID_CONFIG.rows; y++) {
        for (let x = 0; x < GRID_CONFIG.cols; x++) {
          if (!isValidPosition(x, y, newSize, GRID_CONFIG.cols, GRID_CONFIG.rows)) continue;
          const hasCollisionAtSpot = prev
            .filter((c) => c.id !== id)
            .some((c) => checkCollision({ ...card, x, y, size: newSize }, c));
          if (!hasCollisionAtSpot) {
            return prev.map((c) => (c.id === id ? { ...c, x, y, size: newSize } : c));
          }
        }
      }

      // No space available for the new size; keep as-is
      return prev;
    });
  }, [onCardsChange]);

  return (
    <div className="w-full h-[calc(100vh-80px)] bg-gradient-to-br from-gray-50 to-gray-100 overflow-auto p-2 sm:p-4 md:p-8">
      <div className="min-w-max flex justify-center items-center min-h-full">
        <div
          style={{
            width: `${canvasWidth}px`,
            height: `${canvasHeight}px`,
            minWidth: '800px',
            aspectRatio: '16/9',
            position: 'relative',
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
          }}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
        {/* Grid background with padding offset */}
        <div
          style={{
            position: 'absolute',
            left: `${CANVAS_PADDING}px`,
            top: `${CANVAS_PADDING}px`,
            width: `${gridWidth}px`,
            height: `${gridHeight}px`,
            backgroundImage: `
              repeating-linear-gradient(0deg, transparent, transparent ${GRID_CONFIG.cellSize + GRID_CONFIG.gap}px, #f3f4f6 ${GRID_CONFIG.cellSize + GRID_CONFIG.gap}px, #f3f4f6 ${GRID_CONFIG.cellSize + GRID_CONFIG.gap + 1}px),
              repeating-linear-gradient(90deg, transparent, transparent ${GRID_CONFIG.cellSize + GRID_CONFIG.gap}px, #f3f4f6 ${GRID_CONFIG.cellSize + GRID_CONFIG.gap}px, #f3f4f6 ${GRID_CONFIG.cellSize + GRID_CONFIG.gap + 1}px)
            `,
            opacity: 0.3,
            pointerEvents: 'none',
          }}
        />

        {/* Cards container with padding */}
        <div
          style={{
            position: 'absolute',
            left: `${CANVAS_PADDING}px`,
            top: `${CANVAS_PADDING}px`,
            width: `${gridWidth}px`,
            height: `${gridHeight}px`,
          }}
        >
          {draggedCard && hoverPosition && (
            <div
              style={{
                position: 'absolute',
                left: hoverPosition.x * (GRID_CONFIG.cellSize + GRID_CONFIG.gap),
                top: hoverPosition.y * (GRID_CONFIG.cellSize + GRID_CONFIG.gap),
                width: `${
                  getCardDimensions(draggedCard.size).width * (GRID_CONFIG.cellSize + GRID_CONFIG.gap) -
                  GRID_CONFIG.gap
                }px`,
                height: `${
                  getCardDimensions(draggedCard.size).height * (GRID_CONFIG.cellSize + GRID_CONFIG.gap) -
                  GRID_CONFIG.gap
                }px`,
                borderRadius: '16px',
                backgroundColor: isValidDrop ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                border: `3px dashed ${isValidDrop ? '#22c55e' : '#ef4444'}`,
                pointerEvents: 'none',
                transition: 'all 0.1s ease',
              }}
            />
          )}

          {cards.map((card) => (
            <BentoCard
              key={card.id}
              card={card}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDelete={handleDelete}
              onResize={handleResize}
              onEdit={onEditCard}
              isDragging={draggedCard?.id === card.id}
            />
          ))}
        </div>
        </div>
      </div>
    </div>
  );
};

export default GridCanvas;
