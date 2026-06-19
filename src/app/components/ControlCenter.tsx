import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Wifi, Bluetooth, Volume2, Sun, Moon, Flashlight, Camera, Calculator, Clock,
  Settings, Plane, Focus, Music, ChevronDown, X
} from 'lucide-react';

interface ControlCenterProps {
  visible: boolean;
  onClose: () => void;
  theme: { backgroundColor: string; textColor: string };
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;
  brightness: number;
  setBrightness: (v: number) => void;
  flashlightOn: boolean;
  setFlashlightOn: (v: boolean) => void;
}

const TOGGLE_ITEMS = [
  { icon: Wifi, label: 'Wi-Fi', active: true },
  { icon: Bluetooth, label: 'Bluetooth', active: true },
  { icon: Plane, label: 'Airplane', active: false },
  { icon: Focus, label: 'Focus', active: false },
  { icon: Music, label: 'Music', active: true },
  { icon: Volume2, label: 'AirDrop', active: false },
] as const;

const QUICK_APPS = [
  { icon: Camera, label: 'Camera', color: '#3b82f6' },
  { icon: Calculator, label: 'Calculator', color: '#10b981' },
  { icon: Clock, label: 'Clock', color: '#6366f1' },
] as const;

export function ControlCenter({
  visible,
  onClose,
  theme,
  darkMode,
  setDarkMode,
  brightness,
  setBrightness,
  flashlightOn,
  setFlashlightOn,
}: ControlCenterProps) {
  const [wifi, setWifi] = useState(true);
  const [bluetooth, setBluetooth] = useState(true);
  const [airplane, setAirplane] = useState(false);
  const [focus, setFocus] = useState(false);

  const toggles = [
    { icon: Wifi, label: 'Wi-Fi', active: wifi, toggle: () => setWifi(!wifi) },
    { icon: Bluetooth, label: 'Bluetooth', active: bluetooth, toggle: () => setBluetooth(!bluetooth) },
    { icon: Plane, label: 'Airplane', active: airplane, toggle: () => setAirplane(!airplane) },
    { icon: Focus, label: 'Focus', active: focus, toggle: () => setFocus(!focus) },
  ];

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/30 backdrop-blur-sm z-50"
          />

          {/* Panel */}
          <motion.div
            initial={{ y: '-100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '-100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="absolute top-0 left-0 right-0 z-50 p-4 pt-12"
            style={{
              backgroundColor: 'rgba(0,0,0,0.8)',
              backdropFilter: 'blur(20px)',
              borderRadius: '0 0 40px 40px',
            }}
          >
            {/* Close handle */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10"
            >
              <X className="w-5 h-5 text-white/60" />
            </motion.button>

            {/* Network toggles */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {toggles.map((t, i) => (
                <motion.button
                  key={t.label}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={t.toggle}
                  className={`p-4 rounded-2xl flex items-center gap-3 transition-all ${
                    t.active ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/60'
                  }`}
                >
                  <t.icon className="w-6 h-6" />
                  <span className="font-semibold text-sm">{t.label}</span>
                </motion.button>
              ))}
            </div>

            {/* Brightness & Volume */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="p-4 rounded-2xl bg-white/10 flex flex-col items-center"
              >
                <Sun className={`w-6 h-6 mb-2 ${darkMode ? 'text-white/60' : 'text-yellow-400'}`} />
                <div
                  className="w-full h-20 rounded-full bg-white/10 relative overflow-hidden cursor-pointer"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const y = e.clientY - rect.top;
                    const percent = 100 - (y / rect.height) * 100;
                    setBrightness(Math.round(percent));
                  }}
                >
                  <div
                    className="absolute bottom-0 left-0 right-0 bg-white/30 transition-all"
                    style={{ height: `${brightness}%` }}
                  />
                </div>
                <span className="text-xs text-white/60 mt-2">{brightness}%</span>
              </motion.div>

              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.25 }}
                className="p-4 rounded-2xl bg-white/10 flex flex-col items-center"
              >
                <Volume2 className="w-6 h-6 mb-2 text-white/60" />
                <div className="w-full h-20 rounded-full bg-white/10 relative overflow-hidden">
                  <div className="absolute bottom-0 left-0 right-0 h-[75%] bg-white/30" />
                </div>
                <span className="text-xs text-white/60 mt-2">75%</span>
              </motion.div>
            </div>

            {/* Quick Actions */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-4 gap-3 mb-4"
            >
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setFlashlightOn(!flashlightOn)}
                className={`p-4 rounded-2xl flex flex-col items-center gap-2 transition-all ${
                  flashlightOn ? 'bg-yellow-500/80 text-black' : 'bg-white/10 text-white/60'
                }`}
              >
                <Flashlight className="w-6 h-6" />
                <span className="text-xs font-medium">Flash</span>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setDarkMode(!darkMode)}
                className={`p-4 rounded-2xl flex flex-col items-center gap-2 transition-all ${
                  !darkMode ? 'bg-yellow-500/80 text-black' : 'bg-white/10 text-white/60'
                }`}
              >
                {darkMode ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
                <span className="text-xs font-medium">{darkMode ? 'Dark' : 'Light'}</span>
              </motion.button>

              {QUICK_APPS.map((app) => (
                <motion.button
                  key={app.label}
                  whileTap={{ scale: 0.9 }}
                  className="p-4 rounded-2xl bg-white/10 flex flex-col items-center gap-2"
                  style={{ color: app.color }}
                >
                  <app.icon className="w-6 h-6" />
                  <span className="text-xs text-white/60 font-medium">{app.label}</span>
                </motion.button>
              ))}
            </motion.div>

            {/* Now Playing */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="p-4 rounded-2xl bg-white/10 flex items-center gap-3"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center">
                <Music className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white text-sm truncate">Not Playing</p>
                <p className="text-xs text-white/50">Open Music app</p>
              </div>
            </motion.div>

            {/* Swipe to close */}
            <motion.div
              className="mt-4 flex justify-center"
              animate={{ y: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <ChevronDown className="w-6 h-6 text-white/30" />
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
