'use client'
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { flags } from '@/data/flags'
import { Confetti } from '@/components/Confetti'
import { saveHighScore, getHighScore, awardBadge } from '@/lib/storage'
import { shuffleArray } from '@/lib/scoring'
import type { Flag } from '@/data/flags'

interface Card {
  id: string;
  pairId: string;
  type: 'flag' | 'name';
  flag: Flag;
  isFlipped: boolean;
  isMatched: boolean;
}

export default function FlagMatchPage() {
  const [cards, setCards] = useState<Card[]>([]);
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [gameState, setGameState] = useState<'playing' | 'won'>('playing');
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [elapsed, setElapsed] = useState(0);
  const [confettiTrigger, setConfettiTrigger] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const initGame = useCallback(() => {
    const gameFlags = shuffleArray(flags).slice(0, 8);
    const newCards: Card[] = [];

    gameFlags.forEach((flag) => {
      const pairId = flag.id;
      newCards.push({
        id: `flag-${flag.id}`,
        pairId,
        type: 'flag',
        flag,
        isFlipped: false,
        isMatched: false,
      });
      newCards.push({
        id: `name-${flag.id}`,
        pairId,
        type: 'name',
        flag,
        isFlipped: false,
        isMatched: false,
      });
    });

    setCards(shuffleArray(newCards));
    setSelectedCards([]);
    setMoves(0);
    setMatches(0);
    setGameState('playing');
    setStartTime(Date.now());
    setElapsed(0);
    setConfettiTrigger(false);
    setIsProcessing(false);
  }, []);

  useEffect(() => {
    initGame();
    setHighScore(getHighScore('flag-match'));
  }, [initGame]);

  useEffect(() => {
    if (gameState !== 'playing') return;
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [gameState, startTime]);

  const handleCardClick = (cardId: string) => {
    if (isProcessing) return;
    const card = cards.find(c => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched) return;
    if (selectedCards.includes(cardId)) return;
    if (selectedCards.length >= 2) return;

    const newSelected = [...selectedCards, cardId];
    setSelectedCards(newSelected);
    setCards(prev => prev.map(c => c.id === cardId ? { ...c, isFlipped: true } : c));

    if (newSelected.length === 2) {
      setMoves(m => m + 1);
      setIsProcessing(true);

      const [first, second] = newSelected;
      const firstCard = cards.find(c => c.id === first);
      const secondCard = cards.find(c => c.id === second);

      if (firstCard && secondCard && firstCard.pairId === secondCard.pairId) {
        // Match!
        setTimeout(() => {
          setCards(prev => prev.map(c =>
            c.id === first || c.id === second ? { ...c, isMatched: true } : c
          ));
          const newMatches = matches + 1;
          setMatches(newMatches);
          setSelectedCards([]);
          setIsProcessing(false);

          if (newMatches === 8) {
            const score = Math.max(1000 - moves * 10 - elapsed, 100);
            setGameState('won');
            setConfettiTrigger(true);
            setTimeout(() => setConfettiTrigger(false), 100);
            saveHighScore('flag-match', score);
            if (moves < 30) awardBadge('Memory Master');
            setHighScore(getHighScore('flag-match'));
          }
        }, 300);
      } else {
        // No match
        setTimeout(() => {
          setCards(prev => prev.map(c =>
            c.id === first || c.id === second ? { ...c, isFlipped: false } : c
          ));
          setSelectedCards([]);
          setIsProcessing(false);
        }, 1000);
      }
    }
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  if (gameState === 'won') {
    const score = Math.max(1000 - moves * 10 - elapsed, 100);
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Confetti trigger={confettiTrigger} />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-sm w-full bg-navy-800 rounded-3xl p-8 border border-white/10 text-center"
        >
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="font-fredoka text-4xl text-white mb-2">You Won!</h2>
          <p className="text-white/60 mb-6">All 8 pairs matched!</p>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-navy-700 rounded-2xl p-4">
              <div className="font-fredoka text-2xl text-yellow-400">{moves}</div>
              <div className="text-white/60 text-xs">Moves</div>
            </div>
            <div className="bg-navy-700 rounded-2xl p-4">
              <div className="font-fredoka text-2xl text-yellow-400">{formatTime(elapsed)}</div>
              <div className="text-white/60 text-xs">Time</div>
            </div>
            <div className="bg-navy-700 rounded-2xl p-4">
              <div className="font-fredoka text-2xl text-yellow-400">{score}</div>
              <div className="text-white/60 text-xs">Score</div>
            </div>
          </div>

          {score >= highScore && (
            <div className="mb-4 text-yellow-400 font-semibold">🏆 New High Score!</div>
          )}

          <div className="flex flex-col gap-3">
            <button
              onClick={initGame}
              className="w-full bg-yellow-500 hover:bg-yellow-400 text-navy-900 font-bold py-3 rounded-2xl transition-all hover:scale-105"
            >
              🔄 Play Again
            </button>
            <Link href="/games">
              <button className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-3 rounded-2xl transition-all">
                ← Back to Games
              </button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-4xl mx-auto px-4 py-6">
      <Confetti trigger={confettiTrigger} />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link href="/games" className="text-white/60 hover:text-white transition-colors text-sm">
          ← Games
        </Link>
        <h1 className="font-fredoka text-2xl text-white">🃏 Flag Match</h1>
        <div className="text-right">
          <div className="text-yellow-400 font-semibold text-sm">🏆 Best: {highScore}</div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-navy-800 rounded-2xl p-3 text-center border border-white/10">
          <div className="font-fredoka text-xl text-white">{moves}</div>
          <div className="text-white/40 text-xs">Moves</div>
        </div>
        <div className="bg-navy-800 rounded-2xl p-3 text-center border border-white/10">
          <div className="font-fredoka text-xl text-green-400">{matches}/8</div>
          <div className="text-white/40 text-xs">Matches</div>
        </div>
        <div className="bg-navy-800 rounded-2xl p-3 text-center border border-white/10">
          <div className="font-fredoka text-xl text-white">{formatTime(elapsed)}</div>
          <div className="text-white/40 text-xs">Time</div>
        </div>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        <AnimatePresence>
          {cards.map((card) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={!card.isFlipped && !card.isMatched ? { scale: 1.05 } : undefined}
              whileTap={!card.isFlipped && !card.isMatched ? { scale: 0.95 } : undefined}
              className={`relative rounded-2xl cursor-pointer overflow-hidden border-2 transition-all ${
                card.isMatched
                  ? 'border-green-500/50 opacity-60'
                  : card.isFlipped
                    ? 'border-yellow-500/50'
                    : 'border-white/10 hover:border-white/30'
              }`}
              style={{ height: '90px', perspective: '600px' }}
              onClick={() => handleCardClick(card.id)}
            >
              {/* Card back */}
              {!card.isFlipped && !card.isMatched && (
                <motion.div
                  className="absolute inset-0 bg-navy-700 flex items-center justify-center"
                  initial={false}
                >
                  <span className="text-3xl opacity-50">🏳️</span>
                </motion.div>
              )}

              {/* Card front */}
              {(card.isFlipped || card.isMatched) && (
                <motion.div
                  initial={{ rotateY: 90 }}
                  animate={{ rotateY: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0"
                >
                  {card.type === 'flag' ? (
                    <div className="relative w-full h-full">
                      <Image
                        src={card.flag.flagImageUrl}
                        alt={card.flag.country}
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 25vw, 15vw"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-full bg-navy-700 flex items-center justify-center p-2">
                      <p className="text-white font-semibold text-xs text-center leading-tight">
                        {card.flag.flagEmoji} {card.flag.country}
                      </p>
                    </div>
                  )}

                  {card.isMatched && (
                    <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                      <span className="text-xl">✅</span>
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Restart button */}
      <div className="mt-6 text-center">
        <button
          onClick={initGame}
          className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-xl text-sm font-semibold transition-all"
        >
          🔄 New Game
        </button>
      </div>
    </div>
  );
}
