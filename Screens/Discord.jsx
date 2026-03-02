import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  Animated,
  Linking,
} from "react-native";
import React, { useEffect, useRef } from "react";

const { width, height } = Dimensions.get("window");

export default function Discord({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const skipButtonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const benefits = [
    {
      icon: "💡",
      title: "Share Your Feedback",
      description: "Help us build better features",
    },
    {
      icon: "🔔",
      title: "Stay Updated",
      description: "First to know about updates",
    },
    {
      icon: "🤝",
      title: "Connect Directly",
      description: "Chat with our team",
    },
  ];

  const handleJoinDiscord = () => {
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

    // Add your Discord invite link here
    Linking.openURL("https://discord.gg/hbemqMgWrw");
    navigation.navigate("OfferTrial");
    console.log("Join Discord pressed");
  };

  const handleSkip = () => {
    Animated.sequence([
      Animated.timing(skipButtonScale, {
        toValue: 0.97,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(skipButtonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Navigate to next screen or skip
    navigation.navigate("OfferTrial");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
          <Text style={styles.mainTitle}>Join Our Community</Text>
          <Text style={styles.subtitle}>
            Connect with Parlay Pal on Discord
          </Text>
        </Animated.View>

        {/* Benefits */}
        <Animated.View
          style={[styles.featuresContainer, { opacity: fadeAnim }]}
        >
          {benefits.map((benefit, index) => (
            <View key={index} style={styles.featureRow}>
              <View style={styles.featureIcon}>
                <Text style={styles.featureEmoji}>{benefit.icon}</Text>
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{benefit.title}</Text>
                <Text style={styles.featureDescription}>
                  {benefit.description}
                </Text>
              </View>
            </View>
          ))}
        </Animated.View>
        {/* Hero Card */}
        <Animated.View style={[styles.heroCard, { opacity: fadeAnim }]}>
          <Text style={styles.heroIcon}>💬</Text>
          <Text style={styles.heroLabel}>Parlay Pal Discord</Text>
          <Text style={styles.heroDescription}>
            Connect with our team and community. Get support, share feedback,
            and stay updated.
          </Text>
        </Animated.View>
      </View>

      {/* Fixed bottom section */}
      <View style={styles.bottomSection}>
        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={handleJoinDiscord}
            activeOpacity={0.9}
          >
            <Text style={styles.ctaButtonText}>Join Discord Server</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={{ transform: [{ scale: skipButtonScale }] }}>
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkip}
            activeOpacity={0.7}
          >
            <Text style={styles.skipButtonText}>No thanks</Text>
          </TouchableOpacity>
        </Animated.View>

        <Text style={styles.footerText}>
          Free to join • No spam, just community
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#101113",
  },

  content: {
    flex: 1,
    paddingHorizontal: width * 0.06,
    paddingTop: height * 0.04,
    justifyContent: "space-between",
  },

  // Header
  header: {
    marginBottom: height * 0.03,
    alignItems: "center",
  },

  mainTitle: {
    fontSize: width * 0.075,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: height * 0.008,
    textAlign: "center",
    letterSpacing: -0.5,
  },

  subtitle: {
    fontSize: width * 0.038,
    color: "rgba(255, 255, 255, 0.7)",
    fontWeight: "500",
    textAlign: "center",
    lineHeight: width * 0.05,
  },

  // Hero card
  heroCard: {
    backgroundColor: "rgba(26, 24, 27, 0.8)",
    borderRadius: 24,
    padding: width * 0.06,
    marginBottom: height * 0.03,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(84, 255, 0, 0.2)",
    shadowColor: "#54FF00",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },

  heroIcon: {
    fontSize: width * 0.13,
    marginBottom: height * 0.01,
  },

  heroLabel: {
    fontSize: width * 0.048,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: height * 0.01,
    letterSpacing: -0.2,
  },

  heroDescription: {
    fontSize: width * 0.034,
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
    lineHeight: width * 0.048,
    fontWeight: "500",
  },

  // Features
  featuresContainer: {
    marginBottom: height * 0.02,
  },

  featureRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: height * 0.018,
    paddingHorizontal: width * 0.02,
  },

  featureIcon: {
    width: 40,
    height: 40,
    backgroundColor: "rgba(26, 24, 27, 0.8)",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: width * 0.04,
    borderWidth: 1,
    borderColor: "rgba(84, 255, 0, 0.2)",
  },

  featureEmoji: {
    fontSize: 18,
  },

  featureContent: {
    flex: 1,
    paddingTop: 2,
  },

  featureTitle: {
    fontSize: width * 0.042,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: height * 0.003,
    letterSpacing: -0.2,
  },

  featureDescription: {
    fontSize: width * 0.033,
    color: "rgba(255, 255, 255, 0.7)",
    lineHeight: width * 0.045,
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
    marginBottom: height * 0.015,
  },

  ctaButtonText: {
    color: "#101113",
    fontSize: width * 0.045,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  // Skip button
  skipButton: {
    backgroundColor: "rgba(26, 24, 27, 0.8)",
    borderRadius: 16,
    paddingVertical: height * 0.02,
    paddingHorizontal: width * 0.06,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.3)",
    marginBottom: height * 0.015,
  },

  skipButtonText: {
    color: "#FFFFFF",
    fontSize: width * 0.042,
    fontWeight: "600",
    letterSpacing: 0.2,
  },

  footerText: {
    fontSize: width * 0.032,
    color: "rgba(255, 255, 255, 0.5)",
    textAlign: "center",
    fontWeight: "500",
  },
});
