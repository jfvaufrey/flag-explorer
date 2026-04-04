'use client'
import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { getLeaderboard, getPlayerName } from '@/lib/storage'
import type { GlobalLeaderboardEntry } from '@/lib/leaderboard'
import type { LeaderboardEntry } from '@/lib/storage'

const REGION_OPTIONS = [
  { value: '', label: '🌍 All Regions' },
  { value: 'north-america', label: '🌎 North America' },
  { value: 'south-america', label: '🌎 South America' },
  { value: 'europe', label: '🌍 Europe' },
  { value: 'asia', label: '🌏 Asia' },
  { value: 'africa', label: '🌍 Africa' },
  { value: 'oceania', label: '🌏 Australia' },
  { value: 'antarctica', label: '🧊 Antarctica' },
]

const RANK_MEDAL: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' }
const RANK_COLOR: Record<number, string> = {
  1: 'text-yellow-400',
  2: 'text-slate-300',
  3: 'text-amber-600',
}

function formatRegion(region: string) {
  return region.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<GlobalLeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRegion, setSelectedRegion] = useState('')
  const [playerName, setPlayerName] = useState<string | null>(null)
  const [lastLocalScore, setLastLocalScore] = useState<LeaderboardEntry | null>(null)

  const fetchLeaderboard = useCallback(async (region: string) => {
    setLoading(true)
    const url = region ? `/api/leaderboard?region=${encodeURIComponent(region)}` : '/api/leaderboard'
    const res = await fetch(url)
    const data = await res.json()
    setEntries(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    const name = getPlayerName()
    setPlayerName(name)
    const local = getLeaderboard()
    if (local.length > 0) {
      const sorted = [...local].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      setLastLocalScore(sorted[0])
    }
    fetchLeaderboard('')
  }, [fetchLeaderboard])

  const handleRegionChange = (region: string) => {
    setSelectedRegion(region)
    fetchLeaderboard(region)
  }

  const chartData = entries.slice(0, 5).map((e, i) => ({
    name: e.name.slice(0, 8),
    score: e.score,
    fill: i === 0 ? '#ffd700' : i === 1 ? '#c0c0c0' : i === 2 ? '#cd7f32' : '#2563eb',
  }))

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="font-fredoka text-5xl text-white mb-3">🏆 Global Leaderboard</h1>
        <p className="text-white/60 text-lg">Top flag explorers from around the world!</p>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap gap-3 mb-6 items-center"
      >
        <select
          value={selectedRegion}
          onChange={e => handleRegionChange(e.target.value)}
          className="bg-navy-800 text-white border border-white/10 rounded-xl px-4 py-2 text-sm font-semibold focus:outline-none focus:border-yellow-500"
        >
          {REGION_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        <button
          onClick={() => fetchLeaderboard(selectedRegion)}
          className="px-4 py-2 rounded-xl text-sm font-semibold bg-navy-800 text-white/60 hover:text-white border border-white/10 transition-all"
        >
          🔄 Refresh
        </button>
      </motion.div>

      {/* Chart */}
      {chartData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-navy-800 rounded-3xl p-6 border border-white/10 mb-6"
        >
          <h2 className="font-fredoka text-xl text-white mb-4">Top 5 Scores</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} axisLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#1e2d5e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white' }}
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
              />
              <Bar dataKey="score" fill="#ffd700" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Global leaderboard table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-navy-800 rounded-3xl border border-white/10 overflow-hidden mb-6"
      >
        {loading ? (
          <div className="text-center py-16">
            <div className="spinner w-10 h-10 mx-auto mb-4" />
            <p className="text-white/40 text-sm">Loading global scores…</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🏆</div>
            <p className="text-white/60 text-lg">No scores yet for this region!</p>
            <p className="text-white/30 text-sm mt-2">Play a quiz to be the first.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-navy-700 text-white/60 text-sm">
                  <th className="py-3 px-4 text-left">Rank</th>
                  <th className="py-3 px-4 text-left">Name</th>
                  <th className="py-3 px-4 text-center">Score</th>
                  <th className="py-3 px-4 text-center hidden sm:table-cell">Region</th>
                  <th className="py-3 px-4 text-right hidden md:table-cell">Date</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, index) => {
                  const rank = index + 1
                  const isMe = playerName && entry.name === playerName
                  return (
                    <motion.tr
                      key={entry.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.04 }}
                      className={`border-t border-white/5 transition-colors ${isMe ? 'bg-yellow-500/10' : 'hover:bg-white/5'}`}
                    >
                      <td className="py-4 px-4">
                        <span className={`font-fredoka text-xl ${RANK_COLOR[rank] ?? 'text-white/60'}`}>
                          {RANK_MEDAL[rank] ?? `#${rank}`}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`font-semibold ${isMe ? 'text-yellow-400' : 'text-white'}`}>
                          {entry.name}
                          {isMe && <span className="text-yellow-400 ml-2 text-xs">(you)</span>}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="font-fredoka text-xl text-yellow-400">{entry.score.toLocaleString()}</span>
                      </td>
                      <td className="py-4 px-4 text-center hidden sm:table-cell">
                        <span className="text-white/70 text-sm">{formatRegion(entry.region)}</span>
                      </td>
                      <td className="py-4 px-4 text-right hidden md:table-cell">
                        <span className="text-white/40 text-sm">
                          {new Date(entry.created_at).toLocaleDateString()}
                        </span>
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Player's last score */}
      {lastLocalScore && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-navy-800 rounded-3xl border border-yellow-500/20 p-5 mb-6"
        >
          <h3 className="font-fredoka text-lg text-yellow-400 mb-3">⭐ Your Last Score</h3>
          <div className="flex flex-wrap gap-4 text-sm">
            <span className="text-white">
              <span className="text-white/50">Name: </span>{lastLocalScore.name}
            </span>
            <span className="text-white">
              <span className="text-white/50">Score: </span>
              <span className="text-yellow-400 font-bold">{lastLocalScore.score.toLocaleString()}</span>
            </span>
            <span className="text-white">
              <span className="text-white/50">Region: </span>{formatRegion(lastLocalScore.region)}
            </span>
            <span className="text-white">
              <span className="text-white/50">Date: </span>{new Date(lastLocalScore.date).toLocaleDateString()}
            </span>
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-center"
      >
        <p className="text-white/30 text-sm">Play quizzes to earn scores and compete globally! 🌍🏆</p>
      </motion.div>
    </div>
  )
}
