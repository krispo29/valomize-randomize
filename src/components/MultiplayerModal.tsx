import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe,
  X,
  Copy,
  Check,
  Crown,
  Eye,
  LogOut,
  Sparkles,
  Link2,
} from 'lucide-react';
import { Button } from './ui/button';

interface MultiplayerModalProps {
  show: boolean;
  onClose: () => void;
  roomCode: string | null;
  isHost: boolean;
  connectionStatus: 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'ERROR';
  onCreateRoom: () => string;
  onJoinRoom: (code: string) => void;
  onLeaveRoom: () => void;
}

export function MultiplayerModal({
  show,
  onClose,
  roomCode,
  isHost,
  connectionStatus,
  onCreateRoom,
  onJoinRoom,
  onLeaveRoom,
}: MultiplayerModalProps) {
  const [inputCode, setInputCode] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const shareableUrl = roomCode
    ? `${window.location.origin}${window.location.pathname}?room=${roomCode}`
    : '';

  const handleCopyLink = () => {
    if (!shareableUrl) return;
    navigator.clipboard.writeText(shareableUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25 }}
            className="relative bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-lg max-h-[92vh] flex flex-col shadow-2xl shadow-cyan-500/10 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 md:px-6 md:py-4 border-b border-zinc-800 bg-zinc-900/60">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-cyan-600/20 border border-cyan-500/30 text-cyan-400">
                  <Globe className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-black uppercase text-white tracking-wider">
                    Multiplayer Squad Room
                  </h2>
                  <p className="text-xs text-zinc-400">
                    ดูการสุ่มและซิงค์ผลการแข่งแบบ Real-time ข้ามเครื่อง
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
              {/* IF IN A ROOM */}
              {roomCode ? (
                <div className="space-y-5">
                  {/* Big Room Banner */}
                  <div className="bg-gradient-to-b from-cyan-950/40 via-zinc-900/90 to-zinc-900 border border-cyan-500/30 rounded-xl p-5 text-center space-y-3 relative overflow-hidden">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400">
                        ROOM CODE
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          connectionStatus === 'CONNECTED'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            connectionStatus === 'CONNECTED' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                          }`}
                        />
                        {connectionStatus === 'CONNECTED' ? 'ONLINE SYNC' : 'CONNECTING...'}
                      </span>
                    </div>

                    <div className="text-4xl font-black tracking-widest text-white font-mono select-all">
                      {roomCode}
                    </div>

                    {/* Role badge */}
                    <div className="flex items-center justify-center gap-2 pt-1">
                      {isHost ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase bg-yellow-500/20 text-yellow-300 border border-yellow-500/40">
                          <Crown className="h-3.5 w-3.5" /> คุณเป็น Room Host (ผู้ควบคุมการสุ่ม)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase bg-blue-500/20 text-blue-300 border border-blue-500/40">
                          <Eye className="h-3.5 w-3.5" /> คุณอยู่ในโหมด Spectator (รับชมสดจากหัวห้อง)
                        </span>
                      )}
                    </div>

                    {/* Copy Link Button */}
                    <Button
                      onClick={handleCopyLink}
                      className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2.5 flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 text-xs uppercase tracking-wider"
                    >
                      {copied ? (
                        <>
                          <Check className="h-4 w-4 text-white" /> คัดลอกลิงก์ห้องแล้ว!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" /> คัดลอกลิงก์แชร์ให้เพื่อน (Share Link)
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="p-3.5 bg-zinc-900/60 rounded-xl border border-zinc-800 text-xs text-zinc-400 space-y-1 leading-relaxed">
                    <p className="font-bold text-zinc-200 flex items-center gap-1.5">
                      <Link2 className="h-3.5 w-3.5 text-cyan-400" /> วิธีให้เพื่อนดูสดพร้อมกัน:
                    </p>
                    <p>
                      ส่งลิงก์ให้เพื่อนใน Discord หรือ LINE เมื่อหัวห้องกด <b>"RANDOMIZE AGENTS"</b>{' '}
                      ทุกคนจะเห็นแอนิเมชันเปิดการ์ดพร้อมกันแบบ Real-time บนอุปกรณ์ของตนเอง!
                    </p>
                  </div>

                  {/* Leave Room Button */}
                  <Button
                    onClick={onLeaveRoom}
                    variant="outline"
                    className="w-full border-rose-500/40 text-rose-400 hover:bg-rose-950/30 hover:text-rose-300 font-bold text-xs uppercase py-2 flex items-center justify-center gap-2"
                  >
                    <LogOut className="h-4 w-4" /> ออกจากห้อง (Leave Room)
                  </Button>
                </div>
              ) : (
                /* IF NOT IN A ROOM */
                <div className="space-y-6">
                  {/* Create New Room Option */}
                  <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 space-y-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-red-600/20 text-red-500 border border-red-500/30">
                        <Sparkles className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-white uppercase">สร้างห้องใหม่ (Host Room)</h4>
                        <p className="text-xs text-zinc-400">เป็นหัวห้องและแชร์หน้าจอการสุ่มให้เพื่อนดูสด</p>
                      </div>
                    </div>

                    <Button
                      onClick={() => onCreateRoom()}
                      className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold py-2.5 flex items-center justify-center gap-2 shadow-lg shadow-red-500/20 text-xs uppercase tracking-wider"
                    >
                      <Crown className="h-4 w-4" /> สร้างห้อง Squad ใหม่ทันที
                    </Button>
                  </div>

                  {/* Join Room Option */}
                  <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 space-y-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-cyan-600/20 text-cyan-400 border border-cyan-500/30">
                        <Link2 className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-white uppercase">เข้าร่วมห้องเพื่อน (Join Room)</h4>
                        <p className="text-xs text-zinc-400">กรอกรหัสห้อง เช่น VALO-7788 เพื่อเข้าดูสด</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="เช่น VALO-1234"
                        value={inputCode}
                        onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-sm text-white font-mono uppercase tracking-wider placeholder-zinc-600 focus:outline-none focus:border-cyan-500"
                      />
                      <Button
                        onClick={() => {
                          if (inputCode.trim()) {
                            onJoinRoom(inputCode.trim());
                          }
                        }}
                        disabled={!inputCode.trim()}
                        className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-5 text-xs uppercase"
                      >
                        Join
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
