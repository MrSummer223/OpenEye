import { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'motion/react';
import { Lock, Wifi, Battery, Signal, Bell } from 'lucide-react';

interface LockScreenProps {
  theme: { backgroundColor: string; textColor: string };
  onUnlock: () => void;
}

export function LockScreen({ theme, onUnlock }: LockScreenProps) {
  const [now, setNow] = useState(new Date());
  const [dragging, setDragging] = useState(false);
  const y = useMotionValue(0);
  const opacity = useTransform(y, [0, -200], [0, 1]);
  const scale = useTransform(y, [0, -200], [0.95, 1]);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const handleDragEnd = () => {
    setDragging(false);
    if (y.get() < -100) {
      animate(y, -400, { duration: 0.3 });
      setTimeout(onUnlock, 200);
    } else {
      animate(y, 0, { type: 'spring', stiffness: 400, damping: 30 });
    }
  };

  return (
    <motion.div
      className="size-full flex flex-col relative overflow-hidden"
      style={{ backgroundColor: theme.backgroundColor, color: theme.textColor }}
    >
      {/* Status Bar */}
      <motion.div
        style={{ opacity: useTransform(y, [-200, 0], [0, 1]) }}
        className="flex items-center justify-between px-6 pt-3 pb-2"
      >
        <div className="flex items-center gap-1 text-xs font-medium">
          <Signal className="w-4 h-4" />
          <span>OpenEye</span>
          <Wifi className="w-4 h-4 ml-1" />
        </div>
        <div className="flex items-center gap-2 text-xs">
          <Bell className="w-4 h-4" />
          <div className="flex items-center gap-1">
            <Battery className="w-4 h-4" />
            <span>87%</span>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <motion.div
        style={{ y, scale }}
        drag="y"
        dragConstraints={{ top: -400, bottom: 0 }}
        dragElastic={0.2}
        onDragStart={() => setDragging(true)}
        onDragEnd={handleDragEnd}
        className="flex-1 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing select-none"
      >
        {/* Time */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-center mb-4"
        >
          <div className="text-8xl font-light tabular-nums tracking-tight">
            {now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
          </div>
        </motion.div>

        {/* Date */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-xl opacity-70 mb-16"
        >
          {now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </motion.div>

        {/* Notification area */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="w-[90%] max-w-xs"
        >
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm mb-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shrink-0">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-sm">OpenEye</span>
                  <span className="text-xs opacity-50">now</span>
                </div>
                <p className="text-sm opacity-80">Welcome back! Ready to scan.</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Swipe indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: dragging ? 0 : 1 }}
          className="absolute bottom-12 left-0 right-0 text-center"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex flex-col items-center gap-2 opacity-50"
          >
            <Lock className="w-5 h-5" />
            <span className="text-sm font-medium">Swipe up to unlock</span>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Unlock overlay */}
      <motion.div
        style={{ opacity }}
        className="absolute inset-0 bg-gradient-to-b from-cyan-500/20 to-blue-500/20 pointer-events-none"
      />
    </motion.div>
  );
}
