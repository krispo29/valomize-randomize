import { AnimatePresence, motion } from 'framer-motion';
import { type RoomActivityItem } from '@/types/multiplayer';

interface RoomActivityTickerProps {
  readonly activities: RoomActivityItem[];
}

export function RoomActivityTicker({ activities }: RoomActivityTickerProps) {
  if (activities.length === 0) return null;

  return (
    <div className="fixed bottom-20 left-4 z-40 flex flex-col gap-1.5 pointer-events-none max-w-xs sm:max-w-sm">
      <AnimatePresence>
        {activities.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 15, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.85 }}
            transition={{ duration: 0.25 }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-950/90 border border-zinc-700/80 text-zinc-200 text-xs font-medium shadow-xl backdrop-blur-md select-none"
          >
            {item.icon && <span className="text-sm shrink-0">{item.icon}</span>}
            <span className="truncate">{item.text}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
