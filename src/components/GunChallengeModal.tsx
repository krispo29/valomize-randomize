import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dices, X, Copy, Check, ShieldAlert } from 'lucide-react';
import { Button } from './ui/button';

interface GunChallenge {
  id: string;
  name: string;
  category: 'Pistol' | 'Eco / Half' | 'Full Buy' | 'Hardcore Meme';
  weapon: string;
  rule: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Radiant Level';
  color: string;
}

const CHALLENGES: GunChallenge[] = [
  {
    id: 'sheriff_gods',
    name: 'Sheriff One-Tap Gods',
    category: 'Pistol',
    weapon: 'Sheriff Only',
    rule: 'ห้ามซื้อปืนหลัก อนุญาตแค่ Sheriff + สกิลเท่านั้น',
    description: 'ฝึกความคมของ Crosshair Placement ยิงแต่หัวล้วนๆ',
    difficulty: 'Medium',
    color: 'text-amber-400',
  },
  {
    id: 'shotgun_rats',
    name: 'Bucky / Judge Sewer Rats',
    category: 'Eco / Half',
    weapon: 'Bucky หรือ Judge',
    rule: 'ห้ามยิงระยะไกล ต้องเล่นมุมชิดหรือดักในควันเท่านั้น',
    description: 'แอบในมุมอับหรือกลางควันแล้วยิงระยะเผาขน 1 นัดดับ',
    difficulty: 'Easy',
    color: 'text-emerald-400',
  },
  {
    id: 'sniper_alley',
    name: 'Marshal & Outlaw Quick-Scope',
    category: 'Eco / Half',
    weapon: 'Marshal หรือ Outlaw',
    rule: 'สไนเปอร์สายซิ่ง ห้ามซื้อ Vandal/Phantom',
    description: 'เน้นยิงเปิดมุมจากระยะไกล หรือแท็กตัวให้เพื่อนซ้ำ',
    difficulty: 'Medium',
    color: 'text-cyan-400',
  },
  {
    id: 'stinger_smg_rush',
    name: 'Stinger Run & Gun Madness',
    category: 'Eco / Half',
    weapon: 'Stinger Only',
    rule: 'วิ่งยิงอย่างเดียว ห้ามหยุดเดินเวลายิง',
    description: 'ใช้ความเร็วของ Stinger วิ่งสาดกระสุนระยะประชิด',
    difficulty: 'Medium',
    color: 'text-purple-400',
  },
  {
    id: 'no_shield_glass_cannon',
    name: 'Glass Cannon (ห้ามซื้อเกราะ)',
    category: 'Full Buy',
    weapon: 'Vandal หรือ Phantom',
    rule: 'ซื้อปืนแพงได้ แต่ห้ามซื้อเกราะเด็ดขาด (HP 100 ล้วน)',
    description: 'ยิงแรงแต่ห้ามโดนยิงแม้แต่นัดเดียว สมาธิขั้นสูงสุด',
    difficulty: 'Radiant Level',
    color: 'text-rose-400',
  },
  {
    id: 'odin_wallbang_orchestra',
    name: 'Odin Wallbang Symphony',
    category: 'Full Buy',
    weapon: 'Odin หรือ Ares',
    rule: 'ทุกคนต้องซื้อปืนกลหนัก สแปมทะลุกำแพงตลอดทั้งรอบ',
    description: 'ยิงเจาะทุกกล่องและประตูกระจายเสียงสนั่นทั้งแมพ',
    difficulty: 'Easy',
    color: 'text-red-400',
  },
  {
    id: 'guardian_one_tappers',
    name: 'Guardian Discipline Squad',
    category: 'Full Buy',
    weapon: 'Guardian Only',
    rule: 'ห้ามสเปรย์ ยิงทีละนัดเล็งหัว 100% เท่านั้น',
    description: 'สร้างวินัยการยิงระดับโปรทีม ไม่มีการเสี่ยงดวงกระสุนส่วย',
    difficulty: 'Medium',
    color: 'text-blue-400',
  },
  {
    id: 'no_shift_silent_ban',
    name: 'Speed Demons (ห้ามกด Shift)',
    category: 'Hardcore Meme',
    weapon: 'ปืนอะไรก็ได้',
    rule: 'ห้ามเดินย่อง (Shift) เด็ดขาด วิ่งเสียงดังเปิดเผยตลอดรอบ',
    description: 'ประกาศตำแหน่งให้ศัตรูรู้ล่วงหน้าแล้ววัดความคมตอนปะทะ',
    difficulty: 'Radiant Level',
    color: 'text-pink-400',
  },
];

