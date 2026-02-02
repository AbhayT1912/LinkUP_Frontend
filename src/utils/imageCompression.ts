import imageCompression from "browser-image-compression";

interface CompressionOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  useWebWorker?: boolean;
}

/**
 * Compress an image file and convert to base64 data URL
 */
export async function compressImageToBase64(
  file: File,
  options: CompressionOptions = {}
): Promise<string> {
  const {
    maxSizeMB = 0.5, // 500KB default
    maxWidthOrHeight = 1280,
    useWebWorker = true,
  } = options;

  try {
    // Compress the image
    const compressedFile = await imageCompression(file, {
      maxSizeMB,
      maxWidthOrHeight,
      useWebWorker,
    });

    // Convert to base64
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(compressedFile);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
    });
  } catch (error) {
    console.error("Image compression failed:", error);
    throw error;
  }
}

/**
 * Compress multiple images
 */
export async function compressMultipleImagesToBase64(
  files: File[],
  options: CompressionOptions = {}
): Promise<string[]> {
  return Promise.all(
    files.map((file) => compressImageToBase64(file, options))
  );
}
