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
import { supabase } from "../Services/supabase";

// Replace 'your_public_sdk_key' with your RevenueCat public API key.
Purchases.configure({ apiKey: "appl_uPPCiaHpkTLNkrlhOikrUMWLaBH" });

const { width, height } = Dimensions.get("window");

// Update this to your actual backend URL
const API_URL = "https://parlaypal.onrender.com";

// Inline Splash Screen Component
const SplashScreen = ({ onFinish }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Hide splash after 2.5s
    const timer = setTimeout(() => {
      // Fade out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 100,
        delay: 100,
        useNativeDriver: true,
      }).start(() => {
        if (onFinish) onFinish();
      });
    }, 2500);

    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim, onFinish]);

  return (
    <Animated.View
      style={[
        styles.splashContainer,
        {
          opacity: fadeAnim,
        },
      ]}
    >
      <Animated.View
        style={[
          styles.splashLogoContainer,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Image
          source={require("../assets/Activity.png")}
          style={styles.splashLogoImage}
        />
        {/* Glow effect around logo */}
        <Animated.View
          style={[
            styles.logoGlow,
            {
              opacity: fadeAnim.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0.5, 0.8, 0.5],
              }),
              transform: [
                {
                  scale: fadeAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [1, 1.1, 1],
                  }),
                },
              ],
            },
          ]}
        />
        <Text style={styles.splashAppTitle}>Parlay Pal</Text>
        <Text style={styles.splashAppTagline}>AI-Powered Bet Analysis</Text>
      </Animated.View>
    </Animated.View>
  );
};

