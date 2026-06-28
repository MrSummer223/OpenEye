import { Link } from 'react-router';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { ScanLine, Languages, BookOpen, Settings, Store, Eye } from 'lucide-react';
import type { Scan } from '../App';

interface HomeProps {
  theme: { backgroundColor: string; primaryColor: string; accentColor: string; textColor: string };
  flashlightOn: boolean;
  setFlashlightOn: (v: boolean) => void;
  savedScans: Scan[];
}

const primaryModes = [
  { name: 'Scan', icon: ScanLine, path: '/scan', gradient: 'from-sky-500 to-cyan-400', desc: 'Capture & read text' },
  { name: 'Read', icon: BookOpen, path: '/read', gradient: 'from-emerald-500 to-teal-400', desc: 'Listen to any text' },
  { name: 'Translate', icon: Languages, path: '/translate', gradient: 'from-amber-500 to-orange-400', desc: 'Live translation' },
];

const utilities = [
  { name: 'Catalog', icon: Store, path: '/customize', gradient: 'from-rose-500 to-pink-400' },
  { name: 'Settings', icon: Settings, path: '/settings', gradient: 'from-slate-500 to-slate-400' },
];

export function Home({ theme, savedScans }: HomeProps) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="size-full flex flex-col"
      style={{ color: theme.textColor }}
    >
      {/* Device header */}
      <motion.div
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-center justify-between px-6 pt-6 pb-4"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: theme.primaryColor + '22' }}>
            <Eye className="w-5 h-5" style={{ color: theme.primaryColor }} />
          </div>
          <span className="text-sm font-semibold tracking-wide">OpenEye</span>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium tabular-nums">
            {now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
          </div>
          <span className="text-[10px] opacity-50">
            {now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
        </div>
      </motion.div>

      <div className="flex-1 px-6 pb-6 overflow-y-auto">
        {/* Greeting */}
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.12, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mb-6"
        >
          <h1 className="text-2xl font-semibold leading-tight">Ready to scan</h1>
          <p className="text-sm opacity-60 mt-1">Choose a mode to begin</p>
        </motion.div>

        {/* Primary modes */}
        <div className="space-y-3 mb-6">
          {primaryModes.map((mode, i) => (
            <motion.div
              key={mode.name}
              initial={{ x: -24, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.18 + i * 0.07, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                to={mode.path}
                className="block p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${mode.gradient} flex items-center justify-center shadow-lg shrink-0`}>
                    <mode.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold">{mode.name}</p>
                    <p className="text-xs opacity-50 truncate">{mode.desc}</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Recent scans */}
        {savedScans.length > 0 && (
          <motion.div
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.42, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="mb-6"
          >
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-xs font-semibold uppercase tracking-wider opacity-50">Recent</span>
              <Link to="/scan" className="text-xs opacity-60 hover:opacity-100 transition-opacity">View all</Link>
            </div>
            <Link
              to="/scan"
              className="block p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                <ScanLine className="w-4 h-4 opacity-50 shrink-0" />
                <p className="text-sm opacity-80 truncate flex-1">{savedScans[0]?.text}</p>
                <span className="text-xs opacity-40 shrink-0">{savedScans.length}</span>
              </div>
            </Link>
          </motion.div>
        )}

        {/* Utilities */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.45 }}
          className="grid grid-cols-2 gap-3"
        >
          {utilities.map((util, i) => (
            <motion.div
              key={util.name}
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.55 + i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              whileTap={{ scale: 0.97 }}
            >
              <Link
                to={util.path}
                className="block p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-colors text-center"
              >
                <div className={`w-10 h-10 mx-auto rounded-xl bg-gradient-to-br ${util.gradient} flex items-center justify-center shadow-md mb-2`}>
                  <util.icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs font-medium opacity-80">{util.name}</span>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}
