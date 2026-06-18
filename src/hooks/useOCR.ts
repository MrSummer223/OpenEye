import { useState, useCallback, useRef } from 'react';
import Tesseract from 'tesseract.js';

export type OcrStatus = 'idle' | 'running' | 'done' | 'error';

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
      const result = await Tesseract.recognize(source, 'eng', {
        logger: (m: any) => {
          if (m.status === 'recognizing text') setProgress(Math.round(m.progress * 100));
        },
      });
      if (abortRef.current) return null;
      const text = result.data.text.trim();
      setStatus('done');
      setProgress(100);
      return text || null;
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
