import type { MediaItem, UploadProgress } from "../types";

export const compressImage = (
  file: File,
  maxWidth: number = 1200,
  quality: number = 0.8
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      const ratio = Math.min(maxWidth / img.width, 1);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;

      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          } else {
            reject(new Error("Compression failed"));
          }
        },
        "image/jpeg",
        quality
      );
    };

    img.onerror = () => reject(new Error("Image load failed"));
    img.src = URL.createObjectURL(file);
  });
};

export const validateFile = (file: File): string | null => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "video/mp4",
    "video/webm",
    "video/ogg",
  ];

  if (file.size > maxSize) {
    return "File size must be less than 10MB";
  }

  if (!allowedTypes.includes(file.type)) {
    return "Unsupported file type";
  }

  return null;
};

export const simulateUpload = (
  file: File,
  onProgress: (progress: UploadProgress) => void
): Promise<MediaItem> => {
  return new Promise(async (resolve, reject) => {
    const id = Date.now().toString();
    let dataUrl: string;

    try {
      if (file.type.startsWith("image/")) {
        dataUrl = await compressImage(file);
      } else {
        // For videos, just convert to base64 (no compression)
        dataUrl = await new Promise((res, rej) => {
          const reader = new FileReader();
          reader.onload = () => res(reader.result as string);
          reader.onerror = () => rej(new Error("File read failed"));
          reader.readAsDataURL(file);
        });
      }

      // Simulate upload progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);

          const mediaItem: MediaItem = {
            id,
            name: file.name,
            url: dataUrl,
            type: file.type.startsWith("image/") ? "image" : "video",
            size: file.size,
            uploadedAt: new Date().toISOString(),
          };

          onProgress({ id, progress: 100, status: "completed" });
          resolve(mediaItem);
        } else {
          onProgress({ id, progress, status: "uploading" });
        }
      }, 200);
    } catch (error) {
      onProgress({
        id,
        progress: 0,
        status: "error",
        error: error instanceof Error ? error.message : "Upload failed",
      });
      reject(error);
    }
  });
};

export const getMediaLibrary = (): MediaItem[] => {
  const stored = localStorage.getItem("mediaLibrary");
  return stored ? JSON.parse(stored) : [];
};

export const saveMediaLibrary = (items: MediaItem[]) => {
  localStorage.setItem("mediaLibrary", JSON.stringify(items));
};

export const addToMediaLibrary = (item: MediaItem) => {
  const library = getMediaLibrary();
  library.push(item);
  saveMediaLibrary(library);
};

export const deleteFromMediaLibrary = (id: string) => {
  const library = getMediaLibrary();
  const updated = library.filter((item) => item.id !== id);
  saveMediaLibrary(updated);
};
