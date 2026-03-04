import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import ReactMarkdown from 'react-markdown'

const WELCOME = { role: 'assistant', content: "Hi! I'm StudyBuddy. I've read all your lecture slides and I'm ready to help. Ask me anything about the course!" }

// ---- Icons ----
function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M3.478 2.405a.75.75 0 0 0-.926.94l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.405Z" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-3.5 h-3.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
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

// ---- Message bubble ----
function Message({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {!isUser && <BotAvatar />}
      <div
        className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? 'bg-purple-700 text-white rounded-tr-sm whitespace-pre-wrap'
            : 'bg-white text-gray-800 shadow-sm rounded-tl-sm'
        }`}
      >
        {isUser ? (
          msg.content
        ) : (
          <div className="prose prose-sm max-w-none prose-p:my-1 prose-headings:mt-3 prose-headings:mb-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0 prose-code:bg-gray-100 prose-code:px-1 prose-code:rounded prose-pre:bg-gray-100 prose-pre:p-3 prose-pre:rounded-lg">
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

// ---- Main page ----
export default function StudyBuddyPage() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const [course, setCourse] = useState(null)
  const [conversations, setConversations] = useState([])
  const [activeConvId, setActiveConvId] = useState(null)
  const [messages, setMessages] = useState([WELCOME])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const bottomRef = useRef(null)
  const activeConvIdRef = useRef(null)

  // Keep ref in sync for use inside async callbacks
  useEffect(() => { activeConvIdRef.current = activeConvId }, [activeConvId])

  useEffect(() => {
    axios.get('/api/courses').then(res => {
      setCourse(res.data.find(c => c.id === courseId) || null)
    })
    axios.get(`/api/courses/${courseId}/conversations`).then(res => {
      setConversations(res.data)
    })
  }, [courseId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function startNewChat() {
    setActiveConvId(null)
    setMessages([WELCOME])
    setInput('')
  }

  async function loadConversation(conv) {
    const { data } = await axios.get(`/api/courses/${courseId}/conversations/${conv.id}`)
    setActiveConvId(data.id)
    setMessages([WELCOME, ...data.messages])
  }

  async function deleteConversation(e, convId) {
    e.stopPropagation()
    await axios.delete(`/api/courses/${courseId}/conversations/${convId}`)
    setConversations(prev => prev.filter(c => c.id !== convId))
    if (activeConvId === convId) startNewChat()
  }

  async function sendMessage() {
    const text = input.trim()
    if (!text || isStreaming) return

    const userMsg = { role: 'user', content: text }
    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    setInput('')
    setIsStreaming(true)

    const convId = activeConvIdRef.current || crypto.randomUUID()
    if (!activeConvIdRef.current) setActiveConvId(convId)

    const title = text.length > 50 ? text.slice(0, 50) + '…' : text

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

      // Finalize message display
      const finalMessages = [...updatedMessages, { role: 'assistant', content: accumulated }]
      setMessages([WELCOME, ...finalMessages.slice(1)])

      // Persist to server (strip WELCOME from saved messages)
      const toSave = finalMessages.filter(m => m !== WELCOME)
      const { data: saved } = await axios.post(`/api/courses/${courseId}/conversations`, {
        id: convId,
        title,
        messages: toSave,
      })

      // Update sidebar list
      setConversations(prev => {
        const exists = prev.find(c => c.id === convId)
        if (exists) return prev.map(c => c.id === convId ? { ...c, title: saved.title } : c)
        return [{ id: saved.id, title: saved.title, createdAt: saved.createdAt }, ...prev]
      })

    } catch {
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

  function formatDate(ts) {
    const d = new Date(ts)
    const now = new Date()
    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
  }

  return (
    <div className="flex h-full">
      {/* Left panel — past conversations */}
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

        <div className="px-3 py-2 border-b border-gray-100">
          <button
            onClick={startNewChat}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium text-purple-700 border border-purple-200 hover:bg-purple-50 transition-colors"
          >
            <PlusIcon />
            New Chat
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-1">
          {conversations.length === 0 ? (
            <p className="px-4 py-6 text-xs text-gray-400 text-center">No past conversations yet.</p>
          ) : (
            conversations.map(conv => (
              <button
                key={conv.id}
                onClick={() => loadConversation(conv)}
                className={`w-full text-left px-3 py-2.5 flex items-start justify-between gap-2 group transition-colors ${
                  activeConvId === conv.id
                    ? 'bg-purple-50 border-r-2 border-purple-600'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="min-w-0">
                  <p className={`text-xs font-medium truncate ${activeConvId === conv.id ? 'text-purple-700' : 'text-gray-700'}`}>
                    {conv.title}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{formatDate(conv.createdAt)}</p>
                </div>
                <span
                  onClick={e => deleteConversation(e, conv.id)}
                  className="flex-shrink-0 mt-0.5 text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <TrashIcon />
                </span>
              </button>
            ))
          )}
        </nav>
      </aside>

      {/* Chat area */}
      <section className="flex-1 flex flex-col overflow-hidden bg-gray-50">
        <div className="px-6 py-3 bg-white border-b border-gray-200 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-purple-700 flex items-center justify-center text-white text-xs font-bold">SB</div>
          <div>
            <h3 className="font-semibold text-gray-800 text-sm">StudyBuddy</h3>
            <p className="text-xs text-gray-400">
              {activeConvId
                ? conversations.find(c => c.id === activeConvId)?.title || 'Conversation'
                : 'New conversation'}
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {messages.map((msg, i) => (
            <Message key={i} msg={msg} />
          ))}
          <div ref={bottomRef} />
        </div>

        <div className="px-6 py-4 bg-white border-t border-gray-200">
          <div className="flex gap-3 items-end">
            <textarea
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
