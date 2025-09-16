import React, { useState } from 'react';
import html2canvas from 'html2canvas';
import * as htmlToImage from 'html-to-image';
import { BentoGrid } from './components/BentoGrid';
import { EditModal } from './components/EditModal';
import { Toolbar } from './components/Toolbar';
import { BentoCard, CardSize, GridLayout, AlignmentDefaults } from './types';
import { sampleCards } from './data/sampleCards';
import { useLocalStorage } from './hooks/useLocalStorage';

function App() {
  const [cards, setCards] = useLocalStorage<BentoCard[]>('bento-cards', sampleCards);
  const [editingCard, setEditingCard] = useState<BentoCard | null>(null);
  const [layout, setLayout] = useLocalStorage<GridLayout>('bento-layout', 'wide');
  const [globalAlign, setGlobalAlign] = useLocalStorage<AlignmentDefaults>('bento-align', {
    textAlign: 'left',
    verticalAlign: 'bottom',
  });
  const [pngScale, setPngScale] = useLocalStorage<number>('bento-png-scale', 1);

  const generateId = () => `card-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const handleAddCard = (size: CardSize) => {
    const newCard: BentoCard = {
      id: generateId(),
      title: 'New Card',
      content: 'Click to edit this card',
      backgroundColor: '#6366F1',
      textColor: '#FFFFFF',
      size,
      type: 'text',
    };
    setCards([...cards, newCard]);
  };

  const handleEditCard = (card: BentoCard) => {
    setEditingCard(card);
  };

  const handleSaveCard = (updatedCard: BentoCard) => {
    setCards(cards.map(card => 
      card.id === updatedCard.id ? updatedCard : card
    ));
    setEditingCard(null);
  };

  const handleDeleteCard = (cardId: string) => {
    setCards(cards.filter(card => card.id !== cardId));
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(cards, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'bento-grid.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportPNG = async (scale: number = 1) => {
    // Capture only the base canvas to avoid exporting outside content
    const base = document.getElementById('bento-base') as HTMLElement | null;
    const target = base || (document.getElementById('bento-grid') as HTMLElement | null);
    if (!target) return;

    const rect = target.getBoundingClientRect();
    const targetWidth = Math.round(rect.width);
    const targetHeight = Math.round(rect.height);

    try {
      const style = document.createElement('style');
      style.textContent = `
        /* Remove base border in export */
        #bento-base { border-color: transparent !important; }
        /* Improve text rendering */
        #bento-base, #bento-base * { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; word-break: normal; }
      `;
      document.head.appendChild(style);

      // Match the on-screen canvas size exactly to avoid stretching, but scale up for higher quality
      const width = targetWidth;
      const height = targetHeight;

      // Ensure fonts are loaded when supported
      const fontsReady: Promise<void> | null =
        // @ts-expect-error - fonts may not exist on older browsers
        (document.fonts && typeof document.fonts.ready !== 'undefined') ? (document.fonts.ready as Promise<void>) : null;
      if (fontsReady) {
        try {
          await fontsReady;
        } catch {
          // ignore
        }
      }

      let dataUrl: string | null = null;
      try {
        dataUrl = await htmlToImage.toPng(target, {
          cacheBust: true,
          width,
          height,
          pixelRatio: scale,
          backgroundColor: '#ffffff',
          skipFonts: false,
          filter: (node: HTMLElement) => {
            try {
              if (!(node instanceof Element)) return true;
              return !node.closest('[data-export-ignore]');
            } catch {
              return true;
            }
          },
        });
      } catch {
        const canvas = await html2canvas(target, {
          backgroundColor: '#ffffff',
          scale: scale,
          useCORS: true,
          allowTaint: false,
          logging: false,
          width,
          height,
          scrollX: 0,
          scrollY: 0,
          windowWidth: document.documentElement.clientWidth,
          windowHeight: document.documentElement.clientHeight,
          foreignObjectRendering: false,
          imageTimeout: 0,
          removeContainer: true,
        });
        dataUrl = canvas.toDataURL('image/png');
      }

      // Detect if the result is blank/mostly white; if so, try an alternative capture
      async function isMostlyWhite(pngDataUrl: string): Promise<boolean> {
        return new Promise((resolve) => {
          const img = new Image();
          img.onload = () => {
            const can = document.createElement('canvas');
            can.width = img.width;
            can.height = img.height;
            const ctx = can.getContext('2d');
            if (!ctx) return resolve(false);
            ctx.drawImage(img, 0, 0);
            const points = [
              [Math.floor(img.width * 0.1), Math.floor(img.height * 0.1)],
              [Math.floor(img.width * 0.5), Math.floor(img.height * 0.5)],
              [Math.floor(img.width * 0.9), Math.floor(img.height * 0.9)],
            ];
            let whiteish = 0;
            for (const [x, y] of points) {
              const d = ctx.getImageData(x, y, 1, 1).data;
              const [r, g, b, a] = d;
              if (a > 0 && r > 245 && g > 245 && b > 245) whiteish += 1;
            }
            resolve(whiteish === points.length);
          };
          img.onerror = () => resolve(false);
          img.src = pngDataUrl;
        });
      }

      if (dataUrl && await isMostlyWhite(dataUrl)) {
        try {
          const altCanvas = await html2canvas(target, {
            backgroundColor: '#ffffff',
            scale: scale,
            useCORS: true,
            allowTaint: false,
            logging: false,
            width,
            height,
          });
          dataUrl = altCanvas.toDataURL('image/png');
        } catch {
          const grid = document.getElementById('bento-grid') as HTMLElement | null;
          if (grid) {
            const alt = await html2canvas(grid, {
              backgroundColor: '#ffffff',
              scale: scale,
              useCORS: true,
              allowTaint: false,
              logging: false,
            });
            dataUrl = alt.toDataURL('image/png');
          }
        }
      }

      document.head.removeChild(style);

      const link = document.createElement('a');
      const scaleSuffix = scale === 1 ? '' : `@${scale}x`;
      link.download = `bento-grid-${new Date().toISOString().split('T')[0]}${scaleSuffix}.png`;
      link.href = dataUrl!;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting PNG:', error);
      alert('Error exporting PNG. Please try again.');
    }
  };
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedCards = JSON.parse(e.target?.result as string);
          if (Array.isArray(importedCards)) {
            setCards(importedCards);
          }
        } catch (error) {
          console.error('Error importing cards:', error);
          alert('Error importing file. Please check the format.');
        }
      };
      reader.readAsText(file);
    }
    event.target.value = '';
  };

  return (
    <div className="min-h-screen bg-gray-100 [background-image:radial-gradient(theme(colors.gray.300)_1px,transparent_0)] [background-size:20px_20px]">
      {/* New Pill-shaped Navbar */}
      <div className="sticky top-4 z-50 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white/90 backdrop-blur-xl border border-gray-200/60 rounded-full shadow-lg px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <svg className="text-white" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 3h7v7H3V3zm0 11h7v7H3v-7zm11-11h7v7h-7V3zm0 11h7v7h-7v-7z"/>
                  </svg>
                </div>
                <h1 className="text-lg font-bold text-gray-900">Bento Builder</h1>
              </div>
              
              <a
                href="https://github.com/aruntemme/bento-generator"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-full hover:bg-black/90 transition-all duration-200 text-sm font-medium"
                title="View on GitHub"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                <span>Star on GitHub</span>
                <div className="flex items-center gap-1 ml-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  <span className="text-xs">0</span>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
      
      {/* Toolbar below navbar */}
      <div className="py-8">
        <Toolbar
          onAddCard={handleAddCard}
          onExport={handleExport}
          onExportPNG={handleExportPNG}
          onImport={handleImport}
          layout={layout}
          onLayoutChange={setLayout}
          globalAlign={globalAlign}
          onGlobalAlignChange={setGlobalAlign}
          pngScale={pngScale}
          onPngScaleChange={setPngScale}
        />
      </div>
      
      <main className="py-8">
        <BentoGrid
          cards={cards}
          onCardsChange={setCards}
          onEditCard={handleEditCard}
          onDeleteCard={handleDeleteCard}
          layout={layout}
          globalAlign={globalAlign}
        />
      </main>

      {editingCard && (
        <EditModal
          card={editingCard}
          onSave={handleSaveCard}
          onClose={() => setEditingCard(null)}
        />
      )}

      {/* Empty state */}
      {cards.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gray-200 rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-7H5v18h14V4z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No cards yet</h3>
          <p className="text-gray-500 mb-4">Start building your bento grid by adding some cards</p>
          <button
            onClick={() => handleAddCard('medium')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add your first card
          </button>
        </div>
      )}
    </div>
  );
}

export default App;