import { useState, useCallback, useRef } from 'react';
import Tesseract from 'tesseract.js';

export type OcrStatus = 'idle' | 'running' | 'done' | 'error';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

async function callAIOCR(canvas: HTMLCanvasElement): Promise<{ text: string | null; error?: string }> {
  // Convert canvas to base64
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
  } catch (e) {
    return { text: null, error: 'Failed to reach OCR service' };
  }
}

async function callTesseract(canvas: HTMLCanvasElement): Promise<{ text: string | null; error?: string }> {
  try {
    const result = await Tesseract.recognize(canvas, 'eng', {
      tessedit_pageseg_mode: '3' as any,
    });

    const text = result.data.text?.trim() || null;

    if (!text || text.length < 2) {
      return { text: null, error: 'No text detected' };
    }

    // Filter out low-quality results
    const confidence = result.data.confidence || 0;
    if (confidence < 25) {
      return { text: null, error: 'Text not clear - try better lighting' };
    }

    // Clean up the text
    const cleaned = text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .filter(line => {
        // Filter garbage lines
        const symbols = line.replace(/[a-zA-Z0-9\s.,!?'"-:;()]/g, '').length;
        const ratio = symbols / line.length;
        return ratio < 0.4; // Keep lines with less than 40% symbols
      })
      .join('\n');

    if (!cleaned || cleaned.length < 2) {
      return { text: null, error: 'No text detected' };
    }

    return { text: cleaned };
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
        const result = await callTesseract(await createCanvasFromURL(source));

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

      // AI didn't return text - check if it's configured
      if (aiResult.error?.includes('not configured')) {
        console.log('AI OCR not configured, using Tesseract fallback');
      } else {
        console.log('AI OCR returned no text:', aiResult.error);
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
