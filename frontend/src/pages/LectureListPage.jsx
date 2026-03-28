import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import { fetchCourses } from '../api'

function stripExtension(filename) {
  const idx = filename.lastIndexOf('.')
  return idx > 0 ? filename.slice(0, idx) : filename
}

function ProgressBar({ pct }) {
  return (
    <div className="w-full bg-gray-100 rounded-full h-2 mt-3">
      <div
        className="h-2 rounded-full transition-all duration-500"
        style={{
          width: `${pct}%`,
          backgroundColor: pct === 0 ? 'transparent' : pct < 50 ? '#f59e0b' : pct < 80 ? '#3b82f6' : '#22c55e',
        }}
      />
    </div>
  )
}

function LectureCard({ filename, progress, courseColor, onClick }) {
  const { t } = useTranslation()
  const title = stripExtension(filename)
  const pct = progress
    ? Math.round((progress.bestScore / progress.totalQuestions) * 100)
    : 0
  const attempted = progress && progress.attempts > 0

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden flex flex-col"
    >
      <div className="h-3" style={{ backgroundColor: courseColor }} />
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-start gap-3 mb-auto">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
               style={{ backgroundColor: courseColor + '20' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke={courseColor} strokeWidth={1.8}
                 className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-800 text-sm leading-snug line-clamp-2">{title}</h3>
            <p className="text-xs text-gray-400 mt-0.5">{filename.split('.').pop().toUpperCase()}</p>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>{attempted ? `${t('lectures.best')}: ${progress.bestScore}/${progress.totalQuestions}` : t('lectures.notStarted')}</span>
            <span className="font-medium" style={{ color: pct === 0 ? '#9ca3af' : pct < 50 ? '#f59e0b' : pct < 80 ? '#3b82f6' : '#22c55e' }}>
              {attempted ? `${pct}%` : '—'}
            </span>
          </div>
          <ProgressBar pct={pct} />
          {attempted && (
            <p className="text-xs text-gray-400 mt-1.5">
              {t('lectures.attempt', { count: progress.attempts })}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default function LectureListPage() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [course, setCourse] = useState(null)
  const [files, setFiles] = useState([])
  const [progress, setProgress] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetchCourses(),
      axios.get(`/api/courses/${courseId}/files/lectures`),
      axios.get(`/api/courses/${courseId}/progress`),
    ]).then(([coursesRes, filesRes, progressRes]) => {
      const found = coursesRes.data.find(c => c.id === courseId)
      setCourse(found || null)
      setFiles(filesRes.data)
      setProgress(progressRes.data)
    }).finally(() => setLoading(false))
  }, [courseId])

  const handleCardClick = (filename) => {
    navigate(`/course/${courseId}/lectures/${encodeURIComponent(filename)}`)
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse h-6 bg-gray-200 rounded w-48 mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-40 bg-white rounded-xl shadow-sm animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-400 mb-2 flex items-center gap-1.5">
        <button onClick={() => navigate('/dashboard')}
                className="hover:text-gray-600 hover:underline">{t('nav.dashboard')}</button>
        <span>/</span>
        <button onClick={() => navigate(`/course/${courseId}`)}
                className="hover:text-gray-600 hover:underline">{course?.name}</button>
        <span>/</span>
        <span className="text-gray-600 font-medium">{t('lectures.title')}</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">{t('lectures.title')}</h1>
        <p className="text-gray-500 mt-1">{t('lectures.countClick', { count: files.length })}</p>
      </div>

      {files.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
               className="w-12 h-12 mx-auto mb-3 opacity-40">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
          </svg>
          <p>{t('lectures.noFiles')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {files.map(filename => (
            <LectureCard
              key={filename}
              filename={filename}
              progress={progress[filename]}
              courseColor={course?.color || '#3b82f6'}
              onClick={() => handleCardClick(filename)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
