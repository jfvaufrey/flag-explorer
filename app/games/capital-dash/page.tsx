'use client'
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { flags } from '@/data/flags'
import { Confetti } from '@/components/Confetti'
import { StarRating } from '@/components/StarRating'
import { saveHighScore, getHighScore } from '@/lib/storage'
import { shuffleArray, generateQuizOptions, calculateStars } from '@/lib/scoring'
import type { Flag } from '@/data/flags'

interface Question {
  flag: Flag;
  options: Flag[];
}

export default function CapitalDashPage() {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(90);
  const [showFeedback, setShowFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [confettiTrigger, setConfettiTrigger] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [multiplier, setMultiplier] = useState(1);

  useEffect(() => {
    setHighScore(getHighScore('capital-dash'));
  }, []);

  const initGame = useCallback(() => {
    const shuffled = shuffleArray(flags);
    setQuestions(shuffled.map(flag => ({
      flag,
      options: generateQuizOptions(flag, flags, 4),
    })));
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setTimeLeft(90);
    setMultiplier(1);
    setShowFeedback(null);
    setConfettiTrigger(false);
    setGameState('playing');
  }, []);

  const finishGame = useCallback((finalScore: number) => {
    setGameState('finished');
    saveHighScore('capital-dash', finalScore);
    if (finalScore > 500) {
      setConfettiTrigger(true);
      setTimeout(() => setConfettiTrigger(false), 100);
    }
    setHighScore(getHighScore('capital-dash'));
  }, []);

  useEffect(() => {
    if (gameState !== 'playing') return;
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timer);
          finishGame(score);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState]);

  const handleAnswer = (capital: string) => {
    if (showFeedback || gameState !== 'playing') return;
    const current = questions[currentIndex];
    if (!current) return;

    const isCorrect = capital === current.flag.capital;

    if (isCorrect) {
      const newStreak = streak + 1;
      const newMultiplier = newStreak >= 5 ? 3 : newStreak >= 3 ? 2 : 1;
      const points = 100 * newMultiplier;
      setScore(s => {
        const newScore = s + points;
        return newScore;
      });
      setStreak(newStreak);
      setMultiplier(newMultiplier);
      setMaxStreak(ms => Math.max(ms, newStreak));
      setShowFeedback('correct');
    } else {
      setStreak(0);
      setMultiplier(1);
      setShowFeedback('wrong');
    }

    setTimeout(() => {
      setShowFeedback(null);
      if (currentIndex + 1 >= questions.length) {
        finishGame(score);
      } else {
        setCurrentIndex(i => i + 1);
      }
    }, isCorrect ? 400 : 1200);
  };

  if (gameState === 'idle') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-sm w-full bg-navy-800 rounded-3xl p-8 border border-white/10 text-center"
        >
          <div className="text-6xl mb-4">🏛️</div>
          <h1 className="font-fredoka text-4xl text-white mb-3">Capital Dash!</h1>
          <p className="text-white/60 mb-6">
            Match countries with their capitals! Build streaks for score multipliers!
          </p>

          <div className="grid grid-cols-3 gap-3 mb-6 text-sm">
            <div className="bg-navy-700 rounded-2xl p-3">
              <div className="text-yellow-400 font-bold">x1→x3</div>
              <div className="text-white/50">multiplier</div>
            </div>
            <div className="bg-navy-700 rounded-2xl p-3">
              <div className="text-yellow-400 font-bold">⏱ 90s</div>
              <div className="text-white/50">time</div>
            </div>
            <div className="bg-navy-700 rounded-2xl p-3">
              <div className="text-yellow-400 font-bold">100pts</div>
              <div className="text-white/50">base</div>
            </div>
          </div>

          {highScore > 0 && (
            <p className="text-yellow-400 text-sm mb-4">🏆 Best: {highScore.toLocaleString()}</p>
          )}

          <button
            onClick={initGame}
            className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-2xl text-lg transition-all hover:scale-105"
          >
            Start! 🏛️
          </button>

          <Link href="/games" className="block mt-3 text-white/40 hover:text-white/60 text-sm transition-colors">
            ← Back to Games
          </Link>
        </motion.div>
      </div>
    );
  }

  if (gameState === 'finished') {
    const stars = calculateStars(Math.min(score, 2000), 2000);
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Confetti trigger={confettiTrigger} />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-sm w-full bg-navy-800 rounded-3xl p-8 border border-white/10 text-center"
        >
          <div className="text-6xl mb-4">🏛️</div>
          <h2 className="font-fredoka text-4xl text-white mb-2">Time&apos;s Up!</h2>

          <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6 my-6">
            <div className="font-fredoka text-6xl text-green-400">{score.toLocaleString()}</div>
            <div className="text-white/60">points scored!</div>
          </div>

          <StarRating stars={stars} />

          <div className="mt-4 mb-4">
            <p className="text-white/60 text-sm">🔥 Best streak: <span className="text-orange-400 font-bold">{maxStreak}</span></p>
          </div>

          {score >= highScore && score > 0 && (
            <p className="text-yellow-400 font-semibold mb-4">🏆 New High Score!</p>
          )}

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={initGame}
              className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-2xl transition-all hover:scale-105"
            >
              🔄 Play Again
            </button>
            <Link href="/games">
              <button className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-3 rounded-2xl transition-all">
                ← Games
              </button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  const current = questions[currentIndex];
  if (!current) return null;

  const timerColor = timeLeft <= 15 ? 'text-red-400' : timeLeft <= 30 ? 'text-orange-400' : 'text-green-400';

  return (
    <div className="min-h-screen max-w-md mx-auto px-4 py-6">
      <Confetti trigger={confettiTrigger} />

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Link href="/games" className="text-white/60 hover:text-white text-sm transition-colors">
          ← Games
        </Link>
        <h1 className="font-fredoka text-xl text-white">🏛️ Capital Dash</h1>
        <div className="text-right">
          <div className="font-fredoka text-xl text-green-400">{score.toLocaleString()}</div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-navy-800 rounded-xl p-2 text-center border border-white/10">
          <div className={`font-fredoka text-2xl ${timerColor}`}>{timeLeft}s</div>
          <div className="text-white/40 text-xs">Time</div>
        </div>
        <div className="bg-navy-800 rounded-xl p-2 text-center border border-white/10">
          <div className="font-fredoka text-2xl text-orange-400">🔥 {streak}</div>
          <div className="text-white/40 text-xs">Streak</div>
        </div>
        <div className="bg-navy-800 rounded-xl p-2 text-center border border-white/10">
          <div className={`font-fredoka text-2xl ${multiplier > 1 ? 'text-yellow-400' : 'text-white/50'}`}>
            x{multiplier}
          </div>
          <div className="text-white/40 text-xs">Multiplier</div>
        </div>
      </div>

      {/* Flag + Country name */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.15 }}
        >
          <div
            className={`relative w-full rounded-3xl overflow-hidden mb-3 border-4 transition-all ${
              showFeedback === 'correct'
                ? 'border-green-400'
                : showFeedback === 'wrong'
                  ? 'border-red-400'
                  : 'border-white/10'
            }`}
            style={{ height: '140px' }}
          >
            <Image
              src={current.flag.flagImageUrl}
              alt={current.flag.country}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
            {showFeedback && (
              <div className={`absolute inset-0 flex items-center justify-center ${
                showFeedback === 'correct' ? 'bg-green-500/40' : 'bg-red-500/40'
              }`}>
                <span className="text-5xl">{showFeedback === 'correct' ? '✅' : '❌'}</span>
              </div>
            )}
          </div>

          <div className="text-center mb-4">
            <p className="font-fredoka text-2xl text-white">{current.flag.flagEmoji} {current.flag.country}</p>
            <p className="text-white/50 text-sm">What is the capital?</p>
          </div>

          {/* Options */}
          <div className="grid grid-cols-2 gap-3">
            {current.options.map((option) => {
              const isCorrect = option.capital === current.flag.capital;
              return (
                <motion.button
                  key={option.id}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleAnswer(option.capital)}
                  disabled={!!showFeedback}
                  className={`py-4 px-4 rounded-2xl font-semibold text-sm transition-all border-2 ${
                    showFeedback && isCorrect
                      ? 'bg-green-600 border-green-400 text-white'
                      : 'border-white/10 bg-white/5 text-white hover:bg-white/15'
                  }`}
                >
                  🏛️ {option.capital}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
