import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, CheckCircle2, XCircle, X, Shield, Users, Sword, Target, Sparkles, MessageSquare } from 'lucide-react';
import { Button } from './ui/button';
import { type Agent, type Role, type ValorantMap, MAPS_DATA } from '@/data/valorant';
import { type MatchPlayerResult, type MatchRecord } from '@/types/stats';

interface RecordMatchModalProps {
  show: boolean;
  onClose: () => void;
  onSave: (match: Omit<MatchRecord, 'id' | 'timestamp'>) => void;
  players: string[];
  assignments: Record<number, Agent | null>;
  playerStatuses: Record<number, 'MVP' | 'BOTTOM' | null>;
  selectedMap: ValorantMap | null;
}

const getRoleIcon = (role: Role) => {
  switch (role) {
    case 'Duelist':
      return <Sword className="h-3 w-3" />;
    case 'Controller':
      return <Users className="h-3 w-3" />;
    case 'Initiator':
      return <Target className="h-3 w-3" />;
    case 'Sentinel':
      return <Shield className="h-3 w-3" />;
    default:
      return null;
  }
};

export function RecordMatchModal({
  show,
  onClose,
  onSave,
  players,
  assignments,
  playerStatuses,
  selectedMap,
}: RecordMatchModalProps) {
  const [result, setResult] = useState<'WIN' | 'LOSS'>('WIN');
  const [scoreTeam, setScoreTeam] = useState<number>(13);
  const [scoreEnemy, setScoreEnemy] = useState<number>(9);
  const [matchMvpName, setMatchMvpName] = useState<string>(players[0] || '');
  const [notes, setNotes] = useState<string>('');
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Map image lookup
  const currentMapData = MAPS_DATA.find((m) => m.name === selectedMap);
  const mapImage = currentMapData?.image || '';

  const handleSave = () => {
    const matchPlayers: MatchPlayerResult[] = players.map((name, index) => {
      const agent = assignments[index];
      return {
        name,
        agentName: agent ? agent.name : 'Unknown',
        agentRole: agent ? agent.role : 'Duelist',
        agentImage: agent ? agent.image : '',
        agentColor: agent ? agent.color : undefined,
        assignedStatus: playerStatuses[index] || null,
        isMatchMvp: matchMvpName === name,
      };
    });

    onSave({
      map: selectedMap || 'Custom Game',
      mapImage,
      players: matchPlayers,
      result,
      scoreTeam: Number(scoreTeam) || 0,
      scoreEnemy: Number(scoreEnemy) || 0,
      matchMvpName: matchMvpName || undefined,
      notes: notes.trim() || undefined,
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 900);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 30 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative bg-gradient-to-b from-zinc-900 via-zinc-900/95 to-black border border-red-500/30 rounded-xl p-6 max-w-2xl w-full shadow-2xl shadow-red-500/20 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white p-2 rounded-lg hover:bg-zinc-800 transition"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-6 border-b border-zinc-800 pb-4">
              <div className="p-2.5 rounded-lg bg-red-600/20 border border-red-500/30 text-red-400">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-black uppercase text-white tracking-wider">
                  บันทึกผลการแข่งขัน (Record Match)
                </h2>
                <p className="text-xs text-zinc-400">
                  {selectedMap ? `แผนที่: ${selectedMap}` : 'แผนที่: Random'} • บันทึกสถิติเพื่อนำไปวิเคราะห์ใน Squad Dashboard
                </p>
              </div>
            </div>

            {/* Result Selector (Victory vs Defeat) */}
            <div className="mb-6">
              <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">
                ผลการแข่งขัน (Match Outcome)
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setResult('WIN');
                    if (scoreTeam <= scoreEnemy) {
                      setScoreTeam(13);
                      setScoreEnemy(9);
                    }
                  }}
                  className={`flex items-center justify-center gap-3 py-3 px-4 rounded-lg border-2 font-black tracking-widest uppercase transition-all duration-200 ${
                    result === 'WIN'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)] scale-[1.02]'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'
                  }`}
                >
                  <CheckCircle2 className="h-6 w-6" />
                  <div className="text-left">
                    <div className="text-base font-black">VICTORY (ชนะ)</div>
                    <div className="text-[10px] font-medium opacity-80">ทีมคว้าชัยชนะ</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setResult('LOSS');
                    if (scoreEnemy <= scoreTeam) {
                      setScoreTeam(9);
                      setScoreEnemy(13);
                    }
                  }}
                  className={`flex items-center justify-center gap-3 py-3 px-4 rounded-lg border-2 font-black tracking-widest uppercase transition-all duration-200 ${
                    result === 'LOSS'
                      ? 'bg-red-500/20 border-red-500 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.3)] scale-[1.02]'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'
                  }`}
                >
                  <XCircle className="h-6 w-6" />
                  <div className="text-left">
                    <div className="text-base font-black">DEFEAT (แพ้)</div>
                    <div className="text-[10px] font-medium opacity-80">พ่ายแพ้ในรอบนี้</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Score Inputs */}
            <div className="mb-6 bg-zinc-950/70 border border-zinc-800 rounded-lg p-4">
              <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3">
                สกอร์รอบการเล่น (Round Score)
              </label>
              <div className="flex items-center justify-center gap-6">
                <div className="flex flex-col items-center">
                  <span className="text-xs text-emerald-400 font-bold mb-1 uppercase">ทีมเรา</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setScoreTeam((v) => Math.max(0, v - 1))}
                      className="w-8 h-8 rounded bg-zinc-800 hover:bg-zinc-700 text-white font-bold"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min={0}
                      max={30}
                      value={scoreTeam}
                      onChange={(e) => setScoreTeam(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-16 h-12 bg-zinc-900 border border-emerald-500/50 rounded text-center text-2xl font-black text-emerald-400 focus:outline-none focus:border-emerald-400"
                    />
                    <button
                      type="button"
                      onClick={() => setScoreTeam((v) => v + 1)}
                      className="w-8 h-8 rounded bg-zinc-800 hover:bg-zinc-700 text-white font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="text-3xl font-black text-zinc-600">:</div>

                <div className="flex flex-col items-center">
                  <span className="text-xs text-red-400 font-bold mb-1 uppercase">ศัตรู</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setScoreEnemy((v) => Math.max(0, v - 1))}
                      className="w-8 h-8 rounded bg-zinc-800 hover:bg-zinc-700 text-white font-bold"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min={0}
                      max={30}
                      value={scoreEnemy}
                      onChange={(e) => setScoreEnemy(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-16 h-12 bg-zinc-900 border border-red-500/50 rounded text-center text-2xl font-black text-red-400 focus:outline-none focus:border-red-400"
                    />
                    <button
                      type="button"
                      onClick={() => setScoreEnemy((v) => v + 1)}
                      className="w-8 h-8 rounded bg-zinc-800 hover:bg-zinc-700 text-white font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* 1-Click Score Presets (QoL Feature) */}
              <div className="mt-3 pt-3 border-t border-zinc-800/80 flex flex-wrap items-center justify-center gap-1.5">
                <span className="text-[11px] text-zinc-500 font-bold uppercase mr-1">สกอร์ด่วน:</span>
                {[
                  { label: '13-5 (ขาดลอย)', t: 13, e: 5, r: 'WIN' as const },
                  { label: '13-9 (สวยงาม)', t: 13, e: 9, r: 'WIN' as const },
                  { label: '13-11 (สูสี)', t: 13, e: 11, r: 'WIN' as const },
                  { label: '14-12 (Overtime)', t: 14, e: 12, r: 'WIN' as const },
                  { label: '9-13 (พ่ายแพ้)', t: 9, e: 13, r: 'LOSS' as const },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      setScoreTeam(preset.t);
                      setScoreEnemy(preset.e);
                      setResult(preset.r);
                    }}
                    className="px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-[11px] font-bold text-zinc-300 transition"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Real Match MVP Picker */}
            <div className="mb-6">
              <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-yellow-400">
                  <Trophy className="h-4 w-4" /> เลือก Match MVP ตัวจริงของเกมนี้
                </span>
                <span className="text-[10px] text-zinc-500 lowercase">คลิกเพื่อเลือก</span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {players.map((name, index) => {
                  const agent = assignments[index];
                  const isSelected = matchMvpName === name;
                  const initialStatus = playerStatuses[index];

                  return (
                    <button
                      key={name + index}
                      type="button"
                      onClick={() => setMatchMvpName(name)}
                      className={`relative flex flex-col items-center p-2 rounded-lg border transition-all duration-200 ${
                        isSelected
                          ? 'bg-yellow-500/20 border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.3)] scale-105'
                          : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-600 opacity-70 hover:opacity-100'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute -top-2 -right-1 bg-yellow-400 text-black rounded-full p-0.5 shadow-md">
                          <Trophy className="h-3 w-3" />
                        </div>
                      )}

                      {/* Agent avatar icon */}
                      {agent?.image ? (
                        <img
                          src={agent.image}
                          alt={agent.name}
                          className="w-10 h-10 object-contain rounded-full bg-zinc-800 p-0.5 mb-1"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-xs text-zinc-400 mb-1">
                          ?
                        </div>
                      )}

                      <span className="text-xs font-bold text-white truncate max-w-full">{name}</span>
                      <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                        {agent && getRoleIcon(agent.role)}
                        {agent ? agent.name : 'Unknown'}
                      </span>

                      {initialStatus && (
                        <span
                          className={`mt-1 text-[9px] font-black uppercase px-1 rounded ${
                            initialStatus === 'MVP' ? 'bg-yellow-500/30 text-yellow-300' : 'bg-blue-500/30 text-blue-300'
                          }`}
                        >
                          {initialStatus}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Notes Input */}
            <div className="mb-6">
              <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2 flex items-center gap-1.5">
                <MessageSquare className="h-3.5 w-3.5" /> บันทึกช่วยจำ (Notes / Highlights)
              </label>
              <input
                type="text"
                placeholder="เช่น คลัทช์ 1v3 วินสุดท้าย, Eco ace A site..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-red-500"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-2 border-t border-zinc-800">
              <Button variant="outline" onClick={onClose} className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
                ยกเลิก
              </Button>
              <Button
                onClick={handleSave}
                disabled={savedSuccess}
                className={`font-bold px-6 py-2.5 flex items-center gap-2 shadow-lg transition-all ${
                  savedSuccess
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-red-500/30'
                }`}
              >
                {savedSuccess ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" /> บันทึกสำเร็จ!
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" /> บันทึกข้อมูลแมตช์
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
