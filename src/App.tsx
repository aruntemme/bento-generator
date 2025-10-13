import { useState, useEffect } from 'react';
import { BentoCard, BentoLayout, CardSize } from './types';
import { GRID_CONFIG, isValidPosition, checkCollision } from './utils/gridUtils';
import { saveLayout, getLayouts, exportLayoutAsJSON } from './utils/storage';
import { getTemplateByName, templates } from './lib/templates';
import { deleteUploadedImage } from './utils/imageStorage';
// no icon imports needed here; controls moved into GridCanvas
import GridCanvas from './components/GridCanvas';
import EditPanel from './components/EditPanel';
import Toolbar from './components/Toolbar';
import Modal from './components/Modal';
import InputModal from './components/InputModal';
import { trackEvent } from './lib/analytics';
import AnalyticsNotice from './components/AnalyticsNotice';
import { generateRandomLayout } from './lib/randomLayout';

function App() {
  const [cards, setCards] = useState<BentoCard[]>([]);
  const [layouts, setLayouts] = useState<BentoLayout[]>([]);
  const [currentLayoutId, setCurrentLayoutId] = useState<string>('default');
  const [currentLayoutName, setCurrentLayoutName] = useState<string>('My Bento');
  const [editingCard, setEditingCard] = useState<BentoCard | null>(null);
  const [canvasBackgroundColor, setCanvasBackgroundColor] = useState<string>('#ffffff');
  
  // Modal state
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    title?: string;
    message: string;
    type: 'success' | 'error' | 'info';
  }>({
    isOpen: false,
    message: '',
    type: 'info',
  });

  // Input modal state
  const [inputModalOpen, setInputModalOpen] = useState(false);

  const showModal = (message: string, type: 'success' | 'error' | 'info' = 'info', title?: string) => {
    setModalState({ isOpen: true, message, type, title });
  };

  const closeModal = () => {
    setModalState({ ...modalState, isOpen: false });
  };

  useEffect(() => {
    const savedLayouts = getLayouts();
    setLayouts(savedLayouts);

    if (savedLayouts.length > 0) {
      const lastLayout = savedLayouts[savedLayouts.length - 1];
      setCards(lastLayout.cards);
      setCurrentLayoutId(lastLayout.id);
      setCurrentLayoutName(lastLayout.name);
    } else {
      const product = getTemplateByName('Product Showcase') || templates.find(t => t.name.toLowerCase().includes('product'));
      if (product) {
        const cardsWithIds = product.cards.map((card, index) => ({
          ...card,
          id: `card-${Date.now()}-${index}`,
        }));
        setCards(cardsWithIds);
        setCurrentLayoutId('default');
        setCurrentLayoutName(product.name);
      }
    }
  }, []);

  const findEmptySpot = (size: CardSize): { x: number; y: number } | null => {
    for (let y = 0; y < GRID_CONFIG.rows; y++) {
      for (let x = 0; x < GRID_CONFIG.cols; x++) {
        if (isValidPosition(x, y, size, GRID_CONFIG.cols, GRID_CONFIG.rows)) {
          const hasCollision = cards.some((card) =>
            checkCollision({ x, y, size }, card)
          );
          if (!hasCollision) {
            return { x, y };
          }
        }
      }
    }
    return null;
  };

  const handleAddCard = (size: CardSize) => {
    const position = findEmptySpot(size);
    if (!position) {
      showModal(
        'No space available for this card size. Try removing some cards first or rearranging existing ones.',
        'error',
        'Canvas Full'
      );
      return;
    }

    const newCard: BentoCard = {
      id: `card-${Date.now()}`,
      size,
      x: position.x,
      y: position.y,
      backgroundColor: '#f3f4f6',
      text: '',
      textColor: '#1f2937',
      textAlignment: 'left',
      textOrientation: 'horizontal',
      fontSize: 16,
    };

    setCards([...cards, newCard]);
  };

  const handleSaveLayout = () => {
    setInputModalOpen(true);
  };

  const handleConfirmSave = (name: string) => {
    const layout: BentoLayout = {
      id: currentLayoutId,
      name,
      cards,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    saveLayout(layout);
    setCurrentLayoutName(name);
    setLayouts(getLayouts());
    showModal(`Layout "${name}" has been saved successfully!`, 'success', 'Saved');
  };

  const handleLoadLayout = (layout: BentoLayout) => {
    setCards(layout.cards);
    setCurrentLayoutId(layout.id);
    setCurrentLayoutName(layout.name);
  };

  const handleExportJSON = () => {
    const layout: BentoLayout = {
      id: currentLayoutId,
      name: currentLayoutName,
      cards,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    exportLayoutAsJSON(layout);
    if (import.meta.env.VITE_ENABLE_ANALYTICS === 'true') {
      trackEvent('export_json', {
        layoutId: currentLayoutId,
        layoutName: currentLayoutName,
        numCards: cards.length,
      });
    }
  };

  const handleImportJSON = (layout: BentoLayout) => {
    setCards(layout.cards);
    setCurrentLayoutId(layout.id);
    setCurrentLayoutName(layout.name);
  };

  const handleExportImage = async () => {
    const canvasContainer = document.querySelector('[style*="position: relative"]') as HTMLElement;
    if (!canvasContainer) {
      showModal('Canvas not found. Please try again.', 'error', 'Export Failed');
      return;
    }

    try {
      const html2canvas = (await import('html2canvas')).default;
      
      // Show loading state
      const loadingEl = document.createElement('div');
      loadingEl.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 24px 48px; border-radius: 16px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); z-index: 9999; font-family: system-ui; font-weight: 600; font-size: 16px; color: #1f2937;';
      loadingEl.textContent = 'Generating image...';
      document.body.appendChild(loadingEl);

      // Wait a bit for the loading message to show
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvasElement = await html2canvas(canvasContainer, {
        backgroundColor: canvasBackgroundColor || '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        imageTimeout: 15000,
        removeContainer: true,
        foreignObjectRendering: false,
        onclone: (clonedDoc) => {
          const clonedCanvas = clonedDoc.querySelector('[style*="position: relative"]');
          if (clonedCanvas) {
            const elements = clonedCanvas.querySelectorAll('[style*="background-image"]');
            elements.forEach((el) => {
              const htmlEl = el as HTMLElement;
              const bgImage = htmlEl.style.backgroundImage;
              if (bgImage && bgImage.includes('url')) {
                htmlEl.style.backgroundSize = 'cover';
                htmlEl.style.backgroundPosition = 'center';
              }
            });
          }
        }
      });

      // Remove loading message
      document.body.removeChild(loadingEl);

      canvasElement.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${currentLayoutName.replace(/\s+/g, '_')}.png`;
          link.click();
          URL.revokeObjectURL(url);
          showModal('Your image has been downloaded successfully!', 'success', 'Export Complete');
          if (import.meta.env.VITE_ENABLE_ANALYTICS === 'true') {
            trackEvent('export_image', {
              layoutId: currentLayoutId,
              layoutName: currentLayoutName,
              numCards: cards.length,
              format: 'png',
            });
          }
        } else {
          showModal('Failed to create image. Please try again.', 'error', 'Export Failed');
        }
      }, 'image/png', 1.0);
    } catch (error) {
      console.error('Export error:', error);
      showModal(
        'Error exporting image. Images from external sources may not be captured due to browser security restrictions.\n\nTip: Try using your browser\'s screenshot feature, or use images from the same domain.',
        'error',
        'Export Error'
      );
    }
  };

  const handleEditCard = (card: BentoCard) => {
    setEditingCard(card);
  };

  const handleSaveCard = (updatedCard: BentoCard) => {
    setCards((prev) => prev.map((c) => (c.id === updatedCard.id ? updatedCard : c)));
  };

  const handleApplyTemplate = (templateCards: BentoCard[]) => {
    const cardsWithIds = templateCards.map((card) => ({
      ...card,
      id: `card-${Date.now()}-${Math.random()}`,
    }));
    setCards(cardsWithIds);
  };

  const handleRandomizeLayout = () => {
    const randomCards = generateRandomLayout();
    const cardsWithIds = randomCards.map((card, index) => ({
      ...card,
      id: `card-${Date.now()}-${index}-${Math.random()}`,
    }));
    setCards(cardsWithIds);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 relative">
      {/* Dotted background pattern */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#cbd5e1 1.5px, transparent 1.5px)`,
          backgroundSize: '20px 20px',
          opacity: 0.6,
        }}
      />
      
      <Toolbar
        onAddCard={handleAddCard}
        onExportImage={handleExportImage}
        onExportJSON={handleExportJSON}
        onImportJSON={handleImportJSON}
        onSaveLayout={handleSaveLayout}
        onLoadLayout={handleLoadLayout}
        layouts={layouts}
        onApplyTemplate={handleApplyTemplate}
        onShowModal={showModal}
        onRandomizeLayout={handleRandomizeLayout}
      />

      <div className="pt-16 sm:pt-20 relative z-10">
        <GridCanvas
          cards={cards}
          onCardsChange={(next) => {
            if (typeof next === 'function') {
              setCards((prev) => (next as (p: BentoCard[]) => BentoCard[])(prev));
            } else {
              setCards(next);
            }
          }}
          onEditCard={handleEditCard}
          backgroundColor={canvasBackgroundColor}
          onChangeBackgroundColor={(c) => setCanvasBackgroundColor(c)}
          onClearAll={() => {
            // Clean up all uploaded images before clearing cards
            cards.forEach((card) => {
              if (card.uploadedImageId) {
                deleteUploadedImage(card.uploadedImageId);
              }
            });
            setCards([]);
            showModal('All cards have been cleared.', 'success', 'Cleared');
          }}
        />
      </div>

      {editingCard && (
        <EditPanel
          card={editingCard}
          onClose={() => setEditingCard(null)}
          onSave={handleSaveCard}
        />
      )}

      <Modal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
      />

      <InputModal
        isOpen={inputModalOpen}
        onClose={() => setInputModalOpen(false)}
        onConfirm={handleConfirmSave}
        title="Save Layout"
        label="Layout Name"
        placeholder="Enter a name for your layout"
        defaultValue={currentLayoutName}
      />

      {import.meta.env.VITE_ENABLE_ANALYTICS === 'true' && (
        <AnalyticsNotice />
      )}

      {/* Sticky ClaraVerse credit pill */}
      <div className="fixed bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 z-20">
        <a
          href="https://github.com/claraverse-space/ClaraVerse"
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-2 rounded-full bg-white/90 backdrop-blur px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 shadow-lg ring-1 ring-black/5 hover:bg-white hover:shadow-xl transition whitespace-nowrap"
          aria-label="From the team of ClaraVerse"
        >
          <span className="inline-block h-2 w-2 rounded-full bg-pink-500 animate-pulse" />
          <span>From the team of ClaraVerse</span>
        </a>
      </div>
    </div>
  );
}

export default App;
