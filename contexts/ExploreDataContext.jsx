import React, { createContext, useContext, useState, useCallback, useRef } from "react";

const SCORETRADE_API = "https://scoretradebackend.onrender.com";

const ExploreDataContext = createContext(null);

export function ExploreDataProvider({ children }) {
  const [sports, setSports] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedSport, setSelectedSport] = useState(null);
  const [selectedScope, setSelectedScope] = useState(null);

  // Cache: key = `${slug}:${scope}`, value = events array
  const eventsCache = useRef(new Map());
  const sportsFetched = useRef(false);

  const fetchSports = useCallback(async () => {
    try {
      const res = await fetch(`${SCORETRADE_API}/api/v1/sports`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setSports(data?.sports || []);
      setError(null);
      sportsFetched.current = true;
    } catch (e) {
      setError(e?.message || "Failed to load sports");
      setSports([]);
    }
  }, []);

  const fetchEvents = useCallback(async (slug, scope) => {
    if (!slug || !scope) return;
    const cacheKey = `${slug}:${scope}`;
    const cached = eventsCache.current.get(cacheKey);
    if (cached) {
      setEvents(cached);
      setLoadingEvents(false);
      return;
    }
    setLoadingEvents(true);
    setError(null);
    try {
      const scopeEnc = encodeURIComponent(scope);
      const res = await fetch(
        `${SCORETRADE_API}/api/v1/sports/${slug}/events?scope=${scopeEnc}`,
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const evts = data?.events ?? (Array.isArray(data) ? data : []);
      eventsCache.current.set(cacheKey, evts);
      setEvents(evts);
    } catch (e) {
      setError(e?.message || "Failed to load events");
      setEvents([]);
    } finally {
      setLoadingEvents(false);
    }
  }, []);

  const load = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);
      await fetchSports();
      setLoading(false);
      setRefreshing(false);
    },
    [fetchSports],
  );

  const loadIfNeeded = useCallback(() => {
    if (!sportsFetched.current && sports.length === 0) {
      load();
    }
  }, [load, sports.length]);

  const refreshEvents = useCallback(
    async (slug, scope) => {
      if (!slug || !scope) return;
      const cacheKey = `${slug}:${scope}`;
      setLoadingEvents(true);
      setError(null);
      try {
        const scopeEnc = encodeURIComponent(scope);
        const res = await fetch(
          `${SCORETRADE_API}/api/v1/sports/${slug}/events?scope=${scopeEnc}`,
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const evts = data?.events ?? (Array.isArray(data) ? data : []);
        eventsCache.current.set(cacheKey, evts);
        setEvents(evts);
      } catch (e) {
        setError(e?.message || "Failed to load events");
      } finally {
        setLoadingEvents(false);
      }
    },
    [],
  );

  const value = {
    sports,
    events,
    setEvents,
    loading,
    loadingEvents,
    refreshing,
    error,
    selectedSport,
    setSelectedSport,
    selectedScope,
    setSelectedScope,
    fetchSports,
    fetchEvents,
    load,
    loadIfNeeded,
    refreshEvents,
    eventsCache: eventsCache.current,
  };

  return (
    <ExploreDataContext.Provider value={value}>
      {children}
    </ExploreDataContext.Provider>
  );
}

export function useExploreData() {
  const ctx = useContext(ExploreDataContext);
  if (!ctx) {
    throw new Error("useExploreData must be used within ExploreDataProvider");
  }
  return ctx;
}
