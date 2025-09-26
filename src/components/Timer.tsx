'use client';

import { useState, useEffect } from 'react';

interface TimerProps {
  isActive: boolean;
  duration: number; // in seconds
  onComplete?: () => void;
  className?: string;
}

export default function Timer({ isActive, duration, onComplete, className = '' }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (!isActive) {
      setTimeLeft(duration);
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, duration]);

  // Handle completion separately to avoid calling onComplete during render
  useEffect(() => {
    if (isActive && timeLeft === 0) {
      onComplete?.();
    }
  }, [isActive, timeLeft, onComplete]);

  useEffect(() => {
    setTimeLeft(duration);
  }, [duration]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = (): number => {
    return ((duration - timeLeft) / duration) * 100;
  };

  const getTimerColor = (): string => {
    const progress = getProgressPercentage();
    if (progress < 50) return 'text-green-600 dark:text-green-400';
    if (progress < 80) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  if (!isActive) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative w-8 h-8">
        <svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 36 36">
          {/* Background circle */}
          <path
            d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-gray-300 dark:text-gray-600"
          />
          {/* Progress circle */}
          <path
            d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray={`${getProgressPercentage()}, 100`}
            className={getTimerColor()}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-xs font-medium ${getTimerColor()}`}>
            {Math.ceil(timeLeft / 60)}
          </span>
        </div>
      </div>
      <span className={`text-sm font-mono ${getTimerColor()}`}>
        {formatTime(timeLeft)}
      </span>
    </div>
  );
}
