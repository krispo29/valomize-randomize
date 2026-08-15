import { AGENTS, MAPS_DATA, type Agent, type Role, type ValorantMap, type MapData } from '@/data/valorant';

export interface ValorantApiAgent {
  uuid: string;
  displayName: string;
  description: string;
  developerName: string;
  displayIcon: string;
  displayIconSmall?: string;
  fullPortrait?: string | null;
  background?: string | null;
  backgroundGradientColors?: string[] | null;
  isPlayableCharacter: boolean;
  role?: {
    uuid: string;
    displayName: string;
    description: string;
    displayIcon: string;
  } | null;
  abilities?: {
    slot: string;
    displayName: string;
    description: string;
    displayIcon: string | null;
  }[];
}

export interface ValorantApiMap {
  uuid: string;
  displayName: string;
  narrativeDescription?: string | null;
  tacticalDescription?: string | null;
  coordinates?: string | null;
  displayIcon?: string | null;
  splash: string;
  assetPath: string;
}

const AGENTS_CACHE_KEY = 'valomize_agents_cache_v2';
const MAPS_CACHE_KEY = 'valomize_maps_cache_v2';
const CACHE_TTL_MS = 1000 * 60 * 60 * 24; // 24 hours

interface CachePayload<T> {
  timestamp: number;
  data: T;
}

function normalizeRole(roleName?: string): Role {
  if (!roleName) return 'Duelist';
  const clean = roleName.trim().toLowerCase();
  if (clean.includes('duelist')) return 'Duelist';
  if (clean.includes('controller')) return 'Controller';
  if (clean.includes('initiator')) return 'Initiator';
  if (clean.includes('sentinel')) return 'Sentinel';
  return 'Duelist';
}

function formatHexColor(colorStr?: string): string {
  if (!colorStr) return '#333333';
  if (colorStr.startsWith('#')) return colorStr.substring(0, 7);
  return `#${colorStr.substring(0, 6)}`;
}

