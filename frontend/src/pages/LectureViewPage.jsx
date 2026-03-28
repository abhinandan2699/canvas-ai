import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import { fetchCourses } from '../api'

function stripExtension(filename) {
  const idx = filename.lastIndexOf('.')
  return idx > 0 ? filename.slice(0, idx) : filename
}

export default function LectureViewPage() {
  const { courseId, filename } = useParams()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const [course, setCourse] = useState(null)
  const [showTranslated, setShowTranslated] = useState(i18n.language === 'es')
  const [translatedText, setTranslatedText] = useState(null)
  const [translating, setTranslating] = useState(false)
  const [translateError, setTranslateError] = useState(null)

  const title = stripExtension(filename).replace(/_/g, ' ')
  const fileUrl = `/api/courses/${courseId}/files/lectures/${encodeURIComponent(filename)}`
  const ext = filename.split('.').pop().toLowerCase()
  const isSpanish = i18n.language === 'es'

  useEffect(() => {
    fetchCourses().then(res => {
      setCourse(res.data.find(c => c.id === courseId) || null)
    })
  }, [courseId])

  useEffect(() => {
    if (!isSpanish) return
    setShowTranslated(true)
    if (translatedText) return
    setTranslating(true)
    setTranslateError(null)
    axios.get(`/api/courses/${courseId}/lectures/${encodeURIComponent(filename)}/translate?language=es`)
      .then(res => setTranslatedText(res.data.text))
      .catch(() => setTranslateError('Translation failed. Showing original.'))
      .finally(() => setTranslating(false))
  }, [courseId, filename, isSpanish])

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="px-5 py-3 bg-white border-b border-gray-200 flex items-center gap-3 flex-shrink-0">
        <div>
          <nav className="text-xs text-gray-400 flex items-center gap-1 flex-wrap">
            <button onClick={() => navigate('/dashboard')} className="hover:text-gray-600">{t('nav.dashboard')}</button>
            <span>/</span>
            <button onClick={() => navigate(`/course/${courseId}`)} className="hover:text-gray-600">{course?.name}</button>
            <span>/</span>
            <button onClick={() => navigate(`/course/${courseId}/lectures`)} className="hover:text-gray-600">{t('lectures.title')}</button>
            <span>/</span>
            <button onClick={() => navigate(`/course/${courseId}/lectures/${encodeURIComponent(filename)}`)} className="hover:text-gray-600">{title}</button>
            <span>/</span>
            <span className="text-gray-600 font-medium">{t('lectures.viewSlide')}</span>
          </nav>
          <h3 className="font-semibold text-gray-800 text-sm mt-0.5">{title}</h3>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {isSpanish && (ext === 'pdf' || ext === 'pptx' || ext === 'ppt') && (
            <div className="flex items-center rounded-lg border border-gray-200 overflow-hidden text-xs font-medium">
              <button
                onClick={() => setShowTranslated(false)}
                className={`px-3 py-1.5 transition-colors ${!showTranslated ? 'bg-gray-800 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
              >
                Original
              </button>
              <button
                onClick={() => setShowTranslated(true)}
                className={`px-3 py-1.5 transition-colors ${showTranslated ? 'bg-blue-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
              >
                Español
              </button>
            </div>
          )}

          <a
            href={fileUrl}
            download={filename}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-medium transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            {t('assignments.download')}
          </a>
        </div>
      </div>

      {/* File viewer */}
      <div className="flex-1 overflow-hidden bg-gray-100">
        {isSpanish && showTranslated && (ext === 'pdf' || ext === 'pptx' || ext === 'ppt') ? (
          translating ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-3">
              <svg className="w-6 h-6 animate-spin text-blue-500" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z" />
              </svg>
              <p className="text-sm">Traduciendo al español…</p>
            </div>
          ) : translateError ? (
            <div className="p-6 text-red-500 text-sm">{translateError}</div>
          ) : translatedText ? (
            <div className="h-full overflow-auto bg-white">
              <div className="max-w-3xl mx-auto px-8 py-8">
                <div className="flex items-center gap-2 mb-6 text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded-lg w-fit">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                    <path d="M5.85 17.1q-1.275-1.275-1.987-2.888T3.15 12q0-1.65.713-3.263T5.85 5.85l1.425 1.425Q6.2 8.35 5.6 9.562T5 12q0 1.325.6 2.525t1.275 2.15L5.85 17.1Zm2.85-2.85q-.675-.675-1.088-1.575T7.2 10.8q0-.975.413-1.875T8.7 7.35l1.4 1.4q-.4.4-.65.913T9.2 10.8q0 .575.225 1.075t.625.875L8.7 14.25Zm6.6 0-1.425-1.425q.4-.4.65-.9T14.75 10.8q0-.575-.225-1.075T13.9 8.75l1.4-1.4q.675.675 1.088 1.575t.412 1.875q0 .975-.412 1.875t-1.088 1.575ZM18.15 17.1l-1.425-1.425Q17.8 14.6 18.4 13.4T19 10.875q0-1.325-.6-2.512T16.7 6.25l1.45-1.4q1.275 1.3 1.963 2.9T20.8 10.875q0 1.65-.7 3.263T18.15 17.1ZM12 15.5q-1.45 0-2.475-1.025T8.5 12q0-1.45 1.025-2.475T12 8.5q1.45 0 2.475 1.025T15.5 12q0 1.45-1.025 2.475T12 15.5Z"/>
                  </svg>
                  Traducido al español
                </div>
                <pre className="text-sm whitespace-pre-wrap text-gray-800 leading-relaxed font-sans">{translatedText}</pre>
              </div>
            </div>
          ) : null
        ) : ext === 'pdf' ? (
          <iframe src={fileUrl} title={filename} className="w-full h-full border-0" />
        ) : (
          <TextViewer fileUrl={fileUrl} />
        )}
      </div>
    </div>
  )
}

function TextViewer({ fileUrl }) {
  const [content, setContent] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    axios.get(fileUrl, { responseType: 'text' })
      .then(res => setContent(res.data))
      .catch(() => setError('Failed to load file.'))
  }, [fileUrl])

  if (error) return <div className="p-6 text-red-500">{error}</div>
  if (content === null) return <div className="p-6 text-gray-400">Loading…</div>

  return (
    <div className="h-full overflow-auto bg-white">
      <pre className="p-6 text-sm font-mono whitespace-pre-wrap text-gray-800 leading-relaxed">{content}</pre>
    </div>
  )
}
