'use client';

import { useState } from 'react';
import { TeamMember } from '@/types';

interface TeamUpdatesProps {
  teamMembers: TeamMember[];
  onUpdateMember: (id: string, updates: Partial<TeamMember>) => void;
  blinkingMembers: Set<string>;
  setBlinkingMembers: React.Dispatch<React.SetStateAction<Set<string>>>;
}

export default function TeamUpdates({ teamMembers, onUpdateMember, blinkingMembers, setBlinkingMembers }: TeamUpdatesProps) {
  const enabledMembers = teamMembers.filter(member => member.enabled);

  const handleBlockerChange = (id: string, blocker: string) => {
    onUpdateMember(id, { blocker });
  };

  const handleUpdateGivenChange = (id: string, updateGiven: boolean) => {
    onUpdateMember(id, { updateGiven });
  };

  const handleCardClick = (id: string, currentUpdateGiven: boolean) => {
    const newUpdateGiven = !currentUpdateGiven;
    onUpdateMember(id, { updateGiven: newUpdateGiven });
    
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
        <h2 className="text-xl font-semibold text-gray-800">Team Updates</h2>
        <div className="text-sm text-gray-500">
          {enabledMembers.length} enabled members
        </div>
      </div>

      {enabledMembers.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-2">No enabled team members</p>
          <p className="text-gray-400 text-sm">Enable team members to track their updates</p>
        </div>
      ) : (
        <div className="space-y-4">
          {enabledMembers.map((member) => (
            <div 
              key={member.id} 
              className={`border border-gray-200 rounded-md p-3 transition-all duration-300 cursor-pointer hover:bg-gray-50 ${
                member.updateGiven 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-white'
              } ${blinkingMembers.has(member.id) ? 'animate-pulse scale-105 shadow-lg border-green-400 bg-green-100' : ''}`}
              onClick={() => handleCardClick(member.id, member.updateGiven || false)}
            >
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 transition-all duration-300 ${
                  member.updateGiven ? 'bg-green-500' : 'bg-gray-300'
                } ${blinkingMembers.has(member.id) ? 'scale-150 bg-green-600' : ''}`}></div>
                
                <div className="w-24 flex-shrink-0">
                  <h3 className={`font-medium text-sm truncate transition-all duration-300 ${
                    member.updateGiven ? 'text-green-800' : 'text-gray-900'
                  } ${blinkingMembers.has(member.id) ? 'text-green-900 font-semibold' : ''}`}>
                    {member.name}
                  </h3>
                </div>
                
                <div onClick={handleBlockerClick} className="flex-1">
                  <input
                    type="text"
                    value={member.blocker || ''}
                    onChange={(e) => handleBlockerChange(member.id, e.target.value)}
                    placeholder="blockers"
                    className={`w-full px-2 py-1 border rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${
                      member.updateGiven 
                        ? 'border-green-300 bg-green-50 text-green-900 placeholder-green-500' 
                        : 'border-gray-300'
                    } ${blinkingMembers.has(member.id) ? 'border-green-400 bg-green-100' : ''}`}
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
