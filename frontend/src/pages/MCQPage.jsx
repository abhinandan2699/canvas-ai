import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'

function stripExtension(filename) {
  const idx = filename.lastIndexOf('.')
  return idx > 0 ? filename.slice(0, idx) : filename
}

// ── Idle screen ──────────────────────────────────────────────────────────────
function IdleScreen({ filename, onGenerate }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 text-center px-4">
      <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
        <svg viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth={1.5} className="w-10 h-10">
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      </div>
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-1">Ready to test your knowledge?</h2>
        <p className="text-gray-500 text-sm">{stripExtension(filename)}</p>
      </div>
      <p className="text-gray-400 text-sm max-w-sm">
        The AI will generate 10–15 multiple-choice questions covering all the key topics in this lecture.
      </p>
      <button
        onClick={onGenerate}
        className="px-8 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors shadow-sm"
      >
        Generate MCQ
      </button>
    </div>
  )
}

// ── Loading screen ────────────────────────────────────────────────────────────
function LoadingScreen({ filename }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-4">
      <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
      <p className="text-gray-600 font-medium">Generating questions…</p>
      <p className="text-gray-400 text-sm">{stripExtension(filename)}</p>
    </div>
  )
}

// ── Quiz screen ───────────────────────────────────────────────────────────────
function QuizScreen({ questions, courseId, filename, navigate }) {
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const [score, setScore] = useState(0)
  const [weakAreas, setWeakAreas] = useState([])
  const [done, setDone] = useState(false)
  const [newBest, setNewBest] = useState(false)
  const [saving, setSaving] = useState(false)

  const q = questions[index]
  const isLast = index === questions.length - 1

  const handleSelect = (i) => {
    if (revealed) return
    setSelected(i)
    setRevealed(true)
    if (i === q.correct) {
      setScore(s => s + 1)
    } else {
      setWeakAreas(prev => [...prev, q.topic || q.question])
    }
  }

  const handleNext = async () => {
    if (isLast) {
      setSaving(true)
      try {
        const res = await axios.post(
          `/api/courses/${courseId}/progress/${encodeURIComponent(filename)}`,
          { score, totalQuestions: questions.length, weakAreas }
        )
        if (res.data.bestScore === score && res.data.attempts === 1) setNewBest(true)
        else if (res.data.bestScore <= score) setNewBest(true)
      } catch (e) {
        console.error('Failed to save progress', e)
      }
      setSaving(false)
      setDone(true)
    } else {
      setIndex(i => i + 1)
      setSelected(null)
      setRevealed(false)
    }
  }

  if (done) {
    const pct = Math.round((score / questions.length) * 100)
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6 text-center px-4">
        <div className={`w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-md`}
             style={{ backgroundColor: pct >= 80 ? '#22c55e' : pct >= 50 ? '#3b82f6' : '#f59e0b' }}>
          {pct}%
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            {pct >= 80 ? 'Excellent work!' : pct >= 50 ? 'Good effort!' : 'Keep studying!'}
          </h2>
          <p className="text-gray-500 mt-1">You scored <strong>{score}</strong> out of <strong>{questions.length}</strong></p>
          {newBest && (
            <p className="text-green-600 font-semibold mt-2">New best score!</p>
          )}
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate(`/course/${courseId}/lectures/${encodeURIComponent(filename)}`)}
            className="px-6 py-2.5 border border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition-colors"
          >
            Back to Lecture
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors"
          >
            Retake
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Progress header */}
      <div className="px-8 pt-8 pb-4">
        <div className="flex justify-between items-center text-sm text-gray-500 mb-2">
          <span>Question {index + 1} of {questions.length}</span>
          <span>{score} correct</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-1.5">
          <div
            className="h-1.5 rounded-full bg-green-500 transition-all duration-300"
            style={{ width: `${((index) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question card */}
      <div className="flex-1 overflow-y-auto px-8 pb-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-4">
            <p className="text-lg font-semibold text-gray-800 leading-relaxed">{q.question}</p>
          </div>

          {/* Options */}
          <div className="flex flex-col gap-3">
            {q.options.map((opt, i) => {
              let bg = 'bg-white hover:bg-gray-50 border-gray-200'
              let text = 'text-gray-700'
              if (revealed) {
                if (i === q.correct) {
                  bg = 'bg-green-50 border-green-400'
                  text = 'text-green-800'
                } else if (i === selected) {
                  bg = 'bg-red-50 border-red-400'
                  text = 'text-red-800'
                } else {
                  bg = 'bg-white border-gray-200 opacity-50'
                }
              }
              return (
                <button
                  key={i}
                  onClick={() => handleSelect(i)}
                  disabled={revealed}
                  className={`w-full text-left px-5 py-4 rounded-xl border-2 font-medium transition-all ${bg} ${text} disabled:cursor-default`}
                >
                  {opt}
                </button>
              )
            })}
          </div>

          {/* Explanation */}
          {revealed && q.explanation && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800">
              <strong>Explanation:</strong> {q.explanation}
            </div>
          )}

          {/* Next button */}
          {revealed && (
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleNext}
                disabled={saving}
                className="px-7 py-2.5 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving…' : isLast ? 'See Results' : 'Next →'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function MCQPage() {
  const { courseId, filename } = useParams()
  const navigate = useNavigate()
  const [phase, setPhase] = useState('idle') // idle | loading | quiz | error
  const [questions, setQuestions] = useState([])
  const [error, setError] = useState('')

  const generate = async () => {
    setPhase('loading')
    setError('')
    try {
      const res = await axios.post(`/api/courses/${courseId}/studybuddy/mcq`, { filename })
      setQuestions(res.data.questions)
      setPhase('quiz')
    } catch (e) {
      setError(e.response?.data?.detail || 'Failed to generate questions. Please try again.')
      setPhase('idle')
    }
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-8 py-4 border-b border-gray-100 bg-white flex-shrink-0">
        <button
          onClick={() => navigate(`/course/${courseId}/lectures/${encodeURIComponent(filename)}`)}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
        </button>
        <div>
          <p className="text-xs text-gray-400 leading-none">MCQ Quiz</p>
          <p className="text-sm font-semibold text-gray-700">{stripExtension(filename)}</p>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-hidden">
        {phase === 'idle' && (
          <>
            {error && (
              <div className="mx-8 mt-6 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                {error}
              </div>
            )}
            <IdleScreen filename={filename} onGenerate={generate} />
          </>
        )}
        {phase === 'loading' && <LoadingScreen filename={filename} />}
        {phase === 'quiz' && (
          <QuizScreen
            questions={questions}
            courseId={courseId}
            filename={filename}
            navigate={navigate}
          />
        )}
      </div>
    </div>
  )
}
