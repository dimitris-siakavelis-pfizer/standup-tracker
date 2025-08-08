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
}

export type Theme = 'light' | 'dark';

export interface ShareData {
  teamMembers: TeamMember[];
}
