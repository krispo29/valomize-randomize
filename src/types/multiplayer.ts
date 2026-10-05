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
  deckIndices?: number[];
  gridIndices?: number[];
  showVictory: boolean;
  lastUpdated: number;
}

export interface RoomMember {
  id: string;
  playerName: string;
  isHost: boolean;
  slotIndex?: number | null;
  lastSeen: number;
  isSelf?: boolean;
}

export interface HostTransferredPayload {
  newHostId: string;
  newHostName: string;
  previousHostName: string;
}

export interface MemberKickedPayload {
  kickedMemberId: string;
  kickedPlayerName: string;
  kickedBy: string;
}

export interface SlotUpdatedPayload {
  targetMemberId: string;
  targetPlayerName: string;
  newSlotIndex: number; // 0-4 for slots, -1 for bench
  swappedMemberId?: string | null;
  updatedBy: string;
}

export interface MultiplayerSyncMessage {
  type: 
    | 'STATE_SYNC' 
    | 'ROLL_TRIGGER' 
    | 'MATCH_RECORDED' 
    | 'ROOM_PING' 
    | 'MEMBER_JOIN' 
    | 'MEMBER_LEAVE' 
    | 'HOST_TRANSFERRED'
    | 'MEMBER_KICKED'
    | 'SLOT_UPDATED';
  roomCode: string;
  sender: string;
  timestamp: number;
  payload: unknown;
}

