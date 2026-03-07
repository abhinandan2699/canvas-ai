import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
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

function MicIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
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

function SparklesIcon({ className = 'w-4 h-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M9 4.5a.75.75 0 0 1 .721.544l.813 2.846a3.75 3.75 0 0 0 2.576 2.576l2.846.813a.75.75 0 0 1 0 1.442l-2.846.813a3.75 3.75 0 0 0-2.576 2.576l-.813 2.846a.75.75 0 0 1-1.442 0l-.813-2.846a3.75 3.75 0 0 0-2.576-2.576l-2.846-.813a.75.75 0 0 1 0-1.442l2.846-.813A3.75 3.75 0 0 0 7.466 7.89l.813-2.846A.75.75 0 0 1 9 4.5ZM18 1.5a.75.75 0 0 1 .728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 0 1 0 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 0 1-1.456 0l-.258-1.036a2.625 2.625 0 0 0-1.91-1.91l-1.036-.258a.75.75 0 0 1 0-1.456l1.036-.258a2.625 2.625 0 0 0 1.91-1.91l.258-1.036A.75.75 0 0 1 18 1.5ZM16.5 15a.75.75 0 0 1 .712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 0 1 0 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 0 1-1.422 0l-.395-1.183a1.5 1.5 0 0 0-.948-.948l-1.183-.395a.75.75 0 0 1 0-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0 1 16.5 15Z" clipRule="evenodd" />
    </svg>
  )
}

function DocumentIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4 flex-shrink-0">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
  )
}

function StopIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path fillRule="evenodd" d="M4.5 7.5a3 3 0 0 1 3-3h9a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-9a3 3 0 0 1-3-3v-9Z" clipRule="evenodd" />
    </svg>
  )
}

