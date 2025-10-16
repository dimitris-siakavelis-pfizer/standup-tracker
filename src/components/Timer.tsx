'use client';

import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';

interface TimerProps {
  isActive: boolean;
  duration: number; // in seconds
  onComplete?: () => void;
  onAutoHide?: () => void; // called when timer auto-hides for last person
  className?: string;
  showText?: boolean; // whether to show countdown text
  isLastPerson?: boolean; // whether this is the last person giving an update
  explosionEnabled?: boolean; // whether to show full-viewport explosion
  rotatingImageEnabled?: boolean; // whether to show rotating image after explosion
  rotatingImageUrl?: string; // URL of the rotating image
}

export default function Timer({ isActive, duration, onComplete, onAutoHide, className = '', showText = false, isLastPerson = false, explosionEnabled = true, rotatingImageEnabled = false, rotatingImageUrl = '' }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [showExplosion, setShowExplosion] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showRotatingImage, setShowRotatingImage] = useState(false);

  useEffect(() => {
    if (!isActive) {
      setTimeLeft(duration);
      setHasCompleted(false);
      setShowExplosion(false);
      setShowConfetti(false);
      setShowRotatingImage(false);
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

  // Trigger explosion when time is up
  useEffect(() => {
    if (timeLeft === 0) {
      setShowExplosion(true);
      setShowConfetti(true);
      const t1 = setTimeout(() => setShowExplosion(false), 3000);
      const t2 = setTimeout(() => setShowConfetti(false), 3000);
      
      // Show rotating image after explosion if enabled
      if (rotatingImageEnabled && rotatingImageUrl) {
        const t3 = setTimeout(() => setShowRotatingImage(true), 3000);
        return () => {
          clearTimeout(t1);
          clearTimeout(t2);
          clearTimeout(t3);
        };
      }
      
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    } else {
      setShowExplosion(false);
      setShowConfetti(false);
      setShowRotatingImage(false);
    }
  }, [timeLeft, rotatingImageEnabled, rotatingImageUrl]);

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

  const shouldShowOverlay = showExplosion && explosionEnabled && showText;
  const shouldShowRotatingImageOverlay = showRotatingImage && rotatingImageEnabled && rotatingImageUrl && showText;

  // Handle click to hide rotating image
  const handleRotatingImageClick = () => {
    setShowRotatingImage(false);
  };

  const overlayConfettiPieces = useMemo(() => {
    if (!shouldShowOverlay) return [] as Array<{ tx: number; ty: number; size: number; color: string }>;
    const colors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];
    const pieces: Array<{ tx: number; ty: number; size: number; color: string }> = [];
    const count = 36;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + (Math.random() * 12 - 6) * (Math.PI / 180);
      const radius = 140 + Math.random() * 180; // px
      const tx = Math.cos(angle) * radius;
      const ty = Math.sin(angle) * radius;
      const size = 8 + Math.floor(Math.random() * 6); // 8-13px
      const color = colors[i % colors.length];
      pieces.push({ tx, ty, size, color });
    }
    return pieces;
  }, [shouldShowOverlay]);

  // Add/remove screen shake while overlay is visible (target #app-root to avoid affecting fixed overlay)
  useEffect(() => {
    if (!shouldShowOverlay) return;
    if (typeof document !== 'undefined') {
      const root = document.getElementById('app-root');
      root?.classList.add('screen-shake');
      const t = setTimeout(() => {
        root?.classList.remove('screen-shake');
      }, 3000);
      return () => {
        clearTimeout(t);
        root?.classList.remove('screen-shake');
      };
    }
  }, [shouldShowOverlay]);

  const overlay = shouldShowOverlay && typeof window !== 'undefined'
    ? createPortal(
        <div className="explosion-overlay fixed left-0 top-0 z-[9999] pointer-events-none">
          <div className="absolute inset-0 explosion-backdrop" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <span className="block text-center explosion-emoji explosion-emoji--xl" aria-hidden="true">💥</span>
            <span className="block mx-auto shockwave-ring shockwave-ring--xl" aria-hidden="true" />
            <div className="confetti-burst relative w-0 h-0" aria-hidden="true">
              {overlayConfettiPieces.map((p, idx) => (
                <span
                  key={idx}
                  className="confetti-piece confetti-piece--long"
                  style={{
                    ['--tx' as unknown as keyof React.CSSProperties]: `${Math.round(p.tx)}px` as unknown as never,
                    ['--ty' as unknown as keyof React.CSSProperties]: `${Math.round(p.ty)}px` as unknown as never,
                    width: `${p.size}px`,
                    height: `${Math.round(p.size * 1.6)}px`,
                    background: p.color,
                  }}
                />
              ))}
            </div>
          </div>
        </div>,
        document.body
      )
    : null;

  const rotatingImageOverlay = shouldShowRotatingImageOverlay && typeof window !== 'undefined'
    ? createPortal(
        <div 
          className="fixed left-0 top-0 w-full h-full z-[9999] pointer-events-auto cursor-pointer"
          onClick={handleRotatingImageClick}
        >
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <img 
              src={rotatingImageUrl} 
              alt="Rotating celebration" 
              className="max-w-80 max-h-80 animate-spin"
              style={{ animationDuration: '2s' }}
            />
          </div>
        </div>,
        document.body
      )
    : null;

  // Important: Only return after all hooks above have been called
  if (!isActive && !hasCompleted) {
    return null;
  }

  if (showText) {
    return (
      <div className={`${className} relative inline-block`}>
        <span className={`text-sm font-mono ${getTimerColor()}`}>
          {formatTime(timeLeft)}
        </span>
        {showExplosion && (
          <>
            <span className="absolute left-1/2 -translate-x-1/2 -top-6 explosion-emoji explosion-emoji--big" aria-hidden="true">💥</span>
            <span className="absolute left-1/2 -translate-x-1/2 -top-5 shockwave-ring" aria-hidden="true" />
          </>
        )}
        {showConfetti && (
          <div className="confetti-burst absolute left-1/2 -translate-x-1/2 -top-8" aria-hidden="true">
            {Array.from({ length: 12 }).map((_, i) => (
              <span key={i} className="confetti-piece" />
            ))}
          </div>
        )}
        {overlay}
        {rotatingImageOverlay}
      </div>
    );
  }

  return (
    <div className={`${className} relative inline-block`}>
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
      {showExplosion && (
        <>
          <span className="absolute left-1/2 -translate-x-1/2 -top-4 explosion-emoji explosion-emoji--big" aria-hidden="true">💥</span>
          <span className="absolute left-1/2 -translate-x-1/2 -top-3 shockwave-ring" aria-hidden="true" />
        </>
      )}
      {showConfetti && (
        <div className="confetti-burst absolute left-1/2 -translate-x-1/2 -top-6" aria-hidden="true">
          {Array.from({ length: 12 }).map((_, i) => (
            <span key={i} className="confetti-piece" />
          ))}
        </div>
      )}
      {overlay}
      {rotatingImageOverlay}
    </div>
  );
}
