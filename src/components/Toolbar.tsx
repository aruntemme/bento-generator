import React from 'react';
import { Plus, Upload, Image, Monitor, Smartphone, Square, AlignLeft, AlignCenter, AlignRight, ArrowDownToLine } from 'lucide-react';
import { CardSize, GridLayout, AlignmentDefaults } from '../types';

interface ToolbarProps {
  onAddCard: (size: CardSize) => void;
  onExport: () => void;
  onExportPNG: (scale?: number) => void;
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
  layout: GridLayout;
  onLayoutChange: (layout: GridLayout) => void;
  globalAlign: AlignmentDefaults;
  onGlobalAlignChange: (align: AlignmentDefaults) => void;
  pngScale: number;
  onPngScaleChange: (scale: number) => void;
}

const QUICK_ADD_SIZES: { size: CardSize; label: string; icon: string }[] = [
  { size: 'small', label: 'Small', icon: '⬜' },
  { size: 'medium', label: 'Medium', icon: '▬' },
  { size: 'large', label: 'Large', icon: '⬛' },
  { size: 'wide', label: 'Wide', icon: '▭' },
];

const LAYOUT_OPTIONS: { layout: GridLayout; label: string; icon: React.ReactNode }[] = [
  { layout: 'wide', label: 'Wide', icon: <Monitor size={16} /> },
  { layout: 'mobile', label: 'Mobile', icon: <Smartphone size={16} /> },
  { layout: 'square', label: 'Square', icon: <Square size={16} /> },
];

const PNG_QUALITY_OPTIONS: { scale: number; label: string }[] = [
  { scale: 1, label: '1x' },
  { scale: 1.5, label: '1.5x' },
  { scale: 2, label: '2x' },
  { scale: 3, label: '3x' },
];

