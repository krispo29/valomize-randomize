import { motion, AnimatePresence } from "framer-motion";
import { type Agent, type Role } from "@/data/valorant";
import { Sword, Shield, Target, Users, RefreshCw, Trophy } from "lucide-react";
import { Button } from "./ui/button";
import { useMemo } from "react";

interface VictoryScreenProps {
  readonly show: boolean;
  readonly players: string[];
  readonly assignments: Record<number, Agent | null>;
  readonly playerStatuses: Record<number, 'MVP' | 'BOTTOM' | null>;
  readonly shuffledOrder?: number[];
  readonly onPlayAgain: () => void;
  readonly onClose: () => void;
}

// Pre-generated particle positions to avoid Math.random() during render
const generateParticleData = () => {
  const particles = [];
  for (let i = 0; i < 20; i++) {
    particles.push({
      id: `particle-${i}`,
      endX: Math.random() * 100,
      endY: Math.random() * 100,
      duration: 2 + Math.random() * 2,
      delay: Math.random() * 0.5,
    });
  }
  return particles;
};

const PARTICLE_DATA = generateParticleData();

const getRoleIcon = (role: Role) => {
  switch (role) {
    case 'Duelist': return <Sword className="h-4 w-4" />;
    case 'Controller': return <Users className="h-4 w-4" />;
    case 'Initiator': return <Target className="h-4 w-4" />;
    case 'Sentinel': return <Shield className="h-4 w-4" />;
    default: return null;
  }
};

const getRoleColor = (role: Role) => {
  switch (role) {
    case 'Duelist': return 'text-red-400';
    case 'Controller': return 'text-purple-400';
    case 'Initiator': return 'text-green-400';
    case 'Sentinel': return 'text-cyan-400';
    default: return 'text-white';
  }
};

