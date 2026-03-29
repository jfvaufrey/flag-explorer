'use client'
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { flags } from '@/data/flags'
import { Confetti } from '@/components/Confetti'
import { StarRating } from '@/components/StarRating'
import { saveHighScore, getHighScore, awardBadge } from '@/lib/storage'
import { shuffleArray, generateQuizOptions, calculateStars } from '@/lib/scoring'
import type { Flag } from '@/data/flags'

interface Round {
  flag: Flag;
  options: Flag[];
}

export default function SpeedRoundPage() {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [rounds, setRounds] = useState<Round[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [showFeedback, setShowFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [correctAnswer, setCorrectAnswer] = useState<string | null>(null);
  const [confettiTrigger, setConfettiTrigger] = useState(false);
  const [highScore, setHighScore] = useState(0);

  useEffect(() => {
    setHighScore(getHighScore('speed-round'));
  }, []);

  const initRounds = useCallback(() => {
    const shuffled = shuffleArray(flags);
    return shuffled.map(flag => ({
      flag,
      options: generateQuizOptions(flag, flags, 4),
    }));
  }, []);

  const startGame = () => {
    setRounds(initRounds());
    setCurrentIndex(0);
    setScore(0);
    setTimeLeft(60);
    setShowFeedback(null);
    setCorrectAnswer(null);
    setConfettiTrigger(false);
    setGameState('playing');
  };

  useEffect(() => {
    if (gameState !== 'playing') return;
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timer);
          finishGame();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState]);

  const finishGame = useCallback(() => {
    setGameState('finished');
    const finalScore = score;
    saveHighScore('speed-round', finalScore);
    if (finalScore > 20) {
      awardBadge('Speed Demon');
      setConfettiTrigger(true);
      setTimeout(() => setConfettiTrigger(false), 100);
    }
    setHighScore(getHighScore('speed-round'));
  }, [score]);

  // Watch for time running out
  useEffect(() => {
    if (timeLeft === 0 && gameState === 'playing') {
      finishGame();
    }
  }, [timeLeft, gameState, finishGame]);

  const handleAnswer = (answer: string) => {
    if (showFeedback || gameState !== 'playing') return;
    const current = rounds[currentIndex];
    if (!current) return;

    const isCorrect = answer === current.flag.country;

    if (isCorrect) {
      setScore(s => s + 1);
      setShowFeedback('correct');
      setTimeout(() => {
        setShowFeedback(null);
        setCorrectAnswer(null);
        setCurrentIndex(i => i + 1);
      }, 300);
    } else {
      setShowFeedback('wrong');
      setCorrectAnswer(current.flag.country);
      setTimeout(() => {
        setShowFeedback(null);
        setCorrectAnswer(null);
        setCurrentIndex(i => i + 1);
      }, 1000);
    }
  };

  if (gameState === 'idle') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-sm w-full bg-navy-800 rounded-3xl p-8 border border-white/10 text-center"
        >
          <div className="text-6xl mb-4">⚡</div>
          <h1 className="font-fredoka text-4xl text-white mb-3">Speed Round!</h1>
          <p className="text-white/60 mb-6">
            Identify as many flags as you can in 60 seconds!
          </p>

          <div className="grid grid-cols-2 gap-3 mb-6 text-sm">
            <div className="bg-navy-700 rounded-2xl p-3">
              <div className="text-yellow-400 font-bold">+1</div>
              <div className="text-white/50">per correct flag</div>
            </div>
            <div className="bg-navy-700 rounded-2xl p-3">
              <div className="text-yellow-400 font-bold">⏱ 60s</div>
              <div className="text-white/50">time limit</div>
            </div>
          </div>

          {highScore > 0 && (
            <p className="text-yellow-400 text-sm mb-4">🏆 Best: {highScore} flags</p>
          )}

          <button
            onClick={startGame}
            className="w-full bg-yellow-500 hover:bg-yellow-400 text-navy-900 font-bold py-4 rounded-2xl text-lg transition-all hover:scale-105"
          >
            Start! ⚡
          </button>

          <Link href="/games" className="block mt-3 text-white/40 hover:text-white/60 text-sm transition-colors">
            ← Back to Games
          </Link>
        </motion.div>
      </div>
    );
  }

  if (gameState === 'finished') {
    const stars = calculateStars(score, Math.max(score + 5, 20));
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Confetti trigger={confettiTrigger} />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-sm w-full bg-navy-800 rounded-3xl p-8 border border-white/10 text-center"
        >
          <div className="text-6xl mb-4">⚡</div>
          <h2 className="font-fredoka text-4xl text-white mb-2">Time&apos;s Up!</h2>

          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-6 my-6">
            <div className="font-fredoka text-6xl text-yellow-400">{score}</div>
            <div className="text-white/60">flags identified!</div>
          </div>

          <StarRating stars={stars} />

          {score > highScore - 1 && score > 0 && (
            <p className="text-yellow-400 font-semibold mt-4">🏆 New High Score!</p>
          )}

          <div className="grid grid-cols-2 gap-3 mt-6">
            <button
              onClick={startGame}
              className="bg-yellow-500 hover:bg-yellow-400 text-navy-900 font-bold py-3 rounded-2xl transition-all hover:scale-105"
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

  const current = rounds[currentIndex];
  if (!current) {
    finishGame();
    return null;
  }

  const timerColor = timeLeft <= 10 ? 'text-red-400' : timeLeft <= 20 ? 'text-orange-400' : 'text-yellow-400';

  return (
    <div className="min-h-screen max-w-md mx-auto px-4 py-6">
      <Confetti trigger={confettiTrigger} />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link href="/games" className="text-white/60 hover:text-white text-sm transition-colors">
          ← Games
        </Link>
        <h1 className="font-fredoka text-2xl text-white">⚡ Speed Round</h1>
        <div className="text-yellow-400 font-bold">{score} pts</div>
      </div>

      {/* Timer */}
      <div className="flex justify-center mb-6">
        <div className={`font-fredoka text-6xl ${timerColor} ${timeLeft <= 10 ? 'animate-pulse' : ''}`}>
          {timeLeft}
        </div>
      </div>

      {/* Flag */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.15 }}
          className={`relative w-full rounded-3xl overflow-hidden mb-6 border-4 transition-all ${
            showFeedback === 'correct'
              ? 'border-green-400'
              : showFeedback === 'wrong'
                ? 'border-red-400'
                : 'border-white/10'
          }`}
          style={{ height: '180px' }}
        >
          <Image
            src={current.flag.flagImageUrl}
            alt="Flag"
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
        </motion.div>
      </AnimatePresence>

      {/* Correct answer display */}
      {correctAnswer && showFeedback === 'wrong' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-3 text-green-400 font-semibold"
        >
          ✅ {correctAnswer}
        </motion.div>
      )}

      {/* Answer options */}
      <div className="grid grid-cols-2 gap-3">
        {current.options.map((option) => (
          <motion.button
            key={option.id}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleAnswer(option.country)}
            disabled={!!showFeedback}
            className={`py-4 px-3 rounded-2xl font-semibold text-sm transition-all border-2 ${
              showFeedback && option.country === current.flag.country
                ? 'bg-green-600 border-green-400 text-white'
                : showFeedback && option.country === (showFeedback === 'wrong' ? '' : '')
                  ? 'bg-red-600 border-red-400 text-white'
                  : 'border-white/10 bg-white/5 text-white hover:bg-white/15'
            }`}
          >
            {option.flagEmoji} {option.country}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
