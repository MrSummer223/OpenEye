import { useState, useCallback, useRef } from 'react';
import Tesseract from 'tesseract.js';

export type OcrStatus = 'idle' | 'running' | 'done' | 'error';

// Text region detection using edge analysis
function detectTextRegions(canvas: HTMLCanvasElement): { x: number; y: number; width: number; height: number }[] {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return [];

  const { width, height } = canvas;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  // Create a binary edge map
  const edges: number[][] = [];
  for (let y = 0; y < height; y++) {
    edges[y] = [];
    for (let x = 0; x < width; x++) {
      edges[y][x] = 0;
    }
  }

  // Edge detection (Sobel-like) to find text boundaries
  const threshold = 30;
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = (y * width + x) * 4;
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];

      // Simple gradient
      const left = 0.299 * data[i - 4] + 0.587 * data[i - 3] + 0.114 * data[i - 2];
      const right = 0.299 * data[i + 4] + 0.587 * data[i + 5] + 0.114 * data[i + 6];
      const top = 0.299 * data[((y - 1) * width + x) * 4] + 0.587 * data[((y - 1) * width + x) * 4 + 1] + 0.114 * data[((y - 1) * width + x) * 4 + 2];
      const bottom = 0.299 * data[((y + 1) * width + x) * 4] + 0.587 * data[((y + 1) * width + x) * 4 + 1] + 0.114 * data[((y + 1) * width + x) * 4 + 2];

      const gx = Math.abs(right - left);
      const gy = Math.abs(bottom - top);
      const edge = Math.sqrt(gx * gx + gy * gy);

      edges[y][x] = edge > threshold ? 255 : 0;
    }
  }

  // Find connected edge regions (potential text blocks)
  const visited: boolean[][] = edges.map(row => row.map(() => false));
  const regions: { x: number; y: number; width: number; height: number }[] = [];

  function floodFill(sx: number, sy: number): { minX: number; minY: number; maxX: number; maxY: number } | null {
    const stack: [number, number][] = [[sx, sy]];
    let minX = sx, maxX = sx, minY = sy, maxY = sy;
    let count = 0;
    const maxPixels = 50000;

    while (stack.length > 0 && count < maxPixels) {
      const [x, y] = stack.pop()!;
      if (x < 0 || x >= width || y < 0 || y >= height) continue;
      if (visited[y][x]) continue;
      if (edges[y][x] === 0) continue;

      visited[y][x] = true;
      count++;
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);

      // 8-directional
      stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }

    if (count < 50) return null; // Too small to be text
    return { minX, minY, maxX, maxY };
  }

  // Scan for regions
  for (let y = 0; y < height; y += 20) {
    for (let x = 0; x < width; x += 20) {
      if (!visited[y][x] && edges[y][x] > 0) {
        const bounds = floodFill(x, y);
        if (bounds) {
          const w = bounds.maxX - bounds.minX;
          const h = bounds.maxY - bounds.minY;
          // Text region should have reasonable aspect ratio
          if (w > 50 && h > 15 && w < width * 0.95 && h < height * 0.95) {
            // Add padding
            regions.push({
              x: Math.max(0, bounds.minX - 20),
              y: Math.max(0, bounds.minY - 10),
              width: Math.min(width - bounds.minX + 20, w + 40),
              height: Math.min(height - bounds.minY + 10, h + 20),
            });
          }
        }
      }
    }
  }

  // Merge overlapping regions
  if (regions.length === 0) {
    // Fallback: use center portion of image
    return [{
      x: width * 0.15,
      y: height * 0.15,
      width: width * 0.7,
      height: height * 0.7,
    }];
  }

  return regions.slice(0, 5); // Max 5 regions
}

