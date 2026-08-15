import { useState, useEffect, useCallback, useRef } from 'react';
import { type RoomState, type MultiplayerSyncMessage } from '@/types/multiplayer';
import { type MatchRecord } from '@/types/stats';
import {
  subscribeToRoom,
  broadcastStateSync,
  broadcastMatchRecorded,
} from '@/services/supabaseService';

export function useMultiplayerRoom(
  onRemoteStateReceived?: (state: RoomState) => void,
  onRemoteMatchReceived?: (match: MatchRecord) => void
) {
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [isHost, setIsHost] = useState<boolean>(false);
  const [connectionStatus, setConnectionStatus] = useState<
    'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'ERROR'
  >('DISCONNECTED');
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null);

  const subscriptionRef = useRef<{ unsubscribe: () => void } | null>(null);

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
      }
    },
    [onRemoteStateReceived, onRemoteMatchReceived]
  );

  // Auto-connect if room query parameter exists
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const urlRoom = urlParams.get('room');
      if (urlRoom && !roomCode) {
        joinRoom(urlRoom.toUpperCase().trim(), false);
      }
    } catch {
      // ignore
    }
  }, []);

  const connectToRoom = useCallback(
    (code: string, asHost: boolean) => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }

      setRoomCode(code);
      setIsHost(asHost);
      setConnectionStatus('CONNECTING');

      // Update URL query param without reload
      try {
        const url = new URL(window.location.href);
        url.searchParams.set('room', code);
        window.history.replaceState({}, '', url.toString());
      } catch {
        // ignore
      }

      const sub = subscribeToRoom(
        code,
        handleIncomingMessage,
        (status) => {
          if (status === 'SUBSCRIBED') {
            setConnectionStatus('CONNECTED');
          } else if (status === 'ERROR') {
            setConnectionStatus('ERROR');
          } else {
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
      const code =
        customCode ||
        `VALO-${Math.floor(1000 + Math.random() * 9000)}`;
      connectToRoom(code, true);
      return code;
    },
    [connectToRoom]
  );

  const joinRoom = useCallback(
    (code: string, asHost = false) => {
      const cleanCode = code.toUpperCase().trim();
      if (!cleanCode) return;
      connectToRoom(cleanCode, asHost);
    },
    [connectToRoom]
  );

  const leaveRoom = useCallback(() => {
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
    }
    setRoomCode(null);
    setIsHost(false);
    setConnectionStatus('DISCONNECTED');
    setLastSyncedAt(null);

    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('room');
      window.history.replaceState({}, '', url.toString());
    } catch {
      // ignore
    }
  }, []);

  const broadcastState = useCallback(
    async (state: RoomState) => {
      if (!roomCode || !isHost) return;
      await broadcastStateSync(roomCode, 'host', state);
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

  return {
    roomCode,
    isHost,
    isInRoom: !!roomCode,
    connectionStatus,
    lastSyncedAt,
    createRoom,
    joinRoom,
    leaveRoom,
    broadcastState,
    broadcastMatch,
  };
}
