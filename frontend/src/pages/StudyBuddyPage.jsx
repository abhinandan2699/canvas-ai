import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M3.478 2.405a.75.75 0 0 0-.926.94l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.405Z" />
    </svg>
  )
}

function BotAvatar() {
  return (
    <div className="w-8 h-8 rounded-full bg-purple-700 flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">
      SB
    </div>
  )
}

function Message({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {!isUser && <BotAvatar />}
      <div
        className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? 'bg-purple-700 text-white rounded-tr-sm'
            : 'bg-white text-gray-800 shadow-sm rounded-tl-sm'
        }`}
      >
        {msg.content}
        {msg.streaming && (
          <span className="inline-block w-1.5 h-4 bg-gray-400 ml-0.5 animate-pulse rounded-sm align-middle" />
        )}
      </div>
    </div>
  )
}

export default function StudyBuddyPage() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const [course, setCourse] = useState(null)
  const [lectureFiles, setLectureFiles] = useState([])
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm StudyBuddy. I've read all your lecture slides and I'm ready to help. Ask me anything about the course!" }
  ])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const bottomRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    axios.get('/api/courses').then(res => {
      setCourse(res.data.find(c => c.id === courseId) || null)
    })
    axios.get(`/api/courses/${courseId}/files/lectures`).then(res => {
      setLectureFiles(res.data)
    })
  }, [courseId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage() {
    const text = input.trim()
    if (!text || isStreaming) return

    const userMsg = { role: 'user', content: text }
    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    setInput('')
    setIsStreaming(true)

    // Add empty assistant message that will be streamed into
    setMessages(prev => [...prev, { role: 'assistant', content: '', streaming: true }])

    try {
      const res = await fetch(`/api/courses/${courseId}/studybuddy/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content }))
        }),
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6)
          if (data === '[DONE]') break
          try {
            const text = JSON.parse(data)
            accumulated += text
            setMessages(prev => {
              const updated = [...prev]
              updated[updated.length - 1] = { role: 'assistant', content: accumulated, streaming: true }
              return updated
            })
          } catch {}
        }
      }

      // Finalize — remove streaming flag
      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = { role: 'assistant', content: accumulated }
        return updated
      })
    } catch (err) {
      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = {
          role: 'assistant',
          content: 'Sorry, something went wrong. Please check that the backend is running and your API key is set.'
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

  const courseColor = course?.color || '#522D80'

  return (
    <div className="flex h-full">
      {/* Left panel — context info */}
      <aside className="w-64 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">
        <div className="px-4 py-3 border-b border-gray-200" style={{ borderLeftWidth: 4, borderLeftColor: '#522D80' }}>
          <button
            onClick={() => navigate(`/course/${courseId}`)}
            className="text-xs text-gray-400 hover:text-gray-600 mb-1 block"
          >
            ← Back to course
          </button>
          <h2 className="font-semibold text-gray-800 text-sm">StudyBuddy</h2>
          {course && <p className="text-xs text-gray-400 truncate mt-0.5">{course.name}</p>}
        </div>

        <div className="px-4 py-3 flex-1 overflow-y-auto">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Loaded context</p>
          {lectureFiles.length === 0 ? (
            <p className="text-xs text-gray-400">No lecture files yet. Add PDFs or PPTX to the lectures folder.</p>
          ) : (
            <ul className="space-y-1">
              {lectureFiles.map(f => (
                <li key={f} className="flex items-center gap-1.5 text-xs text-gray-600">
                  <span className="text-green-500">✓</span>
                  <span className="truncate">{f}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>

      {/* Chat area */}
      <section className="flex-1 flex flex-col overflow-hidden bg-gray-50">
        {/* Header */}
        <div className="px-6 py-3 bg-white border-b border-gray-200 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-purple-700 flex items-center justify-center text-white text-xs font-bold">SB</div>
          <div>
            <h3 className="font-semibold text-gray-800 text-sm">StudyBuddy</h3>
            <p className="text-xs text-gray-400">
              {lectureFiles.length > 0
                ? `Context: ${lectureFiles.length} lecture file${lectureFiles.length !== 1 ? 's' : ''}`
                : 'No lecture files loaded'}
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {messages.map((msg, i) => (
            <Message key={i} msg={msg} />
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input bar */}
        <div className="px-6 py-4 bg-white border-t border-gray-200">
          <div className="flex gap-3 items-end">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about the lecture slides… (Enter to send, Shift+Enter for newline)"
              rows={1}
              disabled={isStreaming}
              className="flex-1 resize-none rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 leading-relaxed"
              style={{ maxHeight: '120px', overflowY: 'auto' }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isStreaming}
              className="w-10 h-10 rounded-xl bg-purple-700 text-white flex items-center justify-center hover:bg-purple-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
            >
              <SendIcon />
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