// Multi-strategy preprocessing
function preprocessCanvas(canvas: HTMLCanvasElement, strategy: number): HTMLCanvasElement {
  const processed = document.createElement('canvas');
  processed.width = canvas.width;
  processed.height = canvas.height;
  const ctx = processed.getContext('2d', { willReadFrequently: true })!;
  ctx.drawImage(canvas, 0, 0);

  const imageData = ctx.getImageData(0, 0, processed.width, processed.height);
  const data = imageData.data;

  // Calculate image stats
  let sum = 0, min = 255, max = 0;
  const pixels: number[] = [];

  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    pixels.push(gray);
    sum += gray;
    min = Math.min(min, gray);
    max = Math.max(max, gray);
  }

  const mean = sum / pixels.length;
  const range = max - min || 1;

  // Apply different strategies
  switch (strategy) {
    case 0: {
      // High contrast binarization
      for (let i = 0; i < pixels.length; i++) {
        const idx = i * 4;
        const normalized = ((pixels[i] - min) / range) * 255;
        const value = normalized > mean ? 255 : 0;
        data[idx] = data[idx + 1] = data[idx + 2] = value;
      }
      break;
    }
    case 1: {
      // Otsu's method
      let sumB = 0, wB = 0;
      const histogram = new Array(256).fill(0);
      pixels.forEach(p => histogram[Math.round(p)]++);
      const total = pixels.length;

      let threshold = 0;
      let maxVariance = 0;

      for (let t = 0; t < 256; t++) {
        wB += histogram[t];
        if (wB === 0) continue;
        sumB += t * histogram[t];

        const wF = total - wB;
        if (wF === 0) break;

        const mB = sumB / wB;
        const mF = (sum - sumB) / wF;

        const variance = wB * wF * (mB - mF) ** 2;
        if (variance > maxVariance) {
          maxVariance = variance;
          threshold = t;
        }
      }

      for (let i = 0; i < pixels.length; i++) {
        const idx = i * 4;
        const value = pixels[i] > threshold ? 255 : 0;
        data[idx] = data[idx + 1] = data[idx + 2] = value;
      }
      break;
    }
    case 2: {
      // Adaptive local thresholding
      const block = 15;
      const offset = 10;
      const w = processed.width;

      for (let i = 0; i < pixels.length; i++) {
        const x = i % w;
        const y = Math.floor(i / w);

        // Get local mean
        let localSum = 0, count = 0;
        for (let dy = -block; dy <= block; dy++) {
          for (let dx = -block; dx <= block; dx++) {
            const nx = x + dx, ny = y + dy;
            if (nx >= 0 && nx < w && ny >= 0 && ny < processed.height) {
              localSum += pixels[ny * w + nx];
              count++;
            }
          }
        }
        const localMean = localSum / count;
        const idx = i * 4;
        const value = pixels[i] > localMean - offset ? 255 : 0;
        data[idx] = data[idx + 1] = data[idx + 2] = value;
      }
      break;
    }
    case 3: {
      // Sharpened then thresholded
      const sharpened: number[] = [];
      const w = processed.width;
      const h = processed.height;

      for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
          const i = y * w + x;
          const center = pixels[i] * 5;
          const neighbors = pixels[i - 1] + pixels[i + 1] + pixels[i - w] + pixels[i + w];
          sharpened.push(Math.max(0, Math.min(255, center - neighbors)));
        }
      }

      const sMean = sharpened.reduce((a, b) => a + b, 0) / sharpened.length;
      let si = 0;
      for (let i = 0; i < pixels.length; i++) {
        const idx = i * 4;
        const x = i % w, y = Math.floor(i / w);
        if (x > 0 && x < w - 1 && y > 0 && y < h - 1) {
          const val = sharpened[si++] > sMean ? 255 : 0;
          data[idx] = data[idx + 1] = data[idx + 2] = val;
        }
      }
      break;
    }
    default: {
      // Simple grayscale with high contrast
      for (let i = 0; i < pixels.length; i++) {
        const idx = i * 4;
        const stretched = ((pixels[i] - min) / range) * 255;
        const value = Math.max(0, Math.min(255, stretched * 1.5));
        data[idx] = data[idx + 1] = data[idx + 2] = value;
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return processed;
}

// Extract and clean valid words from Tesseract result
function extractHighConfidenceWords(result: any): { text: string; confidence: number } {
  const lines: { words: string[]; confidence: number }[] = [];

  if (result.data?.lines) {
    for (const line of result.data.lines) {
      if (!line.words) continue;

      const validWords: string[] = [];
      let lineConfidence = 0;
      let wordCount = 0;

      for (const word of line.words) {
        const text = word.text?.trim();
        // Skip empty or garbage words
        if (!text || text.length < 1) continue;

        const conf = word.confidence || 0;

        // Accept words with reasonable confidence
        if (conf >= 50) {
          // Check if word looks valid
          const hasLetters = /[a-zA-Z]/.test(text);
          const hasNumbers = /[0-9]/.test(text);
          const symbols = text.replace(/[a-zA-Z0-9\s]/g, '').length;
          const symbolRatio = symbols / text.length;

          // Accept if it has letters/numbers and low symbol ratio
          if ((hasLetters || hasNumbers) && symbolRatio < 0.4) {
            validWords.push(text);
            lineConfidence += conf;
            wordCount++;
          }
        }
      }

      if (validWords.length > 0) {
        lines.push({
          words: validWords,
          confidence: lineConfidence / wordCount,
        });
      }
    }
  }

  // Build final text
  const textLines = lines
    .filter(l => l.confidence >= 55) // Filter low-confidence lines
    .map(l => l.words.join(' '));

  const text = textLines.join('\n').trim();
  const avgConfidence = lines.length > 0
    ? lines.reduce((sum, l) => sum + l.confidence, 0) / lines.length
    : 0;

  return { text, confidence: avgConfidence };
}

// Check if result is valid
function isResultValid(text: string, confidence: number): { valid: boolean; reason?: string } {
  if (!text || text.length < 2) {
    return { valid: false, reason: 'No text detected' };
  }

  if (confidence < 40) {
    return { valid: false, reason: 'Text not clear - try holding steady' };
  }

  // Check for garbage patterns
  const cleanText = text.replace(/\s+/g, '');
  const uniqueChars = new Set(cleanText.toLowerCase()).size;
  const uniqueRatio = uniqueChars / cleanText.length;

  // Detect repetitive garbage
  if (cleanText.length > 15 && uniqueRatio < 0.12) {
    return { valid: false, reason: 'No text detected' };
  }

  // Check symbol ratio
  const symbols = cleanText.replace(/[a-zA-Z0-9\s]/g, '').length;
  if (symbols / cleanText.length > 0.5) {
    return { valid: false, reason: 'No text detected' };
  }

  return { valid: true };
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

    let bestResult: { text: string; confidence: number } | null = null;
    let lastError: string | null = null;

    try {
      // For canvas, try multiple preprocessing strategies
      if (source instanceof HTMLCanvasElement) {
        // Detect text regions first
        const regions = detectTextRegions(source);

        // Try each region with multiple preprocessing strategies
        for (let r = 0; r < regions.length && !abortRef.current; r++) {
          const region = regions[r];

          // Crop to region
          const cropped = document.createElement('canvas');
          cropped.width = Math.max(1, region.width);
          cropped.height = Math.max(1, region.height);
          const cropCtx = cropped.getContext('2d');
          if (cropCtx) {
            cropCtx.drawImage(
              source,
              region.x, region.y, region.width, region.height,
              0, 0, region.width, region.height
            );
          }

          // Try multiple preprocessing strategies
          for (let strategy = 0; strategy < 4 && !abortRef.current; strategy++) {
            const processed = preprocessCanvas(cropped, strategy);

            setProgress(Math.round(((r * 4 + strategy) / (regions.length * 4)) * 90));

            try {
              const result = await Tesseract.recognize(processed, 'eng', {
                tessedit_pageseg_mode: '6' as any, // Assume uniform block of text
                logger: () => {}, // Suppress logs for speed
              });

              if (abortRef.current) return null;

              const { text, confidence } = extractHighConfidenceWords(result);

              if (text && (!bestResult || confidence > bestResult.confidence)) {
                bestResult = { text, confidence };
              }
            } catch {
              // Continue to next strategy
            }
          }
        }
      } else {
        // String path (image URL)
        setProgress(10);
        const result = await Tesseract.recognize(source, 'eng', {
          logger: (m: any) => {
            if (m.status === 'recognizing text') {
              setProgress(10 + Math.round(m.progress * 80));
            }
          },
        });

        if (abortRef.current) return null;
        bestResult = extractHighConfidenceWords(result);
      }

      if (abortRef.current) return null;

      // Validate result
      if (!bestResult?.text) {
        setStatus('done');
        setError('No text detected');
        setProgress(100);
        return null;
      }

      const validation = isResultValid(bestResult.text, bestResult.confidence);
      if (!validation.valid) {
        setStatus('done');
        setError(validation.reason);
        setProgress(100);
        return null;
      }

      setStatus('done');
      setProgress(100);
      return bestResult.text;

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
