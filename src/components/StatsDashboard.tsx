import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  X,
  Flame,
  TrendingUp,
  Download,
  Upload,
  Trash2,
  Sparkles,
  Shield,
  Users,
  Sword,
  Target,
  Clock,
  CheckCircle2,
  XCircle,
  BarChart3,
  Skull,
  RefreshCw,
} from 'lucide-react';
import { Button } from './ui/button';
import { useMatchStats } from '@/hooks/useMatchStats';
import { useValorantData } from '@/hooks/useValorantData';
import { type Role } from '@/data/valorant';

interface StatsDashboardProps {
  show: boolean;
  onClose: () => void;
}

type TabType = 'overview' | 'players' | 'meta' | 'curse' | 'data';

const getRoleIcon = (role: Role) => {
  switch (role) {
    case 'Duelist':
      return <Sword className="h-3.5 w-3.5" />;
    case 'Controller':
      return <Users className="h-3.5 w-3.5" />;
    case 'Initiator':
      return <Target className="h-3.5 w-3.5" />;
    case 'Sentinel':
      return <Shield className="h-3.5 w-3.5" />;
    default:
      return null;
  }
};

const getRoleColor = (role: Role) => {
  switch (role) {
    case 'Duelist':
      return 'text-red-400 bg-red-500/10 border-red-500/30';
    case 'Controller':
      return 'text-purple-400 bg-purple-500/10 border-purple-500/30';
    case 'Initiator':
      return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    case 'Sentinel':
      return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
    default:
      return 'text-zinc-400 bg-zinc-800 border-zinc-700';
  }
};

function formatTimeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return 'เมื่อสักครู่';
  if (minutes < 60) return `${minutes} นาทีที่แล้ว`;
  if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`;
  if (days === 1) return 'เมื่อวานนี้';
  return `${days} วันที่แล้ว`;
}

export function StatsDashboard({ show, onClose }: StatsDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [roleFilter, setRoleFilter] = useState<Role | 'ALL'>('ALL');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Live API status
  const {
    agents: liveAgents,
    maps: liveMaps,
    isLive: isApiLive,
    isLoading: isApiLoading,
    lastUpdated,
    refreshData: refreshApiData,
  } = useValorantData();

  const {
    matches,
    overallStats,
    playerStats,
    agentStats,
    mapStats,
    deleteMatch,
    clearHistory,
    exportJson,
    importJson,
    loadSampleData,
  } = useMatchStats();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const res = importJson(content);
        if (res.success) {
          setImportStatus(`✅ นำเข้าข้อมูลสำเร็จ ${res.count} แมตช์`);
        } else {
          setImportStatus(`❌ เกิดข้อผิดพลาด: ${res.error}`);
        }
        setTimeout(() => setImportStatus(null), 4000);
      }
    };
    reader.readAsText(file);
  };

  const filteredAgentStats = agentStats.filter((a) => {
    if (roleFilter === 'ALL') return true;
    return a.role === roleFilter;
  });

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-2 md:p-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25 }}
            className="relative bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-6xl h-[92vh] flex flex-col shadow-2xl shadow-red-500/10 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 md:px-8 md:py-5 border-b border-zinc-800 bg-zinc-900/60">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-red-600/20 border border-red-500/30 text-red-500">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl md:text-2xl font-black uppercase text-white tracking-widest">
                      Squad Analytics & Stats
                    </h2>
                    <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs font-bold border border-red-500/30">
                      {matches.length} Matches
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400">สถิติการเล่น คำสาปวงล้อ และเมต้าประจำแก๊ง</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-1 md:gap-2 px-4 md:px-8 border-b border-zinc-800/80 bg-zinc-900/30 overflow-x-auto scrollbar-none">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-3 px-3 md:px-4 text-xs md:text-sm font-bold uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'overview'
                    ? 'border-red-500 text-red-400 bg-red-500/5'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <TrendingUp className="h-4 w-4" /> ภาพรวมทีม (Overview)
              </button>

              <button
                onClick={() => setActiveTab('players')}
                className={`py-3 px-3 md:px-4 text-xs md:text-sm font-bold uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'players'
                    ? 'border-red-500 text-red-400 bg-red-500/5'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Trophy className="h-4 w-4" /> สถิติเพื่อน (Leaderboard)
              </button>

              <button
                onClick={() => setActiveTab('meta')}
                className={`py-3 px-3 md:px-4 text-xs md:text-sm font-bold uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'meta'
                    ? 'border-red-500 text-red-400 bg-red-500/5'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Sword className="h-4 w-4" /> สถิติตัวละคร & ด่าน
              </button>

              <button
                onClick={() => setActiveTab('curse')}
                className={`py-3 px-3 md:px-4 text-xs md:text-sm font-bold uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'curse'
                    ? 'border-red-500 text-red-400 bg-red-500/5'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Skull className="h-4 w-4" /> คำสาปวงล้อ (Wheel Curse)
              </button>

              <button
                onClick={() => setActiveTab('data')}
                className={`py-3 px-3 md:px-4 text-xs md:text-sm font-bold uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ml-auto ${
                  activeTab === 'data'
                    ? 'border-red-500 text-red-400 bg-red-500/5'
                    : 'border-transparent text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <Download className="h-4 w-4" /> จัดการข้อมูล
              </button>
            </div>

            {/* Tab Content Body (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
              {/* Empty State Banner (if no matches yet) */}
              {matches.length === 0 && activeTab !== 'data' && (
                <div className="bg-gradient-to-r from-red-950/40 via-zinc-900 to-zinc-900 border border-red-500/30 rounded-xl p-6 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 mx-auto flex items-center justify-center">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white uppercase tracking-wider">ยังไม่มีประวัติการแข่งที่ถูกบันทึก</h3>
                  <p className="text-xs text-zinc-400 max-w-md mx-auto">
                    เมื่อสุ่มตัวละครเสร็จแล้ว คุณสามารถกดปุ่ม <b>"บันทึกผลการแข่ง"</b> ในหน้าสรุปผล หรือกดปุ่มด้านล่างเพื่อทดลองโหลดข้อมูลจำลองมาดูก่อนได้เลย
                  </p>
                  <Button
                    onClick={loadSampleData}
                    className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase px-5 py-2"
                  >
                    ⚡ โหลดข้อมูลตัวอย่าง (Load Sample Data)
                  </Button>
                </div>
              )}

              {/* ----------------- TAB 1: OVERVIEW ----------------- */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Top KPI Cards Grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                    {/* Winrate KPI */}
                    <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Team Winrate</span>
                      <div className="flex items-baseline gap-2 my-2">
                        <span
                          className={`text-3xl md:text-4xl font-black ${
                            overallStats.winrate >= 50 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {overallStats.winrate}%
                        </span>
                        <span className="text-xs text-zinc-500 font-bold">
                          ({overallStats.wins}W - {overallStats.losses}L)
                        </span>
                      </div>
                      <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${overallStats.winrate >= 50 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                          style={{ width: `${overallStats.winrate}%` }}
                        />
                      </div>
                    </div>

                    {/* Total Matches KPI */}
                    <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Total Matches</span>
                      <div className="text-3xl md:text-4xl font-black text-white my-2">{overallStats.totalMatches}</div>
                      <span className="text-xs text-zinc-500">เกมที่บันทึกผลแล้วทั้งหมด</span>
                    </div>

                    {/* Current Streak KPI */}
                    <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                        <Flame className="h-3.5 w-3.5 text-amber-500" /> Current Streak
                      </span>
                      <div className="flex items-center gap-2 my-2">
                        {overallStats.currentStreak.type === 'WIN' && (
                          <span className="text-2xl md:text-3xl font-black text-emerald-400 flex items-center gap-1.5">
                            🔥 {overallStats.currentStreak.count} WINS
                          </span>
                        )}
                        {overallStats.currentStreak.type === 'LOSS' && (
                          <span className="text-2xl md:text-3xl font-black text-rose-400 flex items-center gap-1.5">
                            💀 {overallStats.currentStreak.count} LOSSES
                          </span>
                        )}
                        {overallStats.currentStreak.type === 'NONE' && (
                          <span className="text-2xl font-black text-zinc-600">-</span>
                        )}
                      </div>
                      <span className="text-xs text-zinc-500">สถิติติดต่อกันปัจจุบัน</span>
                    </div>

                    {/* Best Win Streak KPI */}
                    <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                        <Trophy className="h-3.5 w-3.5 text-yellow-500" /> Best Win Streak
                      </span>
                      <div className="text-3xl md:text-4xl font-black text-yellow-400 my-2">
                        {overallStats.bestWinStreak} <span className="text-sm font-bold text-zinc-400">Wins</span>
                      </div>
                      <span className="text-xs text-zinc-500">ชนะติดต่อกันสูงสุดตลอดกาล</span>
                    </div>
                  </div>

                  {/* Recent Form Pills */}
                  {overallStats.recentForm.length > 0 && (
                    <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-xl p-4 flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-zinc-400" />
                        <span className="text-xs font-bold uppercase text-zinc-300">Recent Form (5 เกมล่าสุด):</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {overallStats.recentForm.map((res, i) => (
                          <span
                            key={i}
                            className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black uppercase ${
                              res === 'WIN'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm shadow-emerald-500/20'
                                : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                            }`}
                          >
                            {res === 'WIN' ? 'W' : 'L'}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Match History Feed */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-black uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                        <Clock className="h-4 w-4 text-red-500" /> ประวัติการแข่งย้อนหลัง (Match History)
                      </h3>
                      <span className="text-xs text-zinc-500">{matches.length} แมตช์</span>
                    </div>

                    <div className="space-y-3">
                      {matches.map((match) => {
                        const isWin = match.result === 'WIN';

                        return (
                          <div
                            key={match.id}
                            className={`relative bg-zinc-900/80 border rounded-xl p-4 overflow-hidden transition-all hover:border-zinc-700 ${
                              isWin ? 'border-emerald-500/30' : 'border-rose-500/30'
                            }`}
                          >
                            {/* Map background splash with overlay */}
                            {match.mapImage && (
                              <div
                                className="absolute inset-0 opacity-15 bg-cover bg-center pointer-events-none"
                                style={{ backgroundImage: `url(${match.mapImage})` }}
                              />
                            )}

                            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                              {/* Left: Result, Map & Score */}
                              <div className="flex items-center gap-4">
                                <div
                                  className={`px-3 py-1.5 rounded-lg font-black text-xs uppercase tracking-widest flex items-center gap-1.5 ${
                                    isWin
                                      ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                                      : 'bg-rose-600 text-white shadow-lg shadow-rose-600/20'
                                  }`}
                                >
                                  {isWin ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                                  {isWin ? 'VICTORY' : 'DEFEAT'}
                                </div>

                                <div>
                                  <div className="flex items-baseline gap-2">
                                    <h4 className="text-lg font-black text-white uppercase">{match.map}</h4>
                                    <span className="text-sm font-black text-zinc-400">
                                      <span className={isWin ? 'text-emerald-400' : 'text-zinc-300'}>
                                        {match.scoreTeam}
                                      </span>{' '}
                                      -{' '}
                                      <span className={!isWin ? 'text-rose-400' : 'text-zinc-400'}>
                                        {match.scoreEnemy}
                                      </span>
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-zinc-500">{formatTimeAgo(match.timestamp)}</span>
                                </div>
                              </div>

                              {/* Center: Players & Agents */}
                              <div className="flex items-center gap-2 flex-wrap">
                                {match.players.map((p, pIndex) => (
                                  <div
                                    key={p.name + pIndex}
                                    className="flex items-center gap-1.5 bg-zinc-950/70 border border-zinc-800 rounded-lg py-1 px-2 text-xs"
                                  >
                                    {p.agentImage ? (
                                      <img
                                        src={p.agentImage}
                                        alt={p.agentName}
                                        className="w-5 h-5 rounded-full object-contain bg-zinc-800"
                                      />
                                    ) : (
                                      <span className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-[10px]">
                                        ?
                                      </span>
                                    )}
                                    <span className="font-bold text-zinc-200">{p.name}</span>
                                    {p.isMatchMvp && (
                                      <span title="Match MVP" className="text-yellow-400">
                                        👑
                                      </span>
                                    )}
                                    {p.assignedStatus === 'BOTTOM' && (
                                      <span title="Bot Frag Punishment" className="text-blue-400 text-[10px]">
                                        💀
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>

                              {/* Right: Notes & Delete Action */}
                              <div className="flex items-center justify-between md:justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-zinc-800">
                                {match.notes && (
                                  <span className="text-xs text-zinc-400 italic truncate max-w-[200px]" title={match.notes}>
                                    "{match.notes}"
                                  </span>
                                )}
                                <button
                                  onClick={() => deleteMatch(match.id)}
                                  className="text-zinc-600 hover:text-rose-400 p-1.5 rounded hover:bg-zinc-800 transition"
                                  title="ลบแมตช์นี้"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* ----------------- TAB 2: LEADERBOARD (PLAYERS) ----------------- */}
              {activeTab === 'players' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-black uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-yellow-400" /> ตารางอันดับสถิติผู้เล่น (Player Leaderboard)
                    </h3>
                    <span className="text-xs text-zinc-500">เรียงตามจำนวนชัยชนะและ Winrate</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {playerStats.map((player, index) => {
                      return (
                        <div
                          key={player.name}
                          className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-5 relative overflow-hidden flex flex-col justify-between hover:border-zinc-700 transition"
                        >
                          <div>
                            {/* Player Header */}
                            <div className="flex items-start justify-between gap-3 mb-3">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm ${
                                    index === 0
                                      ? 'bg-yellow-400 text-black shadow-md shadow-yellow-400/20'
                                      : index === 1
                                        ? 'bg-zinc-300 text-black'
                                        : index === 2
                                          ? 'bg-amber-700 text-white'
                                          : 'bg-zinc-800 text-zinc-400'
                                  }`}
                                >
                                  #{index + 1}
                                </div>
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <h4 className="text-lg font-black text-white uppercase">{player.name}</h4>
                                  </div>
                                  <span
                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${player.badge.color}`}
                                  >
                                    <span>{player.badge.icon}</span> {player.badge.title}
                                  </span>
                                </div>
                              </div>

                              {/* Winrate Big Tag */}
                              <div className="text-right">
                                <div
                                  className={`text-2xl font-black ${
                                    player.winrate >= 50 ? 'text-emerald-400' : 'text-rose-400'
                                  }`}
                                >
                                  {player.winrate}%
                                </div>
                                <span className="text-[10px] text-zinc-500 font-bold uppercase">
                                  {player.wins}W - {player.losses}L ({player.totalMatches} Matches)
                                </span>
                              </div>
                            </div>

                            {/* Winrate Progress Bar */}
                            <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden mb-4">
                              <div
                                className={`h-full ${player.winrate >= 50 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                                style={{ width: `${player.winrate}%` }}
                              />
                            </div>

                            {/* Mini Metrics (MVP / Bottom counts) */}
                            <div className="grid grid-cols-3 gap-2 py-2 px-3 bg-zinc-950/60 rounded-lg border border-zinc-800/80 mb-4 text-center">
                              <div>
                                <span className="text-[10px] text-zinc-500 uppercase block">Match MVP 🏆</span>
                                <span className="text-sm font-black text-yellow-400">{player.matchMvpCount} ครั้ง</span>
                              </div>
                              <div>
                                <span className="text-[10px] text-zinc-500 uppercase block">Wheel Bottom 💀</span>
                                <span className="text-sm font-black text-blue-400">{player.assignedBottomCount} ครั้ง</span>
                              </div>
                              <div>
                                <span className="text-[10px] text-zinc-500 uppercase block">Wheel MVP ⭐</span>
                                <span className="text-sm font-black text-purple-400">{player.assignedMvpCount} ครั้ง</span>
                              </div>
                            </div>
                          </div>

                          {/* Most Played Agents by this Player */}
                          <div>
                            <span className="text-[10px] font-bold uppercase text-zinc-400 block mb-1.5">
                              Top Agents ที่สุ่มได้บ่อยสุด:
                            </span>
                            <div className="flex items-center gap-2 flex-wrap">
                              {player.mostPlayedAgents.slice(0, 3).map((agent) => (
                                <div
                                  key={agent.agentName}
                                  className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1 text-xs"
                                >
                                  {agent.agentImage && (
                                    <img
                                      src={agent.agentImage}
                                      alt={agent.agentName}
                                      className="w-4 h-4 rounded-full object-contain"
                                    />
                                  )}
                                  <span className="font-bold text-white">{agent.agentName}</span>
                                  <span className="text-[10px] text-zinc-500">
                                    ({agent.picks} ครั้ง • {agent.winrate}%)
                                  </span>
                                </div>
                              ))}
                              {player.mostPlayedAgents.length === 0 && (
                                <span className="text-xs text-zinc-600 italic">ยังไม่มีข้อมูล</span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ----------------- TAB 3: AGENT & MAP META ----------------- */}
              {activeTab === 'meta' && (
                <div className="space-y-6">
                  {/* Role Filter Buttons */}
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <h3 className="text-sm font-black uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                      <Sword className="h-4 w-4 text-red-500" /> สถิติตัวละครที่สุ่มได้ (Agent Performance)
                    </h3>
                    <div className="flex items-center gap-1">
                      {(['ALL', 'Duelist', 'Controller', 'Initiator', 'Sentinel'] as const).map((role) => (
                        <button
                          key={role}
                          onClick={() => setRoleFilter(role)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition ${
                            roleFilter === role
                              ? 'bg-red-600 text-white shadow-md shadow-red-500/20'
                              : 'bg-zinc-900 text-zinc-400 hover:text-white'
                          }`}
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Agents Ranking Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {filteredAgentStats.map((agent) => (
                      <div
                        key={agent.name}
                        className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3 flex flex-col items-center justify-between text-center hover:border-zinc-600 transition"
                      >
                        <div className="w-12 h-12 rounded-full bg-zinc-800 p-1 mb-2 relative">
                          <img src={agent.image} alt={agent.name} className="w-full h-full object-contain" />
                        </div>
                        <h4 className="text-sm font-black text-white uppercase">{agent.name}</h4>
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full border mb-2 flex items-center gap-1 ${getRoleColor(
                            agent.role
                          )}`}
                        >
                          {getRoleIcon(agent.role)}
                          {agent.role}
                        </span>

                        <div className="w-full pt-2 border-t border-zinc-800 text-xs">
                          <div className="flex justify-between items-center text-[10px] text-zinc-400 mb-1">
                            <span>สุ่มได้: {agent.picks} ครั้ง</span>
                            <span className="font-black text-emerald-400">{agent.winrate}% Win</span>
                          </div>
                          <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 h-full" style={{ width: `${agent.winrate}%` }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Map Winrates */}
                  <div className="pt-4 border-t border-zinc-800">
                    <h3 className="text-sm font-black uppercase tracking-wider text-zinc-300 mb-3 flex items-center gap-2">
                      <Target className="h-4 w-4 text-cyan-400" /> สถิติแต่ละด่าน (Map Winrates)
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {mapStats.map((m) => (
                        <div
                          key={m.name}
                          className="relative bg-zinc-900/70 border border-zinc-800 rounded-xl p-3 overflow-hidden flex items-center justify-between"
                        >
                          {m.image && (
                            <div
                              className="absolute inset-0 opacity-20 bg-cover bg-center pointer-events-none"
                              style={{ backgroundImage: `url(${m.image})` }}
                            />
                          )}
                          <div className="relative z-10">
                            <h4 className="text-base font-black text-white uppercase">{m.name}</h4>
                            <span className="text-[10px] text-zinc-400">เล่นไป {m.picks} เกม</span>
                          </div>
                          <div className="relative z-10 text-right">
                            <div
                              className={`text-xl font-black ${m.winrate >= 50 ? 'text-emerald-400' : 'text-rose-400'}`}
                            >
                              {m.winrate}%
                            </div>
                            <span className="text-[10px] text-zinc-500 font-bold">{m.wins} ชนะ</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ----------------- TAB 4: THE WHEEL CURSE ----------------- */}
              {activeTab === 'curse' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-black uppercase tracking-wider text-white flex items-center gap-2">
                      <Skull className="h-5 w-5 text-red-500" /> สถิติคำสาปวงล้อ (The Wheel Curse Analytics)
                    </h3>
                    <p className="text-xs text-zinc-400">
                      เจาะลึกว่า กติกาพิเศษของวงล้อ (บังคับคนบ๊วยเล่น Duelist / สิทธิ์ MVP เลือกตำแหน่ง) ส่งผลต่อชัยชนะจริงหรือไม่!
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Bottom Penalty Card */}
                    <div className="bg-gradient-to-b from-blue-950/30 to-zinc-900/80 border border-blue-500/30 rounded-xl p-6 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
                          <Skull className="h-6 w-6" />
                        </div>
                        <div>
                          <h4 className="text-lg font-black text-white uppercase">Bottom Frag Duelist Penalty</h4>
                          <span className="text-xs text-blue-300">สถิติเมื่อคนบ๊วยถูกบังคับให้เล่น Duelist</span>
                        </div>
                      </div>

                      <div className="flex items-baseline gap-3">
                        <span
                          className={`text-4xl font-black ${
                            overallStats.bottomDuelistStats.winrate >= 50 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {overallStats.bottomDuelistStats.winrate}%
                        </span>
                        <span className="text-xs text-zinc-400">
                          Winrate ({overallStats.bottomDuelistStats.wins} ชนะ / {overallStats.bottomDuelistStats.total} เกม)
                        </span>
                      </div>

                      <div className="p-4 bg-zinc-950/70 rounded-lg border border-zinc-800 text-xs text-zinc-300 leading-relaxed">
                        {overallStats.bottomDuelistStats.total === 0 ? (
                          <span>ยังไม่มีข้อมูลการบังคับคนบ๊วยเล่น Duelist</span>
                        ) : overallStats.bottomDuelistStats.winrate < 50 ? (
                          <span className="text-rose-300 font-bold">
                            ⚠️ คำสาปมีจริง! เมื่อคนบ๊วยโดนบังคับเล่น Duelist ทีมมีโอกาสแพ้สูงถึง{' '}
                            {100 - overallStats.bottomDuelistStats.winrate}%
                          </span>
                        ) : (
                          <span className="text-emerald-300 font-bold">
                            ✨ ปาฏิหาริย์คนบ๊วย! โดนบังคับจับ Duelist แต่ยังแบกทีมคว้าชัยชนะได้ถึง{' '}
                            {overallStats.bottomDuelistStats.winrate}%
                          </span>
                        )}
                      </div>
                    </div>

                    {/* MVP Advantage Card */}
                    <div className="bg-gradient-to-b from-yellow-950/30 to-zinc-900/80 border border-yellow-500/30 rounded-xl p-6 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                          <Trophy className="h-6 w-6" />
                        </div>
                        <div>
                          <h4 className="text-lg font-black text-white uppercase">MVP Role Advantage</h4>
                          <span className="text-xs text-yellow-300">สถิติเมื่อ MVP เลือก Role ที่ถนัดล่วงหน้า</span>
                        </div>
                      </div>

                      <div className="flex items-baseline gap-3">
                        <span
                          className={`text-4xl font-black ${
                            overallStats.mvpChoiceStats.winrate >= 50 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {overallStats.mvpChoiceStats.winrate}%
                        </span>
                        <span className="text-xs text-zinc-400">
                          Winrate ({overallStats.mvpChoiceStats.wins} ชนะ / {overallStats.mvpChoiceStats.total} เกม)
                        </span>
                      </div>

                      <div className="p-4 bg-zinc-950/70 rounded-lg border border-zinc-800 text-xs text-zinc-300 leading-relaxed">
                        {overallStats.mvpChoiceStats.total === 0 ? (
                          <span>ยังไม่มีข้อมูลเมื่อ MVP ใช้สิทธิ์เลือกตำแหน่ง</span>
                        ) : overallStats.mvpChoiceStats.winrate >= 50 ? (
                          <span className="text-emerald-300 font-bold">
                            👑 MVP แบกของจริง! เมื่อ MVP ได้เล่นตำแหน่งที่ต้องการ อัตราการชนะของทีมพุ่งสูงถึง{' '}
                            {overallStats.mvpChoiceStats.winrate}%
                          </span>
                        ) : (
                          <span className="text-rose-300 font-bold">
                            😅 MVP ยังตึงมือ! แม้จะเลือก Role ที่ถนัดแล้ว แต่อัตราการชนะยังอยู่ที่{' '}
                            {overallStats.mvpChoiceStats.winrate}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ----------------- TAB 5: DATA MANAGEMENT ----------------- */}
              {activeTab === 'data' && (
                <div className="max-w-2xl mx-auto space-y-6">
                  <div>
                    <h3 className="text-lg font-black uppercase tracking-wider text-white flex items-center gap-2">
                      <Download className="h-5 w-5 text-red-500" /> จัดการและสำรองข้อมูล (Data Management)
                    </h3>
                    <p className="text-xs text-zinc-400">
                      สำรองไฟล์สถิติ นำเข้าข้อมูลจากเครื่องเพื่อน หรือรีเซ็ตข้อมูลทั้งหมด
                    </p>
                  </div>

                  {importStatus && (
                    <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-700 text-sm font-bold text-white">
                      {importStatus}
                    </div>
                  )}

                  <div className="space-y-4">
                    {/* Live Valorant-API Sync Status */}
                    <div className="bg-zinc-900/80 border border-emerald-500/30 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`w-2.5 h-2.5 rounded-full ${
                              isApiLive ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse' : 'bg-amber-500'
                            }`}
                          />
                          <h4 className="text-sm font-bold text-white">
                            {isApiLive
                              ? 'เชื่อมต่อสดกับ Valorant-API.com (Online)'
                              : 'ใช้งานโหมด Offline (Static Fallback)'}
                          </h4>
                        </div>
                        <p className="text-xs text-zinc-400">
                          พร้อมใช้งานตัวละคร {liveAgents.length} ตัว • แผนที่ {liveMaps.length} ด่าน{' '}
                          {lastUpdated ? `(อัปเดตล่าสุด: ${new Date(lastUpdated).toLocaleTimeString()})` : ''}
                        </p>
                      </div>
                      <Button
                        onClick={refreshApiData}
                        disabled={isApiLoading}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-2 text-xs"
                      >
                        <RefreshCw className={`h-4 w-4 ${isApiLoading ? 'animate-spin' : ''}`} />
                        {isApiLoading ? 'กำลัง Sync...' : 'Sync Now (อัปเดตสด)'}
                      </Button>
                    </div>

                    {/* Export JSON */}
                    <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-5 flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-white">Export ข้อมูลสถิติ (.JSON)</h4>
                        <p className="text-xs text-zinc-400">ดาวน์โหลดประวัติการเล่นทั้งหมดเก็บไว้ในเครื่อง</p>
                      </div>
                      <Button
                        onClick={exportJson}
                        disabled={matches.length === 0}
                        className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" /> Export
                      </Button>
                    </div>

                    {/* Import JSON */}
                    <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-5 flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-white">Import ข้อมูลสถิติ (.JSON)</h4>
                        <p className="text-xs text-zinc-400">นำเข้าไฟล์ประวัติการเล่นจากไฟล์สำรอง</p>
                      </div>
                      <label className="cursor-pointer">
                        <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
                        <div className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-md font-bold text-sm flex items-center gap-2">
                          <Upload className="h-4 w-4" /> เลือกไฟล์
                        </div>
                      </label>
                    </div>

                    {/* Sample Data */}
                    <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-5 flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-white">โหลดข้อมูลตัวอย่าง (Sample Matches)</h4>
                        <p className="text-xs text-zinc-400">ใส่ข้อมูลจำลอง 4 แมตช์เพื่อทดสอบหน้าต่างสถิติ</p>
                      </div>
                      <Button
                        onClick={loadSampleData}
                        variant="secondary"
                        className="font-bold flex items-center gap-2"
                      >
                        <Sparkles className="h-4 w-4" /> โหลดตัวอย่าง
                      </Button>
                    </div>

                    {/* Clear History */}
                    <div className="bg-rose-950/20 border border-rose-500/30 rounded-xl p-5 flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-rose-300">ล้างประวัติการแข่งทั้งหมด</h4>
                        <p className="text-xs text-zinc-500">ลบข้อมูลแมตช์ทั้งหมดออกจาก Browser</p>
                      </div>
                      <Button
                        onClick={() => {
                          if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบประวัติการแข่งทั้งหมด?')) {
                            clearHistory();
                          }
                        }}
                        disabled={matches.length === 0}
                        variant="destructive"
                        className="font-bold flex items-center gap-2"
                      >
                        <Trash2 className="h-4 w-4" /> ล้างข้อมูล
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
