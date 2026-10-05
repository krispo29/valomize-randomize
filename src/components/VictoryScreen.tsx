import { motion, AnimatePresence } from "framer-motion";
import { type Agent, type Role, type ValorantMap } from "@/data/valorant";
import { Sword, Shield, Target, Users, RefreshCw, Trophy, Image as ImageIcon, Copy, Check, MessageSquare, Zap } from "lucide-react";
import { Button } from "./ui/button";
import { useMemo, useState } from "react";
import { generateTacticalBrief } from "@/utils/tacticalBrief";

import { type PlayerProfile } from "@/types/player";

interface VictoryScreenProps {
  readonly show: boolean;
  readonly players: string[];
  readonly assignments: Record<number, Agent | null>;
  readonly playerStatuses: Record<number, 'MVP' | 'BOTTOM' | null>;
  readonly shuffledOrder?: number[];
  readonly mapName?: string;
  readonly onPlayAgain?: () => void;
  readonly onClose: () => void;
  readonly onRecordMatch?: () => void;
  readonly onShareCard?: () => void;
  readonly profiles?: Record<number, PlayerProfile>;
  readonly roomCode?: string | null;
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
  mapName,
  onPlayAgain, 
  onClose,
  onRecordMatch,
  onShareCard,
  profiles,
  roomCode,
}: VictoryScreenProps) {
  const [copiedText, setCopiedText] = useState(false);
  const [copiedInGame, setCopiedInGame] = useState(false);

  const handleCopyTextComp = () => {
    const roleIcons: Record<string, string> = {
      Duelist: '⚔️',
      Initiator: '🎯',
      Controller: '💨',
      Sentinel: '🛡️',
    };

    const mapHeader = mapName ? ` — 🗺️ **[${mapName.toUpperCase()}]**` : '';
    const lines = [
      `🎮 **VALOMIZE SQUAD LINEUP**${mapHeader}`,
      '──────────────────────────────',
    ];

    players.forEach((p, idx) => {
      const agent = assignments[idx];
      const status = playerStatuses[idx];
      const tag = status === 'MVP' ? ' 👑 [MVP]' : status === 'BOTTOM' ? ' 💀 [Bot Frag]' : '';
      if (agent) {
        const icon = roleIcons[agent.role] || '🔹';
        lines.push(`${icon} **${p}:** ${agent.name} *(${agent.role})*${tag}`);
      } else {
        lines.push(`🎲 **${p}:** Random Agent${tag}`);
      }
    });

    lines.push('──────────────────────────────');
    if (roomCode) {
      lines.push(`🔗 **เข้าห้องดูสด:** https://valomize-randomize.vercel.app/?room=${roomCode}`);
    } else {
      lines.push(`🎲 *สุ่มโดย Valomize Randomizer*`);
    }

    navigator.clipboard.writeText(lines.join('\n'));
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  const handleCopyInGameChat = () => {
    const parts = players.map((p, idx) => {
      const agent = assignments[idx];
      return `${p} (${agent ? agent.name : '?'})`;
    });
    const mapStr = mapName ? `[${mapName}] ` : '';
    const text = `VALOMIZE ${mapStr}> ${parts.join(' | ')}`;
    navigator.clipboard.writeText(text);
    setCopiedInGame(true);
    setTimeout(() => setCopiedInGame(false), 2500);
  };
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

  const tacticalBrief = useMemo(() => {
    return generateTacticalBrief(assignments, (mapName as ValorantMap) || null);
  }, [assignments, mapName]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto"
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
            className="relative bg-gradient-to-br from-zinc-900/95 via-zinc-800/95 to-zinc-900/95 border border-red-500/30 rounded-lg p-6 md:p-8 max-w-5xl w-full shadow-2xl shadow-red-500/20 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Title */}
            <motion.h2
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl font-black text-center text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600 uppercase tracking-widest mt-2 mb-5"
            >
              Team Ready
            </motion.h2>

            {/* Team Composition */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-4 gap-2 mb-4"
            >
              {(Object.entries(roleCount) as [Role, number][]).map(([role, count]) => (
                <div 
                  key={role}
                  className="flex flex-col items-center p-2.5 bg-zinc-800/50 rounded-lg border border-zinc-700/50"
                >
                  <div className={`flex items-center gap-1 ${getRoleColor(role)}`}>
                    {getRoleIcon(role)}
                    <span className="font-bold">{count}</span>
                  </div>
                  <span className="text-xs text-zinc-400">{role}</span>
                </div>
              ))}
            </motion.div>

            {/* Radiant IGL Tactical Brief */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="mb-6 p-4 rounded-xl bg-zinc-950/80 border border-red-500/25 backdrop-blur-sm relative overflow-hidden"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/80 pb-2.5 mb-2.5">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-red-600/30 text-red-400 border border-red-500/40 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-red-400" />
                    IGL Brief
                  </span>
                  <h3 className="text-sm font-bold text-white tracking-wide">
                    {tacticalBrief.headline}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-purple-950/60 text-purple-300 border border-purple-500/30">
                    Tempo: {tacticalBrief.tempo}
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded font-black bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    Grade: {tacticalBrief.ratingGrade}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
                <div className="bg-zinc-900/60 rounded-lg p-2.5 border border-zinc-800/70">
                  <div className="font-bold text-amber-400 mb-1 flex items-center gap-1">
                    <span>🎯 Win Condition</span>
                  </div>
                  <p className="text-zinc-300 text-[11px] leading-relaxed">{tacticalBrief.winCondition}</p>
                </div>
                <div className="bg-zinc-900/60 rounded-lg p-2.5 border border-zinc-800/70">
                  <div className="font-bold text-red-400 mb-1 flex items-center gap-1">
                    <span>⚔️ Attack Plan</span>
                  </div>
                  <p className="text-zinc-300 text-[11px] leading-relaxed">{tacticalBrief.attackStrategy}</p>
                </div>
                <div className="bg-zinc-900/60 rounded-lg p-2.5 border border-zinc-800/70">
                  <div className="font-bold text-cyan-400 mb-1 flex items-center gap-1">
                    <span>🛡️ Defense Plan</span>
                  </div>
                  <p className="text-zinc-300 text-[11px] leading-relaxed">{tacticalBrief.defenseStrategy}</p>
                </div>
              </div>
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
                    key={`${players[originalIndex] || 'player'}-${originalIndex}`}
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

                    {/* Player Name and Rank */}
                    <div className="z-10 w-full text-center px-1 mt-2 flex items-center justify-center gap-1.5">
                      <h3 className="text-white font-bold uppercase tracking-wider text-xs md:text-sm truncate drop-shadow-md">
                        {player}
                      </h3>
                      {profiles && profiles[originalIndex]?.rankIcon && (
                        <img
                          src={profiles[originalIndex].rankIcon}
                          alt={profiles[originalIndex].rankName || 'Rank'}
                          className="w-4 h-4 object-contain inline-block shrink-0 drop-shadow-sm"
                          title={profiles[originalIndex].rankName}
                        />
                      )}
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
              className="flex flex-wrap gap-3 justify-center"
            >
              {onRecordMatch && (
                <Button
                  onClick={onRecordMatch}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3 flex items-center gap-2 shadow-lg shadow-emerald-500/30 border border-emerald-400/40"
                >
                  <Trophy className="h-5 w-5" />
                  บันทึกผลการแข่ง (Record Match)
                </Button>
              )}
              {onShareCard && (
                <Button
                  onClick={onShareCard}
                  className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-5 py-3 flex items-center gap-2 shadow-lg shadow-cyan-500/30 border border-cyan-400/40"
                >
                  <ImageIcon className="h-5 w-5" />
                  แชร์การ์ด (Share Card)
                </Button>
              )}
              <Button
                onClick={handleCopyInGameChat}
                variant="outline"
                className="border-amber-500/40 bg-zinc-900/90 hover:bg-amber-500/20 text-amber-300 font-bold px-4 py-3 flex items-center gap-2 shadow"
                title="คัดลอกข้อความบรรทัดเดียวสำหรับกดวางในแชททีม Valorant ([VALOMIZE] Map > P1 (Agent) | ...)"
              >
                {copiedInGame ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-400" /> คัดลอกแชทในเกมแล้ว!
                  </>
                ) : (
                  <>
                    <MessageSquare className="h-4 w-4 text-amber-400" /> ก๊อปวางในเกม (In-Game)
                  </>
                )}
              </Button>
              <Button
                onClick={handleCopyTextComp}
                variant="outline"
                className="border-[#5865F2]/50 bg-[#5865F2]/15 hover:bg-[#5865F2]/30 text-[#8891f7] hover:text-white font-bold px-4 py-3 flex items-center gap-2 shadow"
                title="คัดลอกรายชื่อตัวละครเป็นข้อความฟอร์แมต Markdown ไปวางใน Discord"
              >
                {copiedText ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-400" /> คัดลอก Discord แล้ว!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 text-[#8891f7]" /> คัดลอกลง Discord
                  </>
                )}
              </Button>
              {onPlayAgain && (
                <Button
                  onClick={onPlayAgain}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 flex items-center gap-2 shadow-lg shadow-red-500/30"
                >
                  <RefreshCw className="h-5 w-5" />
                  Roll Again
                </Button>
              )}
              <Button
                variant="outline"
                onClick={onClose}
                className="border-zinc-600 text-white hover:bg-zinc-800 px-6 py-3"
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
