'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import type { Region } from '@/data/regions'
import { flags } from '@/data/flags'

interface RegionCardProps {
  region: Region;
  mode: 'learn' | 'quiz';
}

export function RegionCard({ region, mode }: RegionCardProps) {
  const flagCount = flags.filter(f => region.continents.includes(f.continent)).length;
  const href = mode === 'learn' ? `/learn/${region.id}` : `/quiz/${region.id}`;

  return (
    <Link href={href}>
      <motion.div
        whileHover={{ scale: 1.04, y: -4 }}
        whileTap={{ scale: 0.97 }}
        className="relative rounded-3xl p-6 border-2 border-white/10 bg-navy-800 cursor-pointer overflow-hidden transition-all duration-200 hover:shadow-2xl hover:border-white/20"
      >
        {/* Background gradient */}
        <div
          className="absolute inset-0 opacity-10"
          style={{ background: `radial-gradient(circle at top right, ${region.color}, transparent 70%)` }}
        />

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-3">
            <span className="text-5xl">{region.emoji}</span>
            <span
              className="text-xs font-bold px-3 py-1 rounded-full text-white"
              style={{ background: region.color }}
            >
              {flagCount} flags
            </span>
          </div>

          <h3 className="font-fredoka text-2xl text-white mb-1">{region.name}</h3>
          <p className="text-white/50 text-sm">{region.description}</p>

          <div className="mt-4 flex items-center gap-2">
            <span
              className="text-xs font-semibold px-3 py-1.5 rounded-xl text-white flex items-center gap-1"
              style={{ background: `${region.color}40`, border: `1px solid ${region.color}60` }}
            >
              {mode === 'learn' ? '📚 Learn' : '🧠 Quiz'}
              <span className="ml-1">→</span>
            </span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
