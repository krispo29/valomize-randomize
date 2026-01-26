import { motion, AnimatePresence } from "framer-motion";
import { type Agent, type Role } from "@/data/valorant";
import { type AgentStrategyProfile } from "@/data/meta";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LazyImage } from "@/components/LazyImage";
import { Zap, Shield, Target, Users, Sparkles, Star, TrendingUp, TrendingDown, Minus, X, Info } from "lucide-react";
import { useState } from "react";

// Type alias for player status
type PlayerStatus = 'MVP' | 'BOTTOM' | null;

// Helper functions extracted to reduce complexity
const getRoleIcon = (role: Role) => {
  const icons = {
    'Duelist': <Zap className="h-4 w-4" />,
    'Controller': <Shield className="h-4 w-4" />,
    'Initiator': <Target className="h-4 w-4" />,
    'Sentinel': <Users className="h-4 w-4" />
  };
  return icons[role] || <Sparkles className="h-4 w-4" />;
};

const getRoleColor = (role: Role) => {
  const colors = {
    'Duelist': 'text-red-400',
    'Controller': 'text-blue-400', 
    'Initiator': 'text-yellow-400',
    'Sentinel': 'text-green-400'
  };
  return colors[role] || 'text-gray-400';
};

const getTierColor = (tier: string) => {
  switch(tier) {
    case 'S': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
    case 'A': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50';
    case 'B': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
    default: return 'bg-zinc-800 text-zinc-400';
  }
};

const getTrendIcon = (trend: string) => {
  switch(trend) {
    case 'Rising': return <TrendingUp className="h-3 w-3 text-green-400" />;
    case 'Falling': return <TrendingDown className="h-3 w-3 text-red-400" />;
    default: return <Minus className="h-3 w-3 text-yellow-400" />;
  }
};

const getCardClasses = (rolling: boolean, status: PlayerStatus, className?: string) => {
  return cn(
    "overflow-hidden border-2 bg-zinc-900 border-zinc-800 relative h-96 flex flex-col items-center justify-between shadow-lg transition-all duration-300",
    "will-change-transform backface-visibility-hidden transform-gpu", // Performance optimizations
    // Only show status colors if REVEALED
    !rolling && status === 'MVP' && "border-yellow-500 shadow-yellow-500/20",
    !rolling && status === 'BOTTOM' && "border-blue-900 shadow-blue-900/20 opacity-90",
    className?.includes('hover:border-red-500') ? '' : "hover:border-red-500 hover:shadow-red-500/20 hover:scale-[1.02] hover:-translate-y-1"
  );
};

const renderStatusBadge = (status: PlayerStatus, canEdit: boolean, rolling: boolean) => {
  if (!status || canEdit || rolling) return null;
  
  return (
    <div className={cn(
      "absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase z-20",
      status === 'MVP' ? "bg-yellow-500 text-black" : "bg-blue-900 text-blue-200"
    )}>
      {status === 'MVP' ? 'MVP' : 'BOTTOM FRAG'}
    </div>
  );
};

const renderTierBadge = (profile: AgentStrategyProfile | undefined, rolling: boolean) => {
  if (!profile || rolling) return null;
  
  return (
    <div className={cn(
      "absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase z-20 border backdrop-blur-sm flex items-center gap-1",
      getTierColor(profile.tier)
    )}>
      <span>TIER {profile.tier}</span>
    </div>
  );
};

const renderEditControls = (
  playerName: string,
  status: PlayerStatus,
  onStatusChange: (status: PlayerStatus) => void,
  mvpRole: Role | null,
  onMvpRoleChange: (role: Role | null) => void,
  onEditName?: (newName: string) => void,
  onClearName?: () => void
) => (
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
);

