import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, X, Ban, Check, Swords, RotateCcw, Clock, Zap } from 'lucide-react';
import { Button } from './ui/button';
import { 
  type ValorantMap, 
  ACTIVE_COMPETITIVE_MAPS, 
  MAPS, 
  MAP_IMAGES, 
  getMapImage 
} from '@/data/valorant';

interface MapVetoModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSelectMap: (map: ValorantMap) => void;
  readonly onSelectAndRoll?: (map: ValorantMap) => void;
  readonly onPlaySound?: () => void;
}

export function MapVetoModal({
  isOpen,
  onClose,
  onSelectMap,
  onSelectAndRoll,
  onPlaySound,
}: MapVetoModalProps) {
  const [useActivePoolOnly, setUseActivePoolOnly] = useState(true);
  const [team1Name, setTeam1Name] = useState('Team Alpha');
  const [team2Name, setTeam2Name] = useState('Team Omega');
  const [currentTurn, setCurrentTurn] = useState<'TEAM_1' | 'TEAM_2'>('TEAM_1');
  const [bannedMaps, setBannedMaps] = useState<Set<ValorantMap>>(new Set());
  const [history, setHistory] = useState<Array<{ team: string; map: ValorantMap; action: 'BAN' }>>([]);
  const [timeLeft, setTimeLeft] = useState(30);

  const baseMapPool = useActivePoolOnly ? ACTIVE_COMPETITIVE_MAPS : MAPS;
  const remainingMaps = baseMapPool.filter(m => !bannedMaps.has(m));
  const isDeciderReached = remainingMaps.length === 1;
  const deciderMap = isDeciderReached ? remainingMaps[0] : null;

  // 30-Second Turn Countdown Timer
  useEffect(() => {
    if (!isOpen || isDeciderReached) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (remainingMaps.length > 1) {
            const randomPick = remainingMaps[Math.floor(Math.random() * remainingMaps.length)];
            handleBanMap(randomPick);
          }
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, isDeciderReached, remainingMaps, currentTurn]);

  // Reset timer on turn change
  useEffect(() => {
    setTimeLeft(30);
  }, [currentTurn]);

  const handleBanMap = (map: ValorantMap) => {
    if (bannedMaps.has(map) || isDeciderReached) return;
    onPlaySound?.();

    const team = currentTurn === 'TEAM_1' ? team1Name : team2Name;
    const nextBanned = new Set(bannedMaps);
    nextBanned.add(map);
    setBannedMaps(nextBanned);

    setHistory(prev => [...prev, { team, map, action: 'BAN' }]);
    setCurrentTurn(prev => (prev === 'TEAM_1' ? 'TEAM_2' : 'TEAM_1'));
  };

  const handleReset = () => {
    onPlaySound?.();
    setBannedMaps(new Set());
    setHistory([]);
    setCurrentTurn('TEAM_1');
  };

  const handleCoinFlip = () => {
    onPlaySound?.();
    const first = Math.random() > 0.5 ? 'TEAM_1' : 'TEAM_2';
    setCurrentTurn(first);
  };

  const handleConfirmDecider = (map: ValorantMap) => {
    onSelectMap(map);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 md:px-6 md:py-4 border-b border-zinc-800 bg-zinc-900/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-red-600/20 border border-red-500/30 text-red-500">
                  <Swords className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-black uppercase text-white tracking-wider flex items-center gap-2">
                    VCT Tournament Map Veto
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-600/20 text-red-400 border border-red-500/30">
                      Pro Scrim Draft
                    </span>
                  </h2>
                  <p className="text-xs text-zinc-400">
                    ดราฟต์แบนแผนที่สไตล์การแข่งขันอย่างเป็นทางการ สลับกันแบนจนเหลือแมพชี้ขาด
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

            {/* Controls Bar */}
            <div className="p-4 border-b border-zinc-800/80 bg-zinc-900/30 flex flex-wrap items-center justify-between gap-3">
              {/* Teams Input */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 bg-zinc-950 px-2 py-1 rounded-lg border border-zinc-800">
                  <span className="text-[10px] font-bold text-red-400">T1:</span>
                  <input
                    type="text"
                    value={team1Name}
                    onChange={(e) => setTeam1Name(e.target.value)}
                    className="bg-transparent text-xs font-bold text-white w-24 focus:outline-none"
                  />
                </div>

                <span className="text-zinc-600 font-bold text-xs">VS</span>

                <div className="flex items-center gap-1.5 bg-zinc-950 px-2 py-1 rounded-lg border border-zinc-800">
                  <span className="text-[10px] font-bold text-blue-400">T2:</span>
                  <input
                    type="text"
                    value={team2Name}
                    onChange={(e) => setTeam2Name(e.target.value)}
                    className="bg-transparent text-xs font-bold text-white w-24 focus:outline-none"
                  />
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCoinFlip}
                  className="text-xs h-7 border-zinc-700 bg-zinc-900 text-zinc-300 hover:text-white"
                  title="สุ่มว่าทีมไหนแบนก่อน"
                >
                  🪙 Coin Flip
                </Button>
              </div>

              {/* Pool and Reset */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setUseActivePoolOnly(!useActivePoolOnly);
                    handleReset();
                  }}
                  className="px-2.5 py-1 rounded text-xs font-bold bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white"
                >
                  {useActivePoolOnly ? 'VCT 7 Maps' : 'All 13 Maps'}
                </button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleReset}
                  className="text-xs h-7 border-zinc-700 hover:bg-zinc-800 text-zinc-400"
                >
                  <RotateCcw className="h-3 w-3 mr-1" /> รีเซ็ต
                </Button>
              </div>
            </div>

            {/* Turn Announcement Banner */}
            <div className="px-5 py-2.5 bg-zinc-950 border-b border-zinc-850 flex items-center justify-between">
              {isDeciderReached && deciderMap ? (
                <div className="w-full flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-black text-amber-400 uppercase tracking-widest flex items-center gap-1.5 animate-pulse">
                    <Trophy className="h-4 w-4" /> แผนที่ชี้ขาด (DECIDER MAP): {deciderMap}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleConfirmDecider(deciderMap)}
                      className="border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs flex items-center gap-1.5"
                    >
                      <Check className="h-3.5 w-3.5 text-emerald-400" /> ยืนยันด่านนี้
                    </Button>
                    {onSelectAndRoll && (
                      <Button
                        size="sm"
                        onClick={() => {
                          onSelectAndRoll(deciderMap);
                          onClose();
                        }}
                        className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-red-500/25"
                      >
                        <Zap className="h-3.5 w-3.5 fill-amber-400" /> สุ่มตัวละครทันที (Randomize)
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="w-full flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-400 font-bold uppercase">ถึงตาแบนของ:</span>
                    <span className={`px-2.5 py-0.5 rounded font-black text-xs uppercase tracking-wider ${
                      currentTurn === 'TEAM_1' ? 'bg-red-600/20 text-red-400 border border-red-500/30' : 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                    }`}>
                      {currentTurn === 'TEAM_1' ? team1Name : team2Name}
                    </span>
                    <span className="text-[11px] text-zinc-500 hidden sm:inline">(คลิกที่ด่านที่ต้องการแบนออก)</span>
                  </div>

                  {/* 30s Countdown Badge */}
                  <div className={`flex items-center gap-1 text-xs font-mono font-bold px-2 py-0.5 rounded-full border transition-colors ${
                    timeLeft <= 5 
                      ? 'bg-red-600/30 text-red-400 border-red-500 animate-pulse' 
                      : timeLeft <= 10 
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                        : 'bg-zinc-900 text-zinc-300 border-zinc-700'
                  }`}>
                    <Clock className="w-3 h-3" />
                    <span>{timeLeft}s</span>
                  </div>
                </div>
              )}
            </div>

            {/* Maps Grid */}
            <div className="p-5 overflow-y-auto flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {baseMapPool.map((map) => {
                const isBanned = bannedMaps.has(map);
                const isDecider = isDeciderReached && remainingMaps.includes(map);
                const imgSrc = MAP_IMAGES[map] || getMapImage(map);

                return (
                  <motion.div
                    key={map}
                    whileHover={!isBanned && !isDeciderReached ? { scale: 1.02 } : {}}
                    whileTap={!isBanned && !isDeciderReached ? { scale: 0.98 } : {}}
                    onClick={() => {
                      if (isDecider) {
                        handleConfirmDecider(map);
                      } else if (!isBanned) {
                        handleBanMap(map);
                      }
                    }}
                    className={`relative rounded-xl overflow-hidden border h-36 flex flex-col justify-end p-3 cursor-pointer transition select-none group ${
                      isDecider
                        ? 'border-amber-400 ring-2 ring-amber-400/50 shadow-[0_0_20px_rgba(245,158,11,0.4)]'
                        : isBanned
                        ? 'border-zinc-800/40 opacity-30 grayscale cursor-not-allowed'
                        : 'border-zinc-800 hover:border-red-500/80 shadow-md'
                    }`}
                  >
                    {/* Background image */}
                    <img
                      src={imgSrc}
                      alt={map}
                      className="absolute inset-0 w-full h-full object-cover pointer-events-none group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none" />

                    {/* Banned Overlay */}
                    {isBanned && (
                      <div className="absolute inset-0 bg-red-950/70 backdrop-blur-[2px] flex flex-col items-center justify-center text-center p-2 z-10">
                        <Ban className="h-8 w-8 text-red-500 mb-1" />
                        <span className="text-xs font-black uppercase text-red-400 tracking-wider">
                          BANNED
                        </span>
                      </div>
                    )}

                    {/* Decider Overlay Badge */}
                    {isDecider && (
                      <div className="absolute top-2 right-2 bg-amber-500 text-black font-black text-[10px] px-2 py-0.5 rounded uppercase tracking-wider z-20 shadow">
                        ★ DECIDER
                      </div>
                    )}

                    {/* Map Name */}
                    <div className="relative z-10">
                      <span className="text-base font-black uppercase tracking-wider text-white drop-shadow">
                        {map}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Veto History Log */}
            {history.length > 0 && (
              <div className="px-5 py-2.5 bg-zinc-950 border-t border-zinc-800/80 flex items-center gap-2 overflow-x-auto text-[11px] text-zinc-400 scrollbar-none">
                <span className="font-bold uppercase text-zinc-500 shrink-0">Log:</span>
                {history.map((h, i) => (
                  <span key={i} className="shrink-0 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                    <span className="text-white font-bold">{h.team}</span> banned <span className="text-red-400 font-bold">{h.map}</span>
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
