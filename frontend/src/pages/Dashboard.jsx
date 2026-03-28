import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import CourseCard from '../components/CourseCard'
import LanguageSwitcher from '../components/LanguageSwitcher'

export default function Dashboard() {
  const { t } = useTranslation()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    axios.get('/api/courses')
      .then(res => setCourses(res.data))
      .catch(() => setError(t('dashboard.loadError')))
      .finally(() => setLoading(false))
  }, [t])

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">{t('dashboard.title')}</h1>
          <LanguageSwitcher />
        </div>
        <div className="flex gap-4 flex-wrap">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="w-64 h-52 bg-white rounded-lg shadow-sm animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">{t('dashboard.title')}</h1>
          <LanguageSwitcher />
        </div>
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 max-w-lg">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-gray-800">{t('dashboard.title')}</h1>
        <LanguageSwitcher />
      </div>
      {courses.length === 0 ? (
        <p className="text-gray-500">{t('dashboard.noCourses')}</p>
      ) : (
        <div className="flex gap-5 flex-wrap">
          {courses.map(course => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  )
}
