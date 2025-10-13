import React, { useState, memo, useMemo, useEffect } from 'react';
import { Trash2, Maximize2, Image, Pencil, Link as LinkIcon } from 'lucide-react';
import { BentoCard as BentoCardType, CardSize, GradientConfig } from '../types';
import { getCardDimensions, GRID_CONFIG } from '../utils/gridUtils';
import { getUploadedImage } from '../utils/imageStorage';
import { isFeatureEnabled } from '../lib/featureFlags';
import { generateGradientDataURL } from '../lib/gradient/generator';

interface BentoCardProps {
  card: BentoCardType;
  onDragStart: (e: React.DragEvent, card: BentoCardType) => void;
  onDragEnd: () => void;
  onDelete: (id: string) => void;
  onResize: (id: string, newSize: CardSize) => void;
  onEdit: (card: BentoCardType) => void;
  isDragging: boolean;
}

const BentoCard: React.FC<BentoCardProps> = memo(({
  card,
  onDragStart,
  onDragEnd,
  onDelete,
  onResize,
  onEdit,
  isDragging,
}) => {
  const [showControls, setShowControls] = useState(false);
  const [showResizeMenu, setShowResizeMenu] = useState(false);

  const dims = getCardDimensions(card.size);
  const width = dims.width * (GRID_CONFIG.cellSize + GRID_CONFIG.gap) - GRID_CONFIG.gap;
  const height = dims.height * (GRID_CONFIG.cellSize + GRID_CONFIG.gap) - GRID_CONFIG.gap;

  const backgroundStyle = card.backgroundStyle || 'fill';
  const borderWidth = card.borderWidth || 2;
  const borderColor = card.borderColor || card.backgroundColor || '#e5e7eb';

  // Get the actual background image URL (from uploaded image or direct URL)
  const backgroundImageUrl = useMemo(() => {
    if (card.uploadedImageId) {
      const uploadedImage = getUploadedImage(card.uploadedImageId);
      return uploadedImage?.dataUrl || card.backgroundImage;
    }
    return card.backgroundImage;
  }, [card.uploadedImageId, card.backgroundImage]);

  // Helper to lighten a color (for border-only background)
  const lightenColor = (color: string, percent: number = 95) => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const white = 255;
    return `rgba(${r + (white - r) * (percent / 100)}, ${g + (white - g) * (percent / 100)}, ${b + (white - b) * (percent / 100)}, 1)`;
  };

  const [gradientUrl, setGradientUrl] = useState<string | undefined>(undefined);
  const shouldShowGradient = isFeatureEnabled('GRADIENT_CARD_BACKGROUND') && (card.backgroundStyle || 'fill') === 'gradient' && !!card.gradient;

  useEffect(() => {
    let revoked: string | null = null;
    if (!shouldShowGradient || !card.gradient) {
      setGradientUrl(undefined);
      return;
    }
    const run = async () => {
      const url = await generateGradientDataURL(card.gradient as GradientConfig, Math.max(1, Math.floor(width)), Math.max(1, Math.floor(height)));
      setGradientUrl(url);
      if (url.startsWith('blob:')) revoked = url;
    };
    run();
    return () => { if (revoked) URL.revokeObjectURL(revoked); };
  }, [shouldShowGradient, card.gradient, width, height]);

  const style: React.CSSProperties = {
    position: 'absolute',
    left: card.x * (GRID_CONFIG.cellSize + GRID_CONFIG.gap),
    top: card.y * (GRID_CONFIG.cellSize + GRID_CONFIG.gap),
    width: `${width}px`,
    height: `${height}px`,
    backgroundColor: (shouldShowGradient || backgroundImageUrl) 
      ? 'transparent'
      : backgroundStyle === 'border'
        ? lightenColor(borderColor)
        : card.backgroundColor || '#f3f4f6',
    backgroundImage: shouldShowGradient
      ? (gradientUrl ? `url(${gradientUrl})` : undefined)
      : (backgroundImageUrl ? `url(${backgroundImageUrl})` : undefined),
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    borderRadius: '16px',
    border: backgroundStyle === 'border' ? `${borderWidth}px solid ${borderColor}` : 'none',
    cursor: isDragging ? 'grabbing' : 'grab',
    opacity: isDragging ? 0.5 : 1,
    transition: isDragging ? 'none' : 'all 0.2s ease',
  };

  const getVerticalAlignment = () => {
    const vAlign = card.verticalAlignment || 'top';
    if (vAlign === 'top') return 'flex-start';
    if (vAlign === 'bottom') return 'flex-end';
    return 'center';
  };

  const textStyle: React.CSSProperties = {
    color: card.textColor || '#1f2937',
    textAlign: card.textAlignment || 'left',
    fontSize: `${card.fontSize || 16}px`,
    fontWeight: 600,
    writingMode: card.textOrientation === 'vertical' ? 'vertical-rl' : 'horizontal-tb',
  };

  const sizes: CardSize[] = ['square', 'wide', 'portrait', 'large'];

  return (
    <div
      style={style}
      draggable
      onDragStart={(e) => onDragStart(e, card)}
      onDragEnd={onDragEnd}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => {
        setShowControls(false);
        setShowResizeMenu(false);
      }}
      className={`shadow-lg hover:shadow-xl relative ${showResizeMenu ? 'overflow-visible z-40' : 'overflow-hidden'}`}
    >
      {(card.text || card.subtitle) && (
        <div 
          className="p-4 h-full flex" 
          style={{ 
            alignItems: getVerticalAlignment(),
            justifyContent: card.textAlignment === 'center' ? 'center' : card.textAlignment === 'right' ? 'flex-end' : 'flex-start'
          }}
        >
          <div>
            {card.text && <div style={textStyle}>{card.text}</div>}
            {card.subtitle && (
              <div
                style={{
                  ...textStyle,
                  fontSize: `${Math.max(10, (card.fontSize || 16) - 4)}px`,
                  fontWeight: 500,
                  opacity: 0.8,
                }}
              >
                {card.subtitle}
              </div>
            )}
          </div>
        </div>
      )}

      {showControls && (
        <div className="absolute top-1 sm:top-2 right-1 sm:right-2 flex gap-1 sm:gap-2 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowResizeMenu(!showResizeMenu);
            }}
            className="p-1.5 sm:p-2 bg-white rounded-lg shadow-md hover:bg-gray-100 transition-colors touch-manipulation"
            title="Resize"
          >
            <Maximize2 size={14} className="text-gray-700 sm:w-4 sm:h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(card);
            }}
            className="p-1.5 sm:p-2 bg-white rounded-lg shadow-md hover:bg-gray-100 transition-colors touch-manipulation"
            title="Edit"
          >
            <Pencil size={14} className="text-gray-700 sm:w-4 sm:h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(card.id);
            }}
            className="p-1.5 sm:p-2 bg-white rounded-lg shadow-md hover:bg-red-50 transition-colors touch-manipulation"
            title="Delete"
          >
            <Trash2 size={14} className="text-red-600 sm:w-4 sm:h-4" />
          </button>
        </div>
      )}

      {showResizeMenu && (
        <div className="absolute top-10 sm:top-12 right-1 sm:right-2 bg-white rounded-lg shadow-lg p-2 z-50 min-w-[100px]">
          {sizes.map((size) => (
            <button
              key={size}
              onClick={(e) => {
                e.stopPropagation();
                onResize(card.id, size);
                setShowResizeMenu(false);
              }}
              className={`block w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-xs sm:text-sm capitalize touch-manipulation ${
                card.size === size ? 'bg-gray-100 font-semibold' : ''
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      )}

      {card.link && (
        <div className="absolute bottom-2 left-2">
          <LinkIcon size={16} className="text-gray-500" />
        </div>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for performance optimization
  // Only re-render if these specific props change
  return (
    prevProps.card.id === nextProps.card.id &&
    prevProps.card.x === nextProps.card.x &&
    prevProps.card.y === nextProps.card.y &&
    prevProps.card.size === nextProps.card.size &&
    prevProps.card.backgroundColor === nextProps.card.backgroundColor &&
    prevProps.card.backgroundImage === nextProps.card.backgroundImage &&
    prevProps.card.uploadedImageId === nextProps.card.uploadedImageId &&
    prevProps.card.backgroundStyle === nextProps.card.backgroundStyle &&
    JSON.stringify(prevProps.card.gradient) === JSON.stringify(nextProps.card.gradient) &&
    prevProps.card.borderColor === nextProps.card.borderColor &&
    prevProps.card.borderWidth === nextProps.card.borderWidth &&
    prevProps.card.text === nextProps.card.text &&
    prevProps.card.subtitle === nextProps.card.subtitle &&
    prevProps.card.textColor === nextProps.card.textColor &&
    prevProps.card.textAlignment === nextProps.card.textAlignment &&
    prevProps.card.verticalAlignment === nextProps.card.verticalAlignment &&
    prevProps.card.textOrientation === nextProps.card.textOrientation &&
    prevProps.card.fontSize === nextProps.card.fontSize &&
    prevProps.isDragging === nextProps.isDragging
  );
});

BentoCard.displayName = 'BentoCard';

export default BentoCard;
