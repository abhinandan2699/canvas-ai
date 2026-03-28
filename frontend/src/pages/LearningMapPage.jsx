import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import i18n from '../i18n'

function stripExtension(filename) {
  const idx = filename.lastIndexOf('.')
  return idx > 0 ? filename.slice(0, idx) : filename
}

// ── Roadmap node ──────────────────────────────────────────────────────────────
function ChunkNode({ chunk, index, total, selected, onClick, t }) {
  const isSelected = selected === index
  return (
    <div className="flex gap-4 items-stretch">
      {/* Line + circle */}
      <div className="flex flex-col items-center flex-shrink-0" style={{ width: 32 }}>
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all z-10"
          style={{
            backgroundColor: isSelected ? '#0f766e' : '#e2e8f0',
            color: isSelected ? '#fff' : '#64748b',
            boxShadow: isSelected ? '0 0 0 4px #ccfbf1' : 'none',
          }}
        >
          {index + 1}
        </div>
        {index < total - 1 && (
          <div className="flex-1 w-0.5 mt-1" style={{ backgroundColor: '#e2e8f0', minHeight: 24 }} />
        )}
      </div>

      {/* Card */}
      <div
        onClick={onClick}
        className="flex-1 mb-3 rounded-xl border-2 p-4 cursor-pointer transition-all"
        style={{
          borderColor: isSelected ? '#0f766e' : '#e2e8f0',
          backgroundColor: isSelected ? '#f0fdf9' : '#fff',
        }}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-800 text-sm leading-snug">{chunk.title}</p>
            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{chunk.description}</p>
          </div>
          {chunk.estimatedMinutes && (
            <span className="flex-shrink-0 text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              ~{chunk.estimatedMinutes}m
            </span>
          )}
        </div>
        {chunk.keyPoints?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {chunk.keyPoints.slice(0, 3).map((kp, i) => (
              <span key={i} className="text-xs px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: isSelected ? '#ccfbf1' : '#f1f5f9', color: isSelected ? '#0f766e' : '#64748b' }}>
                {kp}
              </span>
            ))}
            {chunk.keyPoints.length > 3 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-400">
                {t('learningMap.more', { count: chunk.keyPoints.length - 3 })}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Action result renderer ────────────────────────────────────────────────────
function ActionResult({ action, result }) {
  if (action === 'summarize') {
    return (
      <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
        {result}
      </div>
    )
  }

  // Video script — parse scenes
  const scenes = []
  const lines = result.split('\n')
  let current = null
  for (const line of lines) {
    const sceneMatch = line.match(/^SCENE\s+\d+/i)
    if (sceneMatch) {
      if (current) scenes.push(current)
      current = { title: line, visual: '', narration: '' }
    } else if (current && line.startsWith('VISUAL:')) {
      current.visual = line.replace('VISUAL:', '').trim()
    } else if (current && line.startsWith('NARRATION:')) {
      current.narration = line.replace('NARRATION:', '').trim()
    } else if (current && line.trim()) {
      // continuation
      if (current.narration) current.narration += ' ' + line.trim()
    }
  }
  if (current) scenes.push(current)

  if (scenes.length === 0) {
    return <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{result}</div>
  }

  return (
    <div className="space-y-4">
      {scenes.map((scene, i) => (
        <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-4 py-2 bg-gray-800 text-white text-xs font-semibold">{scene.title}</div>
          {scene.visual && (
            <div className="px-4 py-2 bg-blue-50 border-b border-gray-200">
              <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Visual  </span>
              <span className="text-xs text-blue-800">{scene.visual}</span>
            </div>
          )}
          {scene.narration && (
            <div className="px-4 py-3">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Narration  </span>
              <p className="text-sm text-gray-700 mt-1 leading-relaxed italic">"{scene.narration}"</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function LearningMapPage() {
  const { courseId, filename } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const [mapPhase, setMapPhase] = useState('idle')   // idle | loading | ready | error
  const [chunks, setChunks] = useState([])
  const [mapError, setMapError] = useState('')

  const [selectedIndex, setSelectedIndex] = useState(null)
  const [actionPhase, setActionPhase] = useState('idle')  // idle | loading | done
  const [actionType, setActionType] = useState(null)      // 'summarize' | 'video'
  const [actionResult, setActionResult] = useState('')
  const [videoUrl, setVideoUrl] = useState(null)

  const selectedChunk = selectedIndex !== null ? chunks[selectedIndex] : null

  async function generateMap() {
    setMapPhase('loading')
    setMapError('')
    try {
      const res = await axios.post(`/api/courses/${courseId}/studybuddy/learning-map`, { filename, language: i18n.language || 'en' })
      setChunks(res.data.chunks)
      setMapPhase('ready')
    } catch (e) {
      setMapError(e.response?.data?.detail || t('learningMap.failed'))
      setMapPhase('error')
    }
  }

  async function runAction(action) {
    if (!selectedChunk) return
    setActionType(action)
    setActionPhase('loading')
    setActionResult('')
    if (videoUrl) URL.revokeObjectURL(videoUrl)
    setVideoUrl(null)
    try {
      if (action === 'video') {
        const res = await axios.post(
          `/api/courses/${courseId}/studybuddy/generate-video`,
          {
            filename,
            action,
            chunkTitle: selectedChunk.title,
            chunkDescription: selectedChunk.description,
            keyPoints: selectedChunk.keyPoints || [],
            language: i18n.language || 'en',
          },
          { timeout: 300000, responseType: 'blob' }
        )
        const url = URL.createObjectURL(new Blob([res.data], { type: 'video/mp4' }))
        setVideoUrl(url)
      } else {
        const res = await axios.post(`/api/courses/${courseId}/studybuddy/chunk-action`, {
          filename,
          action,
          chunkTitle: selectedChunk.title,
          chunkDescription: selectedChunk.description,
          keyPoints: selectedChunk.keyPoints || [],
          language: i18n.language || 'en',
        })
        setActionResult(res.data.result)
      }
      setActionPhase('done')
    } catch (e) {
      setActionResult(t('learningMap.failed'))
      setActionPhase('done')
    }
  }

  function handleSelectChunk(i) {
    setSelectedIndex(i)
    setActionPhase('idle')
    setActionResult('')
    setActionType(null)
    if (videoUrl) URL.revokeObjectURL(videoUrl)
    setVideoUrl(null)
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
          <p className="text-xs text-gray-400 leading-none">{t('learningMap.title')}</p>
          <p className="text-sm font-semibold text-gray-700">{stripExtension(filename)}</p>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-hidden flex">

        {/* ── Left: map panel ── */}
        <div className="w-96 flex-shrink-0 border-r border-gray-100 bg-gray-50 flex flex-col overflow-hidden">
          {mapPhase === 'idle' && (
            <div className="flex flex-col items-center justify-center h-full gap-5 px-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-teal-100 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="#0f766e" strokeWidth={1.5} className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-800">{t('learningMap.generateTitle')}</p>
                <p className="text-xs text-gray-400 mt-1">{t('learningMap.generateDesc')}</p>
              </div>
              <button
                onClick={generateMap}
                className="px-6 py-2.5 bg-teal-700 text-white text-sm font-semibold rounded-xl hover:bg-teal-800 transition-colors"
              >
                {t('learningMap.generateMap')}
              </button>
            </div>
          )}

          {mapPhase === 'loading' && (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <div className="w-10 h-10 border-4 border-teal-200 border-t-teal-700 rounded-full animate-spin" />
              <p className="text-sm text-gray-500">{t('learningMap.mapping')}</p>
            </div>
          )}

          {mapPhase === 'error' && (
            <div className="flex flex-col items-center justify-center h-full gap-4 px-8 text-center">
              <p className="text-sm text-red-500">{mapError}</p>
              <button onClick={generateMap}
                      className="px-5 py-2 bg-teal-700 text-white text-sm font-medium rounded-xl hover:bg-teal-800">
                {t('learningMap.tryAgain')}
              </button>
            </div>
          )}

          {mapPhase === 'ready' && (
            <div className="flex-1 overflow-y-auto px-5 pt-5 pb-3">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {t('learningMap.topics', { count: chunks.length })}
                </p>
                <button onClick={generateMap}
                        className="text-xs text-teal-600 hover:text-teal-800 hover:underline">
                  {t('learningMap.regenerate')}
                </button>
              </div>
              {chunks.map((chunk, i) => (
                <ChunkNode
                  key={i}
                  chunk={chunk}
                  index={i}
                  total={chunks.length}
                  selected={selectedIndex}
                  onClick={() => handleSelectChunk(i)}
                  t={t}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Right: action panel ── */}
        <div className="flex-1 overflow-y-auto bg-white">
          {!selectedChunk ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-8">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth={1.5} className="w-7 h-7">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M15.042 21.672 13.684 16.6m0 0-2.51 2.225.569-9.47 5.227 7.917-3.286-.672ZM12 2.25V4.5m5.834.166-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243-1.59-1.59" />
                </svg>
              </div>
              <p className="text-sm text-gray-400">
                {mapPhase === 'ready' ? t('learningMap.selectTopic') : t('learningMap.generateFirst')}
              </p>
            </div>
          ) : (
            <div className="p-8 max-w-2xl">
              {/* Chunk header */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">
                    {t('learningMap.topicOf', { current: selectedIndex + 1, total: chunks.length })}
                  </span>
                  {selectedChunk.estimatedMinutes && (
                    <span className="text-xs text-gray-400">~{selectedChunk.estimatedMinutes} min</span>
                  )}
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-1">{selectedChunk.title}</h2>
                <p className="text-gray-500 text-sm">{selectedChunk.description}</p>

                {selectedChunk.keyPoints?.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{t('learningMap.keyConcepts')}</p>
                    <ul className="space-y-1">
                      {selectedChunk.keyPoints.map((kp, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-teal-500 flex-shrink-0" />
                          {kp}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 mb-6">
                <button
                  onClick={() => runAction('summarize')}
                  disabled={actionPhase === 'loading'}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 ${
                    actionType === 'summarize' && actionPhase !== 'idle'
                      ? 'bg-teal-700 text-white'
                      : 'bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200'
                  }`}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
                  </svg>
                  {t('learningMap.summarise')}
                </button>
                <button
                  onClick={() => runAction('video')}
                  disabled={actionPhase === 'loading'}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 ${
                    actionType === 'video' && actionPhase !== 'idle'
                      ? 'bg-violet-600 text-white'
                      : 'bg-violet-50 text-violet-700 hover:bg-violet-100 border border-violet-200'
                  }`}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                  </svg>
                  {t('learningMap.generateVideo')}
                </button>
              </div>

              {/* Result area */}
              {actionPhase === 'loading' && (
                <div className="flex items-center gap-3 py-6 text-gray-500 text-sm">
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-teal-600 rounded-full animate-spin" />
                  {actionType === 'summarize' ? t('learningMap.generatingSummary') : t('learningMap.generatingVideo')}
                </div>
              )}

              {actionPhase === 'done' && (actionResult || videoUrl) && (
                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                  <div className="flex items-center gap-2 mb-4">
                    {actionType === 'summarize' ? (
                      <>
                        <div className="w-5 h-5 rounded-full bg-teal-100 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-teal-600" />
                        </div>
                        <span className="text-xs font-semibold text-teal-700 uppercase tracking-wide">{t('learningMap.summary')}</span>
                      </>
                    ) : (
                      <>
                        <div className="w-5 h-5 rounded-full bg-violet-100 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-violet-600" />
                        </div>
                        <span className="text-xs font-semibold text-violet-700 uppercase tracking-wide">{t('learningMap.video')}</span>
                      </>
                    )}
                  </div>
                  {actionType === 'video' && videoUrl ? (
                    <video
                      controls
                      src={videoUrl}
                      className="w-full rounded-lg"
                      style={{ maxHeight: '400px' }}
                    />
                  ) : (
                    <ActionResult action={actionType} result={actionResult} />
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
