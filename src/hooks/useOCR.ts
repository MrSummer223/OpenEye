import { useState, useCallback, useRef } from 'react';
import Tesseract from 'tesseract.js';

export type OcrStatus = 'idle' | 'running' | 'done' | 'error';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

// Check if a character is a common OCR artifact symbol
function isArtifactChar(char: string): boolean {
  const artifacts = ['|', '~', '^', '`', '´', '¨', '¯', '¸', 'ÿ', '€', '', '‚', '„', '†', '‡', '•', '…', '‰', '‹', '›', '€', '™', 'ﬁ', 'ﬂ', '­', '͏', '‌', '‍', '‌'];
  return artifacts.includes(char);
}

// Clean OCR text by removing artifacts and filtering garbage
function cleanOcrText(text: string, confidence: number): string | null {
  if (!text || text.length < 2) return null;

  const lines = text.split('\n');

  const cleanedLines = lines
    .map(line => {
      let cleaned = line.trim();

      // Remove common OCR artifacts
      cleaned = cleaned.replace(/[|~^`´¨¯¸ÿ€‚„†‡•…‰‹›™ﬁﬂ­͏‌‍]/g, '');

      // Remove sequences of the same repeating character (garbage patterns)
      cleaned = cleaned.replace(/([^\s])\1{4,}/g, '');

      // Remove standalone symbols
      cleaned = cleaned.replace(/\s[^\w\s]\s/g, ' ');

      // Clean up multiple spaces
      cleaned = cleaned.replace(/\s{2,}/g, ' ').trim();

      return cleaned;
    })
    .filter(line => {
      if (!line || line.length < 2) return false;

      // Count character types
      const letters = (line.match(/[a-zA-Z]/g) || []).length;
      const numbers = (line.match(/[0-9]/g) || []).length;
      const spaces = (line.match(/\s/g) || []).length;
      const symbols = line.length - letters - numbers - spaces;

      const totalChars = line.length - spaces;
      if (totalChars === 0) return false;

      const symbolRatio = symbols / totalChars;
      const letterRatio = letters / totalChars;

      // Keep lines that have reasonable content
      // Must have some letters or numbers, and not too many symbols
      if (totalChars < 3 && symbols > 0) return false;
      if (symbolRatio > 0.5) return false; // More than 50% symbols = likely garbage
      if (letters + numbers < 2) return false; // Need at least 2 alphanumeric chars

      // Specific checks for common garbage patterns
      const garbagePatterns = [
        /^[^\w]*$/, // Only symbols
        /^[AI1|]{3,}$/i, // Repeating I/1/|/A
        /^[O0]{3,}$/i, // Repeating O/0
        /^[WwMmNn]{3,}$/, // Repeating W/M/N
        /^\W+\w?\W+$/, // Symbol-word-symbol with tiny word
      ];

      for (const pattern of garbagePatterns) {
        if (pattern.test(line)) return false;
      }

      return true;
    });

  if (cleanedLines.length === 0) return null;

  const result = cleanedLines.join('\n').trim();

  // Final check: result should be mostly useful content
  const totalLetters = (result.match(/[a-zA-Z]/g) || []).length;
  const totalNumbers = (result.match(/[0-9]/g) || []).length;

  if (totalLetters + totalNumbers < 3) return null;

  return result;
}

async function callAIOCR(canvas: HTMLCanvasElement): Promise<{ text: string | null; error?: string }> {
  const base64 = canvas.toDataURL('image/jpeg', 0.85);

  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/ocr-ai`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64 }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      return { text: null, error: data.error || 'AI OCR failed' };
    }

    const data = await response.json();
    return { text: data.text, error: data.error };
  } catch {
    return { text: null, error: 'Failed to reach OCR service' };
  }
}

async function callTesseract(canvas: HTMLCanvasElement): Promise<{ text: string | null; error?: string }> {
  try {
    // Try with multiple PSM modes for better results
    const results: { text: string; confidence: number }[] = [];

    // PSM 3 = Fully automatic (default)
    // PSM 6 = Single uniform block
    // PSM 4 = Single column of text
    const psmModes = ['3', '6'] as const;

    for (const psm of psmModes) {
      try {
        const result = await Tesseract.recognize(canvas, 'eng', {
          tessedit_pageseg_mode: psm as any,
        });

        const text = result.data.text?.trim();
        const confidence = result.data.confidence || 0;

        if (text && confidence > 20) {
          const cleaned = cleanOcrText(text, confidence);
          if (cleaned) {
            results.push({ text: cleaned, confidence });
          }
        }
      } catch {
        // Continue to next PSM mode
      }
    }

    if (results.length === 0) {
      return { text: null, error: 'No text detected' };
    }

    // Pick the result with highest confidence
    const best = results.reduce((a, b) => a.confidence > b.confidence ? a : b);

    return { text: best.text };
  } catch (e: any) {
    return { text: null, error: e?.message || 'OCR failed' };
  }
}

export function useOCR() {
  const [status, setStatus] = useState<OcrStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [ocrMethod, setOcrMethod] = useState<'ai' | 'tesseract' | null>(null);
  const abortRef = useRef(false);

  const recognize = useCallback(async (source: HTMLCanvasElement | string): Promise<string | null> => {
    abortRef.current = false;
    setStatus('running');
    setProgress(0);
    setError(null);
    setOcrMethod(null);

    try {
      // Handle string (image path) - use Tesseract only
      if (typeof source === 'string') {
        setProgress(20);
        const canvas = await createCanvasFromURL(source);
        const result = await callTesseract(canvas);

        if (abortRef.current) return null;

        setStatus('done');
        setProgress(100);

        if (result.error && !result.text) {
          setError(result.error);
          return null;
        }

        setOcrMethod('tesseract');
        return result.text;
      }

      // Canvas - try AI first, fallback to Tesseract
      setProgress(10);

      // Try AI OCR
      const aiResult = await callAIOCR(source);
      setProgress(50);

      if (abortRef.current) return null;

      if (aiResult.text) {
        setStatus('done');
        setProgress(100);
        setOcrMethod('ai');
        return aiResult.text;
      }

      // Fallback to Tesseract
      setProgress(60);
      const tesseractResult = await callTesseract(source);

      if (abortRef.current) return null;

      setStatus('done');
      setProgress(100);

      if (tesseractResult.text) {
        setOcrMethod('tesseract');
        return tesseractResult.text;
      }

      // Both failed
      setError(tesseractResult.error || aiResult.error || 'No text detected');
      return null;

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
    setOcrMethod(null);
  }, []);

  return { status, progress, error, recognize, reset, ocrMethod };
}

// Helper to create canvas from URL
async function createCanvasFromURL(url: string): Promise<HTMLCanvasElement> {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = url;
  });

  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.drawImage(img, 0, 0);
  }
  return canvas;
}
