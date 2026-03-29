'use client'
import { motion } from 'framer-motion'
import Image from 'next/image'
import type { Flag } from '@/data/flags'

interface FlagCardProps {
  flag: Flag;
  isFlipped: boolean;
  onFlip: () => void;
  showBack?: boolean;
}

const continentColors: Record<string, string> = {
  'Africa': 'bg-orange-600',
  'Asia': 'bg-amber-600',
  'Europe': 'bg-green-700',
  'North America': 'bg-red-700',
  'South America': 'bg-purple-700',
  'Oceania': 'bg-cyan-700',
  'Antarctica': 'bg-indigo-700',
};

export function FlagCard({ flag, isFlipped, onFlip }: FlagCardProps) {
  return (
    <div
      className="flip-card w-full cursor-pointer"
      style={{ height: '340px' }}
      onClick={onFlip}
    >
      <motion.div
        className="flip-card-inner w-full h-full"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
        style={{ transformStyle: 'preserve-3d', position: 'relative' }}
      >
        {/* Front - Flag */}
        <div
          className="absolute inset-0 rounded-3xl overflow-hidden border-2 border-white/10 bg-navy-800 flex flex-col items-center justify-center"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="relative w-full" style={{ height: '220px' }}>
            <Image
              src={flag.flagImageUrl}
              alt={`Flag of ${flag.country}`}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          <div className="p-4 text-center">
            <p className="text-white/60 text-sm font-nunito">Tap to reveal!</p>
          </div>
          <div className="absolute bottom-4 right-4 text-white/30 text-2xl">↻</div>
        </div>

        {/* Back - Info */}
        <div
          className="absolute inset-0 rounded-3xl overflow-hidden border-2 border-yellow-500/30 bg-gradient-to-br from-navy-800 to-navy-900 flex flex-col p-6"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <h2 className="font-fredoka text-2xl text-white leading-tight">{flag.country}</h2>
              <p className="text-yellow-400 font-semibold mt-1">🏛️ {flag.capital}</p>
            </div>
            <span className="text-4xl">{flag.flagEmoji}</span>
          </div>

          <span
            className={`inline-block px-3 py-1 rounded-full text-white text-xs font-bold mb-3 w-fit ${continentColors[flag.continent] || 'bg-blue-700'}`}
          >
            {flag.continent}
          </span>

          <div className="flex-1 bg-white/5 rounded-2xl p-4">
            <p className="text-white/40 text-xs font-bold uppercase tracking-wider mb-2">Fun Fact</p>
            <p className="text-white/90 text-sm font-nunito leading-relaxed">{flag.funFact}</p>
          </div>

          <p className="text-white/30 text-xs text-center mt-3">Tap to flip back</p>
        </div>
      </motion.div>
    </div>
  );
}
