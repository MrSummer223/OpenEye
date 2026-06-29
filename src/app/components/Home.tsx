import { Link } from 'react-router';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { ScanLine, Languages, BookOpen, Settings, Store, Eye, ScanText, AudioLines, Globe as Globe2, SlidersHorizontal, LayoutGrid } from 'lucide-react';
import type { Scan } from '../App';

interface HomeProps {
  theme: { backgroundColor: string; primaryColor: string; accentColor: string; textColor: string };
  savedScans: Scan[];
  iconPack: string;
  wallpaper: string | null;
}

type IconStyle = 'outline' | 'filled' | 'rounded' | 'sharp' | 'minimal' | 'colorful';

const ICON_PACK_STYLES: Record<string, IconStyle> = {
  Default: 'outline',
  Filled: 'filled',
  Rounded: 'rounded',
  Sharp: 'sharp',
  Minimal: 'minimal',
  Colorful: 'colorful',
};

const primaryModes = [
  { name: 'Scan', icon: ScanLine, detailIcon: ScanText, path: '/scan', desc: 'Capture & read text', hue: 200 },
  { name: 'Read', icon: BookOpen, detailIcon: AudioLines, path: '/read', desc: 'Listen to any text', hue: 160 },
  { name: 'Translate', icon: Languages, detailIcon: Globe2, path: '/translate', desc: 'Live translation', hue: 40 },
];

const utilities = [
  { name: 'Catalog', icon: Store, detailIcon: LayoutGrid, path: '/customize', hue: 340 },
  { name: 'Settings', icon: Settings, detailIcon: SlidersHorizontal, path: '/settings', hue: 220 },
];

function hexToRgb(hex: string): [number, number, number] {
  const m = hex.replace('#', '');
  return [parseInt(m.slice(0, 2), 16), parseInt(m.slice(2, 4), 16), parseInt(m.slice(4, 6), 16)];
}

function mix(a: string, b: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  return `rgb(${Math.round(r1 + (r2 - r1) * t)}, ${Math.round(g1 + (g2 - g1) * t)}, ${Math.round(b1 + (b2 - b1) * t)})`;
}

function IconTile({
  mode,
  theme,
  iconStyle,
  size,
  hasWallpaper,
}: {
  mode: { icon: typeof ScanLine; detailIcon: typeof ScanLine; hue: number; name: string };
  theme: HomeProps['theme'];
  iconStyle: IconStyle;
  size: 'lg' | 'sm';
  hasWallpaper: boolean;
}) {
  const primary = theme.primaryColor;
  const accent = theme.accentColor;
  const iconSize = size === 'lg' ? 'w-7 h-7' : 'w-5 h-5';
  const container = size === 'lg' ? 'w-14 h-14 rounded-2xl' : 'w-11 h-11 rounded-xl';

  // Container: theme-driven gradient, with glass backdrop if wallpaper present
  const bg = iconStyle === 'minimal'
    ? `linear-gradient(135deg, ${primary}18, ${accent}18)`
    : iconStyle === 'colorful'
    ? `linear-gradient(135deg, hsl(${mode.hue} 80% 55%), hsl(${(mode.hue + 40) % 360} 75% 50%))`
    : `linear-gradient(135deg, ${primary}, ${accent})`;

  const glyphColor = iconStyle === 'minimal' ? primary : '#ffffff';
  const strokeW = iconStyle === 'filled' || iconStyle === 'colorful' ? 2.5 : 1.75;
  const radius = iconStyle === 'sharp' ? 'rounded-md' : iconStyle === 'rounded' ? 'rounded-3xl' : container.match(/rounded-(\S+)/)?.[0] || 'rounded-2xl';

  return (
    <div
      className={`${size === 'lg' ? 'w-14 h-14' : 'w-11 h-11'} ${radius} flex items-center justify-center shrink-0 relative overflow-hidden`}
      style={{
        background: bg,
        boxShadow: iconStyle === 'minimal'
          ? `inset 0 0 0 1px ${primary}30`
          : `0 4px 14px ${primary}40, inset 0 1px 0 rgba(255,255,255,0.25)`,
        backdropFilter: hasWallpaper ? 'blur(12px)' : undefined,
      }}
    >
      {/* Sheen */}
      {iconStyle !== 'minimal' && (
        <div
          className="absolute inset-0 opacity-40"
          style={{ background: 'linear-gradient(160deg, rgba(255,255,255,0.3) 0%, transparent 50%)' }}
        />
      )}
      {/* Detailed glyph: main icon + subtle detail icon overlay */}
      <div className="relative flex items-center justify-center">
        <mode.icon
          className={iconSize}
          style={{ color: glyphColor, strokeWidth: strokeW }}
        />
      </div>
    </div>
  );
}

export function Home({ theme, savedScans, iconPack, wallpaper }: HomeProps) {
  const [now, setNow] = useState(new Date());
  const iconStyle = ICON_PACK_STYLES[iconPack] || 'outline';
  const hasWallpaper = !!wallpaper;

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
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.accentColor})`,
              boxShadow: `0 2px 8px ${theme.primaryColor}40`,
            }}
          >
            <Eye className="w-5 h-5 text-white" strokeWidth={2} />
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
                className="block p-4 rounded-2xl border transition-colors"
                style={{
                  backgroundColor: hasWallpaper ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.05)',
                  borderColor: hasWallpaper ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.1)',
                  backdropFilter: hasWallpaper ? 'blur(16px)' : undefined,
                }}
              >
                <div className="flex items-center gap-4">
                  <IconTile mode={mode} theme={theme} iconStyle={iconStyle} size="lg" hasWallpaper={hasWallpaper} />
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
              className="block p-3 rounded-2xl border transition-colors"
              style={{
                backgroundColor: hasWallpaper ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.05)',
                borderColor: hasWallpaper ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.1)',
                backdropFilter: hasWallpaper ? 'blur(16px)' : undefined,
              }}
            >
              <div className="flex items-center gap-3">
                <ScanLine className="w-4 h-4 opacity-50 shrink-0" style={{ color: theme.primaryColor }} />
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
                className="block p-4 rounded-2xl border text-center transition-colors"
                style={{
                  backgroundColor: hasWallpaper ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.05)',
                  borderColor: hasWallpaper ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.1)',
                  backdropFilter: hasWallpaper ? 'blur(16px)' : undefined,
                }}
              >
                <div className="flex justify-center mb-2">
                  <IconTile mode={util} theme={theme} iconStyle={iconStyle} size="sm" hasWallpaper={hasWallpaper} />
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
