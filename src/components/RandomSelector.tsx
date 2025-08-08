'use client';

import { useState, useEffect } from 'react';
import { TeamMember } from '@/types';

interface RandomSelectorProps {
  teamMembers: TeamMember[];
  selectedWinner: TeamMember | null;
  isSelecting: boolean;
  onStartSelection: () => void;
  onStopSelection: (winner: TeamMember) => void;
  onClearWinner: () => void;
}

export default function RandomSelector({
  teamMembers,
  selectedWinner,
  isSelecting,
  onStartSelection,
  onStopSelection,
  onClearWinner,
}: RandomSelectorProps) {
  const [displayName, setDisplayName] = useState<string>('');
  const [animationInterval, setAnimationInterval] = useState<NodeJS.Timeout | null>(null);

  const enabledMembers = teamMembers.filter(member => member.enabled);

  const startRandomSelection = () => {
    if (enabledMembers.length === 0) return;
    
    onStartSelection();
    
    // Start the animation
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * enabledMembers.length);
      setDisplayName(enabledMembers[randomIndex].name);
    }, 100);
    
    setAnimationInterval(interval);
    
    // Stop after 3 seconds
    setTimeout(() => {
      if (interval) {
        clearInterval(interval);
        setAnimationInterval(null);
      }
      
      const winner = enabledMembers[Math.floor(Math.random() * enabledMembers.length)];
      onStopSelection(winner);
      setDisplayName(winner.name);
    }, 3000);
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
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Random Selection</h2>
      
      {/* Winner Display */}
      <div className="mb-6">
        {selectedWinner ? (
          <div className="text-center">
            <div className="text-2xl md:text-4xl lg:text-5xl font-bold text-center py-6 px-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent break-words">
              {displayName}
            </div>
            <p className="text-gray-600 mb-4">Selected for today's stand up!</p>
          </div>
        ) : isSelecting ? (
          <div className="text-center">
            <div className="text-2xl md:text-4xl lg:text-5xl font-bold text-center py-6 px-4 text-blue-600 animate-pulse break-words">
              {displayName || 'Selecting...'}
            </div>
            <p className="text-gray-600 mb-4">Selecting a team member...</p>
          </div>
        ) : (
          <div className="text-center">
            <div className="text-2xl md:text-4xl lg:text-5xl font-bold text-center py-6 px-4 text-gray-400 break-words">
              No Selection
            </div>
            <p className="text-gray-600 mb-4">Click Start to select a team member</p>
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
          <p className="text-red-600 text-sm">No enabled team members available</p>
        )}
      </div>

      {/* Enabled Members Count */}
      <div className="mt-4 text-center text-sm text-gray-600">
        {enabledMembers.length} of {teamMembers.length} team members enabled
      </div>
    </div>
  );
}
