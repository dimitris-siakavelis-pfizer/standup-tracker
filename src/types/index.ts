export interface TeamMember {
  id: string;
  name: string;
  enabled: boolean;
  updateGiven: boolean;
  blocker?: string;
}

export interface AppState {
  teamMembers: TeamMember[];
  selectedWinner: TeamMember | null;
  isSelecting: boolean;
  timerEnabled: boolean;
  timerDuration: number; // in seconds
  explosionEnabled: boolean;
  activeTimer: {
    memberId: string;
    startTime: number;
    duration: number;
  } | null;
}

export type Theme = 'light' | 'dark';

export interface ShareData {
  teamMembers: TeamMember[];
  timerEnabled?: boolean;
  timerDuration?: number;
  explosionEnabled?: boolean;
}
