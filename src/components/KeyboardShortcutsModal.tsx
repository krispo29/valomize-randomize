import { motion, AnimatePresence } from 'framer-motion';
import { Keyboard, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface KeyboardShortcutsModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

interface ShortcutItem {
  keys: string[];
  action: string;
  description: string;
}

const SHORTCUTS: ShortcutItem[] = [
  { keys: ['Space', 'Enter'], action: 'Roll / Next Agent', description: 'เริ่มสุ่มตัวละคร หรือเปิดการ์ดใบถัดไปทันที' },
  { keys: ['R'], action: 'Re-roll Roster', description: 'สุ่มใหม่ทั้งทีม (ไม่เปลี่ยนตัวที่กดล็อคไว้)' },
  { keys: ['T'], action: 'Toggle Turbo Mode', description: 'เปิด/ปิดโหมดเทอร์โบ (สุ่มเสร็จใน 0.1 วินาที ไม่ต้องรออนิเมชั่น)' },
  { keys: ['C'], action: 'Copy In-Game Chat', description: 'คัดลอกรายชื่อส่งแชท Valorant ทันที ([VALOMIZE] Map > P1 (Agent)...)' },
  { keys: ['M'], action: 'Map Selector', description: 'เปิด/ปิดหน้าต่างเลือกแผนที่ (Map Selector)' },
  { keys: ['S'], action: 'Stats Dashboard', description: 'เปิด/ปิดหน้าสถิติทีม และประวัติการเล่น' },
  { keys: ['B'], action: 'Agent Blacklist', description: 'เปิดหน้าตัดตัวละครที่ยังไม่ปลดล็อค / แบนตัวละคร' },
  { keys: ['Esc'], action: 'Close Modal', description: 'ปิดหน้าต่างป๊อปอัพหรือหน้าต่างผลลัพธ์ที่เปิดอยู่' },
  { keys: ['?'], action: 'Shortcuts Guide', description: 'เปิดคู่มือคีย์ลัดนี้' },
];

export function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-red-600/20 border border-red-500/30 text-red-400">
                  <Keyboard className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white uppercase tracking-wider">
                    Keyboard Shortcuts
                  </h2>
                  <p className="text-xs text-zinc-400">
                    ควบคุม Valomize ได้รวดเร็วระดับ Pro Gamer โดยไม่ต้องจับเมาส์
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

            {/* List */}
            <div className="p-5 space-y-2.5 max-h-[60vh] overflow-y-auto">
              {SHORTCUTS.map((item) => (
                <div
                  key={item.action}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/40 border border-zinc-850 hover:border-zinc-700 transition"
                >
                  <div className="flex flex-col pr-4">
                    <span className="text-sm font-bold text-white tracking-wide">{item.action}</span>
                    <span className="text-xs text-zinc-400">{item.description}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {item.keys.map((k) => (
                      <kbd
                        key={k}
                        className="px-2.5 py-1 bg-zinc-800 text-zinc-200 border border-zinc-700 rounded-md text-xs font-mono font-bold shadow-sm"
                      >
                        {k}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-zinc-800 bg-zinc-900/40 flex justify-end">
              <Button onClick={onClose} className="bg-red-600 hover:bg-red-500 text-white font-bold px-6">
                เข้าใจแล้ว (Close)
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
