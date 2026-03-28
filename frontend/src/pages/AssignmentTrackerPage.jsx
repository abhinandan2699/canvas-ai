import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { fetchCourses } from '../api'
import i18n from '../i18n'

function stripExtension(filename) {
  const idx = filename.lastIndexOf('.')
  return idx > 0 ? filename.slice(0, idx) : filename
}

function SpinnerIcon() {
  return (
    <svg className="w-5 h-5 animate-spin text-blue-600" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z" />
    </svg>
  )
}

function SparklesIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path fillRule="evenodd" d="M9 4.5a.75.75 0 0 1 .721.544l.813 2.846a3.75 3.75 0 0 0 2.576 2.576l2.846.813a.75.75 0 0 1 0 1.442l-2.846.813a3.75 3.75 0 0 0-2.576 2.576l-.813 2.846a.75.75 0 0 1-1.442 0l-.813-2.846a3.75 3.75 0 0 0-2.576-2.576l-2.846-.813a.75.75 0 0 1 0-1.442l2.846-.813A3.75 3.75 0 0 0 7.466 7.89l.813-2.846A.75.75 0 0 1 9 4.5ZM18 1.5a.75.75 0 0 1 .728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 0 1 0 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 0 1-1.456 0l-.258-1.036a2.625 2.625 0 0 0-1.91-1.91l-1.036-.258a.75.75 0 0 1 0-1.456l1.036-.258a2.625 2.625 0 0 0 1.91-1.91l.258-1.036A.75.75 0 0 1 18 1.5ZM16.5 15a.75.75 0 0 1 .712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 0 1 0 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 0 1-1.422 0l-.395-1.183a1.5 1.5 0 0 0-.948-.948l-1.183-.395a.75.75 0 0 1 0-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0 1 16.5 15Z" clipRule="evenodd" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  )
}

function RefreshIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
  )
}

function formatHours(h) {
  if (h === 0) return '0h'
  if (h < 1) return `${Math.round(h * 60)}m`
  const hrs = Math.floor(h)
  const mins = Math.round((h - hrs) * 60)
  if (mins === 0) return `${hrs}h`
  return `${hrs}h ${mins}m`
}

function TaskItem({ task, onToggle }) {
  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-xl border transition-all ${
        task.completed
          ? 'bg-green-50 border-green-200 opacity-75'
          : 'bg-white border-gray-200 hover:border-blue-200 hover:shadow-sm'
      }`}
    >
      <button
        onClick={() => onToggle(task.id)}
        className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
          task.completed
            ? 'bg-green-500 border-green-500 text-white'
            : 'border-gray-300 hover:border-blue-500'
        }`}
      >
        {task.completed && (
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
            <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 0 1 .208 1.04l-9 13.5a.75.75 0 0 1-1.154.114l-6-6a.75.75 0 0 1 1.06-1.06l5.353 5.353 8.493-12.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
          </svg>
        )}
      </button>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium leading-snug ${task.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
          {task.title}
        </p>
        {task.description && (
          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{task.description}</p>
        )}
      </div>

      <div className={`flex items-center gap-1 text-xs flex-shrink-0 ${task.completed ? 'text-gray-400' : 'text-blue-600'}`}>
        <ClockIcon />
        <span>{formatHours(task.estimatedHours)}</span>
      </div>
    </div>
  )
}

