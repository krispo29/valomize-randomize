import { useState, useEffect, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { AgentCard } from '@/components/AgentCard';
import { RoleSelector } from '@/components/RoleSelector';
import { Button } from '@/components/ui/button';
import { AGENTS, DEFAULT_FRIENDS, type Agent, type Role, type ValorantMap, MAP_META, MAP_ROLE_COMPOSITION } from '@/data/valorant';
import { Shuffle, RefreshCw, UserCog, Settings2, Map as MapIcon } from 'lucide-react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import jettLogo from '@/assets/jett_logo.png';

const MapSelector = lazy(() => import('@/components/MapSelector').then(module => ({ default: module.MapSelector })));

function App() {
  const [friends, setFriends] = useLocalStorage<string[]>('valorant-friends', DEFAULT_FRIENDS);
  const [isRolling, setIsRolling] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showMapSelector, setShowMapSelector] = useState(false);
  const [selectedMap, setSelectedMap] = useLocalStorage<ValorantMap | null>('valorant-selected-map', null);

  // New State for optional features
  const [playerStatuses, setPlayerStatuses] = useState<Record<number, 'MVP' | 'BOTTOM' | null>>({});
  const [mvpRoleChoices, setMvpRoleChoices] = useState<Record<number, Role | null>>({});

  // Initial Role Counts (All 0 = Random)
  const [rolesCount, setRolesCount] = useState<Record<Role, number>>({
    'Duelist': 0,
    'Controller': 0,
    'Initiator': 0,
    'Sentinel': 0
  });

  // Initialize assignments keys
  const [assignmentsByIndex, setAssignmentsByIndex] = useState<Record<number, Agent | null>>({});
  const [revealIndex, setRevealIndex] = useState<number>(-1); // -1 = not revealing, 0+ = revealing up to this index

  useEffect(() => {
    // Only set initial state on mount if empty
    setAssignmentsByIndex(prev => {
        if (Object.keys(prev).length > 0) return prev;
        const initial: Record<number, Agent | null> = {};
        friends.forEach((_, i) => initial[i] = null);
        return initial;
    });
  }, [friends]); 

  const handleRollSafe = () => {
    if (isRolling) return;
    setEditMode(false); // Auto close edit mode when rolling
    setIsRolling(true);

    const interval = setInterval(() => {
       const temp: Record<number, Agent> = {};
       friends.forEach((_, index) => {
          temp[index] = AGENTS[Math.floor(Math.random() * AGENTS.length)];
       });
       setAssignmentsByIndex(temp);
    }, 80);

    setTimeout(() => {
      clearInterval(interval);
      setRevealIndex(-1); // Reset reveal before calculating final
      
      const final: Record<number, Agent> = {};
      const assignedIndices = new Set<number>();
      const usedAgentNames = new Set<string>();
      
      // Determine agent pool based on map meta
      const currentPool = selectedMap 
          ? AGENTS.filter(a => new Set(MAP_META[selectedMap]).has(a.name))
          : AGENTS;

      // Get role requirements from map composition or user settings
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

      // 1. Handle Forced Assignments (MVP / Bottom)
      friends.forEach((_, index) => {
          const status = playerStatuses[index];
          let roleToForce: Role | null = null;

          if (status === 'BOTTOM') {
              roleToForce = 'Duelist';
          } else if (status === 'MVP') {
              roleToForce = mvpRoleChoices[index] || null;
          }

          if (roleToForce) {
              // Try to pick unique from meta pool first
              let agent = pickAgent(roleToForce, usedAgentNames, currentPool);
              
              // If no meta agent fits the role, fallback to all agents
              if (!agent) {
                  agent = pickAgent(roleToForce, usedAgentNames, AGENTS);
              }

              // Final fallback if unique exhausted
              if (!agent) {
                  const anyCandidates = AGENTS.filter(a => a.role === roleToForce);
                  agent = anyCandidates[Math.floor(Math.random() * anyCandidates.length)];
              }
              
              if (agent) {
                  final[index] = agent;
                  assignedIndices.add(index);
                  usedAgentNames.add(agent.name); // Mark used
                  
                  if (remainingRoleCounts[roleToForce] > 0) {
                      remainingRoleCounts[roleToForce]--;
                  }
              }
          }
      });

      // 2. Fill specific selected roles based on map requirements
      const requiredPool: Agent[] = [];
      Object.entries(remainingRoleCounts).forEach(([role, count]) => {
         const specificRole = role as Role;
         for (let i = 0; i < count; i++) {
             // Try unique from meta
             let agent = pickAgent(specificRole, usedAgentNames, currentPool);
             
             // Fallback to all agents
             if (!agent) {
                 agent = pickAgent(specificRole, usedAgentNames, AGENTS);
             }

              // Fallback to any if unique exhausted
             if (!agent) {
                  const anyCandidates = AGENTS.filter(a => a.role === specificRole);
                  agent = anyCandidates[Math.floor(Math.random() * anyCandidates.length)];
             }

             if (agent) {
                requiredPool.push(agent);
                usedAgentNames.add(agent.name); // Mark used immediately to prevent Dupes in this loop
             }
         }
      });

      // 3. Fill remaining slots if any (shouldn't be needed with 5 players)
      const remainingSlotsNeeded = friends.length - assignedIndices.size - requiredPool.length;
      
      if (remainingSlotsNeeded > 0) {
         // Try to fill from meta pool first
         const availableMeta = currentPool.filter(a => !usedAgentNames.has(a.name));
         
         // If meta is exhausted, fill from all available
         const availableAll = AGENTS.filter(a => !usedAgentNames.has(a.name));
         
         const poolSource = availableMeta.length >= remainingSlotsNeeded ? availableMeta : availableAll;
         
         // Shuffle the pool source
         const shuffledPoolSource = [...poolSource].sort(() => 0.5 - Math.random());
         
         for (let i = 0; i < remainingSlotsNeeded; i++) {
             if (shuffledPoolSource[i]) {
                 requiredPool.push(shuffledPoolSource[i]);
                 usedAgentNames.add(shuffledPoolSource[i].name);
             } else {
                 // Absolute backup if we run out of unique agents entirely (very rare)
                 requiredPool.push(AGENTS[Math.floor(Math.random() * AGENTS.length)]);
             }
         }
      }

      // 4. Shuffle the Required Pool
      const shuffledPool = [...requiredPool].sort(() => 0.5 - Math.random());
      
      // 5. Assign
      let poolIndex = 0;
      friends.forEach((_, index) => {
          if (!assignedIndices.has(index)) {
              if (shuffledPool[poolIndex]) {
                  final[index] = shuffledPool[poolIndex];
                  poolIndex++;
              }
          }
      });

      setAssignmentsByIndex(final);
      setIsRolling(false);
      
      // Staggered reveal from left to right
      friends.forEach((_, idx) => {
        setTimeout(() => {
          setRevealIndex(idx);
        }, idx * 400); // 400ms delay between each reveal
      });
    }, 2000);
  };

  const handleStatusChange = (index: number, newStatus: 'MVP' | 'BOTTOM' | null) => {
    setPlayerStatuses(prev => {
      const next = { ...prev };
      
      // If setting a specific status, clear that status from any other player
      if (newStatus === 'MVP') {
        Object.keys(next).forEach(k => {
          if (next[Number(k)] === 'MVP') next[Number(k)] = null;
        });
      }
      if (newStatus === 'BOTTOM') {
        Object.keys(next).forEach(k => {
          if (next[Number(k)] === 'BOTTOM') next[Number(k)] = null;
        });
      }
      
      next[index] = newStatus;
      return next;
    });
  };

  const updateName = (index: number, newName: string) => {
    const newFriends = [...friends];
    newFriends[index] = newName;
    setFriends(newFriends);
  };

  const clearName = (index: number) => {
    const newFriends = [...friends];
    newFriends[index] = '';
    setFriends(newFriends);
  };

  return (
    <div className="min-h-screen bg-[#0f1923] text-white font-sans overflow-x-hidden relative">
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-red-600/10 skew-x-[-20deg] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-red-500/5 skew-x-[20deg] pointer-events-none" />
      
      <div className="container mx-auto py-10 px-4 relative z-10">
        <header className="flex flex-col items-center mb-12">
          <motion.img 
            src={jettLogo} 
            alt="Jett Logo" 
            className="w-24 h-24 md:w-32 md:h-32 object-contain mb-2 drop-shadow-[0_0_15px_rgba(220,38,38,0.5)]"
            initial={{ scale: 0, opacity: 0, rotate: -180 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
          />
          <motion.h1 
            className="text-5xl md:text-8xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-red-500 to-red-800 drop-shadow-sm select-none"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            VALOMIZE
          </motion.h1>
          <motion.p 
             className="text-xl md:text-2xl font-bold tracking-widest uppercase text-white/50 mt-2 select-none"
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 0.2 }}
          >
            Randomizer
          </motion.p>
        </header>

        {showMapSelector && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
            <ErrorBoundary>
              <Suspense fallback={
                <div className="bg-zinc-900 border border-zinc-700 p-4 rounded-lg mb-8 max-w-4xl mx-auto">
                  <div className="text-center text-zinc-400">Loading map selector...</div>
                </div>
              }>
                <MapSelector 
                  selectedMap={selectedMap} 
                  onSelectMap={(map) => {
                    setSelectedMap(map);
                    if (map) setShowSettings(false);
                  }} 
                />
              </Suspense>
            </ErrorBoundary>
          </motion.div>
        )}

        {showSettings && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
            <ErrorBoundary>
              <RoleSelector 
                rolesCount={rolesCount} 
                setRolesCount={setRolesCount} 
                totalPlayers={friends.length} 
              />
            </ErrorBoundary>
          </motion.div>
        )}

        <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-8">
           {/* Map Selection Toggle */}
           <Button
             variant="outline"
             onClick={() => {
               setShowMapSelector(!showMapSelector);
               if (!showMapSelector) setShowSettings(false);
             }}
             className={`border-white/20 text-white bg-zinc-800 hover:bg-zinc-700 h-14 md:h-auto ${showMapSelector ? 'border-red-500 bg-zinc-700' : ''}`}
             title="Map Meta Selection"
           >
             <MapIcon className="h-6 w-6" />
           </Button>

           {/* Main Randomize Button */}
           <Button 
             size="lg" 
             onClick={handleRollSafe} 
             disabled={isRolling}
             className="bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest px-6 py-6 md:px-10 md:py-8 text-lg md:text-xl rounded-sm shadow-[0_0_20px_rgba(220,38,38,0.5)] transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:grayscale flex-grow md:flex-grow-0"
           >
             {isRolling ? <RefreshCw className="mr-2 h-5 w-5 md:h-6 md:w-6 animate-spin" /> : <Shuffle className="mr-2 h-5 w-5 md:h-6 md:w-6" />}
             {isRolling ? "ROLLING..." : "RANDOMIZE AGENTS"}
           </Button>
           
           <div className="flex gap-2 h-auto">
             <Button
               variant="outline"
               onClick={() => {
                 setShowSettings(!showSettings);
                 if (!showSettings) setShowMapSelector(false);
               }}
               disabled={!!selectedMap}
               className={`border-white/20 text-white bg-zinc-800 hover:bg-zinc-700 h-14 md:h-auto ${showSettings ? 'border-red-500 bg-zinc-700' : ''} ${selectedMap ? 'opacity-50' : ''}`}
               title={selectedMap ? "Using Map Meta (Settings Disabled)" : "Team Composition Settings"}
             >
               <Settings2 className="h-6 w-6" />
             </Button>

             <Button
               variant="outline"
               onClick={() => setEditMode(!editMode)}
               className={`border-white/20 text-white bg-zinc-800 hover:bg-zinc-700 h-14 md:h-auto ${editMode ? 'border-red-500 bg-zinc-700' : ''}`}
               title="Edit Players"
             >
               <UserCog className="h-6 w-6" />
             </Button>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 justify-items-center">
          {friends.map((friend, index) => (
            <ErrorBoundary key={`boundary-${index}`}>
              <AgentCard 
                key={`agent-${index}`} 
                playerName={friend}
                agent={revealIndex >= index ? assignmentsByIndex[index] : null}
                rolling={isRolling || (revealIndex < index && assignmentsByIndex[index] !== undefined && assignmentsByIndex[index] !== null)}
                canEdit={editMode}
                onEditName={(name) => updateName(index, name)}
                className="w-full max-w-[300px]"
                status={playerStatuses[index] || null}
                onStatusChange={(status) => handleStatusChange(index, status)}
                mvpRole={mvpRoleChoices[index] || null}
                onMvpRoleChange={(role) => setMvpRoleChoices(prev => ({ ...prev, [index]: role }))}
                onClearName={() => clearName(index)}
              />
            </ErrorBoundary>
          ))}
        </div>
        
        {editMode && (
          <div className="flex justify-center mt-12 gap-4">
            <Button 
              variant="secondary" 
              onClick={() => setFriends([...friends, `Player ${friends.length + 1}`])}
              disabled={friends.length >= 5}
            >
              + Add Player {friends.length >= 5 && '(Max 5)'}
            </Button>
            {friends.length > 1 && (
              <Button variant="destructive" onClick={() => {
                const newFriends = friends.slice(0, -1);
                setFriends(newFriends);
                // Clean up assignment
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