export default function Home({ navigation }) {
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  // Unified state for all parlay data
  const [analysisResponse, setAnalysisResponse] = useState(null);

  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [products, setProducts] = useState([]);
  const [showSplash, setShowSplash] = useState(true);
  const scrollViewRef = useRef(null);

  // Animation values for the analysis panel
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  // Handle splash screen finish
  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  // Fetch products from RevenueCat when component mounts
  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      try {
        const customerInfo = await Purchases.getCustomerInfo();
        const userId = customerInfo.originalAppUserId;

        // Check for active subscriptions
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

        // Fetch available products
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
  }, []);

  // Trigger animation when analysisResponse updates
  useEffect(() => {
    if (analysisResponse) {
      fadeAnim.setValue(0);
      slideAnim.setValue(20);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [analysisResponse]);

  // Image picker
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Parlay Pal needs access to your photo library to upload a bet slip."
      );
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      aspect: [4, 3],
      quality: 0.6,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      // Reset analysis
      setAnalysisResponse(null);
    }
  };

  // Function to strip triple backticks, etc.
  function stripMarkdownCodeFence(str = "") {
    let cleaned = str.trim();

    if (cleaned.startsWith("```json")) {
      cleaned = cleaned.replace(/^```json/, "");
    } else if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```/, "");
    }

    if (cleaned.endsWith("```")) {
      cleaned = cleaned.substring(0, cleaned.lastIndexOf("```"));
    }

    return cleaned.trim();
  }

  // Upload image & parse final JSON
  const uploadImage = async () => {
    const customerInfo = await Purchases.getCustomerInfo();
    const userId = customerInfo.originalAppUserId;

    if (!image) {
      Alert.alert("Please select an image first");
      return;
    }

    // Navigate to the Showcase screen if user is not subscribed
    if (!isSubscribed) {
      navigation.navigate("Offer");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      const uriParts = image.split(".");
      const fileType = uriParts[uriParts.length - 1];

      formData.append("image", {
        uri: image,
        name: `photo.${fileType}`,
        type: `image/${fileType}`,
      });

      formData.append("userId", userId);

      const response = await fetch(`${API_URL}/analyzeCover`, {
        method: "POST",
        body: formData,
      });

      const responseData = await response.json();

      // console.log("responseData", responseData);

      if (response.ok) {
        // Instead of storing slipInfo and advancedAnalysis separately,
        // let's merge them into one final object for the UI.
        let mergedData = {};

        // If slipInfo exists, parse or store it:
        if (responseData.slipInfo) {
          if (
            typeof responseData.slipInfo === "string" &&
            responseData.slipInfo.trim().startsWith("{")
          ) {
            try {
              mergedData = JSON.parse(responseData.slipInfo);
            } catch (error) {
              console.error("JSON parsing error for slipInfo:", error);
              mergedData = {
                rawData: responseData.slipInfo,
                _note: "Could not parse JSON data",
              };
            }
          } else if (typeof responseData.slipInfo === "object") {
            mergedData = responseData.slipInfo;
          }
        }

        // Process advancedAnalysis
        let parsedAnalysis = responseData.advancedAnalysis;
        if (typeof parsedAnalysis === "string") {
          const cleanedString = stripMarkdownCodeFence(parsedAnalysis);
          try {
            parsedAnalysis = JSON.parse(cleanedString);
          } catch (error) {
            console.error("Error parsing advancedAnalysis:", error);
            parsedAnalysis = {};
          }
        } else if (typeof parsedAnalysis !== "object") {
          parsedAnalysis = {};
        }

        // Merge slipInfo and advancedAnalysis together
        mergedData = { ...mergedData, ...parsedAnalysis };

        console.log("mergedData", mergedData);

        // Now we have one unified object
        setAnalysisResponse(mergedData);

        // Scroll to top
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      } else {
        Alert.alert(
          "Analysis Failed",
          "Unable to process this bet slip. Please try a clearer image."
        );
        console.error("Upload failed", responseData);
        setAnalysisResponse(null);
      }
    } catch (error) {
      Alert.alert(
        "Connection Error",
        "Please check your internet connection and try again."
      );
      console.error("Upload error:", error);
      setAnalysisResponse(null);
    } finally {
      setUploading(false);
    }
  };

  // Clear everything
  const resetAnalysis = () => {
    setImage(null);
    setAnalysisResponse(null);
  };

  // Probability bar for entire parlay
  const renderProbabilityIndicator = (probability) => {
    if (probability === undefined || probability === null) return null;

    let color = "#FF4D4F"; // Red
    let message = "High Risk";

    if (probability > 30) {
      color = "#FAAD14"; // Orange
      message = "Medium Risk";
    }
    if (probability > 60) {
      color = "#52C41A"; // Green
      message = "Lower Risk";
    }

    return (
      <View style={styles.probabilityIndicator}>
        <View style={[styles.indicatorBar, { backgroundColor: "#1C1C1E" }]}>
          <View
            style={[
              styles.indicatorFill,
              {
                width: `${Math.min(probability, 100)}%`,
                backgroundColor: color,
              },
            ]}
          />
        </View>
        <View style={styles.indicatorLabels}>
          <Text style={styles.indicatorValue}>{probability.toFixed(2)}%</Text>
          <Text style={[styles.indicatorText, { color }]}>{message}</Text>
        </View>
      </View>
    );
  };

  // Probability bar for individual bets
  const renderBetProbability = (probability) => {
    if (probability === undefined || probability === null) return null;

    let color = "#FF4D4F";
    if (probability > 30) color = "#FAAD14";
    if (probability > 60) color = "#52C41A";

    return (
      <View style={styles.betProbabilityContainer}>
        <View
          style={[styles.betProbabilityBar, { backgroundColor: "#1C1C1E" }]}
        >
          <View
            style={[
              styles.betProbabilityFill,
              {
                width: `${Math.min(probability, 100)}%`,
                backgroundColor: color,
              },
            ]}
          />
        </View>
        <Text style={[styles.betProbabilityValue, { color }]}>
          {probability.toFixed(1)}%
        </Text>
      </View>
    );
  };

  // Render the unified parlay analysis
  const renderParlayAnalysis = () => {
    if (!analysisResponse) return null;

    // Destructure fields from analysisResponse
    const {
      stake,
      parlay_odds,
      parlay_probability,
      parlay_summary,
      leagues,
      responsible_betting_reminder,
    } = analysisResponse;

    return (
      <Animated.View
        style={[
          styles.slipInfoWrapper,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Header */}
        <View style={styles.slipInfoHeader}>
          <Text style={styles.slipInfoTitle}>Bet Analysis</Text>
          <TouchableOpacity
            style={styles.newAnalysisButton}
            onPress={resetAnalysis}
          >
            <Text style={styles.newAnalysisText}>New Analysis</Text>
          </TouchableOpacity>
        </View>

        {/* Summary Card with stake, odds, probability */}
        <View style={styles.summaryCard}>
          <View style={styles.probabilitySection}>
            <Text style={styles.probabilityLabel}>Win Probability</Text>
            {renderProbabilityIndicator(parlay_probability)}

            <TouchableOpacity
              style={styles.clearButton}
              onPress={resetAnalysis}
            >
              <Text style={styles.clearButtonText}>Remove Slip</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* AI Insight Card */}
        {/* <View style={styles.insightCard}>
          <View style={styles.insightHeader}>
            <MaterialCommunityIcons name="robot" size={20} color="#7789FF" />
            <Text style={styles.insightTitle}>AI Insight</Text>
          </View>

          {parlay_summary?.expected_outcome && (
            <Text style={styles.insightText}>
              {parlay_summary.expected_outcome}
            </Text>
          )}
          {parlay_summary?.risk_assessment && (
            <Text style={styles.insightText}>
              {parlay_summary.risk_assessment}
            </Text>
          )}
          {parlay_summary?.alternative_suggestions?.map((item, idx) => (
            <Text style={styles.insightText} key={`alt-${idx}`}>
              - {item}
            </Text>
          ))}
        </View> */}

        {/* Bet Details (Leagues, Bets) */}
        <Text style={styles.sectionTitle}>Bet Details</Text>
        {leagues &&
          leagues.map((league, idx) => (
            <View key={`league-${idx}`} style={styles.leagueContainer}>
              <View style={styles.leagueHeader}>
                <MaterialCommunityIcons
                  name={
                    league.league?.toLowerCase().includes("nba")
                      ? "basketball"
                      : league.league?.toLowerCase().includes("nfl")
                      ? "football"
                      : league.league?.toLowerCase().includes("mlb")
                      ? "baseball"
                      : "trophy"
                  }
                  size={18}
                  color="white"
                />
                <Text style={styles.leagueTitle}>{league.league}</Text>
              </View>

              {league.parlay_bets &&
                league.parlay_bets.map((bet, betIdx) => {
                  // Debug: log each bet object
                  console.log("Rendering parlay_bet:", bet);
                  return (
                    <View key={`bet-${betIdx}`} style={styles.betContainer}>
                      {/* Bet Header: detail & odds */}
                      <View style={styles.betHeader}>
                        <Text style={styles.betDetail}>
                          {bet.detail || "N/A"}
                        </Text>
                        <View style={styles.oddsTag}>
                          <Text style={styles.oddsText}>
                            {bet.odds && bet.odds > 0
                              ? `+${bet.odds}`
                              : bet.odds}
                          </Text>
                        </View>
                      </View>

                      {/* Bet Info Row (Teams, etc.) */}
                      {bet.teams && (
                        <View style={styles.betInfoRow}>
                          <Text style={styles.betInfoKey}>Teams:</Text>
                          <Text style={styles.betInfoValue}>
                            {bet.teams.join(" vs ")}
                          </Text>
                        </View>
                      )}

                      {/* Probability bar for this bet */}
                      {bet.probability !== undefined &&
                        renderBetProbability(bet.probability)}

                      {/* Modern Insights Card */}
                      <View style={styles.insightsCard}>
                        {/* Cover Rate */}
                        <View style={styles.insightRow}>
                          <Ionicons
                            name="trending-up"
                            size={20}
                            color="white"
                            style={styles.insightIcon}
                          />
                          <View style={{ flex: 1 }}>
                            <Text
                              style={[styles.insightTitle, { color: "white" }]}
                            >
                              Cover Rate:
                            </Text>
                            <Text style={styles.insightText}>
                              {bet.cover_analysis && bet.cover_analysis.key_stat
                                ? bet.cover_analysis.key_stat
                                : "No cover data"}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.insightDivider} />
                        {/* Interesting Insight */}
                        <View style={styles.insightRow}>
                          <Ionicons
                            name="sparkles-outline"
                            size={20}
                            color="white"
                            style={styles.insightIcon}
                          />
                          <View style={{ flex: 1 }}>
                            <Text
                              style={[styles.insightTitle, { color: "white" }]}
                            >
                              Interesting Insight:
                            </Text>
                            <Text style={styles.insightText}>
                              {bet.analysis && bet.analysis.key_stat
                                ? bet.analysis.key_stat
                                : "No insight"}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.insightDivider} />
                        {/* Matchup Insight */}
                        <View style={styles.insightRow}>
                          <Ionicons
                            name="people-outline"
                            size={20}
                            color="white"
                            style={styles.insightIcon}
                          />
                          <View style={{ flex: 1 }}>
                            <Text
                              style={[styles.insightTitle, { color: "white" }]}
                            >
                              Matchup Insight:
                            </Text>
                            <Text style={styles.insightText}>
                              {bet.analysis &&
                              bet.analysis.matchup_consideration
                                ? bet.analysis.matchup_consideration
                                : "No matchup info"}
                            </Text>
                          </View>
                        </View>
                      </View>

                      {/* Footer (Bet Type, etc.) */}
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
            </View>
          ))}

        {/* Responsible Betting Reminder */}
        {responsible_betting_reminder && (
          <View style={styles.disclaimer}>
            <Text style={styles.disclaimerText}>
              {responsible_betting_reminder}
            </Text>
          </View>
        )}
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
          <View style={styles.header}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Image
                source={require("../assets/Activity.png")}
                style={{ width: 30, height: 30, marginRight: 15 }}
              />
              <View>
                <Text style={styles.appTitle}>Parlay Pal</Text>
                <Text style={styles.appTagline}>AI-Powered Bet Analysis</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.profileButton}
              onPress={() => navigation.navigate("Profile")}
            >
              <Ionicons name="person-circle" size={32} color="#F4F4F4" />
            </TouchableOpacity>
          </View>

          <ScrollView
            ref={scrollViewRef}
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {!image ? (
              // If no image yet, show upload card
              <View style={styles.uploadSection}>
                <View style={styles.uploadCard}>
                  <View style={styles.uploadIconContainer}>
                    <Ionicons
                      name="cloud-upload-outline"
                      size={50}
                      color="white"
                    />
                  </View>
                  <Text style={styles.uploadTitle}>Upload Your Bet Slip</Text>
                  <Text style={styles.uploadDescription}>
                    Select an image of your bet slip for AI analysis
                  </Text>

                  <View style={styles.uploadButtons}>
                    <TouchableOpacity
                      style={[styles.uploadButton, styles.galleryButton]}
                      onPress={pickImage}
                    >
                      <Ionicons name="images-outline" size={24} color="#fff" />
                      <Text style={styles.uploadButtonText}>Gallery</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ) : null}

            {/* If image is chosen and there are NO bet details, show preview and analyze/clear buttons */}
            {image && !(analysisResponse?.leagues?.length > 0) && (
              <View style={styles.analysisSection}>
                <View style={styles.imageContainer}>
                  <Image
                    source={{ uri: image }}
                    style={styles.previewImage}
                    resizeMode="contain"
                  />
                </View>

                {/* Only show "Analyze" if we haven't gotten analysisResponse yet */}
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
                      {uploading ? (
                        <View style={styles.loadingContainer}>
                          <ActivityIndicator color="#ffffff" size="small" />
                          <Text style={styles.loadingText}>
                            Analyzing slip...{"\n"}
                            <Text style={styles.loadingSubText}>
                              More legs = longer processing time
                            </Text>
                          </Text>
                        </View>
                      ) : (
                        <>
                          <MaterialCommunityIcons
                            name="lightning-bolt"
                            size={22}
                            color="#30E88D"
                          />
                          <Text style={styles.buttonText}>
                            Analyze Bet Slip
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                    {/* Clear button under Analyze Bet Slip button */}
                    <TouchableOpacity
                      style={styles.clearButton}
                      onPress={resetAnalysis}
                    >
                      <Text style={styles.clearButtonText}>Remove Slip</Text>
                    </TouchableOpacity>
                  </>
                )}
                {/* Clear button removed from here */}
              </View>
            )}

            {/* Render the unified analysis data */}
            {renderParlayAnalysis()}
          </ScrollView>

          {/* Uploading Modal */}
          <Modal visible={uploading} transparent animationType="slide">
            <View style={styles.modalContainer}>
              <LottieView
                source={require("../assets/scanning.json")}
                autoPlay
                loop
                style={styles.lottie}
              />
              <Text style={styles.modalText}>Scanning your bet slip...</Text>
              <Text style={styles.modalDisclaimerText}>
                Analysis may take longer for parlays with more legs.
              </Text>
            </View>
          </Modal>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0A0A0A",
  },
  // Splash Screen Styles
  splashContainer: {
    position: "absolute",
    width: width,
    height: height,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0A0A0A",
    zIndex: 1000,
  },
  splashLogoContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  splashLogoImage: {
    width: 80,
    height: 80,
    marginBottom: 20,
  },
  logoGlow: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(48, 232, 141, 0.10)",
    top: -10,
    left: -10,
  },
  splashAppTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
    fontFamily: "Inter, System",
    letterSpacing: 0.5,
  },
  splashAppTagline: {
    fontSize: 16,
    color: "#30E88D",
    fontFamily: "Inter, System",
    letterSpacing: 0.2,
  },
  // Main App Styles
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.04)",
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#18181B",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  appTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    fontFamily: "Inter, System",
    letterSpacing: 0.5,
  },
  appTagline: {
    fontSize: 13,
    color: "#30E88D",
    marginTop: 2,
    fontFamily: "Inter, System",
    letterSpacing: 0.2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  uploadSection: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 400,
  },
  uploadCard: {
    width: "100%",
    borderRadius: 24,
    padding: 36,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#18181B",
    backgroundColor: "#18181B",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  uploadIconContainer: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: "#101113",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 22,
  },
  uploadTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 12,
    fontFamily: "Inter, System",
    letterSpacing: 0.5,
  },
  uploadDescription: {
    fontSize: 15,
    color: "#8A94B0",
    textAlign: "center",
    marginBottom: 32,
    fontFamily: "Inter, System",
    letterSpacing: 0.1,
  },
  uploadButtons: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
    borderRadius: 14,
    flex: 1,
    backgroundColor: "#18181B",
    marginHorizontal: 4,
  },
  uploadButtonText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 10,
    fontFamily: "Inter, System",
    fontSize: 16,
  },
  galleryButton: {
    backgroundColor: "#101113",
    marginLeft: 8,
  },
  analysisSection: {
    marginBottom: 20,
  },
  imageContainer: {
    width: "100%",
    borderRadius: 18,
    overflow: "hidden",
    position: "relative",
    marginBottom: 18,
    backgroundColor: "#18181B",
    borderWidth: 1,
    borderColor: "#232323",
  },
  previewImage: {
    width: "100%",
    height: undefined,
    aspectRatio: 4 / 3,
    borderRadius: 18,
  },
  changeImageButton: {
    position: "absolute",
    bottom: 12,
    right: 12,
    backgroundColor: "rgba(0,0,0,0.6)",
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  analyzeButton: {
    backgroundColor: "black",
    padding: 18,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    width: "100%",
    marginBottom: 12,
    shadowColor: "#30E88D",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  analyzeButtonDisabled: {
    backgroundColor: "#1A1A1A",
  },
  buttonText: {
    color: "#30E88D",
    fontSize: 17,
    fontWeight: "bold",
    marginLeft: 10,
    fontFamily: "Inter, System",
    letterSpacing: 0.2,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  loadingText: {
    color: "#fff",
    marginLeft: 10,
    fontWeight: "600",
    fontFamily: "Inter, System",
  },
  loadingSubText: {
    fontSize: 13,
    color: "#8A94B0",
    marginTop: 4,
    fontFamily: "Inter, System",
  },
  clearButton: {
    backgroundColor: "#101113",
    padding: 14,
    borderRadius: 14,
    marginTop: 15,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#232323",
    shadowColor: "red",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  clearButtonText: {
    color: "red",
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "Inter, System",
    letterSpacing: 0.2,
  },
  slipInfoWrapper: {
    marginTop: 28,
    width: "100%",
  },
  slipInfoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
    bottom: 15,
  },
  slipInfoTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    fontFamily: "Inter, System",
    letterSpacing: 0.5,
  },
  newAnalysisButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 22,
    backgroundColor: "#18181B",
    borderWidth: 1,
    borderColor: "#232323",
  },
  newAnalysisText: {
    color: "#30E88D",
    fontSize: 13,
    fontWeight: "600",
    fontFamily: "Inter, System",
    letterSpacing: 0.2,
  },
  summaryCard: {
    backgroundColor: "#18181B",
    borderRadius: 20,
    padding: 22,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    borderWidth: 1,
    borderColor: "#232323",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 22,
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
  },
  summaryDivider: {
    width: 1,
    backgroundColor: "rgba(255,255,255,0.07)",
  },
  summaryLabel: {
    fontSize: 13,
    color: "#8A94B0",
    marginBottom: 10,
    fontFamily: "Inter, System",
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    fontFamily: "Inter, System",
  },
  probabilitySection: {
    borderTopColor: "rgba(255,255,255,0.04)",
    paddingTop: 18,
  },
  probabilityLabel: {
    fontSize: 20,
    fontWeight: "700",
    bottom: 20,
    color: "white",
    marginBottom: 14,
    fontFamily: "Inter, System",
  },
  probabilityIndicator: {
    width: "100%",
    marginBottom: 8,
  },
  indicatorBar: {
    height: 10,
    borderRadius: 5,
    overflow: "hidden",
    marginBottom: 10,
    backgroundColor: "#232323",
  },
  indicatorFill: {
    height: "100%",
    borderRadius: 5,
  },
  indicatorLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  indicatorValue: {
    color: "#fff",
    fontWeight: "bold",
    fontFamily: "Inter, System",
  },
  indicatorText: {
    fontWeight: "600",
    fontFamily: "Inter, System",
  },
  insightCard: {
    backgroundColor: "rgba(79, 99, 232, 0.1)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: "#4F63E8",
  },
  insightHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#7789FF",
    marginLeft: 8,
  },
  insightText: {
    fontSize: 14,
    color: "#B0B7C8",
    lineHeight: 20,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 18,
    fontFamily: "Inter, System",
    letterSpacing: 0.3,
  },
  leagueContainer: {
    marginBottom: 18,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#18181B",
    borderWidth: 1,
    borderColor: "#232323",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  leagueHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.04)",
    backgroundColor: "#101113",
  },
  leagueTitle: {
    color: "#fff",
    fontWeight: "500",
    marginLeft: 10,
    fontFamily: "Inter, System",
    fontSize: 16,
  },
  betContainer: {
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.04)",
  },
  betHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  betDetail: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#fff",
    flex: 1,
    marginRight: 12,
    fontFamily: "Inter, System",
  },
  betInfoRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  betInfoKey: {
    fontSize: 15,
    color: "#8A94B0",
    width: 60,
    fontFamily: "Inter, System",
  },
  betInfoValue: {
    fontSize: 15,
    color: "#fff",
    flex: 1,
    fontWeight: "500",
    fontFamily: "Inter, System",
  },
  betFooter: {
    flexDirection: "row",
    marginTop: 12,
  },
  betTypeTag: {
    backgroundColor: "#232323",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 18,
    marginRight: 12,
  },
  betTypeText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "500",
    fontFamily: "Inter, System",
  },
  oddsTag: {
    backgroundColor: "#232323",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 18,
  },
  oddsText: {
    color: "#30E88D",
    fontSize: 15,
    fontWeight: "700",
    fontFamily: "Inter, System",
  },
  betProbabilityContainer: {
    marginVertical: 14,
    width: "100%",
  },
  betProbabilityBar: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 6,
    backgroundColor: "#232323",
  },
  betProbabilityFill: {
    height: "100%",
    borderRadius: 4,
  },
  betProbabilityValue: {
    fontSize: 13,
    fontWeight: "600",
    alignSelf: "flex-end",
    color: "#30E88D",
    fontFamily: "Inter, System",
  },
  disclaimer: {
    marginTop: 22,
    marginBottom: 34,
  },
  disclaimerText: {
    color: "#8A94B0",
    fontSize: 13,
    textAlign: "center",
    fontFamily: "Inter, System",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(10,10,10,0.92)",
  },
  lottie: {
    width: 320,
    height: 320,
  },
  modalText: {
    color: "#fff",
    fontSize: 20,
    marginTop: 12,
    fontWeight: "800",
    fontFamily: "Inter, System",
  },
  modalDisclaimerText: {
    color: "#8A94B0",
    fontSize: 15,
    marginTop: 12,
    textAlign: "center",
    marginHorizontal: 24,
    fontFamily: "Inter, System",
  },
  betAnalysisContainer: {
    backgroundColor: "#101113",
    padding: 12,
    borderRadius: 10,
    marginTop: 6,
    marginBottom: 6,
  },
  analysisHeader: {
    fontSize: 19,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 10,
    fontFamily: "Inter, System",
  },
  analysisText: {
    fontSize: 15,
    color: "#8A94B0",
    marginBottom: 6,
    fontFamily: "Inter, System",
  },
  label: {
    fontSize: 15,
    color: "#fff",
    marginBottom: 14,
    backgroundColor: "#101113",
    borderRadius: 8,
    padding: 12,
    fontFamily: "Inter, System",
    fontWeight: "400",
  },
  insightsCard: {
    backgroundColor: "",
    borderRadius: 18,
    padding: 18,
    marginTop: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    borderWidth: 1,
    borderColor: "#232323",
  },
  insightRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  insightIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  insightTitle: {
    fontWeight: "700",
    fontSize: 14,
    marginBottom: 2,
    fontFamily: "Inter, System",
    letterSpacing: 0.2,
  },
  insightText: {
    color: "#fff",
    fontSize: 15,
    fontFamily: "Inter, System",
    fontWeight: "500",
    marginBottom: 2,
  },
  insightDivider: {
    height: 1,
    backgroundColor: "#232323",
    marginVertical: 8,
    borderRadius: 1,
  },
});
