import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { BentoCard } from './BentoCard';
import { BentoCard as BentoCardType, GridLayout, AlignmentDefaults } from '../types';

interface BentoGridProps {
  cards: BentoCardType[];
  onCardsChange: (cards: BentoCardType[]) => void;
  onEditCard: (card: BentoCardType) => void;
  onDeleteCard: (cardId: string) => void;
  layout: GridLayout;
  globalAlign?: AlignmentDefaults;
}

export function BentoGrid({ cards, onCardsChange, onEditCard, onDeleteCard, layout, globalAlign }: BentoGridProps) {
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const activeCard = cards.find(card => card.id === activeId);

  // Base canvas sizing for each layout
  const baseRef = React.useRef<HTMLDivElement | null>(null);
  const [rowHeightPx, setRowHeightPx] = React.useState<number>(140);

  const GAP_PX = 16; // 1rem gap

  function getCanvasSize(): { width: number; height: number; columns: number } {
    switch (layout) {
      case 'square':
        return { width: 1024, height: 1024, columns: 4 };
      case 'mobile':
        // iPhone-ish base; cards should be smaller here
        return { width: 390, height: 780, columns: 2 };
      case 'wide':
      default:
        return { width: 1280, height: 720, columns: 6 };
    }
  }

  // Keep grid cells square by syncing row height to computed column width
  React.useEffect(() => {
    function recompute() {
      const base = baseRef.current;
      if (!base) return;
      const { width, columns } = getCanvasSize();
      const totalGap = GAP_PX * (columns - 1);
      const columnWidth = Math.floor((width - totalGap) / columns);
      setRowHeightPx(columnWidth);
    }
    recompute();
    window.addEventListener('resize', recompute);
    return () => window.removeEventListener('resize', recompute);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layout]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);

    if (active.id !== over?.id) {
      const oldIndex = cards.findIndex((card) => card.id === active.id);
      const newIndex = cards.findIndex((card) => card.id === over?.id);

      onCardsChange(arrayMove(cards, oldIndex, newIndex));
    }
  }

  function handleDragCancel() {
    setActiveId(null);
  }

  const getColumns = () => getCanvasSize().columns;

  const { width: baseWidth, height: baseHeight } = getCanvasSize();
  const PADDING = GAP_PX;
  // Snap base height to whole rows for non-square layouts to avoid partial cuts
  const snappedBaseHeight = React.useMemo(() => {
    if (layout === 'square') return baseHeight;
    const unit = rowHeightPx + GAP_PX; // one row including gap
    // available content height inside padding
    const inner = Math.max(baseHeight - PADDING * 2, unit);
    const rows = Math.floor((inner + GAP_PX) / unit); // rows fully visible
    const height = PADDING * 2 + Math.max(rows, 1) * rowHeightPx + Math.max(rows - 1, 0) * GAP_PX;
    return height;
  }, [layout, baseHeight, rowHeightPx]);

  return (
    <div className="w-full max-w-6xl mx-auto p-6" id="bento-grid">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="w-full flex items-center justify-center">
          {/* Base canvas establishes the layout ground. Cards outside won't be exported. */}
          <div
            id="bento-base"
            ref={baseRef}
            data-hide-border-on-export
            className="relative rounded-3xl bg-white/0"
            style={{
              width: `${baseWidth}px`,
              height: `${snappedBaseHeight}px`,
              border: '1px dashed rgba(148, 163, 184, 0.6)',
              overflow: 'visible',
            }}
          >
            <SortableContext items={cards} strategy={rectSortingStrategy}>
              <div
                className="absolute inset-0"
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${getColumns()}, 1fr)`,
                  gap: `${GAP_PX}px`,
                  gridAutoRows: `${rowHeightPx}px`,
                  padding: `${PADDING}px`,
                  boxSizing: 'border-box',
                }}
              >
                {cards.map((card) => (
                  <BentoCard
                    key={card.id}
                    card={{
                      ...card,
                      textAlign: card.textAlign ?? globalAlign?.textAlign,
                      verticalAlign: card.verticalAlign ?? globalAlign?.verticalAlign,
                    }}
                    onEdit={onEditCard}
                    onDelete={onDeleteCard}
                  />
                ))}
              </div>
            </SortableContext>
          </div>
        </div>
        <DragOverlay>
          {activeCard ? (
            <div
              className="rounded-2xl overflow-hidden shadow-2xl opacity-90 transform rotate-3"
              style={{
                ...(activeCard.backgroundGradient 
                  ? { background: activeCard.backgroundGradient }
                  : { backgroundColor: activeCard.backgroundColor }
                ),
                color: activeCard.textColor,
                width: '200px',
                height: '120px',
              }}
            >
              <div className="p-4 h-full flex flex-col justify-between">
                {activeCard.image && (
                  <div className="flex-1 mb-2 rounded-lg overflow-hidden bg-white/10">
                    <img
                      src={activeCard.image}
                      alt={activeCard.title}
                      className="w-full h-full object-cover"
                      draggable={false}
                    />
                  </div>
                )}
                <div className="flex-1 flex flex-col justify-end">
                  <h3 className="font-semibold text-sm mb-1 line-clamp-1">
                    {activeCard.title}
                  </h3>
                  {activeCard.content && (
                    <p className="text-xs opacity-80 line-clamp-2">
                      {activeCard.content}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}