interface GunChallengeModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onPlaySound?: () => void;
}

export function GunChallengeModal({
  isOpen,
  onClose,
  onPlaySound,
}: GunChallengeModalProps) {
  const [selectedChallenge, setSelectedChallenge] = useState<GunChallenge>(CHALLENGES[0]);
  const [copied, setCopied] = useState(false);

  const handleRollRandom = () => {
    onPlaySound?.();
    const other = CHALLENGES.filter(c => c.id !== selectedChallenge.id);
    const pick = other[Math.floor(Math.random() * other.length)];
    setSelectedChallenge(pick);
  };

  const handleCopy = () => {
    onPlaySound?.();
    const text = `[VALOMIZE CHALLENGE] 🔫 ${selectedChallenge.name} | อาวุธ: ${selectedChallenge.weapon} | กติกา: ${selectedChallenge.rule}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-5 border-b border-zinc-800 bg-zinc-900/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400">
                  <Dices className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-2">
                    Eco & Weapon Challenge
                  </h2>
                  <p className="text-xs text-zinc-400">
                    สุ่มกติกาซื้อปืนและแผนการเงินสุดท้าทายสำหรับซ้อมและทำคอนเทนต์
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

            {/* Main Challenge Card */}
            <div className="p-6 flex flex-col items-center text-center space-y-4">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-zinc-900 border border-zinc-700 text-zinc-300">
                  {selectedChallenge.category}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-red-950/60 border border-red-500/40 text-red-400">
                  ระดับ: {selectedChallenge.difficulty}
                </span>
              </div>

              <h3 className={`text-2xl md:text-3xl font-black uppercase tracking-tight ${selectedChallenge.color}`}>
                {selectedChallenge.name}
              </h3>

              <div className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 space-y-2 text-left">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase text-zinc-400">อาวุธที่ใช้:</span>
                  <span className="text-sm font-black text-white">{selectedChallenge.weapon}</span>
                </div>
                <div className="flex items-start gap-2">
                  <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-zinc-300 leading-relaxed font-semibold">
                    {selectedChallenge.rule}
                  </p>
                </div>
                <p className="text-[11px] text-zinc-500 pt-1 border-t border-zinc-800">
                  💡 {selectedChallenge.description}
                </p>
              </div>

              {/* Actions */}
              <div className="w-full flex items-center justify-center gap-3 pt-2">
                <Button
                  onClick={handleRollRandom}
                  className="bg-amber-600 hover:bg-amber-500 text-white font-black px-6 py-2.5 flex items-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95"
                >
                  <Dices className="h-4 w-4" /> สุ่มกติกาใหม่ (Roll)
                </Button>

                <Button
                  variant="outline"
                  onClick={handleCopy}
                  className="border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-white font-bold px-4 py-2.5 flex items-center gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-400" /> คัดลอกแล้ว!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 text-zinc-400" /> ส่งเข้าแชทเกม
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Quick Challenge List */}
            <div className="p-4 border-t border-zinc-800 bg-zinc-900/40">
              <span className="text-[10px] uppercase font-bold text-zinc-500 mb-2 block">
                หรือเลือกกติกาจากลิสต์:
              </span>
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {CHALLENGES.map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      onPlaySound?.();
                      setSelectedChallenge(c);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap border transition ${
                      selectedChallenge.id === c.id
                        ? 'bg-zinc-800 border-amber-500 text-white'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
