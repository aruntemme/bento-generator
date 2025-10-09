import React, { useState } from 'react';
import { X, Image, Type, Link as LinkIcon, Palette, Square, AlignLeft, AlignCenter, AlignRight, AlignHorizontalJustifyStart, AlignHorizontalJustifyCenter, AlignHorizontalJustifyEnd } from 'lucide-react';
import { BentoCard, TextAlignment, TextOrientation, VerticalAlignment, BackgroundStyle } from '../types';
import { getCardDimensions, GRID_CONFIG } from '../utils/gridUtils';

interface EditPanelProps {
  card: BentoCard | null;
  onClose: () => void;
  onSave: (card: BentoCard) => void;
}

const EditPanel: React.FC<EditPanelProps> = ({ card, onClose, onSave }) => {
  const [editedCard, setEditedCard] = useState<BentoCard | null>(card);

  if (!editedCard) return null;

  const handleSave = () => {
    onSave(editedCard);
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  const colors = [
    '#f3f4f6', '#fef3c7', '#fecaca', '#fbcfe8', '#ddd6fe',
    '#bfdbfe', '#a7f3d0', '#fbbf24', '#f87171', '#ec4899',
    '#a78bfa', '#60a5fa', '#34d399', '#1f2937', '#374151'
  ];

  // Helper to lighten a color (for border-only background in preview)
  const lightenColor = (color: string, percent: number = 95) => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const white = 255;
    return `rgba(${r + (white - r) * (percent / 100)}, ${g + (white - g) * (percent / 100)}, ${b + (white - b) * (percent / 100)}, 1)`;
  };

  const getVerticalAlignment = () => {
    const vAlign = editedCard.verticalAlignment || 'top';
    if (vAlign === 'top') return 'flex-start';
    if (vAlign === 'bottom') return 'flex-end';
    return 'center';
  };

  const backgroundStyle = editedCard.backgroundStyle || 'fill';
  const borderWidth = editedCard.borderWidth || 2;
  const borderColor = editedCard.borderColor || editedCard.backgroundColor || '#e5e7eb';

  // Get card dimensions based on size – match exact grid math
  const cardDimensions = getCardDimensions(editedCard.size);
  const previewWidth = cardDimensions.width * (GRID_CONFIG.cellSize + GRID_CONFIG.gap) - GRID_CONFIG.gap;
  const previewHeight = cardDimensions.height * (GRID_CONFIG.cellSize + GRID_CONFIG.gap) - GRID_CONFIG.gap;

  const previewStyle: React.CSSProperties = {
    width: `${previewWidth}px`,
    height: `${previewHeight}px`,
    backgroundColor: editedCard.backgroundImage 
      ? 'transparent'
      : backgroundStyle === 'border'
        ? lightenColor(borderColor)
        : editedCard.backgroundColor || '#f3f4f6',
    backgroundImage: editedCard.backgroundImage ? `url(${editedCard.backgroundImage})` : undefined,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    borderRadius: '16px',
    border: backgroundStyle === 'border' ? `${borderWidth}px solid ${borderColor}` : 'none',
  };

  const textStyle: React.CSSProperties = {
    color: editedCard.textColor || '#1f2937',
    textAlign: editedCard.textAlignment || 'left',
    fontSize: `${editedCard.fontSize || 16}px`,
    fontWeight: 600,
    writingMode: editedCard.textOrientation === 'vertical' ? 'vertical-rl' : 'horizontal-tb',
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-6xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col md:flex-row">
        {/* Live Preview Panel - Top on mobile, Left on desktop */}
        <div className="w-full md:w-2/5 bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-8 flex flex-col">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-4">Live Preview</h3>
          <div className="text-xs text-gray-500 mb-3 capitalize">{editedCard.size}</div>
          <div className="flex-1 flex items-center justify-center py-4">
            <div
              style={{
                ...previewStyle,
                maxWidth: '100%',
              }}
              className="shadow-lg relative overflow-hidden"
            >
              {(editedCard.text || editedCard.subtitle) && (
                <div 
                  className="p-2 sm:p-4 h-full flex" 
                  style={{ 
                    alignItems: getVerticalAlignment(),
                    justifyContent: editedCard.textAlignment === 'center' ? 'center' : editedCard.textAlignment === 'right' ? 'flex-end' : 'flex-start'
                  }}
                >
                  <div>
                    {editedCard.text && <div style={textStyle}>{editedCard.text}</div>}
                    {editedCard.subtitle && (
                      <div
                        style={{
                          ...textStyle,
                          fontSize: `${Math.max(10, (editedCard.fontSize || 16) - 4)}px`,
                          fontWeight: 500,
                          opacity: 0.8,
                        }}
                      >
                        {editedCard.subtitle}
                      </div>
                    )}
                  </div>
                </div>
              )}
              {editedCard.link && (
                <div className="absolute bottom-2 left-2 opacity-70">
                  <LinkIcon size={16} className="text-gray-500" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Edit Controls Panel - Bottom on mobile, Right on desktop */}
        <div className="w-full md:w-3/5 overflow-y-auto flex-1">
          <div className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Edit Card</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 -mt-3 mb-4 sm:mb-6">
              Make changes below; the live preview reflects exact grid sizing.
            </p>

            <div className="space-y-4 sm:space-y-6">
              {/* Background Style */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <Square size={16} />
                  Background Style
                </label>
                <div className="flex gap-2">
                  {(['fill', 'border'] as BackgroundStyle[]).map((style) => (
                    <button
                      key={style}
                      onClick={() => setEditedCard({ 
                        ...editedCard, 
                        backgroundStyle: style,
                        borderColor: style === 'border' ? (editedCard.borderColor || editedCard.backgroundColor) : editedCard.borderColor
                      })}
                      className={`flex-1 px-4 py-2 rounded-lg capitalize font-medium transition-colors ${
                        (editedCard.backgroundStyle || 'fill') === style
                          ? 'bg-gray-900 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <Palette size={16} />
                  {backgroundStyle === 'border' ? 'Border Color' : 'Background Color'}
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setEditedCard({ 
                        ...editedCard, 
                        backgroundColor: color, 
                        borderColor: backgroundStyle === 'border' ? color : editedCard.borderColor,
                        backgroundImage: undefined 
                      })}
                      className={`w-full aspect-square rounded-lg border-2 transition-all ${
                        (backgroundStyle === 'border' ? editedCard.borderColor : editedCard.backgroundColor) === color 
                          ? 'border-gray-900 scale-110' 
                          : 'border-gray-200'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {backgroundStyle === 'border' && (
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-3 block">
                    Border Width
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="8"
                    value={editedCard.borderWidth || 2}
                    onChange={(e) => setEditedCard({ ...editedCard, borderWidth: parseInt(e.target.value) })}
                    className="w-full"
                  />
                  <div className="text-center text-sm text-gray-600 mt-1">{editedCard.borderWidth || 2}px</div>
                </div>
              )}

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <Image size={16} />
                  Background Image URL
                </label>
                <input
                  type="text"
                  value={editedCard.backgroundImage || ''}
                  onChange={(e) => setEditedCard({ ...editedCard, backgroundImage: e.target.value, backgroundColor: undefined })}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <Type size={16} />
                  Text Content
                </label>
                <textarea
                  value={editedCard.text || ''}
                  onChange={(e) => setEditedCard({ ...editedCard, text: e.target.value })}
                  placeholder="Enter text..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-3 block">
                  Subtitle
                </label>
                <input
                  type="text"
                  value={editedCard.subtitle || ''}
                  onChange={(e) => setEditedCard({ ...editedCard, subtitle: e.target.value })}
                  placeholder="Optional subtitle under title"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-3 block">
                  Text Color
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {['#1f2937', '#374151', '#6b7280', '#ffffff', '#fbbf24', '#f87171', '#ec4899', '#a78bfa', '#60a5fa', '#34d399'].map((color) => (
                    <button
                      key={color}
                      onClick={() => setEditedCard({ ...editedCard, textColor: color })}
                      className={`w-full aspect-square rounded-lg border-2 transition-all ${
                        editedCard.textColor === color ? 'border-gray-900 scale-110' : 'border-gray-200'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-3 block">
                  Font Size
                </label>
                <input
                  type="range"
                  min="12"
                  max="48"
                  value={editedCard.fontSize || 16}
                  onChange={(e) => setEditedCard({ ...editedCard, fontSize: parseInt(e.target.value) })}
                  className="w-full"
                />
                <div className="text-center text-sm text-gray-600 mt-1">{editedCard.fontSize || 16}px</div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-3 block">
                  Horizontal Alignment
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['left', 'center', 'right'] as TextAlignment[]).map((align) => (
                    <button
                      key={align}
                      onClick={() => setEditedCard({ ...editedCard, textAlignment: align })}
                      className={`flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-colors ${
                        (editedCard.textAlignment || 'left') === align
                          ? 'bg-gray-900 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      title={align}
                    >
                      {align === 'left' && <AlignLeft size={18} />}
                      {align === 'center' && <AlignCenter size={18} />}
                      {align === 'right' && <AlignRight size={18} />}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-3 block">
                  Vertical Alignment
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['top', 'center', 'bottom'] as VerticalAlignment[]).map((align) => (
                    <button
                      key={align}
                      onClick={() => setEditedCard({ ...editedCard, verticalAlignment: align })}
                      className={`flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-colors ${
                        (editedCard.verticalAlignment || 'top') === align
                          ? 'bg-gray-900 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      title={align}
                    >
                      {align === 'top' && <AlignHorizontalJustifyStart size={18} className="rotate-90" />}
                      {align === 'center' && <AlignHorizontalJustifyCenter size={18} className="rotate-90" />}
                      {align === 'bottom' && <AlignHorizontalJustifyEnd size={18} className="rotate-90" />}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-3 block">
                  Text Orientation
                </label>
                <div className="flex gap-2">
                  {(['horizontal', 'vertical'] as TextOrientation[]).map((orient) => (
                    <button
                      key={orient}
                      onClick={() => setEditedCard({ ...editedCard, textOrientation: orient })}
                      className={`flex-1 px-4 py-2 rounded-lg capitalize font-medium transition-colors ${
                        editedCard.textOrientation === orient
                          ? 'bg-gray-900 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {orient}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <LinkIcon size={16} />
                  Link URL
                </label>
                <input
                  type="text"
                  value={editedCard.link || ''}
                  onChange={(e) => setEditedCard({ ...editedCard, link: e.target.value })}
                  placeholder="https://example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>

              <div className="flex gap-2 sm:gap-3 pt-4 sticky bottom-0 bg-white pb-2">
                <button
                  onClick={handleCancel}
                  className="flex-1 py-2 sm:py-3 text-sm sm:text-base bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 py-2 sm:py-3 text-sm sm:text-base bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditPanel;
