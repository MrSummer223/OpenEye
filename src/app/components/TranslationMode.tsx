import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Camera, Type, Languages, ArrowLeftRight, Flashlight, Volume2, Copy, CheckCheck, CircleAlert as AlertCircle } from 'lucide-react';
import { useCamera } from '../../hooks/useCamera';
import { useOCR } from '../../hooks/useOCR';
import { translateText } from '../../utils/translate';

interface TranslationModeProps {
  theme: { backgroundColor: string; primaryColor: string; accentColor: string; textColor: string };
}

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' },
];

type InputMode = 'camera' | 'text';

interface RecentItem { from: string; to: string; text: string; time: string }

export function TranslationMode({ theme }: TranslationModeProps) {
  const [inputMode, setInputMode] = useState<InputMode>('camera');
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('es');
  const [isTranslating, setIsTranslating] = useState(false);
  const [originalText, setOriginalText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [typedText, setTypedText] = useState('');
  const [translateError, setTranslateError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [recent, setRecent] = useState<RecentItem[]>([
    { from: '🇬🇧', to: '🇪🇸', text: 'Hello, how are you?', time: '2 min ago' },
    { from: '🇫🇷', to: '🇬🇧', text: 'Bonjour mon ami', time: '15 min ago' },
  ]);

  const { videoRef, status: camStatus, error: camError, startCamera, stopCamera, captureFrame, torchSupported, torchOn, toggleTorch } = useCamera();
  const { status: ocrStatus, progress, recognize } = useOCR();

  useEffect(() => {
    if (inputMode === 'camera') startCamera();
    else stopCamera();
  }, [inputMode, startCamera, stopCamera]);

  useEffect(() => () => stopCamera(), [stopCamera]);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2200); };

  const runTranslation = async (src: string) => {
    if (!src.trim()) { showToast('Nothing to translate'); return; }
    setIsTranslating(true);
    setTranslateError(null);
    setOriginalText(src);
    setTranslatedText('');
    try {
      const result = await translateText(src, sourceLang, targetLang);
      setTranslatedText(result);
      const srcFlag = LANGUAGES.find(l => l.code === sourceLang)?.flag ?? '';
      const tgtFlag = LANGUAGES.find(l => l.code === targetLang)?.flag ?? '';
      setRecent(prev => [{ from: srcFlag, to: tgtFlag, text: src.slice(0, 40), time: 'just now' }, ...prev.slice(0, 4)]);
    } catch (e: any) {
      setTranslateError(e?.message ?? 'Translation failed');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleCameraTranslate = async () => {
    const canvas = captureFrame();
    if (!canvas) { showToast('Camera not ready'); return; }
    const text = await recognize(canvas);
    if (!text) { showToast('No text detected in image'); return; }
    await runTranslation(text);
  };

  const handleTextTranslate = () => runTranslation(typedText);

  const swapLanguages = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setOriginalText(translatedText);
    setTranslatedText(originalText);
    if (inputMode === 'text') setTypedText(translatedText || typedText);
  };

  const speakText = (text: string, langCode: string) => {
    if (!window.speechSynthesis) { showToast('TTS not supported'); return; }
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = langCode;
    window.speechSynthesis.speak(utt);
  };

  const copyText = async (text: string) => {
    await navigator.clipboard.writeText(text).catch(() => {});
    showToast('Copied!');
  };

  const isOcrRunning = ocrStatus === 'running';
  const isBusy = isOcrRunning || isTranslating;

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
            initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -40, opacity: 0 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-sm font-semibold whitespace-nowrap"
            style={{ color: theme.textColor }}
          >
            <CheckCheck className="w-4 h-4 text-blue-400" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-center justify-between p-4 border-b border-white/10"
      >
        <div className="flex items-center gap-3">
          <Link to="/" className="p-2 rounded-full bg-gradient-to-br from-blue-500/80 to-indigo-500/80 hover:from-blue-500 hover:to-indigo-500 text-white transition-colors shadow-lg">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h2 className="text-xl font-semibold">Translation Mode</h2>
            <p className="text-xs opacity-70">OCR + Real-time Translation</p>
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
          <div className="flex gap-1 p-1 rounded-xl bg-white/5">
            {([{ val: 'camera', Icon: Camera, label: 'Camera' }, { val: 'text', Icon: Type, label: 'Type' }] as const).map(({ val, Icon, label }) => (
              <motion.button
                key={val}
                whileTap={{ scale: 0.95 }}
                onClick={() => setInputMode(val)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all text-sm ${inputMode === val ? 'bg-blue-500 text-white' : 'hover:bg-white/10'}`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Language Row */}
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="px-4 mb-4"
        >
          <div className="flex items-center gap-2">
            <select
              value={sourceLang}
              onChange={e => setSourceLang(e.target.value)}
              className="flex-1 p-3 rounded-xl bg-white/5 border border-white/10 outline-none text-sm"
              style={{ color: theme.textColor }}
            >
              {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.flag} {l.name}</option>)}
            </select>
            <motion.button
              whileTap={{ rotate: 180, scale: 0.85 }}
              transition={{ duration: 0.3 }}
              onClick={swapLanguages}
              className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
            >
              <ArrowLeftRight className="w-5 h-5" />
            </motion.button>
            <select
              value={targetLang}
              onChange={e => setTargetLang(e.target.value)}
              className="flex-1 p-3 rounded-xl bg-white/5 border border-white/10 outline-none text-sm"
              style={{ color: theme.textColor }}
            >
              {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.flag} {l.name}</option>)}
            </select>
          </div>
        </motion.div>

        {/* Input Area */}
        <AnimatePresence mode="wait">
          {inputMode === 'text' ? (
            <motion.div
              key="text"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="px-4 mb-4"
            >
              <textarea
                value={typedText}
                onChange={e => setTypedText(e.target.value)}
                placeholder="Type or paste text to translate…"
                rows={4}
                className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 outline-none resize-none text-sm leading-relaxed focus:border-blue-500/50 transition-colors"
                style={{ color: theme.textColor }}
              />
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={handleTextTranslate}
                disabled={isBusy || !typedText.trim()}
                className="w-full mt-3 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:brightness-110 transition-all disabled:opacity-40"
              >
                {isBusy ? 'Translating…' : 'Translate'}
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="camera"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="px-4 mb-4"
            >
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
                    <motion.div key="req" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center z-10">
                      <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                      <p className="text-sm opacity-70">Requesting camera…</p>
                    </motion.div>
                  )}
                  {camStatus === 'error' && (
                    <motion.div key="err" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center p-6 z-10">
                      <AlertCircle className="w-12 h-12 mx-auto mb-3 text-red-400" />
                      <p className="text-sm text-red-400">{camError}</p>
                    </motion.div>
                  )}
                  {isBusy && (
                    <motion.div key="busy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-10">
                      <div className="w-14 h-14 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
                      <p className="text-sm font-semibold">
                        {isOcrRunning ? `Reading text… ${progress}%` : 'Translating…'}
                      </p>
                    </motion.div>
                  )}
                  {camStatus === 'idle' && !isBusy && (
                    <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center p-6 z-10">
                      <Languages className="w-16 h-16 mx-auto mb-4 opacity-40" />
                      <p className="opacity-60">Point camera at text</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {camStatus === 'active' && !isBusy && (
                  <div className="absolute inset-8 border-2 border-blue-500/50 rounded-xl pointer-events-none z-20" />
                )}
              </div>

              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={handleCameraTranslate}
                disabled={isBusy || camStatus !== 'active'}
                className="w-full mt-4 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:brightness-110 transition-all disabled:opacity-50"
              >
                {isBusy ? (isOcrRunning ? `Scanning… ${progress}%` : 'Translating…') : 'Capture & Translate'}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error */}
        <AnimatePresence>
          {translateError && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="px-4 mb-4 overflow-hidden"
            >
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {translateError}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Translation Results */}
        <AnimatePresence>
          {originalText && translatedText && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="px-4 space-y-3"
            >
              {[
                { label: 'Original', text: originalText, lang: sourceLang, gradient: false },
                { label: 'Translation', text: translatedText, lang: targetLang, gradient: true },
              ].map(({ label, text, lang, gradient }) => (
                <div
                  key={label}
                  className={`p-4 rounded-xl border ${gradient ? 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-500/30' : 'bg-white/5 border-white/10'}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold opacity-70 uppercase">
                      {LANGUAGES.find(l => l.code === lang)?.flag} {label}
                    </span>
                    <div className="flex gap-1">
                      <motion.button whileTap={{ scale: 0.85 }} onClick={() => speakText(text, lang)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                        <Volume2 className="w-4 h-4" />
                      </motion.button>
                      <motion.button whileTap={{ scale: 0.85 }} onClick={() => copyText(text)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                        <Copy className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed">{text}</p>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Recent Translations */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.28, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="p-4 mt-4"
        >
          <h3 className="text-lg font-semibold mb-3">Recent</h3>
          <div className="space-y-2">
            <AnimatePresence>
              {recent.map((t, i) => (
                <motion.button
                  key={i}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 20, opacity: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                  onClick={() => { setTypedText(t.text); setInputMode('text'); }}
                  className="w-full p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-left"
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span>{t.from}</span>
                      <ArrowLeftRight className="w-3 h-3 opacity-50" />
                      <span>{t.to}</span>
                    </div>
                    <span className="text-xs opacity-50">{t.time}</span>
                  </div>
                  <p className="text-sm opacity-70 truncate">{t.text}</p>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
