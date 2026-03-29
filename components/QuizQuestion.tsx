'use client'
import Image from 'next/image'
import { motion } from 'framer-motion'
import type { QuizQuestion } from '@/lib/scoring'

interface QuizQuestionProps {
  question: QuizQuestion;
  onAnswer: (answer: string) => void;
  selectedAnswer: string | null;
  showResult: boolean;
}

export function QuizQuestionComponent({ question, onAnswer, selectedAnswer, showResult }: QuizQuestionProps) {
  const getButtonClass = (optionValue: string) => {
    if (!showResult) {
      return selectedAnswer === optionValue
        ? 'w-full py-4 px-6 rounded-2xl text-left font-semibold text-base transition-all duration-200 border-2 bg-blue-600 border-blue-400 text-white'
        : 'w-full py-4 px-6 rounded-2xl text-left font-semibold text-base transition-all duration-200 border-2 border-white/10 bg-white/5 text-white hover:bg-white/10 hover:border-white/20 cursor-pointer';
    }
    if (optionValue === question.correctAnswer) {
      return 'w-full py-4 px-6 rounded-2xl text-left font-semibold text-base transition-all duration-200 border-2 bg-green-600 border-green-400 text-white';
    }
    if (optionValue === selectedAnswer) {
      return 'w-full py-4 px-6 rounded-2xl text-left font-semibold text-base transition-all duration-200 border-2 bg-red-600 border-red-400 text-white';
    }
    return 'w-full py-4 px-6 rounded-2xl text-left font-semibold text-base transition-all duration-200 border-2 border-white/5 bg-white/3 text-white/40';
  };

  if (question.type === 'true-false') {
    return (
      <div className="space-y-6">
        <div className="bg-white/5 rounded-3xl p-6 text-center">
          <div className="relative w-full mb-4 rounded-2xl overflow-hidden" style={{ height: '160px' }}>
            <Image
              src={question.flag.flagImageUrl}
              alt={`Flag of ${question.flag.country}`}
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>
          <p className="text-white/60 text-sm mb-2">{question.questionText}</p>
          <p className="text-white text-xl font-semibold">&quot;{question.trueFalseStatement}&quot;</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {['true', 'false'].map((answer) => (
            <motion.button
              key={answer}
              whileTap={{ scale: 0.97 }}
              className={`py-5 rounded-2xl font-fredoka text-2xl transition-all duration-200 border-2 ${
                !showResult
                  ? selectedAnswer === answer
                    ? 'bg-blue-600 border-blue-400 text-white'
                    : 'border-white/10 bg-white/5 text-white hover:bg-white/10'
                  : answer === String(question.trueFalseAnswer)
                    ? 'bg-green-600 border-green-400 text-white'
                    : answer === selectedAnswer
                      ? 'bg-red-600 border-red-400 text-white'
                      : 'border-white/5 bg-white/3 text-white/40'
              }`}
              onClick={() => !selectedAnswer && onAnswer(answer)}
              disabled={!!selectedAnswer}
            >
              {answer === 'true' ? '✅ TRUE' : '❌ FALSE'}
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  if (question.type === 'country-to-flag') {
    return (
      <div className="space-y-6">
        <div className="bg-white/5 rounded-3xl p-6 text-center">
          <p className="text-white/60 text-sm mb-2">{question.questionText}</p>
          <p className="text-white font-fredoka text-3xl">{question.flag.country}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {question.options.map((option) => {
            const optionValue = option.id;
            let borderColor = 'border-white/10';
            if (showResult) {
              if (optionValue === question.correctAnswer) borderColor = 'border-green-400';
              else if (optionValue === selectedAnswer) borderColor = 'border-red-400';
            } else if (selectedAnswer === optionValue) {
              borderColor = 'border-blue-400';
            }

            return (
              <motion.button
                key={option.id}
                whileTap={{ scale: 0.97 }}
                className={`relative rounded-2xl overflow-hidden border-4 ${borderColor} transition-all duration-200 cursor-pointer`}
                style={{ height: '100px' }}
                onClick={() => !selectedAnswer && onAnswer(optionValue)}
                disabled={!!selectedAnswer}
              >
                <Image
                  src={option.flagImageUrl}
                  alt={`Flag of ${option.country}`}
                  fill
                  className="object-contain"
                  sizes="50vw"
                />
                {showResult && optionValue === question.correctAnswer && (
                  <div className="absolute inset-0 bg-green-500/30 flex items-center justify-center">
                    <span className="text-3xl">✅</span>
                  </div>
                )}
                {showResult && optionValue === selectedAnswer && optionValue !== question.correctAnswer && (
                  <div className="absolute inset-0 bg-red-500/30 flex items-center justify-center">
                    <span className="text-3xl">❌</span>
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    );
  }

  // Flag to country or Capital quiz
  const getOptionLabel = (option: typeof question.options[0]) => {
    if (question.type === 'capital') return option.capital;
    return option.country;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/5 rounded-3xl p-4">
        <div className="relative w-full rounded-2xl overflow-hidden mb-4" style={{ height: '180px' }}>
          <Image
            src={question.flag.flagImageUrl}
            alt="Flag"
            fill
            className="object-contain"
            sizes="100vw"
          />
        </div>
        <p className="text-white/60 text-sm text-center">{question.questionText}</p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {question.options.map((option) => {
          const optionValue = question.type === 'capital' ? option.capital : option.country;
          return (
            <motion.button
              key={option.id}
              whileTap={{ scale: 0.98 }}
              className={getButtonClass(optionValue)}
              onClick={() => !selectedAnswer && onAnswer(optionValue)}
              disabled={!!selectedAnswer}
            >
              <span className="flex items-center gap-3">
                <span>{getOptionLabel(option)}</span>
                {showResult && optionValue === question.correctAnswer && <span className="ml-auto">✅</span>}
                {showResult && optionValue === selectedAnswer && optionValue !== question.correctAnswer && <span className="ml-auto">❌</span>}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
