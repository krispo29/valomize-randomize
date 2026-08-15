import { createClient, type SupabaseClient, type RealtimeChannel } from '@supabase/supabase-js';
import { type RoomState, type MultiplayerSyncMessage } from '@/types/multiplayer';
import { type MatchRecord } from '@/types/stats';

const SUPABASE_CONFIG_KEY = 'valomize_supabase_config_v1';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export function getSupabaseConfig(): SupabaseConfig {
  try {
    const saved = localStorage.getItem(SUPABASE_CONFIG_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed?.url && parsed?.anonKey) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }

  return {
    url: (import.meta.env.VITE_SUPABASE_URL as string) || '',
    anonKey: (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '',
  };
}

export function isSupabaseConfigured(): boolean {
  const config = getSupabaseConfig();
  return (
    Boolean(config.url) &&
    Boolean(config.anonKey) &&
    config.url.startsWith('http') &&
    !config.anonKey.includes('fake_anon')
  );
}

let supabaseClient: SupabaseClient | null = null;
let currentChannel: RealtimeChannel | null = null;
let localBroadcastChannel: BroadcastChannel | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;

  if (!supabaseClient) {
    const config = getSupabaseConfig();
    try {
      supabaseClient = createClient(config.url, config.anonKey, {
        realtime: {
          params: {
            eventsPerSecond: 10,
          },
        },
      });
    } catch {
      supabaseClient = null;
    }
  }
  return supabaseClient;
}

export function resetSupabaseClient(): void {
  if (currentChannel) {
    currentChannel.unsubscribe();
    currentChannel = null;
  }
  supabaseClient = null;
}

export function subscribeToRoom(
  roomCode: string,
  onMessage: (msg: MultiplayerSyncMessage) => void,
  onStatusChange?: (status: 'SUBSCRIBED' | 'CLOSED' | 'ERROR') => void
): { unsubscribe: () => void } {
  // 1. Setup Local Tab-to-Tab BroadcastChannel for instant local sync
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      if (localBroadcastChannel) {
        localBroadcastChannel.close();
      }
      localBroadcastChannel = new BroadcastChannel(`valomize_room_${roomCode}`);
      localBroadcastChannel.onmessage = (event) => {
        if (event.data && event.data.roomCode === roomCode) {
          onMessage(event.data);
        }
      };
    }
  } catch {
    // ignore
  }

  // 2. Setup Supabase Realtime Channel (if configured)
  const client = getSupabase();
  if (client) {
    try {
      if (currentChannel) {
        currentChannel.unsubscribe();
      }

      const channel = client.channel(`valo_room_${roomCode}`, {
        config: {
          broadcast: { self: false },
          presence: { key: `member_${Math.random().toString(36).substring(2, 7)}` },
        },
      });

      channel
        .on('broadcast', { event: 'room_event' }, (payload) => {
          if (payload?.payload) {
            onMessage(payload.payload as MultiplayerSyncMessage);
          }
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            onStatusChange?.('SUBSCRIBED');
          } else if (status === 'CLOSED') {
            onStatusChange?.('CLOSED');
          } else if (status === 'CHANNEL_ERROR') {
            onStatusChange?.('ERROR');
          }
        });

      currentChannel = channel;
    } catch {
      onStatusChange?.('SUBSCRIBED'); // Local broadcast channel fallback is active
    }
  } else {
    // If Supabase is not yet configured, local broadcast works 100%
    onStatusChange?.('SUBSCRIBED');
  }

  return {
    unsubscribe: () => {
      if (currentChannel) {
        currentChannel.unsubscribe();
        currentChannel = null;
      }
      if (localBroadcastChannel) {
        localBroadcastChannel.close();
        localBroadcastChannel = null;
      }
    },
  };
}

export async function broadcastRoomMessage(
  _roomCode: string,
  message: MultiplayerSyncMessage
): Promise<void> {
  // 1. Send via local BroadcastChannel
  try {
    if (localBroadcastChannel) {
      localBroadcastChannel.postMessage(message);
    }
  } catch {
    // ignore
  }

  // 2. Send via Supabase Realtime (if configured)
  try {
    if (currentChannel) {
      await currentChannel.send({
        type: 'broadcast',
        event: 'room_event',
        payload: message,
      });
    }
  } catch {
    // ignore
  }
}

export async function broadcastStateSync(
  roomCode: string,
  sender: string,
  state: RoomState
): Promise<void> {
  const msg: MultiplayerSyncMessage = {
    type: 'STATE_SYNC',
    roomCode,
    sender,
    timestamp: Date.now(),
    payload: state,
  };
  await broadcastRoomMessage(roomCode, msg);
}

export async function broadcastMatchRecorded(
  roomCode: string,
  sender: string,
  match: MatchRecord
): Promise<void> {
  const msg: MultiplayerSyncMessage = {
    type: 'MATCH_RECORDED',
    roomCode,
    sender,
    timestamp: Date.now(),
    payload: match,
  };
  await broadcastRoomMessage(roomCode, msg);
}
