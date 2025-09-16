import { useState, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';
import { BentoCard } from '../types';
import { X, Image as ImageIcon, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

interface EditModalProps {
  card: BentoCard | null;
  onSave: (card: BentoCard) => void;
  onClose: () => void;
}

const PRESET_COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899',
  '#06B6D4', '#84CC16', '#F97316', '#6366F1', '#14B8A6', '#F43F5E'
];

const PRESET_GRADIENTS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
  'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
  'linear-gradient(135deg, #fad0c4 0%, #ffd1ff 100%)',
  'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
  'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)',
];

export function EditModal({ card, onSave, onClose }: EditModalProps) {
  const [editedCard, setEditedCard] = useState<BentoCard | null>(null);
  const [showBackgroundPicker, setShowBackgroundPicker] = useState(false);
  const [showTextPicker, setShowTextPicker] = useState(false);
  const [backgroundType, setBackgroundType] = useState<'solid' | 'gradient'>('solid');
  const [activeTab, setActiveTab] = useState<'content' | 'layout' | 'style'>('content');

  useEffect(() => {
    if (card) {
      setEditedCard({ ...card });
      setBackgroundType(card.backgroundGradient ? 'gradient' : 'solid');
    }
  }, [card]);

  if (!card || !editedCard) return null;

  const updateCard = (updates: Partial<BentoCard>) => {
    setEditedCard(prev => (prev ? { ...prev, ...updates } : prev));
  };

  const handleSave = () => {
    onSave(editedCard);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Edit Card</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors" aria-label="Close">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="px-4 sm:px-6 pb-6 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-y-auto">
          {/* Preview (left) */}
          <div className="space-y-3 lg:sticky lg:top-4 self-start">
            <label className="block text-sm font-medium text-gray-700">Preview</label>
            <div
              className="w-full h-56 rounded-2xl p-4 flex flex-col"
              style={{
                ...(editedCard.backgroundGradient && backgroundType === 'gradient'
                  ? { background: editedCard.backgroundGradient }
                  : { backgroundColor: editedCard.backgroundColor }
                ),
                color: editedCard.textColor,
                textAlign: editedCard.textAlign || 'left',
                justifyContent:
                  editedCard.verticalAlign === 'top'
                    ? 'flex-start'
                    : editedCard.verticalAlign === 'center'
                    ? 'center'
                    : 'flex-end',
              }}
            >
              <h3 className="font-semibold mb-1" style={{ fontSize: `${editedCard.titleFontSize ?? 18}px` }}>{editedCard.title || 'Title'}</h3>
              {editedCard.content && (
                <p className="opacity-80" style={{ fontSize: `${editedCard.contentFontSize ?? 14}px` }}>{editedCard.content}</p>
              )}
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 w-max">
              {(['content','layout','style'] as const).map(key => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`px-3 py-1.5 text-sm rounded-lg transition ${activeTab === key ? 'bg-white shadow-sm text-gray-900' : 'text-gray-700 hover:bg-white hover:shadow-sm'}`}
                >
                  {key[0].toUpperCase() + key.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Editor (right) */}
          <div className="space-y-6 lg:col-start-2">
            {activeTab === 'content' && (
              <div className="space-y-4">
                {/* Title */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    value={editedCard.title}
                    onChange={(e) => updateCard({ title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter title..."
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={editedCard.content || ''}
                    onChange={(e) => updateCard({ content: e.target.value })}
                    rows={5}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Enter content..."
                  />
                </div>

                {/* Image URL */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Image URL</label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={editedCard.image || ''}
                      onChange={(e) => updateCard({ image: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://images.pexels.com/..."
                    />
                    <div className="px-3 py-2 border border-gray-300 rounded-xl text-gray-500 bg-gray-50 flex items-center">
                      <ImageIcon size={16} />
                    </div>
                  </div>
                </div>

                {/* Typography */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Title Size</label>
                    <input
                      type="range"
                      min={12}
                      max={48}
                      value={editedCard.titleFontSize ?? 18}
                      onChange={(e) => updateCard({ titleFontSize: Number(e.target.value || 18) })}
                      className="w-full"
                    />
                    <div className="text-xs text-gray-500">{editedCard.titleFontSize ?? 18}px</div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Description Size</label>
                    <input
                      type="range"
                      min={10}
                      max={32}
                      value={editedCard.contentFontSize ?? 14}
                      onChange={(e) => updateCard({ contentFontSize: Number(e.target.value || 14) })}
                      className="w-full"
                    />
                    <div className="text-xs text-gray-500">{editedCard.contentFontSize ?? 14}px</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'layout' && (
              <div className="space-y-6">
                {/* Alignment */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Alignment</label>
                  <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1 w-max">
                    {[
                      { v: 'left', icon: <AlignLeft size={16} /> },
                      { v: 'center', icon: <AlignCenter size={16} /> },
                      { v: 'right', icon: <AlignRight size={16} /> },
                    ].map((opt) => (
                      <button
                        key={opt.v}
                        onClick={() => updateCard({ textAlign: opt.v as 'left' | 'center' | 'right' })}
                        className={`px-2.5 py-2 rounded-lg transition ${(editedCard.textAlign || 'left') === opt.v ? 'bg-white shadow-sm text-gray-900' : 'text-gray-700 hover:bg-white hover:shadow-sm'}`}
                        title={`${opt.v} align`}
                      >
                        {opt.icon}
                      </button>
                    ))}
                    <span className="mx-1 h-5 w-px bg-gray-300" />
                    {[
                      { v: 'top', label: 'Top' },
                      { v: 'center', label: 'Mid' },
                      { v: 'bottom', label: 'Bot' },
                    ].map((opt) => (
                      <button
                        key={opt.v}
                        onClick={() => updateCard({ verticalAlign: opt.v as 'top' | 'center' | 'bottom' })}
                        className={`px-2.5 py-2 rounded-lg text-xs transition ${(editedCard.verticalAlign || 'bottom') === opt.v ? 'bg-white shadow-sm text-gray-900' : 'text-gray-700 hover:bg-white hover:shadow-sm'}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'style' && (
              <div className="space-y-6">
                {/* Background */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">Background</label>
                  <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1 w-max">
                    <button
                      onClick={() => { setBackgroundType('solid'); updateCard({ backgroundGradient: undefined }); }}
                      className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${backgroundType === 'solid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                      Solid
                    </button>
                    <button
                      onClick={() => setBackgroundType('gradient')}
                      className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${backgroundType === 'gradient' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                      Gradient
                    </button>
                  </div>

                  {backgroundType === 'solid' ? (
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2">
                        {PRESET_COLORS.map((color) => (
                          <button
                            key={color}
                            onClick={() => updateCard({ backgroundColor: color, backgroundGradient: undefined })}
                            className={`w-8 h-8 rounded-lg border-2 ${editedCard.backgroundColor === color && !editedCard.backgroundGradient ? 'border-gray-800' : 'border-gray-200'}`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <button onClick={() => setShowBackgroundPicker(!showBackgroundPicker)} className="text-sm text-blue-600 hover:text-blue-700">Custom Color</button>
                      {showBackgroundPicker && (
                        <div className="mt-2">
                          <HexColorPicker
                            color={editedCard.backgroundColor}
                            onChange={(color) => updateCard({ backgroundColor: color, backgroundGradient: undefined })}
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="grid grid-cols-4 gap-2">
                        {PRESET_GRADIENTS.map((gradient, index) => (
                          <button
                            key={index}
                            onClick={() => updateCard({ backgroundGradient: gradient })}
                            className={`w-12 h-8 rounded-lg border-2 ${editedCard.backgroundGradient === gradient ? 'border-gray-800' : 'border-gray-200'}`}
                            style={{ background: gradient }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Text color */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">Text Color</label>
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {['#FFFFFF', '#000000', '#374151', '#6B7280', '#9CA3AF'].map((color) => (
                        <button
                          key={color}
                          onClick={() => updateCard({ textColor: color })}
                          className={`w-8 h-8 rounded-lg border-2 ${editedCard.textColor === color ? 'border-blue-500' : 'border-gray-200'}`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <button onClick={() => setShowTextPicker(!showTextPicker)} className="text-sm text-blue-600 hover:text-blue-700">Custom Color</button>
                    {showTextPicker && (
                      <div className="mt-2">
                        <HexColorPicker
                          color={editedCard.textColor}
                          onChange={(color) => updateCard({ textColor: color })}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t bg-gray-50 rounded-b-2xl">
          <button onClick={onClose} className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors">Cancel</button>
          <button onClick={handleSave} className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">Save Changes</button>
        </div>
      </div>
    </div>
  );
}