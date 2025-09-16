import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { BentoCard as BentoCardType, CARD_SIZES } from '../types';
import { Edit, Trash2 } from 'lucide-react';

interface BentoCardProps {
  card: BentoCardType;
  onEdit: (card: BentoCardType) => void;
  onDelete: (cardId: string) => void;
  isEditing?: boolean;
}

export function BentoCard({ card, onEdit, onDelete, isEditing = false }: BentoCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
  } = useSortable({ id: card.id });

  const baseStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1000 : 'auto',
  };

  const size = CARD_SIZES[card.size];
  const sizeClasses = {
    small: 'col-span-1 row-span-1',
    medium: 'col-span-2 row-span-1', 
    large: 'col-span-2 row-span-2',
    wide: 'col-span-3 row-span-1',
    tall: 'col-span-1 row-span-2',
    featured: 'col-span-3 row-span-2',
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit(card);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(card.id);
  };

  const getBackgroundStyle = () => {
    if (card.backgroundGradient) {
      return { background: card.backgroundGradient };
    }
    return { backgroundColor: card.backgroundColor };
  };

  const horizontal = card.textAlign || 'left';
  const vertical = card.verticalAlign || 'bottom';
  const justifyContent = vertical === 'top' ? 'flex-start' : vertical === 'center' ? 'center' : 'flex-end';
  const textAlign = horizontal;
  const titleSize = card.titleFontSize || 18; // default ~ md:text-lg
  const contentSize = card.contentFontSize || 14; // default ~ md:text-sm

  return (
    <div
      ref={setNodeRef}
      className={`
        relative group rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200
        ${sizeClasses[card.size]}
        ${isDragging ? 'opacity-50 scale-105 shadow-2xl' : 'opacity-100'}
        ${isOver ? 'ring-2 ring-blue-400 ring-opacity-50' : ''}
      `}
      style={{
        ...baseStyle,
        ...getBackgroundStyle(),
        color: card.textColor,
      }}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute inset-0 cursor-grab active:cursor-grabbing z-10"
        data-export-ignore
        style={{ touchAction: 'none' }}
      />

      {/* Content */}
      <div className="p-4 h-full flex flex-col relative z-20 pointer-events-none" style={{ wordBreak: 'normal', justifyContent, textAlign }}>
        {card.image && (
          <div className="flex-1 mb-3 rounded-xl overflow-hidden bg-white/10">
            <img
              src={card.image}
              alt={card.title}
              className="w-full h-full object-cover"
              crossOrigin="anonymous"
              decoding="sync"
              loading="eager"
              fetchPriority="high"
              referrerPolicy="no-referrer"
              draggable={false}
            />
          </div>
        )}
        
        <div className="flex-1 flex flex-col" style={{ justifyContent }}>
          <h3 className="font-semibold mb-1 line-clamp-2" style={{ fontSize: `${titleSize}px` }}>
            {card.title}
          </h3>
          {card.content && (
            <p className="opacity-80 line-clamp-3" style={{ fontSize: `${contentSize}px` }}>
              {card.content}
            </p>
          )}
        </div>
      </div>

      {/* Edit Overlay */}
      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center pointer-events-none z-30" data-export-ignore>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleEditClick}
            className="bg-white/90 backdrop-blur-sm text-gray-800 p-2 rounded-lg hover:bg-white transition-colors pointer-events-auto"
            title="Edit card"
          >
            <Edit size={16} />
          </button>
          <button 
            onClick={handleDeleteClick}
            className="bg-red-500/90 backdrop-blur-sm text-white p-2 rounded-lg hover:bg-red-500 transition-colors pointer-events-auto"
            title="Delete card"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Size indicator */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-30 pointer-events-none" data-export-ignore>
        <div className="bg-black/20 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
          {card.size}
        </div>
      </div>
    </div>
  );
}