export default function AssignmentTrackerPage() {
  const { courseId, filename } = useParams()
  const navigate = useNavigate()
  const [course, setCourse] = useState(null)
  const [tasks, setTasks] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState(null)

  const title = stripExtension(filename).replace(/_/g, ' ')

  const totalTasks = tasks?.length || 0
  const completedTasks = tasks?.filter(t => t.completed).length || 0
  const pct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  const remainingHours = tasks
    ? tasks.filter(t => !t.completed).reduce((sum, t) => sum + (t.estimatedHours || 0), 0)
    : 0
  const totalHours = tasks
    ? tasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0)
    : 0

  const saveTasks = useCallback(async (updatedTasks) => {
    try {
      await axios.put(
        `/api/courses/${courseId}/assignments/${encodeURIComponent(filename)}/tracker`,
        { tasks: updatedTasks }
      )
    } catch {
      // silently ignore save errors
    }
  }, [courseId, filename])

  const generateTasks = useCallback(async () => {
    setGenerating(true)
    setError(null)
    try {
      const { data } = await axios.post(
        `/api/courses/${courseId}/assignments/${encodeURIComponent(filename)}/breakdown`,
        { language: i18n.language || 'en' }
      )
      setTasks(data.tasks)
      await saveTasks(data.tasks)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate tasks. Please try again.')
    } finally {
      setGenerating(false)
    }
  }, [courseId, filename, saveTasks])

  useEffect(() => {
    async function load() {
      try {
        const [coursesRes, trackerRes] = await Promise.all([
          fetchCourses(),
          axios.get(`/api/courses/${courseId}/assignments/${encodeURIComponent(filename)}/tracker`),
        ])
        setCourse(coursesRes.data.find(c => c.id === courseId) || null)

        if (trackerRes.data.tasks && trackerRes.data.tasks.length > 0) {
          setTasks(trackerRes.data.tasks)
          setLoading(false)
        } else {
          setLoading(false)
          // Auto-generate on first visit
          await generateTasks()
        }
      } catch {
        setLoading(false)
        setError('Failed to load tracker. Please refresh.')
      }
    }
    load()
  }, [courseId, filename, generateTasks])

  async function toggleTask(id) {
    const updated = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
    setTasks(updated)
    await saveTasks(updated)
  }

  const progressColor = pct === 100 ? '#22c55e' : pct >= 60 ? '#3b82f6' : pct >= 30 ? '#f59e0b' : '#6b7280'

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <SpinnerIcon />
      </div>
    )
  }

  return (
    <div className="p-8 max-w-3xl">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-400 mb-2 flex items-center gap-1.5 flex-wrap">
        <button onClick={() => navigate('/dashboard')} className="hover:text-gray-600 hover:underline">Dashboard</button>
        <span>/</span>
        <button onClick={() => navigate(`/course/${courseId}`)} className="hover:text-gray-600 hover:underline">{course?.name}</button>
        <span>/</span>
        <button onClick={() => navigate(`/course/${courseId}/assignments`)} className="hover:text-gray-600 hover:underline">Assignments</button>
        <span>/</span>
        <button onClick={() => navigate(`/course/${courseId}/assignments/${encodeURIComponent(filename)}`)} className="hover:text-gray-600 hover:underline truncate max-w-[12rem]">{title}</button>
        <span>/</span>
        <span className="text-gray-600 font-medium">Tracker</span>
      </nav>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
        <p className="text-gray-400 text-sm mt-1">Assignment Tracker</p>
      </div>

      {/* Progress card */}
      {tasks && tasks.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-semibold text-gray-700">
                {completedTasks} of {totalTasks} tasks completed
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {pct === 100 ? 'All done — ready to submit!' : `${pct}% complete`}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 font-medium">Time remaining</p>
              <p className="text-lg font-bold" style={{ color: progressColor }}>
                {formatHours(remainingHours)}
              </p>
              <p className="text-xs text-gray-400">of {formatHours(totalHours)} total</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
            <div
              className="h-3 rounded-full transition-all duration-500"
              style={{ width: `${pct}%`, backgroundColor: progressColor }}
            />
          </div>

          {pct === 100 && (
            <div className="mt-3 flex items-center gap-2 text-green-700 text-sm font-medium">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
              </svg>
              Great work! You've completed all tasks.
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Generating state */}
      {generating && (
        <div className="flex flex-col items-center justify-center py-16 text-gray-500">
          <SpinnerIcon />
          <p className="mt-3 text-sm font-medium">AI is breaking down your assignment…</p>
          <p className="text-xs text-gray-400 mt-1">This takes a few seconds</p>
        </div>
      )}

      {/* Task list */}
      {!generating && tasks && tasks.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-700 flex items-center gap-2">
              <SparklesIcon />
              AI-Generated Task Breakdown
            </h2>
            <button
              onClick={generateTasks}
              disabled={generating}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-600 transition-colors disabled:opacity-40"
            >
              <RefreshIcon />
              Regenerate
            </button>
          </div>

          {tasks.map(task => (
            <TaskItem key={task.id} task={task} onToggle={toggleTask} />
          ))}
        </div>
      )}

      {/* Empty / no tasks yet */}
      {!generating && (!tasks || tasks.length === 0) && !error && (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-10 h-10 mb-3 opacity-40">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          <p className="text-sm mb-4">No tasks generated yet</p>
          <button
            onClick={generateTasks}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <SparklesIcon />
            Generate Task Breakdown
          </button>
        </div>
      )}
    </div>
  )
}
