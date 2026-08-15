import { useState, useEffect, useCallback, useMemo } from 'react';
import { type Agent, type MapData, AGENTS, MAPS_DATA } from '@/data/valorant';
import {
  fetchLiveAgents,
  fetchLiveMaps,
  clearValorantApiCache,
  getValorantApiCacheInfo,
} from '@/services/valorantApi';

export function useValorantData() {
  const [agents, setAgents] = useState<Agent[]>(AGENTS);
  const [maps, setMaps] = useState<MapData[]>(MAPS_DATA);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLive, setIsLive] = useState<boolean>(false);
  const [isFromCache, setIsFromCache] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  const loadData = useCallback(async (forceRefresh = false) => {
    setIsLoading(true);
    if (forceRefresh) {
      clearValorantApiCache();
    }

    try {
      const [agentsRes, mapsRes] = await Promise.all([fetchLiveAgents(), fetchLiveMaps()]);

      setAgents(agentsRes.agents);
      setMaps(mapsRes.maps);
      setIsLive(agentsRes.isLive || mapsRes.isLive);
      setIsFromCache(agentsRes.isFromCache || mapsRes.isFromCache);

      const cacheInfo = getValorantApiCacheInfo();
      setLastUpdated(cacheInfo.lastUpdated || Date.now());
    } catch (err) {
      console.warn('Failed to load Valorant data, using static constants:', err);
      setAgents(AGENTS);
      setMaps(MAPS_DATA);
      setIsLive(false);
      setIsFromCache(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const agentMap = useMemo(() => {
    const map = new Map<string, Agent>();
    agents.forEach((a) => map.set(a.name.toLowerCase(), a));
    return map;
  }, [agents]);

  const mapDataMap = useMemo(() => {
    const map = new Map<string, MapData>();
    maps.forEach((m) => map.set(m.name.toLowerCase(), m));
    return map;
  }, [maps]);

  const getAgentByName = useCallback(
    (name: string): Agent | undefined => {
      return agentMap.get(name.toLowerCase());
    },
    [agentMap]
  );

  const getMapByName = useCallback(
    (name: string): MapData | undefined => {
      return mapDataMap.get(name.toLowerCase());
    },
    [mapDataMap]
  );

  const refreshData = useCallback(async () => {
    await loadData(true);
  }, [loadData]);

  return {
    agents,
    maps,
    isLoading,
    isLive,
    isFromCache,
    lastUpdated,
    refreshData,
    getAgentByName,
    getMapByName,
  };
}
