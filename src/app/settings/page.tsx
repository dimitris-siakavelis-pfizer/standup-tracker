'use client';

import { useState, useEffect } from 'react';
import { AppState } from '@/types';
import { getStateFromURL, updateURL, encodeState } from '@/utils/urlState';
import ThemeToggle from '@/components/ThemeToggle';
import Link from 'next/link';
export default function SettingsPage() {
  const [appState, setAppState] = useState<AppState>({
    teamMembers: [],
    selectedWinner: null,
    isSelecting: false,
  });
  const [showCopied, setShowCopied] = useState(false);
  const [showCopiedDSU, setShowCopiedDSU] = useState(false);

  // Load state from URL on mount and preserve it
  useEffect(() => {
    const urlState = getStateFromURL();
    if (urlState) {
      const newState = {
        teamMembers: urlState.teamMembers,
        selectedWinner: null,
        isSelecting: false,
      };
      setAppState(newState);
      // Preserve the URL state
      updateURL(newState);
    }
  }, []);

  const handleShare = async () => {
    // Update URL with current state
    updateURL(appState);
    
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    // Copy current URL to clipboard
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      // Fallback: select the URL
      const urlInput = document.createElement('input');
      urlInput.value = window.location.href;
      document.body.appendChild(urlInput);
      urlInput.select();
      document.execCommand('copy');
      document.body.removeChild(urlInput);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    }
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
    // Ensure we have the latest state in the URL (optional)
    updateURL(appState);

    const today = new Date();
    const header = `DSU blockers for ${formatDSUDate(today)}:`;
    const lines = appState.teamMembers
      .filter(member => (member.blocker && member.blocker.trim() !== ''))
      .map(member => `- ${member.name}: ${member.blocker!.trim()}`);
    const text = [header, ...lines].join('\n');

    try {
      await navigator.clipboard.writeText(text);
      setShowCopiedDSU(true);
      setTimeout(() => setShowCopiedDSU(false), 2000);
    } catch (error) {
      console.error('Failed to copy DSU to clipboard:', error);
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-4">
              <Link 
                href={`/?state=${encodeState(appState)}`}
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
              >
                ← Back to Stand Up
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1">Configure your Daily Stand Up Tracker</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Today's DSU */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Today's DSU</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
              Copy all blockers for enabled team members to your clipboard in a friendly format.
            </p>
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
          {/* Theme Configuration */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Theme Settings</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">Dark Mode</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  Switch between light and dark themes. Your preference will be saved automatically.
                </p>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Light</span>
                  <ThemeToggle />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Dark</span>
                </div>
              </div>
            </div>
          </div>

          {/* Share Configuration */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Share Configuration</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">Share Link</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                  Share your current team configuration with others. The link will include all team members and their settings.
                </p>
                <button
                  onClick={handleShare}
                  className="btn-primary w-full"
                >
                  {showCopied ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Copied!
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                      </svg>
                      Copy Share Link
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* About Section */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">About</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">Daily Stand Up Tracker</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Daily Stand Up Tracker (DSUT) is a web-based tool for managing daily stand up meetings. 
                  All data is stored locally in the URL, making it easy to share configurations with your team.
                </p>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">Features</h3>
                <ul className="text-gray-600 dark:text-gray-400 text-sm space-y-1">
                  <li>• Add, edit, and remove team members</li>
                  <li>• Enable/disable team members for selection</li>
                  <li>• Random name selection with animations</li>
                  <li>• Share configurations via URL</li>
                  <li>• Responsive design for all devices</li>
                  <li>• Track blockers and updates for each team member</li>
                  <li>• Dark mode support</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Technical Information */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Technical Information</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">Built With</h3>
                <ul className="text-gray-600 dark:text-gray-400 text-sm space-y-1">
                  <li>• Next.js 15.0.0</li>
                  <li>• React 18.3.1</li>
                  <li>• TypeScript 5.3.3</li>
                  <li>• TailwindCSS 3.4.1</li>
                </ul>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">Data Storage</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  All team member data and configurations are stored locally in the URL using base64 encoding. 
                  This ensures no server-side storage is required and makes sharing configurations simple and secure.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-gray-500 dark:text-gray-400 text-sm">
            <p>Daily Stand Up Tracker - Built with Next.js and TailwindCSS</p>
            <p className="mt-1">All data is stored locally in the URL for easy sharing</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
