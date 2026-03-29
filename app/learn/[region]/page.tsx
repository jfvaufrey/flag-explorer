'use client'
import { useState, useEffect, use } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { flags } from '@/data/flags'
import { getRegionById } from '@/data/regions'
import { FlagCard } from '@/components/FlagCard'
import { ProgressBar } from '@/components/ProgressBar'
import { MiniQuiz } from '@/components/MiniQuiz'
import { StarRating } from '@/components/StarRating'
import { Confetti } from '@/components/Confetti'
import { saveBatchProgress, getBatchProgress, awardBadge } from '@/lib/storage'
import { calculateStars } from '@/lib/scoring'
import { MiniMap } from '@/components/MiniMap'
import type { Flag } from '@/data/flags'
import type { LessonProgress } from '@/lib/storage'

const BATCH_SIZE = 10

interface PageProps {
  params: Promise<{ region: string }>
}

type View = 'picker' | 'lesson' | 'completion'

export default function LearnPage({ params }: PageProps) {
  const { region: regionId } = use(params)
  const region = getRegionById(regionId)

  // Sort flags alphabetically so batches are stable across sessions
  const regionFlags = flags
    .filter(f => region ? region.continents.includes(f.continent) : true)
    .sort((a, b) => a.country.localeCompare(b.country))

  const batches: Flag[][] = []
  for (let i = 0; i < regionFlags.length; i += BATCH_SIZE) {
    batches.push(regionFlags.slice(i, i + BATCH_SIZE))
  }

  const [view, setView] = useState<View>('picker')
  const [activeBatch, setActiveBatch] = useState(0)
  const [batchProgresses, setBatchProgresses] = useState<(LessonProgress | null)[]>([])

  // Lesson state
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [knownFlags, setKnownFlags] = useState<Set<string>>(new Set())
  const [learningFlags, setLearningFlags] = useState<Set<string>>(new Set())
  const [showMiniQuiz, setShowMiniQuiz] = useState(false)
  const [miniQuizFlags, setMiniQuizFlags] = useState<Flag[]>([])
  const [shownCheckpoints, setShownCheckpoints] = useState<Set<number>>(new Set())
  const [confettiTrigger, setConfettiTrigger] = useState(false)

  // Load all batch progress on mount
  useEffect(() => {
    if (!region) return
    const progresses = batches.map((_, i) => getBatchProgress(regionId, i))
    setBatchProgresses(progresses)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [regionId])

  // Trigger mini-quiz after every 5 flags
  useEffect(() => {
    if (view !== 'lesson') return
    const batch = batches[activeBatch]
    if (!batch || currentIndex === 0) return
    if (currentIndex % 5 === 0 && !shownCheckpoints.has(currentIndex)) {
      setMiniQuizFlags(batch.slice(currentIndex - 5, currentIndex))
      setShownCheckpoints(prev => new Set([...prev, currentIndex]))
      setShowMiniQuiz(true)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, view])

  const startLesson = (batchIndex: number) => {
    setActiveBatch(batchIndex)
    setCurrentIndex(0)
    setIsFlipped(false)
    setKnownFlags(new Set())
    setLearningFlags(new Set())
    setShownCheckpoints(new Set())
    setShowMiniQuiz(false)
    setView('lesson')
  }

  const handleKnow = () => {
    const flag = batches[activeBatch][currentIndex]
    setKnownFlags(prev => new Set([...prev, flag.id]))
    setIsFlipped(false)
    goNext()
  }

  const handleLearning = () => {
    const flag = batches[activeBatch][currentIndex]
    setLearningFlags(prev => new Set([...prev, flag.id]))
    setIsFlipped(false)
    goNext()
  }

  const goNext = () => {
    const batch = batches[activeBatch]
    if (currentIndex + 1 >= batch.length) {
      finishLesson()
    } else {
      setCurrentIndex(c => c + 1)
    }
  }

  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(c => c - 1)
      setIsFlipped(false)
    }
  }

  const finishLesson = () => {
    const batch = batches[activeBatch]
    const progress: LessonProgress = {
      regionId,
      completedFlags: Array.from(knownFlags),
      totalFlags: batch.length,
      quizScore: knownFlags.size,
      completedAt: new Date().toISOString(),
    }
    saveBatchProgress(regionId, activeBatch, progress)

    // Refresh batch progress list
    setBatchProgresses(prev => {
      const updated = [...prev]
      updated[activeBatch] = progress
      return updated
    })

    // Award badges
    awardBadge('First Explorer')
    const allDone = batches.every((_, i) => {
      if (i === activeBatch) return true
      return getBatchProgress(regionId, i)?.completedAt != null
    })
    if (allDone) {
      if (regionId === 'asia') awardBadge('Asia Expert')
      if (regionId === 'europe') awardBadge('Europe Scholar')
      if (regionId === 'africa') awardBadge('Africa Pioneer')
      if (regionId === 'oceania') awardBadge('Oceania Adventurer')
      if (['americas', 'north-america', 'south-america'].includes(regionId)) awardBadge('Americas Master')
    }

    setConfettiTrigger(true)
    setTimeout(() => setConfettiTrigger(false), 100)
    setView('completion')
  }

  const handleMiniQuizComplete = () => {
    setShowMiniQuiz(false)
  }

  if (!region) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl mb-4">Region not found!</p>
          <Link href="/" className="text-yellow-400 hover:text-yellow-300">← Go Home</Link>
        </div>
      </div>
    )
  }

  // ── LESSON PICKER ──────────────────────────────────────────────────────────
  if (view === 'picker') {
    const completedCount = batchProgresses.filter(p => p?.completedAt).length
    const allComplete = completedCount === batches.length

    return (
      <div className="min-h-screen">
        <div className="max-w-2xl mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Link href="/" className="text-white/60 hover:text-white transition-colors">← Back</Link>
            <div className="text-center">
              <h1 className="font-fredoka text-2xl text-white">{region.emoji} {region.name}</h1>
              <p className="text-white/40 text-xs">{regionFlags.length} flags · {batches.length} lessons</p>
            </div>
            <div className="text-green-400 text-sm font-semibold">{completedCount}/{batches.length} ✅</div>
          </div>

          {/* Overall progress bar */}
          <div className="mb-6">
            <ProgressBar current={completedCount} total={batches.length} showPercentage={false} />
          </div>

          {allComplete && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-4 text-center mb-6"
            >
              <p className="font-fredoka text-2xl text-yellow-400">🏆 Region Complete!</p>
              <p className="text-white/60 text-sm mt-1">You&apos;ve studied all {regionFlags.length} flags. Repeat any lesson to review!</p>
            </motion.div>
          )}

          {/* Lesson grid */}
          <div className="grid grid-cols-1 gap-3">
            {batches.map((batch, i) => {
              const progress = batchProgresses[i]
              const isDone = !!progress?.completedAt
              const stars = isDone ? calculateStars(progress!.completedFlags.length, batch.length) : null
              const firstFlag = batch[0]
              const lastFlag = batch[batch.length - 1]

              const cardColors = [
                'from-pink-600/40 to-rose-700/40 border-pink-500/40 hover:from-pink-600/60 hover:to-rose-700/60',
                'from-orange-500/40 to-amber-600/40 border-orange-400/40 hover:from-orange-500/60 hover:to-amber-600/60',
                'from-yellow-500/40 to-lime-600/40 border-yellow-400/40 hover:from-yellow-500/60 hover:to-lime-600/60',
                'from-emerald-500/40 to-teal-600/40 border-emerald-400/40 hover:from-emerald-500/60 hover:to-teal-600/60',
                'from-cyan-500/40 to-sky-600/40 border-cyan-400/40 hover:from-cyan-500/60 hover:to-sky-600/60',
                'from-blue-500/40 to-indigo-600/40 border-blue-400/40 hover:from-blue-500/60 hover:to-indigo-600/60',
                'from-violet-500/40 to-purple-600/40 border-violet-400/40 hover:from-violet-500/60 hover:to-purple-600/60',
                'from-fuchsia-500/40 to-pink-600/40 border-fuchsia-400/40 hover:from-fuchsia-500/60 hover:to-pink-600/60',
              ]
              const badgeColors = [
                'bg-pink-500 text-white',
                'bg-orange-500 text-white',
                'bg-yellow-400 text-navy-900',
                'bg-emerald-500 text-white',
                'bg-cyan-500 text-white',
                'bg-blue-500 text-white',
                'bg-violet-500 text-white',
                'bg-fuchsia-500 text-white',
              ]
              const color = cardColors[i % cardColors.length]
              const badge = badgeColors[i % badgeColors.length]

              return (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => startLesson(i)}
                  className={`w-full text-left rounded-2xl border p-4 transition-all bg-gradient-to-r ${
                    isDone ? 'from-green-600/30 to-emerald-700/30 border-green-400/40 hover:from-green-600/50 hover:to-emerald-700/50' : color
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-fredoka text-lg font-bold shadow-lg ${
                        isDone ? 'bg-green-400 text-white' : badge
                      }`}>
                        {isDone ? '✅' : i + 1}
                      </div>
                      <div>
                        <p className="text-white font-fredoka text-lg">Lesson {i + 1}</p>
                        <p className="text-white/60 text-xs">
                          {firstFlag.country} → {lastFlag.country} · {batch.length} flags
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {stars && (
                        <div className="flex gap-0.5">
                          {[1, 2, 3].map(s => (
                            <span key={s} className={s <= stars ? 'text-yellow-300 text-lg' : 'text-white/20 text-lg'}>★</span>
                          ))}
                        </div>
                      )}
                      <span className="text-white/60 text-lg font-bold">›</span>
                    </div>
                  </div>
                </motion.button>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // ── COMPLETION ─────────────────────────────────────────────────────────────
  if (view === 'completion') {
    const batch = batches[activeBatch]
    const stars = calculateStars(knownFlags.size, batch.length)
    const completedCount = batchProgresses.filter(p => p?.completedAt).length
    const nextBatch = activeBatch + 1 < batches.length ? activeBatch + 1 : null

    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Confetti trigger={confettiTrigger} />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-navy-800 rounded-3xl p-8 border border-white/10 text-center shadow-2xl"
        >
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="font-fredoka text-4xl text-white mb-1">Lesson {activeBatch + 1} Done!</h2>
          <p className="text-white/50 text-sm mb-4">{region.emoji} {region.name} · {completedCount}/{batches.length} lessons complete</p>

          <StarRating stars={stars} />

          <div className="grid grid-cols-2 gap-3 my-6">
            <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4">
              <div className="font-fredoka text-3xl text-green-400">{knownFlags.size}</div>
              <div className="text-white/60 text-sm">Known ✅</div>
            </div>
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4">
              <div className="font-fredoka text-3xl text-orange-400">{learningFlags.size}</div>
              <div className="text-white/60 text-sm">Still Learning 📚</div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {nextBatch !== null && (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => startLesson(nextBatch)}
                className="w-full bg-yellow-500 hover:bg-yellow-400 text-navy-900 font-bold py-3 rounded-2xl transition-all"
              >
                ▶ Next Lesson ({nextBatch + 1}/{batches.length})
              </motion.button>
            )}
            <Link href={`/quiz/${regionId}`}>
              <button className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-3 rounded-2xl transition-all">
                🧠 Take the Quiz!
              </button>
            </Link>
            <button
              onClick={() => startLesson(activeBatch)}
              className="w-full bg-white/5 hover:bg-white/10 text-white/70 font-semibold py-3 rounded-2xl transition-all"
            >
              🔄 Repeat This Lesson
            </button>
            <button
              onClick={() => setView('picker')}
              className="text-white/40 hover:text-white text-sm py-2 transition-colors"
            >
              ← All Lessons
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  // ── LESSON ─────────────────────────────────────────────────────────────────
  const batch = batches[activeBatch]
  const currentFlag = batch[currentIndex]

  return (
    <div className="min-h-screen">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setView('picker')}
            className="text-white/60 hover:text-white transition-colors text-sm"
          >
            ← Lessons
          </button>
          <div className="text-center">
            <h1 className="font-fredoka text-xl text-white">{region.emoji} Lesson {activeBatch + 1}</h1>
            <p className="text-white/40 text-xs">Flag {currentIndex + 1} of {batch.length}</p>
          </div>
          <span className="text-green-400 text-sm font-semibold">{knownFlags.size} ✅</span>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <ProgressBar current={currentIndex + 1} total={batch.length} showPercentage={false} />
        </div>

        {/* Mini quiz */}
        <AnimatePresence>
          {showMiniQuiz && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-navy-800 rounded-3xl p-6 border border-yellow-500/30 mb-6"
            >
              <MiniQuiz
                flags={miniQuizFlags}
                allFlags={flags}
                onComplete={handleMiniQuizComplete}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Flag card */}
        {!showMiniQuiz && (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentFlag.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="mb-6"
            >
              <FlagCard
                flag={currentFlag}
                isFlipped={isFlipped}
                onFlip={() => setIsFlipped(!isFlipped)}
              />

              {/* World map with pin — shown when card is flipped */}
              <AnimatePresence>
                {isFlipped && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 12 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="mt-4"
                  >
                    <p className="text-white/40 text-xs text-center mb-2">📍 Where in the world?</p>
                    <MiniMap
                      countryId={currentFlag.id}
                      coordinates={currentFlag.coordinates}
                      countryName={currentFlag.country}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </AnimatePresence>
        )}

        {/* Action buttons */}
        {!showMiniQuiz && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleLearning}
                className="py-4 px-6 rounded-2xl bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 text-orange-300 font-semibold transition-all"
              >
                📚 Still Learning
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleKnow}
                className="py-4 px-6 rounded-2xl bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-300 font-semibold transition-all"
              >
                ✅ I Know This!
              </motion.button>
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={goPrev}
                disabled={currentIndex === 0}
                className="text-white/40 hover:text-white/80 disabled:opacity-20 text-sm transition-colors"
              >
                ← Previous
              </button>
              <button
                onClick={() => setIsFlipped(!isFlipped)}
                className="text-yellow-400 hover:text-yellow-300 text-sm font-semibold transition-colors"
              >
                {isFlipped ? '↩ Flip Back' : '↻ Reveal Answer'}
              </button>
              <button
                onClick={goNext}
                className="text-white/40 hover:text-white/80 text-sm transition-colors"
              >
                Skip →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
