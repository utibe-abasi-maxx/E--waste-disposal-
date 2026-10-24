/**
 * Client-Side Image Optimizer and Compressor
 * Guarantees images fit safely inside Firestore documents (< 1MB) and LocalStorage quotas (< 5MB)
 * Compresses raw high-res camera photos (5-15MB) down to optimized JPEGs (~50KB - 150KB).
 */

export interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 to 1.0
  maxSizeBytes?: number; // target max size in bytes (default: 400KB)
}

const DEFAULT_OPTIONS: Required<ImageOptimizationOptions> = {
  maxWidth: 600,
  maxHeight: 600,
  quality: 0.6,
  maxSizeBytes: 65 * 1024, // 65 KB max target (prevents Firestore 1MB doc limits)
};

/**
 * Compresses an image File, Blob, or base64 DataURL into an optimized JPEG DataURL.
 */
export async function compressImageToDataUrl(
  input: File | Blob | string,
  options?: ImageOptimizationOptions
): Promise<string> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // If input is an external HTTP URL, return as-is
  if (typeof input === 'string' && (input.startsWith('http://') || input.startsWith('https://'))) {
    return input;
  }

  // If already a tiny data URL (< 35KB), return as-is
  if (typeof input === 'string' && input.startsWith('data:') && input.length < 35 * 1024) {
    return input;
  }

  return new Promise((resolve) => {
    let sourceUrl = '';
    let shouldRevoke = false;

    if (typeof input === 'string') {
      sourceUrl = input;
    } else {
      try {
        sourceUrl = URL.createObjectURL(input);
        shouldRevoke = true;
      } catch {
        resolve('');
        return;
      }
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        let width = img.naturalWidth || img.width || 800;
        let height = img.naturalHeight || img.height || 600;

        let targetWidth = width;
        let targetHeight = height;

        if (width > opts.maxWidth || height > opts.maxHeight) {
          const ratio = Math.min(opts.maxWidth / width, opts.maxHeight / height);
          targetWidth = Math.round(width * ratio);
          targetHeight = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          if (shouldRevoke) URL.revokeObjectURL(sourceUrl);
          resolve(typeof input === 'string' ? input : '');
          return;
        }

        // Fill white background for transparent PNGs converted to JPEG
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, targetWidth, targetHeight);
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        let quality = opts.quality;
        let dataUrl = canvas.toDataURL('image/jpeg', quality);

        // Iteratively downscale and reduce quality until dataUrl <= maxSizeBytes
        let attempt = 0;
        let scale = 0.75;
        let curQuality = 0.52;
        while (dataUrl.length > opts.maxSizeBytes && attempt < 3) {
          attempt++;
          const iterCanvas = document.createElement('canvas');
          const iterWidth = Math.max(200, Math.round(targetWidth * scale));
          const iterHeight = Math.max(200, Math.round(targetHeight * scale));
          iterCanvas.width = iterWidth;
          iterCanvas.height = iterHeight;
          const iterCtx = iterCanvas.getContext('2d');
          if (iterCtx) {
            iterCtx.fillStyle = '#FFFFFF';
            iterCtx.fillRect(0, 0, iterWidth, iterHeight);
            iterCtx.drawImage(img, 0, 0, iterWidth, iterHeight);
            dataUrl = iterCanvas.toDataURL('image/jpeg', curQuality);
          }
          scale *= 0.8;
          curQuality -= 0.08;
        }

        if (shouldRevoke) URL.revokeObjectURL(sourceUrl);
        resolve(dataUrl);
      } catch (err) {
        console.warn('Image compression fallback:', err);
        if (shouldRevoke) URL.revokeObjectURL(sourceUrl);
        resolve(typeof input === 'string' ? input : '');
      }
    };

    img.onerror = () => {
      if (shouldRevoke) URL.revokeObjectURL(sourceUrl);
      resolve(typeof input === 'string' ? input : '');
    };

    img.src = sourceUrl;
  });
}

/**
 * Converts a data URL to a compressed File object (for Firebase Storage uploads)
 */
export async function compressImageToFile(
  file: File,
  options?: ImageOptimizationOptions
): Promise<File> {
  try {
    const compressedDataUrl = await compressImageToDataUrl(file, options);
    if (!compressedDataUrl || !compressedDataUrl.startsWith('data:')) {
      return file;
    }

    const arr = compressedDataUrl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    const fileName = file.name.replace(/\.[^/.]+$/, '.jpg');
    return new File([u8arr], fileName, { type: mime });
  } catch {
    return file;
  }
}
