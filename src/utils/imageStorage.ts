const IMAGES_STORAGE_KEY = 'bento_uploaded_images';

export interface UploadedImage {
  id: string;
  dataUrl: string;
  fileName: string;
  uploadedAt: number;
}

/**
 * Get all uploaded images from localStorage
 */
export const getUploadedImages = (): Record<string, UploadedImage> => {
  const data = localStorage.getItem(IMAGES_STORAGE_KEY);
  return data ? JSON.parse(data) : {};
};

/**
 * Save an uploaded image to localStorage
 */
export const saveUploadedImage = (file: File): Promise<UploadedImage> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const dataUrl = e.target?.result as string;
        const imageId = `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        const uploadedImage: UploadedImage = {
          id: imageId,
          dataUrl,
          fileName: file.name,
          uploadedAt: Date.now(),
        };
        
        const images = getUploadedImages();
        images[imageId] = uploadedImage;
        localStorage.setItem(IMAGES_STORAGE_KEY, JSON.stringify(images));
        
        resolve(uploadedImage);
      } catch (error) {
        reject(new Error('Failed to save image'));
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

/**
 * Get a specific uploaded image by ID
 */
export const getUploadedImage = (id: string): UploadedImage | null => {
  const images = getUploadedImages();
  return images[id] || null;
};

/**
 * Delete an uploaded image from localStorage
 */
export const deleteUploadedImage = (id: string): void => {
  const images = getUploadedImages();
  delete images[id];
  localStorage.setItem(IMAGES_STORAGE_KEY, JSON.stringify(images));
};

/**
 * Clean up unused uploaded images
 * Removes images that are not referenced by any card
 */
export const cleanupUnusedImages = (usedImageIds: string[]): void => {
  const images = getUploadedImages();
  const usedIdsSet = new Set(usedImageIds);
  
  let hasChanges = false;
  Object.keys(images).forEach((imageId) => {
    if (!usedIdsSet.has(imageId)) {
      delete images[imageId];
      hasChanges = true;
    }
  });
  
  if (hasChanges) {
    localStorage.setItem(IMAGES_STORAGE_KEY, JSON.stringify(images));
  }
};

/**
 * Get the size of all uploaded images in bytes
 */
export const getUploadedImagesSize = (): number => {
  const data = localStorage.getItem(IMAGES_STORAGE_KEY);
  return data ? new Blob([data]).size : 0;
};

/**
 * Check if adding a new image would exceed a size limit
 */
export const canAddImage = (fileSize: number, maxTotalSize: number = 5 * 1024 * 1024): boolean => {
  const currentSize = getUploadedImagesSize();
  return (currentSize + fileSize) <= maxTotalSize;
};


