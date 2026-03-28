import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import i18n from '../i18n'

function stripExtension(filename) {
  const idx = filename.lastIndexOf('.')
  return idx > 0 ? filename.slice(0, idx) : filename
}

function FlipCard({ card, isFlipped, onFlip, t }) {
  return (
    <div
      className="cursor-pointer select-none"
      style={{ perspective: '1000px', height: '200px' }}
      onClick={onFlip}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          transition: 'transform 0.45s',
          transformStyle: 'preserve-3d',
          WebkitTransformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 bg-white rounded-xl border-2 border-purple-100 p-4 flex flex-col items-center justify-center shadow-sm hover:shadow-md hover:border-purple-300 transition-shadow overflow-y-auto"
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
        >
          <span className="text-xs text-purple-400 font-semibold uppercase tracking-wider mb-3">{t('studybuddy.question')}</span>
          <p className="text-sm text-gray-800 text-center font-medium leading-relaxed">{card.question}</p>
          <span className="text-xs text-gray-300 mt-4">{t('studybuddy.tapToReveal')}</span>
        </div>
        {/* Back */}
        <div
          className="absolute inset-0 bg-purple-700 rounded-xl p-4 flex flex-col items-center justify-center shadow-md overflow-y-auto"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <span className="text-xs text-purple-200 font-semibold uppercase tracking-wider mb-3">{t('studybuddy.answer')}</span>
          <p className="text-sm text-white text-center leading-relaxed">{card.answer}</p>
        </div>
      </div>
    </div>
  )
}

export default function FlashcardsPage() {
  const { courseId, filename } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const [flashcards, setFlashcards] = useState([])
  const [flippedCards, setFlippedCards] = useState(new Set())
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    generate()
  }, [filename])

  async function generate() {
    setIsGenerating(true)
    setFlashcards([])
    setFlippedCards(new Set())
    setError(null)
    try {
      const { data } = await axios.post(`/api/courses/${courseId}/studybuddy/flashcards`, { filename, language: i18n.language || 'en' })
      setFlashcards(data.flashcards)
    } catch (err) {
      setError(err.response?.data?.detail || t('flashcards.failed'))
    } finally {
      setIsGenerating(false)
    }
  }

  function toggleCard(i) {
    setFlippedCards(prev => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-gray-100 bg-white flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/course/${courseId}/lectures/${encodeURIComponent(filename)}`)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
          </button>
          <div>
            <p className="text-xs text-gray-400 leading-none">{t('flashcards.title')}</p>
            <p className="text-sm font-semibold text-gray-700">{stripExtension(filename)}</p>
          </div>
        </div>

        {flashcards.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">{t('flashcards.cards', { count: flashcards.length })}</span>
            <button
              onClick={() => setFlippedCards(new Set())}
              className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
            >
              {t('flashcards.reset')}
            </button>
            <button
              onClick={() => setFlippedCards(new Set(flashcards.map((_, i) => i)))}
              className="px-3 py-1.5 text-xs bg-purple-700 text-white rounded-lg hover:bg-purple-800 transition-colors"
            >
              {t('flashcards.revealAll')}
            </button>
            <button
              onClick={generate}
              className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
            >
              {t('flashcards.regenerate')}
            </button>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto bg-gray-50 px-8 py-6">
        {isGenerating && (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-700 rounded-full animate-spin" />
            <p className="text-gray-500 text-sm">{t('flashcards.generating')}</p>
          </div>
        )}

        {error && !isGenerating && (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
            <p className="text-red-500 text-sm">{error}</p>
            <button
              onClick={generate}
              className="px-5 py-2 bg-purple-700 text-white text-sm font-medium rounded-lg hover:bg-purple-800 transition-colors"
            >
              {t('flashcards.tryAgain')}
            </button>
          </div>
        )}

        {!isGenerating && !error && flashcards.length > 0 && (
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {flashcards.map((card, i) => (
                <FlipCard
                  key={i}
                  card={card}
                  isFlipped={flippedCards.has(i)}
                  onFlip={() => toggleCard(i)}
                  t={t}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
