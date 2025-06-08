import React, { useRef, useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Dimensions,
  Animated,
  Alert,
  ActivityIndicator,
} from "react-native";
import Purchases from "react-native-purchases";
import LottieView from "lottie-react-native";

const { width, height } = Dimensions.get("window");

// Replace 'appl_uPPCiaHpkTLNkrlhOikrUMWLaBH' with your actual RevenueCat API key
Purchases.configure({ apiKey: "appl_uPPCiaHpkTLNkrlhOikrUMWLaBH" });

export default function Welcome({ navigation }) {
  const [showSplash, setShowSplash] = useState(true);
  const [processingRestore, setProcessingRestore] = useState(false);

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  // Splash Screen Component
  const SplashScreen = ({ onFinish }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;

    useEffect(() => {
      // Start entrance animations
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

      // After delay, animate exit and call onFinish
      const timer = setTimeout(() => {
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
          <Text style={styles.splashAppTitle}>Parlay Pal</Text>
        </Animated.View>
      </Animated.View>
    );
  };

  // Function to restore purchases
  const handleRestorePurchases = async () => {
    try {
      setProcessingRestore(true);
      const customerInfo = await Purchases.restorePurchases();

      // Check if there's an active subscription
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

  // Main content component with fade-in animation
  const MainContent = () => {
    const fadeIn = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }, [fadeIn]);

    return (
      <Animated.View style={{ flex: 1, opacity: fadeIn }}>
        <StatusBar barStyle="light-content" />
        <SafeAreaView style={styles.safeArea}>
          <LottieView
            source={require("../assets/scanning.json")}
            autoPlay
            loop
            style={styles.lottie}
          />

          <View style={styles.ctaSection}>
            <View style={styles.headerRow}>
              <Image
                source={require("../assets/Activity.png")}
                style={{ width: 35, height: 35, marginRight: 10 }}
              />
              <Text style={styles.appTitle}>Parlay Pal</Text>
            </View>
            <View style={styles.styledTextContainer}>
              <Text style={styles.ctaTitleWhite}>Know Your Odds</Text>
              <View style={styles.coloredTextRow}>
                <Text style={styles.ctaTitleBlue}>Before </Text>
                <Text style={styles.ctaTitleGreen}>You Bet</Text>
              </View>
            </View>

            {/* 'Get Started' Button */}
            <TouchableOpacity
              onPress={() => navigation.navigate("Email")}
              style={styles.button}
            >
              <Text style={styles.buttonText}>Get Started</Text>
            </TouchableOpacity>

            {/* Pressable text for 'Restore Purchase' */}
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              {processingRestore && (
                <ActivityIndicator
                  size="small"
                  color="#fff"
                  style={{ marginRight: 10 }}
                />
              )}
              <TouchableOpacity onPress={handleRestorePurchases}>
                <Text style={styles.restoreText}>Restore Purchase</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Animated.View>
    );
  };

  // Render the splash screen if active; otherwise, render main content with fade-in.
  if (showSplash) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <SplashScreen onFinish={handleSplashFinish} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <MainContent />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#101426",
  },
  safeArea: {
    flex: 1,
  },
  // Splash Screen Styles
  splashContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#101426",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  splashLogoContainer: {
    alignItems: "center",
  },
  splashLogoImage: {
    width: width * 0.25,
    height: width * 0.25,
  },
  splashAppTitle: {
    marginTop: height * 0.02,
    fontSize: width * 0.07,
    fontWeight: "bold",
    color: "white",
    marginBottom: height * 0.005,
  },
  // Main Content Styles
  cardContainer: {
    paddingHorizontal: width * 0.01,
  },
  lottie: {
    width: width,
    height: height * 0.5,
    alignSelf: "center",
  },
  card: {
    width: width * 0.65,
    height: width,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: width * 0.06,
    marginHorizontal: width * 0.01,
    overflow: "hidden",
    position: "relative",
  },
  activeCard: {
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  ctaSection: {
    alignItems: "center",
    paddingHorizontal: width * 0.05,
    paddingBottom: height * 0.03,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: height * 0.01,
    bottom: height * 0.02,
  },
  appTitle: {
    fontSize: width * 0.08,
    fontWeight: "bold",
    color: "#ffffff",
  },
  styledTextContainer: {
    alignItems: "center",
    marginBottom: height * 0.07,
  },
  ctaTitleWhite: {
    color: "white",
    fontSize: width * 0.095,
    fontWeight: "bold",
    textAlign: "center",
    lineHeight: width * 0.12,
  },
  coloredTextRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  ctaTitleBlue: {
    color: "#1E90FF",
    fontSize: width * 0.095,
    fontWeight: "bold",
    textAlign: "center",
    lineHeight: width * 0.12,
  },
  ctaTitleGreen: {
    color: "#00FF7F",
    fontSize: width * 0.095,
    fontWeight: "bold",
    textAlign: "center",
    lineHeight: width * 0.12,
  },
  button: {
    backgroundColor: "white",
    paddingVertical: height * 0.02,
    paddingHorizontal: width * 0.075,
    borderRadius: width * 0.075,
    width: "100%",
    alignItems: "center",
    marginBottom: height * 0.01,
  },
  buttonText: {
    fontSize: width * 0.045,
    fontWeight: "bold",
    color: "#333",
  },
  restoreText: {
    marginTop: height * 0.007,
    fontSize: width * 0.04,
    fontWeight: "600",
    color: "#fff",
    textDecorationLine: "underline",
  },
});
