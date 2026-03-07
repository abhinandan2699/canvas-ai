import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'

function stripExtension(filename) {
  const idx = filename.lastIndexOf('.')
  return idx > 0 ? filename.slice(0, idx) : filename
}

function AssignmentCard({ filename, courseColor, onClick }) {
  const title = stripExtension(filename).replace(/_/g, ' ')
  const ext = filename.split('.').pop().toUpperCase()

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden flex flex-col"
    >
      <div className="h-3" style={{ backgroundColor: courseColor }} />
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-start gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: courseColor + '20' }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke={courseColor} strokeWidth={1.8} className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M16.862 4.487l1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-800 text-sm leading-snug line-clamp-2">{title}</h3>
            <p className="text-xs text-gray-400 mt-0.5">{ext} file</p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ backgroundColor: courseColor + '15', color: courseColor }}>
            Chat with AI
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-blue-50 text-blue-600">
            Task Tracker
          </span>
        </div>
      </div>
    </div>
  )
}

export default function AssignmentListPage() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const [course, setCourse] = useState(null)
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      axios.get('/api/courses'),
      axios.get(`/api/courses/${courseId}/files/assignments`),
    ]).then(([coursesRes, filesRes]) => {
      setCourse(coursesRes.data.find(c => c.id === courseId) || null)
      setFiles(filesRes.data)
    }).finally(() => setLoading(false))
  }, [courseId])

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse h-6 bg-gray-200 rounded w-48 mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-36 bg-white rounded-xl shadow-sm animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <nav className="text-sm text-gray-400 mb-2 flex items-center gap-1.5">
        <button onClick={() => navigate('/dashboard')}
                className="hover:text-gray-600 hover:underline">Dashboard</button>
        <span>/</span>
        <button onClick={() => navigate(`/course/${courseId}`)}
                className="hover:text-gray-600 hover:underline">{course?.name}</button>
        <span>/</span>
        <span className="text-gray-600 font-medium">Assignments</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Assignments</h1>
        <p className="text-gray-500 mt-1">
          {files.length} assignment{files.length !== 1 ? 's' : ''} · Click one to get started
        </p>
      </div>

      {files.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
               className="w-12 h-12 mx-auto mb-3 opacity-40">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M16.862 4.487l1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Z" />
          </svg>
          <p>No assignment files yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {files.map(filename => (
            <AssignmentCard
              key={filename}
              filename={filename}
              courseColor={course?.color || '#3b82f6'}
              onClick={() => navigate(`/course/${courseId}/assignments/${encodeURIComponent(filename)}`)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
