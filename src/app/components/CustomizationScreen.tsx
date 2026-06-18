import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Palette, Smartphone, Upload, Image, Type, Grid3x3, Volume2, Sparkles, Shapes, Download, Star, TrendingUp, Flame, ChevronRight, Check, Play, Search, Bell, Crown, Zap, Shield, Wand as Wand2, Music, Monitor } from 'lucide-react';

interface CustomizationScreenProps {
  theme: {
    backgroundColor: string;
    primaryColor: string;
    accentColor: string;
    textColor: string;
  };
  setTheme: (theme: any) => void;
}

type Screen = 'splash' | 'home' | 'category';

const CATEGORIES = [
  { id: 'themes', name: 'Themes', icon: Palette, color: '#6366f1', description: 'System-wide color palettes' },
  { id: 'wallpapers', name: 'Wallpapers', icon: Monitor, color: '#0ea5e9', description: 'Home & lock screen art' },
  { id: 'designs', name: 'Designs', icon: Smartphone, color: '#ec4899', description: 'Device back designs' },
  { id: 'fonts', name: 'Fonts', icon: Type, color: '#f59e0b', description: 'Typography styles' },
  { id: 'widgets', name: 'Widgets', icon: Grid3x3, color: '#10b981', description: 'Home screen widgets' },
  { id: 'icons', name: 'Icon Packs', icon: Shapes, color: '#f97316', description: 'App icon collections' },
  { id: 'sounds', name: 'Sounds', icon: Music, color: '#8b5cf6', description: 'UI sound themes' },
  { id: 'effects', name: 'Effects', icon: Sparkles, color: '#14b8a6', description: 'Visual enhancements' },
];

const FEATURED = [
  { id: 'themes', name: 'Midnight Pro', subtitle: 'Premium Theme Pack', rating: 4.9, downloads: '12K', gradient: 'from-indigo-600 via-purple-600 to-pink-600', tag: 'HOT', icon: Crown },
  { id: 'effects', name: 'Glass UI Kit', subtitle: 'Frosted Glass Effects', rating: 4.8, downloads: '8.4K', gradient: 'from-cyan-500 via-blue-500 to-indigo-500', tag: 'NEW', icon: Shield },
  { id: 'wallpapers', name: 'Cosmic Series', subtitle: '24 Space Wallpapers', rating: 4.7, downloads: '15K', gradient: 'from-gray-900 via-purple-900 to-indigo-900', tag: 'TOP', icon: Zap },
];

const PRESETS = [
  { name: 'Midnight Blue', colors: { backgroundColor: '#1a1a2e', primaryColor: '#0f3460', accentColor: '#16213e', textColor: '#eaeaea' } },
  { name: 'Forest Green', colors: { backgroundColor: '#1b2a1f', primaryColor: '#0d3d2c', accentColor: '#1a4d3a', textColor: '#e8f5e9' } },
  { name: 'Purple Dream', colors: { backgroundColor: '#2d1b3d', primaryColor: '#4a1f6b', accentColor: '#3d2554', textColor: '#f3e5f5' } },
  { name: 'Crimson Night', colors: { backgroundColor: '#2a1215', primaryColor: '#5a1a1f', accentColor: '#3d1418', textColor: '#ffebee' } },
  { name: 'Ocean Depths', colors: { backgroundColor: '#0a1929', primaryColor: '#0d3a52', accentColor: '#132f4c', textColor: '#e3f2fd' } },
  { name: 'Sunset Orange', colors: { backgroundColor: '#2d1810', primaryColor: '#5d3a1a', accentColor: '#442a14', textColor: '#fff3e0' } },
];

const WALLPAPERS = [
  { name: 'Abstract Geometry', image: 'linear-gradient(135deg,#667eea,#764ba2)' },
  { name: 'Minimal Lines', image: 'linear-gradient(180deg,#1e3c72,#2a5298)' },
  { name: 'Cosmic Night', image: 'linear-gradient(180deg,#0f2027,#203a43,#2c5364)' },
  { name: 'Sunrise Gradient', image: 'linear-gradient(120deg,#f093fb,#f5576c)' },
  { name: 'Ocean Waves', image: 'linear-gradient(90deg,#4facfe,#00f2fe)' },
  { name: 'Forest Dawn', image: 'linear-gradient(135deg,#2afadf,#4c83ff)' },
  { name: 'Deep Space', image: 'linear-gradient(180deg,#000,#434343)' },
  { name: 'Neon Lights', image: 'linear-gradient(43deg,#4158D0,#C850C0,#FFCC70)' },
];

