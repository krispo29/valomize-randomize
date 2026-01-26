import { Button } from "@/components/ui/button";
import { type ValorantMap, MAPS, MAP_META_AGENTS, MAP_IMAGES, AGENTS } from "@/data/valorant";
import { valorantMeta2026 } from '@/data/meta';
import { MapPin, Users, Shield, Sword, Target, ChevronDown, ChevronUp } from "lucide-react";

// Helper to get tier color
const getTierColor = (tier: string) => {
  switch(tier) {
    case 'S': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
    case 'A': return 'text-green-400 bg-green-400/10 border-green-400/20';
    case 'B': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
    default: return 'text-zinc-500 bg-zinc-800 border-zinc-700';
  }
};

interface MapSelectorProps {
  readonly selectedMap: ValorantMap | null;
  readonly onSelectMap: (map: ValorantMap | null) => void;
  readonly isExpanded: boolean;
  readonly onToggleExpand: () => void;
}

export function MapSelector({ selectedMap, onSelectMap, isExpanded, onToggleExpand }: MapSelectorProps) {
  return (
    <div className="bg-zinc-900 border border-zinc-700 p-4 rounded-lg mb-8 max-w-4xl mx-auto shadow-xl transition-all duration-300">
      <div className="flex items-center gap-2 mb-4 border-b border-zinc-800 pb-2">
         <MapPin className="h-5 w-5 text-red-500" />
         <h3 className="text-white font-bold uppercase tracking-wider">Select Map Meta</h3>
         
         <div className="ml-auto flex items-center gap-2">
           {selectedMap && (
             <Button 
               variant="ghost" 
               size="sm" 
               onClick={() => onSelectMap(null)}
               className="text-xs text-zinc-400 hover:text-white h-7"
             >
               Clear Selection
             </Button>
           )}
           <Button
             variant="ghost"
             size="sm"
             onClick={onToggleExpand}
             className="h-7 w-7 p-0 text-zinc-400 hover:text-white"
             aria-label={isExpanded ? "Hide map selector" : "Show map selector"}
           >
             {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
           </Button>
         </div>
      </div>
      
      {isExpanded ? (
        <>
          <div className="flex flex-wrap justify-center gap-2">
            {MAPS.map((mapName) => (
              <button
                key={mapName}
                onClick={() => onSelectMap(selectedMap === mapName ? null : mapName)}
                className={`
                  relative group px-4 py-2 rounded-sm text-sm font-bold uppercase tracking-widest transition-all overflow-hidden
                  ${selectedMap === mapName 
                    ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)] border-red-500' 
                    : 'bg-zinc-950 text-zinc-500 border border-zinc-800 hover:border-zinc-600 hover:text-zinc-300'}
                `}
                aria-label={`Select ${mapName} map${selectedMap === mapName ? ' (selected)' : ''}`}
                aria-pressed={selectedMap === mapName}
              >
                <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity">
                  <img 
                    src={MAP_IMAGES[mapName]} 
                    alt={mapName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
                <span className="relative z-10">{mapName}</span>
                {selectedMap === mapName && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-zinc-900"></div>
                )}
              </button>
            ))}
          </div>
          
          {!selectedMap && (
            <p className="text-center text-[10px] text-zinc-600 mt-4 uppercase tracking-[0.2em]">
              All agents available
            </p>
          )}

          {selectedMap && (
            <div className="mt-6 p-4 bg-zinc-800/50 rounded-lg border border-zinc-700 animate-in fade-in zoom-in-95 duration-200">
              <h4 className="text-sm font-bold text-red-400 uppercase tracking-wider mb-4">
                Meta Agents for {selectedMap}
              </h4>
              
              <div className="space-y-4">
                {/* Duelists */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Sword className="h-4 w-4 text-red-400" />
                    <h5 className="text-xs font-bold text-red-400 uppercase tracking-wider">Duelists</h5>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {MAP_META_AGENTS[selectedMap].duelists.map((agentName) => {
                      const agent = AGENTS.find(a => a.name === agentName);
                      const profile = valorantMeta2026
                        .find(m => m.mapName === selectedMap)
                        ?.roleComposition?.['Duelist']
                        ?.find(p => p.name === agentName);
                      
                      return (
                        <div
                          key={agentName}
                          className="flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-600 rounded-sm"
                          style={{ borderColor: agent?.color || '#666' }}
                        >
                          <div 
                            className="w-4 h-4 rounded-full border border-zinc-500"
                            style={{ backgroundColor: agent?.color || '#666' }}
                          />
                          <span className="text-xs font-medium text-zinc-200">
                            {agentName}
                          </span>
                          {profile && (
                             <span className={`text-[9px] px-1 rounded border font-bold ${getTierColor(profile.tier)}`}>
                               {profile.tier}
                             </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Controllers */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-4 w-4 text-purple-400" />
                    <h5 className="text-xs font-bold text-purple-400 uppercase tracking-wider">Controllers</h5>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {MAP_META_AGENTS[selectedMap].controllers.map((agentName) => {
                      const agent = AGENTS.find(a => a.name === agentName);
                      const profile = valorantMeta2026
                        .find(m => m.mapName === selectedMap)
                        ?.roleComposition?.['Controller']
                        ?.find(p => p.name === agentName);

                      return (
                        <div
                          key={agentName}
                          className="flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-600 rounded-sm"
                          style={{ borderColor: agent?.color || '#666' }}
                        >
                          <div 
                            className="w-4 h-4 rounded-full border border-zinc-500"
                            style={{ backgroundColor: agent?.color || '#666' }}
                          />
                          <span className="text-xs font-medium text-zinc-200">
                            {agentName}
                          </span>
                          {profile && (
                             <span className={`text-[9px] px-1 rounded border font-bold ${getTierColor(profile.tier)}`}>
                               {profile.tier}
                             </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Initiators */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-4 w-4 text-green-400" />
                    <h5 className="text-xs font-bold text-green-400 uppercase tracking-wider">Initiators</h5>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {MAP_META_AGENTS[selectedMap].initiators.map((agentName) => {
                      const agent = AGENTS.find(a => a.name === agentName);
                      const profile = valorantMeta2026
                        .find(m => m.mapName === selectedMap)
                        ?.roleComposition?.['Initiator']
                        ?.find(p => p.name === agentName);

                      return (
                        <div
                          key={agentName}
                          className="flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-600 rounded-sm"
                          style={{ borderColor: agent?.color || '#666' }}
                        >
                          <div 
                            className="w-4 h-4 rounded-full border border-zinc-500"
                            style={{ backgroundColor: agent?.color || '#666' }}
                          />
                          <span className="text-xs font-medium text-zinc-200">
                            {agentName}
                          </span>
                          {profile && (
                             <span className={`text-[9px] px-1 rounded border font-bold ${getTierColor(profile.tier)}`}>
                               {profile.tier}
                             </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Sentinels */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4 text-yellow-400" />
                    <h5 className="text-xs font-bold text-yellow-400 uppercase tracking-wider">Sentinels</h5>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {MAP_META_AGENTS[selectedMap].sentinels.map((agentName) => {
                      const agent = AGENTS.find(a => a.name === agentName);
                      const profile = valorantMeta2026
                        .find(m => m.mapName === selectedMap)
                        ?.roleComposition?.['Sentinel']
                        ?.find(p => p.name === agentName);

                      return (
                        <div
                          key={agentName}
                          className="flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-600 rounded-sm"
                          style={{ borderColor: agent?.color || '#666' }}
                        >
                          <div 
                            className="w-4 h-4 rounded-full border border-zinc-500"
                            style={{ backgroundColor: agent?.color || '#666' }}
                          />
                          <span className="text-xs font-medium text-zinc-200">
                            {agentName}
                          </span>
                          {profile && (
                             <span className={`text-[9px] px-1 rounded border font-bold ${getTierColor(profile.tier)}`}>
                               {profile.tier}
                             </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              
              <p className="text-[9px] text-zinc-500 mt-4 uppercase tracking-[0.1em]">
                These agents will be prioritized during randomization
              </p>
            </div>
          )}
        </>
      ) : (
        selectedMap && (
           <div className="flex justify-center items-center py-2 animate-in fade-in zoom-in-95 duration-200">
              <div className="relative group px-6 py-3 rounded-md overflow-hidden border border-red-500 bg-red-950/20">
                 <div className="absolute inset-0 opacity-40">
                    <img 
                      src={MAP_IMAGES[selectedMap]} 
                      alt={selectedMap}
                      className="w-full h-full object-cover"
                    />
                 </div>
                 <div className="relative z-10 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-red-400" />
                    <span className="text-lg font-black uppercase tracking-widest text-white drop-shadow-md">
                      {selectedMap} Selected
                    </span>
                 </div>
              </div>
           </div>
        )
      )}
    </div>
  );
}
