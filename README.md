<div align="center">

# OpenEye

**AI-Powered Visual Assistance for Everyone**

*Real-time OCR, Translation, and Reading Support*

[![Open in Bolt](https://bolt.new/static/open-in-bolt.svg)](https://bolt.new/~/github-rrz5xxci)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres-3FCF8E?logo=supabase&logoColor=white)](https://supabase.com)
[![Vite](https://img.shields.io/badge/Vite-6.3-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)

---

<img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white" alt="TypeScript">
<img src="https://img.shields.io/badge/Tailwind-4.0-38BDF8?logo=tailwindcss&logoColor=white" alt="Tailwind CSS">
<img src="https://img.shields.io/badge/Tesseract.js-7.0-1B9AD2?logo=tesseract&logoColor=white" alt="Tesseract.js">
<img src="https://img.shields.io/badge/OpenAI-GPT--4o-412991?logo=openai&logoColor=white" alt="OpenAI">

</div>

<br>

## Overview

OpenEye is a modern visual assistance application designed to help users interact with text in the physical world. Built with accessibility in mind, it provides three core modes:

| Mode | Description |
|------|-------------|
| **Scan** | Point your camera at any text — signs, documents, labels — and extract it instantly |
| **Translate** | Real-time translation between languages with speech synthesis |
| **Read** | Word-by-word text playback for comfortable reading assistance |

<br>

## Preview

<div align="center">

| Home Screen | Scan Mode | Reading Mode |
|:-----------:|:---------:|:------------:|
| *Dashboard with mode cards* | *Real-time OCR capture* | *Word-by-word playback* |

</div>

<br>

## Technology Stack

<table>
<tr>
<td width="50%" valign="top">

### Frontend
- **React 18** — Modern component architecture
- **Vite 6** — Lightning-fast build tooling
- **Tailwind CSS 4** — Utility-first styling
- **Motion** — Smooth animations
- **React Router 7** — Client-side routing

</td>
<td width="50%" valign="top">

### Backend
- **Supabase** — PostgreSQL database & Auth
- **Edge Functions** — Serverless OCR processing
- **OpenAI GPT-4o-mini** — Vision-based text extraction
- **Tesseract.js** — Offline OCR fallback

</td>
</tr>
</table>

<br>

## Features

### Intelligent OCR System

```
┌─────────────────────────────────────────────┐
│                 Image Input                  │
└─────────────────────┬───────────────────────┘
                      ▼
         ┌────────────────────────┐
         │   AI OCR (GPT-4o-mini)  │ ← Primary: High accuracy
         └────────────┬───────────┘
                      │ Failed/No Key
                      ▼
         ┌────────────────────────┐
         │  Tesseract.js Fallback  │ ← Offline backup
         └────────────┬───────────┘
                      │
                      ▼
         ┌────────────────────────┐
         │    Text Cleaning &      │
         │   Artifact Removal      │
         └────────────┬───────────┘
                      ▼
              Clean Text Output
```

### Core Capabilities

| Feature | Details |
|---------|---------|
| Multi-mode Input | Camera capture, photo upload, manual typing |
| Text-to-Speech | Speech synthesis for scanned and translated text |
| Theme Customization | Multiple color presets with dark mode support |
| Scan History | Persisted history of all scanned documents |
| Privacy-First | All processing done server-side or on-device |

<br>

## Quick Start

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/openeye.git
cd openeye

# Install dependencies
npm install

# Start development server
npm run dev
```

Open **http://localhost:5173** in your browser.

### Production Build

```bash
npm run build
npm run preview
```

<br>

## Configuration

### Enable AI OCR (Recommended)

For optimal OCR accuracy, configure the OpenAI API key:

1. **Get an API Key**
   - Visit https://platform.openai.com/api-keys
   - Create a new secret key

2. **Configure in Supabase**
   - Open your Supabase dashboard
   - Navigate to: Edge Functions → `ocr-ai` → Settings → Secrets
   - Add `OPENAI_API_KEY` with your key

> **Without the API key**: The app will use Tesseract.js (works offline but with lower accuracy)

<br>

## Project Structure

```
openeye/
├── src/
│   ├── main.tsx                 # Entry point
│   ├── app/
│   │   ├── App.tsx              # Root component & routing
│   │   └── components/
│   │       ├── Home.tsx         # Dashboard
│   │       ├── ScanMode.tsx     # OCR camera interface
│   │       ├── TranslationMode.tsx
│   │       ├── ReadingMode.tsx
│   │       ├── CustomizationScreen.tsx
│   │       ├── SystemSettings.tsx
│   │       └── AuthScreen.tsx
│   ├── hooks/
│   │   ├── useCamera.ts         # Camera access & capture
│   │   └── useOCR.ts            # AI + Tesseract OCR
│   ├── lib/
│   │   ├── supabase.ts          # Supabase client
│   │   └── auth.tsx             # Auth context
│   └── styles/
│       ├── index.css
│       ├── tailwind.css
│       ├── theme.css
│       └── fonts.css
├── supabase/
│   ├── functions/
│   │   └── ocr-ai/index.ts      # Edge function
│   └── migrations/              # Database schema
├── public/
├── package.json
└── vite.config.ts
```

<br>

## API Reference

### OCR Edge Function

**Endpoint:** `POST /functions/v1/ocr-ai`

```typescript
// Request
{
  "image": "data:image/jpeg;base64,..."  // Base64 image
}

// Response (Success)
{
  "text": "Extracted text content..."
}

// Response (No text found)
{
  "text": null,
  "error": "No text detected in image"
}

// Response (Error)
{
  "text": null,
  "error": "API key not configured"
}
```

<br>

## Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Camera API | ✅ | ✅ | ✅ | ✅ |
| Clipboard | ✅ | ✅ | ✅ | ✅ |
| Web Share | ✅ Mobile | ✅ Mobile | ✅ | ✅ Mobile |
| Speech Synthesis | ✅ | ✅ | ✅ | ✅ |

<br>

## Browser APIs Used

```javascript
// Camera access
navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })

// Copy to clipboard
navigator.clipboard.writeText(text)

// Share (mobile)
navigator.share({ title, text })

// Text-to-speech
window.speechSynthesis.speak(new SpeechSynthesisUtterance(text))
```

<br>

## Roadmap

- [ ] Multi-language OCR support
- [ ] Document scanning with PDF export
- [ ] Offline mode with service worker
- [ ] Voice commands
- [ ] Apple Watch companion app
- [ ] Android Wear companion app

<br>

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<br>

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

<br>

## Acknowledgments

- [OpenAI](https://openai.com) for GPT-4o-mini Vision API
- [Tesseract.js](https://tesseract.projectnaptha.com) for offline OCR
- [Supabase](https://supabase.com) for backend infrastructure
- [Lucide](https://lucide.dev) for beautiful icons

<br>

---

<div align="center">

**[Report Bug](https://github.com/yourusername/openeye/issues)** ·
**[Request Feature](https://github.com/yourusername/openeye/issues)**

Made with care for accessibility

[Back to Top](#openeye)

</div>
