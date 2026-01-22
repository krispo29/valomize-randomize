import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AgentCard } from '@/components/AgentCard';
import { RoleSelector } from '@/components/RoleSelector';
import { Button } from '@/components/ui/button';
import { AGENTS, DEFAULT_FRIENDS, type Agent, type Role } from '@/data/valorant';
import { Shuffle, RefreshCw, UserCog, Settings2 } from 'lucide-react';
import jettLogo from '@/assets/jett_logo.png';

function App() {
  const [friends, setFriends] = useState<string[]>(DEFAULT_FRIENDS);
  const [isRolling, setIsRolling] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

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
      
      // LOGIC: Build the pool based on Role Counts & Forced Roles
      const final: Record<number, Agent> = {};
      const assignedIndices = new Set<number>();
      const usedAgentNames = new Set<string>();
      
      // Create a mutable copy of role counts to track what we still need to fill
      // We will decrement this as we assign forced roles, but floor at 0.
      // However, if a forced role exceeds the limit, we just accept it (User override).
      const remainingRoleCounts = { ...rolesCount };

      // Helper to pick random agent of specific role (unique preferred)
      const pickAgent = (role: Role, excludeNames: Set<string>): Agent => {
          const candidates = AGENTS.filter(a => a.role === role && !excludeNames.has(a.name));
          if (candidates.length > 0) {
              return candidates[Math.floor(Math.random() * candidates.length)];
          }
          // If ran out of unique, pick any of that role
          const anyCandidates = AGENTS.filter(a => a.role === role);
          return anyCandidates[Math.floor(Math.random() * anyCandidates.length)];
      };

      // 1. Handle Forced Assignments (MVP / Bottom)
      friends.forEach((_, index) => {
          const status = playerStatuses[index];
          let roleToForce: Role | null = null;

          if (status === 'BOTTOM') {
              roleToForce = 'Duelist';
          } else if (status === 'MVP') {
              roleToForce = mvpRoleChoices[index] || null; // If null, they are random (normal pool)
          }

          if (roleToForce) {
              const agent = pickAgent(roleToForce, usedAgentNames);
              final[index] = agent;
              assignedIndices.add(index);
              usedAgentNames.add(agent.name);
              
              // Decrement count for this role if it was requested globally
              if (remainingRoleCounts[roleToForce] > 0) {
                  remainingRoleCounts[roleToForce]--;
              }
          }
      });

      // 2. Fill specific selected roles from Global Settings (that haven't been met by forced players)
      let requiredPool: Agent[] = [];
      Object.entries(remainingRoleCounts).forEach(([role, count]) => {
         const specificRole = role as Role;
         for (let i = 0; i < count; i++) {
             requiredPool.push(pickAgent(specificRole, usedAgentNames));
             // Note: we don't add to usedAgentNames immediately because we shuffle this pool later
             // But for uniqueness in this loop we ideally should? 
             // Simplification: We'll just push to pool. 
         }
      });
      // Correcting the uniqueness issue: The 'pickAgent' checks 'usedAgentNames'. 
      // Since we didn't add the ones from 'requiredPool' to 'usedAgentNames' yet, we might pick dupes within this loop if count > 1.
      // Let's refactor slightly to ensure uniqueness in pool.
      // Actually, let's just create the pool of *Agents* needed.
      
      // Re-doing Step 2 with immediate tracking
      Object.entries(remainingRoleCounts).forEach(([role, count]) => {
         const specificRole = role as Role;
         for (let i = 0; i < count; i++) {
            const agent = pickAgent(specificRole, usedAgentNames);
            requiredPool.push(agent);
            usedAgentNames.add(agent.name);
         }
      });

      // 3. Fill remaining slots with totally random agents
      const remainingSlotsNeeded = friends.length - assignedIndices.size - requiredPool.length;
      
      if (remainingSlotsNeeded > 0) {
         // Get all available agents
         const available = AGENTS.filter(a => !usedAgentNames.has(a.name));
         const shuffledAvailable = [...available].sort(() => 0.5 - Math.random());
         
         for (let i = 0; i < remainingSlotsNeeded; i++) {
             // If we run out of unique agents (unlikely), fallback to all agents
             const agent = shuffledAvailable[i] || AGENTS[Math.floor(Math.random() * AGENTS.length)];
             requiredPool.push(agent);
         }
      }

      // 4. Shuffle the Required Pool (so specific roles aren't always at the Start of the list)
      const shuffledPool = requiredPool.sort(() => 0.5 - Math.random());
      
      // 5. Assign to unassigned indices
      let poolIndex = 0;
      friends.forEach((_, index) => {
          if (!assignedIndices.has(index)) {
              final[index] = shuffledPool[poolIndex];
              poolIndex++;
          }
      });

      setAssignmentsByIndex(final);
      setIsRolling(false);
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
            className="text-6xl md:text-8xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-red-500 to-red-800 drop-shadow-sm select-none"
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

        {showSettings && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
            <RoleSelector 
              rolesCount={rolesCount} 
              setRolesCount={setRolesCount} 
              totalPlayers={friends.length} 
            />
          </motion.div>
        )}

        <div className="flex justify-center gap-4 mb-8">
           <Button 
             size="lg" 
             onClick={handleRollSafe} 
             disabled={isRolling}
             className="bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest px-10 py-8 text-xl rounded-sm shadow-[0_0_20px_rgba(220,38,38,0.5)] transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:grayscale"
           >
             {isRolling ? <RefreshCw className="mr-2 h-6 w-6 animate-spin" /> : <Shuffle className="mr-2 h-6 w-6" />}
             {isRolling ? "ROLLING..." : "RANDOMIZE AGENTS"}
           </Button>
           
           <Button
             variant="outline"
             onClick={() => setShowSettings(!showSettings)}
             className={`border-white/20 text-white bg-zinc-800 hover:bg-zinc-700 h-auto ${showSettings ? 'border-red-500 bg-zinc-700' : ''}`}
             title="Team Composition Settings"
           >
             <Settings2 className="h-6 w-6" />
           </Button>

           <Button
             variant="outline"
             onClick={() => setEditMode(!editMode)}
             className={`border-white/20 text-white bg-zinc-800 hover:bg-zinc-700 h-auto ${editMode ? 'border-red-500 bg-zinc-700' : ''}`}
             title="Edit Players"
           >
             <UserCog className="h-6 w-6" />
           </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 justify-items-center">
          {friends.map((friend, index) => (
            <AgentCard 
              key={index} 
              playerName={friend}
              agent={assignmentsByIndex[index] || null}
              rolling={isRolling}
              canEdit={editMode}
              onEditName={(name) => updateName(index, name)}
              className="w-full max-w-[300px]"
              status={playerStatuses[index] || null}
              onStatusChange={(status) => handleStatusChange(index, status)}
              mvpRole={mvpRoleChoices[index] || null}
              onMvpRoleChange={(role) => setMvpRoleChoices(prev => ({ ...prev, [index]: role }))}
            />
          ))}
        </div>
        
        {editMode && (
          <div className="flex justify-center mt-12 gap-4">
            <Button variant="secondary" onClick={() => setFriends([...friends, `Player ${friends.length + 1}`])}>
              + Add Player
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
