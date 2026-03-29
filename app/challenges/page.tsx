'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { flags } from '@/data/flags'
import { Confetti } from '@/components/Confetti'
import { StarRating } from '@/components/StarRating'
import {
  getStreak,
  getBadges,
  awardBadge,
  getDailyChallenge,
  saveDailyChallenge,
  updateStreak,
  getHardMode,
  setHardMode as saveHardMode,
} from '@/lib/storage'
import { shuffleArray, generateQuizOptions, calculateStars } from '@/lib/scoring'
import type { Flag } from '@/data/flags'

const ALL_BADGES = [
  { id: 'First Explorer', emoji: '🗺️', desc: 'Complete your first lesson' },
  { id: 'World Traveler', emoji: '✈️', desc: 'Complete 10 lessons' },
  { id: 'Speed Demon', emoji: '⚡', desc: 'Score 20+ in Speed Round' },
  { id: 'Memory Master', emoji: '🧠', desc: 'Win Flag Match in <30 moves' },
  { id: 'Perfect Score', emoji: '💯', desc: 'Get 100% on any quiz' },
  { id: 'Asia Expert', emoji: '🌏', desc: 'Complete Asia lesson' },
  { id: 'Europe Scholar', emoji: '🏰', desc: 'Complete Europe lesson' },
  { id: 'Americas Master', emoji: '🌎', desc: 'Complete Americas lesson' },
  { id: 'Africa Pioneer', emoji: '🦁', desc: 'Complete Africa lesson' },
  { id: 'Oceania Adventurer', emoji: '🐚', desc: 'Complete Oceania lesson' },
  { id: '7-Day Streak', emoji: '🔥', desc: 'Play 7 days in a row' },
  { id: '30-Day Streak', emoji: '🌟', desc: 'Play 30 days in a row' },
];

interface ChallengeQuestion {
  flag: Flag;
  options: Flag[];
  answered: boolean;
  correct: boolean;
}

