import { useState, useCallback, useRef } from 'react';
import Tesseract from 'tesseract.js';

export type OcrStatus = 'idle' | 'running' | 'done' | 'error';

interface PreprocessOptions {
  invert?: boolean;
}

function preprocessImage(canvas: HTMLCanvasElement, options: PreprocessOptions = {}): HTMLCanvasElement {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return canvas;

  const { width, height } = canvas;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  // Convert to grayscale and calculate brightness stats
  let totalBrightness = 0;
  const pixels: number[] = [];

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    // Luminance formula
    const gray = 0.299 * r + 0.587 * g + 0.114 * b;
    pixels.push(gray);
    totalBrightness += gray;
  }

  const meanBrightness = totalBrightness / pixels.length;

  // Calculate standard deviation for contrast
  let variance = 0;
  for (const p of pixels) {
    variance += (p - meanBrightness) ** 2;
  }
  const stdDev = Math.sqrt(variance / pixels.length);

  // Determine threshold using Otsu's method approximation
  const threshold = meanBrightness;

  // Apply adaptive binarization with contrast enhancement
  for (let i = 0; i < pixels.length; i++) {
    const idx = i * 4;
    const gray = pixels[i];

    // Adaptive contrast enhancement based on local brightness
    let value: number;
    if (stdDev < 30) {
      // Low contrast image - use thresholding
      value = gray > threshold ? 255 : 0;
    } else {
      // Normal contrast - use adaptive thresholding
      const localThreshold = meanBrightness + (gray - meanBrightness) * 0.5;
      value = gray > localThreshold ? 255 : 0;
    }

    if (options.invert) {
      value = 255 - value;
    }

    data[idx] = value;
    data[idx + 1] = value;
    data[idx + 2] = value;
    // Keep alpha
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

function checkImageQuality(canvas: HTMLCanvasElement): { isOk: boolean; reason?: string } {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return { isOk: true };

  const { width, height } = canvas;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  let totalBrightness = 0;
  let variance = 0;
  let pixelCount = 0;

  // Sample pixels for performance
  const step = 4;
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const i = (y * width + x) * 4;
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      totalBrightness += gray;
      pixelCount++;
    }
  }

  const meanBrightness = totalBrightness / pixelCount;

  // Calculate variance for contrast check
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const i = (y * width + x) * 4;
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      variance += (gray - meanBrightness) ** 2;
    }
  }

  const stdDev = Math.sqrt(variance / pixelCount);

  // Check if image is too dark
  if (meanBrightness < 20) {
    return { isOk: false, reason: 'Image is too dark - try better lighting' };
  }

  // Check if image is too washed out
  if (meanBrightness > 240) {
    return { isOk: false, reason: 'Image is too bright - reduce lighting' };
  }

  // Check if image has enough contrast
  if (stdDev < 15) {
    return { isOk: false, reason: 'Low contrast - text may not be visible' };
  }

  return { isOk: true };
}

