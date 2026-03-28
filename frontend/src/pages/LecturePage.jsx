import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import { fetchCourses } from '../api'

function stripExtension(filename) {
  const idx = filename.lastIndexOf('.')
  return idx > 0 ? filename.slice(0, idx) : filename
}

function OptionCard({ title, description, icon, color, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden w-64"
    >
      <div className="h-32 flex items-center justify-center" style={{ backgroundColor: color }}>
        <div className="text-white opacity-90">{icon}</div>
      </div>
      <div className="p-5">
        <h3 className="text-base font-semibold text-gray-800">{title}</h3>
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      </div>
    </div>
  )
}

const FlashcardsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-14 h-14">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M6.429 9.75 2.25 12l4.179 2.25m0-4.5 5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0 4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0-5.571 3-5.571-3" />
  </svg>
)

const MCQIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-14 h-14">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
)

const ChatIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-14 h-14">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 0 1 .778-.332 48.294 48.294 0 0 0 5.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
  </svg>
)

const MapIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-14 h-14">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" />
  </svg>
)

const HistoryIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-14 h-14">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
  </svg>
)

const ViewSlideIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-14 h-14">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
  </svg>
)

export default function LecturePage() {
  const { courseId, filename } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [course, setCourse] = useState(null)
  const [progress, setProgress] = useState(null)

  useEffect(() => {
    Promise.all([
      fetchCourses(),
      axios.get(`/api/courses/${courseId}/progress`),
    ]).then(([coursesRes, progressRes]) => {
      setCourse(coursesRes.data.find(c => c.id === courseId) || null)
      setProgress(progressRes.data[filename] || null)
    })
  }, [courseId, filename])

  const pct = progress
    ? Math.round((progress.bestScore / progress.totalQuestions) * 100)
    : 0

  return (
    <div className="p-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-400 mb-2 flex items-center gap-1.5 flex-wrap">
        <button onClick={() => navigate('/dashboard')}
                className="hover:text-gray-600 hover:underline">{t('nav.dashboard')}</button>
        <span>/</span>
        <button onClick={() => navigate(`/course/${courseId}`)}
                className="hover:text-gray-600 hover:underline">{course?.name}</button>
        <span>/</span>
        <button onClick={() => navigate(`/course/${courseId}/lectures`)}
                className="hover:text-gray-600 hover:underline">{t('lectures.title')}</button>
        <span>/</span>
        <span className="text-gray-600 font-medium truncate max-w-xs">{stripExtension(filename)}</span>
      </nav>

      {/* Header */}
      <div className="mb-3">
        <h1 className="text-3xl font-bold text-gray-800">{stripExtension(filename)}</h1>
        <p className="text-gray-400 text-sm mt-1">{filename}</p>
      </div>

      {/* Progress bar */}
      {progress && (
        <div className="mb-8 max-w-sm">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>{t('lectures.mcqProgress')}: {progress.bestScore}/{progress.totalQuestions}</span>
            <span className="font-semibold">{pct}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-500"
              style={{
                width: `${pct}%`,
                backgroundColor: pct < 50 ? '#f59e0b' : pct < 80 ? '#3b82f6' : '#22c55e',
              }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">{t('lectures.attempt', { count: progress.attempts })}</p>
        </div>
      )}

      {/* Option cards */}
      <div className="flex gap-6 flex-wrap">
        <OptionCard
          title={t('lectures.viewSlide')}
          description={t('lectures.viewSlideDesc')}
          color="#475569"
          icon={<ViewSlideIcon />}
          onClick={() => navigate(`/course/${courseId}/lectures/${encodeURIComponent(filename)}/view`)}
        />
        <OptionCard
          title={t('lectures.flashcards')}
          description={t('lectures.flashcardsDesc')}
          color="#d97706"
          icon={<FlashcardsIcon />}
          onClick={() => navigate(`/course/${courseId}/lectures/${encodeURIComponent(filename)}/flashcards`)}
        />
        <OptionCard
          title={t('lectures.takeMcq')}
          description={t('lectures.takeMcqDesc')}
          color="#16a34a"
          icon={<MCQIcon />}
          onClick={() => navigate(`/course/${courseId}/lectures/${encodeURIComponent(filename)}/mcq`)}
        />
        <OptionCard
          title={t('lectures.chat')}
          description={t('lectures.chatDesc')}
          color="#522D80"
          icon={<ChatIcon />}
          onClick={() => navigate(`/course/${courseId}/studybuddy`)}
        />
        <OptionCard
          title={t('lectures.learningMap')}
          description={t('lectures.learningMapDesc')}
          color="#0f766e"
          icon={<MapIcon />}
          onClick={() => navigate(`/course/${courseId}/lectures/${encodeURIComponent(filename)}/map`)}
        />
        <OptionCard
          title={t('lectures.scoreHistory')}
          description={t('lectures.scoreHistoryDesc')}
          color="#0369a1"
          icon={<HistoryIcon />}
          onClick={() => navigate(`/course/${courseId}/lectures/${encodeURIComponent(filename)}/history`)}
        />
      </div>
    </div>
  )
}
