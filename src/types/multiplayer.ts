import { type Agent, type Role, type ValorantMap } from '@/data/valorant';
import { type PlayerProfile } from '@/types/player';

export type RoomRole = 'HOST' | 'GUEST';

export interface RoomState {
  roomCode: string;
  hostName: string;
  createdAt: number;
  friends: string[];
  profiles: Record<number, PlayerProfile>;
  selectedMap: ValorantMap | null;
  playerStatuses: Record<number, 'MVP' | 'BOTTOM' | null>;
  mvpRoleChoices: Record<number, Role | null>;
  rolesCount: Record<Role, number>;
  assignmentsByIndex: Record<number, Agent | null>;
  phase: 'IDLE' | 'GATHERING' | 'SHUFFLING' | 'DEALING' | 'REVEALING';
  revealedIndices: number[];
  showVictory: boolean;
  lastUpdated: number;
}

export interface MultiplayerSyncMessage {
  type: 'STATE_SYNC' | 'ROLL_TRIGGER' | 'MATCH_RECORDED' | 'ROOM_PING';
  roomCode: string;
  sender: string;
  timestamp: number;
  payload: unknown;
}
