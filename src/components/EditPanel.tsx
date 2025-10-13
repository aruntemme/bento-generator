import React, { useState, useRef, useEffect, useMemo } from 'react';
import { X, Image, Type, Palette, Square, AlignLeft, AlignCenter, AlignRight, AlignHorizontalJustifyStart, AlignHorizontalJustifyCenter, AlignHorizontalJustifyEnd, Upload, Trash2, Shuffle, RefreshCw, Plus, Minus, Check } from 'lucide-react';
import { BentoCard, TextAlignment, TextOrientation, VerticalAlignment, BackgroundStyle, GradientConfig } from '../types';
import { isFeatureEnabled } from '../lib/featureFlags';
import { FONT_CATALOG, ensureFontLoaded } from '../lib/fonts';
import { generateGradientDataURL } from '../lib/gradient/generator';
import { getCardDimensions, GRID_CONFIG } from '../utils/gridUtils';
import { saveUploadedImage, getUploadedImage, deleteUploadedImage } from '../utils/imageStorage';

interface EditPanelProps {
  card: BentoCard | null;
  onClose: () => void;
  onSave: (card: BentoCard) => void;
}

// Reusable UI components - defined outside to prevent recreation on each render
const LabeledSlider: React.FC<{
  label: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (next: number) => void;
  suffix?: string;
}> = ({ label, min, max, step = 1, value, onChange, suffix }) => {
  const percent = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
  const sliderRef = useRef<HTMLInputElement>(null);
  
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-semibold text-gray-700">{label}</label>
        <div className="text-xs text-gray-600 tabular-nums">{Math.round(value * 100) / 100}{suffix || ''}</div>
      </div>
      <input
        ref={sliderRef}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        onInput={(e) => onChange(Number((e.target as HTMLInputElement).value))}
        aria-label={label}
        style={{ 
          background: `linear-gradient(to right, #111827 ${percent}%, #e5e7eb ${percent}%)`,
        }}
        className="w-full h-2 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-gray-900/20 cursor-pointer
          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 
          [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white 
          [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-gray-900 
          [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow
          [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full 
          [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-gray-900 
          [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:shadow"
      />
    </div>
  );
};

const HexInput: React.FC<{
  value: string;
  onCommit: (hex: string) => void;
  placeholder?: string;
  className?: string;
}> = ({ value, onCommit, placeholder = '#000000', className }) => {
  const [local, setLocal] = useState<string>((value || '#000000').toUpperCase());
  useEffect(() => {
    setLocal((value || '#000000').toUpperCase());
  }, [value]);
  const tryCommit = (raw: string) => {
    const hex = raw.startsWith('#') ? raw : `#${raw}`;
    if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      onCommit(hex.toUpperCase());
    }
  };
  return (
    <input
      type="text"
      value={local}
      onChange={(e) => {
        const next = e.target.value.toUpperCase();
        if (/^#?[0-9A-F]{0,6}$/.test(next.replace('#', ''))) {
          const normalized = next.startsWith('#') ? next : `#${next}`;
          setLocal(normalized);
          // Update immediately if valid 6-digit hex
          if (/^#[0-9A-F]{6}$/.test(normalized)) {
            onCommit(normalized);
          }
        }
      }}
      onBlur={() => tryCommit(local)}
      onKeyDown={(e) => { if (e.key === 'Enter') tryCommit(local); }}
      placeholder={placeholder}
      maxLength={7}
      className={className || 'flex-1 font-mono text-sm px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900'}
    />
  );
};

const ColorSwatch: React.FC<{ color: string; selected: boolean; onClick: () => void }> = ({ color, selected, onClick }) => (
  <button
    onClick={onClick}
    title={color}
    className={`relative w-full aspect-square rounded-lg border-2 transition-all ${selected ? 'border-gray-900 scale-110' : 'border-gray-200 hover:border-gray-300'}`}
    style={{ backgroundColor: color }}
  >
    {selected && (
      <span className="absolute inset-0 flex items-center justify-center">
        <Check size={16} className="text-white drop-shadow" />
      </span>
    )}
  </button>
);

const UnifiedColorPicker: React.FC<{
  label: string;
  value: string | undefined;
  presets: string[];
  onChange: (hex: string) => void;
}> = ({ label, value, presets, onChange }) => {
  const hex = (value || '#000000').toUpperCase();
  return (
    <div>
      <label className="text-sm font-semibold text-gray-700 mb-3 block">{label}</label>
      <div className="grid grid-cols-6 gap-2 mb-3">
        {presets.map((c) => (
          <ColorSwatch key={c} color={c} selected={(value || '').toLowerCase() === c.toLowerCase()} onClick={() => onChange(c)} />
        ))}
      </div>
      <div className="flex items-center gap-2">
        <label className="sr-only">Pick</label>
        <input
          type="color"
          value={value || '#000000'}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-10 rounded-lg border border-gray-300 cursor-pointer"
        />
        <HexInput
          value={hex}
          onCommit={(h) => onChange(h)}
          placeholder="#000000"
          className="flex-1 font-mono text-sm px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
      </div>
    </div>
  );
};

const EditPanel: React.FC<EditPanelProps> = ({ card, onClose, onSave }) => {
  const [editedCard, setEditedCard] = useState<BentoCard | null>(card);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Gradient preview hooks must be declared before any early returns
  const [gradientUrl, setGradientUrl] = useState<string | undefined>(undefined);
  const shouldShowGradient = isFeatureEnabled('GRADIENT_CARD_BACKGROUND') && ((editedCard?.backgroundStyle || 'fill') === 'gradient');
  const gradientConfig: GradientConfig | undefined = useMemo(() => {
    if (!editedCard) return undefined;
    return editedCard.gradient || {
      mode: 'softBezier',
      warpShape: 'smoothNoise',
      warpStrength: 0.5,
      warpScale: 420,
      noiseAmount: 0.12,
      seed: Math.floor(Math.random() * 100000),
      colors: [editedCard.backgroundColor || '#084300', '#C5DE7F'],
    };
  }, [editedCard]);

  useEffect(() => {
    let revoked: string | null = null;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      (async () => {
        if (!editedCard || !shouldShowGradient || !gradientConfig) {
          setGradientUrl(undefined);
          return;
        }
        const dims = getCardDimensions(editedCard.size);
        const w = dims.width * (GRID_CONFIG.cellSize + GRID_CONFIG.gap) - GRID_CONFIG.gap;
        const h = dims.height * (GRID_CONFIG.cellSize + GRID_CONFIG.gap) - GRID_CONFIG.gap;
        const url = await generateGradientDataURL(
          gradientConfig,
          Math.max(1, Math.floor(w)),
          Math.max(1, Math.floor(h)),
          { qualityScale: 1, signal: controller.signal }
        );
        if (!controller.signal.aborted) {
          setGradientUrl(url);
          if (url.startsWith('blob:')) revoked = url;
        }
      })();
    }, 120);
    return () => {
      controller.abort();
      clearTimeout(timeoutId);
      if (revoked) URL.revokeObjectURL(revoked);
    };
  }, [editedCard, shouldShowGradient, gradientConfig]);

  // Load selected title font for live preview when typography changes
  useEffect(() => {
    if (!editedCard?.titleTypography) return;
    const { familyId, weight, style } = editedCard.titleTypography;
    const familyOption = FONT_CATALOG.find(f => f.id === familyId);
    if (!familyOption || familyId === 'system') return;
    const cssFamilyName = familyOption.fontFamily.split(',')[0].trim();
    const numericWeight = weight || 400;
    const fontStyle: 'normal' | 'italic' = style || 'normal';
    ensureFontLoaded(familyId, cssFamilyName.replace(/^'|"/, '').replace(/'|"$/, ''), numericWeight, fontStyle).catch(() => {});
  }, [editedCard?.titleTypography]);

  if (!editedCard) return null;

  const handleSave = () => {
    onSave(editedCard);
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Image size should be less than 2MB');
      return;
    }

    setIsUploading(true);
    try {
      const uploadedImage = await saveUploadedImage(file);
      
      // If there was a previous uploaded image, delete it
      if (editedCard.uploadedImageId) {
        deleteUploadedImage(editedCard.uploadedImageId);
      }
      
      setEditedCard({
        ...editedCard,
        backgroundImage: uploadedImage.dataUrl,
        uploadedImageId: uploadedImage.id,
        backgroundColor: undefined,
      });
    } catch (error) {
      alert('Failed to upload image. Please try again.');
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveUploadedImage = () => {
    if (editedCard.uploadedImageId) {
      deleteUploadedImage(editedCard.uploadedImageId);
    }
    setEditedCard({
      ...editedCard,
      backgroundImage: undefined,
      uploadedImageId: undefined,
    });
  };

  const handleImageUrlChange = (url: string) => {
    // If there was an uploaded image, delete it
    if (editedCard.uploadedImageId) {
      deleteUploadedImage(editedCard.uploadedImageId);
    }
    
    setEditedCard({
      ...editedCard,
      backgroundImage: url,
      uploadedImageId: undefined,
      backgroundColor: url ? undefined : editedCard.backgroundColor,
    });
  };

  // Get the actual image URL to display (from uploaded image or URL)
  const getBackgroundImageUrl = () => {
    if (editedCard.uploadedImageId) {
      const uploadedImage = getUploadedImage(editedCard.uploadedImageId);
      return uploadedImage?.dataUrl || editedCard.backgroundImage;
    }
    return editedCard.backgroundImage;
  };

  const colors = [
    '#3b82f6', // Blue
    '#ef4444', // Red
    '#10b981', // Green
    '#f59e0b', // Yellow/Orange
    '#8b5cf6', // Purple
  ];

  const textColors = [
    '#000000', // Black
    '#ffffff', // White
    '#3b82f6', // Blue
    '#ef4444', // Red
    '#10b981', // Green
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

  const displayBackgroundImage = getBackgroundImageUrl();
  
  const previewStyle: React.CSSProperties = {
    width: `${previewWidth}px`,
    height: `${previewHeight}px`,
    backgroundColor: shouldShowGradient || displayBackgroundImage 
      ? 'transparent'
      : backgroundStyle === 'border'
        ? lightenColor(borderColor)
        : editedCard.backgroundColor || '#f3f4f6',
    backgroundImage: shouldShowGradient
      ? (gradientUrl ? `url(${gradientUrl})` : undefined)
      : displayBackgroundImage ? `url(${displayBackgroundImage})` : undefined,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    borderRadius: '16px',
    border: backgroundStyle === 'border' ? `${borderWidth}px solid ${borderColor}` : 'none',
  };

  const selectedFamily = editedCard.titleTypography?.familyId
    ? FONT_CATALOG.find(f => f.id === editedCard.titleTypography?.familyId) || FONT_CATALOG[0]
    : FONT_CATALOG[0];
  const textStyle: React.CSSProperties = {
    color: editedCard.textColor || '#1f2937',
    textAlign: editedCard.textAlignment || 'left',
    fontSize: `${editedCard.fontSize || 16}px`,
    fontWeight: editedCard.titleTypography?.weight || 600,
    fontFamily: selectedFamily.fontFamily,
    fontStyle: editedCard.titleTypography?.style || 'normal',
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
              {/* Draggable color points overlay for gradient */}
              {shouldShowGradient && gradientConfig?.points && (
                <div
                  className="absolute inset-0"
                  onMouseDown={(e) => {
                    const element = e.currentTarget as HTMLDivElement;
                    const rect = element.getBoundingClientRect();
                    const px = (e.clientX - rect.left) / rect.width;
                    const py = (e.clientY - rect.top) / rect.height;
                    // Find nearest point to drag
                    let idx = -1; let best = Infinity;
                    gradientConfig.points!.forEach((p, i) => {
                      const dx = p.x - px; const dy = p.y - py; const d = dx*dx + dy*dy; if (d < best) { best = d; idx = i; }
                    });
                    if (idx < 0) return;
                    const handleMove = (ev: MouseEvent) => {
                      const r = element.getBoundingClientRect();
                      const nx = Math.max(0, Math.min(1, (ev.clientX - r.left) / r.width));
                      const ny = Math.max(0, Math.min(1, (ev.clientY - r.top) / r.height));
                      setEditedCard({
                        ...editedCard,
                        gradient: { ...(gradientConfig as GradientConfig), points: (gradientConfig?.points || []).map((p, i) => i === idx ? { x: nx, y: ny } : p) }
                      });
                    };
                    const handleUp = () => { window.removeEventListener('mousemove', handleMove); window.removeEventListener('mouseup', handleUp); };
                    window.addEventListener('mousemove', handleMove);
                    window.addEventListener('mouseup', handleUp);
                  }}
                >
                  {(gradientConfig.points || []).map((p, i) => (
                    <div key={i} className="absolute w-3 h-3 rounded-full border-2 pointer-events-none" style={{
                      left: `${p.x * 100}%`, top: `${p.y * 100}%`, transform: 'translate(-50%, -50%)',
                      borderColor: i === 0 ? '#084300' : '#ffffff', background: 'transparent'
                    }} />
                  ))}
                </div>
              )}
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
              {/* Link preview removed */}
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
              {/* Background Section */}
              <div className="rounded-xl border border-gray-200 p-4 sm:p-5 bg-white">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Background</h3>
                {/* Background Style */}
                <div className="mb-4">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <Square size={16} />
                    Background Style
                  </label>
                  <div className="flex gap-2">
                    {(["fill", "border", isFeatureEnabled('GRADIENT_CARD_BACKGROUND') ? 'gradient' : null].filter(Boolean) as BackgroundStyle[]).map((style) => (
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

                {/* Colors / Gradient */}
                <div className="mb-4">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <Palette size={16} />
                    {backgroundStyle === 'border' ? 'Border Color' : backgroundStyle === 'gradient' ? 'Colors' : 'Background Color'}
                  </label>
                  {backgroundStyle === 'gradient' && isFeatureEnabled('GRADIENT_CARD_BACKGROUND') ? (
                    <div className="space-y-4">
                      {/* Color swatches with remove button */}
                      <div className="space-y-2">
                        {(gradientConfig?.colors || []).map((c, idx) => (
                          <div key={idx} className="flex items-center gap-2 group">
                            <div className="flex items-center gap-3 flex-1 bg-white border border-gray-200 rounded-lg p-2 hover:border-gray-300 transition-colors">
                              <input
                                type="color"
                                value={c}
                                onChange={(e) => setEditedCard({
                                  ...editedCard,
                                  gradient: {
                                    ...(gradientConfig as GradientConfig),
                                    colors: (gradientConfig?.colors || []).map((cc, i) => (i === idx ? e.target.value : cc)),
                                  },
                                })}
                                className="h-9 w-9 rounded-lg border border-gray-300 cursor-pointer"
                              />
                              <HexInput
                                value={c.toUpperCase()}
                                onCommit={(h) => setEditedCard({
                                  ...editedCard,
                                  gradient: {
                                    ...(gradientConfig as GradientConfig),
                                    colors: (gradientConfig?.colors || []).map((cc, i) => (i === idx ? h : cc)),
                                  },
                                })}
                                placeholder="#000000"
                                className="flex-1 font-mono text-sm px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                              />
                            </div>
                            {(gradientConfig?.colors?.length || 0) > 2 && (
                              <button
                                onClick={() => setEditedCard({
                                  ...editedCard,
                                  gradient: {
                                    ...(gradientConfig as GradientConfig),
                                    colors: (gradientConfig?.colors || []).filter((_, i) => i !== idx),
                                  },
                                })}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                title="Remove color"
                              >
                                <Minus size={16} />
                              </button>
                            )}
                          </div>
                        ))}
                        {(gradientConfig?.colors?.length || 0) < 6 && (
                          <button
                            onClick={() => setEditedCard({
                              ...editedCard,
                              gradient: {
                                ...(gradientConfig as GradientConfig),
                                colors: [...(gradientConfig?.colors || ['#0a4300', '#c5de7f']), '#ffffff'],
                              },
                            })}
                            className="w-full p-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                          >
                            <Plus size={16} /> Add Color
                          </button>
                        )}
                      </div>

                      {/* Shuffle and Randomize buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            const shuffled = [...(gradientConfig?.colors || [])].sort(() => Math.random() - 0.5);
                            setEditedCard({
                              ...editedCard,
                              gradient: { ...(gradientConfig as GradientConfig), colors: shuffled },
                            });
                          }}
                          className="flex-1 py-2 px-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm"
                          title="Shuffle colors"
                        >
                          <Shuffle size={14} /> Shuffle
                        </button>
                        <button
                          onClick={() => {
                            setEditedCard({
                              ...editedCard,
                              gradient: { ...(gradientConfig as GradientConfig), seed: Math.floor(Math.random() * 100000) },
                            });
                          }}
                          className="flex-1 py-2 px-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm"
                          title="Randomize gradient"
                        >
                          <RefreshCw size={14} /> Randomize
                        </button>
                      </div>
                    </div>
                  ) : (
                    <UnifiedColorPicker
                      label={backgroundStyle === 'border' ? 'Border Color' : 'Background Color'}
                      value={(backgroundStyle === 'border' ? editedCard.borderColor : editedCard.backgroundColor) || colors[0]}
                      presets={colors}
                      onChange={(hex) => setEditedCard({
                        ...editedCard,
                        backgroundColor: hex,
                        borderColor: backgroundStyle === 'border' ? hex : editedCard.borderColor,
                        backgroundImage: undefined,
                      })}
                    />
                  )}
                </div>

                {/* Border width (only when border) */}
                {backgroundStyle === 'border' && (
                  <div className="mb-4">
                    <LabeledSlider
                      label="Border Width"
                      min={1}
                      max={8}
                      step={1}
                      value={editedCard.borderWidth || 2}
                      onChange={(v) => setEditedCard({ ...editedCard, borderWidth: Math.round(v) })}
                      suffix="px"
                    />
                  </div>
                )}

                {/* Gradient options (only when gradient) */}
                {backgroundStyle === 'gradient' && isFeatureEnabled('GRADIENT_CARD_BACKGROUND') && (
                  <div className="space-y-4 mb-4">
                    {/* Gradient Mode */}
                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-2 block">Gradient</label>
                      <select
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                        value={gradientConfig?.mode || 'sharpBezier'}
                        onChange={(e) => setEditedCard({
                          ...editedCard,
                          gradient: { ...(gradientConfig as GradientConfig), mode: e.target.value as GradientConfig['mode'] },
                        })}
                      >
                        <option value="sharpBezier">Sharp Bézier</option>
                        <option value="softBezier">Soft Bézier</option>
                        <option value="meshStatic">Mesh Static</option>
                        <option value="meshGrid">Mesh Grid</option>
                        <option value="simple">Simple</option>
                      </select>
                    </div>

                    {/* Warp Shape */}
                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-2 block">Warp Shape</label>
                      <select
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                        value={gradientConfig?.warpShape || 'smoothNoise'}
                        onChange={(e) => setEditedCard({
                          ...editedCard,
                          gradient: { ...(gradientConfig as GradientConfig), warpShape: e.target.value as GradientConfig['warpShape'] },
                        })}
                      >
                        <option value="simplexNoise">Simplex Noise</option>
                        <option value="circular">Circular</option>
                        <option value="valueNoise">Value Noise</option>
                        <option value="worleyNoise">Worley Noise</option>
                        <option value="fbmNoise">FBM Noise</option>
                        <option value="voronoiNoise">Voronoi Noise</option>
                        <option value="domainWarping">Domain Warping</option>
                        <option value="waves">Waves</option>
                        <option value="smoothNoise">Smooth Noise</option>
                        <option value="oval">Oval</option>
                        <option value="rows">Rows</option>
                        <option value="columns">Columns</option>
                        <option value="flat">Flat</option>
                        <option value="gravity">Gravity</option>
                      </select>
                    </div>

                    {/* Width Display */}
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-semibold text-gray-700">W</label>
                      <div className="text-sm text-gray-600">{Math.floor(previewWidth)}</div>
                      <label className="text-sm font-semibold text-gray-700 ml-4">H</label>
                      <div className="text-sm text-gray-600">{Math.floor(previewHeight)}</div>
                    </div>

                    {/* Warp Slider */}
                    <LabeledSlider
                      label="Warp"
                      min={0}
                      max={1}
                      step={0.01}
                      value={gradientConfig?.warpStrength || 0}
                      onChange={(v) => setEditedCard({
                        ...editedCard,
                        gradient: { ...(gradientConfig as GradientConfig), warpStrength: v },
                      })}
                    />

                    {/* Warp Size Slider */}
                    <LabeledSlider
                      label="Warp Size"
                      min={10}
                      max={600}
                      step={1}
                      value={gradientConfig?.warpScale || 200}
                      onChange={(v) => setEditedCard({
                        ...editedCard,
                        gradient: { ...(gradientConfig as GradientConfig), warpScale: Math.round(v) },
                      })}
                    />

                    {/* Noise Slider */}
                    <LabeledSlider
                      label="Noise"
                      min={0}
                      max={0.5}
                      step={0.01}
                      value={gradientConfig?.noiseAmount || 0}
                      onChange={(v) => setEditedCard({
                        ...editedCard,
                        gradient: { ...(gradientConfig as GradientConfig), noiseAmount: v },
                      })}
                    />
                  </div>
                )}

                {/* Background Image */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <Image size={16} />
                    Background Image
                  </label>
                  <div className="mb-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className={`flex items-center justify-center gap-2 w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer transition-colors ${
                        isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-400 hover:bg-gray-50'
                      }`}
                    >
                      <Upload size={16} />
                      <span className="text-sm font-medium text-gray-700">
                        {isUploading ? 'Uploading...' : 'Upload Image (max 2MB)'}
                      </span>
                    </label>
                  </div>
                  {editedCard.uploadedImageId ? (
                    <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <Image size={16} className="text-green-600" />
                      <span className="text-sm text-green-700 flex-1">Uploaded image attached</span>
                      <button
                        onClick={handleRemoveUploadedImage}
                        className="p-1 hover:bg-green-100 rounded transition-colors"
                        title="Remove uploaded image"
                      >
                        <Trash2 size={16} className="text-red-600" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="text-center text-xs text-gray-500 my-2">or</div>
                      <input
                        type="text"
                        value={editedCard.backgroundImage || ''}
                        onChange={(e) => handleImageUrlChange(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                      />
                    </>
                  )}
                </div>
              </div>

              {/* Fonts Section */}
              <div className="rounded-xl border border-gray-200 p-4 sm:p-5 bg-white">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Fonts</h3>
                {isFeatureEnabled('MULTIPLE_TITLE_FONTS') && (
                  <div className="mb-4">
                    <label className="text-sm font-semibold text-gray-700 mb-3 block">Title Font</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <select
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                        value={editedCard.titleTypography?.familyId || 'system'}
                        onChange={(e) => {
                          const familyId = e.target.value;
                          const option = FONT_CATALOG.find(f => f.id === familyId) || FONT_CATALOG[0];
                          const defaultWeight = (option.availableWeights || [400]).includes(400) ? 400 : (option.availableWeights ? option.availableWeights[0] : 400);
                          setEditedCard({
                            ...editedCard,
                            titleTypography: { familyId, weight: defaultWeight, style: option.supportsItalic ? (editedCard.titleTypography?.style || 'normal') : 'normal' },
                          });
                        }}
                      >
                        {FONT_CATALOG.map(opt => (
                          <option key={opt.id} value={opt.id}>{opt.label}</option>
                        ))}
                      </select>

                      <select
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                        disabled={!selectedFamily.availableWeights || selectedFamily.availableWeights.length === 0}
                        value={editedCard.titleTypography?.weight || 400}
                        onChange={(e) => {
                          const nextWeight = parseInt(e.target.value);
                          const prev = editedCard.titleTypography || { familyId: selectedFamily.id, weight: nextWeight, style: 'normal' as const };
                          setEditedCard({
                            ...editedCard,
                            titleTypography: { ...prev, weight: nextWeight },
                          });
                        }}
                      >
                        {(selectedFamily.availableWeights || [400]).map(w => (
                          <option key={w} value={w}>{w}</option>
                        ))}
                      </select>

                      <select
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                        disabled={!selectedFamily.supportsItalic}
                        value={editedCard.titleTypography?.style || 'normal'}
                        onChange={(e) => {
                          const nextStyle = e.target.value as 'normal' | 'italic';
                          const defaultWeight = (selectedFamily.availableWeights || [400])[0] || 400;
                          const prev = editedCard.titleTypography || { familyId: selectedFamily.id, weight: defaultWeight, style: 'normal' as const };
                          setEditedCard({
                            ...editedCard,
                            titleTypography: { ...prev, style: nextStyle },
                          });
                        }}
                      >
                        <option value="normal">Regular</option>
                        <option value="italic">Italic</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Text Color */}
                <div className="mb-4">
                  <UnifiedColorPicker
                    label="Text Color"
                    value={editedCard.textColor || '#000000'}
                    presets={textColors}
                    onChange={(hex) => setEditedCard({ ...editedCard, textColor: hex })}
                  />
                </div>

                {/* Font Size */}
                <div>
                  <LabeledSlider
                    label="Font Size"
                    min={12}
                    max={48}
                    step={1}
                    value={editedCard.fontSize || 16}
                    onChange={(v) => setEditedCard({ ...editedCard, fontSize: Math.round(v) })}
                    suffix="px"
                  />
                </div>
              </div>

              {/* Layout Section */}
              <div className="rounded-xl border border-gray-200 p-4 sm:p-5 bg-white">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Layout</h3>
                {/* Text Content */}
                <div className="mb-4">
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

                {/* Subtitle */}
                <div className="mb-4">
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

                {/* Horizontal Alignment */}
                <div className="mb-4">
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

                {/* Vertical Alignment */}
                <div className="mb-4">
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

                {/* Text Orientation */}
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
