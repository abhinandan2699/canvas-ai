import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import ReactMarkdown from 'react-markdown'
import i18n from '../i18n'

function stripExtension(filename) {
  const idx = filename.lastIndexOf('.')
  return idx > 0 ? filename.slice(0, idx) : filename
}

// ── Icons ──────────────────────────────────────────────────────────────────

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M3.478 2.405a.75.75 0 0 0-.926.94l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.405Z" />
    </svg>
  )
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
      <path fillRule="evenodd" d="M12.516 2.17a.75.75 0 0 0-1.032 0 11.209 11.209 0 0 1-7.877 3.08.75.75 0 0 0-.722.515A12.74 12.74 0 0 0 2.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 0 0 .374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 0 0-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.705-3.079Z" clipRule="evenodd" />
    </svg>
  )
}

function SpinnerIcon() {
  return (
    <svg className="w-4 h-4 animate-spin text-blue-500" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z" />
    </svg>
  )
}

function SparklesIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
      <path fillRule="evenodd" d="M9 4.5a.75.75 0 0 1 .721.544l.813 2.846a3.75 3.75 0 0 0 2.576 2.576l2.846.813a.75.75 0 0 1 0 1.442l-2.846.813a3.75 3.75 0 0 0-2.576 2.576l-.813 2.846a.75.75 0 0 1-1.442 0l-.813-2.846a3.75 3.75 0 0 0-2.576-2.576l-2.846-.813a.75.75 0 0 1 0-1.442l2.846-.813A3.75 3.75 0 0 0 7.466 7.89l.813-2.846A.75.75 0 0 1 9 4.5Z" clipRule="evenodd" />
    </svg>
  )
}

function RefreshIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-3.5 h-3.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-3 h-3">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  )
}

// ── Chat components ─────────────────────────────────────────────────────────

function BotAvatar() {
  return (
    <div className="w-7 h-7 rounded-full bg-amber-700 flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">
      AH
    </div>
  )
}