const DESIGNS = [
  { name: 'Gradient Wave', gradient: 'from-blue-500 via-purple-500 to-pink-500' },
  { name: 'Northern Lights', gradient: 'from-green-400 via-blue-500 to-purple-600' },
  { name: 'Fire Ember', gradient: 'from-yellow-400 via-red-500 to-pink-600' },
  { name: 'Ocean Breeze', gradient: 'from-cyan-400 via-blue-500 to-indigo-600' },
  { name: 'Sunset Sky', gradient: 'from-orange-400 via-pink-500 to-purple-600' },
  { name: 'Forest Mist', gradient: 'from-emerald-400 via-teal-500 to-cyan-600' },
  { name: 'Rose Gold', gradient: 'from-pink-300 via-rose-400 to-amber-400' },
  { name: 'Galaxy Black', gradient: 'from-gray-900 via-purple-900 to-gray-900' },
];

const FONTS = [
  { name: 'System Default', family: 'system-ui', preview: 'Aa' },
  { name: 'Modern Sans', family: 'Inter, sans-serif', preview: 'Aa' },
  { name: 'Classic Serif', family: 'Georgia, serif', preview: 'Aa' },
  { name: 'Monospace', family: 'monospace', preview: 'Aa' },
  { name: 'Rounded', family: 'sans-serif', preview: 'Aa' },
  { name: 'Elegant', family: 'serif', preview: 'Aa' },
];

const WIDGETS = [
  { name: 'Clock Large', type: 'Digital Clock', icon: '🕐' },
  { name: 'Quick Stats', type: 'Statistics', icon: '📊' },
  { name: 'Recent Scans', type: 'History', icon: '📋' },
  { name: 'Translation', type: 'Quick Access', icon: '🌐' },
  { name: 'Battery Info', type: 'System', icon: '🔋' },
  { name: 'Calendar', type: 'Date Widget', icon: '📅' },
];

const ICON_PACKS = [
  { name: 'Default', style: 'Outline', colors: ['#94a3b8', '#64748b', '#475569'] },
  { name: 'Filled', style: 'Solid', colors: ['#6366f1', '#818cf8', '#a5b4fc'] },
  { name: 'Rounded', style: 'Rounded', colors: ['#10b981', '#34d399', '#6ee7b7'] },
  { name: 'Sharp', style: 'Sharp', colors: ['#f59e0b', '#fbbf24', '#fcd34d'] },
  { name: 'Minimal', style: 'Minimal', colors: ['#e2e8f0', '#cbd5e1', '#94a3b8'] },
  { name: 'Colorful', style: 'Gradient', colors: ['#ec4899', '#8b5cf6', '#06b6d4'] },
];

const SOUNDS = [
  { name: 'Default', theme: 'Standard', icon: '🔔' },
  { name: 'Minimal Clicks', theme: 'Subtle', icon: '🎵' },
  { name: 'Sci-Fi Effects', theme: 'Futuristic', icon: '⚡' },
  { name: 'Nature Sounds', theme: 'Organic', icon: '🌿' },
  { name: 'Retro Beeps', theme: 'Classic', icon: '🎮' },
  { name: 'Silent Mode', theme: 'No Sound', icon: '🔇' },
];

