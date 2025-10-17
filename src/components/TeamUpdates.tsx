'use client';


import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { TeamMember, AppState } from '@/types';
import Timer from './Timer';

interface TeamUpdatesProps {
  teamMembers: TeamMember[];
  onUpdateMember: (id: string, updates: Partial<TeamMember>) => void;
  blinkingMembers: Set<string>;
  setBlinkingMembers: React.Dispatch<React.SetStateAction<Set<string>>>;
  timerEnabled: boolean;
  explosionEnabled: boolean;
  afterExplosionImageEnabled: boolean;
  afterExplosionImageUrl: string;
  afterExplosionImageRotationEnabled: boolean;
  activeTimer: AppState['activeTimer'];
  completedTimers: Set<string>;
  onStartTimer: (memberId: string) => void;
  onStopTimer: () => void;
}

interface AutoScrollingInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
  overlayTextClassName?: string;
}

function AutoScrollingInput({ value, onChange, placeholder, className, overlayTextClassName }: AutoScrollingInputProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLSpanElement | null>(null);
  const measureRef = useRef<HTMLSpanElement | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [contentWidth, setContentWidth] = useState(0);

  const SPEED_PX_PER_SEC = 30; // marquee speed
  const GAP_PX = 48; // space between repeats

  const overlayActive = useMemo(() => !isFocused && isOverflowing && value.trim() !== '', [isFocused, isOverflowing, value]);

  const updateOverflow = useCallback(() => {
    const el = inputRef.current;
    const measure = measureRef.current;
    if (!el || !measure) return;
    const styles = getComputedStyle(el);
    measure.style.font = styles.font;
    measure.style.letterSpacing = styles.letterSpacing;
    measure.textContent = value;

    const textWidth = Math.ceil(measure.scrollWidth);
    const paddingLeft = parseFloat(styles.paddingLeft) || 0;
    const paddingRight = parseFloat(styles.paddingRight) || 0;
    const available = el.clientWidth - paddingLeft - paddingRight;
    setIsOverflowing(textWidth > available);
    setContentWidth(textWidth);
  }, [value]);

  useEffect(() => {
    updateOverflow();
  }, [value, updateOverflow]);

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => updateOverflow());
    ro.observe(el);
    const onResize = () => updateOverflow();
    window.addEventListener('resize', onResize);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', onResize);
    };
  }, [updateOverflow]);

  // Apply font to overlay when active so it matches the input
  useEffect(() => {
    if (!overlayActive) return;
    const overlay = overlayRef.current;
    const el = inputRef.current;
    if (!overlay || !el) return;
    const styles = getComputedStyle(el);
    overlay.style.font = styles.font;
    overlay.style.letterSpacing = styles.letterSpacing;
  }, [overlayActive]);

  // Measure content width when marquee is active
  useEffect(() => {
    if (!overlayActive) return;
    const span = contentRef.current;
    if (!span) return;
    const width = Math.ceil(span.scrollWidth);
    setContentWidth(width);
  }, [overlayActive, value]);

  const marqueeStyle = useMemo<React.CSSProperties>(() => {
    const distance = contentWidth + GAP_PX;
    const dur = Math.max(4, distance / SPEED_PX_PER_SEC); // minimum duration
    return {
      // CSS variable properties are not in the React.CSSProperties index, but we can set them via
      // a type-safe cast using the index signature
      ['--marquee-translate' as unknown as keyof React.CSSProperties]: `-${distance}px` as unknown as never,
      ['--marquee-duration' as unknown as keyof React.CSSProperties]: `${dur}s` as unknown as never,
      gap: `${GAP_PX}px`,
    } as React.CSSProperties;
  }, [contentWidth]);

  return (
    <div ref={containerRef} className="relative">
      {/* hidden measurer for accurate text width */}
      <span ref={measureRef} style={{ position: 'absolute', visibility: 'hidden', whiteSpace: 'nowrap' }} />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`${className} ${overlayActive ? 'text-transparent' : ''}`}
        style={overlayActive ? { color: 'transparent', WebkitTextFillColor: 'transparent' } as React.CSSProperties : undefined}
        onFocus={() => {
          setIsFocused(true);
          if (inputRef.current) inputRef.current.scrollLeft = 0;
        }}
        onBlur={() => {
          setIsFocused(false);
          updateOverflow();
        }}
      />

      {overlayActive && (
        <div ref={overlayRef} className={`absolute inset-0 flex items-center overflow-hidden px-2 pointer-events-none ${overlayTextClassName || ''}`}>
          <div className="marquee-track" style={marqueeStyle}>
            <span ref={contentRef} className="inline-block whitespace-nowrap marquee-text">{value}</span>
            <span className="inline-block whitespace-nowrap marquee-text" aria-hidden="true">{value}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TeamUpdates({ teamMembers, onUpdateMember, blinkingMembers, setBlinkingMembers, timerEnabled, explosionEnabled, afterExplosionImageEnabled, afterExplosionImageUrl, afterExplosionImageRotationEnabled, activeTimer, completedTimers, onStartTimer, onStopTimer }: TeamUpdatesProps) {
  const enabledMembers = teamMembers.filter(member => member.enabled);
  const updatedMembers = enabledMembers.filter(member => member.updateGiven);
  
  // Check if this member is the last one to give an update
  const isLastPerson = (memberId: string) => {
    const currentMember = enabledMembers.find(m => m.id === memberId);
    if (!currentMember) return false;
    
    // Count how many other members have given updates
    const otherMembersUpdated = enabledMembers
      .filter(m => m.id !== memberId)
      .filter(m => m.updateGiven).length;
    
    // This is the last person if all other members have given updates
    return otherMembersUpdated === enabledMembers.length - 1;
  };

  const handleBlockerChange = (id: string, blocker: string) => {
    onUpdateMember(id, { blocker, updateGiven: true });
  };



  const handleCardClick = (id: string, currentUpdateGiven: boolean) => {
    // Find the member to check if they have blocker text
    const member = enabledMembers.find(m => m.id === id);
    const hasBlockerText = member?.blocker && member.blocker.trim() !== '';
    
    // If they have blocker text, don't allow unchecking (always keep updateGiven as true)
    if (hasBlockerText && currentUpdateGiven) {
      return; // Don't change the status if they have blockers and are currently marked as updated
    }
    
    const newUpdateGiven = !currentUpdateGiven;
    onUpdateMember(id, { updateGiven: newUpdateGiven });
    
    // Timer logic
    if (timerEnabled) {
      if (newUpdateGiven) {
        // Starting timer for this member
        onStartTimer(id);
      } else {
        // Stopping timer if this member was the active one
        if (activeTimer?.memberId === id) {
          onStopTimer();
        }
      }
    }
    
    // Add flashy animation when checking
    if (newUpdateGiven) {
      setBlinkingMembers(prev => new Set([...Array.from(prev), id]));
      setTimeout(() => {
        setBlinkingMembers(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      }, 1500); // Flash for 1.5 seconds
    }
  };

  const handleBlockerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Team Updates</h2>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {updatedMembers.length} of {enabledMembers.length} updates given
        </div>
      </div>

      {enabledMembers.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400 mb-2">No enabled team members</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm">Enable team members to track their updates</p>
        </div>
      ) : (
        <div className="space-y-4">
          {enabledMembers.map((member) => (
            <div 
              key={member.id} 
              className={`border border-gray-200 dark:border-gray-600 rounded-md p-3 transition-all duration-300 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${
                (member.blocker && member.blocker.trim() !== '')
                  ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
                  : member.updateGiven 
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700' 
                    : 'bg-white dark:bg-gray-800'
              } ${blinkingMembers.has(member.id) ? 'animate-pulse scale-105 shadow-lg border-green-400 dark:border-green-500 bg-green-100 dark:bg-green-900/30' : ''}`}
              onClick={() => handleCardClick(member.id, member.updateGiven || false)}
            >
              <div className="flex items-center gap-3">
                <div className="relative flex-shrink-0">
                  <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    (member.blocker && member.blocker.trim() !== '')
                      ? 'bg-red-500'
                      : member.updateGiven ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-500'
                  } ${blinkingMembers.has(member.id) ? 'scale-150 bg-green-600' : ''}`}></div>
                  {timerEnabled && (activeTimer?.memberId === member.id || completedTimers.has(member.id)) && (
                    <div className="absolute -inset-2">
                      <Timer
                        key={`circular-timer-${member.id}`}
                        isActive={activeTimer?.memberId === member.id}
                        duration={activeTimer?.duration || 120}
                        onComplete={onStopTimer}
                        className=""
                        explosionEnabled={explosionEnabled}
                        afterExplosionImageEnabled={false}
                        afterExplosionImageUrl=""
                        afterExplosionImageRotationEnabled={false}
                        isLastPerson={isLastPerson(member.id)}
                      />
                    </div>
                  )}
                </div>
                
                <div className="w-24 flex-shrink-0">
                  <h3 className={`font-medium text-sm truncate transition-all duration-300 ${
                    (member.blocker && member.blocker.trim() !== '')
                      ? 'text-red-800 dark:text-red-200'
                      : member.updateGiven ? 'text-green-800 dark:text-green-200' : 'text-gray-900 dark:text-white'
                  } ${blinkingMembers.has(member.id) ? 'text-green-900 dark:text-green-100 font-semibold' : ''}`}>
                    {member.name}
                  </h3>
                  {timerEnabled && (activeTimer?.memberId === member.id || completedTimers.has(member.id)) && (
                    <div className="mt-1">
                      <Timer
                        key={`text-timer-${member.id}`}
                        isActive={activeTimer?.memberId === member.id}
                        duration={activeTimer?.duration || 120}
                        onComplete={onStopTimer}
                        showText={true}
                        explosionEnabled={explosionEnabled}
                        afterExplosionImageEnabled={activeTimer?.memberId === member.id ? afterExplosionImageEnabled : false}
                        afterExplosionImageUrl={activeTimer?.memberId === member.id ? afterExplosionImageUrl : ""}
                        afterExplosionImageRotationEnabled={activeTimer?.memberId === member.id ? afterExplosionImageRotationEnabled : false}
                        isLastPerson={isLastPerson(member.id)}
                      />
                    </div>
                  )}
                </div>
                
                <div onClick={handleBlockerClick} className="flex-1">
                  <AutoScrollingInput
                    value={member.blocker || ''}
                    onChange={(e) => handleBlockerChange(member.id, e.target.value)}
                    placeholder="Type blockers here..."
                    className={`w-full px-2 py-1 border rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${
                      (member.blocker && member.blocker.trim() !== '')
                        ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20 text-red-900 dark:text-red-200 placeholder-red-500 dark:placeholder-red-400'
                        : member.updateGiven 
                          ? 'border-green-300 dark:border-green-600 bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-200 placeholder-green-500 dark:placeholder-green-400' 
                          : 'border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400'
                    } ${blinkingMembers.has(member.id) ? 'border-green-400 dark:border-green-500 bg-green-100 dark:bg-green-900/30' : ''}`}
                    overlayTextClassName={`${(member.blocker && member.blocker.trim() !== '')
                      ? 'text-red-900 dark:text-red-200'
                      : member.updateGiven
                        ? 'text-green-900 dark:text-green-200'
                        : 'text-white'}
                    `}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
