'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { flags } from '@/data/flags'
import { Confetti } from '@/components/Confetti'
import { saveHighScore, getHighScore } from '@/lib/storage'
import { shuffleArray } from '@/lib/scoring'

const COLS = 3
const ROWS = 2
const TOTAL = COLS * ROWS

function getPieceStyle(originalIndex: number, flagUrl: string): React.CSSProperties {
  const col = originalIndex % COLS
  const row = Math.floor(originalIndex / COLS)
  return {
    backgroundImage: `url(${flagUrl})`,
    backgroundSize: `${COLS * 100}% ${ROWS * 100}%`,
    backgroundPosition: `${col * (100 / (COLS - 1))}% ${row * (100 / (ROWS - 1))}%`,
  }
}

export default function FlagPuzzlePage() {
  const [flag, setFlag] = useState(() => flags[Math.floor(Math.random() * flags.length)])
  const [pieces, setPieces] = useState<number[]>([]) // pieces[slot] = originalIndex
  const [solved, setSolved] = useState(false)
  const [moves, setMoves] = useState(0)
  const [confettiTrigger, setConfettiTrigger] = useState(false)
  const [highScore, setHighScore] = useState(0)
  const [showPreview, setShowPreview] = useState(false)
  const [previewCountdown, setPreviewCountdown] = useState(3)
  const [gameStarted, setGameStarted] = useState(false)
  const dragFrom = useRef<number | null>(null)

  useEffect(() => {
    setHighScore(getHighScore('flag-puzzle'))
  }, [])

  const startGame = (selectedFlag = flag) => {
    setFlag(selectedFlag)
    const shuffled = shuffleArray([...Array(TOTAL).keys()])
    // Make sure it's not already solved
    const isSolved = shuffled.every((v, i) => v === i)
    if (isSolved) shuffled.reverse()
    setPieces(shuffled)
    setSolved(false)
    setMoves(0)
    setShowPreview(true)
    setPreviewCountdown(3)
    setGameStarted(false)
  }

  // Countdown during preview
  useEffect(() => {
    if (!showPreview) return
    if (previewCountdown <= 0) {
      setShowPreview(false)
      setGameStarted(true)
      return
    }
    const t = setTimeout(() => setPreviewCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [showPreview, previewCountdown])

  const handleDragStart = (slotIndex: number) => {
    dragFrom.current = slotIndex
  }

  const handleDrop = (slotIndex: number) => {
    if (dragFrom.current === null || dragFrom.current === slotIndex) return
    const from = dragFrom.current
    dragFrom.current = null

    setPieces(prev => {
      const next = [...prev]
      ;[next[from], next[slotIndex]] = [next[slotIndex], next[from]]

      const isSolved = next.every((v, i) => v === i)
      if (isSolved) {
        const newMoves = moves + 1
        setSolved(true)
        setConfettiTrigger(true)
        setTimeout(() => setConfettiTrigger(false), 100)
        // Lower moves = better score (max 1000 minus penalty)
        const score = Math.max(100, 1000 - newMoves * 20)
        saveHighScore('flag-puzzle', score)
        setHighScore(getHighScore('flag-puzzle'))
      }
      return next
    })
    setMoves(m => m + 1)
  }

  const pickRandomFlag = () => {
    const newFlag = flags[Math.floor(Math.random() * flags.length)]
    startGame(newFlag)
  }

  return (
    <div className="min-h-screen">
      <Confetti trigger={confettiTrigger} />
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/games" className="text-white/60 hover:text-white transition-colors text-sm">← Games</Link>
          <h1 className="font-fredoka text-2xl text-white">🧩 Flag Puzzle</h1>
          <div className="text-yellow-400 text-sm font-semibold">Best: {highScore}</div>
        </div>

        {/* Start screen */}
        {!gameStarted && !showPreview && pieces.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8"
          >
            <div className="text-7xl mb-6">🧩</div>
            <h2 className="font-fredoka text-3xl text-white mb-3">Reconstruct the Flag!</h2>
            <p className="text-white/60 mb-2">The flag is shown for 3 seconds, then scrambled into {TOTAL} pieces.</p>
            <p className="text-white/60 mb-8">Drag and drop the pieces back into the right order!</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => startGame()}
              className="bg-yellow-500 hover:bg-yellow-400 text-navy-900 font-bold py-4 px-10 rounded-2xl text-xl shadow-lg"
            >
              Start Puzzle! 🚀
            </motion.button>
          </motion.div>
        )}

        {/* Preview countdown */}
        {showPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <p className="text-white/60 text-sm mb-3 font-semibold">
              Memorise it! Starting in <span className="text-yellow-400 font-bold text-lg">{previewCountdown}</span>...
            </p>
            <div
              className="w-full rounded-2xl overflow-hidden border-4 border-yellow-500/50 shadow-2xl"
              style={{ aspectRatio: '3/2' }}
            >
              <img
                src={flag.flagImageUrl}
                alt={`Flag of ${flag.country}`}
                className="w-full h-full object-contain bg-navy-900"
              />
            </div>
            <p className="text-white font-fredoka text-2xl mt-4">{flag.country}</p>
          </motion.div>
        )}

        {/* Puzzle board */}
        {gameStarted && pieces.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {/* Stats */}
            <div className="flex items-center justify-between mb-4">
              <div className="text-white/60 text-sm">Moves: <span className="text-white font-bold">{moves}</span></div>
              <button
                onClick={() => setShowPreview(true)}
                className="text-yellow-400 hover:text-yellow-300 text-xs font-semibold transition-colors border border-yellow-500/30 px-3 py-1 rounded-xl"
              >
                👁 Peek
              </button>
              <button
                onClick={pickRandomFlag}
                className="text-white/50 hover:text-white text-xs transition-colors"
              >
                New flag
              </button>
            </div>

            {/* Grid */}
            <div
              className="grid gap-1 w-full rounded-2xl overflow-hidden border-2 border-white/10"
              style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}
            >
              {pieces.map((originalIndex, slotIndex) => (
                <div
                  key={slotIndex}
                  draggable
                  onDragStart={() => handleDragStart(slotIndex)}
                  onDragOver={e => e.preventDefault()}
                  onDrop={() => handleDrop(slotIndex)}
                  className={`cursor-grab active:cursor-grabbing transition-all hover:opacity-80 hover:scale-95 ${
                    originalIndex === slotIndex ? 'ring-2 ring-green-400/50' : ''
                  }`}
                  style={{
                    ...getPieceStyle(originalIndex, flag.flagImageUrl),
                    aspectRatio: '3/2',
                  }}
                />
              ))}
            </div>

            <p className="text-white/30 text-xs text-center mt-3">Drag pieces to swap them</p>
          </motion.div>
        )}

        {/* Solved screen */}
        <AnimatePresence>
          {solved && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-6 bg-navy-800 rounded-3xl p-8 border border-yellow-500/30 text-center shadow-2xl"
            >
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="font-fredoka text-4xl text-white mb-2">Puzzle Solved!</h2>
              <div
                className="w-full rounded-2xl overflow-hidden my-4 border-2 border-yellow-500/40"
                style={{ aspectRatio: '3/2' }}
              >
                <img
                  src={flag.flagImageUrl}
                  alt={`Flag of ${flag.country}`}
                  className="w-full h-full object-contain bg-navy-900"
                />
              </div>
              <p className="font-fredoka text-2xl text-yellow-400 mb-1">{flag.flagEmoji} {flag.country}</p>
              <p className="text-white/60 text-sm mb-6">Completed in <span className="text-white font-bold">{moves}</span> moves</p>

              <div className="flex flex-col gap-3">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={pickRandomFlag}
                  className="w-full bg-yellow-500 hover:bg-yellow-400 text-navy-900 font-bold py-3 rounded-2xl transition-all"
                >
                  🔀 Next Puzzle
                </motion.button>
                <Link href="/games">
                  <button className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-3 rounded-2xl transition-all">
                    ← Back to Games
                  </button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
