/*
 * ============================================================
 *  OpenEye — Rebuild Guide
 * ============================================================
 *
 * QUICK START
 * -----------
 * 1. Unzip this folder
 * 2. Run:  npm install
 * 3. Run:  npm run dev
 * 4. Open: http://localhost:5173
 *
 *
 * DEPENDENCIES (already in package.json)
 * ----------------------------------------
 * Runtime:
 *   lucide-react        — icons throughout the app
 *   motion              — animations (import from "motion/react")
 *   react-router        — navigation between screens
 *   clsx                — conditional class merging
 *   tailwind-merge      — Tailwind class deduplication
 *   tw-animate-css      — extra Tailwind animation utilities
 *   tesseract.js        — OCR fallback engine
 *   @supabase/supabase-js — auth and database
 *
 * Dev / Build:
 *   vite + @vitejs/plugin-react
 *   tailwindcss + @tailwindcss/vite
 *   typescript
 *
 *
 * FILE STRUCTURE
 * ---------------
 * src/
 *   main.tsx                          — React entry point
 *   app/
 *     App.tsx                         — Root: routing, shared state
 *     components/
 *       Home.tsx                      — Home screen with clock and mode cards
 *       ScanMode.tsx                  — Camera + real OCR text extraction
 *                                       • AI OCR via Supabase Edge Function
 *                                       • Tesseract.js fallback
 *                                       • Shows AI/Tesseract badge
 *       TranslationMode.tsx           — Translation screen
 *                                       • Camera / Photo / Type input tabs
 *                                       • Speech synthesis read-aloud
 *       ReadingMode.tsx               — Reading screen
 *                                       • Word-by-word highlight
 *                                       • Speed & font-size controls
 *       CustomizationScreen.tsx       — Theme presets and personalization
 *       SystemSettings.tsx            — Settings screen
 *       AuthScreen.tsx                — Login/signup with Supabase Auth
 *   hooks/
 *     useCamera.ts                    — Camera access, capture, torch toggle
 *     useOCR.ts                       — AI + Tesseract OCR with text cleaning
 *   lib/
 *     supabase.ts                     — Supabase client
 *     auth.tsx                        — Auth context and session management
 *   styles/
 *     index.css     — imports fonts + tailwind + theme
 *     tailwind.css  — Tailwind v4 setup
 *     theme.css     — CSS variables
 *     fonts.css     — Google Fonts imports
 *
 * supabase/
 *   functions/ocr-ai/index.ts         — Edge function for AI OCR
 *                                       • Calls OpenAI GPT-4o-mini Vision
 *                                       • Requires OPENAI_API_KEY secret
 *   migrations/                       — Database schema
 *
 *
 * OCR SYSTEM (useOCR.ts)
 * -----------------------
 * Primary: AI OCR (GPT-4o-mini Vision)
 *   • High accuracy text extraction
 *   • Preserves formatting and spacing
 *   • Returns null for blank/no-text images
 *   • Requires OPENAI_API_KEY in Edge Function secrets
 *
 * Fallback: Tesseract.js
 *   • Multi-pass recognition (PSM 3 & 6)
 *   • Artifact/symbol filtering
 *   • Confidence-based result selection
 *   • Works offline, less accurate
 *
 *
 * SHARED STATE (App.tsx)
 * -----------------------
 * session        Session | null   — Supabase auth session
 * theme          object          — { backgroundColor, primaryColor,
 *                                   accentColor, textColor }
 * savedScans     Scan[]          — Persisted scan history
 * brightness     number 10-100   — Screen brightness
 * darkMode       boolean         — Dark/light theme toggle
 *
 *
 * ANIMATION PATTERNS
 * -------------------
 * All animations use motion from "motion/react".
 *
 * Screen transitions    → x: 40→0, opacity 0→1
 * Home clock            → scale: 0.92→1
 * Mode cards            → x: -32→0 staggered
 * Settings rows         → x: -24→0 staggered
 * Result panels         → height: 0→auto + opacity
 * Toggle switches       → spring x translate
 * whileTap              → scale: 0.88–0.97 on buttons
 *
 *
 * BROWSER APIs USED
 * ------------------
 * navigator.clipboard.writeText()  — copy scanned text
 * navigator.share()                — share text (mobile)
 * window.speechSynthesis           — read-aloud TTS
 * navigator.mediaDevices           — camera access
 *
 *
 * CONFIGURING AI OCR
 * -------------------
 * 1. Get OpenAI API key from https://platform.openai.com/api-keys
 * 2. In Supabase dashboard: Edge Functions → ocr-ai → Settings → Secrets
 * 3. Add OPENAI_API_KEY with your key
 *
 * Without the key, Tesseract.js will be used (works but less accurate).
 */
export {};
