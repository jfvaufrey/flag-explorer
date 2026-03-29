'use client'

interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
  color?: string;
  showPercentage?: boolean;
}

export function ProgressBar({ current, total, label, color, showPercentage = true }: ProgressBarProps) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="w-full">
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-2">
          {label && <span className="text-sm font-semibold text-white/80">{label}</span>}
          {showPercentage && (
            <span className="text-sm font-bold text-yellow-400">{percentage}%</span>
          )}
        </div>
      )}
      <div className="h-3 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${percentage}%`,
            background: color || 'linear-gradient(to right, #ffd700, #ff6644)',
          }}
        />
      </div>
      {label && (
        <div className="flex justify-between mt-1">
          <span className="text-xs text-white/50">{current} / {total}</span>
        </div>
      )}
    </div>
  );
}
