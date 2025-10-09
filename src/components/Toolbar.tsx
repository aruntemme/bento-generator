import React, { useState } from 'react';
import { Plus, Download, Upload, Save, FolderOpen, Sparkles, MoreVertical } from 'lucide-react';
import { BentoCard, BentoLayout, CardSize } from '../types';
import { isValidPosition, checkCollision } from '../utils/gridUtils';

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

  const sizes: CardSize[] = ['square', 'wide', 'portrait', 'large'];

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const layout = JSON.parse(event.target?.result as string) as BentoLayout;
        onImportJSON(layout);
        onShowModal('Layout imported successfully!', 'success', 'Import Complete');
      } catch (error) {
        onShowModal('Invalid JSON file. Please make sure you\'re importing a valid Bento layout file.', 'error', 'Import Failed');
      }
    };
    reader.readAsText(file);
  };

  const templates = [
    {
      name: '✨ Portfolio Pro',
      cards: [
        { 
          id: '1', 
          size: 'wide' as CardSize, 
          x: 0, 
          y: 0, 
          backgroundColor: '#1f2937', 
          text: 'Sarah Chen\nCreative Designer', 
          textColor: '#ffffff',
          textAlignment: 'center' as const,
          verticalAlignment: 'center' as const,
          fontSize: 24,
        },
        { 
          id: '2', 
          size: 'square' as CardSize, 
          x: 4, 
          y: 0, 
          backgroundImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop',
          text: '',
        },
        { 
          id: '3', 
          size: 'square' as CardSize, 
          x: 6, 
          y: 0,
          backgroundStyle: 'border' as const,
          borderColor: '#ec4899',
          borderWidth: 3,
          text: 'UI/UX',
          textColor: '#ec4899',
          textAlignment: 'center' as const,
          verticalAlignment: 'center' as const,
          fontSize: 20,
        },
        { 
          id: '4', 
          size: 'portrait' as CardSize, 
          x: 8, 
          y: 0,
          backgroundImage: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400',
          text: '',
        },
        { 
          id: '5', 
          size: 'square' as CardSize, 
          x: 10, 
          y: 0,
          backgroundColor: '#60a5fa',
          text: '5+ Years',
          textColor: '#ffffff',
          textAlignment: 'center' as const,
          verticalAlignment: 'center' as const,
          fontSize: 18,
        },
        { 
          id: '6', 
          size: 'large' as CardSize, 
          x: 0, 
          y: 2,
          backgroundImage: 'https://images.unsplash.com/photo-1634942537034-2531766767d1?w=600',
          text: 'Featured Project',
          textColor: '#ffffff',
          textAlignment: 'left' as const,
          verticalAlignment: 'bottom' as const,
          fontSize: 22,
        },
        { 
          id: '7', 
          size: 'wide' as CardSize, 
          x: 4, 
          y: 2,
          backgroundColor: '#fbbf24',
          text: 'Brand Identity • Web Design • Mobile Apps',
          textColor: '#1f2937',
          textAlignment: 'center' as const,
          verticalAlignment: 'center' as const,
          fontSize: 14,
        },
        { 
          id: '8', 
          size: 'wide' as CardSize, 
          x: 4, 
          y: 4,
          backgroundStyle: 'border' as const,
          borderColor: '#34d399',
          borderWidth: 2,
          text: '📧 hello@sarahchen.design',
          textColor: '#1f2937',
          textAlignment: 'center' as const,
          verticalAlignment: 'center' as const,
          fontSize: 16,
        },
        { 
          id: '9', 
          size: 'square' as CardSize, 
          x: 10, 
          y: 2,
          backgroundColor: '#a78bfa',
          text: '100+\nProjects',
          textColor: '#ffffff',
          textAlignment: 'center' as const,
          verticalAlignment: 'center' as const,
          fontSize: 18,
        },
        { 
          id: '10', 
          size: 'square' as CardSize, 
          x: 10, 
          y: 4,
          backgroundColor: '#ec4899',
          text: 'Hire Me',
          textColor: '#ffffff',
          textAlignment: 'center' as const,
          verticalAlignment: 'center' as const,
          fontSize: 18,
        },
      ],
    },
    {
      name: '🔗 Social Links',
      cards: [
        { 
          id: '1', 
          size: 'large' as CardSize, 
          x: 0, 
          y: 0,
          backgroundImage: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=600',
          text: '@alexmorgan',
          textColor: '#ffffff',
          textAlignment: 'center' as const,
          verticalAlignment: 'bottom' as const,
          fontSize: 28,
        },
        { 
          id: '2', 
          size: 'wide' as CardSize, 
          x: 4, 
          y: 0,
          backgroundColor: '#1f2937',
          text: 'GitHub',
          textColor: '#ffffff',
          textAlignment: 'center' as const,
          verticalAlignment: 'center' as const,
          fontSize: 20,
        },
        { 
          id: '3', 
          size: 'square' as CardSize, 
          x: 8, 
          y: 0,
          backgroundColor: '#60a5fa',
          text: 'Twitter',
          textColor: '#ffffff',
          textAlignment: 'center' as const,
          verticalAlignment: 'center' as const,
          fontSize: 18,
        },
        { 
          id: '4', 
          size: 'square' as CardSize, 
          x: 10, 
          y: 0,
          backgroundColor: '#ec4899',
          text: 'Instagram',
          textColor: '#ffffff',
          textAlignment: 'center' as const,
          verticalAlignment: 'center' as const,
          fontSize: 16,
        },
        { 
          id: '5', 
          size: 'wide' as CardSize, 
          x: 4, 
          y: 2,
          backgroundColor: '#a78bfa',
          text: 'LinkedIn',
          textColor: '#ffffff',
          textAlignment: 'center' as const,
          verticalAlignment: 'center' as const,
          fontSize: 20,
        },
        { 
          id: '6', 
          size: 'square' as CardSize, 
          x: 8, 
          y: 2,
          backgroundColor: '#fbbf24',
          text: 'YouTube',
          textColor: '#1f2937',
          textAlignment: 'center' as const,
          verticalAlignment: 'center' as const,
          fontSize: 18,
        },
        { 
          id: '7', 
          size: 'square' as CardSize, 
          x: 10, 
          y: 2,
          backgroundColor: '#34d399',
          text: 'Spotify',
          textColor: '#1f2937',
          textAlignment: 'center' as const,
          verticalAlignment: 'center' as const,
          fontSize: 18,
        },
        { 
          id: '8', 
          size: 'wide' as CardSize, 
          x: 0, 
          y: 4,
          backgroundStyle: 'border' as const,
          borderColor: '#ec4899',
          borderWidth: 3,
          text: 'Newsletter',
          textColor: '#ec4899',
          textAlignment: 'center' as const,
          verticalAlignment: 'center' as const,
          fontSize: 20,
        },
        { 
          id: '9', 
          size: 'wide' as CardSize, 
          x: 4, 
          y: 4,
          backgroundColor: '#f87171',
          text: 'Portfolio',
          textColor: '#ffffff',
          textAlignment: 'center' as const,
          verticalAlignment: 'center' as const,
          fontSize: 20,
        },
        { 
          id: '10', 
          size: 'wide' as CardSize, 
          x: 8, 
          y: 4,
          backgroundStyle: 'border' as const,
          borderColor: '#60a5fa',
          borderWidth: 3,
          text: 'Contact Me',
          textColor: '#60a5fa',
          textAlignment: 'center' as const,
          verticalAlignment: 'center' as const,
          fontSize: 20,
        },
      ],
    },
    {
      name: '📸 Photography',
      cards: [
        { 
          id: '1', 
          size: 'square' as CardSize, 
          x: 0, 
          y: 0,
          backgroundImage: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=400',
          text: '',
        },
        { 
          id: '2', 
          size: 'wide' as CardSize, 
          x: 2, 
          y: 0,
          backgroundImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600',
          text: '',
        },
        { 
          id: '3', 
          size: 'portrait' as CardSize, 
          x: 6, 
          y: 0,
          backgroundImage: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400',
          text: '',
        },
        { 
          id: '4', 
          size: 'square' as CardSize, 
          x: 8, 
          y: 0,
          backgroundColor: '#1f2937',
          text: 'Emma\nWilson',
          textColor: '#ffffff',
          textAlignment: 'center' as const,
          verticalAlignment: 'center' as const,
          fontSize: 24,
        },
        { 
          id: '5', 
          size: 'square' as CardSize, 
          x: 10, 
          y: 0,
          backgroundStyle: 'border' as const,
          borderColor: '#fbbf24',
          borderWidth: 3,
          text: 'Travel\nPhotography',
          textColor: '#fbbf24',
          textAlignment: 'center' as const,
          verticalAlignment: 'center' as const,
          fontSize: 16,
        },
        { 
          id: '6', 
          size: 'wide' as CardSize, 
          x: 0, 
          y: 2,
          backgroundImage: 'https://images.unsplash.com/photo-1511593358241-7eea1f3c84e5?w=600',
          text: '',
        },
        { 
          id: '7', 
          size: 'large' as CardSize, 
          x: 8, 
          y: 2,
          backgroundImage: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600',
          text: 'Landscapes',
          textColor: '#ffffff',
          textAlignment: 'left' as const,
          verticalAlignment: 'bottom' as const,
          fontSize: 22,
        },
        { 
          id: '8', 
          size: 'square' as CardSize, 
          x: 0, 
          y: 4,
          backgroundColor: '#60a5fa',
          text: '50+\nCountries',
          textColor: '#ffffff',
          textAlignment: 'center' as const,
          verticalAlignment: 'center' as const,
          fontSize: 18,
        },
        { 
          id: '9', 
          size: 'square' as CardSize, 
          x: 2, 
          y: 4,
          backgroundImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
          text: '',
        },
        { 
          id: '10', 
          size: 'wide' as CardSize, 
          x: 4, 
          y: 4,
          backgroundColor: '#ec4899',
          text: 'Book a Session',
          textColor: '#ffffff',
          textAlignment: 'center' as const,
          verticalAlignment: 'center' as const,
          fontSize: 20,
        },
      ],
    },
    {
      name: '🎨 Design Studio',
      cards: [
        { 
          id: '1', 
          size: 'wide' as CardSize, 
          x: 0, 
          y: 0,
          backgroundColor: '#a78bfa',
          text: 'PIXEL STUDIO',
          textColor: '#ffffff',
          textAlignment: 'center' as const,
          verticalAlignment: 'center' as const,
          fontSize: 26,
        },
        { 
          id: '2', 
          size: 'square' as CardSize, 
          x: 4, 
          y: 0,
          backgroundStyle: 'border' as const,
          borderColor: '#a78bfa',
          borderWidth: 3,
          text: 'Branding',
          textColor: '#a78bfa',
          textAlignment: 'center' as const,
          verticalAlignment: 'center' as const,
          fontSize: 18,
        },
        { 
          id: '3', 
          size: 'portrait' as CardSize, 
          x: 6, 
          y: 0,
          backgroundImage: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400',
          text: '',
        },
        { 
          id: '4', 
          size: 'large' as CardSize, 
          x: 8, 
          y: 0,
          backgroundImage: 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=600',
          text: 'Recent Work',
          textColor: '#ffffff',
          textAlignment: 'center' as const,
          verticalAlignment: 'bottom' as const,
          fontSize: 24,
        },
        { 
          id: '5', 
          size: 'square' as CardSize, 
          x: 0, 
          y: 2,
          backgroundColor: '#fbbf24',
          text: 'Web\nDesign',
          textColor: '#1f2937',
          textAlignment: 'center' as const,
          verticalAlignment: 'center' as const,
          fontSize: 20,
        },
        { 
          id: '6', 
          size: 'square' as CardSize, 
          x: 2, 
          y: 2,
          backgroundColor: '#34d399',
          text: 'Mobile\nApps',
          textColor: '#1f2937',
          textAlignment: 'center' as const,
          verticalAlignment: 'center' as const,
          fontSize: 20,
        },
        { 
          id: '7', 
          size: 'square' as CardSize, 
          x: 4, 
          y: 2,
          backgroundColor: '#ec4899',
          text: 'Logo\nDesign',
          textColor: '#ffffff',
          textAlignment: 'center' as const,
          verticalAlignment: 'center' as const,
          fontSize: 20,
        },
        { 
          id: '8', 
          size: 'wide' as CardSize, 
          x: 0, 
          y: 4,
          backgroundColor: '#1f2937',
          text: 'Let\'s Create Something Amazing',
          textColor: '#ffffff',
          textAlignment: 'center' as const,
          verticalAlignment: 'center' as const,
          fontSize: 18,
        },
        { 
          id: '9', 
          size: 'square' as CardSize, 
          x: 4, 
          y: 4,
          backgroundColor: '#60a5fa',
          text: '200+\nClients',
          textColor: '#ffffff',
          textAlignment: 'center' as const,
          verticalAlignment: 'center' as const,
          fontSize: 18,
        },
        { 
          id: '10', 
          size: 'square' as CardSize, 
          x: 6, 
          y: 4,
          backgroundStyle: 'border' as const,
          borderColor: '#ec4899',
          borderWidth: 3,
          text: 'Contact',
          textColor: '#ec4899',
          textAlignment: 'center' as const,
          verticalAlignment: 'center' as const,
          fontSize: 18,
        },
        { 
          id: '11', 
          size: 'square' as CardSize, 
          x: 8, 
          y: 4,
          backgroundImage: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400',
          text: '',
        },
        { 
          id: '12', 
          size: 'square' as CardSize, 
          x: 10, 
          y: 4,
          backgroundImage: 'https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=400',
          text: '',
        },
      ],
    },
    {
      name: '🛍️ Product Showcase',
      cards: [
        { 
          id: '1', 
          size: 'large' as CardSize, 
          x: 0, 
          y: 0,
          backgroundImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600',
          text: 'NEW COLLECTION',
          textColor: '#ffffff',
          textAlignment: 'center' as const,
          verticalAlignment: 'top' as const,
          fontSize: 28,
        },
        { 
          id: '2', 
          size: 'square' as CardSize, 
          x: 4, 
          y: 0,
          backgroundColor: '#1f2937',
          text: '50%\nOFF',
          textColor: '#fbbf24',
          textAlignment: 'center' as const,
          verticalAlignment: 'center' as const,
          fontSize: 32,
        },
        { 
          id: '3', 
          size: 'portrait' as CardSize, 
          x: 6, 
          y: 0,
          backgroundImage: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
          text: '',
        },
        { 
          id: '4', 
          size: 'square' as CardSize, 
          x: 8, 
          y: 0,
          backgroundColor: '#ec4899',
          text: 'Free\nShipping',
          textColor: '#ffffff',
          textAlignment: 'center' as const,
          verticalAlignment: 'center' as const,
          fontSize: 20,
        },
        { 
          id: '5', 
          size: 'square' as CardSize, 
          x: 10, 
          y: 0,
          backgroundImage: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400',
          text: '',
        },
        { 
          id: '6', 
          size: 'square' as CardSize, 
          x: 8, 
          y: 2,
          backgroundStyle: 'border' as const,
          borderColor: '#60a5fa',
          borderWidth: 3,
          text: 'Premium\nQuality',
          textColor: '#60a5fa',
          textAlignment: 'center' as const,
          verticalAlignment: 'center' as const,
          fontSize: 18,
        },
        { 
          id: '7', 
          size: 'square' as CardSize, 
          x: 10, 
          y: 2,
          backgroundImage: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400',
          text: '',
        },
        { 
          id: '8', 
          size: 'wide' as CardSize, 
          x: 0, 
          y: 4,
          backgroundColor: '#60a5fa',
          text: 'Shop Now',
          textColor: '#ffffff',
          textAlignment: 'center' as const,
          verticalAlignment: 'center' as const,
          fontSize: 24,
        },
        { 
          id: '9', 
          size: 'square' as CardSize, 
          x: 4, 
          y: 4,
          backgroundColor: '#fbbf24',
          text: '4.9★\nRated',
          textColor: '#1f2937',
          textAlignment: 'center' as const,
          verticalAlignment: 'center' as const,
          fontSize: 20,
        },
        { 
          id: '10', 
          size: 'square' as CardSize, 
          x: 6, 
          y: 4,
          backgroundColor: '#34d399',
          text: 'Eco\nFriendly',
          textColor: '#1f2937',
          textAlignment: 'center' as const,
          verticalAlignment: 'center' as const,
          fontSize: 18,
        },
        { 
          id: '11', 
          size: 'wide' as CardSize, 
          x: 8, 
          y: 4,
          backgroundColor: '#a78bfa',
          text: 'Limited Time Offer',
          textColor: '#ffffff',
          textAlignment: 'center' as const,
          verticalAlignment: 'center' as const,
          fontSize: 20,
        },
      ],
    },
  ];

  return (
    <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 shadow-sm z-40">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <h1 className="text-lg sm:text-2xl font-bold text-gray-900">Bento Generator</h1>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setShowTemplateMenu(!showTemplateMenu)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              <Sparkles size={18} />
              Templates
            </button>
            {showTemplateMenu && (
              <div className="absolute top-full mt-2 right-0 bg-white rounded-lg shadow-lg border border-gray-200 p-2 w-48 z-50">
                {templates.map((template) => (
                  <button
                    key={template.name}
                    onClick={() => {
                      onApplyTemplate(template.cards);
                      setShowTemplateMenu(false);
                    }}
                    className="block w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-sm font-medium"
                  >
                    {template.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setShowSizeMenu(!showSizeMenu)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
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

          <button
            onClick={onSaveLayout}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            <Save size={18} />
            Save
          </button>

          <div className="relative">
            <button
              onClick={() => setShowLayoutMenu(!showLayoutMenu)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
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

          <button
            onClick={onExportImage}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            <Download size={18} />
            Image
          </button>

          <button
            onClick={onExportJSON}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            <Download size={18} />
            JSON
          </button>

          <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer font-medium">
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
          {/* Templates Button - Always visible on mobile */}
          <div className="relative">
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
              <div className="absolute top-full mt-2 right-0 bg-white rounded-lg shadow-lg border border-gray-200 p-2 w-56 max-h-96 overflow-y-auto z-50">
                {templates.map((template) => (
                  <button
                    key={template.name}
                    onClick={() => {
                      onApplyTemplate(template.cards);
                      setShowTemplateMenu(false);
                    }}
                    className="block w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-sm font-medium"
                  >
                    {template.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Add Card Button - Always visible on mobile */}
          <div className="relative">
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
          <div className="relative">
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
