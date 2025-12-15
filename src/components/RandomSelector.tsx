'use client';

import { useState, useEffect, useRef } from 'react';
import { TeamMember } from '@/types';

interface RandomSelectorProps {
  teamMembers: TeamMember[];
  selectedWinner: TeamMember | null;
  isSelecting: boolean;
  onStartSelection: () => void;
  onStopSelection: (winner: TeamMember) => void;
}

export default function RandomSelector({
  teamMembers,
  selectedWinner,
  isSelecting,
  onStartSelection,
  onStopSelection,
}: RandomSelectorProps) {
  const [displayName, setDisplayName] = useState<string>('');
  const [animationInterval, setAnimationInterval] = useState<NodeJS.Timeout | null>(null);

  const enabledMembers = teamMembers.filter(member => member.enabled);
  
  // Use a ref to always access the current enabledMembers in callbacks
  const enabledMembersRef = useRef(enabledMembers);
  useEffect(() => {
    enabledMembersRef.current = enabledMembers;
  }, [enabledMembers]);

  const startRandomSelection = () => {
    if (enabledMembers.length === 0) return;
    
    onStartSelection();
    
    // Start the animation
    const interval = setInterval(() => {
      const currentMembers = enabledMembersRef.current;
      const randomIndex = Math.floor(Math.random() * currentMembers.length);
      setDisplayName(currentMembers[randomIndex].name);
    }, 100);
    
    setAnimationInterval(interval);
    
    // Stop after 4 seconds
    setTimeout(() => {
      if (interval) {
        clearInterval(interval);
        setAnimationInterval(null);
      }
      
      // Use ref to get current enabledMembers, avoiding stale closure
      const currentMembers = enabledMembersRef.current;
      const winner = currentMembers[Math.floor(Math.random() * currentMembers.length)];
      onStopSelection(winner);
      setDisplayName(winner.name);
    }, 4000);
  };

  useEffect(() => {
    if (selectedWinner) {
      setDisplayName(selectedWinner.name);
    }
  }, [selectedWinner]);

  useEffect(() => {
    return () => {
      if (animationInterval) {
        clearInterval(animationInterval);
      }
    };
  }, [animationInterval]);

  return (
    <div className="card">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Random Selection</h2>
      
      {/* Winner Display */}
      <div className="mb-6">
        {selectedWinner ? (
          <div className="text-center">
            <div className="winner-display">
              {displayName}
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">has been selected for today&apos;s stand up!</p>
          </div>
        ) : isSelecting ? (
          <div className="text-center">
            <div className="text-2xl md:text-4xl lg:text-5xl font-bold text-center py-6 px-4 text-blue-600 dark:text-blue-400 animate-pulse break-words">
              {displayName || 'Selecting...'}
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">Selecting a team member...</p>
          </div>
        ) : (
          <div className="text-center">
            <div className="text-2xl md:text-4xl lg:text-5xl font-bold text-center py-6 px-4 text-gray-400 dark:text-gray-500 break-words">
              No Selection
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">Click Start to randomly select a team member</p>
          </div>
        )}
      </div>

      {/* Control Buttons */}
      <div className="flex gap-4 justify-center">
        <button
          onClick={startRandomSelection}
          disabled={enabledMembers.length === 0 || isSelecting}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSelecting ? 'Selecting...' : 'Random Selection!'}
        </button>
        
        {enabledMembers.length === 0 && (
          <p className="text-red-600 dark:text-red-400 text-sm">No enabled team members available</p>
        )}
      </div>

      {/* Enabled Members Count moved to Team Members box */}
    </div>
  );
}
