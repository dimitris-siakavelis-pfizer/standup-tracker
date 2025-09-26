'use client';

import { useState, useEffect } from 'react';

interface TimerProps {
  isActive: boolean;
  duration: number; // in seconds
  onComplete?: () => void;
  onAutoHide?: () => void; // called when timer auto-hides for last person
  className?: string;
  showText?: boolean; // whether to show countdown text
  isLastPerson?: boolean; // whether this is the last person giving an update
}

export default function Timer({ isActive, duration, onComplete, onAutoHide, className = '', showText = false, isLastPerson = false }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [hasCompleted, setHasCompleted] = useState(false);

  useEffect(() => {
    if (!isActive) {
      setTimeLeft(duration);
      setHasCompleted(false);
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setHasCompleted(true);
          clearInterval(interval); // Stop the interval when timer completes
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, duration]);

  // Handle completion separately to avoid calling onComplete during render
  useEffect(() => {
    if (isActive && timeLeft === 0 && !hasCompleted) {
      onComplete?.();
    }
  }, [isActive, timeLeft, onComplete, hasCompleted]);

  // Auto-hide timer after 5 seconds if it's the last person
  useEffect(() => {
    if (hasCompleted && isLastPerson) {
      const timeout = setTimeout(() => {
        setHasCompleted(false);
        onAutoHide?.(); // Notify parent to remove from completedTimers
      }, 5000); // Hide after 5 seconds
      
      return () => clearTimeout(timeout);
    }
  }, [hasCompleted, isLastPerson, onAutoHide]);


  useEffect(() => {
    setTimeLeft(duration);
  }, [duration]);

  const formatTime = (seconds: number): string => {
    if (seconds <= 0) return "Time's up!";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = (): number => {
    if (duration === 0) return 0;
    if (timeLeft <= 0) return 100; // Show complete circle when time is up
    return ((duration - timeLeft) / duration) * 100;
  };

  const getTimerColor = (): string => {
    if (timeLeft <= 0) return 'text-red-600 dark:text-red-400';
    const progress = getProgressPercentage();
    if (progress < 50) return 'text-green-600 dark:text-green-400';
    if (progress < 80) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  if (!isActive && !hasCompleted) {
    return null;
  }

  if (showText) {
    return (
      <div className={`${className}`}>
        <span className={`text-sm font-mono ${getTimerColor()}`}>
          {formatTime(timeLeft)}
        </span>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <svg className="w-6 h-6 transform -rotate-90" viewBox="0 0 24 24">
        {/* Background circle */}
        <path
          d="M12 2
            a 10 10 0 0 1 0 20
            a 10 10 0 0 1 0 -20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-gray-300 dark:text-gray-600"
        />
        {/* Progress circle */}
        <path
          d="M12 2
            a 10 10 0 0 1 0 20
            a 10 10 0 0 1 0 -20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray={`${getProgressPercentage() * 0.628}, 62.8`}
          className={getTimerColor()}
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
