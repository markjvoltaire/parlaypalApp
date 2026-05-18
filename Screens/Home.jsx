import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Dimensions,
  Animated,
  Modal,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useState, useRef, useEffect } from "react";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import LottieView from "lottie-react-native";
import Purchases from "react-native-purchases";
import { LinearGradient } from "expo-linear-gradient";
// import EventSource from "react-native-event-source";

import { startSlipAnalysis } from "../src/services/analyzeSlip";
import {
  calculateImpliedProbability,
  normalizePct,
  resolveParlayProbability,
} from "../src/utils/probability";

const { width, height } = Dimensions.get("window");
// Replace 'your_public_sdk_key' with your RevenueCat public API key.
Purchases.configure({ apiKey: "appl_uPPCiaHpkTLNkrlhOikrUMWLaBH" });

/* ---------------- Floating decorative dots ---------------- */
const FloatingElements = () => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 8000,
        useNativeDriver: true,
      }),
    ).start();
  }, [animatedValue]);
  return (
    <View style={styles.floatingElements}>
      <Animated.View
        style={[
          styles.floatingDot,
          {
            top: "15%",
            left: "10%",
            backgroundColor: "#54FF00",
            transform: [
              {
                translateY: animatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 20],
                }),
              },
            ],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.floatingDot,
          {
            top: "65%",
            right: "15%",
            backgroundColor: "rgba(84, 255, 0, 0.6)",
            transform: [
              {
                translateY: animatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.floatingDot,
          {
            top: "40%",
            left: "85%",
            backgroundColor: "rgba(84, 255, 0, 0.3)",
            width: 6,
            height: 6,
            transform: [
              {
                translateY: animatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -15],
                }),
              },
            ],
          },
        ]}
      />
    </View>
  );
};

/* ---------------- Reusable glass card ---------------- */
const GlassCard = ({ children, style, ...props }) => (
  <View style={[styles.glassCard, style]} {...props}>
    {children}
  </View>
);

/* ---------------- Inline splash ---------------- */
const SplashScreen = ({ onFinish }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        if (onFinish) onFinish();
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim, glowAnim, onFinish]);

  return (
    <Animated.View style={[styles.splashContainer, { opacity: fadeAnim }]}>
      <FloatingElements />
      <Animated.View
        style={[
          styles.splashLogoContainer,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        <Animated.View
          style={[
            styles.logoGlow,
            {
              opacity: glowAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.3, 0.8],
              }),
              transform: [
                {
                  scale: glowAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.2],
                  }),
                },
              ],
            },
          ]}
        />
        <Image
          source={require("../assets/Activity.png")}
          style={styles.splashLogoImage}
        />
        <Text style={styles.splashAppTitle}>Parlay Pal</Text>
        <Text style={styles.splashAppTagline}>AI-Powered Bet Analysis</Text>
        <View style={styles.splashLoader}>
          <View style={styles.loaderDots}>
            {[0, 1, 2].map((i) => (
              <Animated.View
                key={i}
                style={[
                  styles.loaderDot,
                  {
                    transform: [
                      {
                        scale: glowAnim.interpolate({
                          inputRange: [0, 0.5, 1],
                          outputRange: [0.8, 1.2, 0.8],
                        }),
                      },
                    ],
                    opacity: glowAnim.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0.5, 1, 0.5],
                    }),
                  },
                ]}
              />
            ))}
          </View>
        </View>
      </Animated.View>
    </Animated.View>
  );
};

/* ---------------- Bet skeleton (optional) ---------------- */
const BetSkeleton = () => (
  <View style={[styles.betContainer, { opacity: 0.7 }]}>
    <View style={styles.betHeader}>
      <View style={{ flex: 1, marginRight: 12 }}>
        <View
          style={{
            height: 18,
            backgroundColor: "rgba(255,255,255,0.08)",
            borderRadius: 6,
            marginBottom: 8,
          }}
        />
        <View
          style={{
            height: 14,
            width: "60%",
            backgroundColor: "rgba(255,255,255,0.06)",
            borderRadius: 6,
          }}
        />
      </View>
      <View style={styles.oddsTag}>
        <Text style={styles.oddsText}>…</Text>
      </View>
    </View>
    <View
      style={{
        height: 10,
        backgroundColor: "rgba(255,255,255,0.08)",
        borderRadius: 5,
        marginVertical: 16,
      }}
    />
    <GlassCard style={styles.insightsCard}>
      <View
        style={{
          height: 14,
          backgroundColor: "rgba(255,255,255,0.06)",
          borderRadius: 6,
          marginBottom: 10,
        }}
      />
      <View
        style={{
          height: 14,
          backgroundColor: "rgba(255,255,255,0.06)",
          borderRadius: 6,
          marginBottom: 10,
        }}
      />
      <View
        style={{
          height: 14,
          backgroundColor: "rgba(255,255,255,0.06)",
          borderRadius: 6,
        }}
      />
    </GlassCard>
  </View>
);