export function VictoryScreen({ 
  show, 
  players, 
  assignments, 
  playerStatuses,
  shuffledOrder = [],
  onPlayAgain, 
  onClose 
}: VictoryScreenProps) {
  // Count roles for composition display
  const roleCount = useMemo(() => {
    const counts: Record<Role, number> = {
      'Duelist': 0,
      'Controller': 0,
      'Initiator': 0,
      'Sentinel': 0
    };
    
    players.forEach((_, index) => {
      const agent = assignments[index];
      if (agent) {
        counts[agent.role]++;
      }
    });
    
    return counts;
  }, [players, assignments]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Valorant-style diagonal lines background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-red-600/10 skew-x-[-20deg] translate-x-1/4" />
            <div className="absolute top-0 left-0 w-1/3 h-full bg-red-500/5 skew-x-[20deg] -translate-x-1/4" />
          </div>

          {/* Victory particles */}
          <div className="absolute inset-0 pointer-events-none">
            {PARTICLE_DATA.map((particle) => (
              <motion.div
                key={particle.id}
                className="absolute w-2 h-2 bg-red-500 rounded-full"
                initial={{
                  x: "50vw",
                  y: "50vh",
                  scale: 0,
                  opacity: 1
                }}
                animate={{
                  x: `${particle.endX}vw`,
                  y: `${particle.endY}vh`,
                  scale: [0, 1, 0],
                  opacity: [1, 1, 0]
                }}
                transition={{
                  duration: particle.duration,
                  delay: particle.delay,
                  ease: "easeOut"
                }}
              />
            ))}
          </div>

          <motion.div
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 50 }}
            transition={{ type: "spring", damping: 20 }}
            className="relative bg-gradient-to-br from-zinc-900/95 via-zinc-800/95 to-zinc-900/95 border border-red-500/30 rounded-lg p-8 max-w-5xl w-full shadow-2xl shadow-red-500/20 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >


            {/* Title */}
            <motion.h2
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl font-black text-center text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600 uppercase tracking-widest mt-4 mb-6"
            >
              Team Ready
            </motion.h2>

            {/* Team Composition */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-4 gap-2 mb-6"
            >
              {(Object.entries(roleCount) as [Role, number][]).map(([role, count]) => (
                <div 
                  key={role}
                  className="flex flex-col items-center p-3 bg-zinc-800/50 rounded-lg border border-zinc-700/50"
                >
                  <div className={`flex items-center gap-1 ${getRoleColor(role)}`}>
                    {getRoleIcon(role)}
                    <span className="font-bold">{count}</span>
                  </div>
                  <span className="text-xs text-zinc-400">{role}</span>
                </div>
              ))}
            </motion.div>

            {/* Player assignments - Large Card Layout */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap justify-center gap-4 mb-8"
            >
              {(shuffledOrder.length > 0 ? shuffledOrder : players.map((_, i) => i)).map((originalIndex, displayIndex) => {
                const player = players[originalIndex];
                const agent = assignments[originalIndex];
                const status = playerStatuses ? playerStatuses[originalIndex] : null;
                
                return (
                  <motion.div
                    key={originalIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + displayIndex * 0.1 }}
                    className={`relative w-40 h-64 flex flex-col items-center justify-between p-2 pt-4 rounded-lg border-2 bg-zinc-900/80 group hover:scale-105 transition-transform duration-300 ${
                      status === 'MVP' 
                        ? 'border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.3)]' 
                        : status === 'BOTTOM'
                          ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                          : 'border-zinc-700 hover:border-zinc-500'
                    }`}
                  >
                    {/* Background gradient */}
                    <div 
                      className="absolute inset-0 opacity-20 rounded-lg overflow-hidden"
                      style={{ background: `linear-gradient(to bottom, ${agent?.color || '#333'}, transparent)` }}
                    />

                    {/* Status Badge - Floating on Border */}
                    {status && (
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
                         <div className={`px-3 py-1 rounded shadow-lg flex items-center gap-1.5 border-2 ${
                            status === 'MVP' 
                              ? 'bg-yellow-400 border-yellow-500 text-black shadow-yellow-400/20' 
                              : 'bg-blue-600 border-blue-500 text-white shadow-blue-500/20'
                         }`}>
                           {status === 'MVP' && <Trophy className="h-2.5 w-2.5" />}
                           <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                             {status === 'MVP' ? 'MVP' : 'BOT FRAG'}
                           </span>
                         </div>
                      </div>
                    )}

                    {/* Player Name */}
                    <div className="z-10 w-full text-center px-1 mt-2">
                      <h3 className="text-white font-bold uppercase tracking-wider text-xs md:text-sm truncate drop-shadow-md">{player}</h3>
                    </div>

                    {/* Agent Image */}
                    {agent ? (
                      <div className="z-10 relative flex-1 w-full flex items-center justify-center p-2">
                         <img 
                           src={agent.image} 
                           alt={agent.name}
                           className="w-full h-full object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                         />
                      </div>
                    ) : (
                      <div className="z-10 w-24 h-24 flex items-center justify-center text-4xl text-zinc-700">?</div>
                    )}

                    {/* Agent Info */}
                    {agent && (
                      <div className="z-10 w-full flex flex-col items-center gap-1 mb-2">
                        <h4 className="text-xl font-black italic uppercase text-white tracking-tighter">{agent.name}</h4>
                        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/40 border border-white/10 ${getRoleColor(agent.role)}`}>
                          {getRoleIcon(agent.role)}
                          <span className="text-[10px] font-bold uppercase tracking-widest">{agent.role}</span>
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </motion.div>
            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex gap-4 justify-center"
            >
              <Button
                onClick={onPlayAgain}
                className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 flex items-center gap-2 shadow-lg shadow-red-500/30"
              >
                <RefreshCw className="h-5 w-5" />
                Roll Again
              </Button>
              <Button
                variant="outline"
                onClick={onClose}
                className="border-zinc-600 text-white hover:bg-zinc-800"
              >
                Close
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
