import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  type RoomState, 
  type MultiplayerSyncMessage, 
  type RoomMember, 
  type HostTransferredPayload,
  type MemberKickedPayload,
  type SlotUpdatedPayload,
  type EmojiReactionPayload,
} from '@/types/multiplayer';
import { type MatchRecord } from '@/types/stats';
import {
  subscribeToRoom,
  broadcastStateSync,
  broadcastMatchRecorded,
  sanitizeRoomCode,
  generateRoomCode,
  sendRoomHeartbeat,
  leaveRoomPresence,
  sendBeaconLeave,
  kickRoomMember,
  broadcastMemberKicked,
  updateMemberSlot,
  broadcastSlotUpdate,
  getPlayerSessionId,
  getSavedDisplayName,
  setSavedDisplayName,
  isRoomHostStored,
  saveRoomHost,
  removeRoomHost,
  transferRoomHost,
  broadcastHostTransfer,
  broadcastEmojiReaction,
  fetchRoomMembers,
  saveRoomStateToDatabase,
} from '@/services/supabaseService';

export function useMultiplayerRoom(
  onRemoteStateReceived?: (state: RoomState) => void,
  onRemoteMatchReceived?: (match: MatchRecord) => void,
  onMemberJoined?: (member: RoomMember) => void,
  onHostTransferred?: (payload: HostTransferredPayload) => void,
  onMemberKicked?: (payload: MemberKickedPayload) => void,
  onSelfKicked?: () => void,
  onSlotUpdated?: (payload: SlotUpdatedPayload) => void,
  onEmojiReaction?: (payload: EmojiReactionPayload) => void
) {
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [isHost, setIsHost] = useState<boolean>(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const urlRoom = urlParams.get('room');
      if (urlRoom) {
        return isRoomHostStored(urlRoom);
      }
    } catch {
      // ignore
    }
    return false;
  });
  const [connectionStatus, setConnectionStatus] = useState<
    'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'ERROR'
  >('DISCONNECTED');
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null);

  // Room presence & member list
  const [members, setMembers] = useState<RoomMember[]>([]);
  const [myPlayerName, setMyPlayerNameState] = useState<string>(() => {
    const saved = getSavedDisplayName();
    if (saved) return saved;
    try {
      const savedFriends = localStorage.getItem('valorant-friends');
      if (savedFriends) {
        const arr = JSON.parse(savedFriends);
        if (Array.isArray(arr) && arr[0]) return arr[0];
      }
    } catch {
      // ignore
    }
    return 'Player';
  });
  const [mySlotIndex, setMySlotIndex] = useState<number | null>(null);
  const sessionIdRef = useRef<string>(getPlayerSessionId());
  const prevMemberIdsRef = useRef<Set<string>>(new Set());

  const subscriptionRef = useRef<{ unsubscribe: () => void } | null>(null);
  const leaveRoomRef = useRef<() => void>(() => {});

  const handleIncomingMessage = useCallback(
    (msg: MultiplayerSyncMessage) => {
      if (!msg) return;

      if (msg.type === 'STATE_SYNC') {
        const state = msg.payload as RoomState;
        if (state) {
          setLastSyncedAt(Date.now());
          onRemoteStateReceived?.(state);
        }
      } else if (msg.type === 'MATCH_RECORDED') {
        const match = msg.payload as MatchRecord;
        if (match) {
          onRemoteMatchReceived?.(match);
        }
      } else if (msg.type === 'HOST_TRANSFERRED') {
        const payload = msg.payload as HostTransferredPayload;
        if (payload) {
          onHostTransferred?.(payload);
          const myId = `${sanitizeRoomCode(msg.roomCode)}_${sessionIdRef.current}`;
          if (payload.newHostId === myId) {
            setIsHost(true);
            saveRoomHost(msg.roomCode, true);
          } else {
            setIsHost(false);
            removeRoomHost(msg.roomCode);
          }

          fetchRoomMembers(msg.roomCode, sessionIdRef.current).then((res) => {
            if (res && Array.isArray(res.members) && res.members.length > 0) {
              setMembers(res.members);
            }
          });
        }
      } else if (msg.type === 'MEMBER_KICKED') {
        const payload = msg.payload as MemberKickedPayload;
        if (payload) {
          const myId = `${sanitizeRoomCode(msg.roomCode)}_${sessionIdRef.current}`;
          if (payload.kickedMemberId === myId) {
            leaveRoomRef.current();
            onSelfKicked?.();
          } else {
            onMemberKicked?.(payload);
            setMembers((prev) => prev.filter((m) => m.id !== payload.kickedMemberId));
          }
        }
      } else if (msg.type === 'SLOT_UPDATED') {
        const payload = msg.payload as SlotUpdatedPayload;
        fetchRoomMembers(msg.roomCode, sessionIdRef.current).then((res) => {
          if (res && Array.isArray(res.members) && res.members.length > 0) {
            setMembers(res.members);
          }
        });
        if (payload) {
          onSlotUpdated?.(payload);
        }
      } else if (msg.type === 'EMOJI_REACTION') {
        const payload = msg.payload as EmojiReactionPayload;
        if (payload) {
          onEmojiReaction?.(payload);
        }
      }
    },
    [onRemoteStateReceived, onRemoteMatchReceived, onHostTransferred, onMemberKicked, onSelfKicked, onSlotUpdated, onEmojiReaction, isHost]
  );

  // Auto-connect if room query parameter exists
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const urlRoom = urlParams.get('room');
      if (urlRoom) {
        const clean = sanitizeRoomCode(urlRoom);
        if (clean && !roomCode) {
          const wasHost = isRoomHostStored(clean);
          joinRoom(clean, wasHost);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const connectToRoom = useCallback(
    (rawCode: string, asHost: boolean) => {
      const cleanCode = sanitizeRoomCode(rawCode);
      if (!cleanCode) return;

      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }

      setRoomCode(cleanCode);
      setIsHost(asHost);
      saveRoomHost(cleanCode, asHost);
      setConnectionStatus('CONNECTED');

      // Update URL query param without reload
      try {
        const url = new URL(window.location.href);
        url.searchParams.set('room', cleanCode);
        window.history.replaceState({}, '', url.toString());
      } catch {
        // ignore
      }

      const sub = subscribeToRoom(
        cleanCode,
        handleIncomingMessage,
        (status) => {
          if (status === 'SUBSCRIBED') {
            setConnectionStatus('CONNECTED');
          } else if (status === 'CLOSED') {
            setConnectionStatus('DISCONNECTED');
          }
        }
      );

      subscriptionRef.current = sub;
    },
    [handleIncomingMessage]
  );

  const createRoom = useCallback(
    (customCode?: string) => {
      const code = customCode ? sanitizeRoomCode(customCode) : generateRoomCode();
      connectToRoom(code, true);
      return code;
    },
    [connectToRoom]
  );

  const joinRoom = useCallback(
    (code: string, asHost = false) => {
      const clean = sanitizeRoomCode(code);
      if (!clean) return;
      connectToRoom(clean, asHost);
    },
    [connectToRoom]
  );

  // Heartbeat loop when inside a room
  useEffect(() => {
    if (!roomCode) {
      setMembers([]);
      prevMemberIdsRef.current = new Set();
      return;
    }

    let isMounted = true;

    const doHeartbeat = async () => {
      try {
        const res = await sendRoomHeartbeat({
          roomCode,
          playerName: myPlayerName,
          sessionId: sessionIdRef.current,
          isHost,
          slotIndex: mySlotIndex,
        });

        if (!isMounted) return;

        const activeList = res.members;

        if (Array.isArray(activeList)) {
          // Detect if backend confirms we are host
          const self = activeList.find((m) => m.isSelf);
          if (self) {
            if (self.isHost && !isHost) {
              // Auto-migrated to host!
              setIsHost(true);
              saveRoomHost(roomCode, true);
              onHostTransferred?.({
                newHostId: self.id,
                newHostName: myPlayerName,
                previousHostName: 'หัวห้องเดิม (ขาดการเชื่อมต่อ)',
              });
              broadcastHostTransfer(roomCode, self.id, myPlayerName, 'หัวห้องเดิม');
            } else if (!self.isHost && isHost) {
              setIsHost(false);
              removeRoomHost(roomCode);
            }
          }

          // Late joiner state sync: apply if roomState exists and client hasn't loaded state yet
          if (res.roomState) {
            if (!lastSyncedAt || (res.roomState.lastUpdated && res.roomState.lastUpdated > lastSyncedAt)) {
              onRemoteStateReceived?.(res.roomState);
              setLastSyncedAt(res.roomState.lastUpdated || Date.now());
            }
          }

          // Detect newly joined members
          activeList.forEach((m) => {
            if (!m.isSelf && !prevMemberIdsRef.current.has(m.id)) {
              onMemberJoined?.(m);
            }
          });

          prevMemberIdsRef.current = new Set(activeList.map((m) => m.id));
          setMembers(activeList);
        }
      } catch {
        // ignore
      }
    };

    doHeartbeat();
    const interval = setInterval(doHeartbeat, 4000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [roomCode, myPlayerName, isHost, mySlotIndex, onMemberJoined]);

  const updatePlayerName = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setMyPlayerNameState(trimmed);
    setSavedDisplayName(trimmed);
  }, []);

  const claimSlot = useCallback((index: number | null) => {
    setMySlotIndex(index);
  }, []);

  const leaveRoom = useCallback(() => {
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
    }
    if (roomCode) {
      removeRoomHost(roomCode);
      try {
        sessionStorage.removeItem(`valomize_room_cache_${roomCode}`);
      } catch {
        // ignore
      }
      leaveRoomPresence(roomCode, sessionIdRef.current);
    }
    setRoomCode(null);
    setIsHost(false);
    setConnectionStatus('DISCONNECTED');
    setLastSyncedAt(null);
    setMembers([]);
    prevMemberIdsRef.current = new Set();

    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('room');
      window.history.replaceState({}, '', url.toString());
    } catch {
      // ignore
    }
  }, [roomCode]);

  leaveRoomRef.current = leaveRoom;

  // Instant disconnect via Beacon API on page unload/close (for guests)
  useEffect(() => {
    if (!roomCode) return;

    const handleUnload = () => {
      // If host, we do NOT delete immediately so F5 refresh preserves host status
      if (!isHost) {
        sendBeaconLeave(roomCode, sessionIdRef.current);
      }
    };

    window.addEventListener('pagehide', handleUnload);
    window.addEventListener('beforeunload', handleUnload);

    return () => {
      window.removeEventListener('pagehide', handleUnload);
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [roomCode, isHost]);

  const broadcastState = useCallback(
    async (state: RoomState) => {
      if (!roomCode || !isHost) return;
      try {
        sessionStorage.setItem(`valomize_room_cache_${roomCode}`, JSON.stringify(state));
      } catch {
        // ignore
      }
      // Broadcast via Realtime WebSocket
      await broadcastStateSync(roomCode, 'host', state);
      // Persist to Neon Postgres so late joiners see it
      saveRoomStateToDatabase(roomCode, state).catch(() => {});
      setLastSyncedAt(Date.now());
    },
    [roomCode, isHost]
  );

  const broadcastMatch = useCallback(
    async (match: MatchRecord) => {
      if (!roomCode) return;
      await broadcastMatchRecorded(roomCode, isHost ? 'host' : 'guest', match);
    },
    [roomCode, isHost]
  );

  const transferHost = useCallback(
    async (targetMember: RoomMember): Promise<{ success: boolean; error?: string }> => {
      if (!roomCode || !isHost) {
        return { success: false, error: 'เฉพาะหัวห้องเท่านั้นที่สามารถโอนสิทธิ์ได้' };
      }

      const res = await transferRoomHost(roomCode, targetMember.id, sessionIdRef.current);
      if (res.success) {
        setIsHost(false);
        removeRoomHost(roomCode);

        await broadcastHostTransfer(
          roomCode,
          targetMember.id,
          targetMember.playerName,
          myPlayerName
        );

        if (Array.isArray(res.members) && res.members.length > 0) {
          setMembers(res.members);
        }
        return { success: true };
      }
      return { success: false, error: res.error };
    },
    [roomCode, isHost, myPlayerName]
  );

  const kickMember = useCallback(
    async (targetMember: RoomMember): Promise<{ success: boolean; error?: string }> => {
      if (!roomCode || !isHost) {
        return { success: false, error: 'เฉพาะหัวห้องเท่านั้นที่มีสิทธิ์เตะสมาชิก' };
      }

      const res = await kickRoomMember(roomCode, targetMember.id, sessionIdRef.current);
      if (res.success) {
        await broadcastMemberKicked(
          roomCode,
          targetMember.id,
          targetMember.playerName,
          myPlayerName
        );

        if (Array.isArray(res.members)) {
          setMembers(res.members);
        } else {
          setMembers((prev) => prev.filter((m) => m.id !== targetMember.id));
        }
        return { success: true };
      }
      return { success: false, error: res.error };
    },
    [roomCode, isHost, myPlayerName]
  );

  const changeMemberSlot = useCallback(
    async (
      targetMemberId: string,
      newSlotIndex: number
    ): Promise<{ success: boolean; error?: string }> => {
      if (!roomCode) {
        return { success: false, error: 'ไม่ได้อยู่ในห้อง' };
      }

      const target = members.find((m) => m.id === targetMemberId);
      const targetName = target ? target.playerName : 'ผู้เล่น';

      const res = await updateMemberSlot(
        roomCode,
        targetMemberId,
        newSlotIndex,
        sessionIdRef.current
      );

      if (res.success) {
        await broadcastSlotUpdate(
          roomCode,
          targetMemberId,
          targetName,
          newSlotIndex,
          null,
          myPlayerName
        );

        if (Array.isArray(res.members)) {
          setMembers(res.members);
        }
        return { success: true };
      }
      return { success: false, error: res.error };
    },
    [roomCode, members, myPlayerName]
  );

  const sendEmojiReaction = useCallback(
    (emoji: string) => {
      if (!roomCode) return;
      const xOffsetPercent = Math.floor(15 + Math.random() * 70);
      const payload: EmojiReactionPayload = {
        emoji,
        senderName: myPlayerName,
        id: `local_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        xOffsetPercent,
      };

      // Trigger local particle immediately for responsive feedback
      onEmojiReaction?.(payload);

      // Broadcast to other room members
      broadcastEmojiReaction(roomCode, myPlayerName, emoji, xOffsetPercent).catch(() => {});
    },
    [roomCode, myPlayerName, onEmojiReaction]
  );

  return {
    roomCode,
    isHost,
    isInRoom: !!roomCode,
    connectionStatus,
    lastSyncedAt,
    members,
    memberCount: members.length,
    myPlayerName,
    setMyPlayerName: updatePlayerName,
    mySlotIndex,
    claimSlot,
    createRoom,
    joinRoom,
    leaveRoom,
    broadcastState,
    broadcastMatch,
    transferHost,
    kickMember,
    changeMemberSlot,
    sendEmojiReaction,
  };
}
