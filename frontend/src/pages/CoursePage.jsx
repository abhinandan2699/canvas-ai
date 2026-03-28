import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import axios from 'axios'

function FileTypeCard({ title, description, icon, color, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden w-72"
    >
      <div className="h-32 flex items-center justify-center" style={{ backgroundColor: color }}>
        <div className="text-white opacity-80">{icon}</div>
      </div>
      <div className="p-5">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      </div>
    </div>
  )
}

const LectureIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-16 h-16">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5m.75-9 3-3 2.148 2.148A12.061 12.061 0 0 1 16.5 7.605" />
  </svg>
)

const AssignmentIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-16 h-16">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M16.862 4.487l1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
  </svg>
)

const StudyBuddyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-16 h-16">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 0 1 .778-.332 48.294 48.294 0 0 0 5.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
  </svg>
)

export default function CoursePage() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [course, setCourse] = useState(null)

  useEffect(() => {
    axios.get('/api/courses').then(res => {
      const found = res.data.find(c => c.id === courseId)
      setCourse(found || null)
    })
  }, [courseId])

  if (!course) {
    return (
      <div className="p-8">
        <div className="animate-pulse h-8 bg-gray-200 rounded w-64 mb-8" />
        <div className="flex gap-5">
          <div className="w-72 h-52 bg-white rounded-lg shadow-sm animate-pulse" />
          <div className="w-72 h-52 bg-white rounded-lg shadow-sm animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-400 mb-2">
        <button onClick={() => navigate('/dashboard')} className="hover:text-gray-600 hover:underline">
          {t('nav.dashboard')}
        </button>
        <span className="mx-2">/</span>
        <span className="text-gray-600 font-medium">{course.name}</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">{course.name}</h1>
        <p className="text-gray-500 mt-1">{course.code} · {course.term}</p>
      </div>

      {/* Cards */}
      <div className="flex gap-6 flex-wrap">
        <FileTypeCard
          title={t('course.lectureSlides')}
          description={t('course.lectureSlidesDesc')}
          color={course.color}
          icon={<LectureIcon />}
          onClick={() => navigate(`/course/${courseId}/lectures`)}
        />
        <FileTypeCard
          title={t('course.assignments')}
          description={t('course.assignmentsDesc')}
          color={course.color}
          icon={<AssignmentIcon />}
          onClick={() => navigate(`/course/${courseId}/assignments`)}
        />
      </div>
    </div>
  )
}
