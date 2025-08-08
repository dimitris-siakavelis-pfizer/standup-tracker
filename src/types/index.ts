export interface TeamMember {
  id: string;
  name: string;
  enabled: boolean;
  blocker?: string;
  updateGiven?: boolean;
}

export interface AppState {
  teamMembers: TeamMember[];
  selectedWinner: TeamMember | null;
  isSelecting: boolean;
}

export interface ShareData {
  teamMembers: TeamMember[];
}
