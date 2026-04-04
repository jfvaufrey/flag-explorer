import type { Flag } from '@/data/flags';

export const calculateStars = (score: number, total: number): 1 | 2 | 3 => {
  const percentage = (score / total) * 100;
  if (percentage >= 90) return 3;
  if (percentage >= 60) return 2;
  return 1;
};

export const calculateScore = (correct: number, total: number, timeBonus: number = 0): number => {
  const baseScore = correct * 100;
  const percentage = correct / total;
  const bonusMultiplier = percentage >= 0.9 ? 1.5 : percentage >= 0.6 ? 1.2 : 1;
  return Math.round(baseScore * bonusMultiplier + timeBonus);
};

export const getEncouragementMessage = (score: number): string => {
  if (score >= 90) {
    const messages = [
      '🌟 AMAZING! You\'re a Flag Master!',
      '🎉 INCREDIBLE! You know your flags!',
      '🏆 PERFECT! Geography genius!',
      '⭐ OUTSTANDING! You nailed it!',
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }
  if (score >= 60) {
    const messages = [
      '👏 Great job! Keep exploring!',
      '🌍 Well done! You\'re getting there!',
      '😊 Good work! Practice makes perfect!',
      '✨ Nice! Keep it up!',
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }
  const messages = [
    '💪 Keep trying! You\'ll get it!',
    '🌱 Good start! Practice more!',
    '📚 Keep learning! Every flag counts!',
    '🎯 Don\'t give up! You\'re improving!',
  ];
  return messages[Math.floor(Math.random() * messages.length)];
};

export const shuffleArray = <T>(arr: T[]): T[] => {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const generateQuizOptions = (correct: Flag, allFlags: Flag[], count: number = 4): Flag[] => {
  const others = allFlags.filter(f => f.id !== correct.id);
  const shuffled = shuffleArray(others);
  const wrongOptions = shuffled.slice(0, count - 1);
  const options = shuffleArray([correct, ...wrongOptions]);
  return options;
};

export interface QuizQuestion {
  type: 'flag-to-country' | 'country-to-flag' | 'capital' | 'true-false';
  flag: Flag;
  options: Flag[];
  correctAnswer: string;
  questionText: string;
  trueFalseStatement?: string;
  trueFalseAnswer?: boolean;
}

export const generateQuizQuestions = (flagPool: Flag[], allFlags: Flag[], count: number = 20): QuizQuestion[] => {
  const shuffled = shuffleArray(flagPool);
  const selected = shuffled.slice(0, Math.min(count, shuffled.length));

  return selected.map((flag, index) => {
    const questionType = index % 4;

    if (questionType === 0) {
      // Flag to country
      return {
        type: 'flag-to-country' as const,
        flag,
        options: generateQuizOptions(flag, allFlags),
        correctAnswer: flag.country,
        questionText: 'Which country does this flag belong to?',
      };
    } else if (questionType === 1) {
      // Country to flag
      const options = generateQuizOptions(flag, allFlags);
      return {
        type: 'country-to-flag' as const,
        flag,
        options,
        correctAnswer: flag.id,
        questionText: `Which flag belongs to ${flag.country}?`,
      };
    } else if (questionType === 2) {
      // Capital quiz
      return {
        type: 'capital' as const,
        flag,
        options: generateQuizOptions(flag, allFlags),
        correctAnswer: flag.capital,
        questionText: `What is the capital of ${flag.country}?`,
      };
    } else {
      // True or false
      const isTrue = Math.random() > 0.5;
      let statement: string;
      let answer: boolean;

      if (isTrue) {
        statement = `${flag.country}'s capital is ${flag.capital}.`;
        answer = true;
      } else {
        const otherFlags = allFlags.filter(f => f.id !== flag.id && f.capital !== flag.capital);
        const randomFlag = otherFlags[Math.floor(Math.random() * otherFlags.length)];
        statement = randomFlag
          ? `${flag.country}'s capital is ${randomFlag.capital}.`
          : `${flag.country} is in ${flag.continent === 'Asia' ? 'Europe' : 'Asia'}.`;
        answer = false;
      }

      return {
        type: 'true-false' as const,
        flag,
        options: [],
        correctAnswer: String(answer),
        questionText: 'True or False:',
        trueFalseStatement: statement,
        trueFalseAnswer: answer,
      };
    }
  });
};