interface AgentCardProps {
  readonly playerName: string;
  readonly agent: Agent | null;
  readonly rolling: boolean;
  readonly className?: string;
  readonly onEditName?: (newName: string) => void;
  readonly canEdit?: boolean;
  readonly status: PlayerStatus;
  readonly onStatusChange: (status: PlayerStatus) => void;
  readonly mvpRole: Role | null;
  readonly onMvpRoleChange: (role: Role | null) => void;
  readonly onClearName?: () => void;
  readonly strategyProfile?: AgentStrategyProfile;
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
  onClearName,
  strategyProfile
}: AgentCardProps) {
  // If no agent yet, showing a placeholder or waiting
  const displayAgent = agent || { name: '?', role: 'Duelist', image: '', color: '#333' };
  const [showInfo, setShowInfo] = useState(false);

  return (
    <motion.div
      className={cn("w-full relative group", className)}
      style={{ 
        willChange: 'abc', // Removing specific willChange to let framer handle layout
        backfaceVisibility: 'hidden', // Prevent flickering
        perspective: 1000 // Enable 3D acceleration
      }}
      initial={{ scale: 0.98, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ 
        type: "spring", 
        stiffness: 150,
        damping: 25,
        mass: 0.4
      }}
      onMouseEnter={() => setShowInfo(true)}
      onMouseLeave={() => setShowInfo(false)}
      onClick={() => !rolling && setShowInfo(!showInfo)}
      onKeyDown={(e) => {
        if (!rolling && !canEdit && strategyProfile && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          setShowInfo(!showInfo);
        }
      }}
      tabIndex={!rolling && !canEdit && strategyProfile ? 0 : undefined}
      role={!rolling && !canEdit && strategyProfile ? "button" : undefined}
      aria-label={!rolling && !canEdit && strategyProfile ? `View strategic intel for ${playerName}` : undefined}
      aria-expanded={!rolling && !canEdit && strategyProfile ? showInfo : undefined}
    >
      <Card className={getCardClasses(rolling, status, className)}>
        
        {/* Card Back (Face Down) */}
        {rolling && (
             <div className="absolute inset-0 z-50 bg-zinc-950 flex items-center justify-center">
                {/* Pattern */}
                <div className="absolute inset-0 opacity-10" style={{ 
                    backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(220,38,38,0.5) 1px, transparent 0)', 
                    backgroundSize: '20px 20px' 
                }} />
                
                {/* Center Logo/Icon */}
                <div className="relative z-10 w-24 h-24 border-4 border-red-900/30 rounded-full flex items-center justify-center bg-zinc-900/50 backdrop-blur-sm">
                    <div className="w-16 h-16 bg-red-600 rotate-45 rounded-xl shadow-[0_0_20px_rgba(220,38,38,0.4)]" />
                    <div className="absolute inset-0 flex items-center justify-center text-red-500 font-black text-3xl">V</div>
                </div>

                 {/* Decorations */}
                 <div className="absolute top-4 left-4 w-2 h-2 bg-red-500/50" />
                 <div className="absolute bottom-4 right-4 w-2 h-2 bg-red-500/50" />
                 <div className="absolute top-4 right-4 w-2 h-2 border border-red-500/30" />
                 <div className="absolute bottom-4 left-4 w-2 h-2 border border-red-500/30" />
             </div>
        )}

        {/* Background gradient based on agent color */}
        <div 
           className="absolute inset-0 opacity-20 transition-colors duration-300" 
           style={{ background: `linear-gradient(to bottom, ${displayAgent.color || '#333'}, transparent)` }}
        />

        {/* Status Indicator Badge */}
        {renderStatusBadge(status, canEdit || false, rolling)}
        {renderTierBadge(strategyProfile, rolling)}

        <CardHeader className="z-10 w-full text-center pb-2">
          {canEdit ? (
             renderEditControls(playerName, status, onStatusChange, mvpRole, onMvpRoleChange, onEditName, onClearName)
          ) : (
             <CardTitle className={cn("text-xl font-bold text-white uppercase tracking-wider")}>
               {playerName}
             </CardTitle>
          )}
        </CardHeader>

        <CardContent className="z-10 flex flex-col items-center justify-center flex-1 w-full gap-4 relative overflow-hidden">
          <AnimatePresence>
            {showInfo && strategyProfile && !rolling && !canEdit ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute inset-0 bg-zinc-950/90 backdrop-blur-md p-4 flex flex-col items-center justify-center text-center gap-3 z-30"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Info className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-bold uppercase text-red-400">Strategic Intel</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed max-w-[90%]">
                  {strategyProfile.strategicReasoning}
                </p>
                {strategyProfile.keyInteractions && strategyProfile.keyInteractions.length > 0 && (
                  <div className="w-full mt-2">
                    <p className="text-[10px] uppercase font-bold text-zinc-500 mb-1">Key Combos & Synergies</p>
                    <ul className="text-[10px] text-zinc-400 space-y-1">
                      {strategyProfile.keyInteractions.map((int, i) => (
                        <li key={`${int}-${i}`} className="flex items-center justify-center gap-1">
                          <span className="w-1 h-1 bg-red-500 rounded-full" />
                          {int}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="relative w-32 h-32 md:w-40 md:h-40 flex items-center justify-center">
              
                {!rolling && agent && (
                   <div className="animate-flip-in w-full h-full relative">
                     <LazyImage
                       src={agent.image} 
                       alt={agent.name}
                       className="w-full h-full object-contain drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]"
                       placeholder="Loading..."
                     />
                     {/* Shine effect overlay */}
                     <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent opacity-0 animate-[shine_0.5s_ease-out_0.2s_forwards] pointer-events-none" />
                   </div>
                )}
                {!rolling && !agent && (
                    <div className="text-6xl text-zinc-700">?</div>
                )}
              </div>
            )}
          </AnimatePresence>
          
          <div className="flex flex-col items-center">
            <h2 className={cn("text-2xl font-black uppercase italic tracking-tighter", rolling ? "text-zinc-600 blur-sm" : "text-white")}>
               {agent ? agent.name : "???"}
            </h2>
            {agent && !rolling && (
               <div className="flex flex-col items-center gap-2 mt-2">
                 {/* Role with icon */}
                 <div className={cn("flex items-center gap-1", getRoleColor(agent.role))}>
                   {getRoleIcon(agent.role)}
                   <span className="text-xs uppercase tracking-widest border border-zinc-700 px-2 py-0.5 rounded-full bg-zinc-950/50">
                     {agent.role}
                   </span>
                 </div>
                 
                 {/* Stats */}
                 <div className="flex items-center gap-3 text-[10px] text-zinc-500 bg-zinc-950/30 px-2 py-1 rounded-full border border-white/5">
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
                   {strategyProfile && (
                     <div className="flex items-center gap-1 ml-1 pl-2 border-l border-zinc-700 text-zinc-300">
                        {getTrendIcon(strategyProfile.pickRateTrend)}
                        <span>{strategyProfile.pickRateTrend}</span>
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
