import { useMemo, useCallback } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import {
  type MatchRecord,
  type PlayerStatsSummary,
  type AgentStatsSummary,
  type MapStatsSummary,
  type SquadOverallStats,
  type PlayerBadge,
  type AgentPerformance,
} from '@/types/stats';
import { AGENTS, MAPS_DATA, type Role } from '@/data/valorant';

const STORAGE_KEY = 'valomize-match-history';

function determinePlayerBadge(
  player: {
    totalMatches: number;
    winrate: number;
    matchMvpCount: number;
    assignedBottomCount: number;
    assignedBottomWins: number;
    roleDistribution: Record<Role, number>;
  }
): PlayerBadge {
  if (player.totalMatches === 0) {
    return {
      title: 'New Recruit',
      desc: 'พร้อมลงสนามรอบต่อไป',
      icon: '⭐',
      color: 'text-zinc-400 border-zinc-700 bg-zinc-800/50',
    };
  }

  if (player.matchMvpCount >= 3 && player.matchMvpCount / player.totalMatches >= 0.3) {
    return {
      title: '👑 Match MVP Beast',
      desc: 'แบกทีมของแท้ MVP แทบทุกตา',
      icon: '👑',
      color: 'text-yellow-400 border-yellow-500/40 bg-yellow-500/10',
    };
  }

  if (player.assignedBottomWins >= 2) {
    return {
      title: '💀 Curse Breaker',
      desc: 'โดนลงโทษแต่ยังคัมแบกชนะได้',
      icon: '💀',
      color: 'text-blue-400 border-blue-500/40 bg-blue-500/10',
    };
  }

  if (player.winrate >= 70 && player.totalMatches >= 3) {
    return {
      title: '🔥 Unstoppable',
      desc: 'อัตราการชนะสูงเกินต้านทาน',
      icon: '🔥',
      color: 'text-red-400 border-red-500/40 bg-red-500/10',
    };
  }

  // Check highest role
  let maxRole: Role = 'Duelist';
  let maxCount = -1;
  for (const [role, count] of Object.entries(player.roleDistribution) as [Role, number][]) {
    if (count > maxCount) {
      maxCount = count;
      maxRole = role;
    }
  }

  if (maxCount >= 2) {
    switch (maxRole) {
      case 'Duelist':
        return {
          title: '🎯 Duelist Master',
          desc: 'สายเปิดจังหวะ ดุดันไม่เกรงใจใคร',
          icon: '🎯',
          color: 'text-rose-400 border-rose-500/40 bg-rose-500/10',
        };
      case 'Sentinel':
        return {
          title: '🛡️ Iron Sentinel',
          desc: 'กำแพงเหล็กกันไซต์ระดับเทพ',
          icon: '🛡️',
          color: 'text-cyan-400 border-cyan-500/40 bg-cyan-500/10',
        };
      case 'Controller':
        return {
          title: '☁️ Smoke Architect',
          desc: 'คุมวิสัยทัศน์ วางสโมคไร้ที่ติ',
          icon: '☁️',
          color: 'text-purple-400 border-purple-500/40 bg-purple-500/10',
        };
      case 'Initiator':
        return {
          title: '👁️ Tactical Vision',
          desc: 'เปิดแมพ เคลียร์มุม ข้อมูลแม่นยำ',
          icon: '👁️',
          color: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10',
        };
    }
  }

  return {
    title: '⚡ Combat Specialist',
    desc: 'เล่นได้ทุกตำแหน่ง พึ่งพาได้เสมอ',
    icon: '⚡',
    color: 'text-amber-400 border-amber-500/40 bg-amber-500/10',
  };
}

