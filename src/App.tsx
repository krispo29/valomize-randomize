import { useState, useEffect, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AgentCard } from '@/components/AgentCard';
import { RoleSelector } from '@/components/RoleSelector';
import { Button } from '@/components/ui/button';
import { DEFAULT_FRIENDS, type Agent, type Role, type ValorantMap, MAP_META, MAP_ROLE_COMPOSITION } from '@/data/valorant';
import { valorantMeta2026, type AgentStrategyProfile } from '@/data/meta';
import { Shuffle, UserCog, Settings2, Map as MapIcon, Volume2, VolumeX, BarChart3, Trophy, Globe } from 'lucide-react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useSoundManager } from '@/hooks/useSoundManager';
import { useMatchStats } from '@/hooks/useMatchStats';
import { useValorantData } from '@/hooks/useValorantData';
import { usePlayerProfiles } from '@/hooks/usePlayerProfiles';
import { useMultiplayerRoom } from '@/hooks/useMultiplayerRoom';
import { type RoomState } from '@/types/multiplayer';
import { VictoryScreen } from '@/components/VictoryScreen';
import { StatsDashboard } from '@/components/StatsDashboard';
import { RecordMatchModal } from '@/components/RecordMatchModal';
import { PlayerProfilesModal } from '@/components/PlayerProfilesModal';
import { MultiplayerModal } from '@/components/MultiplayerModal';
import { ShareMatchCardModal } from '@/components/ShareMatchCardModal';
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
  const { profiles, setPlayerRank, syncPlayerRiot } = usePlayerProfiles(friends);
  const [showProfilesModal, setShowProfilesModal] = useState(false);

  // Stats Dashboard & Match Logging State
  const { matches, addMatch } = useMatchStats();
  const [showStatsDashboard, setShowStatsDashboard] = useState(false);
  const [showRecordMatch, setShowRecordMatch] = useState(false);
  const [showShareCardModal, setShowShareCardModal] = useState(false);
  const [showMultiplayerModal, setShowMultiplayerModal] = useState(false);

  // Multiplayer Room State (Phase 4)
  const handleRemoteState = (state: RoomState) => {
    if (state.friends && state.friends.length > 0) {
      setFriends(state.friends);
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
  };

  const {
    roomCode,
    isHost,
    isInRoom,
    connectionStatus: roomConnectionStatus,
    createRoom,
    joinRoom,
    leaveRoom,
    broadcastState,
    broadcastMatch,
  } = useMultiplayerRoom(handleRemoteState, (incomingMatch) => {
    addMatch(incomingMatch);
  });

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

  // Sound manager
  const { playRoll, stopRoll, playReveal, playVictory, playLock, isMuted, toggleMute } = useSoundManager();

  // Initialize
  useEffect(() => {
    if (gridIndices.length === 0 && deckIndices.length === 0) {
        setGridIndices(friends.map((_, i) => i));
    }
  }, [friends, gridIndices.length, deckIndices.length]);

  // Sync grid indices with friends length changes
  useEffect(() => {
    if (phase === 'IDLE') {
       if (gridIndices.length !== friends.length) {
         setGridIndices(friends.map((_, i) => i));
         setDeckIndices([]);
       }
    }
  }, [friends, phase, gridIndices.length, friends.length]);


  const calculateAssignments = () => {
      const final: Record<number, Agent> = {};
      const assignedIndices = new Set<number>();
      const usedAgentNames = new Set<string>();
      
      const currentPool = selectedMap 
          ? liveAgents.filter(a => new Set(MAP_META[selectedMap]).has(a.name))
          : liveAgents;

      const roleRequirements: Record<Role, number> = selectedMap 
          ? {
              'Duelist': MAP_ROLE_COMPOSITION[selectedMap].duelists,
              'Controller': MAP_ROLE_COMPOSITION[selectedMap].controllers,
              'Initiator': MAP_ROLE_COMPOSITION[selectedMap].initiators,
              'Sentinel': MAP_ROLE_COMPOSITION[selectedMap].sentinels
          }
          : rolesCount;

      const remainingRoleCounts = { ...roleRequirements };

      const pickAgent = (role: Role, excludeNames: Set<string>, pool: Agent[]): Agent | null => {
          const candidates = pool.filter(a => a.role === role && !excludeNames.has(a.name));
          return candidates.length > 0 
              ? candidates[Math.floor(Math.random() * candidates.length)]
              : null;
      };

      // 1. Handle Forced Assignments
      friends.forEach((_, index) => {
          const status = playerStatuses[index];
          let roleToForce: Role | null = null;

          if (status === 'BOTTOM') {
              roleToForce = 'Duelist';
          } else if (status === 'MVP') {
              roleToForce = mvpRoleChoices[index] || null;
          }

          if (roleToForce) {
              let agent = pickAgent(roleToForce, usedAgentNames, currentPool);
              agent ??= pickAgent(roleToForce, usedAgentNames, liveAgents);
              
              if (agent) {
                  final[index] = agent;
                  assignedIndices.add(index);
                  usedAgentNames.add(agent.name);
                  if (remainingRoleCounts[roleToForce] > 0) remainingRoleCounts[roleToForce]--;
              }
          }
      });

      // 2. Fill specific selected roles
      const requiredPool: Agent[] = [];
      Object.entries(remainingRoleCounts).forEach(([role, count]) => {
         const specificRole = role as Role;
         for (let i = 0; i < count; i++) {
             let agent = pickAgent(specificRole, usedAgentNames, currentPool);
             agent ??= pickAgent(specificRole, usedAgentNames, liveAgents);
             if (!agent) {
                  const anyCandidates = liveAgents.filter(a => a.role === specificRole);
                  agent = anyCandidates[Math.floor(Math.random() * anyCandidates.length)];
             }

             if (agent) {
                requiredPool.push(agent);
                usedAgentNames.add(agent.name);
             }
         }
      });

      // 3. Fill remaining slots
      const remainingSlotsNeeded = friends.length - assignedIndices.size - requiredPool.length;
      if (remainingSlotsNeeded > 0) {
         const availableMeta = currentPool.filter(a => !usedAgentNames.has(a.name));
         const availableAll = liveAgents.filter(a => !usedAgentNames.has(a.name));
         const poolSource = availableMeta.length >= remainingSlotsNeeded ? availableMeta : availableAll;
         
         const shuffledPoolSource = [...poolSource].sort(() => 0.5 - Math.random());
         
         for (let i = 0; i < remainingSlotsNeeded; i++) {
             if (shuffledPoolSource[i]) {
                 requiredPool.push(shuffledPoolSource[i]);
                 usedAgentNames.add(shuffledPoolSource[i].name);
             } else {
                 requiredPool.push(liveAgents[Math.floor(Math.random() * liveAgents.length)]);
             }
         }
      }

      // 4. Assign remaining
      const shuffledPool = [...requiredPool].sort(() => 0.5 - Math.random());
      
      const unassignedPlayerIndices = friends
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
    if (phase !== 'IDLE') return;
    
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
    const allIndices = friends.map((_, i) => i);
    setGridIndices([]);
    const currentDeck = [...allIndices];
    setDeckIndices(currentDeck);

    if (isInRoom && isHost && roomCode) {
      broadcastState({
        roomCode,
        hostName: friends[0] || 'Host',
        createdAt: Date.now(),
        friends,
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
        hostName: friends[0] || 'Host',
        createdAt: Date.now(),
        friends,
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
    
    const indicesToDeal = friends.map((_, i) => i);
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
            hostName: friends[0] || 'Host',
            createdAt: Date.now(),
            friends,
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
        hostName: friends[0] || 'Host',
        createdAt: Date.now(),
        friends,
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
    if (newStatus) playLock();
    setPlayerStatuses(prev => {
      const next = { ...prev };
      if (newStatus === 'MVP') Object.keys(next).forEach(k => { if (next[Number(k)] === 'MVP') next[Number(k)] = null; });
      if (newStatus === 'BOTTOM') Object.keys(next).forEach(k => { if (next[Number(k)] === 'BOTTOM') next[Number(k)] = null; });
      next[index] = newStatus;
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-[#0f1923] text-white font-sans overflow-x-hidden relative flex flex-col">
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-red-600/10 skew-x-[-20deg] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-red-500/5 skew-x-[20deg] pointer-events-none" />
      
      <div className="container mx-auto py-10 px-4 relative z-10 flex-grow flex flex-col">
        <header className="flex flex-col items-center mb-8">
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
              <div className="flex items-center gap-2 truncate">
                <span className="w-2 h-2 rounded-full bg-current animate-pulse shrink-0" />
                <span className="font-bold truncate">
                  {isHost
                    ? `👑 คุณเป็นหัวห้อง ${roomCode} • การสุ่มของคุณจะถ่ายทอดสดให้เพื่อนทุกคน`
                    : `👁️ คุณกำลังรับชมการสุ่มสดจากห้อง ${roomCode} (Spectator Mode)`}
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowMultiplayerModal(true)}
                  className="px-2.5 py-1 rounded bg-black/40 hover:bg-black/60 font-bold text-[11px] transition"
                >
                  จัดการห้อง
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Controls Area */}
        {phase === 'IDLE' && (
            <div className="mb-8">
                {/* Collapsible Areas */}
                {(showMapSelector || selectedMap) && (
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

                {showSettings && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-4">
                    <ErrorBoundary>
                    <RoleSelector rolesCount={rolesCount} setRolesCount={setRolesCount} totalPlayers={friends.length} />
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

                {/* Buttons */}
                <div className="flex flex-wrap justify-center gap-2 md:gap-4">
                    <Button
                        variant="outline"
                        onClick={() => { setShowMapSelector(!showMapSelector); if (!showMapSelector) setShowSettings(false); }}
                        className={`border-white/20 text-white bg-zinc-800 hover:bg-zinc-700 h-14 md:h-auto ${(showMapSelector || selectedMap) ? 'border-red-500 bg-zinc-700' : ''}`}
                        title="Map Meta Selection"
                        aria-label={showMapSelector ? "Hide map selector" : "Show map selector"}
                    >
                        <MapIcon className={`h-6 w-6 ${selectedMap ? 'text-red-400' : ''}`} />
                    </Button>

                    <Button 
                        size="lg" 
                        onClick={handleRollSafe} 
                        className="bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest px-6 py-6 md:px-10 md:py-8 text-lg md:text-xl rounded-sm shadow-[0_0_20px_rgba(220,38,38,0.5)] transition-all transform hover:scale-105 active:scale-95"
                    >
                        <Shuffle className="mr-2 h-5 w-5 md:h-6 md:w-6" />
                        RANDOMIZE AGENTS
                    </Button>
                    
                    <div className="flex gap-2 h-auto">
                        <Button
                            variant="outline"
                            onClick={toggleMute}
                            className={`border-white/20 text-white bg-zinc-800 hover:bg-zinc-700 h-14 md:h-auto min-w-[3.5rem] ${isMuted ? 'opacity-50' : ''}`}
                            aria-label={isMuted ? "Unmute sound" : "Mute sound"}
                        >
                            {isMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
                        </Button>

                        <Button
                            variant="outline"
                            onClick={() => { setShowSettings(!showSettings); if (!showSettings) setShowMapSelector(false); }}
                            disabled={!!selectedMap}
                            className={`border-white/20 text-white bg-zinc-800 hover:bg-zinc-700 h-14 md:h-auto ${showSettings ? 'border-red-500 bg-zinc-700' : ''} ${selectedMap ? 'opacity-50' : ''}`}
                            aria-label={showSettings ? "Hide settings" : "Show settings"}
                        >
                            <Settings2 className="h-6 w-6" />
                        </Button>

                        <Button
                            variant="outline"
                            onClick={() => setEditMode(!editMode)}
                            className={`border-white/20 text-white bg-zinc-800 hover:bg-zinc-700 h-14 md:h-auto ${editMode ? 'border-red-500 bg-zinc-700' : ''}`}
                            aria-label={editMode ? "Disable edit mode" : "Enable edit mode"}
                        >
                            <UserCog className="h-6 w-6" />
                        </Button>

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
                              {isInRoom ? roomCode : 'Room'}
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
                                    playerName={friends[playerIndex]}
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

            {/* The Grid (Players) */}
            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 justify-items-center transition-opacity duration-500 ${(phase === 'GATHERING' || phase === 'SHUFFLING') ? 'opacity-30' : 'opacity-100'}`}>
                {friends.map((friendName, index) => {
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
                                        playerName={friendName}
                                        agent={assignedAgent || null}
                                        rolling={isFaceDown} 
                                        canEdit={editMode}
                                        onEditName={(n) => {
                                            const newF = [...friends];
                                            newF[index] = n;
                                            setFriends(newF);
                                        }}
                                        status={playerStatuses[index] || null}
                                        onStatusChange={(s) => handleStatusChange(index, s)}
                                        mvpRole={mvpRoleChoices[index] || null}
                                        onMvpRoleChange={(r) => setMvpRoleChoices(prev => ({ ...prev, [index]: r }))}
                                        onClearName={() => {
                                            const newF = [...friends];
                                            newF[index] = '';
                                            setFriends(newF);
                                        }}
                                        strategyProfile={strategyProfile}
                                        activeSynergies={
                                            strategyProfile?.synergies?.filter(
                                                syn => Object.values(assignmentsByIndex).some(a => a?.name === syn)
                                            )
                                        }
                                        rankIcon={profiles[index]?.rankIcon}
                                        rankName={profiles[index]?.rankName}
                                        onOpenProfileModal={() => setShowProfilesModal(true)}
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
          players={friends} 
          assignments={assignmentsByIndex} 
		  playerStatuses={playerStatuses}
          shuffledOrder={friends.map((_, i) => i)}
          profiles={profiles}
          onPlayAgain={() => {
            setShowVictory(false);
            setPhase('IDLE');
          }}
          onClose={() => setShowVictory(false)}
          onRecordMatch={() => setShowRecordMatch(true)}
          onShareCard={() => setShowShareCardModal(true)}
        />

        <StatsDashboard
          show={showStatsDashboard}
          onClose={() => setShowStatsDashboard(false)}
        />

        <RecordMatchModal
          show={showRecordMatch}
          onClose={() => setShowRecordMatch(false)}
          onSave={(match) => {
            addMatch(match);
            if (isInRoom) {
              const fullMatch = {
                ...match,
                id: `match_${Date.now()}`,
                timestamp: Date.now(),
              };
              broadcastMatch(fullMatch);
            }
          }}
          players={friends}
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
          onLeaveRoom={leaveRoom}
        />

        <ShareMatchCardModal
          show={showShareCardModal}
          onClose={() => setShowShareCardModal(false)}
          players={friends}
          assignments={assignmentsByIndex}
          playerStatuses={playerStatuses}
          selectedMap={selectedMap}
          profiles={profiles}
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

      </div>
    </div>
  );
}

export default App;
