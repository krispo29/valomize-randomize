import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Clock, Sparkles, UserCheck, ShieldAlert } from 'lucide-react';
import { Button } from './ui/button';
import { type RoomMember } from '@/types/multiplayer';
import { type ActiveReadyCheck } from '@/hooks/useMultiplayerRoom';

interface ReadyCheckModalProps {
  show: boolean;
  activeReadyCheck: ActiveReadyCheck | null;
  members: RoomMember[];
  isHost: boolean;
  onRespond: (isReady: boolean) => void;
  onCancel: () => void;
  onClose: () => void;
  onRollNow?: () => void;
}

export function ReadyCheckModal({
  show,
  activeReadyCheck,
  members,
  isHost,
  onRespond,
  onCancel,
  onClose,
  onRollNow,
}: ReadyCheckModalProps) {
  const [timeLeft, setTimeLeft] = useState<number>(15);
  const audioPlayedRef = useRef<boolean>(false);

  // Play a gentle alert tone when ready check starts
  useEffect(() => {
    if (show && !audioPlayedRef.current) {
      audioPlayedRef.current = true;
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12); // A5
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } catch {
        // ignore audio errors
      }
    }
    if (!show) {
      audioPlayedRef.current = false;
    }
  }, [show]);

  // Countdown timer
  useEffect(() => {
    if (!show || !activeReadyCheck) return;

    const calculateRemaining = () => {
      const elapsed = Math.floor((Date.now() - activeReadyCheck.startedAt) / 1000);
      const remaining = Math.max(0, activeReadyCheck.durationSeconds - elapsed);
      setTimeLeft(remaining);
      if (remaining <= 0 && !activeReadyCheck.isComplete) {
        // Auto-close after timeout
        setTimeout(onClose, 2500);
      }
    };

    calculateRemaining();
    const interval = setInterval(calculateRemaining, 250);
    return () => clearInterval(interval);
  }, [show, activeReadyCheck, onClose]);

  // Active playing members (Slot 0-4 or unslotted if not bench)
  const activePlayers = useMemo(() => {
    return members.filter((m) => m.slotIndex !== -1);
  }, [members]);

  const readyMemberIds = activeReadyCheck?.readyMemberIds || new Set<string>();

  // Check if self is ready
  const isSelfReady = useMemo(() => {
    const self = members.find((m) => m.isSelf);
    if (!self) return false;
    const cleanSessionId = self.id.split('_').slice(1).join('_');
    return readyMemberIds.has(cleanSessionId) || readyMemberIds.has(self.id);
  }, [members, readyMemberIds]);

  // Check if all active players are ready
  const readyCount = useMemo(() => {
    return activePlayers.filter((m) => {
      const cleanSessionId = m.id.split('_').slice(1).join('_');
      return readyMemberIds.has(cleanSessionId) || readyMemberIds.has(m.id);
    }).length;
  }, [activePlayers, readyMemberIds]);

  const isAllReady = activePlayers.length > 0 && readyCount >= activePlayers.length;

  if (!show || !activeReadyCheck) return null;

  const progressPercent = Math.max(
    0,
    Math.min(100, (timeLeft / (activeReadyCheck.durationSeconds || 15)) * 100)
  );

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden relative"
        >
          {/* Top Progress Countdown Bar */}
          <div className="w-full bg-zinc-900 h-1.5 relative overflow-hidden">
            <motion.div
              style={{ width: `${progressPercent}%` }}
              className={`h-full transition-all duration-300 ${
                isAllReady
                  ? 'bg-emerald-500'
                  : timeLeft < 5
                  ? 'bg-rose-500'
                  : 'bg-cyan-500'
              }`}
            />
          </div>

          <div className="p-5 sm:p-6 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className={`p-2 rounded-xl border ${
                    isAllReady
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                      : 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
                  }`}
                >
                  {isAllReady ? (
                    <Sparkles className="w-5 h-5 animate-spin-slow" />
                  ) : (
                    <Clock className="w-5 h-5 animate-pulse" />
                  )}
                </div>
                <div>
                  <h3 className="font-black text-white text-base sm:text-lg uppercase tracking-wider flex items-center gap-2">
                    {isAllReady ? 'ตี้พร้อมครบทุกคนแล้ว!' : 'READY CHECK'}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    {activeReadyCheck.initiatedBy} ส่งสัญญาณเช็กความพร้อมตี้
                  </p>
                </div>
              </div>

              {/* Countdown Badge */}
              <div
                className={`px-3 py-1 rounded-full text-xs font-black font-mono border ${
                  isAllReady
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
                    : timeLeft < 5
                    ? 'bg-rose-950/80 text-rose-300 border-rose-500/50 animate-pulse'
                    : 'bg-zinc-900 text-cyan-400 border-zinc-700'
                }`}
              >
                {timeLeft}s
              </div>
            </div>

            {/* Member Readiness List */}
            <div className="space-y-2 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/80 max-h-56 overflow-y-auto">
              <div className="flex items-center justify-between text-[11px] font-bold text-zinc-400 px-1">
                <span>สมาชิกในตี้ ({activePlayers.length} คน)</span>
                <span className={isAllReady ? 'text-emerald-400' : 'text-cyan-400'}>
                  พร้อมแล้ว {readyCount}/{activePlayers.length}
                </span>
              </div>

              {activePlayers.map((member) => {
                const cleanSessionId = member.id.split('_').slice(1).join('_');
                const isReady =
                  readyMemberIds.has(cleanSessionId) || readyMemberIds.has(member.id);

                return (
                  <div
                    key={member.id}
                    className={`flex items-center justify-between p-2 rounded-lg border transition ${
                      isReady
                        ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                        : 'bg-zinc-950/70 border-zinc-800 text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                          isReady
                            ? 'bg-emerald-500 text-zinc-950'
                            : 'bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {member.playerName ? member.playerName.charAt(0).toUpperCase() : '?'}
                      </div>
                      <span className="text-xs font-bold truncate">
                        {member.playerName}
                        {member.isSelf && <span className="text-zinc-500 font-normal ml-1">(คุณ)</span>}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Alt-Tab Indicator */}
                      {member.isAway ? (
                        <span
                          className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1"
                          title="ผู้เล่นพับหน้าจอ หรือเปิดแท็บอื่นอยู่"
                        >
                          <ShieldAlert className="w-3 h-3 text-amber-400" /> พับจอ
                        </span>
                      ) : null}

                      {/* Ready Badge */}
                      {isReady ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" /> พร้อมแล้ว
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-800 text-zinc-400 border border-zinc-700 animate-pulse">
                          รอดยืนยัน...
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              {/* Ready Toggle for Guest / Self */}
              {!isSelfReady ? (
                <Button
                  onClick={() => onRespond(true)}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black py-3 text-sm uppercase tracking-wider shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                >
                  <UserCheck className="w-5 h-5" /> ผมพร้อมแล้ว! (I AM READY)
                </Button>
              ) : isAllReady && isHost && onRollNow ? (
                <Button
                  onClick={onRollNow}
                  className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black py-3 text-sm uppercase tracking-wider shadow-lg shadow-red-500/30 flex items-center justify-center gap-2 animate-bounce-subtle"
                >
                  <Sparkles className="w-5 h-5" /> ทุกคนพร้อมแล้ว — สุ่มตัวละครเลย!
                </Button>
              ) : (
                <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-center">
                  <span className="text-xs font-bold text-emerald-300 flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> คุณกดยืนยันพร้อมแล้ว กำลังรอเพื่อนที่เหลือ...
                  </span>
                </div>
              )}

              {/* Host Cancel or Dismiss Button */}
              {isHost ? (
                <button
                  type="button"
                  onClick={onCancel}
                  className="w-full py-1.5 text-xs text-zinc-500 hover:text-zinc-300 font-bold transition text-center"
                >
                  ยกเลิกการเช็กความพร้อม (Cancel)
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-1.5 text-xs text-zinc-500 hover:text-zinc-300 font-bold transition text-center"
                >
                  ปิดหน้าต่างนี้
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
