import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Flame, Camera, CircleAlert as AlertCircle, Activity, Crosshair } from 'lucide-react';
import { useCamera } from '../../hooks/useCamera';

interface HeatVisionModeProps {
  theme: { backgroundColor: string; primaryColor: string; accentColor: string; textColor: string };
}

type Palette = 'inferno' | 'arctic' | 'predator';

const PALETTES: Record<Palette, { label: string; map: (t: number) => [number, number, number] }> = {
  inferno: {
    label: 'Inferno',
    map: (t) => {
      const r = Math.min(255, Math.max(0, 255 * Math.pow(t, 0.5)));
      const g = Math.min(255, Math.max(0, 255 * Math.pow(t, 2.2)));
      const b = Math.min(255, Math.max(0, 255 * Math.pow(t, 6) * 0.7));
      return [r, g, b];
    },
  },
  arctic: {
    label: 'Arctic',
    map: (t) => {
      const r = Math.min(255, Math.max(0, 255 * Math.pow(t, 2.5)));
      const g = Math.min(255, Math.max(0, 255 * Math.pow(t, 0.8)));
      const b = Math.min(255, Math.max(0, 255 * (0.3 + 0.7 * Math.pow(t, 0.4))));
      return [r, g, b];
    },
  },
  predator: {
    label: 'Predator',
    map: (t) => {
      const v = Math.min(255, Math.max(0, 255 * t));
      return [v, v, v];
    },
  },
};

const slideUp = { initial: { y: 20, opacity: 0 }, animate: { y: 0, opacity: 1 } };