const EFFECTS = [
  { name: 'Blur Background', description: 'Blur effect behind modals', icon: Shield },
  { name: 'Parallax Scroll', description: 'Depth scrolling effect', icon: Zap },
  { name: 'Smooth Animations', description: 'Enhanced transitions', icon: Wand2 },
  { name: 'Particle Effects', description: 'Floating particles', icon: Sparkles },
  { name: 'Glass Morphism', description: 'Frosted glass UI', icon: Palette },
  { name: 'Neon Glow', description: 'Glowing accents', icon: Flame },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

export function CustomizationScreen({ theme, setTheme }: CustomizationScreenProps) {
  const [screen, setScreen] = useState<Screen>('splash');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'featured' | 'categories' | 'new'>('featured');
  const [installed, setInstalled] = useState<Set<string>>(new Set());

  useEffect(() => {
    const t = setTimeout(() => setScreen('home'), 2200);
    return () => clearTimeout(t);
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setUploadedPhoto(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const toggleInstall = (id: string) => {
    setInstalled(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // ─── Splash ──────────────────────────────────────────────────────────────────
  if (screen === 'splash') {
    return (
      <div className="size-full flex flex-col items-center justify-center" style={{ backgroundColor: '#0d0d1a' }}>
        <motion.div
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center gap-4"
        >
          {/* Logo ring */}
          <div className="relative w-24 h-24">
            <motion.div
              className="absolute inset-0 rounded-[28px] bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              style={{ filter: 'blur(12px)', opacity: 0.6 }}
            />
            <div className="relative w-24 h-24 rounded-[28px] bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center shadow-2xl">
              <Palette className="w-12 h-12 text-white" />
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-center"
          >
            <p className="text-white text-2xl font-bold tracking-tight">OpenEye Store</p>
            <p className="text-white/40 text-sm mt-1">Customization Catalog</p>
          </motion.div>
        </motion.div>

        {/* Loading dots */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="absolute bottom-16 flex gap-2"
        >
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-white/40"
              animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.3, 1] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </motion.div>
      </div>
    );
  }

  // ─── Category Detail ──────────────────────────────────────────────────────────
  if (screen === 'category' && selectedCategory) {
    const cat = CATEGORIES.find(c => c.id === selectedCategory)!;

    const renderItems = () => {
      switch (selectedCategory) {
        case 'themes':
          return (
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-2 gap-3">
              {PRESETS.map(p => (
                <motion.button
                  key={p.name}
                  variants={itemVariants}
                  onClick={() => setTheme(p.colors)}
                  className="relative p-3 rounded-2xl border transition-all"
                  style={{
                    backgroundColor: p.colors.backgroundColor,
                    borderColor: theme.backgroundColor === p.colors.backgroundColor ? '#22c55e' : 'rgba(255,255,255,0.08)',
                  }}
                >
                  <div className="flex gap-1.5 mb-2">
                    {[p.colors.primaryColor, p.colors.accentColor, p.colors.textColor].map((c, i) => (
                      <div key={i} className="w-5 h-5 rounded-full" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                  <p className="text-left text-sm font-semibold" style={{ color: p.colors.textColor }}>{p.name}</p>
                  {theme.backgroundColor === p.colors.backgroundColor && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </motion.button>
              ))}
            </motion.div>
          );

        case 'wallpapers':
          return (
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-3">
              <motion.label variants={itemVariants} className="flex items-center gap-4 p-4 rounded-2xl border-2 border-dashed border-white/20 bg-white/5 cursor-pointer">
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                <Upload className="w-8 h-8 opacity-50" />
                <div>
                  <p className="font-semibold">Upload Custom Wallpaper</p>
                  <p className="text-xs opacity-50">JPG, PNG, WEBP supported</p>
                </div>
              </motion.label>
              <div className="grid grid-cols-2 gap-3">
                {WALLPAPERS.map(w => (
                  <motion.div key={w.name} variants={itemVariants} className="rounded-2xl overflow-hidden border border-white/10 cursor-pointer group">
                    <div className="h-28 transition-transform group-hover:scale-105" style={{ background: w.image }} />
                    <div className="p-2 bg-white/5">
                      <p className="text-xs font-semibold">{w.name}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          );

        case 'designs':
          return (
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-2 gap-3">
              {DESIGNS.map(d => (
                <motion.div key={d.name} variants={itemVariants} className="rounded-2xl overflow-hidden border border-white/10 cursor-pointer group">
                  <div className={`h-24 bg-gradient-to-br ${d.gradient} transition-transform group-hover:scale-105`} />
                  <div className="p-2 bg-white/5">
                    <p className="text-xs font-semibold">{d.name}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          );

        case 'fonts':
          return (
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-2">
              {FONTS.map(f => (
                <motion.button key={f.name} variants={itemVariants} className="w-full p-4 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-between hover:bg-white/10 transition-colors">
                  <div>
                    <p className="text-xs opacity-50 mb-1">{f.name}</p>
                    <p style={{ fontFamily: f.family }}>The quick brown fox</p>
                  </div>
                  <span style={{ fontFamily: f.family }} className="text-3xl opacity-30">{f.preview}</span>
                </motion.button>
              ))}
            </motion.div>
          );

        case 'widgets':
          return (
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-2 gap-3">
              {WIDGETS.map(w => (
                <motion.div key={w.name} variants={itemVariants} className="p-4 rounded-2xl border border-white/10 bg-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                  <p className="text-3xl mb-2">{w.icon}</p>
                  <p className="font-semibold text-sm">{w.name}</p>
                  <p className="text-xs opacity-50">{w.type}</p>
                </motion.div>
              ))}
            </motion.div>
          );

        case 'icons':
          return (
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-2 gap-3">
              {ICON_PACKS.map(p => (
                <motion.div key={p.name} variants={itemVariants} className="p-4 rounded-2xl border border-white/10 bg-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                  <div className="flex gap-2 mb-3">
                    {p.colors.map((c, i) => <div key={i} className="w-6 h-6 rounded-full" style={{ backgroundColor: c }} />)}
                  </div>
                  <p className="font-semibold text-sm">{p.name}</p>
                  <p className="text-xs opacity-50">{p.style}</p>
                </motion.div>
              ))}
            </motion.div>
          );

        case 'sounds':
          return (
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-2">
              {SOUNDS.map(s => (
                <motion.button key={s.name} variants={itemVariants} className="w-full p-4 rounded-2xl border border-white/10 bg-white/5 flex items-center gap-4 hover:bg-white/10 transition-colors">
                  <span className="text-2xl">{s.icon}</span>
                  <div className="flex-1 text-left">
                    <p className="font-semibold">{s.name}</p>
                    <p className="text-xs opacity-50">{s.theme}</p>
                  </div>
                  <Play className="w-5 h-5 opacity-40" />
                </motion.button>
              ))}
            </motion.div>
          );

        case 'effects':
          return (
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-2">
              {EFFECTS.map(e => {
                const Icon = e.icon;
                return (
                  <motion.div key={e.name} variants={itemVariants} className="p-4 rounded-2xl border border-white/10 bg-white/5 flex items-center gap-4">
                    <Icon className="w-5 h-5 opacity-60 shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold">{e.name}</p>
                      <p className="text-xs opacity-50">{e.description}</p>
                    </div>
                    <label className="relative inline-block w-11 h-6 shrink-0">
                      <input type="checkbox" className="opacity-0 w-0 h-0 peer" defaultChecked />
                      <span className="absolute inset-0 bg-white/20 rounded-full cursor-pointer peer-checked:bg-indigo-500 transition-all">
                        <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5" />
                      </span>
                    </label>
                  </motion.div>
                );
              })}
            </motion.div>
          );

        default:
          return null;
      }
    };

    return (
      <motion.div
        key="category"
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="size-full flex flex-col"
        style={{ backgroundColor: theme.backgroundColor, color: theme.textColor }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-white/10">
          <button onClick={() => setScreen('home')} className="p-2 rounded-full hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <p className="font-bold">{cat.name}</p>
            <p className="text-xs opacity-50">{cat.description}</p>
          </div>
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: cat.color + '33' }}>
            <cat.icon className="w-4 h-4" style={{ color: cat.color }} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {renderItems()}
        </div>
      </motion.div>
    );
  }

  // ─── Home / Store ─────────────────────────────────────────────────────────────
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="home"
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="size-full flex flex-col"
        style={{ backgroundColor: theme.backgroundColor, color: theme.textColor }}
      >
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="flex items-center gap-3 px-4 pt-4 pb-3"
        >
          <Link to="/" className="p-2 rounded-full hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1">
            <p className="font-bold text-lg">OpenEye Store</p>
            <p className="text-xs opacity-40">Customization Catalog</p>
          </div>
          <button className="p-2 rounded-full hover:bg-white/10 transition-colors">
            <Search className="w-5 h-5 opacity-60" />
          </button>
          <button className="p-2 rounded-full hover:bg-white/10 transition-colors">
            <Bell className="w-5 h-5 opacity-60" />
          </button>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="flex gap-1 px-4 pb-2 border-b border-white/10"
        >
          {(['featured', 'categories', 'new'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="relative px-4 py-1.5 rounded-full text-sm font-semibold capitalize transition-colors"
              style={{ color: activeTab === tab ? '#fff' : undefined, opacity: activeTab === tab ? 1 : 0.4 }}
            >
              {activeTab === tab && (
                <motion.div
                  layoutId="tab-pill"
                  className="absolute inset-0 rounded-full bg-white/15"
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                />
              )}
              <span className="relative">{tab}</span>
            </button>
          ))}
        </motion.div>

        <div className="flex-1 overflow-y-auto">
          {activeTab === 'featured' && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="p-4 space-y-6"
            >
              {/* Featured banner cards */}
              <div className="space-y-3">
                {FEATURED.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.id}
                      variants={itemVariants}
                      onClick={() => { setSelectedCategory(item.id); setScreen('category'); }}
                      className={`w-full rounded-2xl overflow-hidden bg-gradient-to-r ${item.gradient} p-4 flex items-center gap-4 text-left shadow-lg cursor-pointer`}
                    >
                      <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold bg-white/25 text-white px-2 py-0.5 rounded-full">{item.tag}</span>
                        </div>
                        <p className="text-white font-bold truncate">{item.name}</p>
                        <p className="text-white/70 text-xs">{item.subtitle}</p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-300 fill-yellow-300" />
                            <span className="text-white/80 text-xs">{item.rating}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Download className="w-3 h-3 text-white/60" />
                            <span className="text-white/60 text-xs">{item.downloads}</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={e => { e.stopPropagation(); toggleInstall(item.id); }}
                        className="shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-all"
                        style={{ backgroundColor: installed.has(item.id) ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.9)', color: installed.has(item.id) ? 'white' : '#1a1a2e' }}
                      >
                        {installed.has(item.id) ? '✓' : 'Get'}
                      </button>
                    </motion.div>
                  );
                })}
              </div>

              {/* Trending section */}
              <div>
                <motion.div variants={itemVariants} className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-orange-400" />
                    <span className="font-bold">Trending Now</span>
                  </div>
                  <button className="flex items-center gap-1 text-xs opacity-50">See all <ChevronRight className="w-3 h-3" /></button>
                </motion.div>
                <div className="grid grid-cols-3 gap-2">
                  {CATEGORIES.slice(0, 6).map((cat, i) => (
                    <motion.button
                      key={cat.id}
                      variants={itemVariants}
                      onClick={() => { setSelectedCategory(cat.id); setScreen('category'); }}
                      className="p-3 rounded-2xl border border-white/10 bg-white/5 flex flex-col items-center gap-2 hover:bg-white/10 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: cat.color + '22' }}>
                        <cat.icon className="w-5 h-5" style={{ color: cat.color }} />
                      </div>
                      <p className="text-xs font-semibold text-center leading-tight">{cat.name}</p>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* New releases */}
              <div>
                <motion.div variants={itemVariants} className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-pink-400" />
                    <span className="font-bold">New Releases</span>
                  </div>
                </motion.div>
                <div className="space-y-2">
                  {CATEGORIES.slice(2, 6).map((cat, i) => (
                    <motion.button
                      key={cat.id}
                      variants={itemVariants}
                      onClick={() => { setSelectedCategory(cat.id); setScreen('category'); }}
                      className="w-full flex items-center gap-3 p-3 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: cat.color + '22' }}>
                        <cat.icon className="w-5 h-5" style={{ color: cat.color }} />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-semibold text-sm">{cat.name}</p>
                        <p className="text-xs opacity-40">{cat.description}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        <span className="text-xs opacity-50">{(4.5 + i * 0.1).toFixed(1)}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 opacity-30" />
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'categories' && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="p-4 grid grid-cols-2 gap-3"
            >
              {CATEGORIES.map(cat => (
                <motion.button
                  key={cat.id}
                  variants={itemVariants}
                  onClick={() => { setSelectedCategory(cat.id); setScreen('category'); }}
                  className="p-4 rounded-2xl border border-white/10 bg-white/5 flex flex-col items-start gap-3 hover:bg-white/10 transition-colors text-left"
                >
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: cat.color + '22' }}>
                    <cat.icon className="w-6 h-6" style={{ color: cat.color }} />
                  </div>
                  <div>
                    <p className="font-bold text-sm">{cat.name}</p>
                    <p className="text-xs opacity-40 mt-0.5">{cat.description}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs opacity-40">
                    <ChevronRight className="w-3 h-3" />
                    <span>Browse</span>
                  </div>
                </motion.button>
              ))}
            </motion.div>
          )}

          {activeTab === 'new' && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="p-4 space-y-3"
            >
              <motion.div variants={itemVariants} className="p-3 rounded-2xl bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/20">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-4 h-4 text-indigo-400" />
                  <span className="text-sm font-bold text-indigo-300">What's New</span>
                </div>
                <p className="text-xs opacity-60">Latest additions to the OpenEye Store</p>
              </motion.div>
              {[...CATEGORIES].reverse().map((cat, i) => (
                <motion.button
                  key={cat.id}
                  variants={itemVariants}
                  onClick={() => { setSelectedCategory(cat.id); setScreen('category'); }}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: cat.color + '22' }}>
                    <cat.icon className="w-6 h-6" style={{ color: cat.color }} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-bold text-sm">{cat.name}</p>
                    <p className="text-xs opacity-40">{cat.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {['New', 'Updated'][i % 2] === 'New'
                        ? <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full font-semibold">NEW</span>
                        : <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full font-semibold">UPDATED</span>
                      }
                    </div>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); toggleInstall(cat.id); }}
                    className="shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all"
                    style={{
                      borderColor: installed.has(cat.id) ? '#22c55e' : 'rgba(255,255,255,0.2)',
                      color: installed.has(cat.id) ? '#22c55e' : undefined,
                      backgroundColor: installed.has(cat.id) ? 'rgba(34,197,94,0.1)' : 'transparent',
                    }}
                  >
                    {installed.has(cat.id) ? '✓ Got' : 'Get'}
                  </button>
                </motion.button>
              ))}
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
