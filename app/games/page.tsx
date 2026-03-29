'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { GameCard } from '@/components/GameCard'
import { getGamesUnlocked, getHighScore } from '@/lib/storage'

const games = [
  {
    id: 'flag-match',
    title: 'Flag Match',
    description: 'Match flag images with country names in this classic memory card game! Test your memory!',
    icon: '🃏',
    href: '/games/flag-match',
    color: '#2563eb',
  },
  {
    id: 'speed-round',
    title: 'Speed Round',
    description: 'How many flags can you identify in 60 seconds? Fast-paced and exciting!',
    icon: '⚡',
    href: '/games/speed-round',
    color: '#d97706',
  },
  {
    id: 'flag-puzzle',
    title: 'Flag Puzzle',
    description: 'Piece together flag puzzles from around the world! Coming soon...',
    icon: '🧩',
    href: '/games',
    color: '#7c3aed',
  },
  {
    id: 'capital-dash',
    title: 'Capital Dash',
    description: 'Race against time to match countries with their capitals! Build your streak!',
    icon: '🏛️',
    href: '/games/capital-dash',
    color: '#059669',
  },
];

export default function GamesPage() {
  const [unlocked, setUnlocked] = useState(false);
  const [highScores, setHighScores] = useState<Record<string, number>>({});

  useEffect(() => {
    setUnlocked(getGamesUnlocked());
    const scores: Record<string, number> = {};
    games.forEach(g => {
      scores[g.id] = getHighScore(g.id);
    });
    setHighScores(scores);
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <h1 className="font-fredoka text-5xl text-white mb-3">🎮 Games Hub</h1>
        <p className="text-white/60 text-lg max-w-xl mx-auto">
          Fun games to test your flag knowledge! Complete 2 lessons to unlock all games.
        </p>
      </motion.div>

      {/* Lock warning */}
      {!unlocked && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-4 text-center"
        >
          <p className="text-yellow-400 font-semibold">
            🔒 Complete at least 2 lessons to unlock all games!{' '}
            <Link href="/learn/world" className="text-yellow-300 hover:text-white underline">
              Start Learning →
            </Link>
          </p>
        </motion.div>
      )}

      {/* Games grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
        {games.map((game, i) => {
          const isLocked = !unlocked && game.id !== 'flag-match'; // Give one free game
          return (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <GameCard
                title={game.title}
                description={game.description}
                icon={game.icon}
                href={game.href}
                color={game.color}
                highScore={highScores[game.id]}
                locked={isLocked}
                lockedMessage="Complete 2 lessons to unlock!"
              />
            </motion.div>
          );
        })}
      </div>

      {/* Tips section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-10 bg-navy-800 rounded-3xl p-6 border border-white/10"
      >
        <h2 className="font-fredoka text-2xl text-white mb-4">💡 Tips for Success</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { emoji: '📚', text: 'Learn flags first in lesson mode before testing yourself' },
            { emoji: '🔄', text: 'Practice regularly to build your streak and memory' },
            { emoji: '🏆', text: 'Compare your scores on the leaderboard to stay motivated' },
          ].map((tip, i) => (
            <div key={i} className="flex items-start gap-3 bg-white/5 rounded-2xl p-4">
              <span className="text-2xl flex-shrink-0">{tip.emoji}</span>
              <p className="text-white/70 text-sm">{tip.text}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
