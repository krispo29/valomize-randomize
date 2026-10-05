import { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AgentCard } from '@/components/AgentCard';
import { RoleSelector } from '@/components/RoleSelector';
import { Button } from '@/components/ui/button';
import { DEFAULT_FRIENDS, type Agent, type Role, type ValorantMap, MAP_META, MAP_ROLE_COMPOSITION } from '@/data/valorant';
import { valorantMeta2026, type AgentStrategyProfile } from '@/data/meta';
import { 
  Shuffle, UserCog, Settings2, Map as MapIcon, Volume2, VolumeX, 
  BarChart3, Trophy, Globe, Zap, Ban, Keyboard, Tv, Copy, Swords, Dices, Eye, ArrowUpDown, UserCheck
} from 'lucide-react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useSoundManager } from '@/hooks/useSoundManager';
import { useMatchStats } from '@/hooks/useMatchStats';
import { useValorantData } from '@/hooks/useValorantData';
import { usePlayerProfiles } from '@/hooks/usePlayerProfiles';
import { useMultiplayerRoom } from '@/hooks/useMultiplayerRoom';
import { type RoomState, type EmojiReactionPayload } from '@/types/multiplayer';
import { type MatchRecord } from '@/types/stats';
import { saveMatchToDatabase, sanitizeRoomCode, getPlayerSessionId } from '@/services/supabaseService';
import { VictoryScreen } from '@/components/VictoryScreen';
import { StatsDashboard } from '@/components/StatsDashboard';
import { RecordMatchModal } from '@/components/RecordMatchModal';
import { PlayerProfilesModal } from '@/components/PlayerProfilesModal';
import { MultiplayerModal } from '@/components/MultiplayerModal';
import { ShareMatchCardModal } from '@/components/ShareMatchCardModal';
import { AgentBlacklistModal } from '@/components/AgentBlacklistModal';
import { PartyPresetsBar, PARTY_PRESETS } from '@/components/PartyPresetsBar';
import { KeyboardShortcutsModal } from '@/components/KeyboardShortcutsModal';
import { MapVetoModal } from '@/components/MapVetoModal';
import { GunChallengeModal } from '@/components/GunChallengeModal';
import { InAppBrowserBanner } from '@/components/InAppBrowserBanner';
import { FloatingEmojiReactions } from '@/components/FloatingEmojiReactions';
import { ReadyCheckModal } from '@/components/ReadyCheckModal';
import { generateTacticalBrief } from '@/utils/tacticalBrief';
import jettLogo from '@/assets/jett_logo.png';

const MapSelector = lazy(() => import('@/components/MapSelector').then(module => ({ default: module.MapSelector })));

type Phase = 'IDLE' | 'GATHERING' | 'SHUFFLING' | 'DEALING' | 'REVEALING';

