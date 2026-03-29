'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { getPlayerName } from '@/lib/storage'

const navLinks = [
  { href: '/', label: 'Home', emoji: '🏠' },
  { href: '/learn/world', label: 'Learn', emoji: '📚' },
  { href: '/quiz/world', label: 'Quiz', emoji: '🧠' },
  { href: '/games', label: 'Games', emoji: '🎮' },
  { href: '/challenges', label: 'Challenges', emoji: '🏆' },
  { href: '/leaderboard', label: 'Leaderboard', emoji: '📊' },
];

export function NavBar() {
  const pathname = usePathname();
  const [playerName, setPlayerName] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setPlayerName(getPlayerName());
  }, []);

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-navy-900/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-2xl group-hover:animate-wiggle inline-block">⛵</span>
            <span className="font-fredoka text-xl text-white">Flag Explorer</span>
            <span className="text-white/40 text-xs font-nunito hidden sm:inline">by Elise</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-yellow-500 text-navy-900'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span>{link.emoji}</span>
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Player name */}
          <div className="hidden md:flex items-center gap-3">
            {playerName ? (
              <div className="flex items-center gap-2 bg-navy-800 px-4 py-2 rounded-xl border border-white/10">
                <span className="text-lg">👤</span>
                <span className="text-white font-semibold text-sm">{playerName}</span>
              </div>
            ) : (
              <Link href="/" className="text-yellow-400 text-sm font-semibold hover:text-yellow-300">
                Set your name →
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-white p-2 rounded-xl hover:bg-white/10"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 pt-2 space-y-1 border-t border-white/10">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${
                    isActive ? 'bg-yellow-500 text-navy-900' : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span>{link.emoji}</span>
                  <span>{link.label}</span>
                </Link>
              );
            })}
            {playerName && (
              <div className="px-4 py-3 text-white/60 text-sm border-t border-white/10 mt-2 pt-3">
                👤 Playing as: <span className="text-white font-semibold">{playerName}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
