import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Dimensions,
  TouchableOpacity,
  Animated,
  ScrollView,
} from "react-native";
import React, { useEffect, useState, useRef } from "react";

const { width, height } = Dimensions.get("window");

const Why = ({ route, navigation }) => {
  const surveyAnswers = route.params?.surveyAnswers || {};
  const email = route.params?.email || "";
  const userId = route.params?.userId || "";

  const [content, setContent] = useState([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const generatedContent = generateContent(surveyAnswers);
    setContent(generatedContent);

    // Simple entrance animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [surveyAnswers]);

  const generateContent = (answers) => {
    const betType = answers.question1;
    const researchTime = answers.question2;
    const features = [];

    // Core features based on survey answers
    if (betType === "Parlays") {
      features.push({
        title: "Master Your Parlays",
        description:
          "Comprehensive multi-leg analysis with probability calculations",
        icon: "🏆",
      });
    } else if (betType === "Single Bets" || betType === "Player Props") {
      features.push({
        title: "Precision Betting",
        description:
          "AI-powered insights for singles and props with key matchup data",
        icon: "🎯",
      });
    }

    if (researchTime === "I don't do research") {
      features.push({
        title: "Instant Intelligence",
        description:
          "Skip research. Get instant comprehensive bet slip analysis",
        icon: "⚡",
      });
    } else if (researchTime === "Less than 30 min") {
      features.push({
        title: "Quick Research Booster",
        description:
          "Amplify your research with critical insights and probabilities",
        icon: "⏱️",
      });
    } else if (
      researchTime.includes("hour") ||
      researchTime.includes("hours")
    ) {
      features.push({
        title: "Research Companion",
        description:
          "Enhance deep analysis with advanced metrics and validation",
        icon: "🔍",
      });
    }

    return features;
  };

  const handleContinue = () => {
    // Button animation
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.97,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    navigation.navigate("OfferTrial", { email, userId });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
          <Text style={styles.mainTitle}>Why Parlay Pal?</Text>
          <Text style={styles.subtitle}>AI-Powered Bet Analysis</Text>
        </Animated.View>

        {/* Hero Stats */}
        <Animated.View style={[styles.heroCard, { opacity: fadeAnim }]}>
          <Text style={styles.heroNumber}>7,000+</Text>
          <Text style={styles.heroLabel}>Slips Analyzed</Text>
          <Text style={styles.heroDescription}>
            Our AI has processed thousands of bet slips to provide accurate
            insights
          </Text>
        </Animated.View>

        {/* Features List */}
        <Animated.View
          style={[styles.featuresContainer, { opacity: fadeAnim }]}
        >
          {content.map((feature, index) => (
            <View key={index} style={styles.featureRow}>
              <View style={styles.featureIcon}>
                <Text style={styles.featureEmoji}>{feature.icon}</Text>
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>
                  {feature.description}
                </Text>
              </View>
            </View>
          ))}
        </Animated.View>
      </ScrollView>

      {/* Fixed bottom section */}
      <View style={styles.bottomSection}>
        {/* CTA Button */}
        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={handleContinue}
            activeOpacity={0.9}
          >
            <Text style={styles.ctaButtonText}>Continue</Text>
          </TouchableOpacity>
          {/* Progress indicator */}
          <View style={styles.progressContainer}>
            <View style={styles.progressDot} />
            <View style={styles.progressDot} />
            <View style={styles.progressDot} />
            <View style={[styles.progressDot, styles.progressDotActive]} />
          </View>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

export default Why;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#101113",
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: width * 0.06,
    paddingTop: height * 0.03,
    paddingBottom: height * 0.02,
  },

  // Header
  header: {
    marginBottom: height * 0.04,
    alignItems: "center",
  },

  mainTitle: {
    fontSize: width * 0.08,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: height * 0.01,
    textAlign: "center",
    letterSpacing: -0.5,
  },

  subtitle: {
    fontSize: width * 0.04,
    color: "rgba(255, 255, 255, 0.7)",
    fontWeight: "500",
    textAlign: "center",
    lineHeight: width * 0.055,
  },

  // Hero card
  heroCard: {
    backgroundColor: "rgba(26, 24, 27, 0.8)",
    borderRadius: 24,
    padding: width * 0.08,
    marginBottom: height * 0.04,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(84, 255, 0, 0.2)",
    shadowColor: "#54FF00",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },

  heroNumber: {
    fontSize: width * 0.12,
    fontWeight: "700",
    color: "#54FF00",
    marginBottom: height * 0.01,
    letterSpacing: -1,
  },

  heroLabel: {
    fontSize: width * 0.05,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: height * 0.015,
    letterSpacing: -0.2,
  },

  heroDescription: {
    fontSize: width * 0.035,
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
    lineHeight: width * 0.05,
    fontWeight: "500",
  },

  // Features
  featuresContainer: {
    marginBottom: height * 0.02,
  },

  featureRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: height * 0.025,
    paddingHorizontal: width * 0.02,
  },

  featureIcon: {
    width: 44,
    height: 44,
    backgroundColor: "rgba(26, 24, 27, 0.8)",
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: width * 0.04,
    borderWidth: 1,
    borderColor: "rgba(84, 255, 0, 0.2)",
  },

  featureEmoji: {
    fontSize: 20,
  },

  featureContent: {
    flex: 1,
    paddingTop: 2,
  },

  featureTitle: {
    fontSize: width * 0.045,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: height * 0.005,
    letterSpacing: -0.2,
  },

  featureDescription: {
    fontSize: width * 0.035,
    color: "rgba(255, 255, 255, 0.7)",
    lineHeight: width * 0.05,
    fontWeight: "400",
  },

  // Bottom section
  bottomSection: {
    paddingHorizontal: width * 0.06,
    paddingBottom: height * 0.04,
    paddingTop: height * 0.02,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },

  // CTA
  ctaButton: {
    backgroundColor: "#54FF00",
    borderRadius: 16,
    paddingVertical: height * 0.022,
    paddingHorizontal: width * 0.06,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#54FF00",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: height * 0.025,
  },

  ctaButtonText: {
    color: "#101113",
    fontSize: width * 0.045,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  // Progress indicator
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },

  progressDotActive: {
    backgroundColor: "#54FF00",
    shadowColor: "#54FF00",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 3,
  },
});
