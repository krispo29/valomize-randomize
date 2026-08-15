import { createClient, type SupabaseClient, type RealtimeChannel } from '@supabase/supabase-js';
import { type RoomState, type MultiplayerSyncMessage } from '@/types/multiplayer';
import { type MatchRecord } from '@/types/stats';

const SUPABASE_CONFIG_KEY = 'valomize_supabase_config_v1';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export function sanitizeRoomCode(raw: string): string {
  if (!raw) return '';
  const trimmed = raw.trim();
  try {
    if (trimmed.includes('?room=')) {
      const url = new URL(trimmed.startsWith('http') ? trimmed : `https://valomize.app/${trimmed}`);
      const r = url.searchParams.get('room');
      if (r) return r.toUpperCase().trim();
    }
  } catch {
    // ignore
  }
  const match = trimmed.match(/VALO-[A-Z0-9]+/i);
  if (match) {
    return match[0].toUpperCase();
  }
  return trimmed.replace(/[^a-zA-Z0-9-]/g, '').toUpperCase();
}

export function cleanSupabaseUrl(raw: string): string {
  if (!raw) return '';
  let clean = raw.trim();
  clean = clean.replace(/\/rest\/v1\/?$/i, '');
  clean = clean.replace(/\/+$/, '');
  return clean;
}

export function getSupabaseConfig(): SupabaseConfig {
  try {
    const saved = localStorage.getItem(SUPABASE_CONFIG_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed?.url && parsed?.anonKey) {
        return {
          url: cleanSupabaseUrl(parsed.url),
          anonKey: parsed.anonKey.trim(),
        };
      }
    }
  } catch {
    // fallback
  }

  const envUrl = (import.meta.env.VITE_SUPABASE_URL as string) || '';
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '';

  return {
    url: cleanSupabaseUrl(envUrl),
    anonKey: envKey.trim(),
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
            eventsPerSecond: 20,
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
  rawRoomCode: string,
  onMessage: (msg: MultiplayerSyncMessage) => void,
  onStatusChange?: (status: 'SUBSCRIBED' | 'CLOSED' | 'ERROR') => void
): { unsubscribe: () => void } {
  const cleanCode = sanitizeRoomCode(rawRoomCode);

  // 1. Setup Local Tab-to-Tab BroadcastChannel for instant local testing
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      if (localBroadcastChannel) {
        localBroadcastChannel.close();
      }
      localBroadcastChannel = new BroadcastChannel(`valomize_room_${cleanCode}`);
      localBroadcastChannel.onmessage = (event) => {
        if (event.data && sanitizeRoomCode(event.data.roomCode) === cleanCode) {
          onMessage(event.data);
        }
      };
    }
  } catch {
    // ignore
  }

  // 2. Setup Supabase Realtime Channel (WebSocket across all devices)
  const client = getSupabase();
  if (client) {
    try {
      if (currentChannel) {
        currentChannel.unsubscribe();
      }

      const safeChannelName = `room_${cleanCode.replace(/[^a-zA-Z0-9_]/g, '_')}`;

      const channel = client.channel(safeChannelName, {
        config: {
          broadcast: { self: false, ack: true },
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
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            onStatusChange?.('SUBSCRIBED');
          }
        });

      currentChannel = channel;
    } catch {
      onStatusChange?.('SUBSCRIBED');
    }
  } else {
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
  rawRoomCode: string,
  message: MultiplayerSyncMessage
): Promise<void> {
  const cleanCode = sanitizeRoomCode(rawRoomCode);
  const cleanMessage = {
    ...message,
    roomCode: cleanCode,
  };

  // 1. Send via local BroadcastChannel
  try {
    if (localBroadcastChannel) {
      localBroadcastChannel.postMessage(cleanMessage);
    }
  } catch {
    // ignore
  }

  // 2. Send via Supabase Realtime
  try {
    if (currentChannel) {
      await currentChannel.send({
        type: 'broadcast',
        event: 'room_event',
        payload: cleanMessage,
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
  const cleanCode = sanitizeRoomCode(roomCode);
  const msg: MultiplayerSyncMessage = {
    type: 'STATE_SYNC',
    roomCode: cleanCode,
    sender,
    timestamp: Date.now(),
    payload: {
      ...state,
      roomCode: cleanCode,
    },
  };
  await broadcastRoomMessage(cleanCode, msg);
}

export async function broadcastMatchRecorded(
  roomCode: string,
  sender: string,
  match: MatchRecord
): Promise<void> {
  const cleanCode = sanitizeRoomCode(roomCode);
  const msg: MultiplayerSyncMessage = {
    type: 'MATCH_RECORDED',
    roomCode: cleanCode,
    sender,
    timestamp: Date.now(),
    payload: match,
  };
  await broadcastRoomMessage(cleanCode, msg);

  // Also persist to Supabase Database table 'matches'
  await saveMatchToDatabase(match, cleanCode);
}

export async function saveMatchToDatabase(
  match: MatchRecord,
  roomCode?: string
): Promise<void> {
  const client = getSupabase();
  if (!client) return;

  try {
    await client.from('matches').insert([
      {
        id: match.id || `match_${Date.now()}`,
        room_code: roomCode || null,
        map: match.map,
        result: match.result,
        score_team: match.scoreTeam,
        score_enemy: match.scoreEnemy,
        match_mvp: match.matchMvpName || null,
        notes: match.notes || null,
        players: match.players,
        created_at: new Date(match.timestamp || Date.now()).toISOString(),
      },
    ]);
  } catch (e) {
    console.warn('Could not save match to Supabase table:', e);
  }
}

export async function fetchMatchesFromDatabase(
  roomCode?: string
): Promise<{ success: boolean; matches: MatchRecord[]; error?: string }> {
  const client = getSupabase();
  if (!client) {
    return { success: false, matches: [], error: 'ไม่ได้เชื่อมต่อ Supabase Database' };
  }

  try {
    let query = client.from('matches').select('*').order('created_at', { ascending: false });
    if (roomCode) {
      const clean = sanitizeRoomCode(roomCode);
      query = query.eq('room_code', clean);
    }

    const { data, error } = await query;
    if (error) {
      return { success: false, matches: [], error: error.message };
    }

    const converted: MatchRecord[] = (data || []).map((row: any) => ({
      id: row.id,
      map: row.map,
      mapImage: row.map_image,
      result: row.result as 'WIN' | 'LOSS',
      scoreTeam: row.score_team,
      scoreEnemy: row.score_enemy,
      matchMvpName: row.match_mvp,
      notes: row.notes,
      timestamp: new Date(row.created_at).getTime(),
      players: row.players,
    }));

    return { success: true, matches: converted };
  } catch (err) {
    return { success: false, matches: [], error: String(err) };
  }
}
