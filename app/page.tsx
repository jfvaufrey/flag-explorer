'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { regions } from '@/data/regions'
import { flags } from '@/data/flags'
import { RegionCard } from '@/components/RegionCard'
import { getPlayerName, setPlayerName, getStats, updateStreak, getAllProgress } from '@/lib/storage'

const floatingEmojis = ['🇫🇷', '🇯🇵', '🇧🇷', '🇺🇸', '🇩🇪', '🇮🇳', '🇬🇧', '🇨🇳', '🇲🇽', '🇰🇷', '🇦🇺', '🇨🇦', '🇮🇹', '🇪🇸', '🇦🇷'];

export default function HomePage() {
  const [playerName, setName] = useState<string | null>(null);
  const [showNameModal, setShowNameModal] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [stats, setStats] = useState({ flagsLearned: 0, streak: 0, badgeCount: 0, totalScore: 0 });
  const [activeTab, setActiveTab] = useState<'learn' | 'quiz'>('learn');
  const [showLearnedModal, setShowLearnedModal] = useState(false);
  const [learnedFlags, setLearnedFlags] = useState<typeof flags>([]);

  useEffect(() => {
    const name = getPlayerName();
    setName(name);
    if (!name) setShowNameModal(true);

    const s = getStats();
    setStats(s);
    updateStreak();

    const allProgress = getAllProgress();
    const learnedIds = new Set(allProgress.flatMap(p => p.completedFlags));
    setLearnedFlags(flags.filter(f => learnedIds.has(f.id)).sort((a, b) => a.country.localeCompare(b.country)));
  }, []);

  const handleSetName = () => {
    if (nameInput.trim()) {
      setPlayerName(nameInput.trim());
      setName(nameInput.trim());
      setShowNameModal(false);
    }
  };

  const totalFlags = flags.length;

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Floating background emojis */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {floatingEmojis.map((emoji, i) => (
          <div
            key={i}
            className="absolute text-3xl opacity-5 animate-float select-none"
            style={{
              left: `${(i * 7 + 5) % 100}%`,
              top: `${(i * 13 + 10) % 100}%`,
              animationDelay: `${i * 0.4}s`,
              animationDuration: `${3 + (i % 3)}s`,
            }}
          >
            {emoji}
          </div>
        ))}
      </div>

      {/* Name modal */}
      <AnimatePresence>
        {showNameModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/90 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.8, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 40 }}
              className="bg-navy-800 rounded-3xl p-8 max-w-sm w-full border border-white/10 shadow-2xl text-center"
            >
              <div className="text-6xl mb-4">⛵</div>
              <h2 className="font-fredoka text-3xl text-white mb-2">Welcome, Explorer!</h2>
              <p className="text-white/60 mb-6 text-sm">Enter your name to start your adventure and save your progress!</p>

              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSetName()}
                placeholder="Your explorer name..."
                maxLength={20}
                className="w-full bg-navy-900 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder:text-white/30 text-center text-lg outline-none focus:border-yellow-500 transition-colors mb-4"
                autoFocus
              />

              <button
                onClick={handleSetName}
                disabled={!nameInput.trim()}
                className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:opacity-40 text-navy-900 font-bold py-3 rounded-2xl transition-all hover:scale-105 active:scale-95 text-lg"
              >
                Start Exploring! 🌍
              </button>

              <button
                onClick={() => setShowNameModal(false)}
                className="mt-3 text-white/40 text-sm hover:text-white/60 transition-colors"
              >
                Skip for now
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Learned flags modal */}
      <AnimatePresence>
        {showLearnedModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/90 backdrop-blur-sm p-4"
            onClick={() => setShowLearnedModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-navy-800 rounded-3xl border border-white/10 shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col"
            >
              {/* Modal header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <div>
                  <h2 className="font-fredoka text-3xl text-white">📚 Flags Learned</h2>
                  <p className="text-white/50 text-sm mt-1">{learnedFlags.length} flag{learnedFlags.length !== 1 ? 's' : ''} mastered</p>
                </div>
                <button
                  onClick={() => setShowLearnedModal(false)}
                  className="text-white/40 hover:text-white text-2xl transition-colors w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/10"
                >
                  ✕
                </button>
              </div>

              {/* Flag list */}
              <div className="overflow-y-auto p-4 flex-1">
                {learnedFlags.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-5xl mb-4">🌍</div>
                    <p className="text-white/60">No flags learned yet!</p>
                    <p className="text-white/30 text-sm mt-1">Complete a lesson to see your flags here.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {learnedFlags.map(flag => (
                      <motion.div
                        key={flag.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white/5 rounded-2xl p-3 border border-white/10 flex flex-col items-center gap-2"
                      >
                        <img
                          src={flag.flagImageUrl}
                          alt={`Flag of ${flag.country}`}
                          className="w-full rounded-lg object-contain"
                          style={{ height: '60px' }}
                        />
                        <div className="text-center">
                          <p className="text-white font-semibold text-sm leading-tight">{flag.country}</p>
                          <p className="text-white/40 text-xs mt-0.5">🏛️ {flag.capital}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative max-w-7xl mx-auto px-4 py-8">
        {/* Hero section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-3 mb-4">
            <span className="text-5xl animate-bounce">🌍</span>
            <h1 className="font-fredoka text-5xl sm:text-7xl text-white" style={{ textShadow: '0 0 40px rgba(255,215,0,0.3)' }}>
              FLAG EXPLORER
            </h1>
            <span className="text-5xl animate-bounce" style={{ animationDelay: '0.2s' }}>🌎</span>
          </div>
          <p className="text-white/70 text-lg sm:text-xl font-nunito max-w-2xl mx-auto">
            Discover the World, One Flag at a Time! 🚀
          </p>
          {playerName && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-3 text-yellow-400 font-semibold text-lg"
            >
              Welcome back, {playerName}! ✨
            </motion.p>
          )}
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10"
        >
          {[
            { emoji: '🌍', label: 'Flags', value: `${totalFlags}`, sub: 'countries', onClick: undefined },
            { emoji: '📚', label: 'Learned', value: String(stats.flagsLearned), sub: 'flags', onClick: () => setShowLearnedModal(true) },
            { emoji: '🔥', label: 'Streak', value: String(stats.streak), sub: 'days', onClick: undefined },
            { emoji: '🏅', label: 'Badges', value: String(stats.badgeCount), sub: 'earned', onClick: undefined },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              onClick={stat.onClick}
              className={`bg-navy-800 rounded-2xl p-4 border border-white/10 text-center ${stat.onClick ? 'cursor-pointer hover:bg-navy-700 hover:border-yellow-500/40 transition-all' : ''}`}
            >
              <div className="text-2xl mb-1">{stat.emoji}</div>
              <div className="font-fredoka text-2xl text-yellow-400">{stat.value}</div>
              <div className="text-white/50 text-xs">{stat.sub}</div>
              {stat.onClick && <div className="text-yellow-500/60 text-xs mt-1">tap to view</div>}
            </motion.div>
          ))}
        </motion.div>

        {/* Quick action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap gap-3 justify-center mb-10"
        >
          <Link href="/learn/world">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-yellow-500 hover:bg-yellow-400 text-navy-900 font-bold py-3 px-8 rounded-2xl text-lg shadow-lg flex items-center gap-2"
            >
              📚 Start Learning
            </motion.button>
          </Link>
          <Link href="/quiz/world">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-8 rounded-2xl text-lg shadow-lg flex items-center gap-2"
            >
              🧠 Take a Quiz
            </motion.button>
          </Link>
          <Link href="/games">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-8 rounded-2xl text-lg shadow-lg flex items-center gap-2"
            >
              🎮 Play Games
            </motion.button>
          </Link>
          <Link href="/challenges">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 px-8 rounded-2xl text-lg shadow-lg flex items-center gap-2"
            >
              🏆 Daily Challenge
            </motion.button>
          </Link>
        </motion.div>

        {/* Region selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-fredoka text-3xl text-white">Explore by Region</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('learn')}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === 'learn' ? 'bg-yellow-500 text-navy-900' : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                📚 Learn
              </button>
              <button
                onClick={() => setActiveTab('quiz')}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === 'quiz' ? 'bg-purple-600 text-white' : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                🧠 Quiz
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {regions.map((region, i) => (
              <motion.div
                key={region.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.03 }}
              >
                <RegionCard region={region} mode={activeTab} />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Feature cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          {[
            {
              emoji: '📚',
              title: 'Interactive Lessons',
              desc: 'Flip card learning with fun facts about every country. Learn at your own pace!',
              href: '/learn/world',
              color: '#ffd700',
            },
            {
              emoji: '🏆',
              title: 'Daily Challenges',
              desc: 'A new 5-flag challenge every day! Build your streak and earn badges.',
              href: '/challenges',
              color: '#ff6644',
            },
            {
              emoji: '📊',
              title: 'Leaderboard',
              desc: 'Compete with others! See who knows the most flags in the world.',
              href: '/leaderboard',
              color: '#7c3aed',
            },
          ].map((card) => (
            <Link key={card.title} href={card.href}>
              <motion.div
                whileHover={{ scale: 1.03, y: -4 }}
                className="bg-navy-800 rounded-3xl p-6 border border-white/10 hover:border-white/20 cursor-pointer transition-all h-full"
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-4"
                  style={{ background: `${card.color}20`, border: `2px solid ${card.color}40` }}
                >
                  {card.emoji}
                </div>
                <h3 className="font-fredoka text-xl text-white mb-2">{card.title}</h3>
                <p className="text-white/60 text-sm">{card.desc}</p>
              </motion.div>
            </Link>
          ))}
        </motion.div>

        {/* Fun fact ticker */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4 text-center"
        >
          <p className="text-yellow-400 text-sm font-semibold">
            🌟 Did you know? There are <span className="text-white font-bold">{totalFlags} countries</span> in the world, each with their own unique flag!
          </p>
        </motion.div>
      </div>
    </div>
  );
}
