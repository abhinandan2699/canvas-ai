import { useTranslation } from 'react-i18next'
import { setLanguage } from '../i18n'

export default function LanguageSwitcher({ variant = 'default' }) {
  const { i18n, t } = useTranslation()

  const isEn = i18n.language === 'en'

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-0.5 bg-white/10 rounded-lg p-0.5">
        <button
          onClick={() => setLanguage('en')}
          className={`px-2 py-1 rounded text-xs font-medium transition-colors ${isEn ? 'bg-white text-purple-800' : 'text-gray-300 hover:text-white'}`}
          title={t('dashboard.english')}
        >
          EN
        </button>
        <button
          onClick={() => setLanguage('es')}
          className={`px-2 py-1 rounded text-xs font-medium transition-colors ${!isEn ? 'bg-white text-purple-800' : 'text-gray-300 hover:text-white'}`}
          title={t('dashboard.spanish')}
        >
          ES
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-400 font-medium">{t('dashboard.language')}:</span>
      <div className="flex rounded-lg border border-gray-200 overflow-hidden bg-white shadow-sm">
        <button
          onClick={() => setLanguage('en')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${isEn ? 'bg-purple-700 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
        >
          {t('dashboard.english')}
        </button>
        <button
          onClick={() => setLanguage('es')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${!isEn ? 'bg-purple-700 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
        >
          {t('dashboard.spanish')}
        </button>
      </div>
    </div>
  )
}
