import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import axios from 'axios'

function stripExtension(filename) {
  const idx = filename.lastIndexOf('.')
  return idx > 0 ? filename.slice(0, idx) : filename
}

function formatDate(ts) {
  const d = new Date(ts)
  return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) +
    ' · ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function scoreColor(pct) {
  if (pct >= 80) return '#22c55e'
  if (pct >= 50) return '#3b82f6'
  return '#f59e0b'
}

// SVG line graph showing score trend across all attempts
function TrendChart({ history, scoreTrendLabel = 'Score Trend' }) {
  if (history.length < 2) return null

  const W = 500
  const H = 120
  const PAD = { top: 20, right: 16, bottom: 28, left: 32 }
  const chartW = W - PAD.left - PAD.right
  const chartH = H - PAD.top - PAD.bottom

  const pcts = history.map(h => Math.round((h.score / h.totalQuestions) * 100))
  const minY = Math.max(0, Math.min(...pcts) - 10)
  const maxY = Math.min(100, Math.max(...pcts) + 10)

  const xOf = i => PAD.left + (i / (pcts.length - 1)) * chartW
  const yOf = v => PAD.top + chartH - ((v - minY) / (maxY - minY)) * chartH

  const points = pcts.map((v, i) => `${xOf(i)},${yOf(v)}`).join(' ')
  const areaPoints = [
    `${xOf(0)},${PAD.top + chartH}`,
    ...pcts.map((v, i) => `${xOf(i)},${yOf(v)}`),
    `${xOf(pcts.length - 1)},${PAD.top + chartH}`,
  ].join(' ')

  // Y axis gridlines at 0, 50, 100 if in range
  const gridLines = [0, 25, 50, 75, 100].filter(v => v >= minY && v <= maxY)

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 mb-6">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">{scoreTrendLabel}</p>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 140 }}>
        <defs>
          <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {gridLines.map(v => (
          <g key={v}>
            <line
              x1={PAD.left} x2={PAD.left + chartW}
              y1={yOf(v)} y2={yOf(v)}
              stroke="#f0f0f0" strokeWidth="1"
            />
            <text x={PAD.left - 4} y={yOf(v) + 4} textAnchor="end"
              fontSize="9" fill="#9ca3af">{v}%</text>
          </g>
        ))}

        {/* Area fill */}
        <polygon points={areaPoints} fill="url(#trendGrad)" />

        {/* Line */}
        <polyline points={points} fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

        {/* Dots + labels */}
        {pcts.map((v, i) => (
          <g key={i}>
            <circle cx={xOf(i)} cy={yOf(v)} r="4" fill="white" stroke={scoreColor(v)} strokeWidth="2" />
            <text
              x={xOf(i)} y={PAD.top + chartH + 16}
              textAnchor="middle" fontSize="9" fill="#9ca3af"
            >
              #{i + 1}
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
}

function AttemptCard({ attempt, number, t }) {
  const pct = Math.round((attempt.score / attempt.totalQuestions) * 100)
  const color = scoreColor(pct)
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      {/* Header row */}
      <div className="flex items-center gap-4 p-4">
        {/* Score circle */}
        <div className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm"
             style={{ backgroundColor: color }}>
          {pct}%
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-gray-800">{t ? t('scoreHistory.attempt', { number }) : `Attempt #${number}`}</span>
            <span className="text-xs text-gray-400">{formatDate(attempt.date)}</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span>{t ? t('scoreHistory.correct', { score: attempt.score, total: attempt.totalQuestions }) : `${attempt.score}/${attempt.totalQuestions} correct`}</span>
            {attempt.weakAreas?.length > 0 && (
              <span className="text-amber-600 font-medium">{t ? t('scoreHistory.weakAreas', { count: attempt.weakAreas.length }) : `${attempt.weakAreas.length} weak area(s)`}</span>
            )}
          </div>
          {/* Progress bar */}
          <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
            <div className="h-1.5 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
          </div>
        </div>

        {/* Expand toggle */}
        {attempt.weakAreas?.length > 0 && (
          <button
            onClick={() => setExpanded(e => !e)}
            className="flex-shrink-0 p-1.5 rounded-lg hover:bg-gray-50 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"
                 style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
        )}
      </div>

      {/* Weak areas */}
      {expanded && attempt.weakAreas?.length > 0 && (
        <div className="border-t border-gray-100 px-4 py-3 bg-amber-50">
          <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-2">{t ? t('scoreHistory.weakAreasTitle') : 'Weak Areas'}</p>
          <ul className="space-y-1.5">
            {attempt.weakAreas.map((q, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-amber-800">
                <span className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full bg-amber-200 flex items-center justify-center font-semibold text-amber-700">
                  {i + 1}
                </span>
                <span>{q}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default function ScoreHistoryPage() {
  const { courseId, filename } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [history, setHistory] = useState(null)
  const [bestScore, setBestScore] = useState(null)

  useEffect(() => {
    axios.get(`/api/courses/${courseId}/progress`).then(res => {
      const entry = res.data[filename]
      if (entry) {
        setHistory(entry.history || [])
        setBestScore({ score: entry.bestScore, total: entry.totalQuestions })
      } else {
        setHistory([])
      }
    })
  }, [courseId, filename])

  const loading = history === null

  // Compute most common weak areas across all attempts
  const weakAreaCounts = {}
  if (history) {
    history.forEach(h => {
      (h.weakAreas || []).forEach(q => {
        weakAreaCounts[q] = (weakAreaCounts[q] || 0) + 1
      })
    })
  }
  const topWeakAreas = Object.entries(weakAreaCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

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
          <p className="text-xs text-gray-400 leading-none">{t('scoreHistory.title')}</p>
          <p className="text-sm font-semibold text-gray-700">{stripExtension(filename)}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-50 px-8 py-6">
        {loading && (
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          </div>
        )}

        {!loading && history.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="#0369a1" strokeWidth={1.5} className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-gray-700">{t('scoreHistory.noAttempts')}</p>
              <p className="text-sm text-gray-400 mt-1">{t('scoreHistory.noAttemptsDesc')}</p>
            </div>
            <button
              onClick={() => navigate(`/course/${courseId}/lectures/${encodeURIComponent(filename)}/mcq`)}
              className="px-5 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition-colors"
            >
              {t('scoreHistory.takeMcq')}
            </button>
          </div>
        )}

        {!loading && history.length > 0 && (
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Summary stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
                <p className="text-2xl font-bold text-gray-800">{history.length}</p>
                <p className="text-xs text-gray-400 mt-0.5">{t('scoreHistory.attempts')}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
                <p className="text-2xl font-bold" style={{ color: scoreColor(bestScore ? Math.round(bestScore.score / bestScore.total * 100) : 0) }}>
                  {bestScore ? Math.round(bestScore.score / bestScore.total * 100) : 0}%
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{t('scoreHistory.bestScore')}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
                <p className="text-2xl font-bold text-gray-800">
                  {Math.round(history.reduce((sum, h) => sum + (h.score / h.totalQuestions) * 100, 0) / history.length)}%
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{t('scoreHistory.average')}</p>
              </div>
            </div>

            {/* Trend chart */}
            <TrendChart history={history} scoreTrendLabel={t('scoreHistory.scoreTrend')} />

            {/* Persistent weak areas */}
            {topWeakAreas.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
                <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-3">
                  {t('scoreHistory.areasToFocus')}
                </p>
                <ul className="space-y-2">
                  {topWeakAreas.map(([question, count], i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-amber-800">
                      <span className="flex-shrink-0 mt-0.5 px-1.5 py-0.5 bg-amber-200 text-amber-700 text-xs font-bold rounded">
                        ×{count}
                      </span>
                      <span>{question}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Attempt list (newest first) */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">{t('scoreHistory.allAttempts')}</p>
              <div className="space-y-3">
                {[...history].reverse().map((attempt, i) => (
                  <AttemptCard
                    key={i}
                    attempt={attempt}
                    number={history.length - i}
                    t={t}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
