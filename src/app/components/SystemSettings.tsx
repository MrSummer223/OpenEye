import { Link } from 'react-router';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Wifi, Bell, Lock, Globe, Clock, Database, Accessibility, RefreshCw, Settings2, ChevronRight, X, LogOut } from 'lucide-react';
import { useAuth } from '../../lib/auth';

interface SystemSettingsProps {
  theme: { backgroundColor: string; primaryColor: string; accentColor: string; textColor: string };
  brightness: number;
  setBrightness: (v: number) => void;
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;
}

const SETTINGS = [
  { name: 'Language & Region', icon: Globe, value: 'English (US)', description: 'Change display language and region', color: '#6366f1',
    detail: ['English (US)', 'Spanish (ES)', 'French (FR)', 'German (DE)', 'Japanese (JA)', 'Chinese (ZH)'] },
  { name: 'Wi-Fi & Network', icon: Wifi, value: 'Connected', description: 'Manage network connections', color: '#0ea5e9',
    detail: ['OpenEye_5GHz ✓', 'HomeNetwork', 'CoffeeShop_WiFi', 'Turn Wi-Fi Off'] },
  { name: 'Notifications', icon: Bell, value: 'Enabled', description: 'Control app notifications', color: '#f59e0b', detail: null },
  { name: 'Privacy & Security', icon: Lock, value: 'Protected', description: 'Manage permissions and security', color: '#10b981', detail: null },
  { name: 'Date & Time', icon: Clock, value: 'Auto', description: 'Set date and time preferences', color: '#8b5cf6', detail: null },
  { name: 'Storage', icon: Database, value: '42 GB / 64 GB', description: 'Manage device storage', color: '#ec4899', detail: null },
  { name: 'Accessibility', icon: Accessibility, value: 'Configured', description: 'Accessibility features', color: '#14b8a6', detail: null },
  { name: 'Software Update', icon: RefreshCw, value: 'Up to date', description: 'Check for system updates', color: '#22c55e', detail: null },
];

const DEVICE_INFO = [
  { label: 'Device Name', value: 'OpenEye' },
  { label: 'Model', value: 'OE-X1 Pro' },
  { label: 'Firmware Version', value: 'v2.4.1' },
  { label: 'Storage Capacity', value: '64 GB' },
  { label: 'Available Storage', value: '22 GB' },
  { label: 'Battery Health', value: 'Excellent', green: true },
];