function SpeakerIcon({ muted = false }) {
  return muted ? (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06ZM17.78 9.22a.75.75 0 1 0-1.06 1.06L18.44 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06l1.72-1.72 1.72 1.72a.75.75 0 1 0 1.06-1.06L20.56 12l1.72-1.72a.75.75 0 1 0-1.06-1.06l-1.72 1.72-1.72-1.72Z" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06ZM18.584 5.106a.75.75 0 0 1 1.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 0 1-1.06-1.06 8.25 8.25 0 0 0 0-11.668.75.75 0 0 1 0-1.06Z" />
      <path d="M15.932 7.757a.75.75 0 0 1 1.061 0 6 6 0 0 1 0 8.486.75.75 0 0 1-1.06-1.061 4.5 4.5 0 0 0 0-6.364.75.75 0 0 1 0-1.06Z" />
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

// ---- Flip Card ----
function FlipCard({ card, isFlipped, onFlip }) {
  return (
    <div
      className="cursor-pointer select-none"
      style={{ perspective: '1000px', height: '200px' }}
      onClick={onFlip}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          transition: 'transform 0.45s',
          transformStyle: 'preserve-3d',
          WebkitTransformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Front — Question */}
        <div
          className="absolute inset-0 bg-white rounded-xl border-2 border-purple-100 p-4 flex flex-col items-center justify-center shadow-sm hover:shadow-md hover:border-purple-300 transition-shadow overflow-y-auto"
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
        >
          <span className="text-xs text-purple-400 font-semibold uppercase tracking-wider mb-3">Question</span>
          <p className="text-sm text-gray-800 text-center font-medium leading-relaxed">{card.question}</p>
          <span className="text-xs text-gray-300 mt-4">tap to reveal</span>
        </div>
        {/* Back — Answer */}
        <div
          className="absolute inset-0 bg-purple-700 rounded-xl p-4 flex flex-col items-center justify-center shadow-md overflow-y-auto"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <span className="text-xs text-purple-200 font-semibold uppercase tracking-wider mb-3">Answer</span>
          <p className="text-sm text-white text-center leading-relaxed">{card.answer}</p>
        </div>
      </div>
    </div>
  )
}

// ---- Main page ----
export default function StudyBuddyPage() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const routeState = location.state || {}
  const [course, setCourse] = useState(null)
  const [activeTab, setActiveTab] = useState(routeState.tab === 'flashcards' ? 'flashcards' : 'chat')

  // Chat state
  const [conversations, setConversations] = useState([])
  const [activeConvId, setActiveConvId] = useState(null)
  const [messages, setMessages] = useState([WELCOME])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [audioMode, setAudioMode] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoadingAudio, setIsLoadingAudio] = useState(false)
  const bottomRef = useRef(null)
  const activeConvIdRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const currentAudioRef = useRef(null)

  // Flashcard state
  const [lectureFiles, setLectureFiles] = useState([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [flashcards, setFlashcards] = useState([])
  const [generatedFor, setGeneratedFor] = useState(null)
  const [flippedCards, setFlippedCards] = useState(new Set())
  const [flashcardError, setFlashcardError] = useState(null)

  useEffect(() => { activeConvIdRef.current = activeConvId }, [activeConvId])

  useEffect(() => {
    axios.get('/api/courses').then(res => {
      setCourse(res.data.find(c => c.id === courseId) || null)
    })
    axios.get(`/api/courses/${courseId}/conversations`).then(res => {
      setConversations(res.data)
    })
    axios.get(`/api/courses/${courseId}/files/lectures`).then(res => {
      setLectureFiles(res.data)
      if (routeState.file && routeState.tab === 'flashcards') {
        generateFlashcards(routeState.file)
      }
    })
  }, [courseId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ---- Chat functions ----
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

      const finalMessages = [...updatedMessages, { role: 'assistant', content: accumulated }]
      setMessages([WELCOME, ...finalMessages.slice(1)])
      if (audioMode) speakText(accumulated)

      const toSave = finalMessages.filter(m => m !== WELCOME)
      const { data: saved } = await axios.post(`/api/courses/${courseId}/conversations`, {
        id: convId,
        title,
        messages: toSave,
      })

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

  async function startRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const recorder = new MediaRecorder(stream)
    audioChunksRef.current = []
    recorder.ondataavailable = e => audioChunksRef.current.push(e.data)
    recorder.onstop = async () => {
      const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
      stream.getTracks().forEach(t => t.stop())
      await transcribeAudio(blob)
    }
    recorder.start()
    mediaRecorderRef.current = recorder
    setIsRecording(true)
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop()
    setIsRecording(false)
  }

  async function transcribeAudio(blob) {
    const formData = new FormData()
    formData.append('file', blob, 'audio.webm')
    const res = await fetch(`/api/courses/${courseId}/studybuddy/transcribe`, {
      method: 'POST',
      body: formData,
    })
    const data = await res.json()
    if (data.transcript) setInput(prev => prev + data.transcript)
  }

  function stopAudio() {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause()
      currentAudioRef.current = null
    }
    setIsPlaying(false)
    setIsLoadingAudio(false)
  }

  async function speakText(text) {
    stopAudio()
    setIsLoadingAudio(true)
    const res = await fetch(`/api/courses/${courseId}/studybuddy/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const audio = new Audio(url)
    currentAudioRef.current = audio
    setIsLoadingAudio(false)
    setIsPlaying(true)
    audio.play()
    audio.onended = () => {
      URL.revokeObjectURL(url)
      setIsPlaying(false)
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

  // ---- Flashcard functions ----
  async function generateFlashcards(filename) {
    setIsGenerating(true)
    setFlashcards([])
    setFlippedCards(new Set())
    setGeneratedFor(filename)
    setFlashcardError(null)
    try {
      const { data } = await axios.post(`/api/courses/${courseId}/studybuddy/flashcards`, { filename })
      setFlashcards(data.flashcards)
    } catch (err) {
      setFlashcardError(err.response?.data?.detail || 'Failed to generate flashcards. Please try again.')
      setGeneratedFor(null)
    } finally {
      setIsGenerating(false)
    }
  }

  function toggleCard(index) {
    setFlippedCards(prev => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  function resetAllCards() { setFlippedCards(new Set()) }
  function flipAllCards() { setFlippedCards(new Set(flashcards.map((_, i) => i))) }

  return (
    <div className="flex h-full">
      {/* Left sidebar */}
      <aside className="w-64 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-200" style={{ borderLeftWidth: 4, borderLeftColor: '#522D80' }}>
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

      {/* Main content area */}
      <section className="flex-1 flex flex-col overflow-hidden bg-gray-50">
          <div className="px-6 py-3 bg-white border-b border-gray-200 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-700 flex items-center justify-center text-white text-xs font-bold">SB</div>
            <div>
              <h3 className="font-semibold text-gray-800 text-sm">StudyBuddy Chat</h3>
              <p className="text-xs text-gray-400">
                {activeConvId
                  ? conversations.find(c => c.id === activeConvId)?.title || 'Conversation'
                  : 'New conversation'}
              </p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              {isLoadingAudio && (
                <div className="flex items-center gap-1.5 text-xs text-purple-500">
                  <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z" />
                  </svg>
                  <span>Loading audio…</span>
                </div>
              )}
              {isPlaying && (
                <div className="flex items-center gap-2">
                  <div className="flex items-end gap-0.5 h-4">
                    <span className="w-0.5 bg-purple-500 rounded-full animate-[bounce_0.8s_ease-in-out_infinite]" style={{ height: '40%', animationDelay: '0ms' }} />
                    <span className="w-0.5 bg-purple-500 rounded-full animate-[bounce_0.8s_ease-in-out_infinite]" style={{ height: '100%', animationDelay: '150ms' }} />
                    <span className="w-0.5 bg-purple-500 rounded-full animate-[bounce_0.8s_ease-in-out_infinite]" style={{ height: '60%', animationDelay: '300ms' }} />
                    <span className="w-0.5 bg-purple-500 rounded-full animate-[bounce_0.8s_ease-in-out_infinite]" style={{ height: '80%', animationDelay: '100ms' }} />
                    <span className="w-0.5 bg-purple-500 rounded-full animate-[bounce_0.8s_ease-in-out_infinite]" style={{ height: '40%', animationDelay: '250ms' }} />
                  </div>
                  <button
                    onClick={stopAudio}
                    title="Stop audio"
                    className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-100 text-red-500 hover:bg-red-200 transition-colors"
                  >
                    <StopIcon />
                  </button>
                </div>
              )}
              <button
                onClick={() => setAudioMode(prev => !prev)}
                title={audioMode ? 'Disable audio responses' : 'Enable audio responses'}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                  audioMode ? 'bg-purple-700 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                <SpeakerIcon muted={!audioMode} />
              </button>
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
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isStreaming}
                title={isRecording ? 'Stop recording' : 'Record audio'}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors flex-shrink-0 disabled:cursor-not-allowed ${
                  isRecording
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                <MicIcon />
              </button>
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
