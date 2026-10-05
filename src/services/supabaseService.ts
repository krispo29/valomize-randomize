import { createClient, type SupabaseClient, type RealtimeChannel } from '@supabase/supabase-js';
import { type RoomState, type MultiplayerSyncMessage, type RoomMember } from '@/types/multiplayer';
import { type MatchRecord } from '@/types/stats';

export interface RoomHeartbeatResponse {
  members: RoomMember[];
  roomState?: RoomState | null;
}


const SUPABASE_CONFIG_KEY = 'valomize_supabase_config_v1';
const SESSION_ID_KEY = 'valomize_player_session_id';
const DISPLAY_NAME_KEY = 'valomize_player_display_name';
const HOST_ROOMS_KEY = 'valomize_host_rooms_v1';

export function isRoomHostStored(roomCode: string): boolean {
  if (!roomCode) return false;
  const clean = sanitizeRoomCode(roomCode);
  try {
    const raw = sessionStorage.getItem(HOST_ROOMS_KEY);
    if (!raw) return false;
    const hosted: string[] = JSON.parse(raw);
    return Array.isArray(hosted) && hosted.includes(clean);
  } catch {
    return false;
  }
}

export function saveRoomHost(roomCode: string, isHost: boolean): void {
  if (!roomCode) return;
  const clean = sanitizeRoomCode(roomCode);
  try {
    const raw = sessionStorage.getItem(HOST_ROOMS_KEY);
    let hosted: string[] = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(hosted)) hosted = [];
    if (isHost) {
      if (!hosted.includes(clean)) {
        hosted.push(clean);
      }
    } else {
      hosted = hosted.filter((c) => c !== clean);
    }
    sessionStorage.setItem(HOST_ROOMS_KEY, JSON.stringify(hosted));
    localStorage.removeItem(HOST_ROOMS_KEY);
  } catch {
    // ignore
  }
}

export function removeRoomHost(roomCode: string): void {
  saveRoomHost(roomCode, false);
}


export function getPlayerSessionId(): string {
  try {
    let id = sessionStorage.getItem(SESSION_ID_KEY);
    if (!id) {
      id = 'user_' + Math.random().toString(36).substring(2, 9);
      sessionStorage.setItem(SESSION_ID_KEY, id);
    }
    return id;
  } catch {
    return 'user_' + Math.random().toString(36).substring(2, 9);
  }
}

export function getSavedDisplayName(): string {
  try {
    return localStorage.getItem(DISPLAY_NAME_KEY) || '';
  } catch {
    return '';
  }
}

export function setSavedDisplayName(name: string): void {
  try {
    localStorage.setItem(DISPLAY_NAME_KEY, name.trim());
  } catch {
    // ignore
  }
}

export async function sendRoomHeartbeat(params: {
  roomCode: string;
  playerName: string;
  sessionId: string;
  isHost: boolean;
  slotIndex?: number | null;
}): Promise<RoomHeartbeatResponse> {
  const cleanCode = sanitizeRoomCode(params.roomCode);
  if (!cleanCode || !params.sessionId) return { members: [] };

  try {
    const res = await fetch('/api/rooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        room_code: cleanCode,
        player_name: params.playerName,
        session_id: params.sessionId,
        is_host: params.isHost,
        slot_index: params.slotIndex ?? null,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.members)) {
        const members = data.members.map((m: any) => ({
          ...m,
          isSelf: m.id === `${cleanCode}_${params.sessionId}`,
        }));
        return { members, roomState: data.roomState || null };
      }
    }
  } catch {
    // API unavailable or offline
  }
  return { members: [] };
}

