import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import es from './locales/es.json'

const LANG_KEY = 'canvas-ai-lang'

function getStoredLanguage() {
  try {
    const stored = localStorage.getItem(LANG_KEY)
    if (stored === 'es' || stored === 'en') return stored
  } catch {}
  return 'en'
}

export function setLanguage(lang) {
  if (lang === 'es' || lang === 'en') {
    i18n.changeLanguage(lang)
    try { localStorage.setItem(LANG_KEY, lang) } catch {}
  }
}

i18n
  .use(initReactI18next)
  .init({
    resources: { en: { translation: en }, es: { translation: es } },
    lng: getStoredLanguage(),
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  })

export default i18n
