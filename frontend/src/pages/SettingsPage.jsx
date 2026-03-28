import { useTranslation } from 'react-i18next'
import { setLanguage } from '../i18n'

export default function SettingsPage() {
  const { t, i18n } = useTranslation()
  const currentLang = i18n.language

  return (
    <div className="p-8 max-w-lg">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">{t('settings.title')}</h1>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">{t('settings.language')}</h2>
          <p className="text-xs text-gray-400 mt-0.5">{t('settings.languageDesc')}</p>
        </div>
        <div className="p-5 flex flex-col gap-2">
          {[
            { code: 'en', label: 'English', native: 'English' },
            { code: 'es', label: 'Spanish', native: 'Español' },
          ].map(({ code, label, native }) => (
            <button
              key={code}
              onClick={() => setLanguage(code)}
              className={`flex items-center justify-between px-4 py-3 rounded-lg border transition-all text-left ${
                currentLang === code
                  ? 'border-purple-500 bg-purple-50 text-purple-800'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700'
              }`}
            >
              <div>
                <span className="text-sm font-medium">{native}</span>
                <span className="text-xs text-gray-400 ml-2">({label})</span>
              </div>
              {currentLang === code && (
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-purple-600">
                  <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
