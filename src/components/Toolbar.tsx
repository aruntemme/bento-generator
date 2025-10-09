import React, { useEffect, useRef, useState } from 'react';
import { Plus, Download, Upload, Save, FolderOpen, Sparkles, MoreVertical, Star, Briefcase, Link, Camera, Palette, ShoppingBag, Code, Circle } from 'lucide-react';
import { BentoCard, BentoLayout, CardSize } from '../types';
import { importLayoutFromJSON } from '../utils/storage';
import { templates } from '../lib/templates';
import type { Template } from '../lib/templates';

interface ToolbarProps {
  onAddCard: (size: CardSize) => void;
  onExportImage: () => void;
  onExportJSON: () => void;
  onImportJSON: (layout: BentoLayout) => void;
  onSaveLayout: () => void;
  onLoadLayout: (layout: BentoLayout) => void;
  layouts: BentoLayout[];
  onApplyTemplate: (cards: BentoCard[]) => void;
  onShowModal: (message: string, type: 'success' | 'error' | 'info', title?: string) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  onAddCard,
  onExportImage,
  onExportJSON,
  onImportJSON,
  onSaveLayout,
  onLoadLayout,
  layouts,
  onApplyTemplate,
  onShowModal,
}) => {
  const [showSizeMenu, setShowSizeMenu] = useState(false);
  const [showLayoutMenu, setShowLayoutMenu] = useState(false);
  const [showTemplateMenu, setShowTemplateMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const [starCount, setStarCount] = useState<number | null>(null);

  // Refs for click-outside handling
  const desktopTemplateRef = useRef<HTMLDivElement | null>(null);
  const desktopSizeRef = useRef<HTMLDivElement | null>(null);
  const desktopLoadRef = useRef<HTMLDivElement | null>(null);
  const desktopExportRef = useRef<HTMLDivElement | null>(null);

  const mobileTemplateRef = useRef<HTMLDivElement | null>(null);
  const mobileSizeRef = useRef<HTMLDivElement | null>(null);
  const mobileMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleGlobalMouseDown = (e: MouseEvent) => {
      const target = e.target as Node;
      const refs = [
        desktopTemplateRef,
        desktopSizeRef,
        desktopLoadRef,
        desktopExportRef,
        mobileTemplateRef,
        mobileSizeRef,
        mobileMoreRef,
      ];
      const clickedInsideAny = refs.some((r) => r.current && r.current.contains(target));
      if (!clickedInsideAny) {
        setShowTemplateMenu(false);
        setShowSizeMenu(false);
        setShowLayoutMenu(false);
        setShowExportMenu(false);
        setShowMoreMenu(false);
      }
    };
    document.addEventListener('mousedown', handleGlobalMouseDown);
    return () => {
      document.removeEventListener('mousedown', handleGlobalMouseDown);
    };
  }, []);

  const getTemplateIcon = (t: Template) => {
    const name = t.name.toLowerCase();
    if (name.includes('developer')) return Code;
    if (name.includes('photo')) return Camera;
    switch (t.category) {
      case 'portfolio':
        return Briefcase;
      case 'social':
        return Link;
      case 'business':
        return Briefcase;
      case 'creative':
        return Palette;
      case 'ecommerce':
        return ShoppingBag;
      case 'personal':
        return Circle;
      default:
        return Circle;
    }
  };

  useEffect(() => {
    let isMounted = true;
    const fetchStars = async () => {
      try {
        const res = await fetch('https://api.github.com/repos/aruntemme/bento-generator');
        if (!res.ok) return;
        const data = await res.json();
        if (isMounted && typeof data.stargazers_count === 'number') {
          setStarCount(data.stargazers_count);
        }
      } catch {
        // noop: best-effort only
      }
    };
    fetchStars();
    const id = setInterval(fetchStars, 1000 * 60 * 10);
    return () => {
      isMounted = false;
      clearInterval(id);
    };
  }, []);

  const sizes: CardSize[] = ['square', 'wide', 'portrait', 'large'];

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    importLayoutFromJSON(file)
      .then((layout) => {
        onImportJSON(layout);
        onShowModal('Layout imported successfully!', 'success', 'Import Complete');
      })
      .catch(() => {
        onShowModal('Invalid JSON file. Please make sure you\'re importing a valid Bento layout file.', 'error', 'Import Failed');
      });
  };

  return (
    <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 shadow-sm z-40">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <img
            src="/bento-logo.png"
            alt="Bento logo"
            className="h-8 sm:h-10 w-auto object-contain"
          />
          <div role="heading" aria-level={1} className="leading-tight select-none">
            <div className="text-lg sm:text-2xl font-bold text-gray-900">Bento</div>
            <div className="text-[10px] sm:text-xs text-gray-600 -mt-0.5">Generator</div>
          </div>
          
          {/* GitHub Star Button - Desktop */}
          <a
            href="https://github.com/aruntemme/bento-generator"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Star aruntemme/bento-generator on GitHub"
            className="hidden md:flex items-center gap-2 h-9 px-3 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors text-sm font-medium group border border-gray-800"
          >
            <Star size={16} className="text-yellow-300 group-hover:fill-yellow-400 group-hover:text-yellow-400 transition-colors" />
            <span className="hidden lg:inline">Star on GitHub</span>
            {starCount !== null && (
              <span className="ml-1 hidden lg:inline px-2 py-0.5 rounded bg-white/10 text-white text-xs tabular-nums">
                {starCount.toLocaleString()}
              </span>
            )}
          </a>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-2">
          <div className="relative" ref={desktopTemplateRef}>
            <button
              onClick={() => setShowTemplateMenu(!showTemplateMenu)}
              className="flex items-center gap-2 h-9 px-3 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors font-medium"
            >
              <Sparkles size={18} />
              Templates
            </button>
            {showTemplateMenu && (
              <div className="absolute top-full mt-2 right-0 bg-white rounded-lg shadow-lg border border-gray-200 p-2 w-64 max-h-[32rem] overflow-y-auto z-50">
                {templates.map((template) => (
                  <button
                    key={template.name}
                    onClick={() => {
                      onApplyTemplate(template.cards);
                      setShowTemplateMenu(false);
                    }}
                    className="block w-full text-left px-3 py-2.5 rounded hover:bg-gray-100 transition-colors group"
                  >
                    <div className="flex items-center gap-2">
                      {(() => { const Icon = getTemplateIcon(template as Template); return <Icon size={18} className="text-gray-600" />; })()}
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-gray-900 group-hover:text-gray-700">
                          {template.name}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {template.description}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative" ref={desktopSizeRef}>
            <button
              onClick={() => setShowSizeMenu(!showSizeMenu)}
              className="flex items-center gap-2 h-9 px-3 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors font-medium"
            >
              <Plus size={18} />
              Add Card
            </button>
            {showSizeMenu && (
              <div className="absolute top-full mt-2 right-0 bg-white rounded-lg shadow-lg border border-gray-200 p-2 w-40 z-50">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => {
                      onAddCard(size);
                      setShowSizeMenu(false);
                    }}
                    className="block w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-sm capitalize font-medium"
                  >
                    {size}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="h-6 w-px bg-gray-200 mx-1" />

          <button
            onClick={onSaveLayout}
            className="flex items-center gap-2 h-9 px-3 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors font-medium"
          >
            <Save size={18} />
            Save
          </button>

          <div className="relative" ref={desktopLoadRef}>
            <button
              onClick={() => setShowLayoutMenu(!showLayoutMenu)}
              className="flex items-center gap-2 h-9 px-3 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors font-medium"
            >
              <FolderOpen size={18} />
              Load
            </button>
            {showLayoutMenu && (
              <div className="absolute top-full mt-2 right-0 bg-white rounded-lg shadow-lg border border-gray-200 p-2 w-64 max-h-80 overflow-y-auto z-50">
                {layouts.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-gray-500">No saved layouts</div>
                ) : (
                  layouts.map((layout) => (
                    <button
                      key={layout.id}
                      onClick={() => {
                        onLoadLayout(layout);
                        setShowLayoutMenu(false);
                      }}
                      className="block w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-sm font-medium"
                    >
                      <div>{layout.name}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(layout.updatedAt).toLocaleDateString()}
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="h-6 w-px bg-gray-200 mx-1" />

          <div className="relative" ref={desktopExportRef}>
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-2 h-9 px-3 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors font-medium"
            >
              <Download size={18} />
              Export
            </button>
            {showExportMenu && (
              <div className="absolute top-full mt-2 right-0 bg-white rounded-lg shadow-lg border border-gray-200 p-2 w-44 z-50">
                <button
                  onClick={() => {
                    onExportImage();
                    setShowExportMenu(false);
                  }}
                  className="flex items-center gap-2 w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-sm font-medium"
                >
                  <Download size={16} />
                  Image
                </button>
                <button
                  onClick={() => {
                    onExportJSON();
                    setShowExportMenu(false);
                  }}
                  className="flex items-center gap-2 w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-sm font-medium"
                >
                  <Download size={16} />
                  JSON
                </button>
              </div>
            )}
          </div>

          <label className="flex items-center gap-2 h-9 px-3 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors cursor-pointer font-medium">
            <Upload size={18} />
            Import
            <input
              type="file"
              accept=".json"
              onChange={handleFileImport}
              className="hidden"
            />
          </label>
        </div>

        {/* Mobile Menu */}
        <div className="flex md:hidden items-center gap-2">
          {/* GitHub Star Button - Mobile */}
          <a
            href="https://github.com/aruntemme/bento-generator"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center h-9 w-9 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors group"
            title="Star on GitHub"
          >
            <Star size={16} className="group-hover:fill-yellow-400 group-hover:text-yellow-400 transition-colors" />
          </a>
          
          {/* Templates Button - Always visible on mobile */}
          <div className="relative" ref={mobileTemplateRef}>
            <button
              onClick={() => {
                setShowTemplateMenu(!showTemplateMenu);
                setShowMoreMenu(false);
              }}
              className="flex items-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              <Sparkles size={16} />
              <span className="hidden xs:inline">Templates</span>
            </button>
            {showTemplateMenu && (
              <div className="absolute top-full mt-2 right-0 bg-white rounded-lg shadow-lg border border-gray-200 p-2 w-72 max-h-96 overflow-y-auto z-50">
                {templates.map((template) => (
                  <button
                    key={template.name}
                    onClick={() => {
                      onApplyTemplate(template.cards);
                      setShowTemplateMenu(false);
                    }}
                    className="block w-full text-left px-3 py-2.5 rounded hover:bg-gray-100 transition-colors group"
                  >
                    <div className="flex items-center gap-2">
                      {(() => { const Icon = getTemplateIcon(template as Template); return <Icon size={16} className="text-gray-600" />; })()}
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-gray-900 group-hover:text-gray-700">
                          {template.name}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                          {template.description}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Add Card Button - Always visible on mobile */}
          <div className="relative" ref={mobileSizeRef}>
            <button
              onClick={() => {
                setShowSizeMenu(!showSizeMenu);
                setShowMoreMenu(false);
              }}
              className="flex items-center gap-1 px-3 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
            >
              <Plus size={16} />
              <span className="hidden xs:inline">Add</span>
            </button>
            {showSizeMenu && (
              <div className="absolute top-full mt-2 right-0 bg-white rounded-lg shadow-lg border border-gray-200 p-2 w-40 z-50">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => {
                      onAddCard(size);
                      setShowSizeMenu(false);
                    }}
                    className="block w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-sm capitalize font-medium"
                  >
                    {size}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* More Menu - Contains other actions */}
          <div className="relative" ref={mobileMoreRef}>
            <button
              onClick={() => {
                setShowMoreMenu(!showMoreMenu);
                setShowSizeMenu(false);
                setShowTemplateMenu(false);
              }}
              className="flex items-center justify-center p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <MoreVertical size={18} />
            </button>
            {showMoreMenu && (
              <div className="absolute top-full mt-2 right-0 bg-white rounded-lg shadow-lg border border-gray-200 p-2 w-48 z-50">
                <button
                  onClick={() => {
                    onSaveLayout();
                    setShowMoreMenu(false);
                  }}
                  className="flex items-center gap-2 w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-sm font-medium"
                >
                  <Save size={16} />
                  Save Layout
                </button>
                
                <div className="relative">
                  <button
                    onClick={() => setShowLayoutMenu(!showLayoutMenu)}
                    className="flex items-center gap-2 w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-sm font-medium"
                  >
                    <FolderOpen size={16} />
                    Load Layout
                  </button>
                  {showLayoutMenu && (
                    <div className="absolute left-full top-0 ml-2 bg-white rounded-lg shadow-lg border border-gray-200 p-2 w-64 max-h-80 overflow-y-auto">
                      {layouts.length === 0 ? (
                        <div className="px-3 py-2 text-sm text-gray-500">No saved layouts</div>
                      ) : (
                        layouts.map((layout) => (
                          <button
                            key={layout.id}
                            onClick={() => {
                              onLoadLayout(layout);
                              setShowLayoutMenu(false);
                              setShowMoreMenu(false);
                            }}
                            className="block w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-sm font-medium"
                          >
                            <div>{layout.name}</div>
                            <div className="text-xs text-gray-500">
                              {new Date(layout.updatedAt).toLocaleDateString()}
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    onExportImage();
                    setShowMoreMenu(false);
                  }}
                  className="flex items-center gap-2 w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-sm font-medium"
                >
                  <Download size={16} />
                  Export Image
                </button>

                <button
                  onClick={() => {
                    onExportJSON();
                    setShowMoreMenu(false);
                  }}
                  className="flex items-center gap-2 w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-sm font-medium"
                >
                  <Download size={16} />
                  Export JSON
                </button>

                <label className="flex items-center gap-2 w-full px-3 py-2 rounded hover:bg-gray-100 cursor-pointer text-sm font-medium">
                  <Upload size={16} />
                  Import JSON
                  <input
                    type="file"
                    accept=".json"
                    onChange={(e) => {
                      handleFileImport(e);
                      setShowMoreMenu(false);
                    }}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Toolbar;
