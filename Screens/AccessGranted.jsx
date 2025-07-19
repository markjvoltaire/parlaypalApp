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
import { LinearGradient } from "expo-linear-gradient";

// Replace 'your_public_sdk_key' with your RevenueCat public API key.
Purchases.configure({ apiKey: "appl_uPPCiaHpkTLNkrlhOikrUMWLaBH" });

const { width, height } = Dimensions.get("window");

// Update this to your actual backend URL
const API_URL = "https://parlaypal.onrender.com";

// Floating decorative elements component
const FloatingElements = () => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 8000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

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

// Glassmorphism Card Component
const GlassCard = ({ children, style, ...props }) => (
  <View style={[styles.glassCard, style]} {...props}>
    {children}
  </View>
);

// Inline Splash Screen Component
const SplashScreen = ({ onFinish }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start animations
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

    // Glow animation
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
      ])
    ).start();

    // Hide splash after 3s
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
    <Animated.View
      style={[
        styles.splashContainer,
        {
          opacity: fadeAnim,
        },
      ]}
    >
      <FloatingElements />
      <Animated.View
        style={[
          styles.splashLogoContainer,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Animated glow effect */}
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

        {/* Loading indicator */}
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

export default function Home({ navigation }) {
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [analysisResponse, setAnalysisResponse] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [products, setProducts] = useState([]);
  const [showSplash, setShowSplash] = useState(true);
  const scrollViewRef = useRef(null);

  // Animation values for the analysis panel
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

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
  }, []);

  // Trigger animation when analysisResponse updates
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

      if (response.ok) {
        let mergedData = {};

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

        mergedData = { ...mergedData, ...parsedAnalysis };

        console.log("mergedData", mergedData);

        setAnalysisResponse(mergedData);
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

  // Enhanced probability indicator with glassmorphism
  const renderProbabilityIndicator = (probability) => {
    if (probability === undefined || probability === null) return null;

    let color = "#FF4D4F";
    let message = "High Risk";
    let gradientColors = ["#FF4D4F", "#FF7875"];

    if (probability > 30) {
      color = "#FAAD14";
      message = "Medium Risk";
      gradientColors = ["#FAAD14", "#FFC53D"];
    }
    if (probability > 60) {
      color = "#54FF00";
      message = "Good Odds";
      gradientColors = ["#54FF00", "#73FF33"];
    }

    return (
      <View style={styles.probabilityIndicator}>
        <View style={styles.probabilityHeader}>
          <Text style={styles.probabilityValue}>{probability.toFixed(1)}%</Text>
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
                { width: `${Math.min(probability, 100)}%` },
              ]}
            />
          </View>
        </View>
      </View>
    );
  };

  // Enhanced bet probability with micro-animations
  const renderBetProbability = (probability) => {
    if (probability === undefined || probability === null) return null;

    let color = "#FF4D4F";
    let gradientColors = ["#FF4D4F", "#FF7875"];

    if (probability > 30) {
      color = "#FAAD14";
      gradientColors = ["#FAAD14", "#FFC53D"];
    }
    if (probability > 60) {
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
            style={[
              styles.betProbabilityFill,
              { width: `${Math.min(probability, 100)}%` },
            ]}
          />
        </View>
        <Text style={[styles.betProbabilityValue, { color }]}>
          {probability.toFixed(1)}%
        </Text>
      </View>
    );
  };

  // Enhanced parlay analysis with glassmorphism
  const renderParlayAnalysis = () => {
    if (!analysisResponse) return null;

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
        {/* Header with glassmorphism */}
        {/* <GlassCard style={styles.analysisHeader}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <MaterialCommunityIcons
                name="chart-line"
                size={24}
                color="#54FF00"
              />
              <Text style={styles.slipInfoTitle}>Bet Analysis</Text>
            </View>
            <TouchableOpacity
              style={styles.newAnalysisButton}
              onPress={resetAnalysis}
            >
              <Ionicons name="refresh" size={16} color="#54FF00" />
              <Text style={styles.newAnalysisText}>New Analysis</Text>
            </TouchableOpacity>
          </View>
        </GlassCard> */}

        {/* Probability Card with enhanced glassmorphism */}
        <GlassCard style={styles.probabilityCard}>
          <Text style={styles.probabilityCardTitle}>Win Probability</Text>
          {renderProbabilityIndicator(parlay_probability)}

          <TouchableOpacity style={styles.clearButton} onPress={resetAnalysis}>
            <Ionicons name="trash-outline" size={18} color="#FF4D4F" />
            <Text style={styles.clearButtonText}>Remove Slip</Text>
          </TouchableOpacity>
        </GlassCard>

        {/* Bet Details Section */}
        <Text style={styles.sectionTitle}>Bet Details</Text>

        {leagues &&
          leagues.map((league, idx) => (
            <GlassCard key={`league-${idx}`} style={styles.leagueCard}>
              <View style={styles.leagueHeader}>
                <View style={styles.leagueIconContainer}>
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
                    size={20}
                    color="#54FF00"
                  />
                </View>
                <Text style={styles.leagueTitle}>{league.league}</Text>
              </View>

              {league.parlay_bets &&
                league.parlay_bets.map((bet, betIdx) => (
                  <View key={`bet-${betIdx}`} style={styles.betContainer}>
                    {/* Bet Header */}
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

                    {/* Teams Info */}
                    {bet.teams && (
                      <View style={styles.betInfoRow}>
                        <Ionicons name="people" size={16} color="#54FF00" />
                        <Text style={styles.betInfoValue}>
                          {bet.teams.join(" vs ")}
                        </Text>
                      </View>
                    )}

                    {/* Probability */}
                    {bet.probability !== undefined &&
                      renderBetProbability(bet.probability)}

                    {/* Enhanced Insights Card */}
                    <GlassCard style={styles.insightsCard}>
                      {/* Cover Rate */}
                      <View style={styles.insightRow}>
                        <View style={styles.insightIconContainer}>
                          <Ionicons
                            name="trending-up"
                            size={18}
                            color="#54FF00"
                          />
                        </View>
                        <View style={styles.insightContent}>
                          <Text style={styles.insightLabel}>Cover Rate</Text>
                          <Text style={styles.insightText}>
                            {bet.cover_analysis && bet.cover_analysis.key_stat
                              ? bet.cover_analysis.key_stat
                              : "No cover data available"}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.insightDivider} />

                      {/* Key Insight */}
                      <View style={styles.insightRow}>
                        <View style={styles.insightIconContainer}>
                          <Ionicons name="bulb" size={18} color="#54FF00" />
                        </View>
                        <View style={styles.insightContent}>
                          <Text style={styles.insightLabel}>Key Insight</Text>
                          <Text style={styles.insightText}>
                            {bet.analysis && bet.analysis.key_stat
                              ? bet.analysis.key_stat
                              : "No insight available"}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.insightDivider} />

                      {/* Matchup Info */}
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
                            {bet.analysis && bet.analysis.matchup_consideration
                              ? bet.analysis.matchup_consideration
                              : "No matchup info available"}
                          </Text>
                        </View>
                      </View>
                    </GlassCard>

                    {/* Bet Type Footer */}
                    <View style={styles.betFooter}>
                      <View style={styles.betTypeTag}>
                        <Text style={styles.betTypeText}>
                          {bet.bet_type || "N/A"}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
            </GlassCard>
          ))}

        {/* Responsible Betting */}
        {responsible_betting_reminder && (
          <GlassCard style={styles.disclaimer}>
            <Ionicons name="information-circle" size={20} color="#54FF00" />
            <Text style={styles.disclaimerText}>
              {responsible_betting_reminder}
            </Text>
          </GlassCard>
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
          <FloatingElements />

          {/* Enhanced Header */}
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
              onPress={() => navigation.navigate("Profile")}
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
              // Enhanced Upload Section
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

            {/* Enhanced Image Preview */}
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
                      <Text style={styles.secondaryButtonText}>
                        Remove Slip
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            )}

            {/* Render Analysis */}
            {renderParlayAnalysis()}
          </ScrollView>

          {/* Enhanced Loading Modal */}
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
                  <View style={styles.loaderDots}>
                    {[0, 1, 2].map((i) => (
                      <View key={i} style={styles.loaderDot} />
                    ))}
                  </View>
                </View>
              </GlassCard>
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
    backgroundColor: "#101113",
  },

  // Floating Elements
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

  // Glassmorphism Card
  glassCard: {
    backgroundColor: "rgba(26, 24, 27, 0.8)",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(84, 255, 0, 0.1)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    backdropFilter: "blur(10px)",
  },

  // Splash Screen Styles
  splashContainer: {
    position: "absolute",
    width: width,
    height: height,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#101113",
    zIndex: 1000,
  },
  splashLogoContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  splashLogoImage: {
    width: 80,
    height: 80,
    marginBottom: 24,
    zIndex: 2,
  },
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
  splashLoader: {
    marginTop: 40,
  },
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

  // Header Styles
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
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
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
  logoImage: {
    width: 24,
    height: 24,
  },
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

  // Scroll View
  scrollView: {
    flex: 1,
    zIndex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },

  // Upload Section
  uploadSection: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 500,
    marginTop: 40,
  },
  uploadCard: {
    width: "100%",
    padding: 40,
    alignItems: "center",
  },
  uploadIconContainer: {
    marginBottom: 32,
  },
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
  uploadButton: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
  },
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

  // Analysis Section
  analysisSection: {
    marginBottom: 20,
  },
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
  imageOverlay: {
    position: "absolute",
    top: 16,
    right: 16,
  },
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
  analyzeButton: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
  },
  analyzeButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 32,
  },
  analyzeButtonDisabled: {
    opacity: 0.6,
  },
  analyzeButtonText: {
    color: "#101113",
    fontSize: 17,
    fontWeight: "700",
    marginLeft: 10,
    letterSpacing: 0.3,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
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

  // Analysis Results
  slipInfoWrapper: {
    marginTop: 32,
    width: "100%",
  },
  analysisHeader: {
    marginBottom: 20,
    padding: 20,
  },
  probabilityCard: {
    padding: 24,
    marginBottom: 24,
    bottom: 15,
  },
  probabilityCardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 20,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  probabilityIndicator: {
    width: "100%",
    marginBottom: 24,
  },
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
  probabilityMessage: {
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  indicatorBarContainer: {
    width: "100%",
  },
  indicatorBar: {
    height: 12,
    borderRadius: 6,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    overflow: "hidden",
  },
  indicatorFill: {
    height: "100%",
    borderRadius: 6,
  },
  clearButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 77, 79, 0.1)",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 77, 79, 0.3)",
  },
  clearButtonText: {
    color: "#FF4D4F",
    fontSize: 15,
    fontWeight: "600",
    marginLeft: 8,
    letterSpacing: 0.3,
  },
  newAnalysisButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "rgba(84, 255, 0, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(84, 255, 0, 0.3)",
  },
  newAnalysisText: {
    color: "#54FF00",
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 6,
    letterSpacing: 0.3,
  },

  // Section Titles
  sectionTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  slipInfoTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: 0.5,
    marginLeft: 10,
  },

  // League Cards
  leagueCard: {
    marginBottom: 20,
    padding: 0,
    overflow: "hidden",
  },
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

  // Bet Container
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
  betInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
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

  // Bet Probability
  betProbabilityContainer: {
    marginVertical: 16,
    width: "100%",
  },
  betProbabilityBar: {
    height: 10,
    borderRadius: 5,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    overflow: "hidden",
    marginBottom: 8,
  },
  betProbabilityFill: {
    height: "100%",
    borderRadius: 5,
  },
  betProbabilityValue: {
    fontSize: 13,
    fontWeight: "600",
    alignSelf: "flex-end",
    letterSpacing: 0.3,
  },

  // Insights Card
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
  insightContent: {
    flex: 1,
  },
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

  // Bet Footer
  betFooter: {
    flexDirection: "row",
    marginTop: 16,
  },
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

  // Disclaimer
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

  // Modal Styles
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(16, 17, 19, 0.95)",
  },
  modalContent: {
    alignItems: "center",
    padding: 40,
    margin: 20,
  },
  lottie: {
    width: 200,
    height: 200,
  },
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
  modalLoader: {
    marginTop: 24,
  },
});
