import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type EmojiReactionPayload } from '@/types/multiplayer';

const REACTION_EMOJIS = [
  { emoji: '🔥', label: 'เดือด' },
  { emoji: '💀', label: 'ขิต' },
  { emoji: '😱', label: 'ช็อก' },
  { emoji: '👑', label: 'แบก' },
  { emoji: '🤡', label: 'โบ้' },
];

interface FloatingParticle {
  id: string;
  emoji: string;
  senderName: string;
  xPercent: number;
  rotation: number;
}

interface FloatingEmojiReactionsProps {
  isInRoom: boolean;
  onSendEmoji: (emoji: string) => void;
  incomingReaction?: EmojiReactionPayload | null;
}

export function FloatingEmojiReactions({
  isInRoom,
  onSendEmoji,
  incomingReaction,
}: FloatingEmojiReactionsProps) {
  const [particles, setParticles] = useState<FloatingParticle[]>([]);
  const lastSentRef = useRef<number>(0);

  // Add a particle to screen
  const addParticle = useCallback((emoji: string, senderName: string, xPercent?: number) => {
    const id = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const actualX = xPercent ?? Math.floor(20 + Math.random() * 60);
    const rotation = Math.floor(-15 + Math.random() * 30);

    setParticles((prev) => {
      // Keep max 20 particles at once for silky 60fps performance
      const trimmed = prev.length >= 20 ? prev.slice(prev.length - 19) : prev;
      return [...trimmed, { id, emoji, senderName, xPercent: actualX, rotation }];
    });

    // Cleanup after animation completes
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => p.id !== id));
    }, 2400);
  }, []);

  // Listen to incoming remote reaction
  useEffect(() => {
    if (incomingReaction) {
      addParticle(
        incomingReaction.emoji,
        incomingReaction.senderName || 'เพื่อนในตี้',
        incomingReaction.xOffsetPercent
      );
    }
  }, [incomingReaction, addParticle]);

  // Handle click on emoji button
  const handleEmojiClick = (emoji: string) => {
    const now = Date.now();
    // Throttle click slightly (180ms) to prevent accidental double-tap freeze
    if (now - lastSentRef.current < 180) return;
    lastSentRef.current = now;

    onSendEmoji(emoji);
  };

  if (!isInRoom) return null;

  return (
    <>
      {/* Floating Particles Overlay (Fullscreen, Click-through) */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden select-none">
        <AnimatePresence>
          {particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{
                opacity: 0,
                scale: 0.4,
                y: 0,
                x: 0,
                rotate: p.rotation,
              }}
              animate={{
                opacity: [0, 1, 1, 0],
                scale: [0.4, 1.25, 1.1, 0.9],
                y: -360,
                x: [0, (p.rotation * 1.5), -(p.rotation * 1.5), 0],
                rotate: [p.rotation, -p.rotation, p.rotation],
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 2.3,
                ease: 'easeOut',
                times: [0, 0.15, 0.75, 1],
              }}
              style={{
                position: 'absolute',
                left: `${p.xPercent}%`,
                bottom: '100px',
              }}
              className="flex flex-col items-center pointer-events-none drop-shadow-2xl"
            >
              <span className="text-3xl sm:text-4xl leading-none filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.6)]">
                {p.emoji}
              </span>
              <span className="mt-1 text-[9px] font-black text-zinc-200 bg-zinc-950/80 px-2 py-0.5 rounded-full border border-white/15 backdrop-blur-md whitespace-nowrap shadow-md">
                {p.senderName}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Floating Reaction Bar (At bottom right of viewport) */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.3 }}
        className="fixed bottom-4 right-4 z-40 flex items-center gap-1 bg-zinc-900/90 border border-zinc-700/70 hover:border-cyan-500/50 backdrop-blur-md px-2.5 py-1.5 rounded-full shadow-2xl transition"
      >
        <span className="text-[10px] font-bold text-zinc-400 pl-1 pr-1 hidden sm:inline select-none uppercase tracking-wider">
          รีแอค
        </span>
        <div className="flex items-center gap-0.5 sm:gap-1">
          {REACTION_EMOJIS.map((item) => (
            <motion.button
              key={item.emoji}
              type="button"
              onClick={() => handleEmojiClick(item.emoji)}
              whileHover={{ scale: 1.3, y: -2 }}
              whileTap={{ scale: 0.8 }}
              title={item.label}
              className="w-8 h-8 rounded-full flex items-center justify-center text-lg hover:bg-white/10 active:bg-white/20 transition cursor-pointer select-none"
            >
              {item.emoji}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </>
  );
}