export function SystemSettings({ theme, brightness, setBrightness, darkMode, setDarkMode }: SystemSettingsProps) {
  const { signOut } = useAuth();
  const [openPanel, setOpenPanel] = useState<string | null>(null);
  const [notifications, setNotifications] = useState(true);
  const [devMode, setDevMode] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [autoLock, setAutoLock] = useState('5 minutes');
  const [wifiNetwork, setWifiNetwork] = useState('OpenEye_5GHz ✓');

  const togglePanel = (name: string) => setOpenPanel(p => (p === name ? null : name));

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
        className="flex items-center gap-3 p-4 border-b border-white/10"
      >
        <Link to="/" className="p-2 rounded-full bg-gradient-to-br from-blue-500/80 to-indigo-500/80 hover:from-blue-500 hover:to-indigo-500 text-white transition-colors shadow-lg">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div className="flex-1">
          <h2 className="text-xl font-semibold">System Settings</h2>
          <p className="text-xs opacity-70">Device Configuration</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={signOut}
          className="p-2 rounded-full bg-gradient-to-br from-red-500/80 to-pink-500/80 hover:from-red-500 hover:to-pink-500 text-white transition-colors shadow-lg"
        >
          <LogOut className="w-5 h-5" />
        </motion.button>
      </motion.div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Settings List */}
        <div className="space-y-2">
          {SETTINGS.map((s, i) => {
            const Icon = s.icon;
            const isOpen = openPanel === s.name;
            return (
              <motion.div
                key={s.name}
                initial={{ x: -24, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.08 + i * 0.05, duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
              >
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => s.detail && togglePanel(s.name)}
                  className={`w-full p-4 rounded-xl border transition-colors text-left ${isOpen ? 'border-white/30 bg-white/10' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="p-2 rounded-xl" style={{ backgroundColor: s.color + '22' }}>
                        <Icon className="w-5 h-5" style={{ color: s.color }} />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold mb-0.5">{s.name}</p>
                        <p className="text-xs opacity-50">{s.name === 'Wi-Fi & Network' ? wifiNetwork : s.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs opacity-40">{s.name === 'Notifications' ? (notifications ? 'On' : 'Off') : s.value}</span>
                      {s.detail
                        ? <motion.div animate={{ rotate: isOpen ? 90 : 0 }} transition={{ duration: 0.2 }}>
                            <ChevronRight className="w-4 h-4 opacity-30" />
                          </motion.div>
                        : <ChevronRight className="w-4 h-4 opacity-30" />
                      }
                    </div>
                  </div>
                </motion.button>

                {/* Expandable panel */}
                <AnimatePresence>
                  {isOpen && s.detail && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="mt-1 p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                        {s.detail.map((opt) => (
                          <button
                            key={opt}
                            onClick={() => {
                              if (s.name === 'Wi-Fi & Network') setWifiNetwork(opt);
                              setOpenPanel(null);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                              (s.name === 'Wi-Fi & Network' ? wifiNetwork === opt : false)
                                ? 'bg-white/20 font-semibold'
                                : 'hover:bg-white/10'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Display Settings */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.52, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <h4 className="text-lg font-semibold mb-3">Display</h4>
          <div className="space-y-3">
            {/* Brightness — affects the device frame */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold">Brightness</span>
                <span className="text-sm opacity-70">{brightness}%</span>
              </div>
              <input
                type="range" min="10" max="100" value={brightness}
                onChange={e => setBrightness(Number(e.target.value))}
                className="w-full accent-blue-500"
              />
            </div>

            {/* Auto-Lock */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Auto-Lock</p>
                  <p className="text-xs opacity-50 mt-1">Screen timeout</p>
                </div>
                <select
                  value={autoLock}
                  onChange={e => setAutoLock(e.target.value)}
                  className="p-2 rounded-lg bg-white/10 border border-white/10 outline-none text-sm"
                  style={{ color: theme.textColor }}
                >
                  {['30 seconds', '1 minute', '2 minutes', '5 minutes', 'Never'].map(o => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Dark Mode — affects the whole device */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Dark Mode</p>
                  <p className="text-xs opacity-50 mt-1">Reduce eye strain</p>
                </div>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setDarkMode(!darkMode)}
                  className="relative w-12 h-6 rounded-full transition-colors"
                  style={{ backgroundColor: darkMode ? '#22c55e' : 'rgba(255,255,255,0.2)' }}
                >
                  <motion.div
                    animate={{ x: darkMode ? 24 : 2 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="absolute top-1 w-4 h-4 bg-white rounded-full shadow"
                  />
                </motion.button>
              </div>
            </div>

            {/* Notifications */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Notifications</p>
                  <p className="text-xs opacity-50 mt-1">Scan complete alerts</p>
                </div>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setNotifications(!notifications)}
                  className="relative w-12 h-6 rounded-full transition-colors"
                  style={{ backgroundColor: notifications ? '#22c55e' : 'rgba(255,255,255,0.2)' }}
                >
                  <motion.div
                    animate={{ x: notifications ? 24 : 2 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="absolute top-1 w-4 h-4 bg-white rounded-full shadow"
                  />
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Advanced */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.58, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <h4 className="text-lg font-semibold mb-3">Advanced</h4>
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Developer Mode</p>
                  <p className="text-xs opacity-50 mt-1">Enable advanced features</p>
                </div>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setDevMode(!devMode)}
                  className="relative w-12 h-6 rounded-full transition-colors"
                  style={{ backgroundColor: devMode ? '#f59e0b' : 'rgba(255,255,255,0.2)' }}
                >
                  <motion.div
                    animate={{ x: devMode ? 24 : 2 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="absolute top-1 w-4 h-4 bg-white rounded-full shadow"
                  />
                </motion.button>
              </div>
            </div>

            <AnimatePresence>
              {devMode && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 text-sm space-y-1">
                    <p className="font-semibold">Dev Mode Active</p>
                    <p className="opacity-70">Verbose logging enabled</p>
                    <p className="opacity-70">FPS counter: 60fps</p>
                    <p className="opacity-70">API: connected</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {!showReset ? (
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowReset(true)}
                className="w-full p-4 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors text-red-400"
              >
                <p className="font-semibold">Reset to Factory Settings</p>
                <p className="text-xs opacity-70 mt-1">Erase all data and settings</p>
              </motion.button>
            ) : (
              <motion.div
                initial={{ scale: 0.97, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="p-4 rounded-xl bg-red-500/20 border border-red-500/40"
              >
                <p className="text-red-300 font-semibold mb-1">Are you sure?</p>
                <p className="text-red-300/70 text-xs mb-3">This will erase all your data permanently.</p>
                <div className="flex gap-2">
                  <button onClick={() => setShowReset(false)} className="flex-1 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-sm font-semibold">
                    Cancel
                  </button>
                  <button onClick={() => setShowReset(false)} className="flex-1 py-2 rounded-lg bg-red-500 hover:bg-red-600 transition-colors text-white text-sm font-semibold">
                    Reset
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Device Info */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.64, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <h4 className="text-lg font-semibold mb-3">Device Information</h4>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-0">
            {DEVICE_INFO.map((item, i) => (
              <div key={item.label} className={`flex justify-between items-center py-2.5 ${i < DEVICE_INFO.length - 1 ? 'border-b border-white/10' : ''}`}>
                <span className="opacity-60 text-sm">{item.label}</span>
                <span className={`font-semibold text-sm ${item.green ? 'text-green-400' : ''}`}>{item.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
