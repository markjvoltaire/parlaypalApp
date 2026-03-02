import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState, useCallback, useEffect } from "react";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useExploreData } from "../contexts/ExploreDataContext";

export default function Explore() {
  const {
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
    fetchEvents,
    loadIfNeeded,
    load,
    refreshEvents,
  } = useExploreData();

  const [searchQuery, setSearchQuery] = useState("");
  const [expandedEvents, setExpandedEvents] = useState({});

  useEffect(() => {
    loadIfNeeded();
  }, [loadIfNeeded]);

  useEffect(() => {
    if (selectedSport && selectedScope) {
      fetchEvents(selectedSport.slug, selectedScope);
    } else {
      setEvents([]);
    }
  }, [selectedSport, selectedScope, fetchEvents, setEvents]);

  const onRefresh = useCallback(async () => {
    await load(true);
    if (selectedSport?.slug && selectedScope) {
      await refreshEvents(selectedSport.slug, selectedScope);
    }
  }, [load, selectedSport, selectedScope, refreshEvents]);

  const handleSelectSport = (sport) => {
    setSelectedSport(sport);
    const scopeList = Array.isArray(sport.scopes)
      ? sport.scopes
      : Object.keys(sport.scopes || {});
    const defaultScope = sport.defaultScope || scopeList[0] || "Games";
    setSelectedScope(defaultScope);
  };

  const filteredEvents = events.filter((ev) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const title = (ev?.title || "").toLowerCase();
    const ticker = (ev?.ticker || "").toLowerCase();
    return title.includes(q) || ticker.includes(q);
  });

  const getSportIcon = (slug) => {
    const s = (slug || "").toLowerCase();
    if (s.includes("nba") || s.includes("basketball")) return "basketball";
    if (s.includes("nfl") || s.includes("football")) return "football";
    if (s.includes("mlb") || s.includes("baseball")) return "baseball";
    if (s.includes("nhl") || s.includes("hockey")) return "ice-cream";
    if (s.includes("mma") || s.includes("ufc")) return "karate";
    if (s.includes("boxing")) return "karate";
    return "trophy";
  };

  /** Parse team names from title or question (e.g. "Boston at Milwaukee" or "Detroit at Cleveland Winner?") */
  const parseTeamsFromTitle = (str) => {
    if (!str || typeof str !== "string") return [];
    const match = str.match(/(.+?)\s+(?:at|vs\.?|@)\s+(.+?)(?:\s+winner\?)?$/i);
    return match ? [match[1].trim(), match[2].trim()] : [];
  };

  /** Returns array of { label, percentage, propDescription, isTeamGame } for each outcome */
  const getMarketOutcomes = (ev) => {
    const markets = ev?.markets || [];
    const outcomes = [];
    const seen = new Set();
    const teamsFromTitle =
      parseTeamsFromTitle(ev?.title).length >= 2
        ? parseTeamsFromTitle(ev?.title)
        : parseTeamsFromTitle(
            ev?.markets?.[0]?.question ?? ev?.markets?.[0]?.title ?? ev?.title,
          );

    for (const m of markets) {
      const bid = m?.yesBid ?? m?.yes_bid;
      const ask = m?.yesAsk ?? m?.yes_ask;
      let pct = null;
      if (bid != null && bid > 0 && bid < 1) pct = Math.round(bid * 100);
      else if (ask != null && ask > 0 && ask < 1) pct = Math.round(ask * 100);
      else if (bid != null) pct = Math.round(bid);
      else if (ask != null) pct = Math.round(ask);
      if (pct == null) continue;

      const yesLabel = m?.yesSubTitle ?? m?.yes_sub_title;
      const noLabel = m?.noSubTitle ?? m?.no_sub_title;
      const propDesc = m?.question ?? m?.title ?? m?.subtitle ?? null;

      // Player props: event ticker contains PTS, AST, REB, etc. Team games: KXNBAGAME, KXNFLGAME, etc.
      const isPlayerProp = !!(
        ev?.ticker && /PTS|AST|REB|3PT|2D|3D/i.test(ev.ticker)
      );
      const dedupeKey = isPlayerProp
        ? (m?.ticker ?? `${pct}-${yesLabel}-${noLabel}`)
        : (yesLabel ?? noLabel ?? m?.ticker);

      // For player props: show only YES (Over) - matches Kalshi's primary "Yes" bet
      if (isPlayerProp) {
        if (yesLabel && !seen.has(dedupeKey)) {
          outcomes.push({
            label: yesLabel,
            percentage: pct,
            propDescription: propDesc,
          });
          seen.add(dedupeKey);
        }
      } else {
        // Team games: show both sides with team name. Use yes/no labels or parse from title.
        const teamA =
          yesLabel && !/winner\?|at|vs\./i.test(yesLabel)
            ? yesLabel
            : teamsFromTitle[0];
        const teamB =
          noLabel && !/winner\?|at|vs\./i.test(noLabel)
            ? noLabel
            : teamsFromTitle[1];
        if (teamA && !seen.has(teamA)) {
          outcomes.push({
            label: teamA,
            percentage: pct,
            propDescription: propDesc,
            isTeamGame: true,
          });
          seen.add(teamA);
        }
        if (teamB && !seen.has(teamB)) {
          outcomes.push({
            label: teamB,
            percentage: 100 - pct,
            propDescription: propDesc,
            isTeamGame: true,
          });
          seen.add(teamB);
        }
      }
      // Only add generic "YES" when we have no labels AND no team names (e.g. non-team markets)
      if (
        !yesLabel &&
        !noLabel &&
        !(teamsFromTitle.length >= 2 && !isPlayerProp)
      ) {
        outcomes.push({
          label: "YES",
          percentage: pct,
          propDescription: propDesc,
        });
      }
    }

    let sorted = outcomes.sort((a, b) => b.percentage - a.percentage);

    // Normalize binary team-game percentages to sum to 100% (avoids 89%+10% when API has two markets per game)
    if (sorted.length === 2 && sorted.every((o) => o.isTeamGame)) {
      const a = sorted[0].percentage;
      const b = sorted[1].percentage;
      if (a + b !== 100) {
        sorted = [
          { ...sorted[0], percentage: a },
          { ...sorted[1], percentage: 100 - a },
        ];
      }
    }

    // When we have 2 outcomes but both show the full question (e.g. "Denver at Utah Winner?"), parse team names for consistent labels
    if (sorted.length === 2 && !sorted[0].isTeamGame && !sorted[1].isTeamGame) {
      const desc = sorted[0].propDescription || sorted[1].propDescription;
      const teams = parseTeamsFromTitle(desc || ev?.title || "");
      if (teams.length >= 2) {
        const a = sorted[0].percentage;
        sorted = [
          { ...sorted[0], label: teams[0], isTeamGame: true, percentage: a },
          {
            ...sorted[1],
            label: teams[1],
            isTeamGame: true,
            percentage: 100 - a,
          },
        ];
      }
    }

    return sorted;
  };

  if (loading && sports.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#54FF00" />
          <Text style={styles.loadingText}>Loading sports...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Explore</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#54FF00"
          />
        }
      >
        {error && !selectedSport && (
          <View style={styles.errorCard}>
            <Ionicons name="alert-circle-outline" size={24} color="#FF4D4F" />
            <Text style={styles.errorText}>{error}</Text>
            <Text style={styles.errorHint}>
              Ensure ScoretradeBackend is running on port 3000
            </Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => load()}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Sport filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipScroll}
          contentContainerStyle={styles.chipContent}
        >
          {sports.map((s) => (
            <TouchableOpacity
              key={s.slug}
              style={[
                styles.chip,
                selectedSport?.slug === s.slug && styles.chipSelected,
              ]}
              onPress={() => handleSelectSport(s)}
            >
              <MaterialCommunityIcons
                name={getSportIcon(s.slug)}
                size={18}
                color={selectedSport?.slug === s.slug ? "#101113" : "#54FF00"}
              />
              <Text
                style={[
                  styles.chipText,
                  selectedSport?.slug === s.slug && styles.chipTextSelected,
                ]}
              >
                {s.slug.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Scope filter */}
        {selectedSport && (
          <>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.chipScroll}
              contentContainerStyle={styles.chipContent}
            >
              {(Array.isArray(selectedSport.scopes)
                ? selectedSport.scopes
                : Object.keys(selectedSport.scopes || {})
              ).map((scope) => (
                <TouchableOpacity
                  key={scope}
                  style={[
                    styles.chip,
                    selectedScope === scope && styles.chipSelected,
                  ]}
                  onPress={() => setSelectedScope(scope)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      selectedScope === scope && styles.chipTextSelected,
                    ]}
                  >
                    {scope}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

        {/* Events list */}
        {loadingEvents ? (
          <View style={styles.eventsLoader}>
            <ActivityIndicator color="#54FF00" />
            <Text style={styles.loadingText}>Loading events...</Text>
          </View>
        ) : error && selectedSport ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => fetchEvents(selectedSport.slug, selectedScope)}
            >
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : filteredEvents.length === 0 ? (
          <View style={styles.emptyCard}>
            <MaterialCommunityIcons
              name="calendar-blank-outline"
              size={48}
              color="#54FF00"
            />
            <Text style={styles.emptyText}>
              {selectedSport
                ? searchQuery
                  ? "No events match your search"
                  : "No events in this scope"
                : "Select a sport to view events"}
            </Text>
          </View>
        ) : (
          filteredEvents.map((ev) => {
            const outcomes = getMarketOutcomes(ev);
            const eventKey = ev.ticker || ev.title || String(ev.id || "");
            const isExpanded = !!expandedEvents[eventKey];
            const visibleOutcomes =
              outcomes.length > 4 && !isExpanded
                ? outcomes.slice(0, 4)
                : outcomes;

            return (
              <View key={eventKey} style={styles.eventCard}>
                <Text style={styles.eventTitle} numberOfLines={2}>
                  {ev.title || ev.ticker || "Untitled"}
                </Text>
                {visibleOutcomes.length > 0 ? (
                  <View style={styles.outcomesContainer}>
                    {visibleOutcomes.map(
                      (
                        { label, percentage, propDescription, isTeamGame },
                        idx,
                      ) => {
                        const globalIndex = outcomes.indexOf(
                          visibleOutcomes[idx],
                        );
                        // Binary matchup (exactly 2): leader = green, underdog = red for consistency
                        const isBinaryTeamGame =
                          outcomes.length === 2 &&
                          outcomes.every((o) => o.isTeamGame);
                        const isLeader = isBinaryTeamGame && globalIndex === 0;
                        const isUnderdog =
                          isBinaryTeamGame && globalIndex === 1;
                        let color = "#FAAD14";
                        if (isLeader) color = "#54FF00";
                        else if (isUnderdog) color = "#FF4D4F";
                        else if (percentage >= 60) color = "#54FF00";
                        else if (percentage >= 30) color = "#FAAD14";
                        else color = "#FF4D4F";

                        return (
                          <View
                            key={`${eventKey}-${globalIndex}-${label}`}
                            style={styles.outcomeRow}
                          >
                            <Text style={styles.outcomeTeam} numberOfLines={2}>
                              {isTeamGame ? label : propDescription || label}
                            </Text>
                            <Text style={[styles.outcomePercent, { color }]}>
                              {percentage}%
                            </Text>
                            <View style={styles.percentBar}>
                              <View
                                style={[
                                  styles.percentFill,
                                  {
                                    width: `${Math.min(percentage, 100)}%`,
                                    backgroundColor: color,
                                  },
                                ]}
                              />
                            </View>
                          </View>
                        );
                      },
                    )}

                    {outcomes.length > 4 && (
                      <TouchableOpacity
                        onPress={() =>
                          setExpandedEvents((prev) => ({
                            ...prev,
                            [eventKey]: !prev[eventKey],
                          }))
                        }
                        style={styles.showMoreRow}
                      >
                        <Text style={styles.showMoreText}>
                          {isExpanded
                            ? "Show less"
                            : `Show all (${outcomes.length})`}
                        </Text>
                        <Ionicons
                          name={isExpanded ? "chevron-up" : "chevron-down"}
                          size={16}
                          color="#54FF00"
                        />
                      </TouchableOpacity>
                    )}
                  </View>
                ) : null}
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#101113",
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "rgba(255,255,255,0.7)",
    marginTop: 12,
    fontSize: 15,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 14,
  },
  title: {
    fontSize: 25,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: 0.5,
    bottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: "#54FF00",
    marginTop: 4,
    letterSpacing: 0.3,
  },
  scrollView: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  errorCard: {
    backgroundColor: "rgba(26, 24, 27, 0.8)",
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 77, 79, 0.3)",
    alignItems: "center",
  },
  errorText: {
    color: "#FF4D4F",
    marginTop: 12,
    textAlign: "center",
    fontSize: 15,
  },
  errorHint: {
    color: "rgba(255,255,255,0.5)",
    marginTop: 8,
    fontSize: 13,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 24,
    backgroundColor: "rgba(84, 255, 0, 0.2)",
    borderRadius: 12,
  },
  retryText: {
    color: "#54FF00",
    fontWeight: "600",
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255,255,255,0.6)",
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  chipScroll: { marginBottom: 20 },
  chipContent: { gap: 10, paddingRight: 20 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "rgba(26, 24, 27, 0.8)",
    borderWidth: 1,
    borderColor: "rgba(84, 255, 0, 0.3)",
    gap: 8,
  },
  chipSelected: {
    backgroundColor: "#54FF00",
    borderColor: "#54FF00",
  },
  chipText: {
    color: "#54FF00",
    fontWeight: "600",
    fontSize: 14,
  },
  chipTextSelected: {
    color: "#101113",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(26, 24, 27, 0.8)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(84, 255, 0, 0.1)",
    gap: 12,
  },
  searchInput: {
    flex: 1,
    color: "#ffffff",
    fontSize: 16,
    paddingVertical: 4,
  },
  eventsLoader: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyCard: {
    backgroundColor: "rgba(26, 24, 27, 0.8)",
    borderRadius: 16,
    padding: 40,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(84, 255, 0, 0.1)",
    alignItems: "center",
  },
  emptyText: {
    color: "rgba(255,255,255,0.7)",
    marginTop: 16,
    fontSize: 16,
    textAlign: "center",
  },
  eventCard: {
    backgroundColor: "rgba(26, 24, 27, 0.8)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(84, 255, 0, 0.1)",
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
    letterSpacing: 0.3,
    marginBottom: 12,
  },
  outcomesContainer: { flex: 1, minWidth: 0 },
  outcomeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    gap: 8,
  },
  outcomeTeam: {
    fontSize: 13,
    color: "rgba(255,255,255,0.9)",
    flex: 1,
    marginRight: 8,
  },
  outcomePercent: {
    fontSize: 15,
    fontWeight: "800",
    minWidth: 36,
    textAlign: "right",
  },
  percentBar: {
    width: 60,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.1)",
    marginTop: 6,
    overflow: "hidden",
  },
  percentFill: {
    height: "100%",
    borderRadius: 3,
  },
  showMoreRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginTop: 8,
    gap: 4,
  },
  showMoreText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#54FF00",
  },
});
