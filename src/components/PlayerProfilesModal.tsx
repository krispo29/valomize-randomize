import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, X, Sparkles, Check, Search, User, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { type PlayerProfile } from '@/types/player';
import { VALORANT_RANKS } from '@/services/rankService';

interface PlayerProfilesModalProps {
  show: boolean;
  onClose: () => void;
  players: string[];
  profiles: Record<number, PlayerProfile>;
  onSetRank: (index: number, tierIndex: number) => void;
  onSyncRiot: (index: number, riotId: string, region: 'ap' | 'na' | 'eu') => Promise<{ success: boolean; error?: string }>;
  onUpdateName: (index: number, newName: string) => void;
}

const RANK_DIVISIONS = [
  'ALL',
  'Iron',
  'Bronze',
  'Silver',
  'Gold',
  'Platinum',
  'Diamond',
  'Ascendant',
  'Immortal',
  'Radiant',
] as const;

export function PlayerProfilesModal({
  show,
  onClose,
  players,
  profiles,
  onSetRank,
  onSyncRiot,
  onUpdateName,
}: PlayerProfilesModalProps) {
  const [selectedPlayerIndex, setSelectedPlayerIndex] = useState<number>(0);
  const [riotIdInputs, setRiotIdInputs] = useState<Record<number, string>>({});
  const [selectedDivision, setSelectedDivision] = useState<string>('ALL');
  const [syncStatus, setSyncStatus] = useState<{ loading: boolean; message?: string; isError?: boolean }>({
    loading: false,
  });

  const activeProfile = profiles[selectedPlayerIndex] || {
    id: `p_${selectedPlayerIndex}`,
    name: players[selectedPlayerIndex] || `Player ${selectedPlayerIndex + 1}`,
    rankTier: 0,
    rankName: 'Unranked',
    rankIcon: VALORANT_RANKS[0].icon,
    rankColor: VALORANT_RANKS[0].color,
  };

  const filteredRanks = selectedDivision === 'ALL'
    ? VALORANT_RANKS
    : VALORANT_RANKS.filter((r) => r.divisionName.toLowerCase() === selectedDivision.toLowerCase());

  const handleSyncClick = async () => {
    const inputVal = riotIdInputs[selectedPlayerIndex] || activeProfile.riotId || '';
    if (!inputVal) {
      setSyncStatus({ loading: false, isError: true, message: 'กรุณากรอก Riot ID (เช่น Name#TAG)' });
      return;
    }

    setSyncStatus({ loading: true, message: 'กำลังค้นหาข้อมูลจาก Riot API...' });
    const res = await onSyncRiot(selectedPlayerIndex, inputVal, 'ap');

    if (res.success) {
      setSyncStatus({ loading: false, isError: false, message: '✅ อัปเดตแรงค์และข้อมูลสำเร็จ!' });
    } else {
      setSyncStatus({
        loading: false,
        isError: true,
        message: res.error || 'ไม่สามารถดึงข้อมูลได้ (สามารถคลิกเลือกตราแรงค์ด้านล่างได้ทันที)',
      });
    }

    setTimeout(() => {
      setSyncStatus({ loading: false });
    }, 5000);
  };

  const handlePrevPlayer = () => {
    setSelectedPlayerIndex((prev) => (prev > 0 ? prev - 1 : players.length - 1));
    setSyncStatus({ loading: false });
  };

  const handleNextPlayer = () => {
    setSelectedPlayerIndex((prev) => (prev < players.length - 1 ? prev + 1 : 0));
    setSyncStatus({ loading: false });
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25 }}
            className="relative bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl shadow-red-500/10 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 md:px-6 md:py-4 border-b border-zinc-800 bg-zinc-900/60">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-red-600/20 border border-red-500/30 text-red-500">
                  <Trophy className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-black uppercase text-white tracking-wider">
                    จัดการโปรไฟล์ผู้เล่น & แรงค์ (Riot ID & Ranks)
                  </h2>
                  <p className="text-xs text-zinc-400">
                    ผูก Riot ID หรือเลือกตราแรงค์ Valorant จริงเพื่อแสดงบนการ์ดผู้เล่น
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
              {/* Player Selector Tabs & Quick Navigation */}
              <div className="flex items-center justify-between gap-2 border-b border-zinc-800/80 pb-3">
                <div className="flex items-center gap-2 overflow-x-auto scrollbar-none flex-1">
                  {players.map((playerName, index) => {
                    const prof = profiles[index];
                    const isSelected = selectedPlayerIndex === index;

                    return (
                      <button
                        key={playerName + index}
                        onClick={() => {
                          setSelectedPlayerIndex(index);
                          setSyncStatus({ loading: false });
                        }}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border transition-all whitespace-nowrap ${
                          isSelected
                            ? 'bg-zinc-800 border-red-500 text-white shadow-md shadow-red-500/10 scale-105'
                            : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                        }`}
                      >
                        {prof?.rankIcon ? (
                          <img src={prof.rankIcon} alt="Rank" className="w-4 h-4 object-contain" />
                        ) : (
                          <User className="h-3.5 w-3.5" />
                        )}
                        <span className="font-bold text-xs uppercase">{playerName}</span>
                        {prof?.rankName && prof.rankTier !== 0 && (
                          <span className="text-[10px] text-zinc-400">({prof.rankName})</span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Prev / Next Player Quick Buttons (QoL) */}
                <div className="hidden sm:flex items-center gap-1 shrink-0">
                  <button
                    onClick={handlePrevPlayer}
                    className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition"
                    title="ผู้เล่นก่อนหน้า"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handleNextPlayer}
                    className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition"
                    title="ผู้เล่นถัดไป"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Active Player Edit Card */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Preview Card */}
                <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 flex flex-col items-center justify-between text-center relative overflow-hidden">
                  <div
                    className="absolute inset-0 opacity-10 pointer-events-none"
                    style={{ backgroundColor: activeProfile.rankColor || '#333' }}
                  />

                  <div className="relative z-10 w-full">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 block mb-3">
                      Player Card Preview
                    </span>

                    {/* Rank Badge Large */}
                    <div className="w-24 h-24 mx-auto mb-3 flex items-center justify-center relative">
                      <img
                        src={activeProfile.rankIcon || VALORANT_RANKS[0].icon}
                        alt="Rank Badge"
                        className="w-full h-full object-contain drop-shadow-[0_0_12px_rgba(255,255,255,0.2)]"
                      />
                    </div>

                    <h3 className="text-xl font-black uppercase text-white tracking-wider truncate mb-1">
                      {players[selectedPlayerIndex]}
                    </h3>

                    <div
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase border"
                      style={{
                        borderColor: activeProfile.rankColor || '#555',
                        color: activeProfile.rankColor || '#fff',
                        backgroundColor: `${activeProfile.rankColor || '#555'}15`,
                      }}
                    >
                      <Sparkles className="h-3 w-3" />
                      {activeProfile.rankName || 'Unranked'}
                    </div>

                    {activeProfile.riotId && (
                      <p className="text-[11px] text-zinc-400 mt-2 font-mono bg-zinc-950/80 py-1 px-2 rounded border border-zinc-800 truncate">
                        ID: {activeProfile.riotId}
                      </p>
                    )}
                  </div>

                  <div className="w-full pt-4 border-t border-zinc-800 text-[10px] text-zinc-500">
                    ตราแรงค์นี้จะแสดงบนการ์ดผู้เล่นในหน้าสุ่มและผลสรุป
                  </div>
                </div>

                {/* Right Form: Riot ID Sync & Rank Picker */}
                <div className="md:col-span-2 space-y-5">
                  {/* Edit Name & Riot ID */}
                  <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">
                          ชื่อในเว็บ (Display Name)
                        </label>
                        <input
                          type="text"
                          value={players[selectedPlayerIndex] || ''}
                          onChange={(e) => onUpdateName(selectedPlayerIndex, e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500 font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">
                          Riot ID (Name#TAG)
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="เช่น Mike#TH1"
                            value={
                              riotIdInputs[selectedPlayerIndex] !== undefined
                                ? riotIdInputs[selectedPlayerIndex]
                                : activeProfile.riotId || ''
                            }
                            onChange={(e) =>
                              setRiotIdInputs({ ...riotIdInputs, [selectedPlayerIndex]: e.target.value })
                            }
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-red-500 font-mono"
                          />
                          <Button
                            onClick={handleSyncClick}
                            disabled={syncStatus.loading}
                            className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs px-4 flex items-center gap-1.5 whitespace-nowrap"
                          >
                            <Search className="h-3.5 w-3.5" />
                            {syncStatus.loading ? 'Syncing...' : 'Sync'}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Sync Feedback Message */}
                    {syncStatus.message && (
                      <div
                        className={`p-2.5 rounded-lg text-xs font-bold flex items-center gap-2 ${
                          syncStatus.isError
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {syncStatus.isError ? <AlertCircle className="h-4 w-4 shrink-0" /> : <Check className="h-4 w-4 shrink-0" />}
                        <span>{syncStatus.message}</span>
                      </div>
                    )}
                  </div>

                  {/* Manual Rank Tier Selector with Division Filters (QoL Feature) */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                        <Trophy className="h-3.5 w-3.5 text-yellow-400" /> หรือเลือกตราแรงค์ด้วยตัวเอง (1-Click Rank Picker)
                      </label>
                      <span className="text-[10px] text-zinc-500">คลิกที่ตราแรงค์เพื่อเลือก</span>
                    </div>

                    {/* Division Quick Filter Pills (QoL) */}
                    <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
                      {RANK_DIVISIONS.map((div) => (
                        <button
                          key={div}
                          type="button"
                          onClick={() => setSelectedDivision(div)}
                          className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase transition whitespace-nowrap ${
                            selectedDivision === div
                              ? 'bg-red-600 text-white shadow-sm'
                              : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
                          }`}
                        >
                          {div}
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 max-h-48 overflow-y-auto p-2 bg-zinc-950/70 border border-zinc-800/80 rounded-xl">
                      {filteredRanks.map((tier) => {
                        const isSelected = activeProfile.rankTier === tier.tier;

                        return (
                          <button
                            key={tier.tier}
                            type="button"
                            onClick={() => onSetRank(selectedPlayerIndex, tier.tier)}
                            className={`flex flex-col items-center p-2 rounded-lg border transition-all ${
                              isSelected
                                ? 'bg-zinc-800 border-yellow-400 shadow-md shadow-yellow-400/20 scale-105'
                                : 'bg-zinc-900/50 border-zinc-800/60 hover:border-zinc-600 hover:bg-zinc-800/40 opacity-70 hover:opacity-100'
                            }`}
                          >
                            <img src={tier.icon} alt={tier.tierName} className="w-7 h-7 object-contain mb-1" />
                            <span className="text-[10px] font-bold text-white truncate max-w-full text-center">
                              {tier.tierName}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 md:px-6 border-t border-zinc-800 bg-zinc-900/40 flex justify-between items-center">
              <span className="text-xs text-zinc-500 hidden sm:inline">
                การตั้งค่าแรงค์จะถูกบันทึกอัตโนมัติ
              </span>
              <Button onClick={onClose} className="bg-red-600 hover:bg-red-500 text-white font-bold px-6">
                เรียบร้อย (Done)
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
