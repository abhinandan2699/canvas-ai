import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'

function stripExtension(filename) {
  const idx = filename.lastIndexOf('.')
  return idx > 0 ? filename.slice(0, idx) : filename
}

export default function AssignmentViewPage() {
  const { courseId, filename } = useParams()
  const navigate = useNavigate()
  const [course, setCourse] = useState(null)

  const title = stripExtension(filename).replace(/_/g, ' ')
  const fileUrl = `/api/courses/${courseId}/files/assignments/${encodeURIComponent(filename)}`
  const ext = filename.split('.').pop().toLowerCase()

  useEffect(() => {
    axios.get('/api/courses').then(res => {
      setCourse(res.data.find(c => c.id === courseId) || null)
    })
  }, [courseId])

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="px-5 py-3 bg-white border-b border-gray-200 flex items-center gap-3 flex-shrink-0">
        <div>
          <nav className="text-xs text-gray-400 flex items-center gap-1 flex-wrap">
            <button onClick={() => navigate('/dashboard')} className="hover:text-gray-600">Dashboard</button>
            <span>/</span>
            <button onClick={() => navigate(`/course/${courseId}`)} className="hover:text-gray-600">{course?.name}</button>
            <span>/</span>
            <button onClick={() => navigate(`/course/${courseId}/assignments`)} className="hover:text-gray-600">Assignments</button>
            <span>/</span>
            <button onClick={() => navigate(`/course/${courseId}/assignments/${encodeURIComponent(filename)}`)} className="hover:text-gray-600">{title}</button>
            <span>/</span>
            <span className="text-gray-600 font-medium">View</span>
          </nav>
          <h3 className="font-semibold text-gray-800 text-sm mt-0.5">{title}</h3>
        </div>
        <a
          href={fileUrl}
          download={filename}
          className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-medium transition-colors"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Download
        </a>
      </div>

      {/* File viewer */}
      <div className="flex-1 overflow-hidden bg-gray-100">
        {ext === 'pdf' ? (
          <iframe
            src={fileUrl}
            title={filename}
            className="w-full h-full border-0"
          />
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
