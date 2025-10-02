'use client';

import { useState, useEffect, useRef } from 'react';
import { TeamMember, AppState } from '@/types';
import { getStateFromURL, updateURL, encodeState } from '@/utils/urlState';
import NameList from '@/components/NameList';
import RandomSelector from '@/components/RandomSelector';
import TeamUpdates from '@/components/TeamUpdates';
import Link from 'next/link';
export default function Home() {
  const [appState, setAppState] = useState<AppState>({
    teamMembers: [],
    selectedWinner: null,
    isSelecting: false,
    timerEnabled: true,
    timerDuration: 120, // 2 minutes default
    explosionEnabled: true,
    activeTimer: null,
  });
  const [blinkingMembers, setBlinkingMembers] = useState<Set<string>>(new Set());
  const [completedTimers, setCompletedTimers] = useState<Set<string>>(new Set());
  const teamUpdatesRef = useRef<HTMLDivElement>(null);
  const [showCopiedDSU, setShowCopiedDSU] = useState(false);

  // Load state from URL on mount
  useEffect(() => {
    const urlState = getStateFromURL();
    if (urlState) {
      setAppState(prev => ({
        ...prev,
        teamMembers: urlState.teamMembers,
        timerEnabled: urlState.timerEnabled !== undefined ? urlState.timerEnabled : true,
        timerDuration: urlState.timerDuration || 120,
        explosionEnabled: urlState.explosionEnabled !== undefined ? urlState.explosionEnabled : true,
        activeTimer: null, // Reset timer on load
      }));
    }
  }, []);

  // Update URL when state changes
  useEffect(() => {
    if (appState.teamMembers.length > 0) {
      updateURL(appState);
    }
  }, [appState]);

  const updateTeamMembers = (members: TeamMember[]) => {
    setAppState(prev => ({
      ...prev,
      teamMembers: members,
    }));
  };

  const updateMember = (id: string, updates: Partial<TeamMember>) => {
    setAppState(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.map(member =>
        member.id === id ? { ...member, ...updates } : member
      ),
    }));
  };

  const startSelection = () => {
    // Clear any active timer when starting new selection
    if (appState.activeTimer) {
      setCompletedTimers(prev => new Set([...Array.from(prev), appState.activeTimer!.memberId]));
    }
    
    setAppState(prev => ({
      ...prev,
      isSelecting: true,
      activeTimer: null, // Clear active timer
      teamMembers: prev.teamMembers.map(member => ({
        ...member,
        updateGiven: false,
        blocker: undefined,
      }))
      .sort(() => Math.random() - 0.5), // Randomize the order
    }));
  };

  const stopSelection = (winner: TeamMember) => {
    setAppState(prev => ({
      ...prev,
      selectedWinner: winner,
      isSelecting: false,
      teamMembers: prev.teamMembers.map(member =>
        member.id === winner.id 
          ? { ...member, updateGiven: true }
          : member
      ),
    }));
    
    // Add flashy animation for the winner
    setBlinkingMembers(new Set([winner.id]));
    setTimeout(() => {
      setBlinkingMembers(new Set());
    }, 1500);

    // Start timer for the selected winner after 4 seconds
    setTimeout(() => {
      startTimer(winner.id);
    }, 4000);

    // Scroll to Team Updates on mobile after 4 seconds
    setTimeout(() => {
      if (teamUpdatesRef.current && window.innerWidth < 1024) { // lg breakpoint
        teamUpdatesRef.current.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    }, 4000);
  };

  const startTimer = (memberId: string) => {
    if (!appState.timerEnabled) return;
    
    // Clear any completed timer for this member when starting a new one
    setCompletedTimers(prev => {
      const newSet = new Set(prev);
      newSet.delete(memberId);
      return newSet;
    });
    
    setAppState(prev => ({
      ...prev,
      activeTimer: {
        memberId,
        startTime: Date.now(),
        duration: prev.timerDuration,
      },
    }));
  };

  const stopTimer = () => {
    if (appState.activeTimer) {
      setCompletedTimers(prev => new Set([...Array.from(prev), appState.activeTimer!.memberId]));
    }
    setAppState(prev => ({
      ...prev,
      activeTimer: null,
    }));
  };

  const clearCompletedTimer = (memberId: string) => {
    setCompletedTimers(prev => {
      const newSet = new Set(prev);
      newSet.delete(memberId);
      return newSet;
    });
  };

  const getOrdinalSuffix = (day: number): string => {
    if (day % 100 >= 11 && day % 100 <= 13) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };

  const formatDSUDate = (date: Date): string => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const dayName = days[date.getDay()];
    const dayOfMonth = date.getDate();
    const monthName = months[date.getMonth()];
    const year = date.getFullYear();
    return `${dayName} the ${dayOfMonth}${getOrdinalSuffix(dayOfMonth)} of ${monthName} ${year}`;
  };

  const handleCopyDSU = async () => {
    // Stop any active timer first
    if (appState.activeTimer) {
      stopTimer();
    }

    const today = new Date();
    const header = `DSU blockers for ${formatDSUDate(today)}:`;
    const lines = appState.teamMembers
      .filter(member => (member.enabled && member.blocker && member.blocker.trim() !== ''))
      .map(member => `- ${member.name}: ${member.blocker!.trim()}`);

    if (lines.length === 0) {
      lines.push('- None!');
    }

    const text = [header, ...lines].join('\n');

    try {
      await navigator.clipboard.writeText(text);
      setShowCopiedDSU(true);
      setTimeout(() => setShowCopiedDSU(false), 2000);
    } catch {
      // Fallback
      const temp = document.createElement('textarea');
      temp.value = text;
      document.body.appendChild(temp);
      temp.select();
      document.execCommand('copy');
      document.body.removeChild(temp);
      setShowCopiedDSU(true);
      setTimeout(() => setShowCopiedDSU(false), 2000);
    }
  };

  const enabledCount = appState.teamMembers.filter(m => m.enabled).length;
  const updatedCount = appState.teamMembers.filter(m => m.enabled && m.updateGiven).length;
  const allUpdated = enabledCount > 0 && updatedCount === enabledCount;
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Daily Stand Up Tracker</h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">Manage your team&apos;s daily stand up meetings</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {appState.teamMembers.length} team members
              </div>
              <Link 
                href={`/settings?state=${encodeState(appState)}`}
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm"
              >
                Settings
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-0 sm:px-6 lg:px-8 py-8">
        <div className="hidden lg:grid lg:grid-cols-2 gap-8">
          {/* Left Column - Random Selection and Team Members (50%) */}
          <div className="lg:col-span-1 space-y-6">
            <RandomSelector
              teamMembers={appState.teamMembers}
              selectedWinner={appState.selectedWinner}
              isSelecting={appState.isSelecting}
              onStartSelection={startSelection}
              onStopSelection={stopSelection}
            />
            <NameList
              teamMembers={appState.teamMembers}
              onUpdateMembers={updateTeamMembers}
            />
          </div>

          {/* Right Column - Team Updates (50%) */}
          <div className="lg:col-span-1">
            <TeamUpdates
              teamMembers={appState.teamMembers}
              onUpdateMember={updateMember}
              blinkingMembers={blinkingMembers}
              setBlinkingMembers={setBlinkingMembers}
              timerEnabled={appState.timerEnabled}
              explosionEnabled={appState.explosionEnabled}
              activeTimer={appState.activeTimer}
              completedTimers={completedTimers}
              onStartTimer={startTimer}
              onStopTimer={stopTimer}
              onClearCompletedTimer={clearCompletedTimer}
            />
            {allUpdated && (
              <div className="card mt-6">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Today&apos;s DSU</h2>
                <button
                  onClick={handleCopyDSU}
                  className="btn-primary w-full"
                >
                  {showCopiedDSU ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Copied!
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                        <rect x="7" y="3" width="9" height="12" rx="2"></rect>
                        <rect x="4" y="6" width="9" height="12" rx="2"></rect>
                      </svg>
                      Copy to clipboard
                    </span>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden space-y-6 mt-8">
          <RandomSelector
            teamMembers={appState.teamMembers}
            selectedWinner={appState.selectedWinner}
            isSelecting={appState.isSelecting}
            onStartSelection={startSelection}
            onStopSelection={stopSelection}
          />
          <NameList
            teamMembers={appState.teamMembers}
            onUpdateMembers={updateTeamMembers}
          />
          <div ref={teamUpdatesRef}>
            <TeamUpdates
              teamMembers={appState.teamMembers}
              onUpdateMember={updateMember}
              blinkingMembers={blinkingMembers}
              setBlinkingMembers={setBlinkingMembers}
              timerEnabled={appState.timerEnabled}
              explosionEnabled={appState.explosionEnabled}
              activeTimer={appState.activeTimer}
              completedTimers={completedTimers}
              onStartTimer={startTimer}
              onStopTimer={stopTimer}
              onClearCompletedTimer={clearCompletedTimer}
            />
          </div>
          {allUpdated && (
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Today&apos;s DSU</h2>
              <button
                onClick={handleCopyDSU}
                className="btn-primary w-full"
              >
                {showCopiedDSU ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Copied!
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <rect x="7" y="3" width="9" height="12" rx="2"></rect>
                      <rect x="4" y="6" width="9" height="12" rx="2"></rect>
                    </svg>
                    Copy to clipboard
                  </span>
                )}
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-16">
        <div className="max-w-7xl mx-auto px-0 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-gray-500 dark:text-gray-400 text-sm">
            <p>Daily Stand Up Tracker - Built with Next.js and TailwindCSS</p>
            <p className="mt-1">All data is stored locally in the URL for easy sharing</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
