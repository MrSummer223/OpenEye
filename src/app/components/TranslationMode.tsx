import { useState } from 'react';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Camera, Image, Languages, ArrowLeftRight, Flashlight, Volume2, Type, CheckCheck } from 'lucide-react';

interface TranslationModeProps {
  theme: { backgroundColor: string; primaryColor: string; accentColor: string; textColor: string };
  flashlightOn: boolean;
  setFlashlightOn: (v: boolean) => void;
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

// Mock translation dictionary — produces plausible results
const MOCK_TRANSLATIONS: Record<string, Record<string, string>> = {
  "Hello, how are you?": { es: "¡Hola! ¿Cómo estás?", fr: "Bonjour, comment allez-vous?", de: "Hallo, wie geht es Ihnen?", ja: "こんにちは、お元気ですか？", zh: "你好，你好吗？", ar: "مرحبا كيف حالك؟", ru: "Привет, как дела?" },
  "Welcome to our restaurant.": { es: "Bienvenidos a nuestro restaurante.", fr: "Bienvenue dans notre restaurant.", de: "Willkommen in unserem Restaurant.", ja: "当店へようこそ。", zh: "欢迎光临我们的餐厅。", ar: "مرحباً بكم في مطعمنا.", ru: "Добро пожаловать в наш ресторан." },
};

function mockTranslate(text: string, from: string, to: string): string {
  if (from === to) return text;
  for (const [src, targets] of Object.entries(MOCK_TRANSLATIONS)) {
    if (text.toLowerCase().includes(src.toLowerCase()) && targets[to]) return targets[to];
  }
  // Generic fallback: prefix with language name
  const lang = LANGUAGES.find(l => l.code === to);
  return `[${lang?.name ?? to}] ${text}`;
}

type InputMode = 'camera' | 'photo' | 'text';

interface RecentItem { from: string; to: string; text: string; time: string }

export function TranslationMode({ theme, flashlightOn, setFlashlightOn }: TranslationModeProps) {
  const [inputMode, setInputMode] = useState<InputMode>('camera');
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('es');
  const [isTranslating, setIsTranslating] = useState(false);
  const [originalText, setOriginalText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [typedText, setTypedText] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const [recent, setRecent] = useState<RecentItem[]>([
    { from: '🇬🇧', to: '🇪🇸', text: 'Hello, how are you?', time: '2 min ago' },
    { from: '🇫🇷', to: '🇬🇧', text: 'Bonjour mon ami', time: '15 min ago' },
    { from: '🇯🇵', to: '🇬🇧', text: 'ありがとうございます', time: '1 hour ago' },
  ]);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2000); };

  const handleTranslate = () => {
    const src = inputMode === 'text' ? typedText.trim() : "Welcome to our restaurant. Today's special is fresh seafood pasta.";
    if (!src) { showToast('Enter text first'); return; }
    setIsTranslating(true);
    setTimeout(() => {
      const result = mockTranslate(src, sourceLang, targetLang);
      setOriginalText(src);
      setTranslatedText(result);
      const srcFlag = LANGUAGES.find(l => l.code === sourceLang)?.flag ?? '';
      const tgtFlag = LANGUAGES.find(l => l.code === targetLang)?.flag ?? '';
      setRecent(prev => [{ from: srcFlag, to: tgtFlag, text: src.slice(0, 40), time: 'just now' }, ...prev.slice(0, 4)]);
      setIsTranslating(false);
    }, 1200);
  };

  const swapLanguages = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setOriginalText(translatedText);
    setTranslatedText(originalText);
    setTypedText(translatedText || typedText);
  };

  const speakText = (text: string, langCode: string) => {
    if (!window.speechSynthesis) { showToast('TTS not supported'); return; }
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = langCode;
    window.speechSynthesis.speak(utt);
    showToast('Reading aloud…');
  };

  const copyText = async (text: string) => {
    await navigator.clipboard.writeText(text).catch(() => {});
    showToast('Copied!');
  };

  const tabs: { val: InputMode; Icon: any; label: string }[] = [
    { val: 'camera', Icon: Camera, label: 'Camera' },
    { val: 'photo', Icon: Image, label: 'Photo' },
    { val: 'text', Icon: Type, label: 'Type' },
  ];

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
            <CheckCheck className="w-4 h-4 text-purple-400" />
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
          <Link to="/" className="p-2 rounded-full hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h2 className="text-xl font-semibold">Translation Mode</h2>
            <p className="text-xs opacity-70">Real-time Translation</p>
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
          <div className="flex gap-1 p-1 rounded-xl bg-white/5">
            {tabs.map(({ val, Icon, label }) => (
              <motion.button
                key={val}
                whileTap={{ scale: 0.95 }}
                onClick={() => setInputMode(val)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all text-sm ${inputMode === val ? 'bg-purple-500 text-white' : 'hover:bg-white/10'}`}
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
            <select value={sourceLang} onChange={e => setSourceLang(e.target.value)} className="flex-1 p-3 rounded-xl bg-white/5 border border-white/10 outline-none" style={{ color: theme.textColor }}>
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
            <select value={targetLang} onChange={e => setTargetLang(e.target.value)} className="flex-1 p-3 rounded-xl bg-white/5 border border-white/10 outline-none" style={{ color: theme.textColor }}>
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
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="px-4 mb-4"
            >
              <textarea
                value={typedText}
                onChange={e => setTypedText(e.target.value)}
                placeholder="Type or paste text to translate…"
                rows={4}
                className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 outline-none resize-none text-sm leading-relaxed focus:border-purple-500/50 transition-colors"
                style={{ color: theme.textColor }}
              />
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={handleTranslate}
                disabled={isTranslating || !typedText.trim()}
                className="w-full mt-3 py-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:brightness-110 transition-all disabled:opacity-40"
              >
                {isTranslating ? 'Translating…' : 'Translate'}
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="camera"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="px-4 mb-4"
            >
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                {isTranslating ? (
                  <div className="text-center">
                    <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-lg" style={{ color: theme.textColor }}>Translating…</p>
                  </div>
                ) : (
                  <div className="text-center p-6">
                    <Languages className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="opacity-70" style={{ color: theme.textColor }}>
                      {inputMode === 'camera' ? 'Point camera at text' : 'Upload a photo'}
                    </p>
                  </div>
                )}
              </div>
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={handleTranslate}
                disabled={isTranslating}
                className="w-full mt-4 py-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:brightness-110 transition-all disabled:opacity-50"
              >
                {inputMode === 'camera' ? 'Translate Now' : 'Upload & Translate'}
              </motion.button>
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
                  className={`p-4 rounded-xl border ${gradient ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30' : 'bg-white/5 border-white/10'}`}
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
                        <CheckCheck className="w-4 h-4" />
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
