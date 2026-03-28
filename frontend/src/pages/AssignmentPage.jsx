import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import { fetchCourses } from '../api'

function stripExtension(filename) {
  const idx = filename.lastIndexOf('.')
  return idx > 0 ? filename.slice(0, idx) : filename
}

function OptionCard({ title, description, icon, color, badge, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden w-64"
    >
      <div className="h-32 flex items-center justify-center" style={{ backgroundColor: color }}>
        <div className="text-white opacity-90">{icon}</div>
      </div>
      <div className="p-5">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-base font-semibold text-gray-800">{title}</h3>
          {badge && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-green-100 text-green-700 font-medium">{badge}</span>
          )}
        </div>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </div>
  )
}

const ViewIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-14 h-14">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
  </svg>
)

const ChatIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-14 h-14">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 0 1 .778-.332 48.294 48.294 0 0 0 5.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
  </svg>
)

export default function AssignmentPage() {
  const { courseId, filename } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [course, setCourse] = useState(null)

  useEffect(() => {
    fetchCourses().then(res => {
      setCourse(res.data.find(c => c.id === courseId) || null)
    })
  }, [courseId])

  const title = stripExtension(filename).replace(/_/g, ' ')

  return (
    <div className="p-8">
      <nav className="text-sm text-gray-400 mb-2 flex items-center gap-1.5 flex-wrap">
        <button onClick={() => navigate('/dashboard')}
                className="hover:text-gray-600 hover:underline">{t('nav.dashboard')}</button>
        <span>/</span>
        <button onClick={() => navigate(`/course/${courseId}`)}
                className="hover:text-gray-600 hover:underline">{course?.name}</button>
        <span>/</span>
        <button onClick={() => navigate(`/course/${courseId}/assignments`)}
                className="hover:text-gray-600 hover:underline">{t('assignments.title')}</button>
        <span>/</span>
        <span className="text-gray-600 font-medium truncate max-w-xs">{title}</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
        <p className="text-gray-400 text-sm mt-1">{filename}</p>
      </div>

      <div className="flex gap-6 flex-wrap">
        <OptionCard
          title={t('assignments.viewAssignment')}
          description={t('assignments.viewAssignmentDesc')}
          color="#374151"
          icon={<ViewIcon />}
          onClick={() => navigate(`/course/${courseId}/assignments/${encodeURIComponent(filename)}/view`)}
        />
        <OptionCard
          title={t('assignments.assignmentChat')}
          description={t('assignments.assignmentChatDesc')}
          color="#b45309"
          icon={<ChatIcon />}
          badge={t('assignments.guardrailsOn')}
          onClick={() => navigate(`/course/${courseId}/assignments/${encodeURIComponent(filename)}/chat`)}
        />
      </div>
    </div>
  )
}
