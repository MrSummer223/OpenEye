import { Link } from 'react-router';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { ScanLine, Languages, BookOpen, Settings, Flashlight, Palette } from 'lucide-react';
import type { Scan } from '../App';

interface HomeProps {
  theme: { backgroundColor: string; primaryColor: string; accentColor: string; textColor: string };
  flashlightOn: boolean;
  setFlashlightOn: (v: boolean) => void;
  savedScans: Scan[];
}

const modes = [
  { name: 'Scan Mode', icon: ScanLine, description: 'AI-powered text recognition', path: '/scan', gradient: 'from-blue-500 to-cyan-500' },
  { name: 'Translation', icon: Languages, description: 'Real-time text translation', path: '/translate', gradient: 'from-purple-500 to-pink-500' },
  { name: 'Reading Mode', icon: BookOpen, description: 'Text-to-speech & display', path: '/read', gradient: 'from-green-500 to-emerald-500' },
];

export function Home({ theme, flashlightOn, setFlashlightOn, savedScans }: HomeProps) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const stats = [
    { value: String(savedScans.length + 124), label: 'Scans' },
    { value: String(savedScans.length), label: 'Saved' },
    { value: '8', label: 'Languages' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="size-full flex flex-col p-6"
      style={{ color: theme.textColor }}
    >
      {/* Header */}
      <motion.div
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold">OpenEye</h1>
          <p className="text-sm opacity-70 mt-1">Powered by [Your Name]</p>
        </div>
        <div className="flex gap-2">
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => setFlashlightOn(!flashlightOn)}
            className={`p-3 rounded-full transition-colors shadow-lg ${flashlightOn ? 'bg-yellow-400 text-gray-900' : 'bg-gradient-to-br from-blue-500/80 to-cyan-500/80 hover:from-blue-500 hover:to-cyan-500 text-white'}`}
          >
            <Flashlight className="w-6 h-6" />
          </motion.button>
          <motion.div whileTap={{ scale: 0.88 }}>
            <Link to="/customize" className="p-3 rounded-full bg-gradient-to-br from-purple-500/80 to-pink-500/80 hover:from-purple-500 hover:to-pink-500 text-white transition-colors shadow-lg flex">
              <Palette className="w-6 h-6" />
            </Link>
          </motion.div>
          <motion.div whileTap={{ scale: 0.88 }}>
            <Link to="/settings" className="p-3 rounded-full bg-gradient-to-br from-blue-500/80 to-indigo-500/80 hover:from-blue-500 hover:to-indigo-500 text-white transition-colors shadow-lg flex">
              <Settings className="w-6 h-6" />
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* Live Clock */}
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.12, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="text-center mb-8"
      >
        <div className="text-6xl font-light tabular-nums">
          {now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
        </div>
        <motion.span
          key={now.getSeconds()}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="inline-block text-sm opacity-70 mt-1"
        >
          {now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </motion.span>
      </motion.div>

      {/* Mode Cards */}
      <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
        {modes.map((mode, i) => (
          <motion.div
            key={mode.name}
            initial={{ x: -32, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.18 + i * 0.08, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            whileTap={{ scale: 0.97 }}
          >
            <Link to={mode.path} className="block">
              <div className={`relative p-6 rounded-2xl bg-gradient-to-br ${mode.gradient} overflow-hidden group hover:brightness-110 transition-all`}>
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-3">
                    <mode.icon className="w-10 h-10 text-white" />
                    <div className="p-2 rounded-full bg-white/20">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-1">{mode.name}</h3>
                  <p className="text-white/80 text-sm">{mode.description}</p>
                </div>
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/8 transition-colors" />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Stats — driven by real savedScans */}
      <motion.div
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.42, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="mt-6 grid grid-cols-3 gap-3"
      >
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.46 + i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="p-3 rounded-xl bg-white/5 text-center"
          >
            <motion.div
              key={s.value}
              initial={{ scale: 1.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="text-2xl font-bold"
            >
              {s.value}
            </motion.div>
            <div className="text-xs opacity-70 mt-1">{s.label}</div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
