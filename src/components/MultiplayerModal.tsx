import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
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
  QrCode,
  Star,
  Clock,
  Trash2,
  ClipboardPaste,
  Edit3,
} from 'lucide-react';
import { Button } from './ui/button';
import { sanitizeRoomCode } from '@/services/supabaseService';

const RECENT_ROOMS_KEY = 'valomize_recent_rooms_v1';

export interface RecentRoomItem {
  code: string;
  joinedAt: number;
  isFavorite?: boolean;
}

interface MultiplayerModalProps {
  show: boolean;
  onClose: () => void;
  roomCode: string | null;
  isHost: boolean;
  connectionStatus: 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'ERROR';
  onCreateRoom: (customCode?: string) => string;
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
  const [customHostCode, setCustomHostCode] = useState<string>('');
  const [showCustomHostInput, setShowCustomHostInput] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [showQrCode, setShowQrCode] = useState<boolean>(false);
  const [clipboardDetectedRoom, setClipboardDetectedRoom] = useState<string | null>(null);

  // Recent Rooms State
  const [recentRooms, setRecentRooms] = useState<RecentRoomItem[]>(() => {
    try {
      const saved = localStorage.getItem(RECENT_ROOMS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  const saveRecentRooms = useCallback((items: RecentRoomItem[]) => {
    setRecentRooms(items);
    try {
      localStorage.setItem(RECENT_ROOMS_KEY, JSON.stringify(items));
    } catch {
      // ignore
    }
  }, []);

  // When active in a room, save it to recent rooms
  useEffect(() => {
    if (roomCode) {
      const clean = sanitizeRoomCode(roomCode);
      if (clean) {
        setRecentRooms((prev) => {
          const existing = prev.find((r) => r.code === clean);
          const isFav = existing?.isFavorite || false;
          const filtered = prev.filter((r) => r.code !== clean);
          const updated = [{ code: clean, joinedAt: Date.now(), isFavorite: isFav }, ...filtered].slice(0, 6);
          try {
            localStorage.setItem(RECENT_ROOMS_KEY, JSON.stringify(updated));
          } catch {
            // ignore
          }
          return updated;
        });
      }
    }
  }, [roomCode]);

  // Feature 1: Clipboard Auto-Detect on modal open
  const checkClipboard = useCallback(async () => {
    if (roomCode) return;
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          const clean = sanitizeRoomCode(text);
          if (clean && clean.length >= 3 && clean !== roomCode) {
            setClipboardDetectedRoom(clean);
            return;
          }
        }
      }
    } catch {
      // Permission denied or not focused
    }
    setClipboardDetectedRoom(null);
  }, [roomCode]);

  useEffect(() => {
    if (show && !roomCode) {
      checkClipboard();
    }
  }, [show, roomCode, checkClipboard]);

  const shareableUrl = roomCode
    ? `${window.location.origin}${window.location.pathname}?room=${roomCode}`
    : '';

  const handleCopyLink = () => {
    if (!shareableUrl) return;
    navigator.clipboard.writeText(shareableUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePasteInput = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const clean = sanitizeRoomCode(text);
      if (clean) {
        setInputCode(clean);
      }
    } catch {
      // ignore
    }
  };

  const handleToggleFavorite = (codeToToggle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = recentRooms.map((r) =>
      r.code === codeToToggle ? { ...r, isFavorite: !r.isFavorite } : r
    );
    saveRecentRooms(updated);
  };

  const handleDeleteRecent = (codeToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = recentRooms.filter((r) => r.code !== codeToDelete);
    saveRecentRooms(updated);
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
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5">
              {/* IF IN A ROOM */}
              {roomCode ? (
                <div className="space-y-4">
                  {/* Big Room Banner */}
                  <div className="bg-gradient-to-b from-cyan-950/40 via-zinc-900/90 to-zinc-900 border border-cyan-500/30 rounded-xl p-5 text-center space-y-3 relative overflow-hidden">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400">
                        ROOM CODE
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      <Button
                        onClick={handleCopyLink}
                        className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2.5 flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 text-xs uppercase tracking-wider"
                      >
                        {copied ? (
                          <>
                            <Check className="h-4 w-4 text-white" /> คัดลอกลิงก์แล้ว!
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4" /> คัดลอกลิงก์แชร์ให้เพื่อน
                          </>
                        )}
                      </Button>

                      {/* Feature 4: Toggle QR Code */}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowQrCode(!showQrCode)}
                        className={`w-full border-zinc-700 font-bold py-2.5 flex items-center justify-center gap-2 text-xs uppercase tracking-wider ${
                          showQrCode ? 'bg-zinc-800 text-white border-cyan-500/50' : 'text-zinc-300 hover:bg-zinc-800'
                        }`}
                      >
                        <QrCode className="h-4 w-4 text-cyan-400" />
                        {showQrCode ? 'ซ่อน QR Code' : '📱 สแกนผ่านมือถือ'}
                      </Button>
                    </div>

                    {/* Feature 4: QR Code Display Area */}
                    {showQrCode && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 flex flex-col items-center justify-center gap-2.5 mt-2"
                      >
                        <div className="p-3 bg-white rounded-xl shadow-lg">
                          <QRCodeSVG
                            value={shareableUrl}
                            size={160}
                            bgColor="#ffffff"
                            fgColor="#09090b"
                            level="M"
                          />
                        </div>
                        <p className="text-[11px] text-zinc-400 font-medium text-center">
                          ยกกล้องมือถือสแกน QR Code นี้เพื่อเปิดดูการสุ่มสดได้ทันที
                        </p>
                      </motion.div>
                    )}
                  </div>

                  <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800 text-xs text-zinc-400 space-y-1 leading-relaxed">
                    <p className="font-bold text-zinc-200 flex items-center gap-1.5">
                      <Link2 className="h-3.5 w-3.5 text-cyan-400" /> วิธีให้เพื่อนดูสดพร้อมกัน:
                    </p>
                    <p>
                      ส่งลิงก์ให้เพื่อนใน Discord เมื่อหัวห้องกด <b>"RANDOMIZE AGENTS"</b> ทุกคนจะเห็นการสับไพ่และเปิดการ์ดพร้อมกันแบบ Real-time!
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
                <div className="space-y-4">
                  {/* Feature 1: Auto-Detected Clipboard Banner */}
                  {clipboardDetectedRoom && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3.5 rounded-xl bg-gradient-to-r from-cyan-950/80 to-zinc-900 border border-cyan-500/50 flex items-center justify-between gap-3 shadow-lg shadow-cyan-500/10"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <div className="p-1.5 bg-cyan-600/30 rounded-lg text-cyan-400">
                          <ClipboardPaste className="h-4 w-4" />
                        </div>
                        <div className="truncate">
                          <span className="text-[10px] uppercase font-bold text-cyan-400 block">
                            ตรวจพบจากคลิปบอร์ด
                          </span>
                          <span className="text-sm font-black text-white font-mono">
                            {clipboardDetectedRoom}
                          </span>
                        </div>
                      </div>
                      <Button
                        onClick={() => onJoinRoom(clipboardDetectedRoom)}
                        className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs px-3.5 py-1.5 shrink-0"
                      >
                        เข้าห้องนี้ทันที ➔
                      </Button>
                    </motion.div>
                  )}

                  {/* Feature 2: Recent / Favorite Squad Rooms */}
                  {recentRooms.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-zinc-400 uppercase text-[11px] flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-zinc-400" /> ห้องประจำตี้ & ห้องล่าสุด (Recent Rooms)
                        </span>
                        <span className="text-[10px] text-zinc-500">คลิกเพื่อเข้าทันที</span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {recentRooms.map((r) => (
                          <div
                            key={r.code}
                            onClick={() => onJoinRoom(r.code)}
                            className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 hover:border-cyan-500/50 hover:bg-zinc-800/80 cursor-pointer flex items-center justify-between gap-1.5 transition group"
                          >
                            <div className="flex items-center gap-2 truncate">
                              <span className="font-mono font-bold text-xs text-white group-hover:text-cyan-300 truncate">
                                {r.code}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={(e) => handleToggleFavorite(r.code, e)}
                                className={`p-1 rounded hover:bg-zinc-700 transition ${
                                  r.isFavorite ? 'text-yellow-400' : 'text-zinc-600 hover:text-zinc-300'
                                }`}
                                title={r.isFavorite ? 'ยกเลิกห้องโปรด' : 'ปักหมุดห้องโปรด'}
                              >
                                <Star className="h-3.5 w-3.5 fill-current" />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => handleDeleteRecent(r.code, e)}
                                className="p-1 rounded text-zinc-600 hover:text-rose-400 hover:bg-zinc-700 transition"
                                title="ลบรายการนี้"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Create Room Section with Custom Name Option (Feature 3) */}
                  <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-red-600/20 text-red-500 border border-red-500/30">
                          <Sparkles className="h-4 w-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-white uppercase">สร้างห้องใหม่ (Host Room)</h4>
                          <p className="text-[11px] text-zinc-400">เป็นหัวห้องและแชร์หน้าจอการสุ่มให้เพื่อนดูสด</p>
                        </div>
                      </div>

                      {/* Toggle Custom Name Input */}
                      <button
                        type="button"
                        onClick={() => setShowCustomHostInput(!showCustomHostInput)}
                        className="text-[11px] font-bold text-zinc-400 hover:text-white flex items-center gap-1 bg-zinc-800/80 px-2 py-1 rounded border border-zinc-700 transition"
                      >
                        <Edit3 className="h-3 w-3" />
                        {showCustomHostInput ? 'สุ่มรหัสแทน' : 'ตั้งชื่อห้องเอง'}
                      </button>
                    </div>

                    {showCustomHostInput ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="เช่น GANG, MIKE, SQUAD"
                          value={customHostCode}
                          onChange={(e) => setCustomHostCode(e.target.value.toUpperCase())}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white font-mono uppercase tracking-wider focus:outline-none focus:border-red-500"
                        />
                        <Button
                          onClick={() => {
                            const code = customHostCode.trim() ? sanitizeRoomCode(customHostCode) : undefined;
                            onCreateRoom(code);
                          }}
                          className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs px-4 whitespace-nowrap"
                        >
                          สร้างห้อง
                        </Button>
                      </div>
                    ) : (
                      <Button
                        onClick={() => onCreateRoom()}
                        className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold py-2.5 flex items-center justify-center gap-2 shadow-lg shadow-red-500/20 text-xs uppercase tracking-wider"
                      >
                        <Crown className="h-4 w-4" /> สร้างห้อง Squad ใหม่ทันที
                      </Button>
                    )}
                  </div>

                  {/* Join Room Section with Quick Paste */}
                  <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-cyan-600/20 text-cyan-400 border border-cyan-500/30">
                        <Link2 className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-white uppercase">เข้าร่วมห้องเพื่อน (Join Room)</h4>
                        <p className="text-[11px] text-zinc-400">กรอกรหัสห้อง เช่น VALO-7023 หรือวางลิงก์ห้อง</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <div className="relative w-full">
                        <input
                          type="text"
                          placeholder="เช่น VALO-7023 หรือวางลิงก์ห้อง"
                          value={inputCode}
                          onChange={(e) => setInputCode(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 pr-8 text-xs text-white font-mono uppercase tracking-wider placeholder-zinc-600 focus:outline-none focus:border-cyan-500"
                        />
                        <button
                          type="button"
                          onClick={handlePasteInput}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-1 rounded"
                          title="วางจากคลิปบอร์ด"
                        >
                          <ClipboardPaste className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <Button
                        onClick={() => {
                          const clean = sanitizeRoomCode(inputCode);
                          if (clean) onJoinRoom(clean);
                        }}
                        disabled={!inputCode.trim()}
                        className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-5 text-xs uppercase shrink-0"
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
