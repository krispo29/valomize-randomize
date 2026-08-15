import { type ValorantRankTier, type PlayerProfile } from '@/types/player';

// Static Official Valorant Rank Tiers (Episode 8-9+ with Ascendant)
export const VALORANT_RANKS: ValorantRankTier[] = [
  {
    tier: 0,
    tierName: 'Unranked',
    divisionName: 'Unranked',
    color: '#808080',
    icon: 'https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/0/smallicon.png',
  },
  {
    tier: 3,
    tierName: 'Iron 1',
    divisionName: 'Iron',
    color: '#5b6167',
    icon: 'https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/3/smallicon.png',
  },
  {
    tier: 4,
    tierName: 'Iron 2',
    divisionName: 'Iron',
    color: '#5b6167',
    icon: 'https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/4/smallicon.png',
  },
  {
    tier: 5,
    tierName: 'Iron 3',
    divisionName: 'Iron',
    color: '#5b6167',
    icon: 'https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/5/smallicon.png',
  },
  {
    tier: 6,
    tierName: 'Bronze 1',
    divisionName: 'Bronze',
    color: '#a57948',
    icon: 'https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/6/smallicon.png',
  },
  {
    tier: 7,
    tierName: 'Bronze 2',
    divisionName: 'Bronze',
    color: '#a57948',
    icon: 'https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/7/smallicon.png',
  },
  {
    tier: 8,
    tierName: 'Bronze 3',
    divisionName: 'Bronze',
    color: '#a57948',
    icon: 'https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/8/smallicon.png',
  },
  {
    tier: 9,
    tierName: 'Silver 1',
    divisionName: 'Silver',
    color: '#9fa6b2',
    icon: 'https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/9/smallicon.png',
  },
  {
    tier: 10,
    tierName: 'Silver 2',
    divisionName: 'Silver',
    color: '#9fa6b2',
    icon: 'https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/10/smallicon.png',
  },
  {
    tier: 11,
    tierName: 'Silver 3',
    divisionName: 'Silver',
    color: '#9fa6b2',
    icon: 'https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/11/smallicon.png',
  },
  {
    tier: 12,
    tierName: 'Gold 1',
    divisionName: 'Gold',
    color: '#e5b642',
    icon: 'https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/12/smallicon.png',
  },
  {
    tier: 13,
    tierName: 'Gold 2',
    divisionName: 'Gold',
    color: '#e5b642',
    icon: 'https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/13/smallicon.png',
  },
  {
    tier: 14,
    tierName: 'Gold 3',
    divisionName: 'Gold',
    color: '#e5b642',
    icon: 'https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/14/smallicon.png',
  },
  {
    tier: 15,
    tierName: 'Platinum 1',
    divisionName: 'Platinum',
    color: '#3ea5b8',
    icon: 'https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/15/smallicon.png',
  },
  {
    tier: 16,
    tierName: 'Platinum 2',
    divisionName: 'Platinum',
    color: '#3ea5b8',
    icon: 'https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/16/smallicon.png',
  },
  {
    tier: 17,
    tierName: 'Platinum 3',
    divisionName: 'Platinum',
    color: '#3ea5b8',
    icon: 'https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/17/smallicon.png',
  },
  {
    tier: 18,
    tierName: 'Diamond 1',
    divisionName: 'Diamond',
    color: '#bd65d9',
    icon: 'https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/18/smallicon.png',
  },
  {
    tier: 19,
    tierName: 'Diamond 2',
    divisionName: 'Diamond',
    color: '#bd65d9',
    icon: 'https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/19/smallicon.png',
  },
  {
    tier: 20,
    tierName: 'Diamond 3',
    divisionName: 'Diamond',
    color: '#bd65d9',
    icon: 'https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/20/smallicon.png',
  },
  {
    tier: 21,
    tierName: 'Ascendant 1',
    divisionName: 'Ascendant',
    color: '#28b37c',
    icon: 'https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/21/smallicon.png',
  },
  {
    tier: 22,
    tierName: 'Ascendant 2',
    divisionName: 'Ascendant',
    color: '#28b37c',
    icon: 'https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/22/smallicon.png',
  },
  {
    tier: 23,
    tierName: 'Ascendant 3',
    divisionName: 'Ascendant',
    color: '#28b37c',
    icon: 'https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/23/smallicon.png',
  },
  {
    tier: 24,
    tierName: 'Immortal 1',
    divisionName: 'Immortal',
    color: '#be245a',
    icon: 'https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/24/smallicon.png',
  },
  {
    tier: 25,
    tierName: 'Immortal 2',
    divisionName: 'Immortal',
    color: '#be245a',
    icon: 'https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/25/smallicon.png',
  },
  {
    tier: 26,
    tierName: 'Immortal 3',
    divisionName: 'Immortal',
    color: '#be245a',
    icon: 'https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/26/smallicon.png',
  },
  {
    tier: 27,
    tierName: 'Radiant',
    divisionName: 'Radiant',
    color: '#ffffaa',
    icon: 'https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/27/smallicon.png',
  },
];

