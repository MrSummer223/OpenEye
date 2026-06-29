import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Camera, FileText, Play, Pause, Volume2, VolumeX, SkipBack, SkipForward, Flashlight, CircleAlert as AlertCircle } from 'lucide-react';
import { useCamera } from '../../hooks/useCamera';
import { useOCR } from '../../hooks/useOCR';

interface ReadingModeProps {
  theme: { backgroundColor: string; primaryColor: string; accentColor: string; textColor: string };
}

interface HistoryItem { title: string; time: string; text: string }

export function ReadingMode({ theme }: ReadingModeProps) {
  const [view, setView] = useState<'scan' | 'display'>('scan');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [speed, setSpeed] = useState(1.0);
  const [textSize, setTextSize] = useState(16);
  const [activeWord, setActiveWord] = useState(-1);
  const [displayedText, setDisplayedText] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [scanHint, setScanHint] = useState('');

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { videoRef, status: camStatus, error: camError, startCamera, stopCamera, captureFrame, torchSupported, torchOn, toggleTorch } = useCamera();
  const { status: ocrStatus, progress, error: ocrError, recognize } = useOCR();

  const isOcrRunning = ocrStatus === 'running';
  const words = displayedText ? displayedText.split(/\s+/).filter(Boolean) : [];

  useEffect(() => {
    if (view === 'scan') startCamera();
    else stopCamera();
  }, [view, startCamera, stopCamera]);

  useEffect(() => () => { stopReading(); stopCamera(); }, []);

  const stopReading = () => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setIsPlaying(false);
    setActiveWord(-1);
  };

  const startReading = (text: string = displayedText) => {
    if (!text) return;
    stopReading();
    setIsPlaying(true);
    const ws = text.split(/\s+/).filter(Boolean);
    let idx = 0;
    const msPerWord = Math.round(600 / speed);

    if (!isMuted && window.speechSynthesis) {
      const utt = new SpeechSynthesisUtterance(text);
      utt.rate = speed;
      utt.onend = () => { setIsPlaying(false); setActiveWord(-1); };
      window.speechSynthesis.speak(utt);
    }

    intervalRef.current = setInterval(() => {
      setActiveWord(idx);
      idx++;
      if (idx >= ws.length) {
        clearInterval(intervalRef.current!);
        intervalRef.current = null;
        setTimeout(() => { setIsPlaying(false); setActiveWord(-1); }, 500);
      }
    }, msPerWord);
  };

  const togglePlayback = () => { if (isPlaying) stopReading(); else startReading(); };
  const restart = () => { stopReading(); setTimeout(() => startReading(), 60); };
  const skipForward = () => setActiveWord(w => Math.min(w + 10, words.length - 1));

  const handleScan = async () => {
    setScanHint('');
    const canvas = captureFrame();
    if (!canvas) { setScanHint('Camera not ready'); return; }
    const text = await recognize(canvas);
    if (text) {
      const snippet = text.slice(0, 35);
      setHistory(prev => [{ title: snippet + '…', time: 'just now', text }, ...prev.slice(0, 5)]);
      setDisplayedText(text);
      stopReading();
      setView('display');
    } else {
      setScanHint(ocrError ?? 'No text detected — try better lighting');
    }
  };

  const loadFromHistory = (item: HistoryItem) => {
    stopReading();
    setDisplayedText(item.text);
    setView('display');
  };

  return (
    <motion.div
      initial={{ x: 40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
      className="size-full flex flex-col"
      style={{ color: theme.textColor }}
    >
      {/* Header */}
      <motion.div
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-center justify-between p-4 border-b border-white/10"
      >
        <div className="flex items-center gap-3">
          <Link to="/" onClick={stopReading} className="p-2 rounded-full bg-gradient-to-br from-blue-500/80 to-indigo-500/80 hover:from-blue-500 hover:to-indigo-500 text-white transition-colors shadow-lg">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h2 className="text-xl font-semibold">Reading Mode</h2>
            <p className="text-xs opacity-70">Text-to-Speech & Display</p>
          </div>
        </div>
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={() => toggleTorch()}
          disabled={!torchSupported}
          className={`p-2 rounded-full transition-colors shadow-lg ${
            !torchSupported ? 'bg-white/10 text-white/30 cursor-not-allowed'
            : torchOn ? 'bg-yellow-400 text-gray-900'
            : 'bg-gradient-to-br from-blue-500/80 to-cyan-500/80 hover:from-blue-500 hover:to-cyan-500 text-white'}`}
        >
          <Flashlight className="w-5 h-5" />
        </motion.button>
      </motion.div>

      <div className="flex-1 overflow-y-auto">
        {/* Mode Toggle */}
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="p-4"
        >
          <div className="flex gap-2 p-1 rounded-xl bg-white/5">
            {([{ val: 'scan', Icon: Camera, label: 'Scan Text' }, { val: 'display', Icon: FileText, label: 'Display' }] as const).map(({ val, Icon, label }) => (
              <motion.button
                key={val}
                whileTap={{ scale: 0.95 }}
                onClick={() => { stopReading(); setView(val); }}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition-all ${view === val ? 'bg-green-500 text-white' : 'hover:bg-white/10'}`}
              >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {view === 'scan' ? (
            <motion.div
              key="scan"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="px-4"
            >
              {/* Camera */}
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-black flex items-center justify-center">
                <video
                  ref={videoRef}
                  muted
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ display: camStatus === 'active' ? 'block' : 'none' }}
                />

                <AnimatePresence mode="wait">
                  {camStatus === 'requesting' && (
                    <motion.div key="req" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="z-10 text-center">
                      <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                      <p className="text-sm opacity-70">Requesting camera…</p>
                    </motion.div>
                  )}
                  {camStatus === 'error' && (
                    <motion.div key="err" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="z-10 text-center p-6">
                      <AlertCircle className="w-12 h-12 mx-auto mb-3 text-red-400" />
                      <p className="text-sm text-red-400 mb-1">Camera unavailable</p>
                      <p className="text-xs opacity-60">{camError}</p>
                    </motion.div>
                  )}
                  {isOcrRunning && (
                    <motion.div key="ocr" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-10">
                      <div className="w-14 h-14 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4" />
                      <p className="text-sm font-semibold">Reading text… {progress}%</p>
                      <div className="w-32 h-1.5 bg-white/10 rounded-full mt-3 overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
                      </div>
                    </motion.div>
                  )}
                  {camStatus === 'idle' && !isOcrRunning && (
                    <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="z-10 text-center p-6">
                      <Camera className="w-16 h-16 mx-auto mb-4 opacity-40" />
                      <p className="opacity-60 text-sm">Starting camera…</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {camStatus === 'active' && !isOcrRunning && (
                  <div className="absolute inset-8 border-2 border-green-500/60 rounded-xl pointer-events-none z-20">
                    {['top-0 left-0', 'top-0 right-0', 'bottom-0 left-0', 'bottom-0 right-0'].map((pos, i) => (
                      <div key={i} className={`absolute w-5 h-5 border-green-400 ${pos.includes('top') ? 'border-t-4' : 'border-b-4'} ${pos.includes('left') ? 'border-l-4' : 'border-r-4'} ${pos}`} />
                    ))}
                    <motion.div
                      className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-green-400 to-transparent"
                      animate={{ top: ['0%', '100%', '0%'] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                    />
                  </div>
                )}
              </div>

              <AnimatePresence>
                {scanHint && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2 overflow-hidden"
                  >
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {scanHint}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={handleScan}
                disabled={isOcrRunning || camStatus !== 'active'}
                className="w-full mt-4 py-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold hover:brightness-110 transition-all disabled:opacity-50"
              >
                {isOcrRunning ? `Scanning… ${progress}%` : 'Scan & Read'}
              </motion.button>

              {/* History in scan view */}
              {history.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-base font-semibold mb-3 opacity-70">Previous Scans</h3>
                  <div className="space-y-2">
                    {history.map((item, i) => (
                      <motion.button
                        key={i}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: i * 0.06 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => loadFromHistory(item)}
                        className="w-full p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-left"
                      >
                        <p className="text-sm font-medium truncate">{item.title}</p>
                        <p className="text-xs opacity-50 mt-0.5">{item.time}</p>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="display"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="px-4"
            >
              {displayedText ? (
                <>
                  {/* Controls */}
                  <div className="mb-4 p-4 rounded-xl bg-white/5 border border-white/10">
                    {/* Playback */}
                    <div className="flex items-center justify-center gap-4 mb-4">
                      <motion.button whileTap={{ scale: 0.85 }} onClick={restart} className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                        <SkipBack className="w-5 h-5" />
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.85 }}
                        onClick={togglePlayback}
                        className={`p-4 rounded-full transition-colors ${isPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white`}
                      >
                        {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                      </motion.button>
                      <motion.button whileTap={{ scale: 0.85 }} onClick={skipForward} className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                        <SkipForward className="w-5 h-5" />
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.85 }}
                        onClick={() => { setIsMuted(!isMuted); if (isPlaying) { stopReading(); setTimeout(() => startReading(), 50); } }}
                        className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                      >
                        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                      </motion.button>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full h-1.5 bg-white/10 rounded-full mb-4 overflow-hidden">
                      <motion.div
                        className="h-full bg-green-500 rounded-full"
                        animate={{ width: activeWord >= 0 ? `${((activeWord + 1) / words.length) * 100}%` : '0%' }}
                        transition={{ duration: 0.1 }}
                      />
                    </div>

                    {/* Speed */}
                    <div className="mb-3">
                      <div className="flex justify-between mb-1">
                        <span className="text-xs opacity-60">Speed</span>
                        <span className="text-xs font-semibold">{speed.toFixed(1)}×</span>
                      </div>
                      <input type="range" min="0.5" max="2.0" step="0.1" value={speed}
                        onChange={e => { const v = parseFloat(e.target.value); setSpeed(v); if (isPlaying) { stopReading(); setTimeout(() => startReading(), 50); } }}
                        className="w-full accent-green-500"
                      />
                    </div>

                    {/* Font size */}
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-xs opacity-60">Text Size</span>
                        <span className="text-xs font-semibold">{textSize}px</span>
                      </div>
                      <input type="range" min="12" max="26" step="1" value={textSize}
                        onChange={e => setTextSize(parseInt(e.target.value))}
                        className="w-full accent-green-500"
                      />
                    </div>
                  </div>

                  {/* Word-highlighted text */}
                  <div className="p-5 rounded-xl bg-white/5 border border-white/10 min-h-[180px] leading-relaxed whitespace-pre-wrap" style={{ fontSize: `${textSize}px` }}>
                    {words.map((word, i) => (
                      <span key={i}>
                        <motion.span
                          animate={i === activeWord
                            ? { backgroundColor: '#22c55e33', color: '#4ade80' }
                            : { backgroundColor: 'transparent', color: theme.textColor }}
                          transition={{ duration: 0.1 }}
                          className="rounded px-0.5"
                        >
                          {word}
                        </motion.span>
                        {' '}
                      </span>
                    ))}
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => { stopReading(); setView('scan'); }}
                    className="w-full mt-4 py-3 rounded-xl border border-white/20 text-sm font-semibold hover:bg-white/5 transition-all"
                  >
                    Scan New Text
                  </motion.button>
                </>
              ) : (
                <div className="text-center py-16">
                  <FileText className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p className="opacity-50 text-sm mb-4">No text loaded yet</p>
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setView('scan')}
                    className="px-6 py-3 rounded-xl bg-green-500 text-white font-semibold hover:bg-green-600 transition-colors"
                  >
                    Go to Scan
                  </motion.button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reading History (display view) */}
        {view === 'display' && history.length > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="p-4 mt-4"
          >
            <h3 className="text-lg font-semibold mb-3">Reading History</h3>
            <div className="space-y-2">
              {history.map((item, i) => (
                <motion.button
                  key={i}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.34 + i * 0.07, duration: 0.35 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => loadFromHistory(item)}
                  className="w-full p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-left"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold truncate">{item.title}</span>
                  </div>
                  <span className="text-xs opacity-50">{item.time}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
