import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Camera, FileText, Play, Pause, Volume2, VolumeX, SkipBack, SkipForward, Flashlight } from 'lucide-react';

interface ReadingModeProps {
  theme: { backgroundColor: string; primaryColor: string; accentColor: string; textColor: string };
  flashlightOn: boolean;
  setFlashlightOn: (v: boolean) => void;
}

const SAMPLE_TEXTS = [
  "The principles of quantum mechanics have revolutionized our understanding of the physical world at the atomic and subatomic scales. Unlike classical mechanics, which describes the motion of macroscopic objects, quantum mechanics introduces concepts such as wave-particle duality, uncertainty principle, and quantum entanglement. These principles form the foundation of modern physics.",
  "Artificial intelligence is transforming industries across the globe. Machine learning models can now recognize speech, translate languages, and even generate creative content. The rapid advancement of large language models has opened new possibilities for human-computer interaction and automation of complex cognitive tasks.",
  "Climate change poses one of the greatest challenges of our time. Rising global temperatures, driven by greenhouse gas emissions, are causing more frequent extreme weather events, rising sea levels, and shifts in ecosystems. International cooperation and rapid transition to renewable energy sources are essential to limit global warming.",
];

interface HistoryItem { title: string; time: string; duration: string; text: string }

export function ReadingMode({ theme, flashlightOn, setFlashlightOn }: ReadingModeProps) {
  const [view, setView] = useState<'scan' | 'display'>('scan');
  const [isReading, setIsReading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [speed, setSpeed] = useState(1.0);
  const [textSize, setTextSize] = useState(16);
  const [activeWord, setActiveWord] = useState(-1);
  const [displayedText, setDisplayedText] = useState(SAMPLE_TEXTS[0]);
  const [scanIndex, setScanIndex] = useState(0);
  const [history, setHistory] = useState<HistoryItem[]>([
    { title: 'Physics Textbook Chapter 12', time: '5 min ago', duration: '3:45', text: SAMPLE_TEXTS[0] },
    { title: 'AI & The Future', time: '1 hour ago', duration: '2:10', text: SAMPLE_TEXTS[1] },
    { title: 'Climate Change Report', time: '2 hours ago', duration: '1:50', text: SAMPLE_TEXTS[2] },
  ]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const words = displayedText.split(/\s+/);

  const stopReading = () => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setIsReading(false);
    setActiveWord(-1);
  };

  const startReading = () => {
    stopReading();
    setIsReading(true);
    let idx = 0;
    const msPerWord = Math.round(600 / speed);

    if (!isMuted && window.speechSynthesis) {
      const utt = new SpeechSynthesisUtterance(displayedText);
      utt.rate = speed;
      utt.onend = () => { setIsReading(false); setActiveWord(-1); };
      utteranceRef.current = utt;
      window.speechSynthesis.speak(utt);
    }

    intervalRef.current = setInterval(() => {
      setActiveWord(idx);
      idx++;
      if (idx >= words.length) {
        clearInterval(intervalRef.current!);
        intervalRef.current = null;
        setTimeout(() => { setIsReading(false); setActiveWord(-1); }, 500);
      }
    }, msPerWord);
  };

  const toggleReading = () => {
    if (isReading) stopReading();
    else startReading();
  };

  const restart = () => { stopReading(); setTimeout(startReading, 100); };
  const skipForward = () => setActiveWord(w => Math.min(w + 10, words.length - 1));

  useEffect(() => () => stopReading(), []);

  const handleScan = () => {
    const text = SAMPLE_TEXTS[scanIndex % SAMPLE_TEXTS.length];
    setScanIndex(i => i + 1);
    setTimeout(() => {
      setDisplayedText(text);
      const titles = ['Physics Textbook', 'AI & Technology', 'Climate Report'];
      setHistory(prev => [
        { title: titles[scanIndex % titles.length], time: 'just now', duration: '—', text },
        ...prev.slice(0, 4),
      ]);
      setView('display');
      stopReading();
    }, 1000);
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
          <Link to="/" onClick={stopReading} className="p-2 rounded-full hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h2 className="text-xl font-semibold">Reading Mode</h2>
            <p className="text-xs opacity-70">Text-to-Speech & Display</p>
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
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                <div className="text-center p-6">
                  <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="opacity-70" style={{ color: theme.textColor }}>Position text to scan</p>
                </div>
              </div>
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={handleScan}
                className="w-full mt-4 py-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold hover:brightness-110 transition-all"
              >
                Scan & Read
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="display"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="px-4"
            >
              {/* Controls */}
              <div className="mb-4 p-4 rounded-xl bg-white/5 border border-white/10">
                {/* Playback buttons */}
                <div className="flex items-center justify-center gap-4 mb-4">
                  <motion.button whileTap={{ scale: 0.85 }} onClick={restart} className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                    <SkipBack className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.85 }}
                    onClick={toggleReading}
                    className={`p-4 rounded-full transition-colors ${isReading ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white`}
                  >
                    {isReading ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.85 }} onClick={skipForward} className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                    <SkipForward className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.85 }}
                    onClick={() => { setIsMuted(!isMuted); if (isReading) { stopReading(); setTimeout(startReading, 50); } }}
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
                    onChange={e => { const v = parseFloat(e.target.value); setSpeed(v); if (isReading) { stopReading(); setTimeout(startReading, 50); } }}
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
              <div className="p-5 rounded-xl bg-white/5 border border-white/10 min-h-[180px] leading-relaxed" style={{ fontSize: `${textSize}px` }}>
                {words.map((word, i) => (
                  <span key={i}>
                    <motion.span
                      animate={i === activeWord ? { backgroundColor: '#22c55e33', color: '#4ade80' } : { backgroundColor: 'transparent', color: theme.textColor }}
                      transition={{ duration: 0.1 }}
                      className="rounded px-0.5"
                    >
                      {word}
                    </motion.span>
                    {' '}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reading History */}
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
                  <span className="text-sm font-semibold">{item.title}</span>
                  <span className="text-xs opacity-50">{item.duration}</span>
                </div>
                <span className="text-xs opacity-50">{item.time}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
