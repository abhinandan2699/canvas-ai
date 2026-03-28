import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import { fetchCourses } from '../api'

function getFileIcon(filename) {
  const ext = filename.split('.').pop().toLowerCase()
  if (['pdf'].includes(ext)) return '📄'
  if (['ppt', 'pptx'].includes(ext)) return '📊'
  if (['doc', 'docx'].includes(ext)) return '📝'
  if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext)) return '🖼️'
  if (['mp4', 'mov', 'avi', 'mkv'].includes(ext)) return '🎥'
  if (['py', 'js', 'ts', 'java', 'cpp', 'c', 'go', 'rs'].includes(ext)) return '💻'
  if (['txt', 'md'].includes(ext)) return '📃'
  return '📁'
}

function FileViewer({ courseId, fileType, filename }) {
  const ext = filename.split('.').pop().toLowerCase()
  const fileUrl = `/api/courses/${courseId}/files/${fileType}/${encodeURIComponent(filename)}`

  if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext)) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 p-4">
        <img src={fileUrl} alt={filename} className="max-w-full max-h-full object-contain rounded shadow" />
      </div>
    )
  }

  if (['mp4', 'mov', 'webm'].includes(ext)) {
    return (
      <div className="flex items-center justify-center h-full bg-black">
        <video controls className="max-w-full max-h-full">
          <source src={fileUrl} />
          Your browser does not support video playback.
        </video>
      </div>
    )
  }

  if (['txt', 'md', 'py', 'js', 'ts', 'java', 'cpp', 'c', 'go', 'rs', 'html', 'css', 'json'].includes(ext)) {
    return <TextViewer fileUrl={fileUrl} filename={filename} />
  }

  // PDF and other: use iframe
  return (
    <iframe
      src={fileUrl}
      title={filename}
      className="w-full h-full border-0"
    />
  )
}

function TextViewer({ fileUrl, filename }) {
  const [content, setContent] = useState(null)
  const [error, setError] = useState(null)

  const { t } = useTranslation()
  useEffect(() => {
    axios.get(fileUrl, { responseType: 'text' })
      .then(res => setContent(res.data))
      .catch(() => setError(t('fileViewer.failedToLoadFile')))
  }, [fileUrl, t])

  if (error) return <div className="p-6 text-red-500">{error}</div>
  if (content === null) return <div className="p-6 text-gray-400">{t('fileViewer.loading')}</div>

  const ext = filename.split('.').pop().toLowerCase()
  const isMarkdown = ext === 'md'

  return (
    <div className="h-full overflow-auto bg-white">
      <pre className="p-6 text-sm font-mono whitespace-pre-wrap text-gray-800 leading-relaxed">
        {content}
      </pre>
    </div>
  )
}

export default function FileViewerPage() {
  const { courseId, fileType } = useParams()
  const navigate = useNavigate()
  const [files, setFiles] = useState([])
  const [selectedFile, setSelectedFile] = useState(null)
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const { t } = useTranslation()
  const title = fileType === 'lectures' ? t('fileViewer.lectureSlides') : t('fileViewer.assignments')

  useEffect(() => {
    Promise.all([
      fetchCourses(),
      axios.get(`/api/courses/${courseId}/files/${fileType}`)
    ]).then(([coursesRes, filesRes]) => {
      const found = coursesRes.data.find(c => c.id === courseId)
      setCourse(found || null)
      setFiles(filesRes.data)
      if (filesRes.data.length > 0) setSelectedFile(filesRes.data[0])
    }).catch(() => setError(t('fileViewer.failedToLoad')))
      .finally(() => setLoading(false))
  }, [courseId, fileType])

  if (loading) {
    return (
      <div className="flex h-full">
        <div className="w-64 bg-white border-r border-gray-200 animate-pulse" />
        <div className="flex-1 bg-gray-50 animate-pulse" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 text-red-500">{error}</div>
    )
  }

  const courseColor = course?.color || '#522D80'

  return (
    <div className="flex h-full">
      {/* Left file submenu */}
      <aside className="w-64 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-200" style={{ borderLeftWidth: 4, borderLeftColor: courseColor }}>
          <button
            onClick={() => navigate(`/course/${courseId}`)}
            className="text-xs text-gray-400 hover:text-gray-600 mb-1 block"
          >
            {t('fileViewer.backToCourse')}
          </button>
          <h2 className="font-semibold text-gray-800 text-sm">{title}</h2>
          {course && <p className="text-xs text-gray-400 truncate mt-0.5">{course.name}</p>}
        </div>

        {/* File list */}
        <nav className="flex-1 overflow-y-auto py-2">
          {files.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <p className="text-xs text-gray-400">{t('fileViewer.noFilesUploaded')}</p>
              <p className="text-xs text-gray-300 mt-1">
                {t('fileViewer.addFilesTo')}<br />
                <code className="text-gray-400">backend/courses/{courseId}/{fileType}/</code>
              </p>
            </div>
          ) : (
            files.map(file => (
              <button
                key={file}
                onClick={() => setSelectedFile(file)}
                className={`w-full text-left px-4 py-2.5 flex items-start gap-2 transition-colors text-sm ${
                  selectedFile === file
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className="text-base flex-shrink-0 mt-0.5">{getFileIcon(file)}</span>
                <span className="break-all leading-tight">{file}</span>
              </button>
            ))
          )}
        </nav>
      </aside>

      {/* Main file viewer area */}
      <section className="flex-1 flex flex-col overflow-hidden">
        {selectedFile ? (
          <>
            {/* File title bar */}
            <div className="px-5 py-3 bg-white border-b border-gray-200 flex items-center gap-2">
              <span className="text-lg">{getFileIcon(selectedFile)}</span>
              <h3 className="font-medium text-gray-800 text-sm">{selectedFile}</h3>
            </div>
            {/* File content */}
            <div className="flex-1 overflow-hidden">
              <FileViewer courseId={courseId} fileType={fileType} filename={selectedFile} />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <p className="text-5xl mb-4">📂</p>
              <p className="text-lg font-medium">{t('fileViewer.noFilesYet')}</p>
              <p className="text-sm mt-1">
                {t('fileViewer.dropFilesInto')}{' '}
                <code className="bg-gray-100 px-1 rounded text-gray-500">
                  backend/courses/{courseId}/{fileType}/
                </code>
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
