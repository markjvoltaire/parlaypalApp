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
        console.log("Customer Info:", customerInfo.entitlements);

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
    if (!image) {
      Alert.alert("Please select an image first");
      return;
    }

    console.log("API_URL :>> ", API_URL);

    // Navigate to the Showcase screen if user is not subscribed
    if (!isSubscribed) {
      navigation.navigate("Showcase");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      const uriParts = image.split(".");
      const fileType = uriParts[uriParts.length - 1];
      const customerInfo = await Purchases.getCustomerInfo();

      formData.append("image", {
        uri: image,
        name: `photo.${fileType}`,
        type: `image/${fileType}`,
      });

      formData.append("userId", customerInfo);

      const response = await fetch(`${API_URL}/analyze`, {
        method: "POST",
        body: formData,
      });

      const responseData = await response.json();

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
        <View style={[styles.indicatorBar, { backgroundColor: "#2A3350" }]}>
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
          style={[styles.betProbabilityBar, { backgroundColor: "#2A3350" }]}
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
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Parlay Odds</Text>
              <Text style={styles.summaryValue}>
                {parlay_odds ? `+${parlay_odds}` : "N/A"}
              </Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Stake</Text>
              <Text style={styles.summaryValue}>
                {stake ? `$${stake}` : "N/A"}
              </Text>
            </View>
          </View>

          <View style={styles.probabilitySection}>
            <Text style={styles.probabilityLabel}>Win Probability</Text>
            {renderProbabilityIndicator(parlay_probability)}
          </View>
        </View>

        {/* AI Insight Card */}
        <View style={styles.insightCard}>
          <View style={styles.insightHeader}>
            <MaterialCommunityIcons name="robot" size={20} color="#7789FF" />
            <Text style={styles.insightTitle}>AI Insight</Text>
          </View>

          {/* Show parlay_summary if available */}
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
        </View>

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
                  color="#7789FF"
                />
                <Text style={styles.leagueTitle}>{league.league}</Text>
              </View>

              {league.parlay_bets &&
                league.parlay_bets.map((bet, betIdx) => (
                  <View key={`bet-${betIdx}`} style={styles.betContainer}>
                    {/* Bet Header: detail & odds */}
                    <View style={styles.betHeader}>
                      <Text style={styles.betDetail}>
                        {bet.detail || "N/A"}
                      </Text>
                      <View style={styles.oddsTag}>
                        <Text style={styles.oddsText}>
                          {bet.odds && bet.odds > 0 ? `+${bet.odds}` : bet.odds}
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

                    {/* NEW: Analysis section below probability */}
                    {bet.analysis && (
                      <View style={styles.betAnalysisContainer}>
                        <Text style={styles.analysisHeader}>Analysis</Text>

                        {/* Key Stat */}
                        <Text style={styles.analysisText}>
                          <Text style={styles.label}>Key Stat: </Text>
                          {bet.analysis.key_stat}
                        </Text>

                        {/* Matchup Consideration */}
                        <Text style={styles.analysisText}>
                          <Text style={styles.label}>Matchup: </Text>
                          {bet.analysis.matchup_consideration}
                        </Text>

                        {/* Confidence Level */}
                        <Text style={styles.analysisText}>
                          <Text style={styles.label}>Confidence: </Text>
                          {bet.analysis.confidence_level}
                        </Text>
                      </View>
                    )}

                    {/* Footer (Bet Type, etc.) */}
                    <View style={styles.betFooter}>
                      <View style={styles.betTypeTag}>
                        <Text style={styles.betTypeText}>
                          {bet.bet_type || "N/A"}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
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
              <Ionicons name="person-circle" size={32} color="#7789FF" />
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
                      color="#7789FF"
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
            ) : (
              // If image is chosen, show preview and analyze button
              <View style={styles.analysisSection}>
                <View style={styles.imageContainer}>
                  <Image
                    source={{ uri: image }}
                    style={styles.previewImage}
                    resizeMode="contain"
                  />
                  <TouchableOpacity
                    style={styles.changeImageButton}
                    onPress={pickImage}
                  >
                    <Ionicons name="camera-outline" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>

                {/* Only show "Analyze" if we haven't gotten analysisResponse yet */}
                {!analysisResponse && (
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
                          Analyzing slip...
                        </Text>
                      </View>
                    ) : (
                      <>
                        <MaterialCommunityIcons
                          name="lightning-bolt"
                          size={22}
                          color="#fff"
                        />
                        <Text style={styles.buttonText}>Analyze Bet Slip</Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={resetAnalysis}
                >
                  <Text style={styles.clearButtonText}>Clear</Text>
                </TouchableOpacity>
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
    backgroundColor: "#111427",
  },
  // Splash Screen Styles
  splashContainer: {
    position: "absolute",
    width: width,
    height: height,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#101426",
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
    backgroundColor: "rgba(119, 137, 255, 0.15)",
    top: -10,
    left: -10,
  },
  splashAppTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 8,
  },
  splashAppTagline: {
    fontSize: 16,
    color: "#7789FF",
  },
  // Main App Styles
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  appTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#ffffff",
  },
  appTagline: {
    fontSize: 12,
    color: "#7789FF",
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  uploadSection: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 400,
  },
  uploadCard: {
    width: "100%",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(79, 99, 232, 0.3)",
    backgroundColor: "rgba(79, 99, 232, 0.05)",
  },
  uploadIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(79, 99, 232, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  uploadTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 10,
  },
  uploadDescription: {
    fontSize: 14,
    color: "#8A94B0",
    textAlign: "center",
    marginBottom: 30,
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
    padding: 16,
    borderRadius: 12,
    flex: 1,
  },
  uploadButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    marginLeft: 8,
  },
  galleryButton: {
    backgroundColor: "#2C3254",
    marginLeft: 8,
  },
  analysisSection: {
    marginBottom: 16,
  },
  imageContainer: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
    marginBottom: 16,
  },
  previewImage: {
    width: "100%",
    height: undefined,
    aspectRatio: 4 / 3,
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
    backgroundColor: "#4F63E8",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    width: "100%",
  },
  analyzeButtonDisabled: {
    backgroundColor: "rgba(79, 99, 232, 0.5)",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  loadingText: {
    color: "#ffffff",
    marginLeft: 8,
    fontWeight: "600",
  },
  clearButton: {
    backgroundColor: "#FF4D4F",
    padding: 12,
    borderRadius: 12,
    marginTop: 10,
    alignItems: "center",
  },
  clearButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  slipInfoWrapper: {
    marginTop: 24,
    width: "100%",
  },
  slipInfoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  slipInfoTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#ffffff",
  },
  newAnalysisButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "rgba(79, 99, 232, 0.2)",
  },
  newAnalysisText: {
    color: "#7789FF",
    fontSize: 12,
    fontWeight: "600",
  },
  summaryCard: {
    backgroundColor: "#1C2135",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
  },
  summaryDivider: {
    width: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  summaryLabel: {
    fontSize: 12,
    color: "#8A94B0",
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#ffffff",
  },
  probabilitySection: {
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
    paddingTop: 16,
  },
  probabilityLabel: {
    fontSize: 14,
    color: "#8A94B0",
    marginBottom: 12,
  },
  probabilityIndicator: {
    width: "100%",
  },
  indicatorBar: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  indicatorFill: {
    height: "100%",
  },
  indicatorLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  indicatorValue: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  indicatorText: {
    fontWeight: "600",
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
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 16,
  },
  leagueContainer: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#1C2135",
  },
  leagueHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
    backgroundColor: "#252B47",
  },
  leagueTitle: {
    color: "#ffffff",
    fontWeight: "600",
    marginLeft: 8,
  },
  betContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  betHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  betDetail: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
    flex: 1,
    marginRight: 10,
  },
  betInfoRow: {
    flexDirection: "row",
    marginBottom: 10,
  },
  betInfoKey: {
    fontSize: 14,
    color: "#8A94B0",
    width: 60,
  },
  betInfoValue: {
    fontSize: 14,
    color: "#ffffff",
    flex: 1,
  },
  betFooter: {
    flexDirection: "row",
    marginTop: 10,
  },
  betTypeTag: {
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 16,
    marginRight: 10,
  },
  betTypeText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "500",
  },
  oddsTag: {
    backgroundColor: "#4F63E8",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 16,
  },
  oddsText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },
  betProbabilityContainer: {
    marginVertical: 12,
    width: "100%",
  },
  betProbabilityBar: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 4,
  },
  betProbabilityFill: {
    height: "100%",
  },
  betProbabilityValue: {
    fontSize: 12,
    fontWeight: "600",
    alignSelf: "flex-end",
  },
  disclaimer: {
    marginTop: 20,
    marginBottom: 30,
  },
  disclaimerText: {
    color: "#8A94B0",
    fontSize: 12,
    textAlign: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(16,20,38,0.85)",
  },
  lottie: {
    width: 300,
    height: 300,
  },
  modalText: {
    color: "#ffffff",
    fontSize: 18,
    marginTop: 10,
    fontWeight: "800",
  },

  betAnalysisContainer: {
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  analysisHeader: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 4,
  },
  analysisText: {
    fontSize: 13,
    color: "#B0B7C8",
    marginBottom: 4,
  },
  label: {
    fontWeight: "600",
    color: "#ffffff",
  },
});
