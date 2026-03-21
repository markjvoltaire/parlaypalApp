import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Pressable,
  RefreshControl,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState, useCallback, useEffect } from "react";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useExploreData } from "../contexts/ExploreDataContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const ACCENT = "#54FF00";
const BG = "#08080A";
const SURFACE = "rgba(255,255,255,0.035)";
const SURFACE_BORDER = "rgba(255,255,255,0.055)";
const DIM = "rgba(255,255,255,0.4)";
const MUTED = "rgba(255,255,255,0.6)";

/** Pill colors for key Discover scopes (Player Props, Spread, Futures). */
function getScopePillInfo(scope) {
  if (scope == null || scope === "") return null;
  const s = String(scope).toLowerCase();
  if (s.includes("player prop"))
    return { label: "Props", bg: "rgba(247, 127, 0, 0.18)", color: "#F77F00" };
  if (s.includes("spread"))
    return { label: "Spread", bg: "rgba(72, 149, 239, 0.18)", color: "#4895EF" };
  if (s.includes("future"))
    return { label: "Futures", bg: "rgba(230, 57, 70, 0.15)", color: "#FF6B6B" };
  return {
    label: String(scope).length > 14
      ? `${String(scope).slice(0, 12)}…`
      : String(scope),
    bg: "rgba(84, 255, 0, 0.1)",
    color: ACCENT,
  };
}

