import { Link } from 'react-router';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { ScanLine, Languages, BookOpen, Settings, Store, ChevronUp } from 'lucide-react';
import type { Scan } from '../App';

interface HomeProps {
  theme: { backgroundColor: string; primaryColor: string; accentColor: string; textColor: string };
  flashlightOn: boolean;
  setFlashlightOn: (v: boolean) => void;
  savedScans: Scan[];
  onOpenControlCenter?: () => void;
}

const apps = [
  { name: 'Scan', icon: ScanLine, path: '/scan', gradient: 'from-blue-500 to-cyan-500' },
  { name: 'Translate', icon: Languages, path: '/translate', gradient: 'from-purple-500 to-pink-500' },
  { name: 'Reader', icon: BookOpen, path: '/read', gradient: 'from-green-500 to-emerald-500' },
  { name: 'Store', icon: Store, path: '/customize', gradient: 'from-orange-500 to-red-500' },
  { name: 'Settings', icon: Settings, path: '/settings', gradient: 'from-gray-500 to-slate-600' },
];

export function Home({ theme, savedScans, onOpenControlCenter }: HomeProps) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="size-full flex flex-col"
      style={{ color: theme.textColor }}
    >
      {/* Pull to open control center indicator */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        whileHover={{ opacity: 1 }}
        onClick={onOpenControlCenter}
        className="absolute top-0 left-0 right-0 h-8 flex items-center justify-center z-30"
      >
        <ChevronUp className="w-5 h-5" />
      </motion.button>

      {/* Main Content */}
      <div className="flex-1 px-6 pt-12 pb-6 overflow-y-auto">
        {/* Date Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-8"
        >
          <div className="text-5xl font-light tabular-nums mb-1">
            {now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
          </div>
          <span className="text-sm opacity-70">
            {now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </span>
        </motion.div>

        {/* Recent Scans Widget */}
        {savedScans.length > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="mb-6"
          >
            <Link to="/scan" className="block p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <ScanLine className="w-5 h-5 opacity-60" />
                <span className="font-semibold text-sm">Recent Scans</span>
                <span className="ml-auto text-xs opacity-50">{savedScans.length}</span>
              </div>
              <p className="text-sm opacity-70 truncate">{savedScans[0]?.text}</p>
            </Link>
          </motion.div>
        )}

        {/* App Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="grid grid-cols-3 gap-4 mt-4"
        >
          {apps.map((app, i) => (
            <motion.div
              key={app.name}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.35 + i * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              whileTap={{ scale: 0.92 }}
            >
              <Link to={app.path} className="block text-center">
                <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${app.gradient} flex items-center justify-center shadow-lg mb-2`}>
                  <app.icon className="w-8 h-8 text-white" />
                </div>
                <span className="text-xs font-medium opacity-80">{app.name}</span>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Page Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex justify-center gap-1.5 mt-8"
        >
          <div className="w-2 h-2 rounded-full bg-white/60" />
          <div className="w-2 h-2 rounded-full bg-white/20" />
        </motion.div>
      </div>

      {/* Dock */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="px-4 pb-6"
      >
        <div className="flex justify-around items-center gap-3 p-4 rounded-3xl bg-white/10 backdrop-blur-md border border-white/10">
          {apps.slice(0, 4).map((app) => (
            <motion.div key={app.name} whileTap={{ scale: 0.9 }}>
              <Link to={app.path}>
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${app.gradient} flex items-center justify-center shadow-md`}>
                  <app.icon className="w-7 h-7 text-white" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
