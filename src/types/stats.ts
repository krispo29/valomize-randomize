import { type Role, type ValorantMap } from '@/data/valorant';

export interface MatchPlayerResult {
  name: string;
  agentName: string;
  agentRole: Role;
  agentImage: string;
  agentColor?: string;
  assignedStatus: 'MVP' | 'BOTTOM' | null;
  isMatchMvp?: boolean;
}

export interface MatchRecord {
  id: string;
  timestamp: number;
  map: ValorantMap | string;
  mapImage?: string;
  players: MatchPlayerResult[];
  result: 'WIN' | 'LOSS';
  scoreTeam: number;
  scoreEnemy: number;
  notes?: string;
  matchMvpName?: string;
}

export interface PlayerBadge {
  title: string;
  desc: string;
  icon: string;
  color: string;
}

export interface AgentPerformance {
  agentName: string;
  agentImage: string;
  role: Role;
  picks: number;
  wins: number;
  winrate: number;
}

export interface PlayerStatsSummary {
  name: string;
  totalMatches: number;
  wins: number;
  losses: number;
  winrate: number;
  matchMvpCount: number; // Real game MVP
  assignedMvpCount: number; // Wheel MVP
  assignedMvpWins: number;
  assignedBottomCount: number; // Wheel Bottom
  assignedBottomWins: number;
  mostPlayedAgents: AgentPerformance[];
  roleDistribution: Record<Role, number>;
  badge: PlayerBadge;
}

export interface AgentStatsSummary {
  name: string;
  role: Role;
  image: string;
  color: string;
  picks: number;
  wins: number;
  winrate: number;
}

export interface MapStatsSummary {
  name: string;
  image: string;
  picks: number;
  wins: number;
  winrate: number;
}

export interface SquadOverallStats {
  totalMatches: number;
  wins: number;
  losses: number;
  winrate: number;
  currentStreak: {
    count: number;
    type: 'WIN' | 'LOSS' | 'NONE';
  };
  bestWinStreak: number;
  recentForm: ('WIN' | 'LOSS')[];
  bottomDuelistStats: {
    total: number;
    wins: number;
    winrate: number;
  };
  mvpChoiceStats: {
    total: number;
    wins: number;
    winrate: number;
  };
}