/* ---------------- Single pending loader (global) ---------------- */
const PendingLoader = ({ count }) => (
  <View style={{ paddingHorizontal: 20, paddingVertical: 16 }}>
    <View
      style={{
        backgroundColor: "rgba(255,255,255,0.06)",
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: "rgba(84,255,0,0.12)",
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <ActivityIndicator color="#54FF00" />
        <Text
          style={{
            marginLeft: 12,
            color: "rgba(255,255,255,0.85)",
            fontWeight: "600",
          }}
        >
          Processing {count} more {count === 1 ? "leg" : "legs"}…
        </Text>
      </View>
    </View>
  </View>
);

/* ---------------- Helpers ---------------- */
const normalizeTeams = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean).map(String);
  if (typeof value === "string") {
    const parts = value
      .split(/\s*(?:vs\.?|@|-|,|\band\b)\s*/i)
      .map((s) => s.trim())
      .filter(Boolean);
    return parts.length ? parts : [value.trim()];
  }
  if (typeof value === "object") {
    const { home, away, team, opponent } = value;
    const arr = [home, away, team, opponent].filter(Boolean).map(String);
    return arr.length ? arr : [];
  }
  return [];
};

const getMatchupKey = (bet) => {
  const teams = normalizeTeams(bet?.teams);
  if (teams.length >= 2) return `${teams[0]} vs ${teams[1]}`;
  if (bet?.matchup) return String(bet.matchup);
  if (bet?.detail) return String(bet.detail);
  return "";
};

/* ---------------- Inline Odds Component ---------------- */
const InlineOdds = ({ matchup, data }) => {
  if (!matchup || !data) return null;
  return (
    <GlassCard style={[styles.insightsCard, { marginTop: 12 }]}>
      <View style={styles.insightRow}>
        <View style={styles.insightIconContainer}>
          <Ionicons name="pricetags-outline" size={18} color="#54FF00" />
        </View>
        <View style={styles.insightContent}>
          <Text style={styles.insightLabel}>Odds</Text>
          <Text style={styles.insightText}>
            Books compared: {data.books_considered?.length || 0}
          </Text>
        </View>
      </View>

      {Array.isArray(data.books_considered) &&
        data.books_considered.length > 0 && (
          <>
            <View style={styles.insightDivider} />
            {data.books_considered.map((book, idx) => (
              <View key={`${matchup}-book-${idx}`} style={styles.bookOddRow}>
                <Text style={styles.bookName}>{book.book}</Text>
                <Text style={styles.bookOdds}>
                  {book.odds_american > 0
                    ? `+${book.odds_american}`
                    : book.odds_american}
                </Text>
                <Text style={styles.bookImpliedProb} />
              </View>
            ))}
          </>
        )}

      {data.best_available_odds && (
        <>
          <View style={styles.insightDivider} />
          <View style={styles.bookOddRow}>
            <Text style={styles.bestBookName}>
              Best Available: {data.best_available_odds.book}
            </Text>
            <Text style={[styles.bestBookOdds, { marginLeft: "auto" }]}>
              {data.best_available_odds.odds_american > 0
                ? `+${data.best_available_odds.odds_american}`
                : data.best_available_odds.odds_american}
            </Text>
          </View>
        </>
      )}

      {data.analysis ? (
        <>
          <View style={styles.insightDivider} />
          <Text style={styles.insightText}>{data.analysis}</Text>
        </>
      ) : null}
    </GlassCard>
  );
};

