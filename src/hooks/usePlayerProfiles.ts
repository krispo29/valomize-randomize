import { useCallback, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { type PlayerProfile } from '@/types/player';
import { VALORANT_RANKS, getRankTierInfo, lookupRiotAccount } from '@/services/rankService';

const PROFILES_STORAGE_KEY = 'valomize_player_profiles_v1';

const DEFAULT_PROFILES: Record<number, PlayerProfile> = {
  0: {
    id: 'p_0',
    name: 'Mike',
    rankTier: 22, // Ascendant 2
    rankName: 'Ascendant 2',
    rankIcon: VALORANT_RANKS.find((r) => r.tier === 22)?.icon || VALORANT_RANKS[0].icon,
    rankColor: '#28b37c',
  },
  1: {
    id: 'p_1',
    name: 'Si',
    rankTier: 19, // Diamond 2
    rankName: 'Diamond 2',
    rankIcon: VALORANT_RANKS.find((r) => r.tier === 19)?.icon || VALORANT_RANKS[0].icon,
    rankColor: '#bd65d9',
  },
  2: {
    id: 'p_2',
    name: 'Sunny',
    rankTier: 20, // Diamond 3
    rankName: 'Diamond 3',
    rankIcon: VALORANT_RANKS.find((r) => r.tier === 20)?.icon || VALORANT_RANKS[0].icon,
    rankColor: '#bd65d9',
  },
  3: {
    id: 'p_3',
    name: 'Nut',
    rankTier: 17, // Platinum 3
    rankName: 'Platinum 3',
    rankIcon: VALORANT_RANKS.find((r) => r.tier === 17)?.icon || VALORANT_RANKS[0].icon,
    rankColor: '#3ea5b8',
  },
  4: {
    id: 'p_4',
    name: 'Do',
    rankTier: 14, // Gold 3
    rankName: 'Gold 3',
    rankIcon: VALORANT_RANKS.find((r) => r.tier === 14)?.icon || VALORANT_RANKS[0].icon,
    rankColor: '#e5b642',
  },
};

export function usePlayerProfiles(friends: string[]) {
  const [profiles, setProfiles] = useLocalStorage<Record<number, PlayerProfile>>(
    PROFILES_STORAGE_KEY,
    DEFAULT_PROFILES
  );

  // Sync names with friends list
  useEffect(() => {
    setProfiles((prev) => {
      const updated = { ...prev };
      let changed = false;

      friends.forEach((friendName, index) => {
        if (!updated[index]) {
          updated[index] = {
            id: `p_${index}`,
            name: friendName,
            rankTier: 0,
            rankName: 'Unranked',
            rankIcon: VALORANT_RANKS[0].icon,
            rankColor: VALORANT_RANKS[0].color,
          };
          changed = true;
        } else if (updated[index].name !== friendName) {
          updated[index] = { ...updated[index], name: friendName };
          changed = true;
        }
      });

      return changed ? updated : prev;
    });
  }, [friends, setProfiles]);

  const updateProfile = useCallback(
    (index: number, patch: Partial<PlayerProfile>) => {
      setProfiles((prev) => ({
        ...prev,
        [index]: {
          ...(prev[index] || {
            id: `p_${index}`,
            name: friends[index] || `Player ${index + 1}`,
            rankTier: 0,
            rankName: 'Unranked',
            rankIcon: VALORANT_RANKS[0].icon,
            rankColor: VALORANT_RANKS[0].color,
          }),
          ...patch,
        },
      }));
    },
    [friends, setProfiles]
  );

  const setPlayerRank = useCallback(
    (index: number, tierIndex: number) => {
      const rankInfo = getRankTierInfo(tierIndex);
      updateProfile(index, {
        rankTier: tierIndex,
        rankName: rankInfo.tierName,
        rankIcon: rankInfo.icon,
        rankColor: rankInfo.color,
      });
    },
    [updateProfile]
  );

  const syncPlayerRiot = useCallback(
    async (
      index: number,
      riotIdInput: string,
      region: 'ap' | 'na' | 'eu' | 'kr' | 'latam' | 'br' = 'ap',
      apiKey?: string
    ) => {
      const parts = riotIdInput.split('#');
      if (parts.length < 2) {
        return { success: false, error: 'กรุณากรอกในรูปแบบ Name#TAG (เช่น Mike#TH1)' };
      }

      const name = parts[0].trim();
      const tag = parts[1].trim();

      const result = await lookupRiotAccount(name, tag, region, apiKey);
      if (result.success && result.profile) {
        updateProfile(index, {
          ...result.profile,
          riotId: `${name}#${tag}`,
        });
      }
      return result;
    },
    [updateProfile]
  );

  return {
    profiles,
    updateProfile,
    setPlayerRank,
    syncPlayerRiot,
  };
}
