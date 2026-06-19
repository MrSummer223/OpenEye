import { BrowserRouter, Routes, Route } from 'react-router';
import { useState, useEffect, useCallback } from 'react';
import { Home } from './components/Home';
import { ScanMode } from './components/ScanMode';
import { TranslationMode } from './components/TranslationMode';
import { ReadingMode } from './components/ReadingMode';
import { CustomizationScreen } from './components/CustomizationScreen';
import { SystemSettings } from './components/SystemSettings';
import { AuthScreen } from './components/AuthScreen';
import { LockScreen } from './components/LockScreen';
import { StatusBar } from './components/StatusBar';
import { ControlCenter } from './components/ControlCenter';
import { AuthProvider, useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';
import { Loader as Loader2 } from 'lucide-react';

export interface Scan {
  id: string;
  text: string;
  date: string;
}

export interface AppCustomization {
  theme: {
    backgroundColor: string;
    primaryColor: string;
    accentColor: string;
    textColor: string;
  };
  wallpaper: string | null;
  font: string;
  iconPack: string;
  installedItems: Set<string>;
}

const DEFAULT_CUSTOMIZATION: AppCustomization = {
  theme: {
    backgroundColor: '#1a1a2e',
    primaryColor: '#0f3460',
    accentColor: '#16213e',
    textColor: '#eaeaea',
  },
  wallpaper: null,
  font: 'system-ui',
  iconPack: 'default',
  installedItems: new Set(),
};

function loadLocalCustomization(): AppCustomization {
  try {
    const saved = localStorage.getItem('openeye_customization');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...DEFAULT_CUSTOMIZATION,
        ...parsed,
        installedItems: new Set(parsed.installedItems || []),
      };
    }
  } catch {}
  return DEFAULT_CUSTOMIZATION;
}

function saveLocalCustomization(customization: AppCustomization) {
  localStorage.setItem('openeye_customization', JSON.stringify({
    ...customization,
    installedItems: Array.from(customization.installedItems),
  }));
}

function loadLocalScans(): Scan[] {
  try {
    const saved = localStorage.getItem('openeye_scans');
    if (saved) return JSON.parse(saved);
  } catch {}
  return [];
}

function saveLocalScans(scans: Scan[]) {
  localStorage.setItem('openeye_scans', JSON.stringify(scans));
}

