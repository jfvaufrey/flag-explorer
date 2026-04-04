'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { getPlayerName, setPlayerName } from '@/lib/storage'

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
  const [playerName, setName] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showPopover, setShowPopover] = useState(false);

  useEffect(() => {
    setName(getPlayerName());
  }, []);

  const handleChangePlayer = () => {
    setPlayerName('');
    setName(null);
    setShowPopover(false);
    setMenuOpen(false);
    window.location.href = '/';
  };

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
          <div className="hidden md:flex items-center gap-3 relative">
            {playerName ? (
              <>
                <button
                  onClick={() => setShowPopover(p => !p)}
                  className="flex items-center gap-2 bg-navy-800 px-4 py-2 rounded-xl border border-white/10 hover:border-yellow-500/50 transition-colors"
                >
                  <span className="text-lg">👤</span>
                  <span className="text-white font-semibold text-sm">{playerName}</span>
                  <span className="text-white/30 text-xs">▾</span>
                </button>

                {showPopover && (
                  <>
                    <div className="fixed inset-0" onClick={() => setShowPopover(false)} />
                    <div className="absolute right-0 top-12 bg-navy-800 border border-white/10 rounded-2xl shadow-xl py-1 min-w-[160px] z-50">
                      <div className="px-4 py-2 text-white/40 text-xs border-b border-white/10">
                        Signed in as
                        <div className="text-white font-semibold text-sm mt-0.5">{playerName}</div>
                      </div>
                      <button
                        onClick={handleChangePlayer}
                        className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-white/5 transition-colors flex items-center gap-2"
                      >
                        🔄 Change player
                      </button>
                    </div>
                  </>
                )}
              </>
            ) : (
              <button onClick={() => { window.location.href = '/'; }} className="text-yellow-400 text-sm font-semibold hover:text-yellow-300">
                Set your name →
              </button>
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
            <div className="border-t border-white/10 mt-2 pt-2">
              {playerName ? (
                <>
                  <div className="px-4 py-2 text-white/40 text-xs">
                    Playing as <span className="text-white font-semibold">{playerName}</span>
                  </div>
                  <button
                    onClick={handleChangePlayer}
                    className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-white/5 rounded-xl flex items-center gap-2"
                  >
                    🔄 Change player
                  </button>
                </>
              ) : (
                <Link href="/" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-yellow-400 font-semibold">
                  Set your name →
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