export function getRankTierInfo(tierIndex?: number): ValorantRankTier {
  if (tierIndex === undefined || tierIndex === null) return VALORANT_RANKS[0];
  const found = VALORANT_RANKS.find((r) => r.tier === tierIndex);
  return found || VALORANT_RANKS[0];
}

export function getRankByTierName(name?: string): ValorantRankTier {
  if (!name) return VALORANT_RANKS[0];
  const lower = name.toLowerCase().trim();
  const found = VALORANT_RANKS.find((r) => r.tierName.toLowerCase() === lower);
  return found || VALORANT_RANKS[0];
}

export async function lookupRiotAccount(
  name: string,
  tag: string,
  region: 'ap' | 'na' | 'eu' | 'kr' | 'latam' | 'br' = 'ap',
  apiKey?: string
): Promise<{ success: boolean; profile?: Partial<PlayerProfile>; error?: string }> {
  const cleanName = encodeURIComponent(name.trim());
  const cleanTag = encodeURIComponent(tag.trim().replace('#', ''));

  if (!cleanName || !cleanTag) {
    return { success: false, error: 'กรุณาระบุทั้งชื่อและแท็ก (เช่น Mike และ TH1)' };
  }

  try {
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (apiKey) {
      headers['Authorization'] = apiKey;
    }

    // 1. Fetch Account Info (Player Card & Account Level)
    const accountUrl = `https://api.henrikdev.xyz/valorant/v1/account/${cleanName}/${cleanTag}`;
    const accountRes = await fetch(accountUrl, { headers });

    let cardImage: string | undefined = undefined;
    let accountLevel: number | undefined = undefined;

    if (accountRes.ok) {
      const accountData = await accountRes.json();
      if (accountData?.data) {
        cardImage = accountData.data.card?.small || accountData.data.card?.wide;
        accountLevel = accountData.data.account_level;
      }
    }

    // 2. Fetch MMR Info (Current Rank Tier)
    const mmrUrl = `https://api.henrikdev.xyz/valorant/v2/mmr/${region}/${cleanName}/${cleanTag}`;
    const mmrRes = await fetch(mmrUrl, { headers });

    if (mmrRes.ok) {
      const mmrData = await mmrRes.json();
      if (mmrData?.data?.current_data) {
        const cur = mmrData.data.current_data;
        const currentTier = cur.currenttier;
        const tierPatched = cur.currenttierpatched;

        const rankInfo = getRankTierInfo(currentTier);

        return {
          success: true,
          profile: {
            riotId: `${decodeURIComponent(cleanName)}#${decodeURIComponent(cleanTag)}`,
            tag: decodeURIComponent(cleanTag),
            region,
            rankTier: currentTier,
            rankName: tierPatched || rankInfo.tierName,
            rankIcon: rankInfo.icon,
            rankColor: rankInfo.color,
            cardImage,
            accountLevel,
          },
        };
      }
    }

    // If MMR fetch failed but account was found
    if (cardImage) {
      return {
        success: true,
        profile: {
          riotId: `${decodeURIComponent(cleanName)}#${decodeURIComponent(cleanTag)}`,
          tag: decodeURIComponent(cleanTag),
          region,
          rankTier: 0,
          rankName: 'Unranked',
          rankIcon: VALORANT_RANKS[0].icon,
          rankColor: VALORANT_RANKS[0].color,
          cardImage,
          accountLevel,
        },
      };
    }

    return {
      success: false,
      error: `ไม่พบข้อมูลบัญชี ${name}#${tag} หรือติดข้อจำกัด Rate Limit ของ HenrikDev API (คุณสามารถเลือกแรงค์ด้วยตัวเองได้ทันที)`,
    };
  } catch (err) {
    return {
      success: false,
      error: `เกิดข้อผิดพลาดในการเชื่อมต่อ: ${String(err)} (คุณสามารถเลือกแรงค์ด้วยตัวเองได้ทันที)`,
    };
  }
}