function AppContent() {
  const { user, loading: authLoading } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [isLocked, setIsLocked] = useState(true);
  const [showControlCenter, setShowControlCenter] = useState(false);
  const [flashlightOn, setFlashlightOn] = useState(false);
  const [brightness, setBrightness] = useState(75);
  const [darkMode, setDarkMode] = useState(true);
  const [customization, setCustomization] = useState<AppCustomization>(loadLocalCustomization);
  const [savedScans, setSavedScans] = useState<Scan[]>(loadLocalScans);
  const [dataLoading, setDataLoading] = useState(true);

  const activeTheme = darkMode
    ? customization.theme
    : { backgroundColor: '#f0f4f8', primaryColor: '#e2e8f0', accentColor: '#cbd5e1', textColor: '#1a1a2e' };

  useEffect(() => {
    setDataLoading(false);
    if (user) {
      syncFromCloud();
    }
  }, [user]);

  const syncFromCloud = async () => {
    try {
      const [scansResult, customizationsResult] = await Promise.all([
        supabase.from('saved_scans').select('*').order('created_at', { ascending: false }),
        supabase.from('user_customizations').select('*'),
      ]);

      if (scansResult.data && scansResult.data.length > 0) {
        setSavedScans(scansResult.data.map(s => ({
          id: s.id,
          text: s.text,
          date: s.created_at.split('T')[0],
        })));
      }

      if (customizationsResult.data && customizationsResult.data.length > 0) {
        setCustomization(prev => {
          const cloudItems = new Set(customizationsResult.data.map(c => c.item_id));
          const merged = new Set([...prev.installedItems, ...cloudItems]);
          return { ...prev, installedItems: merged };
        });
      }
    } catch (err) {
      console.error('Failed to sync from cloud:', err);
    }
  };

  const handleSaveScan = async (text: string) => {
    const newScan: Scan = {
      id: Date.now().toString(),
      text: text.slice(0, 500),
      date: new Date().toISOString().split('T')[0],
    };

    setSavedScans(prev => {
      const updated = [newScan, ...prev];
      saveLocalScans(updated);
      return updated;
    });

    if (user) {
      await supabase.from('saved_scans').insert({ text: newScan.text });
    }
    return true;
  };

  const handleDeleteScan = async (id: string) => {
    setSavedScans(prev => {
      const updated = prev.filter(s => s.id !== id);
      saveLocalScans(updated);
      return updated;
    });

    if (user) {
      await supabase.from('saved_scans').delete().eq('id', id);
    }
  };

  const handleApplyTheme = (colors: typeof customization.theme) => {
    setCustomization(prev => {
      const updated = { ...prev, theme: colors };
      saveLocalCustomization(updated);
      return updated;
    });

    if (user) {
      supabase.from('user_customizations').upsert({
        item_type: 'theme',
        item_id: 'custom_theme',
        item_data: colors,
      });
    }
  };

  const handleApplyWallpaper = (wallpaper: string) => {
    setCustomization(prev => {
      const updated = { ...prev, wallpaper };
      saveLocalCustomization(updated);
      return updated;
    });

    if (user) {
      supabase.from('user_customizations').upsert({
        item_type: 'wallpaper',
        item_id: wallpaper,
      });
    }
  };

  const handleApplyFont = (font: string) => {
    setCustomization(prev => {
      const updated = { ...prev, font };
      saveLocalCustomization(updated);
      return updated;
    });

    if (user) {
      supabase.from('user_customizations').upsert({
        item_type: 'font',
        item_id: font,
      });
    }
  };

  const handleToggleInstall = async (itemId: string, itemType: string) => {
    const isInstalled = customization.installedItems.has(itemId);

    setCustomization(prev => {
      const newItems = new Set(prev.installedItems);
      if (isInstalled) {
        newItems.delete(itemId);
      } else {
        newItems.add(itemId);
      }
      const updated = { ...prev, installedItems: newItems };
      saveLocalCustomization(updated);
      return updated;
    });

    if (user) {
      if (isInstalled) {
        await supabase.from('user_customizations').delete()
          .eq('item_type', itemType)
          .eq('item_id', itemId);
      } else {
        await supabase.from('user_customizations').insert({
          item_type: itemType,
          item_id: itemId,
        });
      }
    }

    return !isInstalled;
  };

  // Handle swipe down from top to show control center
  const handleDrag = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    const element = e.target as HTMLElement;
    const rect = element.getBoundingClientRect();
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    if (clientY - rect.top < 30 && !isLocked && !showControlCenter) {
      setShowControlCenter(true);
    }
  }, [isLocked, showControlCenter]);

  if (authLoading || dataLoading) {
    return (
      <div className="size-full flex items-center justify-center" style={{ backgroundColor: '#0a0a0a' }}>
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }

  if (showAuth) {
    return (
      <div className="size-full flex items-center justify-center" style={{ backgroundColor: '#0a0a0a' }}>
        <div
          className="relative w-[380px] h-[780px] rounded-[40px] shadow-2xl overflow-hidden border-8 border-gray-800"
          style={{ backgroundColor: activeTheme.backgroundColor }}
        >
          <AuthScreen theme={activeTheme} onBack={() => setShowAuth(false)} />
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="size-full flex items-center justify-center" style={{ backgroundColor: '#0a0a0a' }}>
        <div
          className="relative w-[380px] h-[780px] rounded-[40px] shadow-2xl overflow-hidden border-8 border-gray-800 transition-colors duration-500"
          style={{
            backgroundColor: activeTheme.backgroundColor,
            backgroundImage: customization.wallpaper || undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            fontFamily: customization.font,
            filter: `brightness(${0.4 + (brightness / 100) * 0.65})`,
          }}
          onMouseMove={handleDrag}
          onTouchStart={handleDrag}
        >
          {flashlightOn && (
            <div className="absolute inset-0 bg-white/20 pointer-events-none z-[60]" />
          )}

          {/* Lock Screen */}
          {isLocked && (
            <LockScreen
              theme={activeTheme}
              onUnlock={() => setIsLocked(false)}
            />
          )}

          {/* Main OS Interface */}
          {!isLocked && (
            <>
              {/* Status Bar */}
              <StatusBar textColor={activeTheme.textColor} brightness={brightness} />

              {/* Control Center */}
              <ControlCenter
                visible={showControlCenter}
                onClose={() => setShowControlCenter(false)}
                theme={activeTheme}
                darkMode={darkMode}
                setDarkMode={setDarkMode}
                brightness={brightness}
                setBrightness={setBrightness}
                flashlightOn={flashlightOn}
                setFlashlightOn={setFlashlightOn}
              />

              {/* App Content */}
              <div className="size-full flex flex-col">
                <Routes>
                  <Route path="/" element={
                    <Home
                      theme={activeTheme}
                      flashlightOn={flashlightOn}
                      setFlashlightOn={setFlashlightOn}
                      savedScans={savedScans}
                      onOpenControlCenter={() => setShowControlCenter(true)}
                    />
                  } />
                  <Route path="/scan" element={
                    <ScanMode
                      theme={activeTheme}
                      flashlightOn={flashlightOn}
                      setFlashlightOn={setFlashlightOn}
                      savedScans={savedScans}
                      onSaveScan={handleSaveScan}
                      onDeleteScan={handleDeleteScan}
                    />
                  } />
                  <Route path="/translate" element={
                    <TranslationMode
                      theme={activeTheme}
                      flashlightOn={flashlightOn}
                      setFlashlightOn={setFlashlightOn}
                    />
                  } />
                  <Route path="/read" element={
                    <ReadingMode
                      theme={activeTheme}
                      flashlightOn={flashlightOn}
                      setFlashlightOn={setFlashlightOn}
                    />
                  } />
                  <Route path="/customize" element={
                    <CustomizationScreen
                      theme={activeTheme}
                      setTheme={handleApplyTheme}
                      installedItems={customization.installedItems}
                      onToggleInstall={handleToggleInstall}
                      wallpaper={customization.wallpaper}
                      onApplyWallpaper={handleApplyWallpaper}
                      font={customization.font}
                      onApplyFont={handleApplyFont}
                    />
                  } />
                  <Route path="/settings" element={
                    <SystemSettings
                      theme={activeTheme}
                      brightness={brightness}
                      setBrightness={setBrightness}
                      darkMode={darkMode}
                      setDarkMode={setDarkMode}
                      onOpenAuth={() => setShowAuth(true)}
                      onLock={() => setIsLocked(true)}
                    />
                  } />
                </Routes>
              </div>
            </>
          )}
        </div>
      </div>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
