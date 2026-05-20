import React, { useState, useRef, useCallback, useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  useWindowDimensions,
  Animated,
} from "react-native";

/* ──────────────────────────────────────────
 *  Constants
 * ────────────────────────────────────────── */
const ONBOARDING_DATA = [
  {
    title: "Upload Your Slip",
    subtitle:
      "Convert your betting slip into actionable insights with our smart analysis feature",
    icon: "📋", // You can replace with your custom icons/images
  },
  {
    title: "Real Time Data Analysis",
    subtitle:
      "Transform your data into stunning visuals with AI-powered analysis generation",
    icon: "📊",
  },
  {
    title: "Analysis for Every Bet",
    subtitle:
      "Chat with the smartest AI - Experience the power of AI analysis with us",
    icon: "🤖",
  },
];

const ANIMATION_DURATION = 300;

/* ──────────────────────────────────────────
 *  Screen
 * ────────────────────────────────────────── */
export default function How({ navigation, route }) {
  const { width, height } = useWindowDimensions();

  /* ----- Cross-fade state ----- */
  const [index, setIndex] = useState(0);
  const opacity = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const animateTransition = useCallback(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: ANIMATION_DURATION / 2,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -50,
        duration: ANIMATION_DURATION / 2,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIndex((prev) => (prev + 1) % ONBOARDING_DATA.length);
      slideAnim.setValue(50);
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: ANIMATION_DURATION / 2,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: ANIMATION_DURATION / 2,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, [opacity, slideAnim]);

  const handleNext = useCallback(() => {
    animateTransition();
  }, [animateTransition]);

  const isLastSlide = index === ONBOARDING_DATA.length - 1;
  const currentData = useMemo(() => ONBOARDING_DATA[index], [index]);

  // Retrieve surveyAnswers from route.params
  const surveyAnswers = route.params?.surveyAnswers || {};
  const email = route.params?.email || "";
  const userId = route.params?.userId || "";

  const handleSkip = useCallback(() => {
    navigation.navigate("Why", {
      surveyAnswers: surveyAnswers,
      email,
      userId,
    });
  }, [navigation, surveyAnswers, email, userId]);

  /* ──────────────────────────── */
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#101113" />

      {/* Skip Button */}
      <View style={styles.skipContainer}>
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>Skip</Text>
          <Text style={styles.skipArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Floating Decorative Elements */}
      <View style={styles.decorativeContainer}>
        <View style={[styles.floatingDot, styles.dot1]} />
        <View style={[styles.floatingDot, styles.dot2]} />
        <View style={[styles.floatingDot, styles.dot4]} />
      </View>

      {/* Main Content */}
      <View style={styles.contentContainer}>
        {/* Glassmorphism Card */}
        <Animated.View
          style={[
            styles.cardContainer,
            {
              opacity,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.glassCard}>
            <View style={styles.iconContainer}>
              <Text style={styles.iconText}>{currentData.icon}</Text>
            </View>
          </View>

          {/* Background Glass Elements */}
          <View style={[styles.backgroundGlass, styles.glass1]} />
          <View style={[styles.backgroundGlass, styles.glass2]} />
          <View style={[styles.backgroundGlass, styles.glass3]} />
        </Animated.View>

        {/* Text Content */}
        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.title}>{currentData.title}</Text>
          <Text style={styles.subtitle}>{currentData.subtitle}</Text>
        </Animated.View>

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          {ONBOARDING_DATA.map((_, i) => (
            <View
              key={i}
              style={[
                styles.progressDot,
                {
                  backgroundColor: i === index ? "#54FF00" : "#1A181B",
                  width: i === index ? 24 : 8,
                },
              ]}
            />
          ))}
        </View>
      </View>

      {/* CTA Button */}
      <View style={styles.ctaSection}>
        <TouchableOpacity
          accessibilityRole="button"
          style={styles.button}
          onPress={
            isLastSlide
              ? () =>
                  navigation.navigate("Why", {
                    surveyAnswers: surveyAnswers,
                    email,
                    userId,
                  })
              : handleNext
          }
        >
          <Text style={styles.buttonText}>
            {isLastSlide ? "Get Started" : "Continue"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

/* ──────────────────────────────────────────
 *  Styles
 * ────────────────────────────────────────── */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#101113",
  },
  skipContainer: {
    alignItems: "flex-end",
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  skipButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  skipText: {
    fontSize: 16,
    color: "#ffffff",
    marginRight: 4,
  },
  skipArrow: {
    fontSize: 18,
    color: "#ffffff",
    fontWeight: "300",
  },
  decorativeContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  floatingDot: {
    position: "absolute",
    borderRadius: 50,
  },
  dot1: {
    width: 12,
    height: 12,
    backgroundColor: "#54FF00",
    top: "25%",
    right: "15%",
  },
  dot2: {
    width: 8,
    height: 8,
    backgroundColor: "#54FF00",
    top: "20%",
    left: "10%",
  },
  dot3: {
    width: 10,
    height: 10,
    backgroundColor: "#54FF00",
    bottom: "35%",
    right: "20%",
  },
  dot4: {
    width: 6,
    height: 6,
    backgroundColor: "#54FF00",
    top: "35%",
    left: "20%",
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  cardContainer: {
    width: 280,
    height: 280,
    marginBottom: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  glassCard: {
    width: 200,
    height: 200,
    backgroundColor: "rgba(26, 24, 27, 0.9)",
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 20,
    },
    shadowOpacity: 0.3,
    shadowRadius: 40,
    elevation: 10,
    borderWidth: 1,
    borderColor: "rgba(84, 255, 0, 0.2)",
    zIndex: 3,
  },
  backgroundGlass: {
    position: "absolute",
    borderRadius: 24,
    backgroundColor: "rgba(26, 24, 27, 0.3)",
  },
  glass1: {
    width: 160,
    height: 160,
    top: -20,
    left: -40,
    backgroundColor: "rgba(84, 255, 0, 0.1)",
    zIndex: 1,
  },
  glass2: {
    width: 140,
    height: 140,
    bottom: -30,
    right: -30,
    backgroundColor: "rgba(84, 255, 0, 0.15)",
    zIndex: 1,
  },
  glass3: {
    width: 120,
    height: 120,
    top: 20,
    right: -50,
    backgroundColor: "rgba(84, 255, 0, 0.08)",
    zIndex: 2,
  },
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  iconText: {
    fontSize: 64,
  },
  textContainer: {
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 38,
  },
  subtitle: {
    fontSize: 16,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 8,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  progressDot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    transition: "all 0.3s ease",
  },
  ctaSection: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  button: {
    backgroundColor: "#54FF00",
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#54FF00",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#101113",
  },
});