// Loading spinner component
const LoadingSpinner = () => (
  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

export function Toolbar({ onAddCard, onExport, onExportPNG, onImport, layout, onLayoutChange, globalAlign, onGlobalAlignChange, pngScale, onPngScaleChange }: ToolbarProps) {
  // Controlled dropdown for Add menu (better for touch + accessibility)
  const [addOpen, setAddOpen] = React.useState(false);
  const addRef = React.useRef<HTMLDivElement | null>(null);
  // Controlled dropdown for PNG quality menu
  const [pngOpen, setPngOpen] = React.useState(false);
  const pngRef = React.useRef<HTMLDivElement | null>(null);
  // PNG export loading state
  const [pngExporting, setPngExporting] = React.useState(false);

  const handlePngExport = async (scale: number) => {
    if (pngExporting) return; // Prevent multiple exports
    
    setPngExporting(true);
    setPngOpen(false);
    onPngScaleChange(scale);
    
    try {
      await onExportPNG(scale);
    } catch (error) {
      console.error('PNG export failed:', error);
    } finally {
      setPngExporting(false);
    }
  };

  React.useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!addRef.current || !addRef.current.contains(e.target as Node)) {
        setAddOpen(false);
      }
      if (!pngRef.current || !pngRef.current.contains(e.target as Node)) {
        setPngOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setAddOpen(false);
        setPngOpen(false);
      }
    }
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  return (
    <div className="px-6">
      <div className="max-w-6xl mx-auto">
        {/* Sleek floating toolbar matching navbar theme */}
        <div className="bg-white/95 backdrop-blur-xl border border-gray-200/60 rounded-3xl shadow-lg p-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            
            {/* Left side - Primary actions */}
            <div className="flex items-center gap-3">
              {/* Add Card */}
              <div className="relative" ref={addRef}>
                <button
                  onClick={() => setAddOpen((v) => !v)}
                  aria-expanded={addOpen}
                  aria-haspopup="menu"
                  className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2"
                  title="Add card"
                >
                  <Plus size={16} />
                  <span className="font-medium">Add</span>
                </button>
                {addOpen && (
                  <>
                    <div className="fixed inset-0 z-[9998]" onClick={() => setAddOpen(false)} />
                    <div className="absolute mt-2 left-0 bg-white/95 backdrop-blur-xl border border-gray-200/60 rounded-2xl shadow-xl overflow-hidden z-[9999]">
                      <div className="p-2 min-w-[200px]" role="menu">
                        <div className="text-xs font-medium text-gray-500 px-3 py-1 mb-1">Card Sizes</div>
                        <div className="grid grid-cols-2 gap-1">
                          {QUICK_ADD_SIZES.map(({ size, label, icon }) => (
                            <button
                              key={size}
                              onClick={() => { onAddCard(size); setAddOpen(false); }}
                              className="px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-colors flex items-center gap-2"
                              title={`Add ${label} card`}
                              role="menuitem"
                            >
                              <span>{icon}</span>
                              <span>{label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Separator */}
              <div className="w-px h-6 bg-gray-300/60"></div>

              {/* Layout Options */}
              <div className="flex items-center gap-1 bg-gray-100/80 backdrop-blur-sm rounded-2xl p-1">
                {LAYOUT_OPTIONS.map(({ layout: layoutOption, label, icon }) => (
                  <button
                    key={layoutOption}
                    onClick={() => onLayoutChange(layoutOption)}
                    className={`px-3 py-2 text-sm font-medium rounded-xl transition-all duration-200 flex items-center gap-2 ${
                      layout === layoutOption
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:bg-white/80 hover:text-gray-800'
                    }`}
                    title={`${label} layout`}
                  >
                    {icon}
                    <span className="hidden sm:inline">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Right side - Settings and Export */}
            <div className="flex items-center gap-3">
              {/* Alignment Controls */}
              <div className="flex items-center gap-1 bg-gray-100/80 backdrop-blur-sm rounded-2xl p-1">
                {[
                  { v: 'left', icon: <AlignLeft size={16} /> },
                  { v: 'center', icon: <AlignCenter size={16} /> },
                  { v: 'right', icon: <AlignRight size={16} /> },
                ].map((h) => (
                  <button
                    key={h.v}
                    onClick={() => onGlobalAlignChange({ ...globalAlign, textAlign: h.v as 'left' | 'center' | 'right' })}
                    className={`p-2 rounded-xl transition-all duration-200 ${
                      globalAlign.textAlign === h.v ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:bg-white/80'
                    }`}
                    title={`Align ${h.v}`}
                  >
                    {h.icon}
                  </button>
                ))}
                <span className="mx-1 h-4 w-px bg-gray-300/60"/>
                {[
                  { v: 'top', label: 'T' },
                  { v: 'center', label: 'M' },
                  { v: 'bottom', label: 'B' },
                ].map((v) => (
                  <button
                    key={v.v}
                    onClick={() => onGlobalAlignChange({ ...globalAlign, verticalAlign: v.v as 'top' | 'center' | 'bottom' })}
                    className={`px-2.5 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${
                      globalAlign.verticalAlign === v.v ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:bg-white/80'
                    }`}
                    title={`Vertical ${v.v}`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>

              {/* Separator */}
              <div className="w-px h-6 bg-gray-300/60"></div>

              {/* Import/Export */}
              <div className="flex items-center gap-2">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept=".json"
                    onChange={onImport}
                    className="hidden"
                  />
                  <div className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100/80 rounded-2xl transition-all duration-200 flex items-center gap-2">
                    <Upload size={16} />
                    <span className="hidden sm:inline">Import</span>
                  </div>
                </label>
                
                <div className="flex items-center gap-1 bg-gray-100/80 backdrop-blur-sm rounded-2xl p-1">
                  <button
                    onClick={onExport}
                    className="px-3 py-2 text-sm font-medium text-gray-600 hover:bg-white/80 hover:text-gray-800 rounded-xl transition-all duration-200 flex items-center gap-2"
                    title="Export as JSON"
                  >
                    <ArrowDownToLine size={16} />
                    <span className="hidden sm:inline">JSON</span>
                  </button>

                  <div className="relative" ref={pngRef}>
                    <button
                      onClick={() => !pngExporting && setPngOpen((v) => !v)}
                      aria-expanded={pngOpen}
                      aria-haspopup="menu"
                      disabled={pngExporting}
                      className={`px-3 py-2 text-sm font-medium rounded-xl transition-all duration-200 flex items-center gap-2 ${
                        pngExporting 
                          ? 'text-blue-600 cursor-not-allowed' 
                          : 'text-gray-600 hover:bg-white/80 hover:text-gray-800'
                      }`}
                      title={pngExporting ? '' : "Export as PNG"}
                    >
                      {pngExporting ? <LoadingSpinner /> : <Image size={16} />}
                      <span className="hidden sm:inline">
                        {pngExporting ? '' : 'PNG'}
                      </span>
                      {!pngExporting && <span className="text-xs opacity-60">{pngScale}x</span>}
                    </button>
                    {pngOpen && (
                      <>
                        <div className="fixed inset-0 z-[9998]" onClick={() => setPngOpen(false)} />
                        <div className="absolute left-full ml-2 top-0 bg-white/95 backdrop-blur-xl border border-gray-200/60 rounded-2xl shadow-xl overflow-hidden z-[9999]">
                          <div className="p-2 min-w-[140px]">
                            <div className="text-xs font-medium text-gray-500 px-3 py-1 mb-1">PNG Quality</div>
                            {PNG_QUALITY_OPTIONS.map(({ scale, label }) => (
                              <button
                                key={scale}
                                onClick={() => handlePngExport(scale)}
                                disabled={pngExporting}
                                className={`w-full px-3 py-2.5 text-sm text-left hover:bg-gray-50 rounded-xl transition-colors flex items-center justify-between ${
                                  scale === pngScale ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                                } ${pngExporting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                role="menuitem"
                              >
                                <span>{label}</span>
                                {scale === pngScale && (
                                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}