function App() {
  const [friends, setFriends] = useLocalStorage<string[]>('valorant-friends', DEFAULT_FRIENDS);
  const [phase, setPhase] = useState<Phase>('IDLE');
  const [editMode, setEditMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showMapSelector, setShowMapSelector] = useState(false);
  const [selectedMap, setSelectedMap] = useLocalStorage<ValorantMap | null>('valorant-selected-map', null);

  const [playerStatuses, setPlayerStatuses] = useState<Record<number, 'MVP' | 'BOTTOM' | null>>({});
  const [mvpRoleChoices, setMvpRoleChoices] = useState<Record<number, Role | null>>({});

  // Live Valorant-API Dynamic Data
  const { agents: liveAgents } = useValorantData();

  // Player Profiles & Ranks State (Phase 3)
  const { profiles, setPlayerRank, syncPlayerRiot, setComfortAgents } = usePlayerProfiles(friends);
  const [showProfilesModal, setShowProfilesModal] = useState(false);
  const [showMapVetoModal, setShowMapVetoModal] = useState(false);
  const [showGunChallengeModal, setShowGunChallengeModal] = useState(false);

  // Stats Dashboard & Match Logging State
  const { matches, addMatch } = useMatchStats();
  const [showStatsDashboard, setShowStatsDashboard] = useState(false);
  const [showRecordMatch, setShowRecordMatch] = useState(false);
  const [showShareCardModal, setShowShareCardModal] = useState(false);
  const [showMultiplayerModal, setShowMultiplayerModal] = useState(false);

  // Multiplayer Room State (Phase 4)
  const handleRemoteState = (state: RoomState) => {
    if (state.friends && state.friends.length > 0) {
      const realFriends = state.friends.filter(f => !f.startsWith('รอ') && f !== 'Waiting...');
      if (realFriends.length > 0 && !isInRoom) {
        setFriends(realFriends);
      }
    }
    if (state.selectedMap !== undefined) {
      setSelectedMap(state.selectedMap);
    }
    if (state.playerStatuses) {
      setPlayerStatuses(state.playerStatuses);
    }
    if (state.mvpRoleChoices) {
      setMvpRoleChoices(state.mvpRoleChoices);
    }
    if (state.rolesCount) {
      setRolesCount(state.rolesCount);
    }
    if (state.assignmentsByIndex) {
      setAssignmentsByIndex(state.assignmentsByIndex);
    }
    if (state.phase) {
      setPhase(state.phase);
    }
    if (state.revealedIndices) {
      setRevealedIndices(new Set(state.revealedIndices));
    }
    if (state.deckIndices !== undefined) {
      setDeckIndices(state.deckIndices);
    }
    if (state.gridIndices !== undefined) {
      setGridIndices(state.gridIndices);
    }
    if (state.showVictory !== undefined) {
      setShowVictory(state.showVictory);
    }
    if (state.roomCode) {
      try {
        sessionStorage.setItem(`valomize_room_cache_${state.roomCode}`, JSON.stringify(state));
      } catch {}
    }
  };

  const [memberToast, setMemberToast] = useState<string | null>(null);
  const [latestReaction, setLatestReaction] = useState<EmojiReactionPayload | null>(null);

  const {
    roomCode,
    isHost,
    isInRoom,
    connectionStatus: roomConnectionStatus,
    members: roomMembers,
    memberCount,
    myPlayerName,
    setMyPlayerName,
    createRoom,
    joinRoom,
    leaveRoom,
    broadcastState,
    broadcastMatch,
    transferHost,
    kickMember,
    changeMemberSlot,
    sendEmojiReaction,
    activeReadyCheck,
    startReadyCheck,
    respondReadyCheck,
    cancelReadyCheck,
    closeReadyCheck,
  } = useMultiplayerRoom(
    handleRemoteState,
    (incomingMatch) => {
      addMatch(incomingMatch);
    },
    (newMember) => {
      setMemberToast(`👋 ${newMember.playerName} เข้าร่วมห้องแล้ว!`);
      setTimeout(() => setMemberToast(null), 4000);
    },
    (transferPayload) => {
      const myId = `${sanitizeRoomCode(roomCode || '')}_${getPlayerSessionId()}`;
      if (transferPayload.newHostId === myId) {
        setToastMessage(`👑 คุณได้รับสิทธิ์หัวห้องจาก ${transferPayload.previousHostName} แล้ว! ตอนนี้คุณสามารถกดสุ่มตัวละครได้`);
        playVictory();
      } else {
        setToastMessage(`👑 ${transferPayload.previousHostName} โอนสิทธิ์หัวห้องให้ ${transferPayload.newHostName} แล้ว`);
        playClick();
      }
      setTimeout(() => setToastMessage(null), 4500);
    },
    (kickedPayload) => {
      setToastMessage(`👢 ${kickedPayload.kickedPlayerName} ถูกหัวห้องเตะออกจากห้อง`);
      setTimeout(() => setToastMessage(null), 3500);
    },
    () => {
      setToastMessage(`⚠️ คุณถูกหัวห้องเตะออกจากห้อง`);
      setTimeout(() => setToastMessage(null), 5000);
    },
    (slotPayload) => {
      setToastMessage(
        slotPayload.newSlotIndex === -1 
          ? `👥 ${slotPayload.targetPlayerName} ย้ายไปเป็นผู้ชม (ตัวสำรอง)`
          : `🎮 ${slotPayload.targetPlayerName} ย้ายไป Slot ${slotPayload.newSlotIndex + 1}`
      );
      setTimeout(() => setToastMessage(null), 3000);
    },
    (reactionPayload) => {
      setLatestReaction(reactionPayload);
    },
    (rcStartPayload) => {
      playLock();
      setToastMessage(`⚡ ${rcStartPayload.initiatedBy} ส่งสัญญาณเช็กความพร้อมตี้ (Ready Check)!`);
      setTimeout(() => setToastMessage(null), 4000);
    },
    (rcEndPayload) => {
      if (rcEndPayload.allReady) {
        playVictory();
        setToastMessage('🎉 สมาชิกทุกคนพร้อมแล้ว! ลุยได้เลย');
      } else {
        setToastMessage('⏳ การเช็กความพร้อมสิ้นสุดลง');
      }
      setTimeout(() => setToastMessage(null), 3500);
    }
  );


  // Restore cached room state on reload (F5) if room query parameter exists
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const urlRoom = urlParams.get('room');
      if (urlRoom) {
        const clean = sanitizeRoomCode(urlRoom);
        const cachedRaw = sessionStorage.getItem(`valomize_room_cache_${clean}`);
        if (cachedRaw) {
          const cached = JSON.parse(cachedRaw) as RoomState;
          if (cached) {
            handleRemoteState(cached);
          }
        }
      }
    } catch {
      // ignore
    }
  }, []);

    // Authority Check: Guest is someone inside a room who is NOT the host
  const isGuest = Boolean(isInRoom && !isHost);

  // Initial Role Counts (All 0 = Random)
  const [rolesCount, setRolesCount] = useState<Record<Role, number>>({
    'Duelist': 0,
    'Controller': 0,
    'Initiator': 0,
    'Sentinel': 0
  });

  const [assignmentsByIndex, setAssignmentsByIndex] = useState<Record<number, Agent | null>>({});
  const [showVictory, setShowVictory] = useState(false);
  
  // Cards currently in the "Deck" (center stack) vs "Grid" (players)
  const [deckIndices, setDeckIndices] = useState<number[]>([]);
  const [gridIndices, setGridIndices] = useState<number[]>([]);
  const [revealedIndices, setRevealedIndices] = useState<Set<number>>(new Set());

  // QoL States (Pillars 1 - 5)
  const [isTurbo, setIsTurbo] = useLocalStorage<boolean>('valomize-turbo-mode', false);
  const [isStreamerMode, setIsStreamerMode] = useLocalStorage<boolean>('valomize-streamer-mode', false);
  const [pinnedIndices, setPinnedIndices] = useState<Set<number>>(new Set());
  const [blacklistedAgents, setBlacklistedAgents] = useLocalStorage<string[]>('valomize-agent-blacklist', []);
  const [activePartyPreset, setActivePartyPreset] = useState<string>('STANDARD');
  const [showBlacklistModal, setShowBlacklistModal] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const blacklistedSet = useMemo(() => new Set(blacklistedAgents), [blacklistedAgents]);
  const tacticalBrief = useMemo(() => generateTacticalBrief(assignmentsByIndex, selectedMap), [assignmentsByIndex, selectedMap]);

  // Auto-close host-only modals & tools if the user is in a room as a guest
  useEffect(() => {
    if (isGuest) {
      setEditMode(false);
      setShowSettings(false);
      setShowMapSelector(false);
      setShowMapVetoModal(false);
      setShowGunChallengeModal(false);
      setShowBlacklistModal(false);
      setShowProfilesModal(false);
    }
  }, [isGuest]);

  // Sound manager
  const { 
    playRoll, stopRoll, playReveal, playVictory, playLock, 
    playInstantRoll, playClick, isMuted, toggleMute 
  } = useSoundManager();

  // Active Friends & Bench: When inside a multiplayer room, player slots strictly reflect actual room members and their chosen slot.
  const { activeFriends, benchMembers, isSpectator } = useMemo(() => {
    if (!isInRoom) {
      return { activeFriends: friends, benchMembers: [], isSpectator: false };
    }

    const slots: (string | null)[] = [null, null, null, null, null];
    const unslotted: typeof roomMembers = [];
    const bench: typeof roomMembers = [];

    const sortedMembers = [...roomMembers].sort((a, b) => {
      if (a.isHost && !b.isHost) return -1;
      if (!a.isHost && b.isHost) return 1;
      return 0;
    });

    sortedMembers.forEach((m) => {
      if (m.slotIndex === -1) {
        bench.push(m);
      } else if (m.slotIndex !== undefined && m.slotIndex !== null && m.slotIndex >= 0 && m.slotIndex < 5) {
        if (!slots[m.slotIndex]) {
          slots[m.slotIndex] = m.isSelf ? (myPlayerName || m.playerName) : m.playerName;
        } else {
          unslotted.push(m);
        }
      } else {
        unslotted.push(m);
      }
    });

    for (let i = 0; i < 5; i++) {
      if (!slots[i] && unslotted.length > 0) {
        const next = unslotted.shift()!;
        slots[i] = next.isSelf ? (myPlayerName || next.playerName) : next.playerName;
      }
    }
    bench.push(...unslotted);

    if (sortedMembers.length === 0) {
      slots[0] = myPlayerName || 'Host';
    }

    const friendsList = slots.map((s) => s || 'รอผู้เล่น...');
    const userIsSpectator = bench.some((m) => m.isSelf);

    return {
      activeFriends: friendsList,
      benchMembers: bench,
      isSpectator: userIsSpectator,
    };
  }, [isInRoom, friends, roomMembers, myPlayerName]);

  // Initialize
  useEffect(() => {
    if (gridIndices.length === 0 && deckIndices.length === 0) {
        setGridIndices(activeFriends.map((_, i) => i));
    }
  }, [activeFriends, gridIndices.length, deckIndices.length]);

  // Sync grid indices with activeFriends length changes
  useEffect(() => {
    if (phase === 'IDLE') {
       if (gridIndices.length !== activeFriends.length) {
         setGridIndices(activeFriends.map((_, i) => i));
         setDeckIndices([]);
       }
    }
  }, [activeFriends, phase, gridIndices.length]);

  // Quick 1-click in-game chat copy helper
  const copyInGameChatRoster = (assignmentsToUse = assignmentsByIndex) => {
    playClick();
    const parts = activeFriends.map((p, idx) => {
      const agent = assignmentsToUse[idx];
      const displayName = p.startsWith('รอ') ? `Slot ${idx + 1}` : p;
      return `${displayName} (${agent ? agent.name : '?'})`;
    });
    const mapStr = selectedMap ? `[${selectedMap}] ` : '';
    const text = `VALOMIZE ${mapStr}> ${parts.join(' | ')}`;
    navigator.clipboard.writeText(text);
    setToastMessage('📋 คัดลอกแชทในเกมเรียบร้อย! (กด Ctrl+V ใน Valorant ได้เลย)');
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Quick 1-click Discord Markdown copy helper
  const copyDiscordRoster = (assignmentsToUse = assignmentsByIndex) => {
    playClick();
    const roleIcons: Record<string, string> = {
      Duelist: '⚔️',
      Initiator: '🎯',
      Controller: '💨',
      Sentinel: '🛡️',
    };

    const mapHeader = selectedMap ? ` — 🗺️ **[${selectedMap.toUpperCase()}]**` : '';
    const lines = [
      `🎮 **VALOMIZE SQUAD LINEUP**${mapHeader}`,
      '──────────────────────────────',
    ];

    activeFriends.forEach((p, idx) => {
      const agent = assignmentsToUse[idx];
      const status = playerStatuses[idx];
      const tag = status === 'MVP' ? ' 👑 [MVP]' : status === 'BOTTOM' ? ' 💀 [Bot Frag]' : '';
      const displayName = p.startsWith('รอ') ? `Slot ${idx + 1}` : p;
      if (agent) {
        const icon = roleIcons[agent.role] || '🔹';
        lines.push(`${icon} **${displayName}:** ${agent.name} *(${agent.role})*${tag}`);
      } else {
        lines.push(`🎲 **${displayName}:** Random Agent${tag}`);
      }
    });

    lines.push('──────────────────────────────');
    if (roomCode) {
      lines.push(`🔗 **เข้าห้องดูสด:** https://valomize-randomize.vercel.app/?room=${roomCode}`);
    } else {
      lines.push(`🎲 *สุ่มโดย Valomize Randomizer*`);
    }

    navigator.clipboard.writeText(lines.join('\n'));
    setToastMessage('💬 คัดลอกฟอร์แมต Discord เรียบร้อย! (วางในแชทได้ทันที)');
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Toggle agent pin/lock
  const handleTogglePin = (index: number) => {
    if (isGuest) return;
    playClick();
    setPinnedIndices(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  // Re-roll single player
  const handleRerollSingle = (playerIndex: number) => {
    if (phase !== 'IDLE' || isGuest) return;
    playClick();

    const currentAgent = assignmentsByIndex[playerIndex];
    const usedAgentNames = new Set(
      Object.entries(assignmentsByIndex)
        .filter(([idx]) => Number(idx) !== playerIndex)
        .map(([_, a]) => a?.name)
        .filter((name): name is string => Boolean(name))
    );

    const activeBaseAgents = liveAgents.filter(a => !blacklistedSet.has(a.name));
    const pool = activeBaseAgents.length >= 5 ? activeBaseAgents : liveAgents;

    // Determine role preference
    const status = playerStatuses[playerIndex];
    let preferredRole: Role | null = null;
    if (status === 'BOTTOM') preferredRole = 'Duelist';
    else if (status === 'MVP') preferredRole = mvpRoleChoices[playerIndex] || null;
    else if (currentAgent) preferredRole = currentAgent.role;

    // Filter available candidates
    let candidates = pool.filter(a => !usedAgentNames.has(a.name) && a.name !== currentAgent?.name);
    if (preferredRole) {
      const roleCandidates = candidates.filter(a => a.role === preferredRole);
      if (roleCandidates.length > 0) candidates = roleCandidates;
    }

    // Check player comfort pool
    const playerComfort = profiles[playerIndex]?.comfortAgents;
    if (playerComfort && playerComfort.length > 0) {
      const comfortCandidates = candidates.filter(a => playerComfort.includes(a.name));
      if (comfortCandidates.length > 0) {
        candidates = comfortCandidates;
      }
    }

    if (candidates.length === 0) {
      candidates = pool.filter(a => !usedAgentNames.has(a.name));
    }

    if (candidates.length > 0) {
      const picked = candidates[Math.floor(Math.random() * candidates.length)];
      const updatedAssignments = {
        ...assignmentsByIndex,
        [playerIndex]: picked
      };
      setAssignmentsByIndex(updatedAssignments);
      playReveal();

      if (isInRoom && isHost && roomCode) {
        broadcastState({
          roomCode,
          hostName: activeFriends[0] || 'Host',
          createdAt: Date.now(),
          friends: activeFriends,
          profiles,
          selectedMap,
          playerStatuses,
          mvpRoleChoices,
          rolesCount,
          assignmentsByIndex: updatedAssignments,
          phase: 'IDLE',
          revealedIndices: Array.from(revealedIndices),
          deckIndices: [],
          gridIndices,
          showVictory,
          lastUpdated: Date.now(),
        });
      }
    }
  };

  // Swap assigned agents between two players
  const handleSwapAgents = (idxA: number, idxB: number) => {
    if (idxA === idxB || phase !== 'IDLE' || isGuest) return;
    const agentA = assignmentsByIndex[idxA];
    const agentB = assignmentsByIndex[idxB];
    if (!agentA && !agentB) return;

    playReveal();
    const updated = {
      ...assignmentsByIndex,
      [idxA]: agentB || null,
      [idxB]: agentA || null,
    };
    setAssignmentsByIndex(updated);

    const nameA = activeFriends[idxA] || `Player ${idxA + 1}`;
    const nameB = activeFriends[idxB] || `Player ${idxB + 1}`;
    setToastMessage(`🔄 สลับตัวละครระหว่าง ${nameA} (${agentA?.name || '?'}) กับ ${nameB} (${agentB?.name || '?'}) แล้ว!`);
    setTimeout(() => setToastMessage(null), 2500);

    if (isInRoom && isHost && roomCode) {
      broadcastState({
        roomCode,
        hostName: activeFriends[0] || 'Host',
        createdAt: Date.now(),
        friends: activeFriends,
        profiles,
        selectedMap,
        playerStatuses,
        mvpRoleChoices,
        rolesCount,
        assignmentsByIndex: updated,
        phase: 'IDLE',
        revealedIndices: Array.from(revealedIndices),
        deckIndices: [],
        gridIndices,
        showVictory,
        lastUpdated: Date.now(),
      });
    }
  };

  const calculateAssignments = () => {
      const final: Record<number, Agent> = {};
      const assignedIndices = new Set<number>();
      const usedAgentNames = new Set<string>();

      // 0. Filter out blacklisted agents
      const activeBaseAgents = liveAgents.filter(a => !blacklistedSet.has(a.name));
      const availablePool = activeBaseAgents.length >= 5 ? activeBaseAgents : liveAgents;

      // 0.1 Honor Pinned / Locked Agents
      pinnedIndices.forEach(pinnedIndex => {
        const existing = assignmentsByIndex[pinnedIndex];
        if (existing && !usedAgentNames.has(existing.name)) {
          final[pinnedIndex] = existing;
          assignedIndices.add(pinnedIndex);
          usedAgentNames.add(existing.name);
        }
      });

      // Check party preset
      const currentPreset = PARTY_PRESETS.find(p => p.id === activePartyPreset);
      const isPureRandom = currentPreset?.isPureRandom;

      if (isPureRandom) {
        const unassigned = activeFriends.map((_, i) => i).filter(i => !assignedIndices.has(i));
        unassigned.forEach((pIdx) => {
          const comfortList = profiles[pIdx]?.comfortAgents;
          let pick: Agent | undefined;
          if (comfortList && comfortList.length > 0) {
            const comfortCandidates = availablePool.filter(a => comfortList.includes(a.name) && !usedAgentNames.has(a.name));
            if (comfortCandidates.length > 0) {
              pick = comfortCandidates[Math.floor(Math.random() * comfortCandidates.length)];
            }
          }
          if (!pick) {
            const fallback = availablePool.filter(a => !usedAgentNames.has(a.name));
            if (fallback.length > 0) {
              pick = fallback[Math.floor(Math.random() * fallback.length)];
            }
          }
          if (pick) {
            final[pIdx] = pick;
            usedAgentNames.add(pick.name);
          }
        });
        return final;
      }

      const currentMapPool = selectedMap 
          ? availablePool.filter(a => new Set(MAP_META[selectedMap]).has(a.name))
          : availablePool;
      const currentPool = currentMapPool.length >= 5 ? currentMapPool : availablePool;

      // Determine target role requirements
      let roleRequirements: Record<Role, number>;
      if (currentPreset?.roleRequirements) {
        roleRequirements = { 'Duelist': 0, 'Controller': 0, 'Initiator': 0, 'Sentinel': 0 };
        currentPreset.roleRequirements.forEach(r => { roleRequirements[r]++; });
      } else if (selectedMap) {
        roleRequirements = {
          'Duelist': MAP_ROLE_COMPOSITION[selectedMap].duelists,
          'Controller': MAP_ROLE_COMPOSITION[selectedMap].controllers,
          'Initiator': MAP_ROLE_COMPOSITION[selectedMap].initiators,
          'Sentinel': MAP_ROLE_COMPOSITION[selectedMap].sentinels
        };
      } else {
        roleRequirements = rolesCount;
      }

      const remainingRoleCounts = { ...roleRequirements };

      // Deduct pinned agents from remaining requirements
      assignedIndices.forEach(idx => {
        const a = final[idx];
        if (a && remainingRoleCounts[a.role] > 0) {
          remainingRoleCounts[a.role]--;
        }
      });

      const pickAgent = (role: Role, excludeNames: Set<string>, pool: Agent[], comfortList?: string[]): Agent | null => {
          let candidates = pool.filter(a => a.role === role && !excludeNames.has(a.name));
          if (comfortList && comfortList.length > 0) {
            const comfortMatches = candidates.filter(a => comfortList.includes(a.name));
            if (comfortMatches.length > 0) {
              candidates = comfortMatches;
            }
          }
          return candidates.length > 0 
              ? candidates[Math.floor(Math.random() * candidates.length)]
              : null;
      };

      // 1. Handle Forced Assignments (MVP / Bottom Frag) for unassigned
      activeFriends.forEach((_, index) => {
          if (assignedIndices.has(index)) return;

          const status = playerStatuses[index];
          let roleToForce: Role | null = null;

          if (status === 'BOTTOM') {
              roleToForce = 'Duelist';
          } else if (status === 'MVP') {
              roleToForce = mvpRoleChoices[index] || null;
          }

          if (roleToForce) {
              const comfortList = profiles[index]?.comfortAgents;
              let agent = pickAgent(roleToForce, usedAgentNames, currentPool, comfortList);
              agent ??= pickAgent(roleToForce, usedAgentNames, availablePool, comfortList);
              
              if (agent) {
                  final[index] = agent;
                  assignedIndices.add(index);
                  usedAgentNames.add(agent.name);
                  if (remainingRoleCounts[roleToForce] > 0) remainingRoleCounts[roleToForce]--;
              }
          }
      });

      // 1.5 Handle Comfort Picks for unassigned players who have them configured
      const unassignedWithComfort = activeFriends
        .map((_, index) => index)
        .filter(index => !assignedIndices.has(index) && profiles[index]?.comfortAgents && profiles[index].comfortAgents!.length > 0)
        .sort((a, b) => (profiles[a].comfortAgents?.length || 0) - (profiles[b].comfortAgents?.length || 0));

      unassignedWithComfort.forEach((playerIndex) => {
        if (assignedIndices.has(playerIndex)) return;
        const comfortList = profiles[playerIndex].comfortAgents!;

        // Check if any comfort agent fits a required role that still needs filling
        const neededRoles = (Object.keys(remainingRoleCounts) as Role[]).filter(r => remainingRoleCounts[r] > 0);
        let matchedAgent: Agent | null = null;
        let matchedRole: Role | null = null;

        for (const role of neededRoles) {
          const candidate = pickAgent(role, usedAgentNames, currentPool, comfortList) 
            || pickAgent(role, usedAgentNames, availablePool, comfortList);
          if (candidate) {
            matchedAgent = candidate;
            matchedRole = role;
            break;
          }
        }

        // If no needed role matched or no roles strictly required, pick any comfort agent available
        if (!matchedAgent && neededRoles.length === 0) {
          const availableComfort = (currentPool.length >= 5 ? currentPool : availablePool)
            .filter(a => comfortList.includes(a.name) && !usedAgentNames.has(a.name));
          if (availableComfort.length > 0) {
            matchedAgent = availableComfort[Math.floor(Math.random() * availableComfort.length)];
          }
        }

        if (matchedAgent) {
          final[playerIndex] = matchedAgent;
          assignedIndices.add(playerIndex);
          usedAgentNames.add(matchedAgent.name);
          if (matchedRole && remainingRoleCounts[matchedRole] > 0) {
            remainingRoleCounts[matchedRole]--;
          }
        }
      });

      // 2. Fill specific selected roles
      const requiredPool: Agent[] = [];
      Object.entries(remainingRoleCounts).forEach(([role, count]) => {
         const specificRole = role as Role;
         for (let i = 0; i < count; i++) {
             let agent = pickAgent(specificRole, usedAgentNames, currentPool);
             agent ??= pickAgent(specificRole, usedAgentNames, availablePool);
             if (!agent) {
                  const anyCandidates = availablePool.filter(a => a.role === specificRole && !usedAgentNames.has(a.name));
                  agent = anyCandidates.length > 0 
                    ? anyCandidates[Math.floor(Math.random() * anyCandidates.length)]
                    : null;
             }

             if (agent) {
                requiredPool.push(agent);
                usedAgentNames.add(agent.name);
             }
         }
      });

      // 3. Fill remaining slots
      const remainingSlotsNeeded = activeFriends.length - assignedIndices.size - requiredPool.length;
      if (remainingSlotsNeeded > 0) {
         const availableMeta = currentPool.filter(a => !usedAgentNames.has(a.name));
         const availableAll = availablePool.filter(a => !usedAgentNames.has(a.name));
         const poolSource = availableMeta.length >= remainingSlotsNeeded ? availableMeta : availableAll;
         
         const shuffledPoolSource = [...poolSource].sort(() => 0.5 - Math.random());
         
         for (let i = 0; i < remainingSlotsNeeded; i++) {
             if (shuffledPoolSource[i]) {
                 requiredPool.push(shuffledPoolSource[i]);
                 usedAgentNames.add(shuffledPoolSource[i].name);
             } else {
                 const fallbackPool = availablePool.filter(a => !usedAgentNames.has(a.name));
                 if (fallbackPool.length > 0) {
                   const fallback = fallbackPool[Math.floor(Math.random() * fallbackPool.length)];
                   requiredPool.push(fallback);
                   usedAgentNames.add(fallback.name);
                 }
             }
         }
      }

      // 4. Assign remaining players
      const shuffledPool = [...requiredPool].sort(() => 0.5 - Math.random());
      
      const unassignedPlayerIndices = activeFriends
        .map((_, index) => index)
        .filter(index => !assignedIndices.has(index))
        .sort(() => 0.5 - Math.random());
      
      let poolIndex = 0;
      unassignedPlayerIndices.forEach((playerIndex) => {
          if (shuffledPool[poolIndex]) {
              final[playerIndex] = shuffledPool[poolIndex];
              poolIndex++;
          }
      });

      return final;
  };

  const handleRollSafe = async () => {
    if (phase !== 'IDLE' || isGuest) return;
    
    // TURBO MODE: 0.1s instant roll, skips deal animation
    if (isTurbo) {
      playInstantRoll();
      setPhase('GATHERING');
      setEditMode(false);
      setShowSettings(false);
      setShowMapSelector(false);
      setShowVictory(false);

      const allIndices = activeFriends.map((_, i) => i);
      setGridIndices(allIndices);
      setDeckIndices([]);

      const results = calculateAssignments();
      setAssignmentsByIndex(results);
      setRevealedIndices(new Set(allIndices));

      if (isInRoom && isHost && roomCode) {
        broadcastState({
          roomCode,
          hostName: activeFriends[0] || 'Host',
          createdAt: Date.now(),
          friends: activeFriends,
          profiles,
          selectedMap,
          playerStatuses,
          mvpRoleChoices,
          rolesCount,
          assignmentsByIndex: results,
          phase: 'IDLE',
          revealedIndices: allIndices,
          deckIndices: [],
          gridIndices: allIndices,
          showVictory: true,
          lastUpdated: Date.now(),
        });
      }

      await new Promise(r => setTimeout(r, 120));
      setPhase('IDLE');
      setShowVictory(true);
      return;
    }

    // 0. Setup
    setEditMode(false);
    setShowSettings(false);
    setShowMapSelector(false);
    setShowVictory(false);
    setAssignmentsByIndex({});
    setRevealedIndices(new Set());
    playRoll();

    // 1. GATHER
    setPhase('GATHERING');
    const allIndices = activeFriends.map((_, i) => i);
    setGridIndices([]);
    const currentDeck = [...allIndices];
    setDeckIndices(currentDeck);

    if (isInRoom && isHost && roomCode) {
      broadcastState({
        roomCode,
        hostName: activeFriends[0] || 'Host',
        createdAt: Date.now(),
        friends: activeFriends,
        profiles,
        selectedMap,
        playerStatuses,
        mvpRoleChoices,
        rolesCount,
        assignmentsByIndex: {},
        phase: 'GATHERING',
        revealedIndices: [],
        deckIndices: currentDeck,
        gridIndices: [],
        showVictory: false,
        lastUpdated: Date.now(),
      });
    }

    await new Promise(r => setTimeout(r, 800));

    // 2. SHUFFLE
    setPhase('SHUFFLING');
    for (let i = 0; i < 3; i++) {
       currentDeck.sort(() => 0.5 - Math.random());
       setDeckIndices([...currentDeck]);
       await new Promise(r => setTimeout(r, 400));
    }
    
    const results = calculateAssignments();
    setAssignmentsByIndex(results);

    if (isInRoom && isHost && roomCode) {
      broadcastState({
        roomCode,
        hostName: activeFriends[0] || 'Host',
        createdAt: Date.now(),
        friends: activeFriends,
        profiles,
        selectedMap,
        playerStatuses,
        mvpRoleChoices,
        rolesCount,
        assignmentsByIndex: results,
        phase: 'SHUFFLING',
        revealedIndices: [],
        deckIndices: currentDeck,
        gridIndices: [],
        showVictory: false,
        lastUpdated: Date.now(),
      });
    }

    // 3. DEAL & REVEAL LOOP
    setPhase('DEALING');
    stopRoll();
    
    const indicesToDeal = activeFriends.map((_, i) => i);
    const currRevealed = new Set<number>();
    const currGrid: number[] = [];
    
    for (const playerIndex of indicesToDeal) {
        // A. Deal Card (Face Down)
        const deckPos = currentDeck.indexOf(playerIndex);
        if (deckPos > -1) currentDeck.splice(deckPos, 1);
        
        currGrid.push(playerIndex);
        setDeckIndices([...currentDeck]);
        setGridIndices([...currGrid]);
        
        await new Promise(r => setTimeout(r, 600)); 

        // B. Reveal Card (Face Up)
        currRevealed.add(playerIndex);
        setRevealedIndices(new Set(currRevealed));
        playReveal();

        if (isInRoom && isHost && roomCode) {
          broadcastState({
            roomCode,
            hostName: activeFriends[0] || 'Host',
            createdAt: Date.now(),
            friends: activeFriends,
            profiles,
            selectedMap,
            playerStatuses,
            mvpRoleChoices,
            rolesCount,
            assignmentsByIndex: results,
            phase: 'DEALING',
            revealedIndices: Array.from(currRevealed),
            deckIndices: [...currentDeck],
            gridIndices: [...currGrid],
            showVictory: false,
            lastUpdated: Date.now(),
          });
        }

        await new Promise(r => setTimeout(r, 400));
    }

    // 4. VICTORY
    setPhase('REVEALING');
    await new Promise(r => setTimeout(r, 500));
    playVictory();
    setShowVictory(true);
    setPhase('IDLE');
    setGridIndices(allIndices);
    setDeckIndices([]);

    if (isInRoom && isHost && roomCode) {
      broadcastState({
        roomCode,
        hostName: activeFriends[0] || 'Host',
        createdAt: Date.now(),
        friends: activeFriends,
        profiles,
        selectedMap,
        playerStatuses,
        mvpRoleChoices,
        rolesCount,
        assignmentsByIndex: results,
        phase: 'IDLE',
        revealedIndices: Array.from(currRevealed),
        deckIndices: [],
        gridIndices: allIndices,
        showVictory: true,
        lastUpdated: Date.now(),
      });
    }
  };

  const handleStatusChange = (index: number, newStatus: 'MVP' | 'BOTTOM' | null) => {
    if (isGuest) return;
    if (newStatus) playLock();
    setPlayerStatuses(prev => {
      const next = { ...prev };
      if (newStatus === 'MVP') Object.keys(next).forEach(k => { if (next[Number(k)] === 'MVP') next[Number(k)] = null; });
      if (newStatus === 'BOTTOM') Object.keys(next).forEach(k => { if (next[Number(k)] === 'BOTTOM') next[Number(k)] = null; });
      next[index] = newStatus;
      return next;
    });
  };

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }

      if (e.key === 'Escape') {
        setShowVictory(false);
        setShowStatsDashboard(false);
        setShowRecordMatch(false);
        setShowShareCardModal(false);
        setShowProfilesModal(false);
        setShowMultiplayerModal(false);
        setShowBlacklistModal(false);
        setShowShortcutsModal(false);
        setShowMapVetoModal(false);
        setShowGunChallengeModal(false);
        setShowMapSelector(false);
        setShowSettings(false);
        return;
      }

      const isAnyModalOpen = showStatsDashboard || showRecordMatch || showShareCardModal || 
        showProfilesModal || showMultiplayerModal || showBlacklistModal || showShortcutsModal ||
        showMapVetoModal || showGunChallengeModal;

      if (isAnyModalOpen) return;

      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (showVictory) {
          setShowVictory(false);
        } else if (phase === 'IDLE' && !isGuest) {
          handleRollSafe();
        }
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        if (phase === 'IDLE' && !isGuest) {
          handleRollSafe();
        }
      } else if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        if (!isGuest) {
          setIsTurbo(prev => !prev);
          playClick();
        }
      } else if (e.key === 'v' || e.key === 'V') {
        e.preventDefault();
        if (!isGuest) {
          setShowMapVetoModal(prev => !prev);
          playClick();
        }
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        if (!isGuest) {
          setShowMapSelector(prev => !prev);
          playClick();
        }
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        setShowStatsDashboard(prev => !prev);
        playClick();
      } else if (e.key === 'b' || e.key === 'B') {
        e.preventDefault();
        if (!isGuest) {
          setShowBlacklistModal(prev => !prev);
          playClick();
        }
      } else if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        if (Object.keys(assignmentsByIndex).length > 0) {
          copyInGameChatRoster();
        }
      } else if (e.key === '?') {
        e.preventDefault();
        setShowShortcutsModal(prev => !prev);
        playClick();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    phase, showVictory, showStatsDashboard, showRecordMatch, showShareCardModal, 
    showProfilesModal, showMultiplayerModal, showBlacklistModal, showShortcutsModal,
    showMapVetoModal, showGunChallengeModal,
    assignmentsByIndex, activeFriends, selectedMap, isTurbo, isGuest
  ]);


  return (
    <div className="min-h-screen bg-[#0f1923] text-white font-sans overflow-x-hidden relative flex flex-col">
      {/* In-App Browser Helper Banner (LINE, Discord, Facebook WebViews) */}
      <InAppBrowserBanner roomCode={roomCode} />

      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-red-600/10 skew-x-[-20deg] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-red-500/5 skew-x-[20deg] pointer-events-none" />
      
      <div className="container mx-auto py-6 px-4 relative z-10 flex-grow flex flex-col">
        {/* Floating Toast Notification */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-zinc-900/95 border border-emerald-500/70 text-emerald-300 text-xs sm:text-sm font-bold rounded-xl shadow-2xl backdrop-blur-md flex items-center gap-2"
            >
              <span>{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Top Mini HUD Bar: Streamer mode, Turbo toggle, Blacklist, Shortcuts */}
        <div className="w-full flex items-center justify-between pb-3 border-b border-white/5 mb-4 text-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setIsStreamerMode(prev => !prev);
                playClick();
              }}
              className={`px-2.5 py-1.5 rounded-lg border font-bold flex items-center gap-1.5 transition active:scale-95 ${
                isStreamerMode
                  ? 'bg-purple-950/80 border-purple-500 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                  : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white'
              }`}
              title="โหมดสตรีมเมอร์ (ย่อหน้าจอให้พอดีกับ OBS / Discord)"
            >
              <Tv className="w-3.5 h-3.5" />
              <span>{isStreamerMode ? 'Streamer HUD' : 'Normal HUD'}</span>
            </button>

            {isGuest && (
              <span className="px-2.5 py-1.5 rounded-lg border bg-cyan-950/50 border-cyan-500/40 text-cyan-300 font-bold flex items-center gap-1.5 shadow-[0_0_12px_rgba(6,182,212,0.2)]">
                <Eye className="w-3.5 h-3.5 text-cyan-400" />
                <span>Spectator Mode</span>
              </span>
            )}

            {isInRoom && isHost && (
              <button
                type="button"
                onClick={() => {
                  startReadyCheck();
                  playClick();
                }}
                className="px-2.5 py-1.5 rounded-lg border bg-emerald-950/60 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/60 font-bold flex items-center gap-1.5 transition active:scale-95 shadow"
                title="ส่งสัญญาณเช็กความพร้อมเพื่อนทุกคนในห้อง (Ready Check)"
              >
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Ready Check</span>
              </button>
            )}

            {!isGuest && (
              <button
                type="button"
                onClick={() => {
                  setIsTurbo(prev => !prev);
                  playClick();
                }}
                className={`px-2.5 py-1.5 rounded-lg border font-bold flex items-center gap-1.5 transition active:scale-95 ${
                  isTurbo
                    ? 'bg-amber-950/80 border-amber-500 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
                title="โหมดสุ่มด่วนใน 0.1 วินาที (ข้ามอนิเมชั่น) [Hotkey: T]"
              >
                <Zap className={`w-3.5 h-3.5 ${isTurbo ? 'fill-amber-400' : ''}`} />
                <span>{isTurbo ? 'Turbo: ON (0.1s)' : 'Turbo: OFF'}</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Map Veto Modal button - Host only */}
            {!isGuest && (
              <button
                type="button"
                onClick={() => {
                  setShowMapVetoModal(true);
                  playClick();
                }}
                className="px-2.5 py-1.5 rounded-lg border bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:text-white hover:border-red-500/50 font-bold flex items-center gap-1.5 transition active:scale-95"
                title="ระบบโหวตแบนด่านแบบ VCT แข่งขัน (Map Veto Draft) [Hotkey: V]"
              >
                <Swords className="w-3.5 h-3.5 text-red-400" />
                <span className="hidden sm:inline">Map Veto (V)</span>
              </button>
            )}

            {/* Gun Challenge Modal button - Host only */}
            {!isGuest && (
              <button
                type="button"
                onClick={() => {
                  setShowGunChallengeModal(true);
                  playClick();
                }}
                className="px-2.5 py-1.5 rounded-lg border bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:text-white hover:border-amber-500/50 font-bold flex items-center gap-1.5 transition active:scale-95"
                title="สุ่มชาเลนจ์ปืน & กติกาซ้อมแข่ง Eco / Weapon Roulette"
              >
                <Dices className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Challenge</span>
              </button>
            )}

            {/* Copy in-game chat string shortcut button */}
            {Object.keys(assignmentsByIndex).length > 0 && (
              <>
                <button
                  type="button"
                  onClick={() => copyInGameChatRoster()}
                  className="px-2.5 py-1.5 rounded-lg border bg-zinc-900/80 border-amber-500/40 text-amber-300 hover:bg-amber-500/20 font-bold flex items-center gap-1.5 transition active:scale-95"
                  title="คัดลอกรายชื่อไปวางในแชทเกม Valorant [Hotkey: C]"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">แชทในเกม</span>
                </button>
                <button
                  type="button"
                  onClick={() => copyDiscordRoster()}
                  className="px-2.5 py-1.5 rounded-lg border bg-[#5865F2]/15 border-[#5865F2]/50 text-[#8891f7] hover:bg-[#5865F2]/30 hover:text-white font-bold flex items-center gap-1.5 transition active:scale-95 shadow"
                  title="คัดลอกรายชื่อส่งเข้าแชท Discord แบบฟอร์แมต Markdown"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Discord</span>
                </button>
              </>
            )}

            {/* Blacklist Modal button - Host only */}
            {!isGuest && (
              <button
                type="button"
                onClick={() => {
                  setShowBlacklistModal(true);
                  playClick();
                }}
                className={`px-2.5 py-1.5 rounded-lg border font-bold flex items-center gap-1.5 transition active:scale-95 ${
                  blacklistedAgents.length > 0
                    ? 'bg-red-950/60 border-red-500/60 text-red-300'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
                title="ตัดตัวละครที่ยังไม่ปลดล็อค หรือแบนไม่ให้สุ่ม [Hotkey: B]"
              >
                <Ban className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Blacklist</span>
                {blacklistedAgents.length > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black">
                    -{blacklistedAgents.length}
                  </span>
                )}
              </button>
            )}

            {/* Shortcuts Guide button */}
            <button
              type="button"
              onClick={() => {
                setShowShortcutsModal(true);
                playClick();
              }}
              className="px-2.5 py-1.5 rounded-lg border bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white font-bold flex items-center gap-1.5 transition active:scale-95"
              title="ดูคีย์ลัดทั้งหมด [Hotkey: ?]"
            >
              <Keyboard className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Keys (?)</span>
            </button>
          </div>
        </div>

        {/* Brand Header (Hidden in Streamer Mode for ultra-clean capture) */}
        {!isStreamerMode && (
          <header className="flex flex-col items-center mb-6">
            <motion.div className="flex items-center gap-4">
                 <motion.img 
                  src={jettLogo} 
                  alt="Jett Logo" 
                  className="w-16 h-16 md:w-20 md:h-20 object-contain drop-shadow-[0_0_15px_rgba(220,38,38,0.5)]"
                  initial={{ scale: 0, opacity: 0, rotate: -180 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                />
                <div className="flex flex-col">
                  <motion.h1 
                      className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-red-500 to-red-800 drop-shadow-sm select-none"
                      initial={{ y: -50, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                  >
                      VALOMIZE
                  </motion.h1>
                  <motion.p 
                      className="text-sm md:text-xl font-bold tracking-widest uppercase text-white/50 select-none"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                  >
                      Randomizer
                  </motion.p>
                </div>
            </motion.div>
          </header>
        )}

        {/* Live Multiplayer Room Active Banner (QoL Notification) */}
        {isInRoom && (
          <div className="mb-6 mx-auto w-full max-w-xl">
            <div
              className={`p-2.5 px-4 rounded-xl border flex items-center justify-between gap-3 text-xs shadow-lg backdrop-blur-md ${
                isHost
                  ? 'bg-amber-950/40 border-amber-500/40 text-amber-200 shadow-amber-500/5'
                  : 'bg-cyan-950/40 border-cyan-500/40 text-cyan-200 shadow-cyan-500/5'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 w-full">
                <div className="flex items-center gap-2 truncate">
                  <span className="w-2 h-2 rounded-full bg-current animate-pulse shrink-0" />
                  <span className="font-bold truncate">
                    {isHost
                      ? `👑 หัวห้อง ${roomCode}`
                      : `👁️ รับชมสดจากห้อง ${roomCode}`}
                  </span>
                  {roomMembers.length > 0 && (
                    <span className="text-[11px] font-semibold bg-black/40 px-2 py-0.5 rounded-full border border-white/10 shrink-0">
                      👥 {roomMembers.length} คน: {roomMembers.map((m) => m.playerName).join(', ')}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setShowMultiplayerModal(true)}
                    className="px-2.5 py-1 rounded bg-black/40 hover:bg-black/60 font-bold text-[11px] transition text-white border border-white/10"
                  >
                    ดูสมาชิก ({roomMembers.length})
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Controls Area */}
        {phase === 'IDLE' && (
            <div className="mb-8">
                {/* Collapsible Areas */}
                {!isGuest && (showMapSelector || selectedMap) && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-4">
                    <ErrorBoundary>
                    <Suspense fallback={<div className="text-zinc-400 text-center">Loading selector...</div>}>
                        <MapSelector 
                        selectedMap={selectedMap} 
                        onSelectMap={(map) => {
                            setSelectedMap(map);
                            if (map) { setShowSettings(false); setShowMapSelector(false); }
                            else { setShowMapSelector(false); }
                        }} 
                        isExpanded={showMapSelector}
                        onToggleExpand={() => setShowMapSelector(!showMapSelector)}
                        />
                    </Suspense>
                    </ErrorBoundary>
                </motion.div>
                )}

                {!isGuest && showSettings && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-4">
                    <ErrorBoundary>
                    <RoleSelector rolesCount={rolesCount} setRolesCount={setRolesCount} totalPlayers={activeFriends.length} />
                    </ErrorBoundary>
                </motion.div>
                )}

                {/* Map Meta Info Display - ONLY when a map is selected */}
                {selectedMap && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="w-full flex justify-center mb-6 -mt-2"
                    >
                        {(() => {
                           const mapMeta = valorantMeta2026.find(m => m.mapName === selectedMap);
                           if (!mapMeta) return null;
                           return (
                               <div className="flex flex-col md:flex-row items-center gap-3 md:gap-8 px-6 py-2 bg-gradient-to-r from-transparent via-zinc-900/80 to-transparent border-t border-b border-white/5 backdrop-blur-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Archetype</span>
                                        <span className="text-xs text-red-400 font-bold uppercase tracking-wider">{mapMeta.metaArchetype}</span>
                                    </div>
                                    
                                    <div className="hidden md:block w-px h-3 bg-zinc-700/50" />

                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Topography</span>
                                        <span className="text-xs text-zinc-300 uppercase tracking-wider">{mapMeta.topographyType}</span>
                                    </div>
                               </div>
                           );
                        })()}
                    </motion.div>
                )}

                {/* Party Presets Bar - Host only */}
                {!isGuest && (
                  <PartyPresetsBar
                    activePresetId={activePartyPreset}
                    onSelectPreset={(presetId) => {
                      setActivePartyPreset(presetId);
                      playClick();
                    }}
                    className="mb-4"
                  />
                )}

                {/* Buttons */}
                <div className="flex flex-wrap justify-center gap-2 md:gap-4 items-center">
                    {/* Map Selection button - Host only */}
                    {!isGuest && (
                      <Button
                          variant="outline"
                          onClick={() => { setShowMapSelector(!showMapSelector); if (!showMapSelector) setShowSettings(false); }}
                          className={`border-white/20 text-white bg-zinc-800 hover:bg-zinc-700 h-14 md:h-auto ${(showMapSelector || selectedMap) ? 'border-red-500 bg-zinc-700' : ''}`}
                          title="Map Meta Selection (M)"
                          aria-label={showMapSelector ? "Hide map selector" : "Show map selector"}
                      >
                          <MapIcon className={`h-6 w-6 ${selectedMap ? 'text-red-400' : ''}`} />
                      </Button>
                    )}

                    {/* Randomize Action: Host rolls, Guest watches */}
                    {!isGuest ? (
                      <Button 
                          size="lg" 
                          onClick={handleRollSafe} 
                          className={`font-black uppercase tracking-widest px-6 py-6 md:px-10 md:py-8 text-lg md:text-xl rounded-sm transition-all transform hover:scale-105 active:scale-95 ${
                            isTurbo 
                              ? 'bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-white shadow-[0_0_25px_rgba(245,158,11,0.6)]' 
                              : 'bg-red-600 hover:bg-red-700 text-white shadow-[0_0_20px_rgba(220,38,38,0.5)]'
                          }`}
                          title="กดปุ่ม [Spacebar] หรือคลิกเพื่อสุ่มตัวละคร"
                      >
                          {isTurbo ? <Zap className="mr-2 h-6 w-6 fill-amber-400 animate-pulse" /> : <Shuffle className="mr-2 h-5 w-5 md:h-6 md:w-6" />}
                          {isTurbo ? '⚡ TURBO ROLL (0.1s)' : 'RANDOMIZE AGENTS'}
                      </Button>
                    ) : (
                      <div className="flex items-center gap-3 px-6 py-4 md:px-8 md:py-5 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 font-bold tracking-wide text-xs md:text-sm shadow-xl shadow-cyan-500/10 backdrop-blur-md">
                        <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shrink-0" />
                        <Eye className="w-5 h-5 text-cyan-400 shrink-0" />
                        <span>กำลังรับชมสดจากหัวห้อง — รอหัวห้องกดสุ่มตัวละคร</span>
                      </div>
                    )}
                    
                    <div className="flex gap-2 h-auto">
                        <Button
                            variant="outline"
                            onClick={toggleMute}
                            className={`border-white/20 text-white bg-zinc-800 hover:bg-zinc-700 h-14 md:h-auto min-w-[3.5rem] ${isMuted ? 'opacity-50' : ''}`}
                            aria-label={isMuted ? "Unmute sound" : "Mute sound"}
                        >
                            {isMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
                        </Button>

                        {/* Role configuration button - Host only */}
                        {!isGuest && (
                          <Button
                              variant="outline"
                              onClick={() => { setShowSettings(!showSettings); if (!showSettings) setShowMapSelector(false); }}
                              disabled={!!selectedMap}
                              className={`border-white/20 text-white bg-zinc-800 hover:bg-zinc-700 h-14 md:h-auto ${showSettings ? 'border-red-500 bg-zinc-700' : ''} ${selectedMap ? 'opacity-50' : ''}`}
                              aria-label={showSettings ? "Hide settings" : "Show settings"}
                          >
                              <Settings2 className="h-6 w-6" />
                          </Button>
                        )}

                        {/* Edit Mode button - Host only */}
                        {!isGuest && (
                          <Button
                              variant="outline"
                              onClick={() => setEditMode(!editMode)}
                              className={`border-white/20 text-white bg-zinc-800 hover:bg-zinc-700 h-14 md:h-auto ${editMode ? 'border-red-500 bg-zinc-700' : ''}`}
                              aria-label={editMode ? "Disable edit mode" : "Enable edit mode"}
                          >
                              <UserCog className="h-6 w-6" />
                          </Button>
                        )}

                        {/* Ranks modal button - Host only */}
                        {!isGuest && (
                          <Button
                              variant="outline"
                              onClick={() => setShowProfilesModal(true)}
                              className="border-white/20 text-white bg-zinc-800 hover:bg-zinc-700 hover:border-yellow-500/50 h-14 md:h-auto flex items-center gap-1.5 px-3"
                              title="ตั้งค่า Riot ID & ตราแรงค์ผู้เล่น"
                              aria-label="Player Profiles and Ranks"
                          >
                              <Trophy className="h-5 w-5 text-yellow-400" />
                              <span className="hidden sm:inline text-xs font-bold uppercase tracking-wider">Ranks</span>
                          </Button>
                        )}

                        <Button
                            variant="outline"
                            onClick={() => setShowMultiplayerModal(true)}
                            className={`h-14 md:h-auto flex items-center gap-1.5 px-3 transition-all ${
                              isInRoom
                                ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                                : 'border-white/20 text-white bg-zinc-800 hover:bg-zinc-700 hover:border-cyan-500/50'
                            }`}
                            title="Multiplayer Squad Room"
                            aria-label="Multiplayer Room"
                        >
                            <Globe className={`h-5 w-5 ${isInRoom ? 'text-cyan-400 animate-spin-slow' : 'text-zinc-400'}`} />
                            <span className="hidden sm:inline text-xs font-bold uppercase tracking-wider">
                              {isInRoom ? `${roomCode} (${memberCount})` : 'Room'}
                            </span>
                            {isInRoom && (
                              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                            )}
                        </Button>

                        <Button
                            variant="outline"
                            onClick={() => setShowStatsDashboard(true)}
                            className="border-red-500/40 text-white bg-zinc-900/90 hover:bg-zinc-800 hover:border-red-500 h-14 md:h-auto flex items-center gap-2 px-3.5 shadow-lg shadow-red-500/10 group"
                            title="Squad Stats Dashboard"
                            aria-label="Open Squad Stats"
                        >
                            <BarChart3 className="h-6 w-6 text-red-500 group-hover:scale-110 transition-transform" />
                            <span className="hidden sm:inline font-bold text-xs uppercase tracking-wider">Stats</span>
                            {matches.length > 0 && (
                                <span className="px-1.5 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black">
                                    {matches.length}
                                </span>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        )}

        {/* Radiant IGL Tactical Banner */}
        {phase === 'IDLE' && Object.keys(assignmentsByIndex).length > 0 && activeFriends.every((_, i) => Boolean(assignmentsByIndex[i])) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 mx-auto w-full max-w-4xl p-3 px-4 rounded-xl bg-zinc-950/70 border border-red-500/25 backdrop-blur-md shadow-lg"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/80 pb-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-red-600/30 text-red-400 border border-red-500/40 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-red-400" />
                  Radiant IGL Brief
                </span>
                <span className="text-sm font-bold text-white tracking-wide">
                  {tacticalBrief.headline}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2 py-0.5 rounded-full font-bold bg-purple-950/60 text-purple-300 border border-purple-500/30 text-[11px]">
                  Tempo: {tacticalBrief.tempo}
                </span>
                <span className="px-2 py-0.5 rounded font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px]">
                  Tier: {tacticalBrief.ratingGrade}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              <div className="flex items-start gap-1.5">
                <span className="text-amber-400 font-bold shrink-0">🎯 Win Con:</span>
                <span className="text-zinc-300 text-[11px] leading-relaxed">{tacticalBrief.winCondition}</span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="text-cyan-400 font-bold shrink-0">🛡️ Defense:</span>
                <span className="text-zinc-400 text-[11px] leading-relaxed">{tacticalBrief.defenseStrategy}</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* --- MAIN GAME AREA --- */}
        <div className="relative flex-grow min-h-[400px] perspective-1000">
            
            {/* The Deck (Bottom Right) */}
            <AnimatePresence>
                {(phase === 'GATHERING' || phase === 'SHUFFLING' || phase === 'DEALING') && deckIndices.length > 0 && (
                    <div className="absolute bottom-10 right-10 flex items-end justify-end z-20 pointer-events-none">
                        {deckIndices.map((playerIndex, i) => (
                             <motion.div
                                key={`deck-card-${playerIndex}`}
                                layoutId={`card-${playerIndex}`}
                                className="absolute w-[200px]"
                                style={{ 
                                    zIndex: i,
                                    rotate: Math.random() * 10 - 5
                                }}
                                transition={{ 
                                    type: "spring", stiffness: 200, damping: 25,
                                    layout: { duration: 0.5 } 
                                }}
                             >
                                 <AgentCard 
                                    playerName={activeFriends[playerIndex] || `Player ${playerIndex + 1}`}
                                    agent={null}
                                    rolling={true}
                                    canEdit={false}
                                    status={null}
                                    onStatusChange={() => {}}
                                    mvpRole={null}
                                    onMvpRoleChange={() => {}}
                                />
                             </motion.div>
                        ))}
                    </div>
                )}
            </AnimatePresence>

            {/* Multiplayer Spectator / Bench Bar */}
            {isInRoom && (isSpectator || benchMembers.length > 0) && (
              <div className="mb-4 flex flex-col sm:flex-row items-center justify-between gap-2.5 p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl backdrop-blur-md shadow-lg">
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  {isSpectator ? (
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/15 border border-amber-500/30 text-amber-300 rounded-full font-bold">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                      <span>คุณอยู่ในโหมดผู้ชม (ตัวสำรอง)</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 rounded-full font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>ตัวจริง 5 คน</span>
                    </div>
                  )}

                  {benchMembers.length > 0 && (
                    <div className="text-zinc-400 flex items-center gap-1.5 text-xs">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase">ตัวสำรอง ({benchMembers.length}):</span>
                      <span className="text-zinc-300 font-medium">
                        {benchMembers.map((bm) => bm.playerName).join(', ')}
                      </span>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setShowMultiplayerModal(true)}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 transition"
                >
                  <ArrowUpDown className="w-3.5 h-3.5" /> สลับ Slot / ตัวสำรอง
                </button>
              </div>
            )}

            {/* The Grid (Players) */}
            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 justify-items-center transition-opacity duration-500 ${(phase === 'GATHERING' || phase === 'SHUFFLING') ? 'opacity-30' : 'opacity-100'}`}>
                {activeFriends.map((friendName, index) => {
                    const isInGrid = gridIndices.includes(index);
                    const isRevealed = revealedIndices.has(index);
                    const isFaceDown = phase === 'GATHERING' || phase === 'SHUFFLING' || (phase === 'DEALING' && !isRevealed);
                    const assignedAgent = assignmentsByIndex[index];

                    // Find Strategy Profile
                    let strategyProfile: AgentStrategyProfile | undefined = undefined;
                    if (selectedMap && assignedAgent) {
                        const mapMeta = valorantMeta2026.find(m => m.mapName === selectedMap);
                        if (mapMeta && mapMeta.roleComposition) {
                            const roleProfiles = mapMeta.roleComposition[assignedAgent.role];
                            if (roleProfiles) {
                                strategyProfile = roleProfiles.find(p => p.name === assignedAgent.name);
                            }
                        }
                    }

                    return (
                        <div key={`slot-${index}`} className="w-full max-w-[300px] h-[384px] relative border border-white/5 rounded-lg bg-white/5 flex items-center justify-center">
                            <div className="absolute text-white/10 font-bold text-4xl select-none rotate-45">
                                {index + 1}
                            </div>
                            
                            {isInGrid && (
                                <motion.div
                                    key={`card-${index}`}
                                    layoutId={`card-${index}`}
                                    className="w-full h-full z-10"
                                    transition={{ 
                                        type: "spring", stiffness: 200, damping: 25,
                                        layout: { duration: 0.5 }
                                    }}
                                >
                                    <AgentCard 
                                        isAway={isInRoom ? Boolean(roomMembers.find(m => m.slotIndex === index)?.isAway) : false}
                                        playerName={friendName}
                                        agent={assignedAgent || null}
                                        rolling={isFaceDown} 
                                        canEdit={!isGuest && !isInRoom && editMode}
                                        onEditName={!isGuest ? (n) => {
                                            const newF = [...friends];
                                            newF[index] = n;
                                            setFriends(newF);
                                        } : undefined}
                                        status={playerStatuses[index] || null}
                                        onStatusChange={!isGuest ? (s) => handleStatusChange(index, s) : () => {}}
                                        mvpRole={mvpRoleChoices[index] || null}
                                        onMvpRoleChange={!isGuest ? (r) => setMvpRoleChoices(prev => ({ ...prev, [index]: r })) : () => {}}
                                        onClearName={!isGuest ? () => {
                                            const newF = [...friends];
                                            newF[index] = '';
                                            setFriends(newF);
                                        } : undefined}
                                        strategyProfile={strategyProfile}
                                        activeSynergies={
                                            strategyProfile?.synergies?.filter(
                                                syn => Object.values(assignmentsByIndex).some(a => a?.name === syn)
                                            )
                                        }
                                        rankIcon={profiles[index]?.rankIcon}
                                        rankName={profiles[index]?.rankName}
                                        onOpenProfileModal={!isGuest ? () => setShowProfilesModal(true) : undefined}
                                        isPinned={pinnedIndices.has(index)}
                                        onTogglePin={!isGuest ? () => handleTogglePin(index) : undefined}
                                        onRerollSingle={!isGuest ? () => handleRerollSingle(index) : undefined}
                                        onSwapWithPlayer={!isGuest ? (targetIdx) => handleSwapAgents(index, targetIdx) : undefined}
                                        teammates={!isGuest ? activeFriends
                                            .map((name, i) => ({ index: i, name, agentName: assignmentsByIndex[i]?.name }))
                                            .filter(t => t.index !== index) : undefined}
                                    />
                                </motion.div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>

        <VictoryScreen 
          show={showVictory} 
          players={activeFriends} 
          assignments={assignmentsByIndex} 
		  playerStatuses={playerStatuses}
          shuffledOrder={activeFriends.map((_, i) => i)}
          profiles={profiles}
          mapName={selectedMap || undefined}
          onPlayAgain={!isGuest ? () => {
            setShowVictory(false);
            setPhase('IDLE');
          } : undefined}
          onClose={() => setShowVictory(false)}
          onRecordMatch={!isGuest ? () => setShowRecordMatch(true) : undefined}
          onShareCard={() => setShowShareCardModal(true)}
          roomCode={roomCode}
        />

        <StatsDashboard
          show={showStatsDashboard}
          onClose={() => setShowStatsDashboard(false)}
          onShareMatch={() => setShowShareCardModal(true)}
        />

        <RecordMatchModal
          show={showRecordMatch}
          onClose={() => setShowRecordMatch(false)}
          onSave={(match) => {
            const fullMatch: MatchRecord = {
              ...match,
              id: `match_${Date.now()}`,
              timestamp: Date.now(),
            };
            addMatch(fullMatch);
            saveMatchToDatabase(fullMatch, roomCode || undefined);
            if (isInRoom) {
              broadcastMatch(fullMatch);
            }
          }}
          players={activeFriends}
          assignments={assignmentsByIndex}
          playerStatuses={playerStatuses}
          selectedMap={selectedMap}
        />

        <PlayerProfilesModal
          show={showProfilesModal}
          onClose={() => setShowProfilesModal(false)}
          players={friends}
          profiles={profiles}
          onSetRank={setPlayerRank}
          onSyncRiot={syncPlayerRiot}
          onSetComfortAgents={setComfortAgents}
          onUpdateName={(idx, newName) => {
            const newF = [...friends];
            newF[idx] = newName;
            setFriends(newF);
          }}
        />

        <MultiplayerModal
          show={showMultiplayerModal}
          onClose={() => setShowMultiplayerModal(false)}
          roomCode={roomCode}
          isHost={isHost}
          connectionStatus={roomConnectionStatus}
          onCreateRoom={createRoom}
          onJoinRoom={joinRoom}
          onLeaveRoom={() => { if (roomCode) { try { sessionStorage.removeItem(`valomize_room_cache_${roomCode}`); } catch {} } leaveRoom(); }}
          members={roomMembers}
          myPlayerName={myPlayerName}
          onUpdatePlayerName={setMyPlayerName}
          onTransferHost={async (targetMember) => {
            const res = await transferHost(targetMember);
            if (res.success) {
              setToastMessage(`👑 โอนสิทธิ์หัวห้องให้ ${targetMember.playerName} เรียบร้อยแล้ว`);
              playClick();
              setTimeout(() => setToastMessage(null), 3500);
            } else {
              setToastMessage(`❌ เกิดข้อผิดพลาด: ${res.error || 'โอนสิทธิ์ไม่สำเร็จ'}`);
              setTimeout(() => setToastMessage(null), 3500);
            }
          }}
          onKickMember={async (targetMember) => {
            const res = await kickMember(targetMember);
            if (res.success) {
              setToastMessage(`👢 เตะ ${targetMember.playerName} ออกจากห้องแล้ว`);
              playClick();
              setTimeout(() => setToastMessage(null), 3500);
            } else {
              setToastMessage(`❌ เกิดข้อผิดพลาด: ${res.error || 'ไม่สามารถเตะสมาชิกได้'}`);
              setTimeout(() => setToastMessage(null), 3500);
            }
          }}
          onChangeSlot={async (targetMemberId, newSlotIndex) => {
            const res = await changeMemberSlot(targetMemberId, newSlotIndex);
            if (res.success) {
              playClick();
              setToastMessage(newSlotIndex === -1 ? '👥 ย้ายไปยังตัวสำรองแล้ว' : `🎮 ย้ายไปยัง Slot ${newSlotIndex + 1} แล้ว`);
              setTimeout(() => setToastMessage(null), 3000);
            } else {
              setToastMessage(`❌ เกิดข้อผิดพลาด: ${res.error || 'สลับสล็อตไม่สำเร็จ'}`);
              setTimeout(() => setToastMessage(null), 3000);
            }
          }}
          onStartReadyCheck={isHost ? () => startReadyCheck() : undefined}
        />

        {/* Ready Check Modal */}
        <ReadyCheckModal
          show={!!activeReadyCheck}
          activeReadyCheck={activeReadyCheck}
          members={roomMembers}
          isHost={isHost}
          onRespond={respondReadyCheck}
          onCancel={cancelReadyCheck}
          onClose={closeReadyCheck}
          onRollNow={() => {
            closeReadyCheck();
            handleRollSafe();
          }}
        />

        {/* Live Member Join Floating Toast */}
        {memberToast && (
          <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-3 duration-200 pointer-events-none">
            <div className="bg-cyan-950/95 border border-cyan-500/80 text-cyan-200 px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2.5 text-xs font-bold backdrop-blur-md">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
              {memberToast}
            </div>
          </div>
        )}

        <ShareMatchCardModal
          show={showShareCardModal}
          onClose={() => setShowShareCardModal(false)}
          players={activeFriends}
          assignments={assignmentsByIndex}
          playerStatuses={playerStatuses}
          selectedMap={selectedMap}
          profiles={profiles}
        />

        <AgentBlacklistModal
          isOpen={showBlacklistModal}
          onClose={() => setShowBlacklistModal(false)}
          blacklistedAgents={blacklistedSet}
          onToggleAgent={(agentName) => {
            playClick();
            setBlacklistedAgents(prev => 
              prev.includes(agentName) ? prev.filter(n => n !== agentName) : [...prev, agentName]
            );
          }}
          onResetBlacklist={() => {
            playClick();
            setBlacklistedAgents([]);
          }}
          onSetBlacklist={(names) => {
            playClick();
            setBlacklistedAgents(names);
          }}
        />

        <MapVetoModal
          isOpen={showMapVetoModal}
          onClose={() => setShowMapVetoModal(false)}
          onSelectMap={(map) => {
            setSelectedMap(map);
            setShowMapVetoModal(false);
            playLock();
            setToastMessage(`🏆 เลือกด่านจากการ Veto: ${map}`);
            setTimeout(() => setToastMessage(null), 3000);
          }}
          onSelectAndRoll={(map) => {
            setSelectedMap(map);
            setShowMapVetoModal(false);
            playLock();
            setToastMessage(`🏆 เลือกด่าน ${map} และกำลังสุ่มตัวละคร...`);
            setTimeout(() => {
              handleRollSafe();
              setToastMessage(null);
            }, 300);
          }}
          onPlaySound={playClick}
        />

        <GunChallengeModal
          isOpen={showGunChallengeModal}
          onClose={() => setShowGunChallengeModal(false)}
          onPlaySound={playClick}
        />

        <KeyboardShortcutsModal
          isOpen={showShortcutsModal}
          onClose={() => setShowShortcutsModal(false)}
        />
        
        {editMode && (
          <div className="flex justify-center mt-12 gap-4 pb-12">
            <Button 
              variant="secondary" 
              onClick={() => {
                 setFriends([...friends, `Player ${friends.length + 1}`]);
              }}
              disabled={friends.length >= 5}
            >
              + Add Player {friends.length >= 5 && '(Max 5)'}
            </Button>
            {friends.length > 1 && (
              <Button variant="destructive" onClick={() => {
                const newFriends = friends.slice(0, -1);
                setFriends(newFriends);
                const newAssign = { ...assignmentsByIndex };
                delete newAssign[newFriends.length];
                setAssignmentsByIndex(newAssign);
              }}>
                - Remove Last
              </Button>
            )}
          </div>
        )}

        {/* Live Floating Reactions (Available for all squad members in a room) */}
        <FloatingEmojiReactions
          isInRoom={isInRoom}
          onSendEmoji={sendEmojiReaction}
          incomingReaction={latestReaction}
        />

      </div>
    </div>
  );
}

export default App;
