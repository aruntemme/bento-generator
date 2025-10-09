import { BentoLayout } from '../types';

const STORAGE_KEY = 'bento_layouts';

export const saveLayout = (layout: BentoLayout): void => {
  const layouts = getLayouts();
  const index = layouts.findIndex((l) => l.id === layout.id);

  if (index >= 0) {
    layouts[index] = { ...layout, updatedAt: Date.now() };
  } else {
    layouts.push(layout);
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
  const dataStr = JSON.stringify(layout, null, 2);
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
        const layout = JSON.parse(e.target?.result as string) as BentoLayout;
        resolve(layout);
      } catch (error) {
        reject(new Error('Invalid JSON file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};
