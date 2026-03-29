'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { LeaderboardTable } from '@/components/Leaderboard'
import { getLeaderboard, clearLeaderboard, getPlayerName } from '@/lib/storage'
import type { LeaderboardEntry } from '@/lib/storage'
import { regions } from '@/data/regions'

function aggregateByName(entries: LeaderboardEntry[]): LeaderboardEntry[] {
  const map = new Map<string, LeaderboardEntry>();
  for (const entry of entries) {
    const existing = map.get(entry.name);
    if (existing) {
      existing.score += entry.score;
      existing.stars = Math.max(existing.stars, entry.stars);
      if (entry.date > existing.date) existing.date = entry.date;
    } else {
      map.set(entry.name, { ...entry });
    }
  }
  return Array.from(map.values()).sort((a, b) => b.score - a.score);
}

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [filtered, setFiltered] = useState<LeaderboardEntry[]>([]);
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [playerName, setPlayerName] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const data = getLeaderboard();
    setEntries(data);
    setFiltered(aggregateByName(data));
    setPlayerName(getPlayerName());
  }, []);

  useEffect(() => {
    if (selectedRegion === 'all') {
      setFiltered(aggregateByName(entries));
    } else {
      setFiltered(aggregateByName(entries.filter(e => e.region === selectedRegion)));
    }
  }, [selectedRegion, entries]);

  const handleClear = () => {
    clearLeaderboard();
    setEntries([]);
    setFiltered([]);
    setShowConfirm(false);
  };

  const chartData = filtered.slice(0, 5).map((e, i) => ({
    name: e.name.slice(0, 8),
    score: e.score,
    fill: i === 0 ? '#ffd700' : i === 1 ? '#c0c0c0' : i === 2 ? '#cd7f32' : '#2563eb',
  }));

  const regionOptions = [
    { value: 'all', label: '🌍 All Regions' },
    ...regions.map(r => ({ value: r.id, label: `${r.emoji} ${r.name}` })),
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="font-fredoka text-5xl text-white mb-3">🏆 Leaderboard</h1>
        <p className="text-white/60 text-lg">Top flag explorers around the world!</p>
      </motion.div>

      {/* Filter tabs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap gap-2 mb-6"
      >
        {regionOptions.slice(0, 7).map((opt) => (
          <button
            key={opt.value}
            onClick={() => setSelectedRegion(opt.value)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              selectedRegion === opt.value
                ? 'bg-yellow-500 text-navy-900'
                : 'bg-navy-800 text-white/60 hover:text-white border border-white/10'
            }`}
          >
            {opt.label}
          </button>
        ))}
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

      {/* Leaderboard table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-navy-800 rounded-3xl border border-white/10 overflow-hidden mb-6"
      >
        <LeaderboardTable entries={filtered} highlightName={playerName || undefined} />
      </motion.div>

      {/* Actions */}
      <div className="flex justify-between items-center">
        {entries.length === 0 ? (
          <p className="text-white/40 text-sm">No scores yet. Play a quiz to appear here!</p>
        ) : (
          <p className="text-white/40 text-sm">{filtered.length} player{filtered.length !== 1 ? 's' : ''} on the board</p>
        )}

        {entries.length > 0 && (
          <div>
            {!showConfirm ? (
              <button
                onClick={() => setShowConfirm(true)}
                className="text-red-400 hover:text-red-300 text-sm transition-colors"
              >
                🗑 Clear Leaderboard
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleClear}
                  className="bg-red-600 hover:bg-red-500 text-white text-sm px-4 py-2 rounded-xl transition-all"
                >
                  Confirm Delete
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  className="bg-white/10 hover:bg-white/20 text-white text-sm px-4 py-2 rounded-xl transition-all"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Motivation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 text-center"
      >
        <p className="text-white/30 text-sm">
          Play quizzes to earn scores and climb the leaderboard! 🌍
        </p>
      </motion.div>
    </div>
  );
}
