import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Wifi, Battery, Signal, Bell } from 'lucide-react';

interface StatusBarProps {
  textColor: string;
  showNotch?: boolean;
  brightness: number;
}

export function StatusBar({ textColor, brightness }: StatusBarProps) {
  const [now, setNow] = useState(new Date());
  const [battery, setBattery] = useState(87);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setBattery(prev => {
        const next = prev - Math.random() * 0.1;
        return next < 10 ? 87 : next;
      });
    }, 60000);
    return () => clearInterval(t);
  }, []);

  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="relative z-40 flex items-center justify-between px-6 pt-2 pb-1"
      style={{ color: textColor }}
    >
      {/* Notch */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-7 rounded-b-2xl bg-black flex items-center justify-center">
        <div className="w-3 h-3 rounded-full bg-gray-800 mr-2" />
        <div className="w-8 h-1.5 rounded-full bg-gray-700" />
      </div>

      {/* Left - Time */}
      <span className="text-xs font-semibold">{timeStr}</span>

      {/* Right - Status Icons */}
      <div className="flex items-center gap-1.5">
        <Signal className="w-4 h-4" />
        <Wifi className="w-4 h-4" />
        <div className="flex items-center gap-0.5">
          <div className="relative w-6 h-3 border border-current rounded-sm">
            <div
              className="absolute inset-0.5 rounded-sm transition-all"
              style={{
                width: `${battery}%`,
                backgroundColor: 'currentColor',
                opacity: brightness > 50 ? 1 : 0.6,
              }}
            />
          </div>
          <div className="w-0.5 h-1.5 bg-current rounded-r" />
        </div>
      </div>
    </motion.div>
  );
}