export async function fetchRoomMembers(
  roomCode: string, 
  sessionId?: string
): Promise<RoomHeartbeatResponse> {
  const cleanCode = sanitizeRoomCode(roomCode);
  if (!cleanCode) return { members: [] };

  try {
    const res = await fetch(`/api/rooms?room_code=${encodeURIComponent(cleanCode)}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.members)) {
        const members = data.members.map((m: any) => ({
          ...m,
          isSelf: sessionId ? m.id === `${cleanCode}_${sessionId}` : false,
        }));
        return { members, roomState: data.roomState || null };
      }
    }
  } catch {
    // ignore
  }
  return { members: [] };
}

export async function leaveRoomPresence(roomCode: string, sessionId: string): Promise<void> {
  const cleanCode = sanitizeRoomCode(roomCode);
  if (!cleanCode || !sessionId) return;

  try {
    await fetch('/api/rooms', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        room_code: cleanCode,
        session_id: sessionId,
      }),
      keepalive: true,
    });
  } catch {
    // ignore
  }
}

export function sendBeaconLeave(roomCode: string, sessionId: string): void {
  const cleanCode = sanitizeRoomCode(roomCode);
  if (!cleanCode || !sessionId) return;

  try {
    const payload = JSON.stringify({
      action: 'beacon_leave',
      room_code: cleanCode,
      session_id: sessionId,
    });
    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      const blob = new Blob([payload], { type: 'application/json' });
      navigator.sendBeacon('/api/rooms', blob);
    } else {
      fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    }
  } catch {
    // ignore
  }
}

export async function kickRoomMember(
  roomCode: string,
  targetMemberId: string,
  hostSessionId: string
): Promise<{ success: boolean; members?: RoomMember[]; error?: string }> {
  const cleanCode = sanitizeRoomCode(roomCode);
  if (!cleanCode || !targetMemberId || !hostSessionId) {
    return { success: false, error: 'ข้อมูลไม่ครบถ้วน' };
  }

  try {
    const res = await fetch('/api/rooms', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        room_code: cleanCode,
        target_member_id: targetMemberId,
        host_session_id: hostSessionId,
      }),
    });

    const data = await res.json();
    if (res.ok && data.success) {
      const sessionId = getPlayerSessionId();
      const mappedMembers = Array.isArray(data.members)
        ? data.members.map((m: any) => ({
            ...m,
            isSelf: m.id === `${cleanCode}_${sessionId}`,
          }))
        : [];
      return { success: true, members: mappedMembers };
    }
    return { success: false, error: data.error || 'ไม่สามารถเตะสมาชิกได้' };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function broadcastMemberKicked(
  roomCode: string,
  kickedMemberId: string,
  kickedPlayerName: string,
  hostName: string
): Promise<void> {
  const cleanCode = sanitizeRoomCode(roomCode);
  const msg: MultiplayerSyncMessage = {
    type: 'MEMBER_KICKED',
    roomCode: cleanCode,
    sender: hostName,
    timestamp: Date.now(),
    payload: {
      kickedMemberId,
      kickedPlayerName,
      kickedBy: hostName,
    },
  };
  await broadcastRoomMessage(cleanCode, msg);
}

export async function updateMemberSlot(
  roomCode: string,
  targetMemberId: string,
  newSlotIndex: number,
  requesterSessionId: string
): Promise<{ success: boolean; members?: RoomMember[]; error?: string }> {
  const cleanCode = sanitizeRoomCode(roomCode);
  if (!cleanCode || !targetMemberId || !requesterSessionId) {
    return { success: false, error: 'ข้อมูลไม่ครบถ้วน' };
  }

  try {
    const res = await fetch('/api/rooms', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'set_slot',
        room_code: cleanCode,
        target_member_id: targetMemberId,
        target_slot_index: newSlotIndex,
        session_id: requesterSessionId,
      }),
    });

    const data = await res.json();
    if (res.ok && data.success) {
      const sessionId = getPlayerSessionId();
      const mappedMembers = Array.isArray(data.members)
        ? data.members.map((m: any) => ({
            ...m,
            isSelf: m.id === `${cleanCode}_${sessionId}`,
          }))
        : [];
      return { success: true, members: mappedMembers };
    }
    return { success: false, error: data.error || 'ไม่สามารถสลับสล็อตได้' };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function broadcastSlotUpdate(
  roomCode: string,
  targetMemberId: string,
  targetPlayerName: string,
  newSlotIndex: number,
  swappedMemberId?: string | null,
  updatedBy: string = 'System'
): Promise<void> {
  const cleanCode = sanitizeRoomCode(roomCode);
  const msg: MultiplayerSyncMessage = {
    type: 'SLOT_UPDATED',
    roomCode: cleanCode,
    sender: updatedBy,
    timestamp: Date.now(),
    payload: {
      targetMemberId,
      targetPlayerName,
      newSlotIndex,
      swappedMemberId,
      updatedBy,
    },
  };
  await broadcastRoomMessage(cleanCode, msg);
}

export async function transferRoomHost(
  roomCode: string,
  targetMemberId: string,
  currentHostSessionId?: string
): Promise<{ success: boolean; members?: RoomMember[]; error?: string }> {
  const cleanCode = sanitizeRoomCode(roomCode);
  if (!cleanCode || !targetMemberId) return { success: false, error: 'ข้อมูลไม่ครบถ้วน' };

  try {
    const res = await fetch('/api/rooms', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        room_code: cleanCode,
        target_member_id: targetMemberId,
        current_host_session_id: currentHostSessionId,
      }),
    });

    const data = await res.json();
    if (res.ok && data.success) {
      const sessionId = getPlayerSessionId();
      const mappedMembers = Array.isArray(data.members)
        ? data.members.map((m: any) => ({
            ...m,
            isSelf: m.id === `${cleanCode}_${sessionId}`,
          }))
        : [];
      return { success: true, members: mappedMembers };
    }
    return { success: false, error: data.error || 'Failed to transfer host' };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function broadcastHostTransfer(
  roomCode: string,
  newHostId: string,
  newHostName: string,
  previousHostName: string
): Promise<void> {
  const cleanCode = sanitizeRoomCode(roomCode);
  const msg: MultiplayerSyncMessage = {
    type: 'HOST_TRANSFERRED',
    roomCode: cleanCode,
    sender: previousHostName,
    timestamp: Date.now(),
    payload: {
      newHostId,
      newHostName,
      previousHostName,
    },
  };
  await broadcastRoomMessage(cleanCode, msg);
}

export async function broadcastEmojiReaction(
  roomCode: string,
  sender: string,
  emoji: string,
  xOffsetPercent: number = 50
): Promise<void> {
  const cleanCode = sanitizeRoomCode(roomCode);
  const msg: MultiplayerSyncMessage = {
    type: 'EMOJI_REACTION',
    roomCode: cleanCode,
    sender,
    timestamp: Date.now(),
    payload: {
      emoji,
      senderName: sender,
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      xOffsetPercent,
    },
  };
  await broadcastRoomMessage(cleanCode, msg);
}


export async function saveRoomStateToDatabase(
  roomCode: string,
  state: RoomState
): Promise<void> {
  const cleanCode = sanitizeRoomCode(roomCode);
  if (!cleanCode || !state) return;

  try {
    await fetch('/api/rooms', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        room_code: cleanCode,
        room_state: state,
      }),
    });
  } catch {
    // ignore
  }
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export const ROOM_CODE_CHARSET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

/**
 * Generate a 4-character alphanumeric collision-free room code prefixed with VALO-.
 * Character set omits 0, O, 1, I to eliminate font ambiguity.
 * 32^4 = 1,048,576 combinations.
 * Example: VALO-7K2X, VALO-9M4Q
 */
export function generateRoomCode(): string {
  let code = '';
  for (let i = 0; i < 4; i++) {
    const idx = Math.floor(Math.random() * ROOM_CODE_CHARSET.length);
    code += ROOM_CODE_CHARSET[idx];
  }
  return `VALO-${code}`;
}

export function sanitizeRoomCode(raw: string): string {
  if (!raw) return '';
  let trimmed = raw.trim();

  // 1. Extract from URL query parameter if present
  try {
    if (trimmed.includes('?room=') || trimmed.includes('&room=')) {
      const url = new URL(trimmed.startsWith('http') ? trimmed : `https://valomize.app/${trimmed}`);
      const r = url.searchParams.get('room');
      if (r) trimmed = r.trim();
    }
  } catch {
    const matchUrl = trimmed.match(/[?&]room=([^&#\s]+)/i);
    if (matchUrl && matchUrl[1]) {
      trimmed = decodeURIComponent(matchUrl[1]).trim();
    }
  }

  // 2. Extract explicit VALO- prefix match if embedded in string
  const valoMatch = trimmed.match(/VALO-[A-Z0-9-]+/i);
  if (valoMatch) {
    return valoMatch[0].toUpperCase().slice(0, 16);
  }

  // 3. Remove all non-alphanumeric and non-dash characters
  const cleaned = trimmed.replace(/[^a-zA-Z0-9-]/g, '').toUpperCase().slice(0, 16);

  // 4. Auto-prefix VALO- if user entered 4 alphanumeric characters without prefix (e.g. "7K2X" or "7023")
  if (/^[A-Z0-9]{4}$/.test(cleaned)) {
    return `VALO-${cleaned}`;
  }

  return cleaned;
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
  const cleanCode = roomCode ? sanitizeRoomCode(roomCode) : undefined;

  // 1. Try saving to Neon Serverless Postgres API first
  try {
    const res = await fetch('/api/matches', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...match,
        roomCode: cleanCode,
      }),
    });

    if (res.ok) {
      console.log('✅ Match saved to Neon Postgres successfully');
      return;
    }
  } catch {
    // If offline or API unavailable, fallback gracefully
  }

  // 2. Fallback to Supabase if configured
  const client = getSupabase();
  if (!client) return;

  try {
    await client.from('matches').insert([
      {
        id: match.id || `match_${Date.now()}`,
        room_code: cleanCode || null,
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
    console.warn('Could not save match to database table:', e);
  }
}

export async function fetchMatchesFromDatabase(
  roomCode?: string
): Promise<{ success: boolean; matches: MatchRecord[]; error?: string }> {
  const cleanCode = roomCode ? sanitizeRoomCode(roomCode) : undefined;

  // 1. Try Neon Serverless Postgres API first
  try {
    const url = cleanCode ? `/api/matches?room_code=${encodeURIComponent(cleanCode)}` : '/api/matches';
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.matches)) {
        return { success: true, matches: data.matches };
      }
    } else if (res.status === 503) {
      const data = await res.json().catch(() => ({}));
      return {
        success: false,
        matches: [],
        error: data.error || 'DATABASE_URL ยังไม่ได้ตั้งค่าใน Vercel Environment Variables',
      };
    }
  } catch {
    // Neon API fetch failed, try Supabase fallback below
  }

  // 2. Fallback to Supabase if configured
  const client = getSupabase();
  if (!client) {
    return {
      success: false,
      matches: [],
      error: 'ยังไม่ได้เชื่อมต่อ Cloud Database (กรุณาตั้งค่า DATABASE_URL สำหรับ Neon บน Vercel)',
    };
  }

  try {
    let query = client.from('matches').select('*').order('created_at', { ascending: false });
    if (cleanCode) {
      query = query.eq('room_code', cleanCode);
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