export async function fetchLiveAgents(): Promise<{ agents: Agent[]; isFromCache: boolean; isLive: boolean }> {
  // 1. Try reading from LocalStorage Cache first if fresh
  try {
    const cached = localStorage.getItem(AGENTS_CACHE_KEY);
    if (cached) {
      const parsed: CachePayload<Agent[]> = JSON.parse(cached);
      const isFresh = Date.now() - parsed.timestamp < CACHE_TTL_MS;
      if (isFresh && Array.isArray(parsed.data) && parsed.data.length > 0) {
        // Return cached immediately and refresh in background if desired
        return { agents: parsed.data, isFromCache: true, isLive: true };
      }
    }
  } catch (err) {
    console.warn('Could not read agents cache:', err);
  }

  // 2. Fetch from Official/Community Valorant-API
  try {
    const response = await fetch('https://valorant-api.com/v1/agents?isPlayableCharacter=true', {
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    const json = await response.json();
    if (json.status === 200 && Array.isArray(json.data)) {
      const rawList: ValorantApiAgent[] = json.data;

      // Filter duplicates (e.g. Sova duplicate) and ensure playable
      const seenNames = new Set<string>();
      const mappedAgents: Agent[] = [];

      rawList.forEach((raw) => {
        if (!raw.isPlayableCharacter) return;
        if (seenNames.has(raw.displayName)) return;
        seenNames.add(raw.displayName);

        // Calculate primary color from gradient
        const primaryColorHex =
          raw.backgroundGradientColors && raw.backgroundGradientColors.length > 0
            ? formatHexColor(raw.backgroundGradientColors[0])
            : '#2a2a2a';

        mappedAgents.push({
          name: raw.displayName,
          role: normalizeRole(raw.role?.displayName),
          image: raw.displayIcon || '',
          color: primaryColorHex,
        });
      });

      if (mappedAgents.length > 0) {
        // Sort alphabetically
        mappedAgents.sort((a, b) => a.name.localeCompare(b.name));

        // Save to cache
        try {
          const payload: CachePayload<Agent[]> = {
            timestamp: Date.now(),
            data: mappedAgents,
          };
          localStorage.setItem(AGENTS_CACHE_KEY, JSON.stringify(payload));
        } catch (e) {
          console.warn('Failed to cache agents:', e);
        }

        return { agents: mappedAgents, isFromCache: false, isLive: true };
      }
    }
  } catch (err) {
    console.warn('Failed to fetch live agents from valorant-api.com, falling back to static constants:', err);
  }

  // 3. Fallback to static AGENTS constant
  return { agents: AGENTS, isFromCache: false, isLive: false };
}

export async function fetchLiveMaps(): Promise<{ maps: MapData[]; isFromCache: boolean; isLive: boolean }> {
  // 1. Try Cache
  try {
    const cached = localStorage.getItem(MAPS_CACHE_KEY);
    if (cached) {
      const parsed: CachePayload<MapData[]> = JSON.parse(cached);
      const isFresh = Date.now() - parsed.timestamp < CACHE_TTL_MS;
      if (isFresh && Array.isArray(parsed.data) && parsed.data.length > 0) {
        return { maps: parsed.data, isFromCache: true, isLive: true };
      }
    }
  } catch (err) {
    console.warn('Could not read maps cache:', err);
  }

  // 2. Fetch live
  try {
    const response = await fetch('https://valorant-api.com/v1/maps', {
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    const json = await response.json();
    if (json.status === 200 && Array.isArray(json.data)) {
      const rawList: ValorantApiMap[] = json.data;

      // Filter standard playable maps (exclude The Range / Basic Training)
      const excludeKeywords = ['range', 'training', 'poveglia', 'hurm', 'jam', 'breeze_'];
      const mappedMaps: MapData[] = [];
      const seenNames = new Set<string>();

      rawList.forEach((raw) => {
        if (!raw.displayName || !raw.splash) return;
        const lower = raw.displayName.toLowerCase();
        if (excludeKeywords.some((kw) => lower.includes(kw))) return;
        if (seenNames.has(raw.displayName)) return;
        seenNames.add(raw.displayName);

        mappedMaps.push({
          name: raw.displayName as ValorantMap,
          image: raw.splash,
        });
      });

      if (mappedMaps.length > 0) {
        mappedMaps.sort((a, b) => a.name.localeCompare(b.name));

        try {
          const payload: CachePayload<MapData[]> = {
            timestamp: Date.now(),
            data: mappedMaps,
          };
          localStorage.setItem(MAPS_CACHE_KEY, JSON.stringify(payload));
        } catch (e) {
          console.warn('Failed to cache maps:', e);
        }

        return { maps: mappedMaps, isFromCache: false, isLive: true };
      }
    }
  } catch (err) {
    console.warn('Failed to fetch live maps from valorant-api.com, falling back to static constants:', err);
  }

  // 3. Fallback
  return { maps: MAPS_DATA, isFromCache: false, isLive: false };
}

export function clearValorantApiCache(): void {
  try {
    localStorage.removeItem(AGENTS_CACHE_KEY);
    localStorage.removeItem(MAPS_CACHE_KEY);
  } catch (e) {
    console.warn('Error clearing cache:', e);
  }
}

export function getValorantApiCacheInfo(): {
  hasAgentsCache: boolean;
  hasMapsCache: boolean;
  agentsCount: number;
  mapsCount: number;
  lastUpdated: number | null;
} {
  try {
    const rawAgents = localStorage.getItem(AGENTS_CACHE_KEY);
    const rawMaps = localStorage.getItem(MAPS_CACHE_KEY);

    let lastUpdated: number | null = null;
    let agentsCount = 0;
    let mapsCount = 0;

    if (rawAgents) {
      const parsed: CachePayload<Agent[]> = JSON.parse(rawAgents);
      agentsCount = parsed.data?.length || 0;
      lastUpdated = parsed.timestamp;
    }

    if (rawMaps) {
      const parsed: CachePayload<MapData[]> = JSON.parse(rawMaps);
      mapsCount = parsed.data?.length || 0;
      if (!lastUpdated || (parsed.timestamp && parsed.timestamp > lastUpdated)) {
        lastUpdated = parsed.timestamp;
      }
    }

    return {
      hasAgentsCache: agentsCount > 0,
      hasMapsCache: mapsCount > 0,
      agentsCount,
      mapsCount,
      lastUpdated,
    };
  } catch {
    return {
      hasAgentsCache: false,
      hasMapsCache: false,
      agentsCount: 0,
      mapsCount: 0,
      lastUpdated: null,
    };
  }
}
