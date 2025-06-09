import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Dimensions,
  TouchableOpacity,
  Image,
  Animated,
} from "react-native";
import React, { useEffect, useState, useRef } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

const Why = ({ route, navigation }) => {
  const surveyAnswers = route.params?.surveyAnswers || {};
  const [content, setContent] = useState([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    const generatedContent = generateContent(surveyAnswers);
    setContent(generatedContent);

    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, [surveyAnswers]);

  const generateContent = (answers) => {
    const betType = answers.question1;
    const researchTime = answers.question2;
    const messages = [];

    // Welcome section
    messages.push(
      <Animated.View
        style={[
          styles.welcomeSection,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
        key="intro"
      >
        <LinearGradient
          colors={["rgba(119, 137, 255, 0.15)", "rgba(79, 99, 232, 0.08)"]}
          style={styles.welcomeCard}
        >
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name="chart-line"
              size={24}
              color="#7789FF"
            />
          </View>
          <Text style={styles.welcomeTitle}>1,800+ Slips Analyzed!</Text>
          <Text style={styles.welcomeText}>
            Our AI has processed thousands of bet slips to provide accurate
            insights.
          </Text>
        </LinearGradient>
      </Animated.View>
    );

    // Feature cards based on survey answers
    if (betType === "Parlays") {
      messages.push(
        <View style={styles.featureCard} key="parlays">
          <LinearGradient
            colors={["rgba(82, 196, 26, 0.12)", "rgba(82, 196, 26, 0.04)"]}
            style={styles.cardContent}
          >
            <View
              style={[
                styles.smallIconContainer,
                { backgroundColor: "rgba(82, 196, 26, 0.15)" },
              ]}
            >
              <MaterialCommunityIcons
                name="trophy-outline"
                size={20}
                color="#52C41A"
              />
            </View>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>Master Your Parlays</Text>
              <Text style={styles.cardText}>
                Comprehensive multi-leg analysis with probability calculations
              </Text>
            </View>
          </LinearGradient>
        </View>
      );
    } else if (betType === "Single Bets" || betType === "Player Props") {
      messages.push(
        <View style={styles.featureCard} key="singlebet">
          <LinearGradient
            colors={["rgba(250, 173, 20, 0.12)", "rgba(250, 173, 20, 0.04)"]}
            style={styles.cardContent}
          >
            <View
              style={[
                styles.smallIconContainer,
                { backgroundColor: "rgba(250, 173, 20, 0.15)" },
              ]}
            >
              <MaterialCommunityIcons
                name="bullseye"
                size={20}
                color="#FAAD14"
              />
            </View>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>Precision Betting</Text>
              <Text style={styles.cardText}>
                AI-powered insights for singles and props with key matchup data
              </Text>
            </View>
          </LinearGradient>
        </View>
      );
    }

    if (researchTime === "I don't do research") {
      messages.push(
        <View style={styles.featureCard} key="noresearch">
          <LinearGradient
            colors={["rgba(255, 77, 79, 0.12)", "rgba(255, 77, 79, 0.04)"]}
            style={styles.cardContent}
          >
            <View
              style={[
                styles.smallIconContainer,
                { backgroundColor: "rgba(255, 77, 79, 0.15)" },
              ]}
            >
              <Ionicons name="flash-outline" size={20} color="#FF4D4F" />
            </View>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>Instant Intelligence</Text>
              <Text style={styles.cardText}>
                Skip research. Get instant comprehensive bet slip analysis
              </Text>
            </View>
          </LinearGradient>
        </View>
      );
    } else if (researchTime === "Less than 30 min") {
      messages.push(
        <View style={styles.featureCard} key="lesstime">
          <LinearGradient
            colors={["rgba(255, 77, 79, 0.12)", "rgba(255, 77, 79, 0.04)"]}
            style={styles.cardContent}
          >
            <View
              style={[
                styles.smallIconContainer,
                { backgroundColor: "rgba(255, 77, 79, 0.15)" },
              ]}
            >
              <Ionicons name="timer-outline" size={20} color="#FF4D4F" />
            </View>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>Quick Research Booster</Text>
              <Text style={styles.cardText}>
                Amplify your research with critical insights and probabilities
              </Text>
            </View>
          </LinearGradient>
        </View>
      );
    } else if (
      researchTime.includes("hour") ||
      researchTime.includes("hours")
    ) {
      messages.push(
        <View style={styles.featureCard} key="moretime">
          <LinearGradient
            colors={["rgba(119, 137, 255, 0.12)", "rgba(119, 137, 255, 0.04)"]}
            style={styles.cardContent}
          >
            <View
              style={[
                styles.smallIconContainer,
                { backgroundColor: "rgba(119, 137, 255, 0.15)" },
              ]}
            >
              <MaterialCommunityIcons
                name="magnify"
                size={20}
                color="#7789FF"
              />
            </View>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>Research Companion</Text>
              <Text style={styles.cardText}>
                Enhance deep analysis with advanced metrics and validation
              </Text>
            </View>
          </LinearGradient>
        </View>
      );
    }

    return messages;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={["#0A0E1A", "#101426", "#1A2240"]}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Background decoration */}
        <View style={styles.backgroundDecoration}>
          <View style={[styles.backgroundCircle, styles.bgCircle1]} />
          <View style={[styles.backgroundCircle, styles.bgCircle2]} />
          <View style={[styles.backgroundCircle, styles.bgCircle3]} />
        </View>

        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.headerRow}>
            <View style={styles.logoContainer}>
              <Image
                source={require("../assets/Activity.png")}
                style={styles.logo}
              />
            </View>
            <Text style={styles.appTitle}>Parlay Pal</Text>
          </View>
          {/* <Text style={styles.mainHeading}>Why Parlay Pal?</Text> */}
          <Text style={styles.subtitle}>
            Personalized betting intelligence powered by AI
          </Text>
        </Animated.View>

        {/* Content Area */}
        <View style={styles.contentArea}>{content}</View>

        {/* Fixed CTA at bottom */}
        <View style={styles.ctaContainer}>
          {/* <LinearGradient
            colors={["#4F63E8", "#7B68EE", "#9370DB"]}
            style={styles.ctaCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          > */}
          <View style={styles.ctaContent}>
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={() => navigation.navigate("OfferTrial")}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#ffffff", "#f8f9ff"]}
                style={styles.buttonGradient}
              >
                <Text style={styles.ctaButtonText}>
                  Try Parlay Pal For Free
                </Text>
                <View style={styles.buttonIcon}>
                  <Ionicons name="arrow-forward" size={18} color="#4F63E8" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
          <View style={styles.ctaDecoration}>
            <View style={[styles.floatingCircle, styles.circle1]} />
            <View style={[styles.floatingCircle, styles.circle2]} />
          </View>
          {/* </LinearGradient> */}
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default Why;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0A0E1A",
  },
  container: {
    flex: 1,
    width: "100%",
  },
  backgroundDecoration: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: "hidden",
  },
  backgroundCircle: {
    position: "absolute",
    borderRadius: 1000,
    opacity: 0.03,
  },
  bgCircle1: {
    width: 200,
    height: 200,
    backgroundColor: "#7789FF",
    top: -100,
    right: -100,
  },
  bgCircle2: {
    width: 150,
    height: 150,
    backgroundColor: "#52C41A",
    bottom: 200,
    left: -75,
  },
  bgCircle3: {
    width: 100,
    height: 100,
    backgroundColor: "#FAAD14",
    top: height * 0.3,
    right: 30,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 25,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  logoContainer: {
    width: 40,
    height: 40,
    backgroundColor: "rgba(119, 137, 255, 0.15)",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  logo: {
    width: 22,
    height: 22,
  },
  appTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: 0.3,
  },
  mainHeading: {
    fontSize: 30,
    fontWeight: "900",
    color: "#ffffff",
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: "#8B92A6",
    fontWeight: "500",
    opacity: 0.8,
  },
  contentArea: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "flex-start",
  },
  welcomeSection: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: "hidden",
  },
  welcomeCard: {
    padding: 20,
    borderRadius: 20,
    backgroundColor: "rgba(28, 33, 53, 0.4)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    alignItems: "center",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(119, 137, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 6,
    textAlign: "center",
    letterSpacing: -0.2,
  },
  welcomeText: {
    fontSize: 14,
    color: "#B0B7C8",
    textAlign: "center",
    lineHeight: 20,
    fontWeight: "500",
  },
  featureCard: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: "hidden",
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    backgroundColor: "rgba(28, 33, 53, 0.4)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },
  smallIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 4,
    letterSpacing: -0.1,
  },
  cardText: {
    fontSize: 13,
    color: "#B0B7C8",
    lineHeight: 18,
    fontWeight: "500",
  },
  ctaContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderRadius: 24,
    overflow: "hidden",
  },
  ctaCard: {
    position: "relative",
    borderRadius: 24,
    overflow: "hidden",
  },
  ctaContent: {
    padding: 24,
    alignItems: "center",
    zIndex: 2,
  },
  ctaTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: 18,
    textAlign: "center",
    letterSpacing: -0.3,
  },
  ctaButton: {
    borderRadius: 40,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 40,
  },
  ctaButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#4F63E8",
    letterSpacing: 0.2,
  },
  buttonIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(79, 99, 232, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },
  ctaDecoration: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  floatingCircle: {
    position: "absolute",
    borderRadius: 1000,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  circle1: {
    width: 60,
    height: 60,
    top: -30,
    right: -30,
  },
  circle2: {
    width: 40,
    height: 40,
    bottom: -20,
    left: -20,
  },
});
