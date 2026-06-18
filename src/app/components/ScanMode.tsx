import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Camera, Save, Copy, Share2, Trash2, Flashlight, CheckCheck, X, AlertCircle } from 'lucide-react';
import type { Scan } from '../App';
import { useCamera } from '../../hooks/useCamera';
import { useOCR } from '../../hooks/useOCR';

interface ScanModeProps {
  theme: { backgroundColor: string; primaryColor: string; accentColor: string; textColor: string };
  flashlightOn: boolean;
  setFlashlightOn: (v: boolean) => void;
  savedScans: Scan[];
  setSavedScans: (scans: Scan[]) => void;
}

const slideUp = { initial: { y: 20, opacity: 0 }, animate: { y: 0, opacity: 1 } };

export function ScanMode({ theme, flashlightOn, setFlashlightOn, savedScans, setSavedScans }: ScanModeProps) {
  const [scannedText, setScannedText] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const { videoRef, status: camStatus, error: camError, startCamera, stopCamera, captureFrame } = useCamera();
  const { status: ocrStatus, progress, error: ocrError, recognize } = useOCR();

  const isScanning = ocrStatus === 'running';

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  const handleScan = async () => {
    const canvas = captureFrame();
    if (!canvas) { showToast('Camera not ready'); return; }
    setScannedText('');
    const text = await recognize(canvas);
    if (text) {
      setScannedText(text);
    } else {
      showToast(ocrError ?? 'No text detected');
    }
  };

  const handleSave = () => {
    if (!scannedText) return;
    const already = savedScans.some(s => s.text.startsWith(scannedText.slice(0, 40)));
    if (already) { showToast('Already saved'); return; }
    setSavedScans([
      { id: Date.now(), text: scannedText.slice(0, 70) + (scannedText.length > 70 ? '…' : ''), date: new Date().toISOString().split('T')[0] },
      ...savedScans,
    ]);
    showToast('Saved');
  };

  const handleCopy = async () => {
    if (!scannedText) return;
    try {
      await navigator.clipboard.writeText(scannedText);
      showToast('Copied to clipboard');
    } catch {
      showToast('Copy failed');
    }
  };

  const handleShare = async () => {
    if (!scannedText) return;
    if (navigator.share) {
      await navigator.share({ text: scannedText });
    } else {
      await navigator.clipboard.writeText(scannedText);
      showToast('Copied (share unavailable)');
    }
  };

  const handleDelete = (id: number) => {
    setSavedScans(savedScans.filter(s => s.id !== id));
    showToast('Deleted');
  };

  return (
    <motion.div
      initial={{ x: 40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
      className="size-full flex flex-col"
      style={{ color: theme.textColor }}
    >
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -40, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-sm font-semibold whitespace-nowrap"
            style={{ color: theme.textColor }}
          >
            <CheckCheck className="w-4 h-4 text-green-400" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div
        {...slideUp}
        transition={{ delay: 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-center justify-between p-4 border-b border-white/10"
      >
        <div className="flex items-center gap-3">
          <Link to="/" className="p-2 rounded-full hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h2 className="text-xl font-semibold">Scan Mode</h2>
            <p className="text-xs opacity-70">OCR Text Recognition</p>
          </div>
        </div>
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={() => setFlashlightOn(!flashlightOn)}
          className={`p-2 rounded-full transition-colors ${flashlightOn ? 'bg-yellow-400 text-gray-900' : 'bg-white/10 hover:bg-white/20'}`}
        >
          <Flashlight className="w-5 h-5" />
        </motion.button>
      </motion.div>

      <div className="flex-1 overflow-y-auto">
        {/* Camera Preview */}
        <motion.div
          {...slideUp}
          transition={{ delay: 0.1, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="p-4"
        >
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-black flex items-center justify-center">
            {/* Live video */}
            <video
              ref={videoRef}
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
              style={{ display: camStatus === 'active' ? 'block' : 'none' }}
            />

            {/* States over the video */}
            <AnimatePresence mode="wait">
              {camStatus === 'requesting' && (
                <motion.div key="req" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center z-10">
                  <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-sm opacity-70">Requesting camera…</p>
                </motion.div>
              )}
              {camStatus === 'error' && (
                <motion.div key="err" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center p-6 z-10">
                  <AlertCircle className="w-12 h-12 mx-auto mb-3 text-red-400" />
                  <p className="text-sm text-red-400 mb-1">Camera unavailable</p>
                  <p className="text-xs opacity-60">{camError}</p>
                </motion.div>
              )}
              {isScanning && (
                <motion.div key="scanning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-10">
                  <div className="w-14 h-14 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="text-sm font-semibold">Analyzing text… {progress}%</p>
                  <div className="w-32 h-1.5 bg-white/10 rounded-full mt-3 overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
                  </div>
                </motion.div>
              )}
              {camStatus === 'idle' && !isScanning && (
                <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center p-6 z-10">
                  <Camera className="w-16 h-16 mx-auto mb-4 opacity-40" />
                  <p className="opacity-60 text-sm">Starting camera…</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Scan corner guides */}
            {camStatus === 'active' && (
              <div className="absolute inset-8 border-2 border-blue-500/60 rounded-xl pointer-events-none z-20">
                {[
                  'top-0 left-0 border-t-4 border-l-4 -mt-1 -ml-1',
                  'top-0 right-0 border-t-4 border-r-4 -mt-1 -mr-1',
                  'bottom-0 left-0 border-b-4 border-l-4 -mb-1 -ml-1',
                  'bottom-0 right-0 border-b-4 border-r-4 -mb-1 -mr-1',
                ].map((cls, i) => (
                  <div key={i} className={`absolute w-6 h-6 border-blue-400 ${cls}`} />
                ))}
                {/* Animated scan line */}
                <motion.div
                  className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent"
                  animate={{ top: ['0%', '100%', '0%'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                />
              </div>
            )}
          </div>

          <motion.button
            {...slideUp}
            transition={{ delay: 0.18, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            whileTap={{ scale: 0.96 }}
            onClick={handleScan}
            disabled={isScanning || camStatus !== 'active'}
            className="w-full mt-4 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:brightness-110 transition-all disabled:opacity-50"
          >
            {isScanning ? `Scanning… ${progress}%` : scannedText ? 'Scan Again' : 'Capture & Scan'}
          </motion.button>
        </motion.div>

        {/* Scanned Result */}
        <AnimatePresence>
          {scannedText && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="px-4 overflow-hidden"
            >
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold opacity-70">Recognized Text</span>
                  <div className="flex gap-2">
                    <motion.button whileTap={{ scale: 0.85 }} onClick={handleSave} title="Save" className="p-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors">
                      <Save className="w-4 h-4" />
                    </motion.button>
                    <motion.button whileTap={{ scale: 0.85 }} onClick={handleCopy} title="Copy" className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                      <Copy className="w-4 h-4" />
                    </motion.button>
                    <motion.button whileTap={{ scale: 0.85 }} onClick={handleShare} title="Share" className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                      <Share2 className="w-4 h-4" />
                    </motion.button>
                    <motion.button whileTap={{ scale: 0.85 }} onClick={() => setScannedText('')} title="Clear" className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors">
                      <X className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{scannedText}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Saved Scans */}
        <motion.div
          {...slideUp}
          transition={{ delay: 0.22, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">Saved Scans</h3>
            <span className="text-xs opacity-50 bg-white/10 px-2 py-1 rounded-full">{savedScans.length}</span>
          </div>

          <AnimatePresence>
            {savedScans.length === 0 && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm opacity-40 text-center py-6">
                No saved scans yet
              </motion.p>
            )}
          </AnimatePresence>

          <div className="space-y-2">
            <AnimatePresence>
              {savedScans.map((scan, i) => (
                <motion.div
                  key={scan.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 20, opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ delay: i === 0 ? 0 : 0.28 + i * 0.06, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-sm mb-1 line-clamp-2">{scan.text}</p>
                      <p className="text-xs opacity-50">{scan.date}</p>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.85 }}
                      onClick={() => handleDelete(scan.id)}
                      className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
