'use client';

import { TeamMember } from '@/types';

interface TeamUpdatesProps {
  teamMembers: TeamMember[];
  onUpdateMember: (id: string, updates: Partial<TeamMember>) => void;
}

export default function TeamUpdates({ teamMembers, onUpdateMember }: TeamUpdatesProps) {
  const enabledMembers = teamMembers.filter(member => member.enabled);

  const handleBlockerChange = (id: string, blocker: string) => {
    onUpdateMember(id, { blocker });
  };

  const handleUpdateGivenChange = (id: string, updateGiven: boolean) => {
    onUpdateMember(id, { updateGiven });
  };

  const handleCardClick = (id: string, currentUpdateGiven: boolean) => {
    onUpdateMember(id, { updateGiven: !currentUpdateGiven });
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
              className={`border border-gray-200 rounded-lg p-4 transition-colors duration-200 cursor-pointer ${
                member.updateGiven 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-white'
              }`}
              onClick={() => handleCardClick(member.id, member.updateGiven || false)}
            >
              <div className="flex items-center gap-3">
                <h3 className={`font-medium min-w-0 flex-shrink-0 ${
                  member.updateGiven ? 'text-green-800' : 'text-gray-900'
                }`}>
                  {member.name}
                </h3>
                
                <div className="flex items-center gap-2">
                  <label className={`flex items-center gap-2 text-sm ${
                    member.updateGiven ? 'text-green-700' : 'text-gray-600'
                  }`}>
                    <input
                      type="checkbox"
                      checked={member.updateGiven || false}
                      onChange={(e) => handleUpdateGivenChange(member.id, e.target.checked)}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    Update Given
                  </label>
                </div>
                
                <div onClick={handleBlockerClick} className="flex-1">
                  <input
                    type="text"
                    value={member.blocker || ''}
                    onChange={(e) => handleBlockerChange(member.id, e.target.value)}
                    placeholder="blockers"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      member.updateGiven 
                        ? 'border-green-300 bg-green-50 text-green-900 placeholder-green-500' 
                        : 'border-gray-300'
                    }`}
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