export default function ChallengesPage() {
  const [streak, setStreak] = useState(0);
  const [earnedBadges, setEarnedBadges] = useState<string[]>([]);
  const [hardMode, setHardMode] = useState(false);
  const [challengeState, setChallengeState] = useState<'loading' | 'ready' | 'playing' | 'done'>('loading');
  const [challengeQuestions, setChallengeQuestions] = useState<ChallengeQuestion[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [confettiTrigger, setConfettiTrigger] = useState(false);
  const [newBadge, setNewBadge] = useState<string | null>(null);

  useEffect(() => {
    setStreak(getStreak().count);
    setEarnedBadges(getBadges());
    setHardMode(getHardMode());
    updateStreak();

    const saved = getDailyChallenge();
    if (saved?.completed) {
      setChallengeState('done');
      setScore(saved.score);
    } else {
      setChallengeState('ready');
    }
  }, []);

  const startChallenge = () => {
    const today = new Date().toISOString().split('T')[0];
    const saved = getDailyChallenge();
    let challengeFlags: Flag[];

    if (saved && saved.date === today) {
      challengeFlags = saved.flagIds.map(id => flags.find(f => f.id === id)!).filter(Boolean);
    } else {
      challengeFlags = shuffleArray(flags).slice(0, 5);
    }

    const questions: ChallengeQuestion[] = challengeFlags.map(flag => ({
      flag,
      options: generateQuizOptions(flag, flags, hardMode ? 6 : 4),
      answered: false,
      correct: false,
    }));

    setChallengeQuestions(questions);
    setCurrentQ(0);
    setSelected(null);
    setShowResult(false);
    setScore(0);
    setChallengeState('playing');

    saveDailyChallenge({
      date: today,
      flagIds: challengeFlags.map(f => f.id),
      completed: false,
      score: 0,
      answers: {},
    });
  };

  const handleAnswer = (answer: string) => {
    if (selected) return;
    setSelected(answer);
    setShowResult(true);

    const q = challengeQuestions[currentQ];
    const isCorrect = answer === q.flag.country;
    if (isCorrect) setScore(s => s + 1);

    setTimeout(() => {
      if (currentQ + 1 >= challengeQuestions.length) {
        const finalScore = score + (isCorrect ? 1 : 0);
        const today = new Date().toISOString().split('T')[0];

        saveDailyChallenge({
          date: today,
          flagIds: challengeQuestions.map(q => q.flag.id),
          completed: true,
          score: finalScore,
          answers: {},
        });

        setChallengeState('done');
        setScore(finalScore);

        if (finalScore === 5) {
          setConfettiTrigger(true);
          setTimeout(() => setConfettiTrigger(false), 100);
        }

        // Award badge for first challenge
        const awarded = awardBadge('First Explorer');
        if (awarded) {
          setNewBadge('First Explorer');
          setEarnedBadges(getBadges());
        }
      } else {
        setCurrentQ(c => c + 1);
        setSelected(null);
        setShowResult(false);
      }
    }, 1200);
  };

  const handleToggleHardMode = () => {
    const newVal = !hardMode;
    setHardMode(newVal);
    saveHardMode(newVal);
  };

  const stars = calculateStars(score, 5);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Confetti trigger={confettiTrigger} />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="font-fredoka text-5xl text-white mb-3">🏆 Challenges</h1>
        <p className="text-white/60 text-lg">Daily challenges, streaks, and badges!</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Challenge */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-navy-800 rounded-3xl p-6 border border-white/10"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-fredoka text-2xl text-white">📅 Daily Challenge</h2>
            <span className="text-white/40 text-sm">
              {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
            </span>
          </div>

          {challengeState === 'loading' && (
            <div className="flex items-center justify-center py-12">
              <div className="spinner w-8 h-8" />
            </div>
          )}

          {challengeState === 'ready' && (
            <div className="text-center py-4">
              <div className="text-5xl mb-4">🌍</div>
              <p className="text-white/60 mb-6">
                5 flags to identify today! Come back tomorrow for new challenges.
              </p>

              {/* Hard mode toggle */}
              <div className="flex items-center justify-center gap-3 mb-6">
                <span className="text-white/60 text-sm">Hard Mode (6 options):</span>
                <button
                  onClick={handleToggleHardMode}
                  className={`w-12 h-6 rounded-full transition-all ${hardMode ? 'bg-red-500' : 'bg-white/20'}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-all mx-0.5 ${hardMode ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>

              <button
                onClick={startChallenge}
                className="w-full bg-yellow-500 hover:bg-yellow-400 text-navy-900 font-bold py-4 rounded-2xl text-lg transition-all hover:scale-105"
              >
                Start Today&apos;s Challenge! 🎯
              </button>
            </div>
          )}

          {challengeState === 'playing' && challengeQuestions.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-white/60 text-sm">Question {currentQ + 1}/5</span>
                <span className="text-green-400 text-sm font-semibold">{score} correct</span>
              </div>

              <div className="relative w-full rounded-2xl overflow-hidden mb-4" style={{ height: '140px' }}>
                <Image
                  src={challengeQuestions[currentQ].flag.flagImageUrl}
                  alt="Flag"
                  fill
                  className="object-contain"
                  sizes="100vw"
                />
              </div>

              <p className="text-white text-center font-semibold mb-4 text-sm">
                Which country does this flag belong to?
              </p>

              <div className={`grid gap-2 ${hardMode ? 'grid-cols-2' : 'grid-cols-2'}`}>
                {challengeQuestions[currentQ].options.map((option) => {
                  const isCorrect = option.country === challengeQuestions[currentQ].flag.country;
                  const isSelected = selected === option.country;
                  return (
                    <button
                      key={option.id}
                      onClick={() => handleAnswer(option.country)}
                      disabled={!!selected}
                      className={`py-2 px-3 rounded-xl font-semibold text-xs transition-all border-2 ${
                        !showResult
                          ? isSelected
                            ? 'bg-blue-600 border-blue-400 text-white'
                            : 'border-white/10 bg-white/5 text-white hover:bg-white/10'
                          : isCorrect
                            ? 'bg-green-600 border-green-400 text-white'
                            : isSelected
                              ? 'bg-red-600 border-red-400 text-white'
                              : 'border-white/5 bg-white/3 text-white/40'
                      }`}
                    >
                      {option.country}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {challengeState === 'done' && (
            <div className="text-center py-4">
              <StarRating stars={stars} size="md" />
              <div className="mt-4 mb-4">
                <div className="font-fredoka text-5xl text-yellow-400">{score}/5</div>
                <div className="text-white/60">flags identified!</div>
              </div>
              <p className="text-white/60 text-sm mb-4">
                Come back tomorrow for a new challenge! 🌟
              </p>
              <Link href="/quiz/world">
                <button className="w-full bg-yellow-500 hover:bg-yellow-400 text-navy-900 font-bold py-3 rounded-2xl transition-all hover:scale-105">
                  Practice More 🧠
                </button>
              </Link>
            </div>
          )}
        </motion.div>

        {/* Streak tracker */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          {/* Streak card */}
          <div className="bg-navy-800 rounded-3xl p-6 border border-white/10">
            <h2 className="font-fredoka text-2xl text-white mb-4">🔥 Daily Streak</h2>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="font-fredoka text-6xl text-orange-400">{streak}</div>
                <div className="text-white/60 text-sm">day streak!</div>
              </div>
              <div className="flex-1">
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-8 rounded-lg ${
                        i < streak % 7
                          ? 'bg-orange-500'
                          : 'bg-white/10'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-white/40 text-xs mt-2 text-center">This week</p>
              </div>
            </div>
            {streak >= 7 && (
              <div className="mt-3 bg-orange-500/10 rounded-xl p-3 text-center">
                <p className="text-orange-400 text-sm font-semibold">🔥 You earned the 7-Day Streak badge!</p>
              </div>
            )}
          </div>

          {/* Hard mode toggle card */}
          <div className="bg-navy-800 rounded-3xl p-6 border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-fredoka text-xl text-white">🔥 Hard Mode</h3>
                <p className="text-white/50 text-sm">More options, harder challenges!</p>
              </div>
              <button
                onClick={handleToggleHardMode}
                className={`relative w-14 h-7 rounded-full transition-all ${hardMode ? 'bg-red-500' : 'bg-white/20'}`}
              >
                <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${hardMode ? 'left-8' : 'left-1'}`} />
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* New badge notification */}
      {newBadge && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="fixed bottom-8 right-8 bg-yellow-500 text-navy-900 px-6 py-4 rounded-2xl shadow-2xl font-bold z-50"
        >
          🎉 New Badge: {ALL_BADGES.find(b => b.id === newBadge)?.emoji} {newBadge}!
        </motion.div>
      )}

      {/* Badges */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-6 bg-navy-800 rounded-3xl p-6 border border-white/10"
      >
        <h2 className="font-fredoka text-2xl text-white mb-4">🏅 Badge Collection</h2>
        <p className="text-white/50 text-sm mb-4">
          {earnedBadges.length}/{ALL_BADGES.length} badges earned
        </p>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {ALL_BADGES.map((badge) => {
            const earned = earnedBadges.includes(badge.id);
            return (
              <motion.div
                key={badge.id}
                whileHover={{ scale: 1.05 }}
                className={`rounded-2xl p-3 text-center border-2 transition-all cursor-default ${
                  earned
                    ? 'border-yellow-500/50 bg-yellow-500/10'
                    : 'border-white/5 bg-white/3 opacity-40 grayscale'
                }`}
                title={badge.desc}
              >
                <div className="text-3xl mb-1">{badge.emoji}</div>
                <div className={`text-xs font-semibold leading-tight ${earned ? 'text-yellow-400' : 'text-white/40'}`}>
                  {badge.id}
                </div>
                {!earned && <div className="text-xs text-white/30 mt-1">🔒</div>}
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
