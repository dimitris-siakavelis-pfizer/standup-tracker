'use client';

import { useState, useEffect } from 'react';
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
    activeTimer: null,
  });
  const [blinkingMembers, setBlinkingMembers] = useState<Set<string>>(new Set());
  const [completedTimers, setCompletedTimers] = useState<Set<string>>(new Set());

  // Load state from URL on mount
  useEffect(() => {
    const urlState = getStateFromURL();
    if (urlState) {
      setAppState(prev => ({
        ...prev,
        teamMembers: urlState.teamMembers,
        timerEnabled: urlState.timerEnabled !== undefined ? urlState.timerEnabled : true,
        timerDuration: urlState.timerDuration || 120,
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

    // Start timer for the selected winner after 3 seconds
    setTimeout(() => {
      startTimer(winner.id);
    }, 3000);
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
              activeTimer={appState.activeTimer}
              completedTimers={completedTimers}
              onStartTimer={startTimer}
              onStopTimer={stopTimer}
              onClearCompletedTimer={clearCompletedTimer}
            />
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
          <TeamUpdates
            teamMembers={appState.teamMembers}
            onUpdateMember={updateMember}
            blinkingMembers={blinkingMembers}
            setBlinkingMembers={setBlinkingMembers}
            timerEnabled={appState.timerEnabled}
            activeTimer={appState.activeTimer}
            completedTimers={completedTimers}
            onStartTimer={startTimer}
            onStopTimer={stopTimer}
            onClearCompletedTimer={clearCompletedTimer}
          />
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
