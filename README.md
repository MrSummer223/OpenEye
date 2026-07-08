# OpenEye

An AI-powered visual assistance app with real OCR, translation, and reading features.

[![Open in Bolt](https://bolt.new/static/open-in-bolt.svg)](https://bolt.new/~/github-rrz5xxci)

## Features

- **Scan Mode** — Real OCR text extraction using AI (GPT-4o-mini Vision) or Tesseract fallback
- **Translation Mode** — Translate text between languages with speech synthesis
- **Reading Mode** — Word-by-word text playback with speed controls
- **Customization** — Theme presets and personalization
- **Authentication** — Secure sign-in with Supabase Auth

## Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS 4, Motion (Framer Motion)
- **Backend:** Supabase (PostgreSQL, Auth, Edge Functions)
- **OCR:** OpenAI GPT-4o-mini Vision (primary) + Tesseract.js (fallback)
- **Icons:** Lucide React

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Configuration

### Enable AI OCR (Recommended)

1. Get an OpenAI API key from https://platform.openai.com/api-keys
2. In Supabase dashboard, go to Edge Functions → ocr-ai → Settings → Secrets
3. Add `OPENAI_API_KEY` with your key

Without the key, the app uses Tesseract.js (works but less accurate).

## Project Structure

```
src/
  main.tsx                    — React entry point
  app/
    App.tsx                   — Root component, routing, shared state
    components/
      Home.tsx                — Dashboard with mode cards
      ScanMode.tsx            — Camera + OCR text extraction
      TranslationMode.tsx     — Translation with TTS
      ReadingMode.tsx         — Word-by-word reading playback
      CustomizationScreen.tsx — Theme presets and settings
      SystemSettings.tsx      — App settings
      AuthScreen.tsx          — Login/signup
  hooks/
    useCamera.ts              — Camera access and capture
    useOCR.ts                 — AI + Tesseract OCR logic
  lib/
    supabase.ts               — Supabase client
    auth.tsx                  — Auth context provider
  styles/
    index.css, tailwind.css, theme.css, fonts.css

supabase/
  functions/ocr-ai/           — Edge function for AI OCR
  migrations/                 — Database schema
```

## Browser APIs Used

- `navigator.clipboard` — Copy text
- `navigator.share` — Share text (mobile)
- `window.speechSynthesis` — Text-to-speech
- `getUserMedia` — Camera access

## Customization

- **Themes:** Edit `presetThemes` in CustomizationScreen.tsx
- **New screens:** Add component + Route in App.tsx + card in Home.tsx
- **Fonts:** Add @import to src/styles/fonts.css
- **Device size:** Edit w-[380px] h-[780px] in App.tsx
