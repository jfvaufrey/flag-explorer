export interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  region: string;
  date: string;
  stars: number;
}

export interface LessonProgress {
  regionId: string;
  completedFlags: string[];
  totalFlags: number;
  quizScore?: number;
  completedAt?: string;
}

export interface DailyChallengeState {
  date: string;
  flagIds: string[];
  completed: boolean;
  score: number;
  answers: Record<string, boolean>;
}

const isBrowser = () => typeof window !== 'undefined';

// Leaderboard
export const saveScore = (entry: LeaderboardEntry): void => {
  if (!isBrowser()) return;
  const board = getLeaderboard();
  board.push(entry);
  board.sort((a, b) => b.score - a.score);
  const top20 = board.slice(0, 20);
  localStorage.setItem('flag_leaderboard', JSON.stringify(top20));
};

export const getLeaderboard = (): LeaderboardEntry[] => {
  if (!isBrowser()) return [];
  try {
    const data = localStorage.getItem('flag_leaderboard');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const clearLeaderboard = (): void => {
  if (!isBrowser()) return;
  localStorage.removeItem('flag_leaderboard');
};

// Player name
export const getPlayerName = (): string | null => {
  if (!isBrowser()) return null;
  return localStorage.getItem('flag_player_name');
};

export const setPlayerName = (name: string): void => {
  if (!isBrowser()) return;
  localStorage.setItem('flag_player_name', name);
};

// Progress
export const saveProgress = (regionId: string, progress: LessonProgress): void => {
  if (!isBrowser()) return;
  const key = `flag_progress_${regionId}`;
  localStorage.setItem(key, JSON.stringify(progress));
};

export const getProgress = (regionId: string): LessonProgress | null => {
  if (!isBrowser()) return null;
  try {
    const data = localStorage.getItem(`flag_progress_${regionId}`);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

// Batch (lesson group) progress
export const saveBatchProgress = (regionId: string, batchIndex: number, progress: LessonProgress): void => {
  if (!isBrowser()) return;
  localStorage.setItem(`flag_batch_${regionId}_${batchIndex}`, JSON.stringify(progress));
};

export const getBatchProgress = (regionId: string, batchIndex: number): LessonProgress | null => {
  if (!isBrowser()) return null;
  try {
    const data = localStorage.getItem(`flag_batch_${regionId}_${batchIndex}`);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

export const getAllBatchProgress = (regionId: string): (LessonProgress | null)[] => {
  if (!isBrowser()) return [];
  const results: (LessonProgress | null)[] = [];
  let i = 0;
  while (true) {
    const data = localStorage.getItem(`flag_batch_${regionId}_${i}`);
    if (data === null && i > 0) break;
    results.push(data ? JSON.parse(data) : null);
    i++;
    if (i > 50) break; // safety cap
  }
  return results;
};

export const getAllProgress = (): LessonProgress[] => {
  if (!isBrowser()) return [];
  const results: LessonProgress[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.startsWith('flag_progress_') || key.startsWith('flag_batch_'))) {
      try {
        const data = localStorage.getItem(key);
        if (data) results.push(JSON.parse(data));
      } catch {
        // skip
      }
    }
  }
  return results;
};

export const getCompletedLessonsCount = (): number => {
  if (!isBrowser()) return 0;
  const progress = getAllProgress();
  return progress.filter(p => p.completedAt).length;
};

// Streak
export interface StreakData {
  count: number;
  lastDate: string;
}

export const getStreak = (): StreakData => {
  if (!isBrowser()) return { count: 0, lastDate: '' };
  try {
    const data = localStorage.getItem('flag_streak');
    return data ? JSON.parse(data) : { count: 0, lastDate: '' };
  } catch {
    return { count: 0, lastDate: '' };
  }
};

export const updateStreak = (): void => {
  if (!isBrowser()) return;
  const today = new Date().toISOString().split('T')[0];
  const streak = getStreak();

  if (streak.lastDate === today) return;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const newCount = streak.lastDate === yesterdayStr ? streak.count + 1 : 1;
  localStorage.setItem('flag_streak', JSON.stringify({ count: newCount, lastDate: today }));

  // Award streak badges
  if (newCount >= 7) awardBadge('7-Day Streak');
  if (newCount >= 30) awardBadge('30-Day Streak');
};

// Badges
export const getBadges = (): string[] => {
  if (!isBrowser()) return [];
  try {
    const data = localStorage.getItem('flag_badges');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const awardBadge = (badge: string): boolean => {
  if (!isBrowser()) return false;
  const badges = getBadges();
  if (!badges.includes(badge)) {
    badges.push(badge);
    localStorage.setItem('flag_badges', JSON.stringify(badges));
    return true; // newly awarded
  }
  return false;
};

// Games unlocked
export const getGamesUnlocked = (): boolean => {
  if (!isBrowser()) return false;
  return getCompletedLessonsCount() >= 2;
};

// Daily challenge
export const getDailyChallenge = (): DailyChallengeState | null => {
  if (!isBrowser()) return null;
  try {
    const data = localStorage.getItem('flag_daily_challenge');
    if (!data) return null;
    const state: DailyChallengeState = JSON.parse(data);
    const today = new Date().toISOString().split('T')[0];
    if (state.date !== today) return null;
    return state;
  } catch {
    return null;
  }
};

export const saveDailyChallenge = (state: DailyChallengeState): void => {
  if (!isBrowser()) return;
  localStorage.setItem('flag_daily_challenge', JSON.stringify(state));
};

// High scores for games
export const getHighScore = (game: string): number => {
  if (!isBrowser()) return 0;
  try {
    const data = localStorage.getItem(`flag_highscore_${game}`);
    return data ? parseInt(data, 10) : 0;
  } catch {
    return 0;
  }
};

export const saveHighScore = (game: string, score: number): void => {
  if (!isBrowser()) return;
  const current = getHighScore(game);
  if (score > current) {
    localStorage.setItem(`flag_highscore_${game}`, String(score));
  }
};

// Hard mode
export const getHardMode = (): boolean => {
  if (!isBrowser()) return false;
  return localStorage.getItem('flag_hard_mode') === 'true';
};

export const setHardMode = (enabled: boolean): void => {
  if (!isBrowser()) return;
  localStorage.setItem('flag_hard_mode', String(enabled));
};

// Stats
export interface Stats {
  flagsLearned: number;
  streak: number;
  badgeCount: number;
  totalScore: number;
}

export const getStats = (): Stats => {
  if (!isBrowser()) return { flagsLearned: 0, streak: 0, badgeCount: 0, totalScore: 0 };
  const progress = getAllProgress();
  const flagsLearned = progress.reduce((sum, p) => sum + p.completedFlags.length, 0);
  const streak = getStreak().count;
  const badgeCount = getBadges().length;
  const leaderboard = getLeaderboard();
  const playerName = getPlayerName();
  const totalScore = playerName
    ? leaderboard.filter(e => e.name === playerName).reduce((sum, e) => sum + e.score, 0)
    : 0;
  return { flagsLearned, streak, badgeCount, totalScore };
};
