'use client'
import { motion } from 'framer-motion'
import type { LeaderboardEntry } from '@/lib/storage'

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  highlightName?: string;
}

const rankEmojis: Record<number, string> = {
  1: '🥇',
  2: '🥈',
  3: '🥉',
};

export function LeaderboardTable({ entries, highlightName }: LeaderboardProps) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🏆</div>
        <p className="text-white/60 text-lg">No scores yet! Be the first!</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10">
      <table className="w-full">
        <thead>
          <tr className="bg-navy-700 text-white/60 text-sm">
            <th className="py-3 px-4 text-left">Rank</th>
            <th className="py-3 px-4 text-left">Player</th>
            <th className="py-3 px-4 text-center">Score</th>
            <th className="py-3 px-4 text-center hidden sm:table-cell">Region</th>
            <th className="py-3 px-4 text-center hidden md:table-cell">Stars</th>
            <th className="py-3 px-4 text-right hidden lg:table-cell">Date</th>
          </tr>
        </thead>
        <tbody>
          {entries.slice(0, 10).map((entry, index) => {
            const rank = index + 1;
            const isHighlighted = entry.name === highlightName;
            return (
              <motion.tr
                key={entry.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`border-t border-white/5 ${
                  isHighlighted ? 'bg-yellow-500/10' : 'hover:bg-white/5'
                } transition-colors`}
              >
                <td className="py-4 px-4">
                  <span className="font-fredoka text-xl">
                    {rankEmojis[rank] || `#${rank}`}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <span className={`font-semibold ${isHighlighted ? 'text-yellow-400' : 'text-white'}`}>
                    {entry.name}
                    {isHighlighted && <span className="text-yellow-400 ml-2 text-xs">(you)</span>}
                  </span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="font-fredoka text-xl text-yellow-400">{entry.score.toLocaleString()}</span>
                </td>
                <td className="py-4 px-4 text-center hidden sm:table-cell">
                  <span className="text-white/70 text-sm capitalize">{entry.region}</span>
                </td>
                <td className="py-4 px-4 text-center hidden md:table-cell">
                  <span>{'⭐'.repeat(entry.stars)}</span>
                </td>
                <td className="py-4 px-4 text-right hidden lg:table-cell">
                  <span className="text-white/40 text-sm">{new Date(entry.date).toLocaleDateString()}</span>
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