function Explore() {
  const navigation = useNavigation();
  const tabBarHeight = useBottomTabBarHeight();
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

  const [expandedEvents, setExpandedEvents] = useState({});

  const openEventDetail = useCallback(
    (ev) => {
      const eventTicker =
        ev?.ticker ?? (ev?.id != null ? String(ev.id) : null);
      if (!eventTicker) return;
      navigation.navigate("EventDetail", { eventTicker, event: ev });
    },
    [navigation],
  );

  useEffect(() => {
    loadIfNeeded();
  }, [loadIfNeeded]);

  // Auto-select the first sport once loaded
  useEffect(() => {
    if (sports.length > 0 && !selectedSport) {
      handleSelectSport(sports[0]);
    }
  }, [sports]);

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

  const filteredEvents = events;

  const getSportIcon = (slug) => {
    const s = (slug || "").toLowerCase();
    if (s.includes("nba") || s.includes("basketball")) return "basketball";
    if (s.includes("nfl") || s.includes("football")) return "football";
    if (s.includes("mlb") || s.includes("baseball")) return "baseball";
    if (s.includes("nhl") || s.includes("hockey")) return "hockey-sticks";
    if (s.includes("soccer") || s.includes("mls") || s.includes("epl"))
      return "soccer";
    if (s.includes("mma") || s.includes("ufc")) return "karate";
    if (s.includes("boxing")) return "boxing-glove";
    if (s.includes("golf")) return "golf";
    if (s.includes("tennis")) return "tennis";
    return "trophy";
  };

  const getSportColor = (slug) => {
    const s = (slug || "").toLowerCase();
    if (s.includes("nba")) return "#F77F00";
    if (s.includes("nfl")) return "#4895EF";
    if (s.includes("mlb")) return "#E63946";
    if (s.includes("nhl")) return "#48CAE4";
    if (s.includes("soccer") || s.includes("mls") || s.includes("epl"))
      return "#06D6A0";
    if (s.includes("mma") || s.includes("ufc")) return "#E76F51";
    if (s.includes("boxing")) return "#D62828";
    return ACCENT;
  };

  const parseTeamsFromTitle = (str) => {
    if (!str || typeof str !== "string") return [];
    const match = str.match(
      /(.+?)\s+(?:at|vs\.?|@)\s+(.+?)(?:\s+winner\?)?$/i,
    );
    return match ? [match[1].trim(), match[2].trim()] : [];
  };

  const getOutcomesForEvent = (ev) => {
    const nested = ev?.markets || [];
    const outcomes = [];
    const seen = new Set();
    const teamsFromTitle =
      parseTeamsFromTitle(ev?.title).length >= 2
        ? parseTeamsFromTitle(ev?.title)
        : parseTeamsFromTitle(
            ev?.markets?.[0]?.question ?? ev?.markets?.[0]?.title ?? ev?.title,
          );

    for (const m of nested) {
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

      const isPlayerProp = !!(
        ev?.ticker && /PTS|AST|REB|3PT|2D|3D/i.test(ev.ticker)
      );
      const dedupeKey = isPlayerProp
        ? (m?.ticker ?? `${pct}-${yesLabel}-${noLabel}`)
        : (yesLabel ?? noLabel ?? m?.ticker);

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

    if (
      sorted.length === 2 &&
      !sorted[0].isTeamGame &&
      !sorted[1].isTeamGame
    ) {
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

  const getOutcomeColor = (percentage, idx, total, outcomes) => {
    const isBinaryTeamGame =
      total === 2 && outcomes.every((o) => o.isTeamGame);
    if (isBinaryTeamGame && idx === 0) return ACCENT;
    if (isBinaryTeamGame && idx === 1) return "#FF4D4F";
    if (percentage >= 60) return ACCENT;
    if (percentage >= 30) return "#FFD60A";
    return "#FF4D4F";
  };

  // Check if event is a binary matchup (2 teams)
  const isBinaryMatchup = (outcomes) =>
    outcomes.length === 2 && outcomes.every((o) => o.isTeamGame);

  const scopePill = getScopePillInfo(selectedScope);

  if (loading && sports.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={ACCENT} />
          <Text style={styles.loadingLabel}>Loading sports...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const scopeList = selectedSport
    ? Array.isArray(selectedSport.scopes)
      ? selectedSport.scopes
      : Object.keys(selectedSport.scopes || {})
    : [];

  // Separate matchups from other lines for organized display
  const matchups = [];
  const props = [];
  filteredEvents.forEach((ev) => {
    const outcomes = getOutcomesForEvent(ev);
    if (isBinaryMatchup(outcomes)) {
      matchups.push({ ev, outcomes });
    } else {
      props.push({ ev, outcomes });
    }
  });

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={styles.title}>Discover</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: tabBarHeight + 28 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={ACCENT}
          />
        }
      >
        {error && !selectedSport && (
          <View style={styles.errorCard}>
            <View style={styles.errorIconCircle}>
              <Ionicons
                name="cloud-offline-outline"
                size={24}
                color="#FF4D4F"
              />
            </View>
            <Text style={styles.errorTitle}>Connection Error</Text>
            <Text style={styles.errorBody}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={() => load()}>
              <Text style={styles.retryLabel}>Try Again</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Sport Category Tiles ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Sports</Text>
          <Text style={styles.sectionCount}>{sports.length} available</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tilesRow}
        >
          {sports.map((s) => {
            const isActive = selectedSport?.slug === s.slug;
            const sportColor = getSportColor(s.slug);
            return (
              <TouchableOpacity
                key={s.slug}
                style={[
                  styles.sportTile,
                  isActive && { borderColor: sportColor },
                ]}
                onPress={() => handleSelectSport(s)}
                activeOpacity={0.75}
              >
                <View
                  style={[
                    styles.sportIconCircle,
                    {
                      backgroundColor: isActive
                        ? sportColor + "18"
                        : "rgba(255,255,255,0.04)",
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={getSportIcon(s.slug)}
                    size={22}
                    color={isActive ? sportColor : MUTED}
                  />
                </View>
                <Text
                  style={[
                    styles.sportTileLabel,
                    isActive && { color: "#fff" },
                  ]}
                  numberOfLines={1}
                >
                  {s.slug.toUpperCase()}
                </Text>
                {isActive && (
                  <View
                    style={[styles.sportActiveDot, { backgroundColor: sportColor }]}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ── Scope Tabs ── */}
        {selectedSport && scopeList.length > 0 && (
          <View style={styles.scopeBar}>
            {scopeList.map((scope) => {
              const isActive = selectedScope === scope;
              return (
                <TouchableOpacity
                  key={scope}
                  style={[styles.scopeTab, isActive && styles.scopeTabActive]}
                  onPress={() => setSelectedScope(scope)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.scopeTabText,
                      isActive && styles.scopeTabTextActive,
                    ]}
                  >
                    {scope}
                  </Text>
                  {isActive && <View style={styles.scopeIndicator} />}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* ── Content ── */}
        {loadingEvents ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator color={ACCENT} size="small" />
            <Text style={styles.loaderText}>Loading events...</Text>
          </View>
        ) : error && selectedSport ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorBody}>{error}</Text>
            <TouchableOpacity
              style={styles.retryBtn}
              onPress={() => fetchEvents(selectedSport.slug, selectedScope)}
            >
              <Text style={styles.retryLabel}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : filteredEvents.length === 0 ? (
          <View style={styles.emptyWrap}>
            <View style={styles.emptyCircle}>
              <Ionicons
                name={selectedSport ? "calendar-outline" : "compass-outline"}
                size={30}
                color={ACCENT}
              />
            </View>
            <Text style={styles.emptyTitle}>
              {selectedSport ? "No events yet" : "Pick a sport to start"}
            </Text>
            <Text style={styles.emptyBody}>
              {selectedSport
                ? "Check back soon for new events"
                : "Select a sport above to get started"}
            </Text>
          </View>
        ) : (
          <>
            {/* ── Matchups Section ── */}
            {matchups.length > 0 && (
              <>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Matchups</Text>
                  <View style={styles.countBadge}>
                    <Text style={styles.countBadgeText}>
                      {matchups.length}
                    </Text>
                  </View>
                </View>
                {matchups.map(({ ev, outcomes }) => {
                  const eventKey =
                    ev.ticker || ev.title || String(ev.id || "");
                  const teamA = outcomes[0];
                  const teamB = outcomes[1];
                  const colorA = ACCENT;
                  const colorB = "#FF4D4F";

                  return (
                    <Pressable
                      key={eventKey}
                      onPress={() => openEventDetail(ev)}
                      style={({ pressed }) => [
                        styles.matchupCard,
                        pressed && styles.matchupCardPressed,
                      ]}
                    >
                      <Text style={styles.matchupTitle} numberOfLines={1}>
                        {ev.title || ev.ticker || "Untitled"}
                      </Text>
                      <View style={styles.matchupBody}>
                        {/* Team A */}
                        <View style={styles.matchupTeam}>
                          <Text style={styles.matchupTeamName} numberOfLines={2}>
                            {teamA.label}
                          </Text>
                          <Text style={[styles.matchupPct, { color: colorA }]}>
                            {teamA.percentage}%
                          </Text>
                        </View>

                        {/* VS divider */}
                        <View style={styles.vsDivider}>
                          <View style={styles.vsLine} />
                          <Text style={styles.vsText}>VS</Text>
                          <View style={styles.vsLine} />
                        </View>

                        {/* Team B */}
                        <View style={styles.matchupTeam}>
                          <Text style={styles.matchupTeamName} numberOfLines={2}>
                            {teamB.label}
                          </Text>
                          <Text style={[styles.matchupPct, { color: colorB }]}>
                            {teamB.percentage}%
                          </Text>
                        </View>
                      </View>

                      {/* Combined bar */}
                      <View style={styles.matchupBar}>
                        <View
                          style={[
                            styles.matchupBarFillA,
                            {
                              width: `${teamA.percentage}%`,
                              backgroundColor: colorA,
                            },
                          ]}
                        />
                        <View
                          style={[
                            styles.matchupBarFillB,
                            {
                              width: `${teamB.percentage}%`,
                              backgroundColor: colorB,
                            },
                          ]}
                        />
                      </View>
                    </Pressable>
                  );
                })}
              </>
            )}

            {/* ── Line cards grouped by game / event ── */}
            {props.length > 0 && (
              <>
                <View style={[styles.sectionHeader, matchups.length > 0 && { marginTop: 8 }]}>
                  <Text style={styles.sectionTitle}>
                    {selectedScope || "Events"}
                  </Text>
                  <View style={styles.countBadge}>
                    <Text style={styles.countBadgeText}>{props.length}</Text>
                  </View>
                </View>
                {props.map(({ ev, outcomes }) => {
                  const eventKey =
                    ev.ticker || ev.title || String(ev.id || "");
                  const isExpanded = !!expandedEvents[eventKey];
                  const visibleOutcomes =
                    outcomes.length > 4 && !isExpanded
                      ? outcomes.slice(0, 4)
                      : outcomes;

                  return (
                    <View key={eventKey} style={styles.eventGroup}>
                      <Text style={styles.gameGroupTitle} numberOfLines={2}>
                        {ev.title || ev.ticker || "Untitled"}
                      </Text>

                      {visibleOutcomes.length > 0 && (
                        <>
                          <View style={styles.lineCardsStack}>
                            {visibleOutcomes.map((item) => {
                              const globalIndex = outcomes.indexOf(item);
                              const color = getOutcomeColor(
                                item.percentage,
                                globalIndex,
                                outcomes.length,
                                outcomes,
                              );
                              return (
                                <LineCard
                                  key={`${eventKey}-${globalIndex}-${item.label}`}
                                  item={item}
                                  color={color}
                                  scopePill={scopePill}
                                />
                              );
                            })}
                          </View>

                          {outcomes.length > 4 && (
                            <TouchableOpacity
                              onPress={() =>
                                setExpandedEvents((prev) => ({
                                  ...prev,
                                  [eventKey]: !prev[eventKey],
                                }))
                              }
                              style={styles.expandRow}
                              activeOpacity={0.7}
                            >
                              <Text style={styles.expandText}>
                                {isExpanded
                                  ? "Show less"
                                  : `Show all (${outcomes.length})`}
                              </Text>
                              <Ionicons
                                name={
                                  isExpanded ? "chevron-up" : "chevron-down"
                                }
                                size={14}
                                color={ACCENT}
                              />
                            </TouchableOpacity>
                          )}
                        </>
                      )}
                    </View>
                  );
                })}
              </>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function LineCard({ item, color, scopePill, onPress }) {
  const { label, percentage, propDescription, isTeamGame } = item;
  const title = isTeamGame ? label : propDescription || label;

  const inner = (
    <>
      <View style={styles.lineCardTop}>
        {scopePill ? (
          <View style={[styles.scopePill, { backgroundColor: scopePill.bg }]}>
            <Text style={[styles.scopePillText, { color: scopePill.color }]}>
              {scopePill.label}
            </Text>
          </View>
        ) : (
          <View style={{ flex: 1 }} />
        )}
        <Text style={[styles.lineCardPct, { color }]}>{percentage}%</Text>
      </View>
      <Text style={styles.lineCardTitle} numberOfLines={3}>
        {title}
      </Text>
      <View style={styles.lineBarTrack}>
        <View
          style={[
            styles.lineBarFill,
            {
              width: `${Math.min(percentage, 100)}%`,
              backgroundColor: color,
            },
          ]}
        />
      </View>
    </>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.lineCard,
          pressed && styles.lineCardPressed,
        ]}
      >
        {inner}
      </Pressable>
    );
  }

  return <View style={styles.lineCard}>{inner}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingLabel: {
    color: DIM,
    marginTop: 14,
    fontSize: 14,
  },

  /* ── Header ── */
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: -0.8,
  },

  /* ── Scroll ── */
  scroll: { flex: 1 },

  /* ── Section Headers ── */
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 12,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: -0.2,
  },
  sectionCount: {
    fontSize: 12,
    color: DIM,
    letterSpacing: 0.2,
  },
  countBadge: {
    backgroundColor: "rgba(84, 255, 0, 0.1)",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  countBadgeText: {
    color: ACCENT,
    fontSize: 12,
    fontWeight: "700",
  },

  /* ── Sport Tiles ── */
  tilesRow: {
    paddingHorizontal: 20,
    gap: 10,
    paddingBottom: 20,
  },
  sportTile: {
    width: 80,
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 6,
    borderRadius: 16,
    backgroundColor: SURFACE,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  sportIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  sportTileLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: DIM,
    letterSpacing: 0.8,
    textAlign: "center",
  },
  sportActiveDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginTop: 6,
  },

  /* ── Scope Tabs ── */
  scopeBar: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 4,
  },
  scopeTab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: "center",
  },
  scopeTabActive: {
    backgroundColor: "rgba(84, 255, 0, 0.08)",
  },
  scopeTabText: {
    fontSize: 13,
    fontWeight: "600",
    color: DIM,
  },
  scopeTabTextActive: {
    color: ACCENT,
  },
  scopeIndicator: {
    width: 16,
    height: 2,
    borderRadius: 1,
    backgroundColor: ACCENT,
    marginTop: 4,
  },

  /* ── Error ── */
  errorCard: {
    marginHorizontal: 20,
    backgroundColor: SURFACE,
    borderRadius: 20,
    padding: 28,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 77, 79, 0.12)",
    alignItems: "center",
  },
  errorIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(255, 77, 79, 0.08)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  errorTitle: {
    color: "#FF4D4F",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  errorBody: {
    color: DIM,
    textAlign: "center",
    fontSize: 13,
    lineHeight: 18,
  },
  retryBtn: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 28,
    backgroundColor: "rgba(84, 255, 0, 0.08)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(84, 255, 0, 0.15)",
  },
  retryLabel: {
    color: ACCENT,
    fontWeight: "700",
    fontSize: 13,
  },

  /* ── Empty ── */
  emptyWrap: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(84, 255, 0, 0.06)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 6,
  },
  emptyBody: {
    color: DIM,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
  },

  /* ── Loader ── */
  loaderWrap: {
    alignItems: "center",
    paddingVertical: 48,
    gap: 12,
  },
  loaderText: {
    color: DIM,
    fontSize: 13,
  },

  /* ── Matchup Cards ── */
  matchupCard: {
    marginHorizontal: 20,
    backgroundColor: SURFACE,
    borderRadius: 18,
    padding: 18,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: SURFACE_BORDER,
  },
  matchupCardPressed: {
    opacity: 0.92,
    borderColor: "rgba(84, 255, 0, 0.25)",
  },
  matchupTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: DIM,
    letterSpacing: 0.3,
    textTransform: "uppercase",
    marginBottom: 14,
    textAlign: "center",
  },
  matchupBody: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  matchupTeam: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  matchupTeamName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    letterSpacing: -0.2,
  },
  matchupPct: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  vsDivider: {
    alignItems: "center",
    paddingHorizontal: 12,
    gap: 4,
  },
  vsLine: {
    width: 1,
    height: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  vsText: {
    fontSize: 10,
    fontWeight: "800",
    color: DIM,
    letterSpacing: 1,
  },
  matchupBar: {
    flexDirection: "row",
    height: 5,
    borderRadius: 2.5,
    overflow: "hidden",
    gap: 2,
  },
  matchupBarFillA: {
    height: "100%",
    borderRadius: 2.5,
    opacity: 0.8,
  },
  matchupBarFillB: {
    height: "100%",
    borderRadius: 2.5,
    opacity: 0.8,
  },

  /* ── Line cards grouped by game / event ── */
  eventGroup: {
    marginHorizontal: 20,
    marginBottom: 18,
  },
  gameGroupTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: -0.3,
    marginBottom: 10,
    lineHeight: 20,
  },
  lineCardsStack: {
    gap: 8,
  },
  lineCard: {
    backgroundColor: SURFACE,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: SURFACE_BORDER,
  },
  lineCardPressed: {
    borderColor: "rgba(84, 255, 0, 0.3)",
    backgroundColor: "rgba(255,255,255,0.045)",
  },
  lineCardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
    minHeight: 22,
  },
  scopePill: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  scopePillText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  lineCardPct: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  lineCardTitle: {
    fontSize: 13,
    fontWeight: "500",
    color: MUTED,
    marginBottom: 10,
    lineHeight: 18,
  },
  lineBarTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.06)",
    overflow: "hidden",
  },
  lineBarFill: {
    height: "100%",
    borderRadius: 2,
  },

  /* ── Expand ── */
  expandRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 10,
    marginTop: 4,
    gap: 4,
  },
  expandText: {
    fontSize: 12,
    fontWeight: "600",
    color: ACCENT,
  },
});

export default Explore;
