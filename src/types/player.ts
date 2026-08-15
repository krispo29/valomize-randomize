export interface ValorantRankTier {
  tier: number;
  tierName: string;
  divisionName: string;
  color: string;
  icon: string;
}

export interface PlayerProfile {
  id: string;
  name: string;
  riotId?: string;
  tag?: string;
  region?: 'ap' | 'na' | 'eu' | 'kr' | 'latam' | 'br';
  rankTier?: number;
  rankName?: string;
  rankIcon?: string;
  rankColor?: string;
  cardImage?: string;
  accountLevel?: number;
}
