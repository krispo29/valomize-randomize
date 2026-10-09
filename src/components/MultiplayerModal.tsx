import { useState, useEffect, useCallback, useMemo } from 'react';
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
  Users,
  Smile,
  UserX,
  ArrowUpDown,
  UserCheck,
} from 'lucide-react';
import { Button } from './ui/button';
import { sanitizeRoomCode } from '@/services/supabaseService';
import { type RoomMember } from '@/types/multiplayer';

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
  members?: RoomMember[];
  myPlayerName?: string;
  onUpdatePlayerName?: (name: string) => void;
  onTransferHost?: (targetMember: RoomMember) => Promise<void> | void;
  onKickMember?: (targetMember: RoomMember) => Promise<void> | void;
  onChangeSlot?: (targetMemberId: string, newSlotIndex: number) => Promise<void> | void;
  onStartReadyCheck?: () => void;
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
  members = [],
  myPlayerName = 'Player',
  onUpdatePlayerName,
  onTransferHost,
  onKickMember,
  onChangeSlot,
  onStartReadyCheck,
}: MultiplayerModalProps) {
  const [inputCode, setInputCode] = useState<string>('');
  const [customHostCode, setCustomHostCode] = useState<string>('');
  const [showCustomHostInput, setShowCustomHostInput] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [showQrCode, setShowQrCode] = useState<boolean>(false);
  const [clipboardDetectedRoom, setClipboardDetectedRoom] = useState<string | null>(null);
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [tempName, setTempName] = useState<string>(myPlayerName);
  const [confirmTransferTarget, setConfirmTransferTarget] = useState<RoomMember | null>(null);
  const [isTransferring, setIsTransferring] = useState<boolean>(false);
  const [confirmKickTarget, setConfirmKickTarget] = useState<RoomMember | null>(null);
  const [isKicking, setIsKicking] = useState<boolean>(false);
  const [slotMenuMemberId, setSlotMenuMemberId] = useState<string | null>(null);
  const [isChangingSlot, setIsChangingSlot] = useState<boolean>(false);

  const handleConfirmTransfer = async (member: RoomMember) => {
    if (!onTransferHost) return;
    setIsTransferring(true);
    try {
      await onTransferHost(member);
      setConfirmTransferTarget(null);
    } catch {
      // ignore
    } finally {
      setIsTransferring(false);
    }
  };

  const handleConfirmKick = async (member: RoomMember) => {
    if (!onKickMember) return;
    setIsKicking(true);
    try {
      await onKickMember(member);
      setConfirmKickTarget(null);
    } catch {
      // ignore
    } finally {
      setIsKicking(false);
    }
  };

  const handleSelectSlot = async (memberId: string, slotIndex: number) => {
    if (!onChangeSlot) return;
    setIsChangingSlot(true);
    try {
      await onChangeSlot(memberId, slotIndex);
      setSlotMenuMemberId(null);
    } catch {
      // ignore
    } finally {
      setIsChangingSlot(false);
    }
  };

  // Compute 5-player active roster and spectator/bench list
  const { activeSlots, benchMembers, myMember } = useMemo(() => {
    const slots: (RoomMember | null)[] = [null, null, null, null, null];
    const unslotted: RoomMember[] = [];
    const bench: RoomMember[] = [];

    const sorted = [...members].sort((a, b) => {
      if (a.isHost && !b.isHost) return -1;
      if (!a.isHost && b.isHost) return 1;
      const aSlot = a.slotIndex !== null && a.slotIndex !== undefined && a.slotIndex >= 0 ? a.slotIndex : 99;
      const bSlot = b.slotIndex !== null && b.slotIndex !== undefined && b.slotIndex >= 0 ? b.slotIndex : 99;
      if (aSlot !== bSlot) return aSlot - bSlot;
      return a.id.localeCompare(b.id);
    });

    sorted.forEach((m) => {
      if (m.slotIndex === -1) {
        bench.push(m);
      } else if (m.slotIndex !== null && m.slotIndex !== undefined && m.slotIndex >= 0 && m.slotIndex < 5) {
        if (!slots[m.slotIndex]) {
          slots[m.slotIndex] = m;
        } else {
          unslotted.push(m);
        }
      } else {
        unslotted.push(m);
      }
    });

    for (let i = 0; i < 5; i++) {
      if (!slots[i] && unslotted.length > 0) {
        slots[i] = unslotted.shift()!;
      }
    }
    bench.push(...unslotted);

    const self = members.find((m) => m.isSelf);

    return {
      activeSlots: slots,
      benchMembers: bench,
      myMember: self,
    };
  }, [members]);


  useEffect(() => {
    if (myPlayerName) setTempName(myPlayerName);
  }, [myPlayerName]);

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

                  {/* Feature: Live Room Members Lobby */}
                  <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-cyan-400" />
                        <span className="text-xs font-black uppercase tracking-wider text-white">
                          สมาชิกในห้อง ({members.length} คนออนไลน์)
                        </span>
                      </div>
                      <span className="text-[10px] text-zinc-400 flex items-center gap-1.5 font-mono">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        NEON LIVE
                      </span>
                    </div>

                    {/* Display Name Setting Box */}
                    <div className="p-3 bg-zinc-950/70 rounded-lg border border-zinc-800/80 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-400 text-[11px] font-medium flex items-center gap-1.5">
                          <Smile className="h-3.5 w-3.5 text-yellow-400" /> ชื่อของคุณในห้อง:
                        </span>
                        {!isEditingName && (
                          <button
                            type="button"
                            onClick={() => setIsEditingName(true)}
                            className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-bold"
                          >
                            <Edit3 className="h-3 w-3" /> เปลี่ยนชื่อ
                          </button>
                        )}
                      </div>

                      {isEditingName ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={tempName}
                            onChange={(e) => setTempName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                onUpdatePlayerName?.(tempName);
                                setIsEditingName(false);
                              }
                            }}
                            placeholder="พิมพ์ชื่อของคุณ..."
                            maxLength={16}
                            className="flex-1 bg-zinc-900 border border-cyan-500/50 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                            autoFocus
                          />
                          <Button
                            size="sm"
                            onClick={() => {
                              onUpdatePlayerName?.(tempName);
                              setIsEditingName(false);
                            }}
                            className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs px-3 py-1.5 h-8 font-bold"
                          >
                            บันทึก
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-black text-cyan-300 flex items-center gap-1.5">
                            {myPlayerName || 'Player'}
                            <span className="text-[10px] font-normal text-zinc-500">(จะแสดงให้เพื่อนทุกคนในห้องเห็น)</span>
                          </span>
                        </div>
                      )}


                    </div>

                    {/* Active Squad (5 Slots) */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5" /> ตัวจริง 5 คน (Active Roster)
                        </span>
                        <div className="flex items-center gap-2">
                          {isHost && onStartReadyCheck && (
                            <button
                              type="button"
                              onClick={() => {
                                onStartReadyCheck();
                                onClose();
                              }}
                              className="px-2 py-0.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold flex items-center gap-1 transition active:scale-95 shadow"
                              title="ส่งสัญญาณเช็กความพร้อมเพื่อนทุกคนในห้อง"
                            >
                              <UserCheck className="w-2.5 h-2.5" />
                              <span>Ready Check</span>
                            </button>
                          )}
                          <span className="text-[10px] text-zinc-500 font-mono">
                            {activeSlots.filter(Boolean).length}/5 คน
                          </span>
                        </div>
                      </div>

                      {/* 5 Slots List */}
                      <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                        {activeSlots.map((member, slotIdx) => (
                          member ? (
                            <div
                              key={member.id}
                              className={`flex items-center justify-between p-2.5 rounded-lg border transition ${
                                member.isSelf
                                  ? 'bg-cyan-950/30 border-cyan-500/40 text-white'
                                  : 'bg-zinc-950/50 border-zinc-800/80 text-zinc-300'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 truncate">
                                {/* Slot Avatar */}
                                <div className="relative shrink-0">
                                  <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shadow-md ${
                                      member.isHost ? 'bg-amber-500 text-zinc-950 ring-2 ring-amber-400/40' : 'bg-cyan-600 text-white'
                                    }`}
                                  >
                                    {member.playerName ? member.playerName.charAt(0).toUpperCase() : '?'}
                                  </div>
                                  <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-zinc-900 border border-zinc-700 text-[9px] font-black rounded-full text-cyan-400 flex items-center justify-center">
                                    {slotIdx + 1}
                                  </span>
                                </div>

                                <div className="truncate">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-bold text-white truncate">{member.playerName}</span>
                                    {member.isHost && (
                                      <span className="inline-flex items-center gap-0.5 text-[9px] font-black uppercase px-1.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded">
                                        <Crown className="h-2.5 w-2.5" /> HOST
                                      </span>
                                    )}
                                    {member.isSelf && (
                                      <span className="text-[9px] font-bold px-1.5 py-0.5 bg-cyan-500/20 text-cyan-300 rounded border border-cyan-500/40">
                                        คุณ
                                      </span>
                                    )}
                                    {member.isAway ? (
                                      <span className="text-[9px] font-bold px-1.5 py-0.5 bg-amber-500/20 text-amber-300 rounded border border-amber-500/30 flex items-center gap-0.5" title="ผู้เล่นกำลังพับหน้าจอ">
                                        🟡 พับจอ
                                      </span>
                                    ) : null}
                                  </div>
                                  <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
                                    Slot {slotIdx + 1}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5">
                                {/* Slot Switcher */}
                                {(isHost || member.isSelf) && onChangeSlot && (
                                  <div className="relative">
                                    {slotMenuMemberId === member.id ? (
                                      <div className="flex items-center gap-1 animate-in fade-in duration-150 bg-zinc-900 border border-cyan-500/50 p-1 rounded-lg shadow-xl z-20">
                                        {[0, 1, 2, 3, 4].map((s) => (
                                          <button
                                            key={s}
                                            type="button"
                                            disabled={isChangingSlot || s === slotIdx}
                                            onClick={() => handleSelectSlot(member.id, s)}
                                            className={`px-1.5 py-0.5 text-[10px] font-black rounded transition ${
                                              s === slotIdx
                                                ? 'bg-cyan-600 text-white'
                                                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                                            }`}
                                          >
                                            S{s + 1}
                                          </button>
                                        ))}
                                        <button
                                          type="button"
                                          disabled={isChangingSlot}
                                          onClick={() => handleSelectSlot(member.id, -1)}
                                          title="ย้ายไปตัวสำรอง"
                                          className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 rounded transition"
                                        >
                                          สำรอง
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setSlotMenuMemberId(null)}
                                          className="px-1 py-0.5 text-[10px] text-zinc-400 hover:text-white"
                                        >
                                          ✕
                                        </button>
                                      </div>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setSlotMenuMemberId(member.id);
                                          setConfirmTransferTarget(null);
                                          setConfirmKickTarget(null);
                                        }}
                                        title="สลับ Slot หรือย้ายไปสำรอง"
                                        className="px-2 py-1 rounded bg-zinc-800/90 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 text-[10px] font-bold flex items-center gap-1 transition active:scale-95"
                                      >
                                        <ArrowUpDown className="w-2.5 h-2.5 text-cyan-400" />
                                        <span>Slot {slotIdx + 1}</span>
                                      </button>
                                    )}
                                  </div>
                                )}

                                {/* Host Actions: Transfer Host & Kick */}
                                {isHost && !member.isSelf && !member.isHost && (
                                  <>
                                    {/* Transfer Host */}
                                    {onTransferHost && (
                                      confirmTransferTarget?.id === member.id ? (
                                        <div className="flex items-center gap-1 animate-in fade-in duration-150">
                                          <button
                                            type="button"
                                            onClick={() => handleConfirmTransfer(member)}
                                            disabled={isTransferring}
                                            className="px-2 py-1 bg-amber-500 hover:bg-amber-400 text-black text-[10px] font-black rounded shadow transition active:scale-95 flex items-center gap-1"
                                          >
                                            <Crown className="w-2.5 h-2.5" />
                                            <span>{isTransferring ? 'กำลังโอน...' : 'ยืนยัน'}</span>
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => setConfirmTransferTarget(null)}
                                            disabled={isTransferring}
                                            className="px-1.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] rounded transition"
                                          >
                                            ยกเลิก
                                          </button>
                                        </div>
                                      ) : (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setConfirmTransferTarget(member);
                                            setConfirmKickTarget(null);
                                            setSlotMenuMemberId(null);
                                          }}
                                          title={`โอนสิทธิ์หัวห้องให้ ${member.playerName}`}
                                          className="px-2 py-1 rounded bg-amber-500/10 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-[10px] font-bold flex items-center gap-1 transition active:scale-95"
                                        >
                                          <Crown className="w-3 h-3 text-amber-400" />
                                          <span>โฮสต์</span>
                                        </button>
                                      )
                                    )}

                                    {/* Kick Member */}
                                    {onKickMember && (
                                      confirmKickTarget?.id === member.id ? (
                                        <div className="flex items-center gap-1 animate-in fade-in duration-150">
                                          <button
                                            type="button"
                                            onClick={() => handleConfirmKick(member)}
                                            disabled={isKicking}
                                            className="px-2 py-1 bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-black rounded shadow transition active:scale-95 flex items-center gap-1"
                                          >
                                            <UserX className="w-2.5 h-2.5" />
                                            <span>{isKicking ? 'กำลังเตะ...' : 'ยืนยัน'}</span>
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => setConfirmKickTarget(null)}
                                            disabled={isKicking}
                                            className="px-1.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] rounded transition"
                                          >
                                            ยกเลิก
                                          </button>
                                        </div>
                                      ) : (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setConfirmKickTarget(member);
                                            setConfirmTransferTarget(null);
                                            setSlotMenuMemberId(null);
                                          }}
                                          title={`เตะ ${member.playerName} ออกจากห้อง`}
                                          className="px-2 py-1 rounded bg-rose-500/10 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-[10px] font-bold flex items-center gap-1 transition active:scale-95"
                                        >
                                          <UserX className="w-3 h-3 text-rose-400" />
                                          <span>เตะ</span>
                                        </button>
                                      )
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          ) : (
                            /* Empty Slot Box */
                            <div
                              key={`empty_slot_${slotIdx}`}
                              className="flex items-center justify-between p-2 rounded-lg border border-dashed border-zinc-800/80 bg-zinc-950/20 text-zinc-500 text-xs"
                            >
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full border border-dashed border-zinc-700 flex items-center justify-center text-[10px] font-bold text-zinc-500">
                                  {slotIdx + 1}
                                </div>
                                <span className="text-[11px] font-medium text-zinc-400">
                                  Slot {slotIdx + 1} ว่าง
                                </span>
                              </div>
                              {myMember && onChangeSlot && (
                                <button
                                  type="button"
                                  disabled={isChangingSlot}
                                  onClick={() => handleSelectSlot(myMember.id, slotIdx)}
                                  className="px-2.5 py-1 rounded bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/30 text-cyan-300 text-[10px] font-bold flex items-center gap-1 transition active:scale-95"
                                >
                                  + นั่ง Slot นี้
                                </button>
                              )}
                            </div>
                          )
                        ))}
                      </div>
                    </div>

                    {/* Spectator / Bench Section (If any bench members exist) */}
                    {benchMembers.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-zinc-800/80">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                            <Eye className="w-3.5 h-3.5" /> ตัวสำรอง / ผู้ชม ({benchMembers.length} คน)
                          </span>
                          <span className="text-[10px] text-zinc-500">
                            ดูการสุ่มสด Real-time
                          </span>
                        </div>

                        <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                          {benchMembers.map((member) => (
                            <div
                              key={member.id}
                              className={`flex items-center justify-between p-2 rounded-lg border transition ${
                                member.isSelf
                                  ? 'bg-amber-950/20 border-amber-500/40 text-white'
                                  : 'bg-zinc-950/40 border-zinc-800/60 text-zinc-400'
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-xs text-zinc-300">
                                  {member.playerName ? member.playerName.charAt(0).toUpperCase() : '?'}
                                </div>
                                <div className="truncate">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-bold text-zinc-300 truncate">{member.playerName}</span>
                                    {member.isSelf && (
                                      <span className="text-[9px] font-bold px-1.5 py-0.2 bg-amber-500/20 text-amber-300 rounded border border-amber-500/30">
                                        คุณ
                                      </span>
                                    )}
                                    {member.isAway ? (
                                      <span className="text-[9px] font-bold px-1.5 py-0.5 bg-amber-500/20 text-amber-300 rounded border border-amber-500/30 flex items-center gap-0.5" title="ผู้เล่นกำลังพับหน้าจอ">
                                        🟡 พับจอ
                                      </span>
                                    ) : null}
                                  </div>
                                  <span className="text-[9px] text-zinc-500">ผู้ชม (กำลังดูสด)</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5">
                                {/* Promote to Slot */}
                                {(isHost || member.isSelf) && onChangeSlot && (
                                  <div className="relative">
                                    {slotMenuMemberId === member.id ? (
                                      <div className="flex items-center gap-1 animate-in fade-in duration-150 bg-zinc-900 border border-cyan-500/50 p-1 rounded-lg shadow-xl z-20">
                                        {[0, 1, 2, 3, 4].map((s) => (
                                          <button
                                            key={s}
                                            type="button"
                                            disabled={isChangingSlot}
                                            onClick={() => handleSelectSlot(member.id, s)}
                                            className="px-1.5 py-0.5 text-[10px] font-black bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded transition"
                                          >
                                            S{s + 1}
                                          </button>
                                        ))}
                                        <button
                                          type="button"
                                          onClick={() => setSlotMenuMemberId(null)}
                                          className="px-1 py-0.5 text-[10px] text-zinc-400 hover:text-white"
                                        >
                                          ✕
                                        </button>
                                      </div>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setSlotMenuMemberId(member.id);
                                          setConfirmTransferTarget(null);
                                          setConfirmKickTarget(null);
                                        }}
                                        className="px-2 py-0.5 rounded bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/30 text-cyan-300 text-[10px] font-bold transition active:scale-95"
                                      >
                                        ขึ้นตัวจริง ▾
                                      </button>
                                    )}
                                  </div>
                                )}

                                {/* Host Kick */}
                                {isHost && !member.isSelf && onKickMember && (
                                  confirmKickTarget?.id === member.id ? (
                                    <div className="flex items-center gap-1 animate-in fade-in duration-150">
                                      <button
                                        type="button"
                                        onClick={() => handleConfirmKick(member)}
                                        disabled={isKicking}
                                        className="px-2 py-0.5 bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-black rounded shadow"
                                      >
                                        {isKicking ? '...' : 'เตะ'}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setConfirmKickTarget(null)}
                                        className="px-1 py-0.5 bg-zinc-800 text-zinc-300 text-[10px] rounded"
                                      >
                                        ยกเลิก
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => setConfirmKickTarget(member)}
                                      className="px-1.5 py-0.5 rounded bg-rose-500/10 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-[10px]"
                                    >
                                      <UserX className="w-3 h-3 text-rose-400" />
                                    </button>
                                  )
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
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
                          placeholder="เช่น VALO-GANG, VALO-SQUAD หรือชื่อทีม"
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
                        <p className="text-[11px] text-zinc-400">กรอกรหัสห้อง เช่น VALO-7K2X, 7K2X หรือวางลิงก์ห้อง</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <div className="relative w-full">
                        <input
                          type="text"
                          placeholder="เช่น VALO-7K2X, 7K2X หรือวางลิงก์ห้อง"
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
