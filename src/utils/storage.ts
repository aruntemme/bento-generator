import { BentoLayout, BentoCard } from '../types';

const STORAGE_KEY = 'bento_layouts';
const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/400x300?text=Your+Image+Here';

export const saveLayout = (layout: BentoLayout): void => {
  const layouts = getLayouts();
  const index = layouts.findIndex((l) => l.id === layout.id);

  if (index >= 0) {
    layouts[index] = { ...layout, updatedAt: Date.now(), version: 2 };
  } else {
    layouts.push({ ...layout, version: 2 });
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(layouts));
};

export const getLayouts = (): BentoLayout[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const getLayout = (id: string): BentoLayout | null => {
  const layouts = getLayouts();
  return layouts.find((l) => l.id === id) || null;
};

export const deleteLayout = (id: string): void => {
  const layouts = getLayouts().filter((l) => l.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(layouts));
};

export const exportLayoutAsJSON = (layout: BentoLayout): void => {
  // Replace uploaded images with placeholder
  const cardsWithPlaceholders = layout.cards.map((card) => {
    if (card.uploadedImageId) {
      // Remove uploaded image data and replace with placeholder
      const { uploadedImageId, ...cardWithoutUploadedId } = card;
      return {
        ...cardWithoutUploadedId,
        backgroundImage: PLACEHOLDER_IMAGE,
      };
    }
    return card;
  });

  const exportLayout = {
    ...layout,
    cards: cardsWithPlaceholders,
    version: 2,
  };

  const dataStr = JSON.stringify(exportLayout, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${layout.name.replace(/\s+/g, '_')}.json`;
  link.click();
  URL.revokeObjectURL(url);
};

export const importLayoutFromJSON = (file: File): Promise<BentoLayout> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const raw = JSON.parse(e.target?.result as string);
        const version = typeof raw.version === 'number' ? raw.version : 1;
        const cards = (raw.cards as BentoCard[]).map((c) => ({
          ...c,
          subtitle: c.subtitle ?? '',
        }));
        resolve({ ...raw, version, cards } as BentoLayout);
      } catch (error) {
        reject(new Error('Invalid JSON file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};
