'use client';

import { useState } from 'react';
import { TeamMember } from '@/types';

interface NameListProps {
  teamMembers: TeamMember[];
  onUpdateMembers: (members: TeamMember[]) => void;
  onClearAll: () => void;
}

export default function NameList({ teamMembers, onUpdateMembers, onClearAll }: NameListProps) {
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const addMember = () => {
    if (newName.trim()) {
      const newMember: TeamMember = {
        id: Date.now().toString(),
        name: newName.trim(),
        enabled: true,
      };
      onUpdateMembers([...teamMembers, newMember]);
      setNewName('');
    }
  };

  const removeMember = (id: string) => {
    onUpdateMembers(teamMembers.filter(member => member.id !== id));
  };

  const toggleMember = (id: string) => {
    onUpdateMembers(
      teamMembers.map(member =>
        member.id === id ? { ...member, enabled: !member.enabled } : member
      )
    );
  };

  const startEdit = (member: TeamMember) => {
    setEditingId(member.id);
    setEditingName(member.name);
  };

  const saveEdit = () => {
    if (editingName.trim() && editingId) {
      onUpdateMembers(
        teamMembers.map(member =>
          member.id === editingId ? { ...member, name: editingName.trim() } : member
        )
      );
      setEditingId(null);
      setEditingName('');
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (editingId) {
        saveEdit();
      } else {
        addMember();
      }
    } else if (e.key === 'Escape' && editingId) {
      cancelEdit();
    }
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Team Members</h2>
        <button
          onClick={onClearAll}
          className="btn-secondary text-sm"
        >
          Clear All
        </button>
      </div>

      {/* Add new member */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter team member name"
          className="input-field flex-1"
        />
        <button
          onClick={addMember}
          disabled={!newName.trim()}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Add
        </button>
      </div>

      {/* Team members list */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {teamMembers.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No team members added yet</p>
        ) : (
          teamMembers.map((member) => (
            <div
              key={member.id}
              className={`name-item ${!member.enabled ? 'disabled' : ''}`}
            >
              <div className="flex items-center gap-3 flex-1">
                <button
                  onClick={() => toggleMember(member.id)}
                  className={`w-4 h-4 rounded border-2 transition-colors ${
                    member.enabled
                      ? 'bg-blue-600 border-blue-600'
                      : 'bg-gray-200 border-gray-300'
                  }`}
                >
                  {member.enabled && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
                
                {editingId === member.id ? (
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="input-field flex-1"
                    autoFocus
                  />
                ) : (
                  <span className="flex-1 font-medium">{member.name}</span>
                )}
              </div>

              <div className="flex gap-2">
                {editingId === member.id ? (
                  <>
                    <button
                      onClick={saveEdit}
                      className="text-green-600 hover:text-green-700 text-sm font-medium"
                    >
                      Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="text-gray-600 hover:text-gray-700 text-sm font-medium"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => startEdit(member)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => removeMember(member.id)}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      Remove
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
