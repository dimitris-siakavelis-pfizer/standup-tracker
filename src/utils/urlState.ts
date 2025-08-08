import { AppState, ShareData } from '@/types';

export function encodeState(state: AppState): string {
  const shareData: ShareData = {
    teamMembers: state.teamMembers,
  };
  return btoa(JSON.stringify(shareData));
}

export function decodeState(encoded: string): ShareData | null {
  try {
    const decoded = atob(encoded);
    return JSON.parse(decoded);
  } catch (error) {
    console.error('Failed to decode state:', error);
    return null;
  }
}

export function updateURL(state: AppState) {
  const encoded = encodeState(state);
  const url = new URL(window.location.href);
  url.searchParams.set('state', encoded);
  window.history.replaceState({}, '', url.toString());
}

export function getURLWithState(path: string, state: AppState): string {
  const encoded = encodeState(state);
  const url = new URL(path, window.location.origin);
  url.searchParams.set('state', encoded);
  return url.toString();
}

export function getStateFromURL(): ShareData | null {
  if (typeof window === 'undefined') return null;
  
  const url = new URL(window.location.href);
  const encoded = url.searchParams.get('state');
  
  if (!encoded) return null;
  
  return decodeState(encoded);
}
