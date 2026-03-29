'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface GameCardProps {
  title: string;
  description: string;
  icon: string;
  href: string;
  color: string;
  highScore?: number;
  locked?: boolean;
  lockedMessage?: string;
}

export function GameCard({ title, description, icon, href, color, highScore, locked, lockedMessage }: GameCardProps) {
  const content = (
    <motion.div
      whileHover={!locked ? { scale: 1.03, y: -4 } : undefined}
      whileTap={!locked ? { scale: 0.98 } : undefined}
      className={`relative rounded-3xl p-6 border-2 h-full transition-all duration-200 ${
        locked
          ? 'border-white/5 bg-navy-900/50 opacity-60 cursor-not-allowed'
          : 'border-white/10 bg-navy-800 cursor-pointer hover:border-white/20 hover:shadow-xl'
      }`}
    >
      {locked && (
        <div className="absolute inset-0 rounded-3xl bg-navy-950/60 flex flex-col items-center justify-center z-10">
          <span className="text-4xl mb-2">🔒</span>
          <p className="text-white/60 text-sm text-center px-4">{lockedMessage || 'Complete 2 lessons to unlock!'}</p>
        </div>
      )}

      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4"
        style={{ background: `${color}30`, border: `2px solid ${color}50` }}
      >
        {icon}
      </div>

      <h3 className="font-fredoka text-2xl text-white mb-2">{title}</h3>
      <p className="text-white/60 text-sm font-nunito mb-4 leading-relaxed">{description}</p>

      {highScore !== undefined && highScore > 0 && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-yellow-400 text-sm">🏆 Best:</span>
          <span className="text-yellow-400 font-bold">{highScore.toLocaleString()}</span>
        </div>
      )}

      {!locked && (
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white font-semibold text-sm"
          style={{ background: color }}
        >
          Play Now →
        </div>
      )}
    </motion.div>
  );

  if (locked) return content;

  return <Link href={href} className="block h-full">{content}</Link>;
}
