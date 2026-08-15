import { useState, useMemo } from 'react';
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
  Sword,
  Clock,
  CheckCircle2,
  XCircle,
  BarChart3,
  Skull,
  RefreshCw,
  Search,
  ChevronDown,
  ChevronUp,
  CloudDownload,
  Image as ImageIcon,
} from 'lucide-react';
import { Button } from './ui/button';
import { useMatchStats } from '@/hooks/useMatchStats';
import { useValorantData } from '@/hooks/useValorantData';
import { fetchMatchesFromDatabase } from '@/services/supabaseService';
import { type Role, MAPS_DATA } from '@/data/valorant';
import { type MatchRecord } from '@/types/stats';

interface StatsDashboardProps {
  show: boolean;
  onClose: () => void;
  onShareMatch?: (match: MatchRecord) => void;
}

type TabType = 'overview' | 'players' | 'meta' | 'curse' | 'data';
type LeaderboardSortType = 'winrate' | 'mvp' | 'wins' | 'games';
type AgentSortType = 'picks' | 'winrate';

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

export function StatsDashboard({ show, onClose, onShareMatch }: StatsDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [roleFilter, setRoleFilter] = useState<Role | 'ALL'>('ALL');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // QoL Filters & Sorts
  const [matchSearch, setMatchSearch] = useState<string>('');
  const [matchResultFilter, setMatchResultFilter] = useState<'ALL' | 'WIN' | 'LOSS'>('ALL');
  const [matchMapFilter, setMatchMapFilter] = useState<string>('ALL');
  const [expandedMatchId, setExpandedMatchId] = useState<string | null>(null);

  const [leaderboardSort, setLeaderboardSort] = useState<LeaderboardSortType>('winrate');
  const [playerSearch, setPlayerSearch] = useState<string>('');
  const [agentSort, setAgentSort] = useState<AgentSortType>('picks');

  const [isCloudSyncing, setIsCloudSyncing] = useState<boolean>(false);

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
    addMatch,
  } = useMatchStats();

  const totalRoundsWon = useMemo(() => matches.reduce((acc, m) => acc + (m.scoreTeam || 0), 0), [matches]);
  const totalRoundsLost = useMemo(() => matches.reduce((acc, m) => acc + (m.scoreEnemy || 0), 0), [matches]);

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
    e.target.value = '';
  };

  // 1-Click Pull from Supabase Cloud
  const handleCloudPull = async () => {
    setIsCloudSyncing(true);
    setImportStatus('กำลังดึงข้อมูลแมตช์จาก Supabase Cloud...');

    const res = await fetchMatchesFromDatabase();
    if (res.success && res.matches.length > 0) {
      let added = 0;
      res.matches.forEach((m) => {
        if (!matches.some((existing) => existing.id === m.id)) {
          addMatch(m);
          added++;
        }
      });
      setImportStatus(`✅ ซิงค์จาก Cloud สำเร็จ! เพิ่ม ${added} แมตช์ใหม่ (ทั้งหมด ${res.matches.length} แมตช์)`);
    } else if (res.success && res.matches.length === 0) {
      setImportStatus('ℹ️ ยังไม่มีประวัติแมตช์ที่บันทึกบน Cloud');
    } else {
      setImportStatus(`❌ ${res.error || 'ไม่สามารถดึงข้อมูลจาก Cloud ได้'}`);
    }

    setIsCloudSyncing(false);
    setTimeout(() => setImportStatus(null), 5000);
  };

  // Filtered Match History (QoL)
  const filteredMatches = useMemo(() => {
    return matches.filter((m) => {
      if (matchResultFilter !== 'ALL' && m.result !== matchResultFilter) return false;
      if (matchMapFilter !== 'ALL' && m.map !== matchMapFilter) return false;
      if (matchSearch.trim()) {
        const query = matchSearch.toLowerCase().trim();
        const mapMatch = m.map.toLowerCase().includes(query);
        const playerMatch = m.players.some(
          (p) => p.name.toLowerCase().includes(query) || p.agentName.toLowerCase().includes(query)
        );
        const noteMatch = m.notes?.toLowerCase().includes(query);
        const mvpMatch = m.matchMvpName?.toLowerCase().includes(query);
        if (!mapMatch && !playerMatch && !noteMatch && !mvpMatch) return false;
      }
      return true;
    });
  }, [matches, matchResultFilter, matchMapFilter, matchSearch]);

  // Sorted & Filtered Player Leaderboard (QoL)
  const sortedPlayerStats = useMemo(() => {
    let list = [...playerStats];
    if (playerSearch.trim()) {
      const q = playerSearch.toLowerCase().trim();
      list = list.filter((p) => p.name.toLowerCase().includes(q));
    }

    list.sort((a, b) => {
      if (leaderboardSort === 'winrate') {
        return b.winrate - a.winrate || b.wins - a.wins;
      }
      if (leaderboardSort === 'mvp') {
        return b.matchMvpCount - a.matchMvpCount || b.winrate - a.winrate;
      }
      if (leaderboardSort === 'wins') {
        return b.wins - a.wins || b.winrate - a.winrate;
      }
      if (leaderboardSort === 'games') {
        return b.totalMatches - a.totalMatches || b.winrate - a.winrate;
      }
      return 0;
    });

    return list;
  }, [playerStats, leaderboardSort, playerSearch]);

  // Sorted Agent Stats (QoL)
  const sortedAgentStats = useMemo(() => {
    const list = roleFilter === 'ALL' ? [...agentStats] : agentStats.filter((a) => a.role === roleFilter);
    list.sort((a, b) => {
      if (agentSort === 'winrate') {
        return b.winrate - a.winrate || b.picks - a.picks;
      }
      return b.picks - a.picks || b.winrate - a.winrate;
    });
    return list;
  }, [agentStats, roleFilter, agentSort]);

  // The Wheel Curse Highlights
  const kingOfCarry = useMemo(() => {
    const playersWithMvp = playerStats.filter((p) => p.matchMvpCount > 0);
    if (playersWithMvp.length === 0) return null;
    return playersWithMvp.reduce((prev, cur) => (cur.winrate > prev.winrate ? cur : prev), playersWithMvp[0]);
  }, [playerStats]);

  const chiefVictim = useMemo(() => {
    const list = [...playerStats];
    if (list.length === 0) return null;
    return list.reduce((prev, cur) => (cur.assignedBottomCount > prev.assignedBottomCount ? cur : prev), list[0]);
  }, [playerStats]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 md:p-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25 }}
            className="relative bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-5xl max-h-[94vh] flex flex-col shadow-2xl shadow-red-500/10 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Navigation Bar */}
            <div className="flex items-center justify-between p-4 md:px-6 md:py-4 border-b border-zinc-800 bg-zinc-900/60">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-red-600/20 border border-red-500/30 text-red-500">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-black uppercase text-white tracking-wider">
                    Squad Analytics & Stats
                  </h2>
                  <p className="text-xs text-zinc-400">
                    วิเคราะห์สถิติทีม ชัยชนะ เมต้าตัวละคร และคำสาปวงล้อ
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

            {/* Sticky Tabs Header */}
            <div className="flex items-center gap-1 overflow-x-auto p-2 bg-zinc-900/80 border-b border-zinc-800 scrollbar-none">
              {[
                { id: 'overview', label: 'ภาพรวม (Overview)', icon: <TrendingUp className="h-4 w-4" /> },
                { id: 'players', label: 'ผู้เล่น (Leaderboard)', icon: <Trophy className="h-4 w-4" /> },
                { id: 'meta', label: 'เมต้า (Agent & Map)', icon: <Flame className="h-4 w-4" /> },
                { id: 'curse', label: 'คำสาปวงล้อ (The Curse)', icon: <Skull className="h-4 w-4" /> },
                { id: 'data', label: 'จัดการข้อมูล (Data)', icon: <Download className="h-4 w-4" /> },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold uppercase transition whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-red-600 text-white shadow-lg shadow-red-500/20'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab Content Container */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
              {/* ----------------- TAB 1: OVERVIEW ----------------- */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Big Number Cards Grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                    <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between">
                      <span className="text-[11px] font-bold uppercase text-zinc-400 flex items-center gap-1.5">
                        <Trophy className="h-3.5 w-3.5 text-yellow-400" /> อัตราการชนะ (Winrate)
                      </span>
                      <div className="my-2">
                        <span
                          className={`text-3xl md:text-4xl font-black ${
                            overallStats.winrate >= 50 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {overallStats.winrate}%
                        </span>
                      </div>
                      <span className="text-[11px] text-zinc-500">
                        {overallStats.wins} ชนะ / {overallStats.losses} แพ้ (ทั้งหมด {overallStats.totalMatches} เกม)
                      </span>
                    </div>

                    <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between">
                      <span className="text-[11px] font-bold uppercase text-zinc-400 flex items-center gap-1.5">
                        <Flame className="h-3.5 w-3.5 text-orange-400" /> สตรีคปัจจุบัน (Streak)
                      </span>
                      <div className="my-2 flex items-baseline gap-2">
                        <span
                          className={`text-3xl md:text-4xl font-black ${
                            overallStats.currentStreak.type === 'WIN'
                              ? 'text-emerald-400'
                              : overallStats.currentStreak.type === 'LOSS'
                                ? 'text-rose-400'
                                : 'text-zinc-500'
                          }`}
                        >
                          {overallStats.currentStreak.count}
                        </span>
                        <span className="text-xs font-bold uppercase text-zinc-400">
                          {overallStats.currentStreak.type === 'WIN'
                            ? 'ชนะติด'
                            : overallStats.currentStreak.type === 'LOSS'
                              ? 'แพ้ติด'
                              : 'แมตช์'}
                        </span>
                      </div>
                      <span className="text-[11px] text-zinc-500">
                        ชนะติดสูงสุด: {overallStats.bestWinStreak} เกม
                      </span>
                    </div>

                    <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between">
                      <span className="text-[11px] font-bold uppercase text-zinc-400 flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-blue-400" /> ฟอร์ม 5 เกมล่าสุด
                      </span>
                      <div className="my-2 flex items-center gap-1.5">
                        {overallStats.recentForm.length === 0 ? (
                          <span className="text-xs text-zinc-500">ยังไม่มีข้อมูล</span>
                        ) : (
                          overallStats.recentForm.map((res, i) => (
                            <span
                              key={i}
                              className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs ${
                                res === 'WIN'
                                  ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                                  : 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                              }`}
                            >
                              {res === 'WIN' ? 'W' : 'L'}
                            </span>
                          ))
                        )}
                      </div>
                      <span className="text-[11px] text-zinc-500">ซ้ายคือแมตช์ล่าสุด</span>
                    </div>

                    <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between">
                      <span className="text-[11px] font-bold uppercase text-zinc-400 flex items-center gap-1.5">
                        <Shield className="h-3.5 w-3.5 text-purple-400" /> ผลรวมรอบ (Rounds)
                      </span>
                      <div className="my-2">
                        <span className="text-3xl md:text-4xl font-black text-white">
                          {totalRoundsWon}
                          <span className="text-zinc-500 text-xl font-normal"> / {totalRoundsLost}</span>
                        </span>
                      </div>
                      <span className="text-[11px] text-zinc-500">รอบที่ได้ / รอบที่เสีย</span>
                    </div>
                  </div>

                  {/* Match History with Filters & Search (QoL) */}
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-black uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                          <Clock className="h-4 w-4 text-red-500" /> ประวัติการแข่งล่าสุด (Match History)
                        </h3>
                        <span className="text-xs text-zinc-500">
                          แสดง {filteredMatches.length} จากทั้งหมด {matches.length} แมตช์
                        </span>
                      </div>

                      {/* Filter Controls Bar */}
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Search Input */}
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="ค้นหาชื่อเพื่อน/เอเจนท์..."
                            value={matchSearch}
                            onChange={(e) => setMatchSearch(e.target.value)}
                            className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 pl-8 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 w-44"
                          />
                          <Search className="h-3.5 w-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        </div>

                        {/* Outcome Filter */}
                        <div className="flex bg-zinc-900 border border-zinc-800 rounded-lg p-0.5 text-xs">
                          {(['ALL', 'WIN', 'LOSS'] as const).map((mode) => (
                            <button
                              key={mode}
                              onClick={() => setMatchResultFilter(mode)}
                              className={`px-2.5 py-1 rounded font-bold transition ${
                                matchResultFilter === mode
                                  ? 'bg-zinc-800 text-white shadow-sm'
                                  : 'text-zinc-400 hover:text-white'
                              }`}
                            >
                              {mode === 'ALL' ? 'ทั้งหมด' : mode === 'WIN' ? 'ชนะ' : 'แพ้'}
                            </button>
                          ))}
                        </div>

                        {/* Map Dropdown Filter */}
                        <select
                          value={matchMapFilter}
                          onChange={(e) => setMatchMapFilter(e.target.value)}
                          className="bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none font-bold"
                        >
                          <option value="ALL">ทุกแผนที่ (All Maps)</option>
                          {MAPS_DATA.map((m) => (
                            <option key={m.name} value={m.name}>
                              {m.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {filteredMatches.length === 0 ? (
                      <div className="p-8 text-center bg-zinc-900/40 border border-zinc-800 rounded-xl space-y-2">
                        <p className="text-sm font-bold text-zinc-400">ไม่พบประวัติการแข่งขันที่ตรงกับเงื่อนไข</p>
                        <p className="text-xs text-zinc-500">
                          {matches.length === 0
                            ? 'กดสุ่มตัวละครแล้วบันทึกผลการแข่ง หรือไปที่แท็บจัดการข้อมูลเพื่อโหลดข้อมูลตัวอย่าง'
                            : 'ลองล้างการค้นหาเพื่อดูแมตช์ทั้งหมด'}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {filteredMatches.map((match) => {
                          const isExpanded = expandedMatchId === match.id;
                          const isWin = match.result === 'WIN';

                          return (
                            <div
                              key={match.id}
                              className={`bg-zinc-900/70 border rounded-xl transition overflow-hidden ${
                                isWin ? 'border-emerald-500/30 hover:border-emerald-500/60' : 'border-rose-500/30 hover:border-rose-500/60'
                              }`}
                            >
                              {/* Main Row */}
                              <div
                                onClick={() => setExpandedMatchId(isExpanded ? null : match.id)}
                                className="p-3.5 md:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none"
                              >
                                <div className="flex items-center gap-3">
                                  {/* Result Indicator Badge */}
                                  <div
                                    className={`px-3 py-1.5 rounded-lg font-black text-xs tracking-wider uppercase flex items-center gap-1.5 shrink-0 ${
                                      isWin
                                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                                    }`}
                                  >
                                    {isWin ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                                    <span>{isWin ? 'VICTORY' : 'DEFEAT'}</span>
                                  </div>

                                  {/* Map & Score */}
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-black text-sm text-white uppercase">{match.map}</span>
                                      <span className="text-xs font-mono font-bold text-zinc-300">
                                        ({match.scoreTeam} - {match.scoreEnemy})
                                      </span>
                                    </div>
                                    <span className="text-[11px] text-zinc-500">
                                      {formatTimeAgo(match.timestamp)} • {new Date(match.timestamp).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>

                                {/* Agents Lineup Preview */}
                                <div className="flex items-center justify-between sm:justify-end gap-3">
                                  <div className="flex items-center -space-x-1.5">
                                    {match.players.map((p, i) => (
                                      <div
                                        key={i}
                                        className="w-8 h-8 rounded-full border-2 border-zinc-950 bg-zinc-800 overflow-hidden relative"
                                        title={`${p.name}: ${p.agentName}`}
                                      >
                                        {p.agentImage ? (
                                          <img src={p.agentImage} alt={p.agentName} className="w-full h-full object-cover" />
                                        ) : (
                                          <div className="w-full h-full flex items-center justify-center text-[9px] font-bold">
                                            {p.name.charAt(0)}
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>

                                  <div className="flex items-center gap-2">
                                    {match.matchMvpName && (
                                      <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-500/10 text-yellow-400 border border-yellow-500/30">
                                        👑 MVP: {match.matchMvpName}
                                      </span>
                                    )}
                                    {isExpanded ? <ChevronUp className="h-4 w-4 text-zinc-400" /> : <ChevronDown className="h-4 w-4 text-zinc-400" />}
                                  </div>
                                </div>
                              </div>

                              {/* Expanded Details Drawer */}
                              {isExpanded && (
                                <div className="p-4 bg-zinc-950/80 border-t border-zinc-800/80 space-y-4">
                                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                                    {match.players.map((p, idx) => (
                                      <div
                                        key={idx}
                                        className={`p-2.5 rounded-lg border flex flex-col justify-between gap-1 text-xs ${
                                          p.isMatchMvp
                                            ? 'bg-yellow-500/10 border-yellow-500/40 text-yellow-300'
                                            : p.assignedStatus === 'BOTTOM'
                                              ? 'bg-blue-500/10 border-blue-500/30 text-blue-300'
                                              : 'bg-zinc-900 border-zinc-800 text-zinc-300'
                                        }`}
                                      >
                                        <div className="flex items-center justify-between">
                                          <span className="font-bold truncate">{p.name}</span>
                                          {p.isMatchMvp && <span>👑</span>}
                                        </div>
                                        <div className="flex items-center gap-1.5 font-semibold text-[11px] text-zinc-400">
                                          <span>{p.agentName}</span>
                                          <span className="text-[9px] uppercase px-1 rounded bg-black/40">
                                            {p.agentRole}
                                          </span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>

                                  {match.notes && (
                                    <div className="p-2.5 bg-zinc-900 rounded-lg text-xs text-zinc-400">
                                      <span className="font-bold text-zinc-300">บันทึก: </span>
                                      {match.notes}
                                    </div>
                                  )}

                                  <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                                    {onShareMatch && (
                                      <Button
                                        onClick={() => onShareMatch(match)}
                                        className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs px-3 py-1 flex items-center gap-1.5"
                                      >
                                        <ImageIcon className="h-3.5 w-3.5" /> สร้างการ์ดแชร์แมตช์นี้
                                      </Button>
                                    )}
                                    <Button
                                      onClick={() => {
                                        if (confirm('คุณต้องการลบแมตช์นี้หรือไม่?')) {
                                          deleteMatch(match.id);
                                        }
                                      }}
                                      variant="destructive"
                                      className="text-xs px-3 py-1 flex items-center gap-1"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" /> ลบแมตช์
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ----------------- TAB 2: PLAYERS LEADERBOARD ----------------- */}
              {activeTab === 'players' && (
                <div className="space-y-4">
                  {/* Leaderboard Header with Sort & Search Controls */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-yellow-400" /> ตารางอันดับสถิติผู้เล่น (Player Leaderboard)
                      </h3>
                      <span className="text-xs text-zinc-500">จัดอันดับความสามารถและฉายาของสมาชิกในตี้</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* Search Player */}
                      <input
                        type="text"
                        placeholder="ค้นหาชื่อเพื่อน..."
                        value={playerSearch}
                        onChange={(e) => setPlayerSearch(e.target.value)}
                        className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 w-36"
                      />

                      {/* Sort Metric Selector */}
                      <div className="flex bg-zinc-900 border border-zinc-800 rounded-lg p-0.5 text-xs">
                        {[
                          { id: 'winrate', label: 'Winrate %' },
                          { id: 'mvp', label: '👑 MVP' },
                          { id: 'wins', label: 'ชนะ' },
                          { id: 'games', label: 'จำนวนเกม' },
                        ].map((btn) => (
                          <button
                            key={btn.id}
                            onClick={() => setLeaderboardSort(btn.id as LeaderboardSortType)}
                            className={`px-2.5 py-1 rounded font-bold transition ${
                              leaderboardSort === btn.id
                                ? 'bg-red-600 text-white shadow-sm'
                                : 'text-zinc-400 hover:text-white'
                            }`}
                          >
                            {btn.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {sortedPlayerStats.length === 0 ? (
                    <div className="p-8 text-center bg-zinc-900/40 border border-zinc-800 rounded-xl">
                      <p className="text-sm font-bold text-zinc-400">ยังไม่มีข้อมูลผู้เล่น</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {sortedPlayerStats.map((player, index) => (
                        <div
                          key={player.name}
                          className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-5 relative overflow-hidden flex flex-col justify-between hover:border-zinc-700 transition"
                        >
                          <div>
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
                                  <h4 className="text-lg font-black text-white uppercase">{player.name}</h4>
                                  <span
                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${player.badge.color}`}
                                  >
                                    <span>{player.badge.icon}</span> {player.badge.title}
                                  </span>
                                </div>
                              </div>

                              <div className="text-right">
                                <div
                                  className={`text-2xl font-black ${
                                    player.winrate >= 50 ? 'text-emerald-400' : 'text-rose-400'
                                  }`}
                                >
                                  {player.winrate}%
                                </div>
                                <span className="text-[10px] text-zinc-500 font-bold uppercase">
                                  {player.wins}W - {player.losses}L
                                </span>
                              </div>
                            </div>

                            {/* Stats Summary Badges */}
                            <div className="grid grid-cols-3 gap-2 my-3 p-2.5 bg-zinc-950/60 rounded-lg border border-zinc-800/80 text-center text-xs">
                              <div>
                                <span className="text-[10px] text-zinc-500 uppercase block font-bold">👑 Real MVP</span>
                                <span className="font-black text-yellow-400 text-sm">{player.matchMvpCount}</span>
                              </div>
                              <div>
                                <span className="text-[10px] text-zinc-500 uppercase block font-bold">🎯 Wheel MVP</span>
                                <span className="font-black text-emerald-400 text-sm">{player.assignedMvpCount}</span>
                              </div>
                              <div>
                                <span className="text-[10px] text-zinc-500 uppercase block font-bold">💀 Wheel Bottom</span>
                                <span className="font-black text-blue-400 text-sm">{player.assignedBottomCount}</span>
                              </div>
                            </div>
                          </div>

                          {/* Most Played Agents */}
                          {player.mostPlayedAgents.length > 0 && (
                            <div className="pt-2 border-t border-zinc-800/80">
                              <span className="text-[10px] font-bold uppercase text-zinc-500 block mb-1.5">
                                เอเจนท์ที่สุ่มได้บ่อยสุด:
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {player.mostPlayedAgents.slice(0, 3).map((agent) => (
                                  <div
                                    key={agent.agentName}
                                    className="flex items-center gap-1.5 px-2 py-1 bg-zinc-950 rounded-md border border-zinc-800 text-[11px]"
                                  >
                                    {agent.agentImage && (
                                      <img src={agent.agentImage} alt={agent.agentName} className="w-3.5 h-3.5 rounded-full object-cover" />
                                    )}
                                    <span className="font-bold text-white">{agent.agentName}</span>
                                    <span className="text-[10px] text-zinc-500">({agent.picks}x • {agent.winrate}%)</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ----------------- TAB 3: META (AGENTS & MAPS) ----------------- */}
              {activeTab === 'meta' && (
                <div className="space-y-6">
                  {/* Agent Meta Section */}
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-black uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                          <Sword className="h-4 w-4 text-red-500" /> สถิติตัวละครที่สุ่มได้ (Agent Performance)
                        </h3>
                        <span className="text-xs text-zinc-500">ดู Winrate และความถี่ในการสุ่มได้ของแต่ละตัว</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {/* Sort Toggle */}
                        <div className="flex bg-zinc-900 border border-zinc-800 rounded-lg p-0.5 text-xs">
                          <button
                            onClick={() => setAgentSort('picks')}
                            className={`px-2.5 py-1 rounded font-bold transition ${
                              agentSort === 'picks' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
                            }`}
                          >
                            หยิบบ่อยสุด
                          </button>
                          <button
                            onClick={() => setAgentSort('winrate')}
                            className={`px-2.5 py-1 rounded font-bold transition ${
                              agentSort === 'winrate' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
                            }`}
                          >
                            Winrate สูงสุด
                          </button>
                        </div>

                        {/* Role Filters */}
                        <div className="flex bg-zinc-900 border border-zinc-800 rounded-lg p-0.5 text-xs">
                          {(['ALL', 'Duelist', 'Controller', 'Initiator', 'Sentinel'] as const).map((r) => (
                            <button
                              key={r}
                              onClick={() => setRoleFilter(r)}
                              className={`px-2 py-1 rounded font-bold transition ${
                                roleFilter === r ? 'bg-red-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
                              }`}
                            >
                              {r === 'ALL' ? 'ทั้งหมด' : r}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      {sortedAgentStats.map((agent) => (
                        <div
                          key={agent.name}
                          className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-3 flex flex-col items-center text-center relative overflow-hidden"
                        >
                          <div className="w-12 h-12 rounded-full bg-zinc-950 overflow-hidden mb-2 border border-zinc-800">
                            {agent.image ? (
                              <img src={agent.image} alt={agent.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center font-bold text-xs">{agent.name}</div>
                            )}
                          </div>
                          <h5 className="font-bold text-xs text-white uppercase truncate max-w-full">{agent.name}</h5>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border my-1 ${getRoleColor(agent.role)}`}>
                            {agent.role}
                          </span>
                          <div className="mt-1">
                            <span className={`text-sm font-black ${agent.winrate >= 50 ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {agent.winrate}%
                            </span>
                            <span className="text-[10px] text-zinc-500 block">({agent.wins}W / {agent.picks}x)</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Map Winrate Meta Section */}
                  <div className="space-y-3 pt-4 border-t border-zinc-800">
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                        <Flame className="h-4 w-4 text-orange-500" /> สถิติแต่ละแผนที่ (Map Winrates)
                      </h3>
                      <span className="text-xs text-zinc-500">แผนที่ที่ตี้ของคุณเก่งที่สุดและแผนที่ที่แพ้บ่อยสุด</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {mapStats.map((map) => (
                        <div
                          key={map.name}
                          className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-4 flex items-center justify-between"
                        >
                          <div>
                            <h4 className="font-black text-sm text-white uppercase">{map.name}</h4>
                            <span className="text-xs text-zinc-400">เล่น {map.picks} เกม ({map.wins} ชนะ)</span>
                          </div>
                          <div className="text-right">
                            <span className={`text-xl font-black ${map.winrate >= 50 ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {map.winrate}%
                            </span>
                            <span className="text-[10px] text-zinc-500 block uppercase font-bold">Winrate</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ----------------- TAB 4: THE WHEEL CURSE ----------------- */}
              {activeTab === 'curse' && (
                <div className="max-w-2xl mx-auto space-y-6">
                  <div>
                    <h3 className="text-lg font-black uppercase tracking-wider text-white flex items-center gap-2">
                      <Skull className="h-5 w-5 text-rose-500" /> บทวิเคราะห์คำสาปวงล้อ (The Wheel Curse)
                    </h3>
                    <p className="text-xs text-zinc-400">
                      สถิติเมื่อบ๊วยของเกมก่อนถูกบังคับเล่น Duelist และเมื่อ MVP ได้สิทธิ์เลือก Role
                    </p>
                  </div>

                  {/* Hall of Fame Spotlight (QoL Feature) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* King of Carry */}
                    <div className="bg-gradient-to-b from-yellow-950/30 to-zinc-900 border border-yellow-500/30 rounded-xl p-4 flex items-center gap-3.5">
                      <div className="p-3 bg-yellow-500/20 rounded-xl text-yellow-400 border border-yellow-500/30 text-2xl">
                        👑
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-yellow-400 tracking-wider">
                          King of Carry (MVP แบกทีม)
                        </span>
                        <h4 className="text-lg font-black text-white uppercase">
                          {kingOfCarry ? kingOfCarry.name : '-'}
                        </h4>
                        <span className="text-xs text-zinc-400">
                          {kingOfCarry ? `Winrate ${kingOfCarry.winrate}% (${kingOfCarry.matchMvpCount} MVPs)` : 'ยังไม่มีข้อมูล'}
                        </span>
                      </div>
                    </div>

                    {/* Chief Victim */}
                    <div className="bg-gradient-to-b from-blue-950/30 to-zinc-900 border border-blue-500/30 rounded-xl p-4 flex items-center gap-3.5">
                      <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400 border border-blue-500/30 text-2xl">
                        💀
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">
                          เหยื่อคำสาปวงล้อบ่อยสุด
                        </span>
                        <h4 className="text-lg font-black text-white uppercase">
                          {chiefVictim && chiefVictim.assignedBottomCount > 0 ? chiefVictim.name : '-'}
                        </h4>
                        <span className="text-xs text-zinc-400">
                          {chiefVictim && chiefVictim.assignedBottomCount > 0
                            ? `โดนบังคับเล่น Duelist ${chiefVictim.assignedBottomCount} ครั้ง`
                            : 'ยังไม่มีข้อมูล'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Curse Cards */}
                  <div className="space-y-4">
                    {/* Bottom Frag Curse */}
                    <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          <Skull className="h-4 w-4 text-blue-400" /> สถิติคนบ๊วยถูกบังคับเล่น Duelist
                        </h4>
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
                          <span>ยังไม่มีข้อมูลเมื่อมีผู้เล่นติดสถานะ Bottom Frag</span>
                        ) : overallStats.bottomDuelistStats.winrate >= 50 ? (
                          <span className="text-emerald-300 font-bold">
                            🎉 ลบล้างคำสาปสำเร็จ! แม้คนบ๊วยจะถูกบังคับเล่น Duelist แต่อัตราการชนะของทีมยังสูงถึง{' '}
                            {overallStats.bottomDuelistStats.winrate}%
                          </span>
                        ) : (
                          <span className="text-rose-300 font-bold">
                            💀 คำสาปทำงานอย่างรุนแรง! เมื่อคนบ๊วยถูกบังคับเล่น Duelist อัตราการชนะของทีมร่วงเหลือเพียง{' '}
                            {overallStats.bottomDuelistStats.winrate}%
                          </span>
                        )}
                      </div>
                    </div>

                    {/* MVP Advantage */}
                    <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          <Trophy className="h-4 w-4 text-yellow-400" /> สถิติเมื่อ MVP ได้สิทธิ์เลือก Role
                        </h4>
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
                <div className="max-w-2xl mx-auto space-y-5">
                  <div>
                    <h3 className="text-lg font-black uppercase tracking-wider text-white flex items-center gap-2">
                      <Download className="h-5 w-5 text-red-500" /> จัดการและสำรองข้อมูล (Data Management)
                    </h3>
                    <p className="text-xs text-zinc-400">
                      สำรองไฟล์สถิติ ซิงค์ข้อมูลกับ Cloud หรือนำเข้าข้อมูลจากเครื่องเพื่อน
                    </p>
                  </div>

                  {importStatus && (
                    <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-700 text-xs font-bold text-white shadow-lg">
                      {importStatus}
                    </div>
                  )}

                  <div className="space-y-3.5">
                    {/* Feature: 1-Click Pull from Supabase Cloud */}
                    <div className="bg-gradient-to-r from-cyan-950/60 to-zinc-900 border border-cyan-500/40 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                          <h4 className="text-sm font-bold text-white">ดึงข้อมูลสถิติล่าสุดจาก Supabase Cloud</h4>
                        </div>
                        <p className="text-xs text-zinc-400">
                          ดึงประวัติแมตช์ที่เพื่อนๆ ในตี้เคยบันทึกไว้บน Cloud มาผสานรวมกับเครื่องนี้
                        </p>
                      </div>
                      <Button
                        onClick={handleCloudPull}
                        disabled={isCloudSyncing}
                        className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold flex items-center gap-2 text-xs shrink-0"
                      >
                        <CloudDownload className={`h-4 w-4 ${isCloudSyncing ? 'animate-bounce' : ''}`} />
                        {isCloudSyncing ? 'กำลังซิงค์...' : 'ดึงข้อมูลจาก Cloud'}
                      </Button>
                    </div>

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
                        <p className="text-xs text-zinc-400">ดาวน์โหลดประวัติการเล่นทั้งหมดเก็บไว้ในเครื่อง ({matches.length} แมตช์)</p>
                      </div>
                      <Button
                        onClick={exportJson}
                        disabled={matches.length === 0}
                        className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold flex items-center gap-2 text-xs"
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
                        <div className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-md font-bold text-xs flex items-center gap-2">
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
                        className="font-bold flex items-center gap-2 text-xs"
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
                        className="font-bold flex items-center gap-2 text-xs"
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
