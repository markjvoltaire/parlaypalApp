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

// API URL - Make sure to update this to your actual backend URL
const API_URL = "https://parlaypal.onrender.com";

// Inline Splash Screen Component
const SplashScreen = ({ onFinish }) => {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    // Start animations when component mounts
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

    // Set a timeout for how long to display the splash screen
    const timer = setTimeout(() => {
      // Start fade out animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 100,
          delay: 100,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Call the onFinish callback when animation completes
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

export default function AccessGranted({ navigation }) {
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [slipInfo, setSlipInfo] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [products, setProducts] = useState([]);
  const [showSplash, setShowSplash] = useState(true);
  const scrollViewRef = useRef(null);

  // Animation values for slipInfo appearance
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  // Animation value for paywall modal
  const paywallSlideAnim = useRef(
    new Animated.Value(Dimensions.get("window").height)
  ).current;

  // Handle splash screen finish
  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  // Fetch products from RevenueCat when component mounts
  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      try {
        const customerInfo = await Purchases.getCustomerInfo();
        console.log("Customer Info:", customerInfo);

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

  // Trigger animation when slipInfo is updated
  useEffect(() => {
    if (slipInfo) {
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
  }, [slipInfo]);

  const pickImage = async () => {
    // Request permission to access media library
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Parlay Pal needs access to your photo library to upload a bet slip."
      );
      return;
    }

    // Launch image picker
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      aspect: [4, 3],
      quality: 0.6,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setSlipInfo(null);
    }
  };

  const uploadImage = async () => {
    if (!image) {
      Alert.alert("Please select an image first");
      return;
    }

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

      formData.append("image", {
        uri: image,
        name: `photo.${fileType}`,
        type: `image/${fileType}`,
      });

      formData.append("userId", "user123");

      const response = await fetch(`${API_URL}/upload`, {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const responseData = await response.json();

      if (response.ok) {
        console.log("Upload successful", responseData.slipInfo);

        if (
          typeof responseData.slipInfo === "string" &&
          responseData.slipInfo.trim().startsWith("{")
        ) {
          try {
            setSlipInfo(JSON.parse(responseData.slipInfo));
            scrollViewRef.current?.scrollTo({ y: 0, animated: true });
          } catch (error) {
            console.error("JSON parsing error:", error);
            setSlipInfo({
              rawData: responseData.slipInfo,
              _note: "Could not parse JSON data",
            });
          }
        } else {
          setSlipInfo(responseData.slipInfo);
          scrollViewRef.current?.scrollTo({ y: 0, animated: true });
        }
      } else {
        Alert.alert(
          "Analysis Failed",
          "Unable to process this bet slip. Please try a clearer image."
        );
        console.log("Upload failed", responseData);
        setSlipInfo(null);
      }
    } catch (error) {
      Alert.alert(
        "Connection Error",
        "Please check your internet connection and try again."
      );
      console.error("Upload error:", error);
      setSlipInfo(null);
    } finally {
      setUploading(false);
    }
  };

  const showPaywallModal = () => {
    setShowPaywall(true);
    Animated.timing(paywallSlideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const hidePaywallModal = () => {
    Animated.timing(paywallSlideAnim, {
      toValue: Dimensions.get("window").height,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowPaywall(false);
    });
  };

  const handlePurchase = async (packageToPurchase) => {
    try {
      const { customerInfo } = await Purchases.purchasePackage(
        packageToPurchase
      );

      // Check if the user is now subscribed
      if (
        customerInfo.activeSubscriptions &&
        customerInfo.activeSubscriptions.length > 0
      ) {
        setIsSubscribed(true);
        hidePaywallModal();
        // Proceed with upload if they just subscribed
        uploadImage();
      }
    } catch (error) {
      if (!error.userCancelled) {
        Alert.alert(
          "Error",
          "There was a problem with your purchase. Please try again."
        );
      }
    }
  };

  const resetAnalysis = () => {
    setImage(null);
    setSlipInfo(null);
  };

  const renderProbabilityIndicator = (probability) => {
    if (!probability && probability !== 0) return null;

    let color = "#FF4D4F"; // Red for low probability
    let message = "High Risk";

    if (probability > 30) {
      color = "#FAAD14"; // Yellow/orange for medium
      message = "Medium Risk";
    }
    if (probability > 60) {
      color = "#52C41A"; // Green for good probability
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

  const renderBetProbability = (probability) => {
    if (!probability && probability !== 0) return null;

    let color = "#FF4D4F";

    if (probability > 30) {
      color = "#FAAD14";
    }
    if (probability > 60) {
      color = "#52C41A";
    }

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

  const renderSlipInfo = () => {
    if (!slipInfo) return null;

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
        <View style={styles.slipInfoHeader}>
          <Text style={styles.slipInfoTitle}>Bet Analysis</Text>
          <TouchableOpacity
            style={styles.newAnalysisButton}
            onPress={resetAnalysis}
          >
            <Text style={styles.newAnalysisText}>New Analysis</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Parlay Odds</Text>
              <Text style={styles.summaryValue}>
                {slipInfo.parlay_odds ? `+${slipInfo.parlay_odds}` : "N/A"}
              </Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Stake</Text>
              <Text style={styles.summaryValue}>
                {slipInfo.stake ? `$${slipInfo.stake}` : "N/A"}
              </Text>
            </View>
          </View>

          <View style={styles.probabilitySection}>
            <Text style={styles.probabilityLabel}>Win Probability</Text>
            {renderProbabilityIndicator(slipInfo.parlay_probability)}
          </View>
        </View>

        <View style={styles.insightCard}>
          <View style={styles.insightHeader}>
            <MaterialCommunityIcons name="robot" size={20} color="#7789FF" />
            <Text style={styles.insightTitle}>AI Insight</Text>
          </View>
          <Text style={styles.insightText}>
            This parlay has a{" "}
            <Text style={styles.insightHighlight}>
              {slipInfo.parlay_probability
                ? slipInfo.parlay_probability.toFixed(2)
                : "N/A"}
              %
            </Text>{" "}
            chance of winning based on current odds.
            {slipInfo.parlay_probability < 30
              ? " Consider placing single bets instead for better chances."
              : " Remember to bet responsibly and within your limits."}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Bet Details</Text>

        {slipInfo.leagues &&
          slipInfo.leagues.map((league, idx) => (
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
                    <View style={styles.betHeader}>
                      <Text style={styles.betDetail}>
                        {bet.detail || "N/A"}
                      </Text>
                      <View style={styles.oddsTag}>
                        <Text style={styles.oddsText}>
                          {bet.odds > 0 ? `+${bet.odds}` : bet.odds}
                        </Text>
                      </View>
                    </View>

                    {bet.teams && (
                      <View style={styles.betInfoRow}>
                        <Text style={styles.betInfoKey}>Teams:</Text>
                        <Text style={styles.betInfoValue}>
                          {bet.teams.join(" vs ")}
                        </Text>
                      </View>
                    )}

                    {bet.probability !== undefined &&
                      renderBetProbability(bet.probability)}

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

        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            This analysis is for informational purposes only. Always gamble
            responsibly.
          </Text>
        </View>
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
                    Take a photo or select an image of your bet slip for AI
                    analysis
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

                {!slipInfo && (
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

            {renderSlipInfo()}
          </ScrollView>

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
  logoContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#4F63E8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  logoText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
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
  cameraButton: {
    backgroundColor: "#4F63E8",
    marginRight: 8,
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
  },
  insightHighlight: {
    color: "#ffffff",
    fontWeight: "bold",
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

  // Paywall modal styles
  paywallModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(16,20,38,0.85)",
    justifyContent: "flex-end",
  },
  paywallModalContainer: {
    backgroundColor: "#1C2135",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
  },
  paywallHeader: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 16,
  },
  paywallCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  paywallContent: {
    padding: 24,
    paddingTop: 0,
    alignItems: "center",
  },
  paywallIcon: {
    marginBottom: 16,
  },
  paywallTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 12,
    textAlign: "center",
  },
  paywallDescription: {
    fontSize: 16,
    color: "#B0B7C8",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  featuresContainer: {
    width: "100%",
    marginBottom: 32,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  featureText: {
    fontSize: 16,
    color: "#ffffff",
    marginLeft: 12,
  },
  subscriptionButton: {
    backgroundColor: "#4F63E8",
    width: "100%",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: "center",
  },
  subscriptionButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  trialText: {
    color: "#FFD700",
    fontSize: 14,
    marginTop: 4,
  },
  restoreButton: {
    padding: 12,
    marginTop: 8,
    marginBottom: 16,
  },
  restoreButtonText: {
    color: "#7789FF",
    fontSize: 14,
    fontWeight: "600",
  },
  trialBanner: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 215, 0, 0.15)",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: "center",
    marginBottom: 16,
  },
  trialBannerText: {
    color: "#FFD700",
    fontWeight: "bold",
    marginLeft: 8,
    fontSize: 14,
  },
  legalText: {
    color: "#8A94B0",
    fontSize: 12,
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 16,
  },
});