export function HeatVisionMode({ theme }: HeatVisionModeProps) {
  const { videoRef, status: camStatus, error: camError, startCamera, stopCamera } = useCamera();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const [palette, setPalette] = useState<Palette>('inferno');
  const [intensity, setIntensity] = useState(1);
  const [hotspots, setHotspots] = useState<{ x: number; y: number; temp: number }[]>([]);
  const [avgTemp, setAvgTemp] = useState(0);
  const [maxTemp, setMaxTemp] = useState(0);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [startCamera, stopCamera]);

  const processFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(processFrame);
      return;
    }

    const w = canvas.width = 160;
    const h = canvas.height = 120;
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
    ctx.drawImage(video, 0, 0, w, h);
    const imageData = ctx.getImageData(0, 0, w, h);
    const data = imageData.data;
    const map = PALETTES[palette].map;

    let sum = 0;
    let max = 0;
    let maxX = 0;
    let maxY = 0;
    const grid: number[] = [];

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      const t = Math.min(1, lum * intensity);
      sum += t;
      if (t > max) {
        max = t;
        maxX = (i / 4) % w;
        maxY = Math.floor((i / 4) / w);
      }
      grid.push(t);
      const [tr, tg, tb] = map(t);
      data[i] = tr;
      data[i + 1] = tg;
      data[i + 2] = tb;
    }

    ctx.putImageData(imageData, 0, 0);

    const avg = sum / (w * h);
    setAvgTemp(avg);
    setMaxTemp(max);

    // Detect hotspots: find local maxima above threshold
    const threshold = avg + 0.15;
    const spots: { x: number; y: number; temp: number }[] = [];
    const cellW = 8;
    const cellH = 8;
    for (let cy = 0; cy < h; cy += cellH) {
      for (let cx = 0; cx < w; cx += cellW) {
        let cellMax = 0;
        let mx = cx;
        let my = cy;
        for (let y = cy; y < Math.min(cy + cellH, h); y++) {
          for (let x = cx; x < Math.min(cx + cellW, w); x++) {
            const v = grid[y * w + x];
            if (v > cellMax) {
              cellMax = v;
              mx = x;
              my = y;
            }
          }
        }
        if (cellMax > threshold) {
          spots.push({ x: mx / w, y: my / h, temp: cellMax });
        }
      }
    }
    spots.sort((a, b) => b.temp - a.temp);
    setHotspots(spots.slice(0, 4));

    rafRef.current = requestAnimationFrame(processFrame);
  }, [palette, intensity, videoRef]);

  useEffect(() => {
    if (camStatus === 'active') {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(processFrame);
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [camStatus, processFrame]);

  const tempLabel = (t: number) => {
    const c = Math.round(20 + t * 30);
    return `${c}°C`;
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
        {...slideUp}
        transition={{ delay: 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-center justify-between p-4 border-b border-white/10"
      >
        <div className="flex items-center gap-3">
          <Link to="/" className="p-2 rounded-full bg-gradient-to-br from-orange-500/80 to-red-500/80 hover:from-orange-500 hover:to-red-500 text-white transition-colors shadow-lg">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h2 className="text-xl font-semibold">Heat Vision</h2>
            <p className="text-xs opacity-70">Thermal signature detection</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/15 border border-orange-500/30">
          <Flame className="w-4 h-4 text-orange-400" />
          <span className="text-xs font-semibold text-orange-400">LIVE</span>
        </div>
      </motion.div>

      <div className="flex-1 overflow-y-auto">
        {/* Thermal view */}
        <motion.div
          {...slideUp}
          transition={{ delay: 0.1, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="p-4"
        >
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-black flex items-center justify-center">
            {/* Hidden source video */}
            <video
              ref={videoRef}
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover opacity-0"
            />

            {/* Thermal canvas */}
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full object-cover"
              style={{ filter: 'contrast(1.15) saturate(1.3)' }}
            />

            {/* States */}
            <AnimatePresence mode="wait">
              {camStatus === 'requesting' && (
                <motion.div key="req" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center z-10">
                  <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-sm opacity-70">Activating thermal sensor…</p>
                </motion.div>
              )}
              {camStatus === 'error' && (
                <motion.div key="err" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center p-6 z-10">
                  <AlertCircle className="w-12 h-12 mx-auto mb-3 text-red-400" />
                  <p className="text-sm text-red-400 mb-1">Sensor unavailable</p>
                  <p className="text-xs opacity-60">{camError}</p>
                </motion.div>
              )}
              {camStatus === 'idle' && (
                <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center p-6 z-10">
                  <Camera className="w-16 h-16 mx-auto mb-4 opacity-40" />
                  <p className="opacity-60 text-sm">Starting sensor…</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Hotspot markers + reticle */}
            {camStatus === 'active' && (
              <>
                {hotspots.map((spot, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 0.9 }}
                    transition={{ delay: i * 0.05 }}
                    className="absolute pointer-events-none z-20"
                    style={{ left: `${spot.x * 100}%`, top: `${spot.y * 100}%`, transform: 'translate(-50%, -50%)' }}
                  >
                    <div className="relative">
                      <motion.div
                        animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0.2, 0.6] }}
                        transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.2 }}
                        className="absolute inset-0 -m-2 rounded-full border-2 border-orange-400"
                      />
                      <Crosshair className="w-6 h-6 text-orange-300 drop-shadow-[0_0_4px_rgba(0,0,0,0.8)]" />
                      <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-orange-200 whitespace-nowrap drop-shadow-[0_0_3px_rgba(0,0,0,1)]">
                        {tempLabel(spot.temp)}
                      </span>
                    </div>
                  </motion.div>
                ))}

                {/* Corner reticle */}
                <div className="absolute inset-6 border border-orange-400/40 rounded-xl pointer-events-none z-10">
                  {[
                    'top-0 left-0 border-t-2 border-l-2 -mt-1 -ml-1',
                    'top-0 right-0 border-t-2 border-r-2 -mt-1 -mr-1',
                    'bottom-0 left-0 border-b-2 border-l-2 -mb-1 -ml-1',
                    'bottom-0 right-0 border-b-2 border-r-2 -mb-1 -mr-1',
                  ].map((cls, i) => (
                    <div key={i} className={`absolute w-5 h-5 border-orange-400 ${cls}`} />
                  ))}
                </div>

                {/* Scan line */}
                <motion.div
                  className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-orange-400 to-transparent z-10 pointer-events-none"
                  animate={{ top: ['0%', '100%', '0%'] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
                />
              </>
            )}
          </div>

          {/* Live readout */}
          {camStatus === 'active' && (
            <motion.div
              {...slideUp}
              transition={{ delay: 0.18, duration: 0.4 }}
              className="mt-3 grid grid-cols-3 gap-2"
            >
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                <Activity className="w-4 h-4 mx-auto mb-1 text-orange-400" />
                <p className="text-[10px] opacity-50 uppercase tracking-wider">Avg</p>
                <p className="text-sm font-bold tabular-nums">{tempLabel(avgTemp)}</p>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                <Flame className="w-4 h-4 mx-auto mb-1 text-red-400" />
                <p className="text-[10px] opacity-50 uppercase tracking-wider">Max</p>
                <p className="text-sm font-bold tabular-nums">{tempLabel(maxTemp)}</p>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                <Crosshair className="w-4 h-4 mx-auto mb-1 text-amber-400" />
                <p className="text-[10px] opacity-50 uppercase tracking-wider">Spots</p>
                <p className="text-sm font-bold tabular-nums">{hotspots.length}</p>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Controls */}
        <motion.div
          {...slideUp}
          transition={{ delay: 0.22, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="px-4 pb-4"
        >
          {/* Palette selector */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-3">
            <p className="text-xs font-semibold opacity-70 mb-3 uppercase tracking-wider">Color Palette</p>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(PALETTES) as Palette[]).map((p) => (
                <motion.button
                  key={p}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setPalette(p)}
                  className={`py-2.5 rounded-lg text-xs font-semibold transition-all ${
                    palette === p
                      ? 'bg-orange-500 text-white shadow-lg'
                      : 'bg-white/10 text-white/70 hover:bg-white/15'
                  }`}
                >
                  {PALETTES[p].label}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Intensity slider */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold opacity-70 uppercase tracking-wider">Sensitivity</p>
              <span className="text-xs font-bold tabular-nums text-orange-400">{Math.round(intensity * 100)}%</span>
            </div>
            <input
              type="range"
              min={0.5}
              max={2.5}
              step={0.1}
              value={intensity}
              onChange={(e) => setIntensity(parseFloat(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer bg-white/10 accent-orange-500"
            />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
