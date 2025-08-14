import React, { useRef, useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Animated,
  Alert,
  ActivityIndicator,
  ImageBackground,
  Image, // <-- add this import
} from "react-native";
import Purchases from "react-native-purchases";
import { LinearGradient } from "expo-linear-gradient";
import LottieView from "lottie-react-native";
import { config } from "../config";

const { width, height } = Dimensions.get("window");

// RevenueCat is configured once in App.tsx

export default function Welcome({ navigation }) {
  const [showSplash, setShowSplash] = useState(true);
  const [processingRestore, setProcessingRestore] = useState(false);

  // Floating animation refs
  const floatingAnims = useRef(
    Array.from({ length: 8 }, () => new Animated.Value(0))
  ).current;
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start floating animations
    floatingAnims.forEach((anim, index) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: 3000 + index * 200,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 3000 + index * 200,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });

    // Scan line animation
    Animated.loop(
      Animated.timing(scanLineAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  // Splash Screen Component
  const SplashScreen = ({ onFinish }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      // Fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start(() => {
        // Hold, then fade out
        setTimeout(() => {
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }).start(() => {
            if (onFinish) onFinish();
          });
        }, 1300);
      });
    }, [fadeAnim, onFinish]);

    return (
      <Animated.View
        style={{
          flex: 1,
          backgroundColor: "#000",
          justifyContent: "center",
          alignItems: "center",
          opacity: fadeAnim,
        }}
      >
        <ImageBackground
          source={require("../assets/blackSplash.png")}
          style={{ width: width, height: height, resizeMode: "cover" }}
        />
      </Animated.View>
    );
  };

  // Floating Elements
  const FloatingElements = () => (
    <View style={styles.floatingContainer}>
      {floatingAnims.map((anim, index) => (
        <Animated.View
          key={index}
          style={[
            styles.floatingDot,
            {
              left: `${10 + index * 12}%`,
              top: `${15 + index * 8}%`,
              opacity: anim,
              transform: [
                {
                  translateY: anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -20],
                  }),
                },
              ],
            },
          ]}
        />
      ))}
    </View>
  );

  // Main logo with scanning effect
  const MainLogo = () => (
    <View style={styles.mainLogoContainer}>
      {/* Background pattern */}
      <View style={styles.logoBackground}>
        <Animated.View
          style={[
            styles.scanLine,
            {
              transform: [
                {
                  translateY: scanLineAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, height * 0.4],
                  }),
                },
              ],
            },
          ]}
        />
      </View>

      {/* Main logo circle */}
      <LinearGradient
        colors={["rgba(26, 24, 27, 0.9)", "rgba(16, 17, 19, 0.9)"]}
        style={styles.logoCircle}
      >
        <View style={styles.logoInner}>
          <LottieView
            source={require("../assets/greenScanning.json")}
            autoPlay
            loop
            style={{ width: "100%", height: "100%" }}
          />
        </View>

        {/* Animated rings */}
        <Animated.View
          style={[
            styles.animatedRing,
            {
              transform: [
                {
                  scale: scanLineAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.2],
                  }),
                },
              ],
              opacity: scanLineAnim.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0.8, 0.3, 0.8],
              }),
            },
          ]}
        />
      </LinearGradient>
    </View>
  );

  // Function to restore purchases
  const handleRestorePurchases = async () => {
    try {
      setProcessingRestore(true);
      const customerInfo = await Purchases.restorePurchases();

      if (
        customerInfo.activeSubscriptions &&
        customerInfo.activeSubscriptions.length > 0
      ) {
        navigation.navigate("AccessGranted");
        Alert.alert("Success", "Your purchases have been restored!");
      } else {
        Alert.alert(
          "No Purchases Found",
          "No active subscriptions were found to restore."
        );
      }
    } catch (error) {
      Alert.alert("Error", "Failed to restore purchases. Please try again.");
    } finally {
      setProcessingRestore(false);
    }
  };

  // Main content component
  const MainContent = () => {
    const fadeIn = useRef(new Animated.Value(0)).current;
    const slideUp = useRef(new Animated.Value(50)).current;

    useEffect(() => {
      Animated.parallel([
        Animated.timing(fadeIn, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideUp, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start();
    }, [fadeIn, slideUp]);

    return (
      <Animated.View
        style={[
          styles.mainContent,
          {
            opacity: fadeIn,
            transform: [{ translateY: slideUp }],
          },
        ]}
      >
        <StatusBar barStyle="light-content" backgroundColor="#101113" />
        <SafeAreaView style={styles.safeArea}>
          <FloatingElements />

          <View style={styles.topSection}>
            <MainLogo />
          </View>

          <View style={styles.contentSection}>
            {/* Header */}
            <View style={styles.headerContainer}>
              <View style={styles.brandRow}>
                <Image
                  source={require("../assets/Activity.png")}
                  style={styles.brandLogo}
                />
                <Text style={styles.brandName}>Parlay Pal</Text>
              </View>
            </View>

            {/* Main CTA Text */}
            <LinearGradient
              colors={["rgba(26, 24, 27, 0.8)", "rgba(16, 17, 19, 0.4)"]}
              style={styles.ctaCard}
            >
              <View style={styles.ctaTextContainer}>
                <Text style={styles.ctaTitleWhite}>Know Your Odds</Text>
                <View style={styles.coloredTextRow}>
                  <Text style={styles.ctaTitleAccent}>Before </Text>
                  <Text style={styles.ctaTitleGreen}>You Bet</Text>
                </View>
                <Text style={styles.subtitle}>
                  Advanced analytics and real-time insights for smarter betting
                  decisions
                </Text>
              </View>
            </LinearGradient>

            {/* Action Buttons */}
            <View style={styles.actionContainer}>
              <TouchableOpacity
                onPress={() => navigation.navigate("Email")}
                style={styles.primaryButton}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={["#54FF00", "#3DD600"]}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.primaryButtonText}>Get Started</Text>
                  <Text style={styles.buttonArrow}>→</Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* Restore Purchase */}
              <TouchableOpacity
                onPress={handleRestorePurchases}
                style={styles.restoreButton}
                activeOpacity={0.7}
              >
                <View style={styles.restoreButtonContent}>
                  {processingRestore && (
                    <ActivityIndicator
                      size="small"
                      color="#54FF00"
                      style={{ marginRight: 8 }}
                    />
                  )}
                  <Text style={styles.restoreText}>
                    {processingRestore ? "Restoring..." : "Restore Purchase"}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Animated.View>
    );
  };

  if (showSplash) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#101113" />
        <SplashScreen onFinish={handleSplashFinish} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MainContent />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#101113",
  },

  brandLogo: {
    width: 28, // Reduced from 32
    height: 28, // Reduced from 32
    marginRight: 10, // Reduced from 12
    borderRadius: 6, // Reduced from 8
    resizeMode: "contain",
  },

  // Splash Screen Styles
  splashContainer: {
    flex: 1,
    backgroundColor: "#101113",
    justifyContent: "center",
    alignItems: "center",
  },
  splashLogoContainer: {
    alignItems: "center",
  },
  logoGlow: {
    position: "absolute",
    width: width * 0.4,
    height: width * 0.4,
    borderRadius: width * 0.2,
    backgroundColor: "#54FF00",
    opacity: 0.1,
  },
  logoContainer: {
    width: width * 0.28,
    height: width * 0.28,
    borderRadius: width * 0.14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(84, 255, 0, 0.3)",
  },
  logoIcon: {
    width: width * 0.2,
    height: width * 0.2,
    borderRadius: width * 0.1,
    backgroundColor: "rgba(84, 255, 0, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: {
    fontSize: width * 0.1,
  },
  splashAppTitle: {
    marginTop: height * 0.03,
    fontSize: width * 0.08,
    fontWeight: "800",
    color: "white",
    letterSpacing: 1,
  },
  splashSubtitle: {
    fontSize: width * 0.035,
    fontWeight: "400",
    color: "#54FF00",
    marginTop: height * 0.005,
    letterSpacing: 0.5,
  },

  // Main Content Styles
  mainContent: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  floatingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: "none",
  },
  floatingDot: {
    position: "absolute",
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#54FF00",
  },
  topSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  mainLogoContainer: {
    position: "relative",
    alignItems: "center",
  },
  logoBackground: {
    position: "absolute",
    width: width * 0.8,
    height: width * 0.8,
    opacity: 0.1,
  },
  scanLine: {
    width: "100%",
    height: 2,
    backgroundColor: "#54FF00",
    shadowColor: "#54FF00",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  logoCircle: {
    width: width * 0.5,
    height: width * 0.5,
    borderRadius: width * 0.25,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(84, 255, 0, 0.3)",
    shadowColor: "#54FF00",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  logoInner: {
    width: width * 0.3,
    height: width * 0.3,
    borderRadius: width * 0.15,
    backgroundColor: "rgba(84, 255, 0, 0.05)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(84, 255, 0, 0.2)",
  },
  mainLogoText: {
    fontSize: width * 0.12,
    color: "#54FF00",
  },
  animatedRing: {
    position: "absolute",
    width: width * 0.52,
    height: width * 0.52,
    borderRadius: width * 0.26,
    borderWidth: 1,
    borderColor: "rgba(84, 255, 0, 0.3)",
  },
  contentSection: {
    paddingHorizontal: width * 0.06,
    paddingBottom: height * 0.05,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: height * 0.02,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  brandIcon: {
    fontSize: width * 0.08,
    marginRight: width * 0.02,
  },
  brandName: {
    fontSize: width * 0.07,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: 1,
  },

  ctaCard: {
    borderRadius: 24,
    padding: width * 0.06,
    marginBottom: height * 0.04,
    borderWidth: 1,
    borderColor: "rgba(84, 255, 0, 0.1)",
  },
  ctaTextContainer: {
    alignItems: "center",
  },
  ctaTitleWhite: {
    color: "white",
    fontSize: width * 0.09,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: 1,
  },
  coloredTextRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: height * 0.02,
  },
  ctaTitleAccent: {
    color: "#54FF00",
    fontSize: width * 0.09,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: 1,
  },
  ctaTitleGreen: {
    color: "#54FF00",
    fontSize: width * 0.09,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: 1,
  },
  subtitle: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: width * 0.035,
    textAlign: "center",
    lineHeight: width * 0.05,
    letterSpacing: 0.5,
  },
  actionContainer: {
    alignItems: "center",
  },
  primaryButton: {
    width: "80%",
    marginBottom: height * 0.035,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#54FF00",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonGradient: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: height * 0.025,
    paddingHorizontal: width * 0.08,
  },
  primaryButtonText: {
    fontSize: width * 0.045,
    fontWeight: "700",
    color: "#101113",
    letterSpacing: 1,
  },
  buttonArrow: {
    fontSize: width * 0.05,
    color: "#101113",
    marginLeft: width * 0.02,
    fontWeight: "800",
  },
  restoreButton: {
    paddingVertical: height * 0.015,
    paddingHorizontal: width * 0.06,
    borderRadius: 16,
    backgroundColor: "rgba(26, 24, 27, 0.6)",
    borderWidth: 1,
    borderColor: "rgba(84, 255, 0, 0.2)",
  },
  restoreButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  restoreText: {
    fontSize: width * 0.038,
    fontWeight: "600",
    color: "#54FF00",
    letterSpacing: 0.5,
  },
});
