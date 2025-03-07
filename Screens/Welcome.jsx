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
} from "react-native";

const { width } = Dimensions.get("window");

export default function Welcome({ navigation }) {
  const [showSplash, setShowSplash] = useState(true);

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
          {/* <Text style={styles.splashAppTagline}>AI-Powered Bet Analysis</Text> */}
        </Animated.View>
      </Animated.View>
    );
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
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cardContainer}
          >
            <View style={styles.card}>
              <Image
                style={{ width: width * 0.65, height: width }}
                source={require("../assets/uploadSlip.png")}
              />
            </View>
            <View style={[styles.card, styles.activeCard]}>
              <Image
                style={{ width: width * 0.65, height: width }}
                source={require("../assets/instantAnalysis.png")}
              />
            </View>
            <View style={styles.card}>
              <Image
                style={{ width: width * 0.65, height: width }}
                source={require("../assets/nailBets.png")}
              />
            </View>
          </ScrollView>

          <View style={styles.ctaSection}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <Image
                source={require("../assets/Activity.png")}
                style={{ width: 30, height: 30, marginRight: 15 }}
              />
              <Text
                style={{ fontSize: 22, fontWeight: "bold", color: "#ffffff" }}
              >
                Parlay Pal
              </Text>
            </View>
            <View style={styles.styledTextContainer}>
              <Text style={styles.ctaTitleWhite}>Know Your Odds</Text>
              <View style={styles.coloredTextRow}>
                <Text style={styles.ctaTitleBlue}>Before </Text>
                <Text style={styles.ctaTitleGreen}>You Bet</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate("Home")}
              style={styles.button}
            >
              <Text style={styles.buttonText}>Get Started</Text>
            </TouchableOpacity>
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
    width: 100,
    height: 100,
  },
  logoGlow: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#1E90FF",
    zIndex: -1,
  },
  splashAppTitle: {
    marginTop: 20,
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    marginBottom: 5,
  },
  splashAppTagline: {
    fontSize: 16,
    color: "white",
  },
  // Main Content Styles
  cardContainer: {
    paddingHorizontal: 5,
  },
  card: {
    width: width * 0.65,
    height: width,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 24,
    marginHorizontal: 5,
    overflow: "hidden",
    position: "relative",
  },
  activeCard: {
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  ctaSection: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  styledTextContainer: {
    alignItems: "center",
    marginBottom: 70,
  },
  ctaTitleWhite: {
    color: "white",
    fontSize: 38,
    fontWeight: "bold",
    textAlign: "center",
    lineHeight: 48,
  },
  coloredTextRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  ctaTitleBlue: {
    color: "#1E90FF",
    fontSize: 38,
    fontWeight: "bold",
    textAlign: "center",
    lineHeight: 48,
  },
  ctaTitleGreen: {
    color: "#00FF7F",
    fontSize: 38,
    fontWeight: "bold",
    textAlign: "center",
    lineHeight: 48,
  },
  button: {
    backgroundColor: "white",
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 30,
    width: "100%",
    alignItems: "center",
    marginBottom: 10,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
});