function isValidText(text: string, confidence: number): { isValid: boolean; reason?: string } {
  // Confidence too low
  if (confidence < 30) {
    return { isValid: false, reason: 'No clear text detected' };
  }

  // Empty or whitespace only
  const trimmed = text.trim();
  if (trimmed.length === 0) {
    return { isValid: false, reason: 'No text detected' };
  }

  // Check for garbage output patterns
  const cleanText = trimmed.replace(/\s+/g, '');

  // Too short to be meaningful
  if (cleanText.length < 2) {
    return { isValid: false, reason: 'No meaningful text detected' };
  }

  // Count character types
  let letterCount = 0;
  let digitCount = 0;
  let symbolCount = 0;
  let spaceCount = 0;

  for (const char of trimmed) {
    if (/[a-zA-Z]/.test(char)) letterCount++;
    else if (/[0-9]/.test(char)) digitCount++;
    else if (/\s/.test(char)) spaceCount++;
    else symbolCount++;
  }

  const totalCount = letterCount + digitCount + symbolCount;

  // High symbol ratio = garbage
  if (totalCount > 0 && symbolCount / totalCount > 0.4) {
    return { isValid: false, reason: 'Detected symbols, not text' };
  }

  // Check for repetitive garbage patterns
  const uniqueChars = new Set(cleanText.toLowerCase()).size;
  const uniqueRatio = uniqueChars / cleanText.length;

  // Very low unique character ratio = repetitive garbage
  if (cleanText.length > 10 && uniqueRatio < 0.15) {
    return { isValid: false, reason: 'No clear text detected' };
  }

  // Check for common OCR garbage patterns
  const garbagePatterns = [
    /^[^\w]*$/, // Only symbols
    /^[\W_]+$/, // Only non-word chars
    /^[aeiouAEIOU]{5,}$/, // Repeated vowels only
    /^(.)\1{8,}$/, // Same char repeated 9+ times
  ];

  for (const pattern of garbagePatterns) {
    if (pattern.test(cleanText)) {
      return { isValid: false, reason: 'No clear text detected' };
    }
  }

  // Check if it has some real words-like structure (at least some letters with spaces)
  if (letterCount < 2 && confidence < 70) {
    return { isValid: false, reason: 'No clear words detected' };
  }

  return { isValid: true };
}

function cleanText(text: string): string {
  // Remove excessive whitespace
  let cleaned = text.replace(/\s+/g, ' ').trim();

  // Remove lines that are just symbols/numbers (likely garbage)
  const lines = cleaned.split('\n');
  const validLines = lines.filter(line => {
    const trimmed = line.trim();
    if (trimmed.length === 0) return false;

    // Keep lines with actual letters
    const hasLetters = /[a-zA-Z]{2,}/.test(trimmed);
    // Keep lines with numbers and some meaning
    const hasNumbers = /[0-9]{2,}/.test(trimmed);
    // Check symbol ratio
    const symbols = trimmed.replace(/[a-zA-Z0-9\s]/g, '').length;
    const symbolRatio = symbols / trimmed.length;

    return (hasLetters || (hasNumbers && symbolRatio < 0.3)) && symbolRatio < 0.5;
  });

  return validLines.join('\n').trim();
}

export function useOCR() {
  const [status, setStatus] = useState<OcrStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef(false);

  const recognize = useCallback(async (source: HTMLCanvasElement | string): Promise<string | null> => {
    abortRef.current = false;
    setStatus('running');
    setProgress(0);
    setError(null);

    try {
      // Preprocess if canvas
      let processedSource: HTMLCanvasElement | string = source;
      if (source instanceof HTMLCanvasElement) {
        // Check image quality first
        const quality = checkImageQuality(source);
        if (!quality.isOk) {
          setStatus('done');
          setError(quality.reason);
          return null;
        }

        // Create a copy for preprocessing
        const processed = document.createElement('canvas');
        processed.width = source.width;
        processed.height = source.height;
        const ctx = processed.getContext('2d');
        if (ctx) {
          ctx.drawImage(source, 0, 0);
          preprocessImage(processed);
        }
        processedSource = processed;
      }

      const result = await Tesseract.recognize(processedSource, 'eng', {
        logger: (m: any) => {
          if (abortRef.current) return;
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100));
          }
        },
      });

      if (abortRef.current) return null;

      const confidence = result.data.confidence || 0;
      const rawText = result.data.text || '';
      const cleanedText = cleanText(rawText);

      // Validate the output
      const validation = isValidText(cleanedText, confidence);

      if (!validation.isValid) {
        setStatus('done');
        setError(validation.reason);
        setProgress(100);
        return null;
      }

      setStatus('done');
      setProgress(100);
      return cleanedText || null;
    } catch (e: any) {
      setStatus('error');
      setError(e?.message ?? 'OCR failed');
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    abortRef.current = true;
    setStatus('idle');
    setProgress(0);
    setError(null);
  }, []);

  return { status, progress, error, recognize, reset };
}
