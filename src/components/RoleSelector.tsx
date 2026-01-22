import { Button } from "@/components/ui/button";
import { type Role } from "@/data/valorant";
import { Plus, Minus } from "lucide-react";

interface RoleSelectorProps {
  rolesCount: Record<Role, number>;
  setRolesCount: (newRoles: Record<Role, number>) => void;
  totalPlayers: number;
}

const ROLES: Role[] = ['Duelist', 'Controller', 'Initiator', 'Sentinel'];

export function RoleSelector({ rolesCount, setRolesCount, totalPlayers }: RoleSelectorProps) {
  const currentTotal = Object.values(rolesCount).reduce((a, b) => a + b, 0);

  const updateCount = (role: Role, delta: number) => {
    const newCount = rolesCount[role] + delta;
    if (newCount < 0) return;
    
    // Prevent adding if total exceeds players
    if (delta > 0 && currentTotal >= totalPlayers) return;

    setRolesCount({ ...rolesCount, [role]: newCount });
  };

  return (
    <div className="bg-zinc-900 border border-zinc-700 p-4 rounded-lg mb-8 max-w-2xl mx-auto shadow-xl">
      <div className="flex justify-between items-center mb-4 border-b border-zinc-800 pb-2">
         <h3 className="text-white font-bold uppercase tracking-wider">Team Composition</h3>
         <span className={`text-sm font-bold ${currentTotal === totalPlayers ? 'text-green-400' : 'text-yellow-500'}`}>
           {currentTotal} / {totalPlayers} Selected
         </span>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {ROLES.map((role) => (
          <div key={role} className="flex flex-col items-center bg-zinc-950 p-3 rounded border border-zinc-800">
             <span className="text-zinc-400 text-xs font-bold uppercase mb-2">{role}</span>
             <div className="flex items-center gap-3">
               <Button 
                 variant="outline" 
                 size="icon" 
                 className="h-8 w-8 rounded-full border-zinc-700 hover:bg-zinc-800 hover:text-white"
                 onClick={() => updateCount(role, -1)}
                 disabled={rolesCount[role] <= 0}
               >
                 <Minus className="h-3 w-3" />
               </Button>
               <span className="text-xl font-black text-white w-4 text-center">{rolesCount[role]}</span>
               <Button 
                 variant="outline" 
                 size="icon" 
                 className="h-8 w-8 rounded-full border-zinc-700 hover:bg-zinc-800 hover:text-white"
                 onClick={() => updateCount(role, 1)}
                 disabled={currentTotal >= totalPlayers}
               >
                 <Plus className="h-3 w-3" />
               </Button>
             </div>
          </div>
        ))}
      </div>
      {(currentTotal < totalPlayers) && (
        <p className="text-center text-xs text-zinc-500 mt-4 italic">
          * Remaining {totalPlayers - currentTotal} slots will be random roles.
        </p>
      )}
    </div>
  );
}
