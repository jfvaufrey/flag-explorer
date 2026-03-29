'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import type { Flag } from '@/data/flags'
import { generateQuizOptions, shuffleArray } from '@/lib/scoring'

interface MiniQuizProps {
  flags: Flag[];
  allFlags: Flag[];
  onComplete: (score?: number) => void;
}

interface MiniQuestion {
  flag: Flag;
  options: Flag[];
  correct: string;
}

export function MiniQuiz({ flags, allFlags, onComplete }: MiniQuizProps) {
  const [questions] = useState<MiniQuestion[]>(() =>
    shuffleArray(flags).slice(0, 3).map(flag => ({
      flag,
      options: generateQuizOptions(flag, allFlags, 4),
      correct: flag.country,
    }))
  );

  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [done, setDone] = useState(false);

  const handleAnswer = (answer: string) => {
    if (selected) return;
    setSelected(answer);
    setShowResult(true);

    const isCorrect = answer === questions[current].correct;
    if (isCorrect) setScore(s => s + 1);

    setTimeout(() => {
      if (current + 1 >= questions.length) {
        setDone(true);
      } else {
        setCurrent(c => c + 1);
        setSelected(null);
        setShowResult(false);
      }
    }, 1200);
  };

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-8"
      >
        <div className="text-6xl mb-4">
          {score === 3 ? '🎉' : score === 2 ? '👏' : '📚'}
        </div>
        <h3 className="font-fredoka text-3xl text-white mb-2">
          Checkpoint Complete!
        </h3>
        <p className="text-white/70 text-lg mb-6">
          You got <span className="text-yellow-400 font-bold">{score}/3</span> correct!
        </p>
        <button
          onClick={() => onComplete(score)}
          className="bg-yellow-500 hover:bg-yellow-400 text-navy-900 font-bold py-3 px-8 rounded-2xl transition-all hover:scale-105"
        >
          Continue Learning →
        </button>
      </motion.div>
    );
  }

  const q = questions[current];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-fredoka text-xl text-yellow-400">🧠 Mini Checkpoint!</h3>
        <span className="text-white/60 text-sm">Question {current + 1}/3</span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          className="space-y-4"
        >
          <div className="relative w-full rounded-2xl overflow-hidden" style={{ height: '140px' }}>
            <Image
              src={q.flag.flagImageUrl}
              alt="Flag"
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>
          <p className="text-white text-center font-semibold">Which country is this flag?</p>

          <div className="grid grid-cols-2 gap-2">
            {q.options.map((option) => {
              const isCorrect = option.country === q.correct;
              const isSelected = selected === option.country;
              return (
                <button
                  key={option.id}
                  onClick={() => handleAnswer(option.country)}
                  disabled={!!selected}
                  className={`py-3 px-4 rounded-xl font-semibold text-sm transition-all border-2 ${
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
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
