import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AGENTS, type Agent, type Role } from '@/data/valorant';
import { X, Search, Check, Ban, Sparkles, Zap, Shield, Target, Users, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AgentBlacklistModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly blacklistedAgents: Set<string>;
  readonly onToggleAgent: (agentName: string) => void;
  readonly onResetBlacklist: () => void;
  readonly onSetBlacklist: (names: string[]) => void;
}

const ROLES: Role[] = ['Duelist', 'Controller', 'Initiator', 'Sentinel'];

const getRoleIcon = (role: Role) => {
  switch (role) {
    case 'Duelist': return <Zap className="h-3.5 w-3.5 text-red-400" />;
    case 'Controller': return <Shield className="h-3.5 w-3.5 text-blue-400" />;
    case 'Initiator': return <Target className="h-3.5 w-3.5 text-yellow-400" />;
    case 'Sentinel': return <Users className="h-3.5 w-3.5 text-green-400" />;
    default: return <Sparkles className="h-3.5 w-3.5" />;
  }
};

export function AgentBlacklistModal({
  isOpen,
  onClose,
  blacklistedAgents,
  onToggleAgent,
  onResetBlacklist,
  onSetBlacklist,
}: AgentBlacklistModalProps) {
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role | 'ALL'>('ALL');

  const filteredAgents = useMemo(() => {
    return AGENTS.filter(agent => {
      const matchSearch = agent.name.toLowerCase().includes(search.toLowerCase().trim());
      const matchRole = selectedRole === 'ALL' || agent.role === selectedRole;
      return matchSearch && matchRole;
    });
  }, [search, selectedRole]);

  const enabledCount = AGENTS.length - blacklistedAgents.size;

  const handleSelectAll = () => {
    onResetBlacklist();
  };

  const handleDeselectAll = () => {
    // Keep at least 5 agents so randomizer can function
    const firstFive = AGENTS.slice(0, 5).map(a => a.name);
    const blacklisted = AGENTS.filter(a => !firstFive.includes(a.name)).map(a => a.name);
    onSetBlacklist(blacklisted);
  };

  const handleToggleRoleGroup = (role: Role) => {
    const agentsInRole = AGENTS.filter(a => a.role === role);
    const allInRoleDisabled = agentsInRole.every(a => blacklistedAgents.has(a.name));

    if (allInRoleDisabled) {
      // Enable all in this role
      const nextBlacklist = new Set(blacklistedAgents);
      agentsInRole.forEach(a => nextBlacklist.delete(a.name));
      onSetBlacklist(Array.from(nextBlacklist));
    } else {
      // Disable all in this role
      const nextBlacklist = new Set(blacklistedAgents);
      agentsInRole.forEach(a => nextBlacklist.add(a.name));
      // Ensure at least 5 agents remaining
      const remaining = AGENTS.filter(a => !nextBlacklist.has(a.name));
      if (remaining.length < 5) {
        return; // Don't allow fewer than 5 active agents
      }
      onSetBlacklist(Array.from(nextBlacklist));
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="p-5 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-900/60">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-red-600/20 border border-red-500/30 text-red-400">
                  <Ban className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-2">
                    Agent Roster & Blacklist
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                      {enabledCount} / {AGENTS.length} Active
                    </span>
                  </h2>
                  <p className="text-xs text-zinc-400">
                    ปิดการสุ่มเอเจนต์ที่ยังไม่ได้ปลดล็อค หรือเอเจนต์ที่ทีมไม่ต้องการเล่น
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Quick Actions Bar */}
            <div className="p-4 border-b border-zinc-800/60 bg-zinc-900/30 flex flex-wrap gap-3 items-center justify-between">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input
                  type="text"
                  placeholder="ค้นหาชื่อเอเจนต์ (e.g. Miks, Jett, Omen)..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-zinc-900/90 border border-zinc-700/80 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 transition"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Role Filter Tabs */}
              <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800">
                <button
                  type="button"
                  onClick={() => setSelectedRole('ALL')}
                  className={cn(
                    "px-2.5 py-1 text-xs font-bold rounded-md transition",
                    selectedRole === 'ALL'
                      ? "bg-zinc-800 text-white shadow-sm"
                      : "text-zinc-400 hover:text-zinc-200"
                  )}
                >
                  ทั้งหมด ({AGENTS.length})
                </button>
                {ROLES.map((role) => {
                  const count = AGENTS.filter(a => a.role === role).length;
                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setSelectedRole(role)}
                      className={cn(
                        "px-2.5 py-1 text-xs font-bold rounded-md transition flex items-center gap-1",
                        selectedRole === role
                          ? "bg-zinc-800 text-white shadow-sm"
                          : "text-zinc-400 hover:text-zinc-200"
                      )}
                    >
                      {getRoleIcon(role)}
                      <span>{role}</span>
                      <span className="text-[10px] text-zinc-500">({count})</span>
                    </button>
                  );
                })}
              </div>

              {/* Reset / Select All / Role Group Actions */}
              <div className="flex items-center gap-2">
                {selectedRole !== 'ALL' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggleRoleGroup(selectedRole)}
                    className="text-xs h-8 border-zinc-700 hover:bg-zinc-800 text-zinc-300"
                  >
                    สลับทั้งสาย {selectedRole}
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSelectAll}
                  className="text-xs h-8 border-zinc-700 hover:bg-zinc-800 text-zinc-300"
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-1" />
                  เปิดทั้งหมด
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDeselectAll}
                  className="text-xs h-8 border-zinc-700 hover:bg-zinc-800 text-zinc-400"
                  title="ปิดเกือบหมด เหลือ 5 ตัวแรกสำหรับสุ่ม"
                >
                  เหลือ 5 ตัว
                </Button>
              </div>
            </div>

            {/* Agent Grid */}
            <div className="p-5 overflow-y-auto flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {filteredAgents.map((agent: Agent) => {
                const isBlacklisted = blacklistedAgents.has(agent.name);
                const isEnabled = !isBlacklisted;

                return (
                  <motion.div
                    key={agent.name}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onToggleAgent(agent.name)}
                    className={cn(
                      "relative rounded-xl border p-2.5 flex flex-col items-center justify-between cursor-pointer transition-all duration-200 select-none group",
                      isEnabled
                        ? "bg-zinc-900/80 border-zinc-700/80 hover:border-red-500/80 shadow-md"
                        : "bg-zinc-950/60 border-zinc-800/40 opacity-40 grayscale hover:opacity-70"
                    )}
                  >
                    {/* Toggle check badge */}
                    <div
                      className={cn(
                        "absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-xs transition-all",
                        isEnabled
                          ? "bg-emerald-500 text-black shadow-sm shadow-emerald-500/50"
                          : "bg-zinc-800 text-zinc-500 border border-zinc-700"
                      )}
                    >
                      {isEnabled ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <X className="w-3.5 h-3.5" />}
                    </div>

                    {/* Agent Avatar */}
                    <div className="w-16 h-16 my-1 flex items-center justify-center relative">
                      <img
                        src={agent.image}
                        alt={agent.name}
                        className="w-full h-full object-contain drop-shadow-md"
                        loading="lazy"
                      />
                    </div>

                    {/* Agent Name & Role */}
                    <div className="text-center w-full mt-1">
                      <p className="font-black text-sm text-white uppercase tracking-tight group-hover:text-red-400 transition">
                        {agent.name}
                      </p>
                      <div className="flex items-center justify-center gap-1 mt-0.5">
                        {getRoleIcon(agent.role)}
                        <span className="text-[10px] text-zinc-400 font-medium">
                          {agent.role}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-zinc-800/80 bg-zinc-900/60 flex items-center justify-between">
              <span className="text-xs text-zinc-400">
                {enabledCount < 5 ? (
                  <span className="text-red-400 font-bold">
                    ⚠️ ต้องเปิดเอเจนต์อย่างน้อย 5 ตัวเพื่อเริ่มการสุ่ม!
                  </span>
                ) : (
                  <span>พร้อมสุ่มจาก {enabledCount} ตัวละครที่เลือก</span>
                )}
              </span>
              <Button
                onClick={onClose}
                className="bg-red-600 hover:bg-red-500 text-white font-bold px-6"
              >
                บันทึก & ปิด (Done)
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
