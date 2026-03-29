'use client'
import { useState, useEffect, useRef, use } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { flags } from '@/data/flags'
import { getRegionById } from '@/data/regions'
import { QuizQuestionComponent } from '@/components/QuizQuestion'
import { ProgressBar } from '@/components/ProgressBar'
import { StarRating } from '@/components/StarRating'
import { Confetti } from '@/components/Confetti'
import { saveScore, getPlayerName, awardBadge } from '@/lib/storage'
import {
  calculateStars,
  calculateScore,
  getEncouragementMessage,
  generateQuizQuestions,
  shuffleArray,
} from '@/lib/scoring'
import type { QuizQuestion } from '@/lib/scoring'

interface PageProps {
  params: Promise<{ region: string }>;
}

export default function QuizPage({ params }: PageProps) {
  const { region: regionId } = use(params);
  const region = getRegionById(regionId);

  const regionFlags = flags.filter(f =>
    region ? region.continents.includes(f.continent) : true
  );

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState<QuizQuestion[]>([]);
  const [gameState, setGameState] = useState<'playing' | 'finished'>('playing');
  const [timeEnabled, setTimeEnabled] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [confettiTrigger, setConfettiTrigger] = useState(false);
  const [showWrongReview, setShowWrongReview] = useState(false);
  const scoreSaved = useRef(false);

  useEffect(() => {
    const shuffled = shuffleArray(regionFlags);
    const pool = shuffled.slice(0, Math.min(20, shuffled.length));
    setQuestions(generateQuizQuestions(pool, flags, 20));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [regionId]);

  useEffect(() => {
    if (!timeEnabled || showResult || gameState !== 'playing' || questions.length === 0) return;
    setTimeLeft(15);
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timer);
          handleAnswer('__timeout__');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, timeEnabled, showResult, gameState]);

  const handleAnswer = (answer: string) => {
    if (selectedAnswer) return;
    setSelectedAnswer(answer);
    setShowResult(true);

    const q = questions[currentIndex];
    const isCorrect = answer === q.correctAnswer;
    if (isCorrect) {
      setCorrectCount(c => c + 1);
    } else {
      setWrongAnswers(prev => [...prev, q]);
    }

    setTimeout(() => {
      if (currentIndex + 1 >= questions.length) {
        finishQuiz();
      } else {
        setCurrentIndex(c => c + 1);
        setSelectedAnswer(null);
        setShowResult(false);
      }
    }, 1500);
  };

  const finishQuiz = () => {
    if (scoreSaved.current) return;
    scoreSaved.current = true;
    setGameState('finished');
    const score = calculateScore(correctCount + (selectedAnswer === questions[currentIndex]?.correctAnswer ? 1 : 0), questions.length);
    const stars = calculateStars(correctCount, questions.length);

    if (stars === 3) {
      awardBadge('Perfect Score');
      setConfettiTrigger(true);
      setTimeout(() => setConfettiTrigger(false), 100);
    }

    const playerName = getPlayerName();
    if (playerName) {
      saveScore({
        id: Date.now().toString(),
        name: playerName,
        score,
        region: regionId,
        date: new Date().toISOString(),
        stars,
      });
    }
  };

  if (!region) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl mb-4">Region not found!</p>
          <Link href="/" className="text-yellow-400 hover:text-yellow-300">← Go Home</Link>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner w-12 h-12" />
      </div>
    );
  }

  if (gameState === 'finished') {
    const finalCorrect = correctCount;
    const total = questions.length;
    const score = calculateScore(finalCorrect, total);
    const stars = calculateStars(finalCorrect, total);
    const percentage = Math.round((finalCorrect / total) * 100);
    const message = getEncouragementMessage(percentage);

    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Confetti trigger={confettiTrigger} />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg w-full space-y-4"
        >
          <div className="bg-navy-800 rounded-3xl p-8 border border-white/10 text-center shadow-2xl">
            <div className="text-5xl mb-4">{percentage >= 90 ? '🎉' : percentage >= 60 ? '👏' : '💪'}</div>
            <h2 className="font-fredoka text-4xl text-white mb-1">Quiz Complete!</h2>
            <p className="text-white/60 mb-4">{region.emoji} {region.name}</p>

            <StarRating stars={stars} />

            <p className="text-white/80 mt-4 text-lg font-semibold">{message}</p>

            <div className="grid grid-cols-3 gap-3 my-6">
              <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4">
                <div className="font-fredoka text-3xl text-green-400">{finalCorrect}</div>
                <div className="text-white/60 text-xs">Correct</div>
              </div>
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
                <div className="font-fredoka text-3xl text-red-400">{total - finalCorrect}</div>
                <div className="text-white/60 text-xs">Wrong</div>
              </div>
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4">
                <div className="font-fredoka text-3xl text-yellow-400">{score.toLocaleString()}</div>
                <div className="text-white/60 text-xs">Score</div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  const shuffled = shuffleArray(regionFlags);
                  const pool = shuffled.slice(0, Math.min(20, shuffled.length));
                  setQuestions(generateQuizQuestions(pool, flags, 20));
                  setCurrentIndex(0);
                  setSelectedAnswer(null);
                  setShowResult(false);
                  setCorrectCount(0);
                  setWrongAnswers([]);
                  setGameState('playing');
                  setConfettiTrigger(false);
                }}
                className="w-full bg-yellow-500 hover:bg-yellow-400 text-navy-900 font-bold py-3 rounded-2xl transition-all hover:scale-105"
              >
                🔄 Try Again
              </button>

              {wrongAnswers.length > 0 && (
                <button
                  onClick={() => setShowWrongReview(!showWrongReview)}
                  className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-3 rounded-2xl transition-all"
                >
                  📖 Review Wrong Answers ({wrongAnswers.length})
                </button>
              )}

              <div className="flex gap-3">
                <Link href={`/learn/${regionId}`} className="flex-1">
                  <button className="w-full bg-navy-700 hover:bg-navy-600 text-white font-semibold py-3 rounded-2xl transition-all text-sm">
                    📚 Review Lesson
                  </button>
                </Link>
                <Link href="/leaderboard" className="flex-1">
                  <button className="w-full bg-navy-700 hover:bg-navy-600 text-white font-semibold py-3 rounded-2xl transition-all text-sm">
                    🏆 Leaderboard
                  </button>
                </Link>
              </div>
            </div>
          </div>

          {/* Wrong answers review */}
          <AnimatePresence>
            {showWrongReview && wrongAnswers.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-navy-800 rounded-3xl p-6 border border-red-500/20"
              >
                <h3 className="font-fredoka text-xl text-white mb-4">Review Wrong Answers</h3>
                <div className="space-y-3">
                  {wrongAnswers.map((q, i) => (
                    <div key={i} className="flex items-center gap-3 bg-white/5 rounded-2xl p-3">
                      <span className="text-2xl">{q.flag.flagEmoji}</span>
                      <div>
                        <p className="text-white font-semibold text-sm">{q.flag.country}</p>
                        <p className="text-white/50 text-xs">Capital: {q.flag.capital}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    );
  }

  const q = questions[currentIndex];

  return (
    <div className="min-h-screen">
      <div className="max-w-xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <Link href="/" className="text-white/60 hover:text-white flex items-center gap-2 text-sm transition-colors">
            ← Exit
          </Link>
          <div className="text-center">
            <h1 className="font-fredoka text-lg text-white">{region.emoji} {region.name} Quiz</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-400 text-sm font-semibold">{correctCount}✅</span>
            <button
              onClick={() => setTimeEnabled(!timeEnabled)}
              className={`text-xs px-2 py-1 rounded-lg transition-all ${timeEnabled ? 'bg-orange-500 text-white' : 'bg-white/10 text-white/60'}`}
            >
              ⏱ {timeEnabled ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <ProgressBar
            current={currentIndex + 1}
            total={questions.length}
            label={`Question ${currentIndex + 1} of ${questions.length}`}
            showPercentage={false}
          />
        </div>

        {/* Timer */}
        {timeEnabled && (
          <div className="mb-4 flex items-center justify-center">
            <div className={`w-14 h-14 rounded-full border-4 flex items-center justify-center font-fredoka text-xl transition-all ${
              timeLeft <= 5 ? 'border-red-400 text-red-400 animate-pulse' : 'border-yellow-400 text-yellow-400'
            }`}>
              {timeLeft}
            </div>
          </div>
        )}

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.2 }}
          >
            <QuizQuestionComponent
              question={q}
              onAnswer={handleAnswer}
              selectedAnswer={selectedAnswer}
              showResult={showResult}
            />
          </motion.div>
        </AnimatePresence>

        {/* Score display */}
        <div className="mt-6 text-center">
          <p className="text-white/30 text-sm">
            {correctCount} correct out of {currentIndex + (selectedAnswer ? 1 : 0)} answered
          </p>
        </div>
      </div>
    </div>
  );
}