/* ---------------- Main Screen ---------------- */
export default function Home({ navigation }) {
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [analysisResponse, setAnalysisResponse] = useState(null);
  const [showSplash, setShowSplash] = useState(true);
  const [evtSource, setEvtSource] = useState(null); // kept for parity
  const scrollViewRef = useRef(null);
  const [oddsResults, setOddsResults] = useState({});
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [products, setProducts] = useState([]);

  // NEW: track true total and completed legs
  const [totalLegs, setTotalLegs] = useState(null); // number | null
  const [completedIds, setCompletedIds] = useState(new Set()); // Set<string>

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const handleSplashFinish = () => setShowSplash(false);

  // Fetch products from RevenueCat when component mounts
  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      try {
        const customerInfo = await Purchases.getCustomerInfo();
        const userId = customerInfo.originalAppUserId;

        console.log("userId", userId);

        if (
          customerInfo.activeSubscriptions &&
          customerInfo.activeSubscriptions.length > 0
        ) {
          console.log("User is currently subscribed.");
          setIsSubscribed(true);
        } else {
          console.log("User is not subscribed.");
          setIsSubscribed(false);
        }

        const offerings = await Purchases.getOfferings();
        if (
          offerings.current !== null &&
          offerings.current.availablePackages.length > 0
        ) {
          setProducts(offerings.current.availablePackages);
        }
      } catch (error) {
        console.error("Error fetching customer info:", error);
      }
    };

    checkSubscriptionStatus();
  }, []); // Empty dependency array means this effect runs once on mount

  useEffect(() => {
    if (analysisResponse) {
      fadeAnim.setValue(0);
      slideAnim.setValue(30);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [analysisResponse, fadeAnim, slideAnim]);

  useEffect(() => {
    return () => {
      try {
        evtSource && evtSource.close();
      } catch (e) {}
    };
  }, [evtSource]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Parlay Pal needs access to your photo library to upload a bet slip.",
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setAnalysisResponse(null);
    }
  };

  /* ---------------- Upload image, then open SSE and stream results ---------------- */

  const uploadImage = async () => {
    const customerInfo = await Purchases.getCustomerInfo();
    const userId = customerInfo.originalAppUserId;

    if (!image) {
      Alert.alert("Please select an image first");
      return;
    }

    if (!isSubscribed) {
      navigation.navigate("Offer");
      return;
    }

    setUploading(true);
    setAnalysisResponse(null);
    setOddsResults({});
    // reset totals
    setTotalLegs(null);
    setCompletedIds(new Set());

    try {
      let streamCtrl = null;

      const handleEvent = (type, payload) => {
        try {
          if (type === "status") {
            return;
          }

          if (type === "connection_error") {
            streamCtrl?.markClosed();
            setUploading(false);
            Alert.alert("Connection Error", "Please try again.");
            return;
          }

          if (type === "init") {
            const total = Number(payload.total || 0);
            setTotalLegs(total); // NEW: store true total
            const imageUrl = payload.imageUrl;
            const placeholders = Array.from({ length: total }, (_, i) => ({
              id: `bet-${i}`,
              teams: [],
              bet_type: "",
              odds: null,
              detail: "Loading…",
              probability: null,
              parlay_question: "",
              cover_question: "",
              analysis: null,
              cover_analysis: null,
            }));
            setAnalysisResponse({
              imageUrl,
              parlay_probability: null,
              leagues: [{ league: "Loading", parlay_bets: placeholders }],
              responsible_betting_reminder: "",
            });
            setUploading(false);
            scrollViewRef.current?.scrollTo({ y: 0, animated: true });
            return;
          }

          if (type === "bet") {
            const { leagueIndex, betIndex, league, bet } = payload;
            setAnalysisResponse((prev) => {
              if (!prev) return prev;
              const leagues = prev.leagues ? [...prev.leagues] : [];
              while (leagues.length <= leagueIndex) {
                leagues.push({ league: "Unknown", parlay_bets: [] });
              }
              const lg = { ...leagues[leagueIndex] };
              lg.league = league || lg.league || "MLB";
              const bets = lg.parlay_bets ? [...lg.parlay_bets] : [];

              const calculatedIndividualProbability =
                calculateImpliedProbability(bet?.odds) ??
                normalizePct(bet?.probability);

              const updatedBet = {
                ...bet,
                teams: normalizeTeams(bet.teams),
                probability: calculatedIndividualProbability,
              };

              const existingBetIndex = bet.id
                ? bets.findIndex((b) => b.id === bet.id)
                : -1;

              if (existingBetIndex !== -1) {
                bets[existingBetIndex] = {
                  ...bets[existingBetIndex],
                  ...updatedBet,
                };
              } else {
                while (bets.length <= betIndex) bets.push({});
                bets[betIndex] = { ...bets[betIndex], ...updatedBet };
              }

              // NEW: mark completed if this payload includes analysis
              if (updatedBet?.analysis) {
                const key = updatedBet.id ?? `${leagueIndex}-${betIndex}`;
                setCompletedIds((prevSet) => {
                  const next = new Set(prevSet);
                  next.add(String(key));
                  return next;
                });
              }

              lg.parlay_bets = bets;
              leagues[leagueIndex] = lg;
              return { ...prev, leagues };
            });
            return;
          }

          if (type === "odds") {
            const { matchup, books_considered, best_available_odds, analysis } =
              payload;
            if (matchup) {
              setOddsResults((prev) => ({
                ...prev,
                [matchup]: {
                  books_considered: books_considered || [],
                  best_available_odds: best_available_odds || null,
                  analysis: analysis || "",
                },
              }));
            }
            return;
          }

          if (type === "final") {
            if (payload && payload.slipInfo) {
              const normalizedFinal = {
                ...payload.slipInfo,
                leagues: (payload.slipInfo.leagues || []).map((lg) => ({
                  ...lg,
                  parlay_bets: (lg.parlay_bets || []).map((b) => {
                    const teams = normalizeTeams(b.teams);
                    const prob =
                      calculateImpliedProbability(b?.odds) ??
                      normalizePct(b?.probability);
                    return { ...b, teams, probability: prob };
                  }),
                })),
              };

              // NEW: rebuild completed set from final payload to guarantee accuracy
              try {
                const finalCompleted = new Set();
                (normalizedFinal.leagues || []).forEach((lg, li) => {
                  (lg.parlay_bets || []).forEach((b, bi) => {
                    if (b?.analysis) {
                      const key = b.id ?? `${li}-${bi}`;
                      finalCompleted.add(String(key));
                    }
                  });
                });
                setCompletedIds(finalCompleted);
                if (typeof payload?.slipInfo?.total === "number") {
                  setTotalLegs(payload.slipInfo.total);
                }
              } catch {}

              const allBets = normalizedFinal.leagues.flatMap(
                (league) => league.parlay_bets || [],
              );

              setAnalysisResponse({
                ...normalizedFinal,
                parlay_probability: resolveParlayProbability(allBets, {
                  parlayOdds: payload.slipInfo?.parlay_odds,
                  parlayProbability: payload.slipInfo?.parlay_probability,
                }),
              });
            }
            streamCtrl?.markClosed();
            streamCtrl?.abort();
            return;
          }

          if (type === "error") {
            streamCtrl?.markClosed();
            streamCtrl?.abort();
            setUploading(false);
            Alert.alert("Analysis failed", payload?.message || "Unknown error");
            return;
          }
        } catch (e) {
          console.warn("[Parlay] handleEvent error:", e);
        }
      };

      streamCtrl = startSlipAnalysis({
        imageUri: image,
        userId,
        onEvent: handleEvent,
      });
    } catch (error) {
      console.error("Upload error:", error);
      setAnalysisResponse(null);
      setUploading(false);
      Alert.alert(
        "Connection Error",
        "Please check your internet and try again.",
      );
    }
  };

  const resetAnalysis = () => {
    setImage(null);
    setAnalysisResponse(null);
    setOddsResults({});
    setTotalLegs(null);
    setCompletedIds(new Set());
  };

  const renderProbabilityIndicator = (probability) => {
    if (probability === undefined || probability === null) return null;
    const pct = normalizePct(probability);
    if (pct == null) return null;

    let color = "#FF4D4F";
    let message = "High Risk";
    let gradientColors = ["#FF4D4F", "#FF7875"];
    if (pct > 30) {
      color = "#FAAD14";
      message = "Medium Risk";
      gradientColors = ["#FAAD14", "#FFC53D"];
    }
    if (pct > 60) {
      color = "#54FF00";
      message = "Good Odds";
      gradientColors = ["#54FF00", "#73FF33"];
    }

    return (
      <View style={styles.probabilityIndicator}>
        <View style={styles.probabilityHeader}>
          <Text style={[styles.probabilityValue, { color }]}>
            {pct.toFixed(1)}%
          </Text>
          <Text style={[styles.probabilityMessage, { color }]}>{message}</Text>
        </View>
        <View style={styles.indicatorBarContainer}>
          <View style={styles.indicatorBar}>
            <LinearGradient
              colors={gradientColors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[
                styles.indicatorFill,
                { width: `${Math.min(pct, 100)}%` },
              ]}
            />
          </View>
        </View>
      </View>
    );
  };

  const renderBetProbability = (probabilityIn) => {
    const pct = normalizePct(probabilityIn);
    if (pct == null) return null;

    let color = "#FF4D4F";
    let gradientColors = ["#FF4D4F", "#FF7875"];
    if (pct > 30) {
      color = "#FAAD14";
      gradientColors = ["#FAAD14", "#FFC53D"];
    }
    if (pct > 60) {
      color = "#54FF00";
      gradientColors = ["#54FF00", "#73FF33"];
    }

    return (
      <View style={styles.betProbabilityContainer}>
        <View style={styles.betProbabilityBar}>
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.betProbabilityFill, { width: `${pct}%` }]}
          />
        </View>
        <Text style={[styles.betProbabilityValue, { color }]}>
          {pct.toFixed(1)}%
        </Text>
      </View>
    );
  };

  /* ---------------- Main analysis renderer ---------------- */
  const renderParlayAnalysis = () => {
    if (!analysisResponse) return null;

    const { parlay_probability, leagues, responsible_betting_reminder } =
      analysisResponse;

    return (
      <Animated.View
        style={[
          styles.slipInfoWrapper,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <GlassCard style={styles.probabilityCard}>
          <Text style={styles.probabilityCardTitle}>Win Probability</Text>
          {parlay_probability !== null && parlay_probability !== undefined ? (
            renderProbabilityIndicator(parlay_probability)
          ) : (
            <View style={{ paddingVertical: 8, marginBottom: 10 }}>
              <ActivityIndicator color="#54FF00" />
            </View>
          )}
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={resetAnalysis}
          >
            <Ionicons name="trash-outline" size={18} color="#FF4D4F" />
            <Text style={styles.secondaryButtonText}>Remove Slip</Text>
          </TouchableOpacity>
        </GlassCard>

        <Text style={styles.sectionTitle}>Bet Details</Text>

        {leagues &&
          leagues.map((league, idx) => (
            <GlassCard key={`league-${idx}`} style={styles.leagueCard}>
              <View style={styles.leagueHeader}>
                <View style={styles.leagueIconContainer}>
                  <MaterialCommunityIcons
                    name={
                      (league.league || "").toLowerCase().includes("nba")
                        ? "basketball"
                        : (league.league || "").toLowerCase().includes("nfl")
                          ? "football"
                          : (league.league || "").toLowerCase().includes("mlb")
                            ? "baseball"
                            : "trophy"
                    }
                    size={20}
                    color="#54FF00"
                  />
                </View>
                <Text style={styles.leagueTitle}>
                  {league.league || "Loading"}
                </Text>
              </View>

              {/* Completed-only list (arrival order) */}
              {(() => {
                const allBets = Array.isArray(league.parlay_bets)
                  ? league.parlay_bets.filter(Boolean)
                  : [];
                const completed = allBets.filter((b) => b && b.analysis);

                return (
                  <>
                    {completed.map((bet, betIdx) => {
                      const teams = normalizeTeams(bet?.teams);
                      const matchup = getMatchupKey(bet);
                      const inlineOddsData = oddsResults?.[matchup];

                      return (
                        <View
                          key={
                            bet.id ||
                            `${idx}-${betIdx}-${matchup || bet.detail || "bet"}`
                          }
                          style={styles.betContainer}
                        >
                          <View style={styles.betHeader}>
                            <Text style={styles.betDetail}>
                              {bet.detail || "N/A"}
                            </Text>
                            <View style={styles.oddsTag}>
                              <Text style={styles.oddsText}>
                                {bet.odds && Number(bet.odds) > 0
                                  ? `+${bet.odds}`
                                  : (bet.odds ?? "—")}
                              </Text>
                            </View>
                          </View>

                          {!!teams.length && (
                            <View style={styles.betInfoRow}>
                              <Ionicons
                                name="people"
                                size={16}
                                color="#54FF00"
                              />
                              <Text style={styles.betInfoValue}>
                                {teams.join(" vs ")}
                              </Text>
                            </View>
                          )}

                          {bet.probability != null
                            ? renderBetProbability(bet.probability)
                            : null}

                          <GlassCard style={styles.insightsCard}>
                            <View style={styles.insightRow}>
                              <View style={styles.insightIconContainer}>
                                <Ionicons
                                  name="trending-up"
                                  size={18}
                                  color="#54FF00"
                                />
                              </View>
                              <View style={styles.insightContent}>
                                <Text style={styles.insightLabel}>
                                  Cover Rate
                                </Text>
                                <Text style={styles.insightText}>
                                  {bet.cover_analysis?.key_stat ||
                                    "No cover data available"}
                                </Text>
                              </View>
                            </View>

                            <View style={styles.insightDivider} />

                            <View style={styles.insightRow}>
                              <View style={styles.insightIconContainer}>
                                <Ionicons
                                  name="bulb"
                                  size={18}
                                  color="#54FF00"
                                />
                              </View>
                              <View style={styles.insightContent}>
                                <Text style={styles.insightLabel}>
                                  Key Insight
                                </Text>
                                <Text style={styles.insightText}>
                                  {bet.analysis?.key_stat ||
                                    "No insight available"}
                                </Text>
                              </View>
                            </View>

                            <View style={styles.insightDivider} />

                            <View style={styles.insightRow}>
                              <View style={styles.insightIconContainer}>
                                <Ionicons
                                  name="analytics"
                                  size={18}
                                  color="#54FF00"
                                />
                              </View>
                              <View style={styles.insightContent}>
                                <Text style={styles.insightLabel}>Matchup</Text>
                                <Text style={styles.insightText}>
                                  {bet.analysis?.matchup_consideration ||
                                    "No matchup info available"}
                                </Text>
                              </View>
                            </View>
                          </GlassCard>

                          <InlineOdds matchup={matchup} data={inlineOddsData} />

                          <View style={styles.betFooter}>
                            <View style={styles.betTypeTag}>
                              <Text style={styles.betTypeText}>
                                {bet.bet_type || "N/A"}
                              </Text>
                            </View>
                          </View>
                        </View>
                      );
                    })}
                  </>
                );
              })()}
            </GlassCard>
          ))}

        {/* GLOBAL pending loader: bottom of all content */}
        {(() => {
          // Prefer totalLegs from init/final; fall back to distinct slots seen.
          let total = totalLegs ?? 0;
          if (!total) {
            const slots = new Set();
            (leagues || []).forEach((lg, li) => {
              (lg.parlay_bets || []).forEach((_, bi) =>
                slots.add(`${li}-${bi}`),
              );
            });
            total = slots.size;
          }
          const pending = Math.max(0, total - completedIds.size);
          return pending > 0 ? <PendingLoader count={pending} /> : null;
        })()}

        {responsible_betting_reminder ? (
          <GlassCard style={styles.disclaimer}>
            <Ionicons name="information-circle" size={20} color="#54FF00" />
            <Text style={styles.disclaimerText}>
              {responsible_betting_reminder}
            </Text>
          </GlassCard>
        ) : null}
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      {showSplash ? (
        <SplashScreen onFinish={handleSplashFinish} />
      ) : (
        <>
          <FloatingElements />

          {/* Header */}
          <GlassCard style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.logoContainer}>
                <Image
                  source={require("../assets/Activity.png")}
                  style={styles.logoImage}
                />
              </View>
              <View>
                <Text style={styles.appTitle}>Parlay Pal</Text>
                <Text style={styles.appTagline}>AI-Powered Bet Analysis</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.profileButton}
              onPress={() => navigation?.navigate?.("Profile")}
            >
              <Ionicons name="person-circle" size={28} color="#54FF00" />
            </TouchableOpacity>
          </GlassCard>

          <ScrollView
            ref={scrollViewRef}
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {!image ? (
              <View style={styles.uploadSection}>
                <GlassCard style={styles.uploadCard}>
                  <View style={styles.uploadIconContainer}>
                    <LinearGradient
                      colors={["#54FF00", "#73FF33"]}
                      style={styles.uploadIconGradient}
                    >
                      <Ionicons
                        name="cloud-upload-outline"
                        size={32}
                        color="#101113"
                      />
                    </LinearGradient>
                  </View>
                  <Text style={styles.uploadTitle}>Upload Your Bet Slip</Text>
                  <Text style={styles.uploadDescription}>
                    Select an image of your bet slip for AI-powered analysis
                  </Text>
                  <TouchableOpacity
                    style={styles.uploadButton}
                    onPress={pickImage}
                  >
                    <LinearGradient
                      colors={["#54FF00", "#73FF33"]}
                      style={styles.uploadButtonGradient}
                    >
                      <Ionicons
                        name="images-outline"
                        size={20}
                        color="#101113"
                      />
                      <Text style={styles.uploadButtonText}>
                        Choose from Gallery
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </GlassCard>
              </View>
            ) : null}

            {image && !(analysisResponse?.leagues?.length > 0) && (
              <View style={styles.analysisSection}>
                <GlassCard style={styles.imageContainer}>
                  <Image
                    source={{ uri: image }}
                    style={styles.previewImage}
                    resizeMode="contain"
                  />
                  <View style={styles.imageOverlay}>
                    <TouchableOpacity
                      style={styles.changeImageButton}
                      onPress={pickImage}
                    >
                      <Ionicons name="camera" size={18} color="#54FF00" />
                    </TouchableOpacity>
                  </View>
                </GlassCard>

                {!analysisResponse && (
                  <>
                    <TouchableOpacity
                      style={[
                        styles.analyzeButton,
                        uploading && styles.analyzeButtonDisabled,
                      ]}
                      onPress={uploadImage}
                      disabled={uploading}
                    >
                      <LinearGradient
                        colors={
                          uploading
                            ? ["#1A181B", "#1A181B"]
                            : ["#54FF00", "#73FF33"]
                        }
                        style={styles.analyzeButtonGradient}
                      >
                        {uploading ? (
                          <View style={styles.loadingContainer}>
                            <ActivityIndicator color="#54FF00" size="small" />
                            <Text style={styles.loadingText}>
                              Analyzing slip...
                            </Text>
                          </View>
                        ) : (
                          <>
                            <MaterialCommunityIcons
                              name="lightning-bolt"
                              size={20}
                              color="#101113"
                            />
                            <Text style={styles.analyzeButtonText}>
                              Analyze Bet Slip
                            </Text>
                          </>
                        )}
                      </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.secondaryButton}
                      onPress={resetAnalysis}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={18}
                        color="#FF4D4F"
                      />
                      <Text style={styles.secondaryButtonText}>
                        Remove Slip
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            )}

            {/* Results */}
            {renderParlayAnalysis()}
          </ScrollView>

          {/* Loading Modal */}
          <Modal visible={uploading} transparent animationType="fade">
            <View style={styles.modalContainer}>
              <GlassCard style={styles.modalContent}>
                <LottieView
                  source={require("../assets/greenScanning.json")}
                  autoPlay
                  loop
                  style={styles.lottie}
                />
                <Text style={styles.modalText}>Scanning your bet slip...</Text>
                <Text style={styles.modalSubText}>
                  Analysis may take longer for parlays with more legs.
                </Text>
                <View style={styles.modalLoader}>
                  {/* <View className="loaderDots">
                    {[0, 1, 2].map((i) => (
                      <View key={i} style={styles.loaderDot} />
                    ))}
                  </View> */}
                </View>
              </GlassCard>
            </View>
          </Modal>
        </>
      )}
    </SafeAreaView>
  );
}

/* ---------------- Styles ---------------- */
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#101113" },

  floatingElements: {
    position: "absolute",
    width: "100%",
    height: "100%",
    zIndex: 0,
  },
  floatingDot: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#54FF00",
    opacity: 0.6,
  },

  glassCard: {
    backgroundColor: "rgba(26, 24, 27, 0.8)",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(84, 255, 0, 0.1)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },

  splashContainer: {
    position: "absolute",
    width,
    height,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#101113",
    zIndex: 1000,
  },
  splashLogoContainer: { alignItems: "center", justifyContent: "center" },
  splashLogoImage: { width: 80, height: 80, marginBottom: 24, zIndex: 2 },
  logoGlow: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(84, 255, 0, 0.2)",
    top: -20,
    left: -20,
    zIndex: 1,
  },
  splashAppTitle: {
    fontSize: 36,
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: 8,
    letterSpacing: 1,
    textAlign: "center",
  },
  splashAppTagline: {
    fontSize: 16,
    color: "#54FF00",
    letterSpacing: 0.5,
    textAlign: "center",
    marginBottom: 40,
  },
  splashLoader: { marginTop: 40 },
  loaderDots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  loaderDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#54FF00",
    marginHorizontal: 4,
    opacity: 0.6,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 16,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    zIndex: 10,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  logoContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(84, 255, 0, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    borderWidth: 1,
    borderColor: "rgba(84, 255, 0, 0.2)",
  },
  logoImage: { width: 24, height: 24 },
  appTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: 0.5,
  },
  appTagline: {
    fontSize: 13,
    color: "#54FF00",
    marginTop: 2,
    letterSpacing: 0.3,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(84, 255, 0, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(84, 255, 0, 0.2)",
  },

  scrollView: { flex: 1, zIndex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },

  uploadSection: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 500,
    marginTop: 40,
  },
  uploadCard: { width: "100%", padding: 40, alignItems: "center" },
  uploadIconContainer: { marginBottom: 32 },
  uploadIconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  uploadTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 16,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  uploadDescription: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  uploadButton: { width: "100%", borderRadius: 16, overflow: "hidden" },
  uploadButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 32,
  },
  uploadButtonText: {
    color: "#101113",
    fontWeight: "700",
    marginLeft: 12,
    fontSize: 16,
    letterSpacing: 0.3,
  },

  analysisSection: { marginBottom: 20 },
  imageContainer: {
    width: "100%",
    borderRadius: 20,
    overflow: "hidden",
    position: "relative",
    marginBottom: 24,
    padding: 0,
  },
  previewImage: {
    width: "100%",
    height: undefined,
    aspectRatio: 4 / 3,
    borderRadius: 20,
  },
  imageOverlay: { position: "absolute", top: 16, right: 16 },
  changeImageButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(26, 24, 27, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(84, 255, 0, 0.3)",
  },

  analyzeButton: { borderRadius: 16, overflow: "hidden", marginBottom: 16 },
  analyzeButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 32,
  },
  analyzeButtonDisabled: { opacity: 0.6 },
  analyzeButtonText: {
    color: "#101113",
    fontSize: 17,
    fontWeight: "700",
    marginLeft: 10,
    letterSpacing: 0.3,
  },
  loadingContainer: { flexDirection: "row", alignItems: "center" },
  loadingText: {
    color: "#54FF00",
    marginLeft: 12,
    fontWeight: "600",
    fontSize: 16,
  },

  secondaryButton: {
    backgroundColor: "rgba(26, 24, 27, 0.8)",
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 77, 79, 0.3)",
  },
  secondaryButtonText: {
    color: "#FF4D4F",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.3,
  },

  slipInfoWrapper: { marginTop: 32, width: "100%" },
  probabilityCard: { padding: 24, marginBottom: 24, bottom: 15 },
  probabilityCardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 20,
    textAlign: "center",
    letterSpacing: 0.5,
  },

  probabilityIndicator: { width: "100%", marginBottom: 24 },
  probabilityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  probabilityValue: {
    fontSize: 32,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: 0.5,
  },
  probabilityMessage: { fontSize: 16, fontWeight: "600", letterSpacing: 0.3 },
  indicatorBarContainer: { width: "100%" },
  indicatorBar: {
    height: 12,
    borderRadius: 6,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    overflow: "hidden",
  },
  indicatorFill: { height: "100%", borderRadius: 6 },

  sectionTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 20,
    letterSpacing: 0.5,
  },

  leagueCard: { marginBottom: 20, padding: 0, overflow: "hidden" },
  leagueHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(84, 255, 0, 0.1)",
    backgroundColor: "rgba(16, 17, 19, 0.6)",
  },
  leagueIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(84, 255, 0, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "rgba(84, 255, 0, 0.2)",
  },
  leagueTitle: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 16,
    letterSpacing: 0.3,
  },

  betContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  betHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  betDetail: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
    flex: 1,
    marginRight: 12,
    letterSpacing: 0.3,
  },

  betInfoRow: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  betInfoValue: {
    fontSize: 15,
    color: "rgba(255, 255, 255, 0.8)",
    marginLeft: 8,
    fontWeight: "500",
  },

  oddsTag: {
    backgroundColor: "rgba(84, 255, 0, 0.1)",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(84, 255, 0, 0.3)",
  },
  oddsText: {
    color: "#54FF00",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  betProbabilityContainer: { marginVertical: 16, width: "100%" },
  betProbabilityBar: {
    height: 10,
    borderRadius: 5,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    overflow: "hidden",
    marginBottom: 8,
  },
  betProbabilityFill: { height: "100%", borderRadius: 5 },
  betProbabilityValue: {
    fontSize: 13,
    fontWeight: "600",
    alignSelf: "flex-end",
    letterSpacing: 0.3,
  },

  insightsCard: {
    marginTop: 16,
    padding: 16,
    backgroundColor: "rgba(16, 17, 19, 0.6)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(84, 255, 0, 0.1)",
  },
  insightRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  insightIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(84, 255, 0, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  insightContent: { flex: 1 },
  insightLabel: {
    fontWeight: "700",
    fontSize: 14,
    color: "#54FF00",
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  insightText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
  },
  insightDivider: {
    height: 1,
    backgroundColor: "rgba(84, 255, 0, 0.1)",
    marginVertical: 12,
    borderRadius: 1,
  },

  betFooter: { flexDirection: "row", marginTop: 16 },
  betTypeTag: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  betTypeText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 13,
    fontWeight: "500",
    letterSpacing: 0.3,
  },

  disclaimer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
    padding: 16,
  },
  disclaimerText: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 13,
    marginLeft: 12,
    lineHeight: 18,
    flex: 1,
  },

  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(16, 17, 19, 0.95)",
  },
  modalContent: { alignItems: "center", padding: 40, margin: 20 },
  lottie: { width: 200, height: 200 },
  modalText: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "700",
    marginTop: 20,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  modalSubText: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
    lineHeight: 20,
  },
  modalLoader: { marginTop: 24 },

  oddsComparisonContainer: { marginTop: 32, width: "100%" },
  oddsCard: {
    marginBottom: 20,
    padding: 20,
    backgroundColor: "rgba(16, 17, 19, 0.6)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(84, 255, 0, 0.1)",
  },
  oddsMatchupTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  booksConsideredContainer: { marginBottom: 16 },
  booksConsideredTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  bookOddRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  bookName: {
    fontSize: 15,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
    letterSpacing: 0.3,
  },
  bookOdds: {
    fontSize: 15,
    fontWeight: "700",
    color: "#54FF00",
    letterSpacing: 0.3,
  },
  bookImpliedProb: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.6)",
    letterSpacing: 0.3,
  },
  bestOddsContainer: { marginBottom: 16 },
  bestOddsLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  bestBookName: {
    fontSize: 15,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  bestBookOdds: {
    fontSize: 15,
    fontWeight: "700",
    color: "#54FF00",
    letterSpacing: 0.3,
  },
  bestBookImpliedProb: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.6)",
    letterSpacing: 0.3,
  },
});
