import { BrowserRouter, Routes, Route } from 'react-router';
import { useState, useEffect } from 'react';
import { Home } from './components/Home';
import { ScanMode } from './components/ScanMode';
import { TranslationMode } from './components/TranslationMode';
import { ReadingMode } from './components/ReadingMode';
import { CustomizationScreen } from './components/CustomizationScreen';
import { SystemSettings } from './components/SystemSettings';
import { AuthScreen } from './components/AuthScreen';
import { AuthProvider, useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';
import { Loader as Loader2 } from 'lucide-react';

export interface Scan {
  id: string;
  text: string;
  date: string;
}

function AppContent() {
  const { user, loading: authLoading } = useAuth();
  const [flashlightOn, setFlashlightOn] = useState(false);
  const [brightness, setBrightness] = useState(75);
  const [darkMode, setDarkMode] = useState(true);
  const [theme, setTheme] = useState({
    backgroundColor: '#1a1a2e',
    primaryColor: '#0f3460',
    accentColor: '#16213e',
    textColor: '#eaeaea',
  });
  const [savedScans, setSavedScans] = useState<Scan[]>([]);
  const [installedItems, setInstalledItems] = useState<Set<string>>(new Set());
  const [dataLoading, setDataLoading] = useState(true);

  const activeTheme = darkMode
    ? theme
    : { backgroundColor: '#f0f4f8', primaryColor: '#e2e8f0', accentColor: '#cbd5e1', textColor: '#1a1a2e' };

  useEffect(() => {
    if (user) {
      loadData();
    } else {
      setSavedScans([]);
      setInstalledItems(new Set());
      setDataLoading(false);
    }
  }, [user]);

  const loadData = async () => {
    setDataLoading(true);
    try {
      const [scansResult, customizationsResult] = await Promise.all([
        supabase.from('saved_scans').select('*').order('created_at', { ascending: false }),
        supabase.from('user_customizations').select('*'),
      ]);

      if (scansResult.data) {
        setSavedScans(scansResult.data.map(s => ({
          id: s.id,
          text: s.text,
          date: s.created_at.split('T')[0],
        })));
      }

      if (customizationsResult.data) {
        setInstalledItems(new Set(customizationsResult.data.map(c => c.item_id)));
      }
    } catch (err) {
      console.error('Failed to load data:', err);
    }
    setDataLoading(false);
  };

  const handleSaveScan = async (text: string) => {
    if (!user) return;
    const { data, error } = await supabase
      .from('saved_scans')
      .insert({ text })
      .select()
      .single();

    if (data) {
      setSavedScans(prev => [{
        id: data.id,
        text: data.text,
        date: data.created_at.split('T')[0],
      }, ...prev]);
    }
    return !error;
  };

  const handleDeleteScan = async (id: string) => {
    if (!user) return;
    await supabase.from('saved_scans').delete().eq('id', id);
    setSavedScans(prev => prev.filter(s => s.id !== id));
  };

  const handleToggleInstall = async (itemId: string, itemType: string) => {
    if (!user) return false;
    const isInstalled = installedItems.has(itemId);

    if (isInstalled) {
      await supabase.from('user_customizations').delete()
        .eq('item_type', itemType)
        .eq('item_id', itemId);
      setInstalledItems(prev => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    } else {
      const { error } = await supabase.from('user_customizations').insert({
        item_type: itemType,
        item_id: itemId,
      });
      if (!error) {
        setInstalledItems(prev => new Set([...prev, itemId]));
        return true;
      }
      return false;
    }
    return !isInstalled;
  };

  if (authLoading || dataLoading) {
    return (
      <div className="size-full flex items-center justify-center" style={{ backgroundColor: '#0a0a0a' }}>
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="size-full flex items-center justify-center" style={{ backgroundColor: '#0a0a0a' }}>
        <div
          className="relative w-[380px] h-[780px] rounded-[40px] shadow-2xl overflow-hidden border-8 border-gray-800"
          style={{ backgroundColor: activeTheme.backgroundColor }}
        >
          <AuthScreen theme={activeTheme} />
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
            filter: `brightness(${0.4 + (brightness / 100) * 0.65})`,
          }}
        >
          {flashlightOn && (
            <div className="absolute inset-0 bg-white/20 pointer-events-none z-50" />
          )}

          <div className="size-full flex flex-col">
            <Routes>
              <Route path="/" element={
                <Home
                  theme={activeTheme}
                  flashlightOn={flashlightOn}
                  setFlashlightOn={setFlashlightOn}
                  savedScans={savedScans}
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
                  setTheme={setTheme}
                  installedItems={installedItems}
                  onToggleInstall={handleToggleInstall}
                />
              } />
              <Route path="/settings" element={
                <SystemSettings
                  theme={activeTheme}
                  brightness={brightness}
                  setBrightness={setBrightness}
                  darkMode={darkMode}
                  setDarkMode={setDarkMode}
                />
              } />
            </Routes>
          </div>
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
