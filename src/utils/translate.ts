const LANG_MAP: Record<string, string> = {
  en: 'en',
  es: 'es',
  fr: 'fr',
  de: 'de',
  ja: 'ja',
  zh: 'zh-CN',
  ar: 'ar',
  ru: 'ru',
};

export async function translateText(
  text: string,
  from: string,
  to: string,
): Promise<string> {
  if (!text.trim()) return '';
  if (from === to) return text;

  const langPair = `${LANG_MAP[from] || from}|${LANG_MAP[to] || to}`;
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
    text.slice(0, 450),
  )}&langpair=${langPair}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error('Translation request failed');
  const data = await res.json();
  const translated = data?.responseData?.translatedText;
  if (!translated) throw new Error('No translation returned');
  return translated;
}
