import { Button } from "@/components/ui/button";
import { type ValorantMap, MAPS, MAP_META_AGENTS, MAP_IMAGES, AGENTS } from "@/data/valorant";
import { MapPin, Users, Shield, Sword, Target } from "lucide-react";

interface MapSelectorProps {
  readonly selectedMap: ValorantMap | null;
  readonly onSelectMap: (map: ValorantMap | null) => void;
}

export function MapSelector({ selectedMap, onSelectMap }: MapSelectorProps) {
  return (
    <div className="bg-zinc-900 border border-zinc-700 p-4 rounded-lg mb-8 max-w-4xl mx-auto shadow-xl">
      <div className="flex items-center gap-2 mb-4 border-b border-zinc-800 pb-2">
         <MapPin className="h-5 w-5 text-red-500" />
         <h3 className="text-white font-bold uppercase tracking-wider">Select Map Meta</h3>
         {selectedMap && (
           <Button 
             variant="ghost" 
             size="sm" 
             onClick={() => onSelectMap(null)}
             className="ml-auto text-xs text-zinc-400 hover:text-white h-7"
           >
             Clear Selection
           </Button>
         )}
      </div>
      
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
            {/* Map Preview Image */}
            <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity">
              <img 
                src={MAP_IMAGES[mapName]} 
                alt={mapName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to gradient if image fails to load
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            
            {/* Map Name */}
            <span className="relative z-10">{mapName}</span>
            
            {/* Selected Indicator */}
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
        <div className="mt-6 p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
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
    </div>
  );
}
