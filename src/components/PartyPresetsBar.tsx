import { motion } from 'framer-motion';
import { Flame, ShieldAlert, Eye, Castle, Shuffle, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type Role } from '@/data/valorant';

export interface PartyPreset {
  id: string;
  name: string;
  shortName: string;
  description: string;
  icon: typeof Flame;
  color: string;
  badgeBg: string;
  roleRequirements?: Role[];
  isPureRandom?: boolean;
}

export const PARTY_PRESETS: PartyPreset[] = [
  {
    id: 'STANDARD',
    name: 'Tactical Standard',
    shortName: 'Standard',
    description: 'แผนมาตรฐานปกติ (สุ่มตามบทบาทและระบบ Meta)',
    icon: Sparkles,
    color: 'text-zinc-300',
    badgeBg: 'hover:border-zinc-500',
  },
  {
    id: 'FIVE_DUELISTS',
    name: 'Rush B (5 Duelists)',
    shortName: '5 Duelists',
    description: 'สายบุกแหลก ทุกคนเล่น Duelist วิ่งชนอย่างเดียว!',
    icon: Flame,
    color: 'text-red-400',
    badgeBg: 'hover:border-red-500',
    roleRequirements: ['Duelist', 'Duelist', 'Duelist', 'Duelist', 'Duelist'],
  },
  {
    id: 'FIVE_CONTROLLERS',
    name: 'Smokescreen (5 Controllers)',
    shortName: '5 Controllers',
    description: 'ควันท่วมแมพ บังมิดทั้งไซท์จนศัตรูหาไม่เจอ!',
    icon: ShieldAlert,
    color: 'text-blue-400',
    badgeBg: 'hover:border-blue-500',
    roleRequirements: ['Controller', 'Controller', 'Controller', 'Controller', 'Controller'],
  },
  {
    id: 'FIVE_SENTINELS',
    name: 'Fortress (5 Sentinels)',
    shortName: '5 Sentinels',
    description: 'ป้อมปราการเหล็ก ล็อคดาวน์ไซท์ด้วยกับดักและกำแพง!',
    icon: Castle,
    color: 'text-emerald-400',
    badgeBg: 'hover:border-emerald-500',
    roleRequirements: ['Sentinel', 'Sentinel', 'Sentinel', 'Sentinel', 'Sentinel'],
  },
  {
    id: 'FIVE_INITIATORS',
    name: 'Wallhack Squad (5 Initiators)',
    shortName: '5 Initiators',
    description: 'แก๊งโปรมอง สแกน แฟลช โดรน เปิดตำแหน่งตลอดทั้งเกม!',
    icon: Eye,
    color: 'text-yellow-400',
    badgeBg: 'hover:border-yellow-500',
    roleRequirements: ['Initiator', 'Initiator', 'Initiator', 'Initiator', 'Initiator'],
  },
  {
    id: 'PURE_CHAOS',
    name: 'Chaos Bravery (Unrestricted)',
    shortName: 'Chaos',
    description: 'ความโกลาหลแท้จริง สุ่มไร้ขีดจำกัดบทบาท วัดดวงล้วนๆ!',
    icon: Shuffle,
    color: 'text-purple-400',
    badgeBg: 'hover:border-purple-500',
    isPureRandom: true,
  },
];

interface PartyPresetsBarProps {
  readonly activePresetId: string;
  readonly onSelectPreset: (presetId: string) => void;
  readonly className?: string;
}

export function PartyPresetsBar({
  activePresetId,
  onSelectPreset,
  className,
}: PartyPresetsBarProps) {
  return (
    <div className={cn("w-full flex flex-col items-center gap-2", className)}>
      <div className="flex items-center gap-1.5 flex-wrap justify-center p-1.5 bg-zinc-950/80 backdrop-blur-md rounded-2xl border border-zinc-800 shadow-lg">
        <span className="text-[11px] font-black uppercase text-zinc-500 px-2 tracking-wider flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-red-500" /> Presets:
        </span>

        {PARTY_PRESETS.map((preset) => {
          const Icon = preset.icon;
          const isActive = activePresetId === preset.id;

          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelectPreset(preset.id)}
              title={`${preset.name}: ${preset.description}`}
              className={cn(
                "relative px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border select-none active:scale-95",
                isActive
                  ? "bg-zinc-800 text-white border-red-500/80 shadow-[0_0_12px_rgba(239,68,68,0.3)] ring-1 ring-red-500/40"
                  : cn("bg-zinc-900/60 text-zinc-400 border-zinc-800 hover:text-white hover:bg-zinc-800/80", preset.badgeBg)
              )}
            >
              <Icon className={cn("w-3.5 h-3.5", isActive ? "text-red-400" : preset.color)} />
              <span>{preset.shortName}</span>
              {isActive && (
                <motion.div
                  layoutId="activePresetIndicator"
                  className="w-1.5 h-1.5 rounded-full bg-red-500"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
