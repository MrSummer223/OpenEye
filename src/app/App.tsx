import { BrowserRouter, Routes, Route } from 'react-router';
import { useState } from 'react';
import { Home } from './components/Home';
import { ScanMode } from './components/ScanMode';
import { TranslationMode } from './components/TranslationMode';
import { ReadingMode } from './components/ReadingMode';
import { CustomizationScreen } from './components/CustomizationScreen';
import { SystemSettings } from './components/SystemSettings';

export interface Scan {
  id: number;
  text: string;
  date: string;
}

export default function App() {
  const [flashlightOn, setFlashlightOn] = useState(false);
  const [brightness, setBrightness] = useState(75);
  const [darkMode, setDarkMode] = useState(true);
  const [theme, setTheme] = useState({
    backgroundColor: '#1a1a2e',
    primaryColor: '#0f3460',
    accentColor: '#16213e',
    textColor: '#eaeaea',
  });
  const [savedScans, setSavedScans] = useState<Scan[]>([
    { id: 1, text: 'Chemistry Chapter 5: Atomic Structure and Periodicity...', date: '2026-05-27' },
    { id: 2, text: 'Meeting Notes: Project deadline extended to June 15th...', date: '2026-05-26' },
    { id: 3, text: 'Recipe: Italian Pasta Carbonara with fresh ingredients...', date: '2026-05-25' },
  ]);

  const activeTheme = darkMode
    ? theme
    : { backgroundColor: '#f0f4f8', primaryColor: '#e2e8f0', accentColor: '#cbd5e1', textColor: '#1a1a2e' };

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
                  setSavedScans={setSavedScans}
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
                <CustomizationScreen theme={activeTheme} setTheme={setTheme} />
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