function Message({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {!isUser && <BotAvatar />}
      <div
        className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
          isUser
            ? 'bg-amber-700 text-white rounded-tr-sm whitespace-pre-wrap'
            : 'bg-white text-gray-800 shadow-sm rounded-tl-sm'
        }`}
      >
        {isUser ? (
          msg.content
        ) : (
          <div className="prose prose-sm max-w-none prose-p:my-1 prose-headings:mt-2 prose-headings:mb-1 prose-ul:my-1 prose-li:my-0 prose-code:bg-gray-100 prose-code:px-1 prose-code:rounded prose-pre:bg-gray-100 prose-pre:p-2 prose-pre:rounded-lg prose-pre:text-xs">
            <ReactMarkdown>{msg.content}</ReactMarkdown>
          </div>
        )}
        {msg.streaming && (
          <span className="inline-block w-1.5 h-4 bg-gray-400 ml-0.5 animate-pulse rounded-sm align-middle" />
        )}
      </div>
    </div>
  )
}

// ── Tracker sidebar ─────────────────────────────────────────────────────────

function formatHours(h) {
  if (!h || h === 0) return '0h'
  if (h < 1) return `${Math.round(h * 60)}m`
  const hrs = Math.floor(h)
  const mins = Math.round((h - hrs) * 60)
  return mins === 0 ? `${hrs}h` : `${hrs}h ${mins}m`
}

function TrackerSidebar({ courseId, filename, t }) {
  const [tasks, setTasks] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const saveTasks = useCallback(async (updated) => {
    try {
      await axios.put(
        `/api/courses/${courseId}/assignments/${encodeURIComponent(filename)}/tracker`,
        { tasks: updated }
      )
    } catch {}
  }, [courseId, filename])

  const generate = useCallback(async () => {
    setGenerating(true)
    try {
      const { data } = await axios.post(
        `/api/courses/${courseId}/assignments/${encodeURIComponent(filename)}/breakdown`,
        { language: i18n.language || 'en' }
      )
      setTasks(data.tasks)
      await saveTasks(data.tasks)
    } catch {}
    finally { setGenerating(false) }
  }, [courseId, filename, saveTasks])

  useEffect(() => {
    async function load() {
      try {
        const { data } = await axios.get(
          `/api/courses/${courseId}/assignments/${encodeURIComponent(filename)}/tracker`
        )
        if (data.tasks && data.tasks.length > 0) {
          setTasks(data.tasks)
          setLoaded(true)
        } else {
          setLoaded(true)
          generate()
        }
      } catch {
        setLoaded(true)
      }
    }
    load()
  }, [courseId, filename, generate])

  async function toggle(id) {
    const updated = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
    setTasks(updated)
    await saveTasks(updated)
  }

  const total = tasks?.length || 0
  const done = tasks?.filter(t => t.completed).length || 0
  const pct = total > 0 ? Math.round((done / total) * 100) : 0
  const etc = tasks ? tasks.filter(t => !t.completed).reduce((s, t) => s + (t.estimatedHours || 0), 0) : 0
  const progressColor = pct === 100 ? '#22c55e' : pct >= 60 ? '#3b82f6' : pct >= 30 ? '#f59e0b' : '#9ca3af'

  return (
    <aside className="w-72 flex-shrink-0 border-l border-gray-200 bg-white flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-700">
          <SparklesIcon />
          {t('assignments.trackerTitle')}
        </div>
        <button
          onClick={generate}
          disabled={generating}
          className="text-gray-400 hover:text-blue-500 transition-colors disabled:opacity-40"
          title={t('assignments.regenerateTasks')}
        >
          <RefreshIcon />
        </button>
      </div>

      {/* Progress summary */}
      {tasks && tasks.length > 0 && (
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-gray-500">{t('assignments.tasksDone', { done, total })}</span>
            <span className="font-semibold" style={{ color: progressColor }}>{pct}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${pct}%`, backgroundColor: progressColor }}
            />
          </div>
          <div className="flex items-center gap-1 mt-1.5 text-xs text-gray-500">
            <ClockIcon />
            <span>
              {pct === 100
                ? t('assignments.allDone')
                : t('assignments.remaining', { time: formatHours(etc) })}
            </span>
          </div>
        </div>
      )}

      {/* Task list */}
      <div className="flex-1 overflow-y-auto py-2">
        {generating && (
          <div className="flex flex-col items-center justify-center py-10 gap-2 text-gray-400">
            <SpinnerIcon />
            <p className="text-xs">{t('assignments.generatingTasks')}</p>
          </div>
        )}

        {!generating && loaded && (!tasks || tasks.length === 0) && (
          <div className="flex flex-col items-center justify-center py-10 gap-3 text-gray-400">
            <p className="text-xs text-center px-4">{t('assignments.noTasks')}</p>
            <button
              onClick={generate}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition-colors"
            >
              <SparklesIcon />
              {t('assignments.generate')}
            </button>
          </div>
        )}

        {!generating && tasks && tasks.map(task => (
          <button
            key={task.id}
            onClick={() => toggle(task.id)}
            className={`w-full text-left px-4 py-2.5 flex items-start gap-2.5 border-b border-gray-50 transition-colors ${
              task.completed ? 'bg-green-50' : 'hover:bg-gray-50'
            }`}
          >
            {/* Checkbox */}
            <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
              task.completed ? 'bg-green-500 border-green-500' : 'border-gray-300'
            }`}>
              {task.completed && (
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-2.5 h-2.5 text-white">
                  <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 0 1 .208 1.04l-9 13.5a.75.75 0 0 1-1.154.114l-6-6a.75.75 0 0 1 1.06-1.06l5.353 5.353 8.493-12.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
                </svg>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className={`text-xs font-medium leading-snug ${task.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                {task.title}
              </p>
              {task.estimatedHours > 0 && (
                <span className={`text-xs flex items-center gap-0.5 mt-0.5 ${task.completed ? 'text-gray-300' : 'text-blue-500'}`}>
                  <ClockIcon />
                  {formatHours(task.estimatedHours)}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    </aside>
  )
}

// Quick prompts are translated in the component via t('assignments.prompt1') etc.

// ── Main page ────────────────────────────────────────────────────────────────

export default function AssignmentChatPage() {
  const { courseId, filename } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [course, setCourse] = useState(null)
  const [messages, setMessages] = useState(() => [{ role: 'assistant', content: i18n.t('assignments.welcome') }])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const bottomRef = useRef(null)

  const title = stripExtension(filename).replace(/_/g, ' ')
  const quickPrompts = [t('assignments.prompt1'), t('assignments.prompt2'), t('assignments.prompt3'), t('assignments.prompt4'), t('assignments.prompt5'), t('assignments.prompt6')]

  useEffect(() => {
    axios.get('/api/courses').then(res => {
      setCourse(res.data.find(c => c.id === courseId) || null)
    })
  }, [courseId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(text) {
    const msgText = (text || input).trim()
    if (!msgText || isStreaming) return

    const userMsg = { role: 'user', content: msgText }
    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    setInput('')
    setIsStreaming(true)
    setMessages(prev => [...prev, { role: 'assistant', content: '', streaming: true }])

    try {
      const res = await fetch(
        `/api/courses/${courseId}/assignments/${encodeURIComponent(filename)}/chat`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
            language: i18n.language || 'en',
          }),
        }
      )
      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        for (const line of chunk.split('\n')) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6)
          if (data === '[DONE]') break
          try {
            accumulated += JSON.parse(data)
            setMessages(prev => {
              const updated = [...prev]
              updated[updated.length - 1] = { role: 'assistant', content: accumulated, streaming: true }
              return updated
            })
          } catch {}
        }
      }

      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = { role: 'assistant', content: accumulated }
        return updated
      })
    } catch {
      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = {
          role: 'assistant',
          content: t('assignments.chatError'),
        }
        return updated
      })
    } finally {
      setIsStreaming(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* ── Chat panel ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="px-5 py-2.5 bg-white border-b border-gray-200 flex items-center gap-3 flex-shrink-0">
          <div className="w-7 h-7 rounded-full bg-amber-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            AH
          </div>
          <div className="flex-1 min-w-0">
            <nav className="text-xs text-gray-400 flex items-center gap-1 flex-wrap leading-tight">
              <button onClick={() => navigate('/dashboard')} className="hover:text-gray-600">{t('nav.dashboard')}</button>
              <span>/</span>
              <button onClick={() => navigate(`/course/${courseId}`)} className="hover:text-gray-600">{course?.name}</button>
              <span>/</span>
              <button onClick={() => navigate(`/course/${courseId}/assignments`)} className="hover:text-gray-600">{t('assignments.title')}</button>
              <span>/</span>
              <button onClick={() => navigate(`/course/${courseId}/assignments/${encodeURIComponent(filename)}`)} className="hover:text-gray-600 truncate max-w-[10rem]">{title}</button>
            </nav>
            <p className="font-semibold text-gray-800 text-sm truncate">{t('assignments.assignmentChatTitle')}</p>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 border border-green-200 text-green-700 text-xs font-medium flex-shrink-0">
            <ShieldIcon />
            {t('assignments.guardrailsActive')}
          </div>
        </div>

        {/* Quick prompts */}
        <div className="px-5 py-2 bg-gray-50 border-b border-gray-100 flex gap-2 overflow-x-auto flex-shrink-0 scrollbar-none">
          {quickPrompts.map(p => (
            <button
              key={p}
              onClick={() => sendMessage(p)}
              disabled={isStreaming}
              className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-800 transition-colors disabled:opacity-40"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3.5 bg-gray-50">
          {messages.map((msg, i) => (
            <Message key={i} msg={msg} />
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-5 py-3 bg-white border-t border-gray-200 flex-shrink-0">
          <div className="flex gap-2.5 items-end">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('assignments.placeholder')}
              rows={1}
              disabled={isStreaming}
              className="flex-1 resize-none rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:opacity-50 leading-relaxed"
              style={{ maxHeight: '120px', overflowY: 'auto' }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || isStreaming}
              className="w-9 h-9 rounded-xl bg-amber-700 text-white flex items-center justify-center hover:bg-amber-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
            >
              <SendIcon />
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
            <ShieldIcon />
            {t('assignments.wontSolve')}
          </p>
        </div>
      </div>

      {/* ── Tracker sidebar ── */}
      <TrackerSidebar courseId={courseId} filename={filename} t={t} />
    </div>
  )
}
