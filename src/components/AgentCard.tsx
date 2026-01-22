import { motion } from "framer-motion";
import { type Agent, type Role } from "@/data/valorant";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AgentCardProps {
  playerName: string;
  agent: Agent | null;
  rolling: boolean;
  className?: string;
  onEditName?: (newName: string) => void;
  canEdit?: boolean;
  status: 'MVP' | 'BOTTOM' | null;
  onStatusChange: (status: 'MVP' | 'BOTTOM' | null) => void;
  mvpRole: Role | null;
  onMvpRoleChange: (role: Role | null) => void;
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
  onMvpRoleChange
}: AgentCardProps) {
  // If no agent yet, showing a placeholder or waiting
  const displayAgent = agent || { name: '?', role: 'Duelist', image: '', color: '#333' };

  return (
    <motion.div
      layout
      className={cn("w-full relative group", className)}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
    >
      <Card className={cn(
        "overflow-hidden border-2 bg-zinc-900 border-zinc-800 relative h-96 flex flex-col items-center justify-between shadow-lg transition-all duration-300 hover:border-red-500 hover:shadow-red-500/20",
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
               <input 
                 className="bg-transparent border-b border-white/20 text-center text-xl font-bold text-white focus:outline-none focus:border-red-500 w-full"
                 value={playerName}
                 onChange={(e) => onEditName && onEditName(e.target.value)}
               />
               
               {/* MVP / Bottom Selector */}
               <div className="flex justify-center gap-2 mt-2">
                  <button 
                    onClick={() => onStatusChange(status === 'MVP' ? null : 'MVP')}
                    className={cn("px-2 py-1 rounded text-xs font-bold border transition-colors", status === 'MVP' ? "bg-yellow-500 text-black border-yellow-500" : "bg-transparent text-yellow-500 border-yellow-500/50 hover:bg-yellow-500/10")}
                  >
                    MVP
                  </button>
                  <button 
                    onClick={() => onStatusChange(status === 'BOTTOM' ? null : 'BOTTOM')}
                    className={cn("px-2 py-1 rounded text-xs font-bold border transition-colors", status === 'BOTTOM' ? "bg-blue-900 text-white border-blue-900" : "bg-transparent text-blue-400 border-blue-900/50 hover:bg-blue-900/20")}
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
            {rolling ? (
              <motion.div 
                className="text-4xl font-bold text-white/50"
                animate={{ opacity: [0.5, 1, 0.5], scale: [0.9, 1.1, 0.9] }}
                transition={{ repeat: Infinity, duration: 0.2 }}
              >
                ROLLING
              </motion.div>
            ) : agent ? (
               <motion.img 
                 src={agent.image} 
                 alt={agent.name}
                 initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
                 animate={{ scale: 1, opacity: 1, rotate: 0 }}
                 transition={{ type: "spring", stiffness: 200, damping: 15 }}
                 className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
               />
            ) : (
                <div className="text-6xl text-zinc-700">?</div>
            )}
          </div>
          
          <div className="flex flex-col items-center">
            <h2 className={cn("text-2xl font-black uppercase italic tracking-tighter", rolling ? "text-zinc-600 blur-sm" : "text-white")}>
               {agent ? agent.name : "???"}
            </h2>
            {agent && (
               <span className="text-xs uppercase tracking-widest text-zinc-400 border border-zinc-700 px-2 py-0.5 rounded-full mt-1 bg-zinc-950/50">
                 {agent.role}
               </span>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