export function useMatchStats() {
  const [matches, setMatches] = useLocalStorage<MatchRecord[]>(STORAGE_KEY, []);

  // Add new match
  const addMatch = useCallback(
    (newMatchData: Omit<MatchRecord, 'id' | 'timestamp'>) => {
      const newRecord: MatchRecord = {
        ...newMatchData,
        id: `match_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        timestamp: Date.now(),
      };
      setMatches((prev) => [newRecord, ...prev]);
      return newRecord;
    },
    [setMatches]
  );

  // Delete match
  const deleteMatch = useCallback(
    (id: string) => {
      setMatches((prev) => prev.filter((m) => m.id !== id));
    },
    [setMatches]
  );

  // Clear all
  const clearHistory = useCallback(() => {
    setMatches([]);
  }, [setMatches]);

  // Overall squad statistics
  const overallStats = useMemo<SquadOverallStats>(() => {
    const totalMatches = matches.length;
    if (totalMatches === 0) {
      return {
        totalMatches: 0,
        wins: 0,
        losses: 0,
        winrate: 0,
        currentStreak: { count: 0, type: 'NONE' },
        bestWinStreak: 0,
        recentForm: [],
        bottomDuelistStats: { total: 0, wins: 0, winrate: 0 },
        mvpChoiceStats: { total: 0, wins: 0, winrate: 0 },
      };
    }

    const wins = matches.filter((m) => m.result === 'WIN').length;
    const losses = totalMatches - wins;
    const winrate = Math.round((wins / totalMatches) * 100);

    // Current Streak (matches are ordered newest to oldest)
    let currentStreakCount = 0;
    let currentStreakType: 'WIN' | 'LOSS' | 'NONE' = 'NONE';

    for (let i = 0; i < matches.length; i++) {
      if (i === 0) {
        currentStreakType = matches[i].result;
        currentStreakCount = 1;
      } else if (matches[i].result === currentStreakType) {
        currentStreakCount++;
      } else {
        break;
      }
    }

    // Best Win Streak (chronological order oldest to newest)
    const chronoMatches = [...matches].reverse();
    let bestWinStreak = 0;
    let tempStreak = 0;
    chronoMatches.forEach((m) => {
      if (m.result === 'WIN') {
        tempStreak++;
        if (tempStreak > bestWinStreak) bestWinStreak = tempStreak;
      } else {
        tempStreak = 0;
      }
    });

    // Recent form (last 5 matches)
    const recentForm = matches.slice(0, 5).map((m) => m.result);

    // Bottom punishment stats
    let bottomTotal = 0;
    let bottomWins = 0;
    // MVP choice stats
    let mvpTotal = 0;
    let mvpWins = 0;

    matches.forEach((m) => {
      const hasBottom = m.players.some((p) => p.assignedStatus === 'BOTTOM');
      if (hasBottom) {
        bottomTotal++;
        if (m.result === 'WIN') bottomWins++;
      }

      const hasMvp = m.players.some((p) => p.assignedStatus === 'MVP');
      if (hasMvp) {
        mvpTotal++;
        if (m.result === 'WIN') mvpWins++;
      }
    });

    return {
      totalMatches,
      wins,
      losses,
      winrate,
      currentStreak: { count: currentStreakCount, type: currentStreakType },
      bestWinStreak,
      recentForm,
      bottomDuelistStats: {
        total: bottomTotal,
        wins: bottomWins,
        winrate: bottomTotal > 0 ? Math.round((bottomWins / bottomTotal) * 100) : 0,
      },
      mvpChoiceStats: {
        total: mvpTotal,
        wins: mvpWins,
        winrate: mvpTotal > 0 ? Math.round((mvpWins / mvpTotal) * 100) : 0,
      },
    };
  }, [matches]);

  // Player statistics
  const playerStats = useMemo<PlayerStatsSummary[]>(() => {
    const map = new Map<
      string,
      {
        totalMatches: number;
        wins: number;
        losses: number;
        matchMvpCount: number;
        assignedMvpCount: number;
        assignedMvpWins: number;
        assignedBottomCount: number;
        assignedBottomWins: number;
        agentMap: Map<string, { picks: number; wins: number; role: Role; image: string }>;
        roleDistribution: Record<Role, number>;
      }
    >();

    matches.forEach((match) => {
      const isWin = match.result === 'WIN';

      match.players.forEach((p) => {
        if (!map.has(p.name)) {
          map.set(p.name, {
            totalMatches: 0,
            wins: 0,
            losses: 0,
            matchMvpCount: 0,
            assignedMvpCount: 0,
            assignedMvpWins: 0,
            assignedBottomCount: 0,
            assignedBottomWins: 0,
            agentMap: new Map(),
            roleDistribution: { Duelist: 0, Controller: 0, Initiator: 0, Sentinel: 0 },
          });
        }

        const data = map.get(p.name)!;
        data.totalMatches++;
        if (isWin) data.wins++;
        else data.losses++;

        if (p.isMatchMvp || match.matchMvpName === p.name) {
          data.matchMvpCount++;
        }

        if (p.assignedStatus === 'MVP') {
          data.assignedMvpCount++;
          if (isWin) data.assignedMvpWins++;
        } else if (p.assignedStatus === 'BOTTOM') {
          data.assignedBottomCount++;
          if (isWin) data.assignedBottomWins++;
        }

        if (p.agentRole) {
          data.roleDistribution[p.agentRole] = (data.roleDistribution[p.agentRole] || 0) + 1;
        }

        if (p.agentName) {
          if (!data.agentMap.has(p.agentName)) {
            data.agentMap.set(p.agentName, {
              picks: 0,
              wins: 0,
              role: p.agentRole,
              image: p.agentImage,
            });
          }
          const agentEntry = data.agentMap.get(p.agentName)!;
          agentEntry.picks++;
          if (isWin) agentEntry.wins++;
        }
      });
    });

    const list: PlayerStatsSummary[] = [];
    map.forEach((data, name) => {
      const winrate = data.totalMatches > 0 ? Math.round((data.wins / data.totalMatches) * 100) : 0;

      const mostPlayedAgents: AgentPerformance[] = Array.from(data.agentMap.entries())
        .map(([agentName, info]) => ({
          agentName,
          agentImage: info.image,
          role: info.role,
          picks: info.picks,
          wins: info.wins,
          winrate: info.picks > 0 ? Math.round((info.wins / info.picks) * 100) : 0,
        }))
        .sort((a, b) => b.picks - a.picks || b.winrate - a.winrate);

      const badge = determinePlayerBadge({
        totalMatches: data.totalMatches,
        winrate,
        matchMvpCount: data.matchMvpCount,
        assignedBottomCount: data.assignedBottomCount,
        assignedBottomWins: data.assignedBottomWins,
        roleDistribution: data.roleDistribution,
      });

      list.push({
        name,
        totalMatches: data.totalMatches,
        wins: data.wins,
        losses: data.losses,
        winrate,
        matchMvpCount: data.matchMvpCount,
        assignedMvpCount: data.assignedMvpCount,
        assignedMvpWins: data.assignedMvpWins,
        assignedBottomCount: data.assignedBottomCount,
        assignedBottomWins: data.assignedBottomWins,
        mostPlayedAgents,
        roleDistribution: data.roleDistribution,
        badge,
      });
    });

    // Sort by wins then winrate then matches
    return list.sort((a, b) => b.wins - a.wins || b.winrate - a.winrate || b.totalMatches - a.totalMatches);
  }, [matches]);

  // Agent statistics
  const agentStats = useMemo<AgentStatsSummary[]>(() => {
    const map = new Map<string, { picks: number; wins: number; role: Role; image: string; color: string }>();

    // Prepopulate with all agents
    AGENTS.forEach((a) => {
      map.set(a.name, {
        picks: 0,
        wins: 0,
        role: a.role,
        image: a.image,
        color: a.color,
      });
    });

    matches.forEach((m) => {
      const isWin = m.result === 'WIN';
      m.players.forEach((p) => {
        if (p.agentName) {
          if (!map.has(p.agentName)) {
            map.set(p.agentName, {
              picks: 0,
              wins: 0,
              role: p.agentRole || 'Duelist',
              image: p.agentImage || '',
              color: p.agentColor || '#333333',
            });
          }
          const entry = map.get(p.agentName)!;
          entry.picks++;
          if (isWin) entry.wins++;
        }
      });
    });

    return Array.from(map.entries())
      .map(([name, data]) => ({
        name,
        role: data.role,
        image: data.image,
        color: data.color,
        picks: data.picks,
        wins: data.wins,
        winrate: data.picks > 0 ? Math.round((data.wins / data.picks) * 100) : 0,
      }))
      .sort((a, b) => b.picks - a.picks || b.winrate - a.winrate);
  }, [matches]);

  // Map statistics
  const mapStats = useMemo<MapStatsSummary[]>(() => {
    const map = new Map<string, { picks: number; wins: number; image: string }>();

    // Prepopulate with all maps
    MAPS_DATA.forEach((m) => {
      map.set(m.name, {
        picks: 0,
        wins: 0,
        image: m.image,
      });
    });

    matches.forEach((m) => {
      if (m.map) {
        if (!map.has(m.map)) {
          map.set(m.map, {
            picks: 0,
            wins: 0,
            image: m.mapImage || '',
          });
        }
        const entry = map.get(m.map)!;
        entry.picks++;
        if (m.result === 'WIN') entry.wins++;
      }
    });

    return Array.from(map.entries())
      .map(([name, data]) => ({
        name,
        image: data.image,
        picks: data.picks,
        wins: data.wins,
        winrate: data.picks > 0 ? Math.round((data.wins / data.picks) * 100) : 0,
      }))
      .sort((a, b) => b.picks - a.picks || b.winrate - a.winrate);
  }, [matches]);

  // Export JSON file
  const exportJson = useCallback(() => {
    try {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(matches, null, 2));
      const downloadAnchor = document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `valomize-stats-backup-${dateStr}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      console.error('Failed to export JSON:', err);
    }
  }, [matches]);

  // Import JSON file
  const importJson = useCallback(
    (jsonString: string): { success: boolean; count: number; error?: string } => {
      try {
        const parsed = JSON.parse(jsonString);
        if (!Array.isArray(parsed)) {
          return { success: false, count: 0, error: 'ข้อมูลต้องเป็น Array ของ Match Records' };
        }
        // Basic validation
        const validMatches = parsed.filter(
          (m) => m && typeof m.id === 'string' && Array.isArray(m.players) && (m.result === 'WIN' || m.result === 'LOSS')
        );

        if (validMatches.length === 0) {
          return { success: false, count: 0, error: 'ไม่พบข้อมูลแมตช์ที่ถูกต้องในไฟล์' };
        }

        setMatches(validMatches);
        return { success: true, count: validMatches.length };
      } catch (err) {
        return { success: false, count: 0, error: 'ไฟล์ JSON ไม่ถูกต้อง: ' + String(err) };
      }
    },
    [setMatches]
  );

  // Load realistic sample data
  const loadSampleData = useCallback(() => {
    const sampleMatches: MatchRecord[] = [
      {
        id: 'sample_match_1',
        timestamp: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
        map: 'Ascent',
        mapImage: 'https://media.valorant-api.com/maps/7eaecc1b-4337-bbf6-6ab9-04b8f06b3319/splash.png',
        result: 'WIN',
        scoreTeam: 13,
        scoreEnemy: 9,
        matchMvpName: 'Mike',
        notes: 'Mike Jett แบก A site ยับๆ',
        players: [
          {
            name: 'Mike',
            agentName: 'Jett',
            agentRole: 'Duelist',
            agentImage: 'https://media.valorant-api.com/agents/add6443a-41bd-e414-f6ad-e58d267f4e95/displayicon.png',
            assignedStatus: 'MVP',
            isMatchMvp: true,
          },
          {
            name: 'Si',
            agentName: 'Omen',
            agentRole: 'Controller',
            agentImage: 'https://media.valorant-api.com/agents/8e253930-4c05-31dd-1b6c-968525494517/displayicon.png',
            assignedStatus: null,
          },
          {
            name: 'Sunny',
            agentName: 'Sova',
            agentRole: 'Initiator',
            agentImage: 'https://media.valorant-api.com/agents/320b2a48-4d9b-a075-30f1-1f93a9b638fa/displayicon.png',
            assignedStatus: null,
          },
          {
            name: 'Nut',
            agentName: 'Killjoy',
            agentRole: 'Sentinel',
            agentImage: 'https://media.valorant-api.com/agents/1e58de9c-4950-5125-93e9-a0aee9f98746/displayicon.png',
            assignedStatus: null,
          },
          {
            name: 'Do',
            agentName: 'Reyna',
            agentRole: 'Duelist',
            agentImage: 'https://media.valorant-api.com/agents/a3bfb853-43b2-7238-a4f1-ad90e9e46bcc/displayicon.png',
            assignedStatus: 'BOTTOM',
          },
        ],
      },
      {
        id: 'sample_match_2',
        timestamp: Date.now() - 1000 * 60 * 60 * 5, // 5 hours ago
        map: 'Bind',
        mapImage: 'https://media.valorant-api.com/maps/2c9d57ec-4431-9c5e-2939-8f9ef6dd5cba/splash.png',
        result: 'WIN',
        scoreTeam: 13,
        scoreEnemy: 11,
        matchMvpName: 'Sunny',
        notes: 'คัมแบกจาก 4-8 ในครึ่งหลัง',
        players: [
          {
            name: 'Mike',
            agentName: 'Raze',
            agentRole: 'Duelist',
            agentImage: 'https://media.valorant-api.com/agents/f94c3b30-42be-e959-889c-5aa313dba261/displayicon.png',
            assignedStatus: null,
          },
          {
            name: 'Si',
            agentName: 'Brimstone',
            agentRole: 'Controller',
            agentImage: 'https://media.valorant-api.com/agents/9f0d8ba9-4140-b941-57d3-a7ad57c6b417/displayicon.png',
            assignedStatus: null,
          },
          {
            name: 'Sunny',
            agentName: 'Fade',
            agentRole: 'Initiator',
            agentImage: 'https://media.valorant-api.com/agents/dade69b4-4f5a-8528-247b-219e5a1facd6/displayicon.png',
            assignedStatus: 'MVP',
            isMatchMvp: true,
          },
          {
            name: 'Nut',
            agentName: 'Cypher',
            agentRole: 'Sentinel',
            agentImage: 'https://media.valorant-api.com/agents/117ed9e3-49f3-6512-3ccf-0cada7e3823b/displayicon.png',
            assignedStatus: null,
          },
          {
            name: 'Do',
            agentName: 'Iso',
            agentRole: 'Duelist',
            agentImage: 'https://media.valorant-api.com/agents/0e38b510-41a8-5780-5e8f-568b2a4f2d6c/displayicon.png',
            assignedStatus: 'BOTTOM',
          },
        ],
      },
      {
        id: 'sample_match_3',
        timestamp: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
        map: 'Lotus',
        mapImage: 'https://media.valorant-api.com/maps/2fe4ed3a-450a-948b-6d6b-e89a78e680a9/splash.png',
        result: 'LOSS',
        scoreTeam: 10,
        scoreEnemy: 13,
        matchMvpName: 'Nut',
        notes: 'โดนฝั่งตรงข้ามดัก C site รัวๆ',
        players: [
          {
            name: 'Mike',
            agentName: 'Neon',
            agentRole: 'Duelist',
            agentImage: 'https://media.valorant-api.com/agents/bb2a4828-46eb-8cd1-e765-15848195d751/displayicon.png',
            assignedStatus: null,
          },
          {
            name: 'Si',
            agentName: 'Clove',
            agentRole: 'Controller',
            agentImage: 'https://media.valorant-api.com/agents/e370fa57-4757-3604-3648-499e1f642d3f/displayicon.png',
            assignedStatus: null,
          },
          {
            name: 'Sunny',
            agentName: 'Breach',
            agentRole: 'Initiator',
            agentImage: 'https://media.valorant-api.com/agents/5f8d3a7f-467b-97f3-062c-13acf203c006/displayicon.png',
            assignedStatus: null,
          },
          {
            name: 'Nut',
            agentName: 'Deadlock',
            agentRole: 'Sentinel',
            agentImage: 'https://media.valorant-api.com/agents/cc8b64c8-4b25-4ff9-6e7f-37b4da43d235/displayicon.png',
            assignedStatus: null,
            isMatchMvp: true,
          },
          {
            name: 'Do',
            agentName: 'Phoenix',
            agentRole: 'Duelist',
            agentImage: 'https://media.valorant-api.com/agents/eb93336a-449b-9c1b-0a54-a891f7921d69/displayicon.png',
            assignedStatus: 'BOTTOM',
          },
        ],
      },
      {
        id: 'sample_match_4',
        timestamp: Date.now() - 1000 * 60 * 60 * 36, // 1.5 days ago
        map: 'Sunset',
        mapImage: 'https://media.valorant-api.com/maps/92584fbe-486a-b1b2-9faa-39b0f486b498/splash.png',
        result: 'WIN',
        scoreTeam: 13,
        scoreEnemy: 7,
        matchMvpName: 'Mike',
        notes: 'Sunset คุม B main อยู่หมัด ชนะขาด',
        players: [
          {
            name: 'Mike',
            agentName: 'Jett',
            agentRole: 'Duelist',
            agentImage: 'https://media.valorant-api.com/agents/add6443a-41bd-e414-f6ad-e58d267f4e95/displayicon.png',
            assignedStatus: 'MVP',
            isMatchMvp: true,
          },
          {
            name: 'Si',
            agentName: 'Omen',
            agentRole: 'Controller',
            agentImage: 'https://media.valorant-api.com/agents/8e253930-4c05-31dd-1b6c-968525494517/displayicon.png',
            assignedStatus: null,
          },
          {
            name: 'Sunny',
            agentName: 'Gekko',
            agentRole: 'Initiator',
            agentImage: 'https://media.valorant-api.com/agents/e370fa57-4757-3604-3648-499e1f642d3f/displayicon.png',
            assignedStatus: null,
          },
          {
            name: 'Nut',
            agentName: 'Cypher',
            agentRole: 'Sentinel',
            agentImage: 'https://media.valorant-api.com/agents/117ed9e3-49f3-6512-3ccf-0cada7e3823b/displayicon.png',
            assignedStatus: null,
          },
          {
            name: 'Do',
            agentName: 'Raze',
            agentRole: 'Duelist',
            agentImage: 'https://media.valorant-api.com/agents/f94c3b30-42be-e959-889c-5aa313dba261/displayicon.png',
            assignedStatus: null,
          },
        ],
      },
    ];

    setMatches(sampleMatches);
  }, [setMatches]);

  return {
    matches,
    overallStats,
    playerStats,
    agentStats,
    mapStats,
    addMatch,
    deleteMatch,
    clearHistory,
    exportJson,
    importJson,
    loadSampleData,
  };
}
