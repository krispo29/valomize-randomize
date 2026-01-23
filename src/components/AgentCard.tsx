import { motion } from "framer-motion";
import { type Agent, type Role } from "@/data/valorant";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Zap, Shield, Target, Users, Sparkles, Star, TrendingUp, X } from "lucide-react";

interface AgentCardProps {
  readonly playerName: string;
  readonly agent: Agent | null;
  readonly rolling: boolean;
  readonly className?: string;
  readonly onEditName?: (newName: string) => void;
  readonly canEdit?: boolean;
  readonly status: 'MVP' | 'BOTTOM' | null;
  readonly onStatusChange: (status: 'MVP' | 'BOTTOM' | null) => void;
  readonly mvpRole: Role | null;
  readonly onMvpRoleChange: (role: Role | null) => void;
  readonly onClearName?: () => void;
}

export function AgentCard({ 
  playerName, 
  agent, 
  rolling, 
  className, 
  onEditName, 
  canEdit,
  status,
  onStatusChange,
  mvpRole,
  onMvpRoleChange,
  onClearName
}: AgentCardProps) {
  // If no agent yet, showing a placeholder or waiting
  const displayAgent = agent || { name: '?', role: 'Duelist', image: '', color: '#333' };

  // Get role icon
  const getRoleIcon = (role: Role) => {
    switch (role) {
      case 'Duelist': return <Zap className="h-4 w-4" />;
      case 'Controller': return <Shield className="h-4 w-4" />;
      case 'Initiator': return <Target className="h-4 w-4" />;
      case 'Sentinel': return <Users className="h-4 w-4" />;
      default: return <Sparkles className="h-4 w-4" />;
    }
  };

  // Get role color
  const getRoleColor = (role: Role) => {
    switch (role) {
      case 'Duelist': return 'text-red-400';
      case 'Controller': return 'text-purple-400';
      case 'Initiator': return 'text-green-400';
      case 'Sentinel': return 'text-yellow-400';
      default: return 'text-zinc-400';
    }
  };

  return (
    <motion.div
      layout
      className={cn("w-full relative group", className)}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
    >
      <Card className={cn(
        "overflow-hidden border-2 bg-zinc-900 border-zinc-800 relative h-96 flex flex-col items-center justify-between shadow-lg transition-all duration-300 hover:border-red-500 hover:shadow-red-500/20 hover:scale-[1.02] hover:-translate-y-1",
        status === 'MVP' && "border-yellow-500 shadow-yellow-500/20",
        status === 'BOTTOM' && "border-blue-900 shadow-blue-900/20 opacity-90"
      )}>
        
        {/* Background gradient based on agent color */}
        <div 
           className="absolute inset-0 opacity-20 transition-colors duration-300" 
           style={{ background: `linear-gradient(to bottom, ${displayAgent.color || '#333'}, transparent)` }}
        />

        {/* Status Indicator Badge (Visible always if set) */}
        {status && !canEdit && (
            <div className={cn(
                "absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase z-20",
                status === 'MVP' ? "bg-yellow-500 text-black" : "bg-blue-900 text-blue-200"
            )}>
                {status === 'MVP' ? 'MVP' : 'BOTTOM FRAG'}
            </div>
        )}

        <CardHeader className="z-10 w-full text-center pb-2">
          {canEdit ? (
             <div className="flex flex-col gap-2">
               <div className="relative flex items-center justify-center">
                 <input 
                   className="bg-transparent border-b border-white/20 text-center text-xl font-bold text-white focus:outline-none focus:border-red-500 w-full pr-8"
                   value={playerName}
                   onChange={(e) => onEditName?.(e.target.value)}
                 />
                 {onClearName && (
                   <button
                     onClick={onClearName}
                     className="absolute right-0 text-red-500 hover:text-red-400 transition-colors"
                     aria-label={`Clear ${playerName} name`}
                   >
                     <X className="h-4 w-4" />
                   </button>
                 )}
               </div>
               
               {/* MVP / Bottom Selector */}
               <div className="flex justify-center gap-2 mt-2">
                  <button 
                    onClick={() => onStatusChange(status === 'MVP' ? null : 'MVP')}
                    className={cn("px-2 py-1 rounded text-xs font-bold border transition-colors", status === 'MVP' ? "bg-yellow-500 text-black border-yellow-500" : "bg-transparent text-yellow-500 border-yellow-500/50 hover:bg-yellow-500/10")}
                    aria-label={status === 'MVP' ? 'Remove MVP status' : 'Set as MVP'}
                    aria-pressed={status === 'MVP'}
                  >
                    MVP
                  </button>
                  <button 
                    onClick={() => onStatusChange(status === 'BOTTOM' ? null : 'BOTTOM')}
                    className={cn("px-2 py-1 rounded text-xs font-bold border transition-colors", status === 'BOTTOM' ? "bg-blue-900 text-white border-blue-900" : "bg-transparent text-blue-400 border-blue-900/50 hover:bg-blue-900/20")}
                    aria-label={status === 'BOTTOM' ? 'Remove Bottom status' : 'Set as Bottom'}
                    aria-pressed={status === 'BOTTOM'}
                  >
                    BTM
                  </button>
               </div>

               {/* MVP Role Selector */}
               {status === 'MVP' && (
                  <select 
                    value={mvpRole || ''} 
                    onChange={(e) => onMvpRoleChange(e.target.value as Role)}
                    className="bg-zinc-800 text-white text-xs p-1 rounded border border-zinc-700 focus:outline-none mt-1"
                    aria-label="Select MVP role"
                  >
                    <option value="">Any Role</option>
                    <option value="Duelist">Duelist</option>
                    <option value="Controller">Controller</option>
                    <option value="Initiator">Initiator</option>
                    <option value="Sentinel">Sentinel</option>
                  </select>
               )}
             </div>
          ) : (
             <CardTitle className="text-xl font-bold text-white uppercase tracking-wider">{playerName}</CardTitle>
          )}
        </CardHeader>

        <CardContent className="z-10 flex flex-col items-center justify-center flex-1 w-full gap-4">
          <div className="relative w-32 h-32 md:w-40 md:h-40 flex items-center justify-center">
            {rolling && (
              <div className="relative w-24 h-24 flex items-center justify-center">
                 {/* Outer Ring - Dashed */}
                 <motion.div 
                   className="absolute inset-0 rounded-full border-2 border-dashed border-red-500/50"
                   animate={{ rotate: 360 }}
                   transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                 />
                 {/* Outer Ring 2 - Opposite */}
                 <motion.div 
                   className="absolute inset-2 rounded-full border border-zinc-700"
                   animate={{ rotate: -360 }}
                   transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                 />
                 
                 {/* Inner Segment Spinning Fast */}
                 <motion.div 
                   className="absolute inset-4 rounded-full border-t-2 border-r-2 border-red-500"
                   animate={{ rotate: 360 }}
                   transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                 />
                 
                 {/* Center Pulse */}
                 <motion.div 
                   className="absolute w-4 h-4 bg-red-500 rounded-full"
                   animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.5, 1, 0.5] }}
                   transition={{ repeat: Infinity, duration: 0.8 }}
                 />
                 
                 {/* Tech accent lines */}
                 <div className="absolute top-0 left-1/2 -ml-0.5 w-1 h-2 bg-red-500" />
                 <div className="absolute bottom-0 left-1/2 -ml-0.5 w-1 h-2 bg-red-500" />
                 <div className="absolute left-0 top-1/2 -mt-0.5 w-2 h-1 bg-red-500" />
                 <div className="absolute right-0 top-1/2 -mt-0.5 w-2 h-1 bg-red-500" />
              </div>
            )}
            {!rolling && agent && (
               <div className="animate-flip-in w-full h-full relative">
                 <img 
                   src={agent.image} 
                   alt={agent.name}
                   className="w-full h-full object-contain drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]"
                 />
                 {/* Shine effect overlay */}
                 <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent opacity-0 animate-[shine_0.5s_ease-out_0.2s_forwards] pointer-events-none" />
               </div>
            )}
            {!rolling && !agent && (
                <div className="text-6xl text-zinc-700">?</div>
            )}
          </div>
          
          <div className="flex flex-col items-center">
            <h2 className={cn("text-2xl font-black uppercase italic tracking-tighter", rolling ? "text-zinc-600 blur-sm" : "text-white")}>
               {agent ? agent.name : "???"}
            </h2>
            {agent && (
               <div className="flex flex-col items-center gap-2 mt-2">
                 {/* Role with icon */}
                 <div className={cn("flex items-center gap-1", getRoleColor(agent.role))}>
                   {getRoleIcon(agent.role)}
                   <span className="text-xs uppercase tracking-widest border border-zinc-700 px-2 py-0.5 rounded-full bg-zinc-950/50">
                     {agent.role}
                   </span>
                 </div>
                 
                 {/* Stats */}
                 <div className="flex items-center gap-3 text-[10px] text-zinc-500">
                   {agent.difficulty && (
                     <div className="flex items-center gap-1">
                       <Star className="h-3 w-3" />
                       <span>{agent.difficulty}</span>
                     </div>
                   )}
                   {agent.pickRate && (
                     <div className="flex items-center gap-1">
                       <TrendingUp className="h-3 w-3" />
                       <span>{agent.pickRate}%</span>
                     </div>
                   )}
                 </div>
               </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
