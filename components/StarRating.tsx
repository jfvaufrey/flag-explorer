'use client'
import { useEffect, useState } from 'react'

interface StarRatingProps {
  stars: 1 | 2 | 3;
  animate?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function StarRating({ stars, animate = true, size = 'lg' }: StarRatingProps) {
  const [visibleStars, setVisibleStars] = useState(0);

  useEffect(() => {
    if (!animate) {
      setVisibleStars(stars);
      return;
    }
    setVisibleStars(0);
    let count = 0;
    const timer = setInterval(() => {
      count++;
      setVisibleStars(count);
      if (count >= stars) clearInterval(timer);
    }, 400);
    return () => clearInterval(timer);
  }, [stars, animate]);

  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-6xl',
  };

  return (
    <div className="flex items-center gap-2 justify-center">
      {[1, 2, 3].map((star) => (
        <span
          key={star}
          className={`${sizeClasses[size]} transition-all duration-300 ${
            star <= visibleStars
              ? 'opacity-100 scale-100 star-animated'
              : 'opacity-20 scale-75 grayscale'
          }`}
          style={{
            animationDelay: `${(star - 1) * 0.1}s`,
            display: 'inline-block',
          }}
        >
          ⭐
        </span>
      ))}
    </div>
  );
}
