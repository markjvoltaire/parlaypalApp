import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
  Alert,
  Animated,
  StatusBar,
  ScrollView,
  SafeAreaView,
} from "react-native";
import React, { useEffect, useState, useRef } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Purchases from "react-native-purchases";
import { supabase } from "../Services/supabase";

const { width, height } = Dimensions.get("window");

// Custom hook for purchase logic
const usePurchase = () => {
  const [product, setProduct] = useState(null);
  const [processingPurchase, setProcessingPurchase] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const offerings = await Purchases.getOfferings();

      let weeklyPackage = null;

      for (const offeringIdentifier in offerings.all) {
        const offering = offerings.all[offeringIdentifier];
        if (
          offering.availablePackages &&
          offering.availablePackages.length > 0
        ) {
          const foundWeekly = offering.availablePackages.find(
            (pkg) => pkg.product.identifier === "premium.weeklyaccess"
          );
          if (foundWeekly) {
            weeklyPackage = foundWeekly;
            break;
          }
        }
      }

      if (weeklyPackage) {
        setProduct(weeklyPackage);
      } else {
        Alert.alert(
          "Error",
          "Weekly subscription option not found. Please try again later."
        );
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      Alert.alert(
        "Error",
        "Failed to load subscription options. Please try again."
      );
    }
  };

  const handlePurchase = async () => {
    if (!product) {
      Alert.alert("Error", "No subscription package available for purchase.");
      return false;
    }

    try {
      setProcessingPurchase(true);
      const { customerInfo } = await Purchases.purchasePackage(product);
      if (customerInfo.activeSubscriptions?.length > 0) {
        return true;
      }
    } catch (error) {
      if (!error.userCancelled) {
        Alert.alert("Error", "Failed to process purchase. Please try again.");
      }
      return false;
    } finally {
      setProcessingPurchase(false);
    }
    return false;
  };

  return {
    product,
    processingPurchase,
    handlePurchase,
  };
};

// Floating orbs component for subtle animation
const FloatingOrbs = () => {
  const orb1 = useRef(new Animated.Value(0)).current;
  const orb2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animateOrb = (orb, duration, delay = 0) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(orb, {
            toValue: 1,
            duration: duration,
            useNativeDriver: true,
          }),
          Animated.timing(orb, {
            toValue: 0,
            duration: duration,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    animateOrb(orb1, 6000, 0);
    animateOrb(orb2, 8000, 2000);
  }, []);

  return (
    <>
      <Animated.View
        style={[
          styles.floatingOrb,
          styles.orb1,
          {
            opacity: orb1.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0.1, 0.3, 0.1],
            }),
            transform: [
              {
                scale: orb1.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0.8, 1.2, 0.8],
                }),
              },
            ],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.floatingOrb,
          styles.orb2,
          {
            opacity: orb2.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0.05, 0.2, 0.05],
            }),
            transform: [
              {
                scale: orb2.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [1, 0.7, 1],
                }),
              },
            ],
          },
        ]}
      />
    </>
  );
};

// Feature showcase grid
const FeatureGrid = () => {
  const features = [
    {
      id: 1,
      title: "AI Analysis",
      image: require("../assets/iphone1.png"),
      gradient: ["#1a1a2e", "#16213e"],
    },
    {
      id: 2,
      title: "Smart Insights",
      image: require("../assets/iphone1.png"),
      gradient: ["#0f3460", "#16537e"],
    },
    {
      id: 3,
      title: "Win Probability",
      image: require("../assets/iphone1.png"),
      gradient: ["#533483", "#7209b7"],
    },
    {
      id: 4,
      title: "Live Updates",
      image: require("../assets/iphone1.png"),
      gradient: ["#2d5016", "#3e6b0f"],
    },
    {
      id: 5,
      title: "Expert Tips",
      image: require("../assets/iphone1.png"),
      gradient: ["#b7094c", "#a01a58"],
    },
    {
      id: 6,
      title: "Premium Stats",
      image: require("../assets/iphone1.png"),
      gradient: ["#ff6b35", "#f7931e"],
    },
  ];

  return (
    <View style={styles.featuresGrid}>
      {features.map((feature, index) => (
        <Animated.View
          key={feature.id}
          style={[
            styles.featureCard,
            index < 3 ? styles.topRow : styles.bottomRow,
            index % 3 === 0
              ? styles.leftCard
              : index % 3 === 1
              ? styles.middleCard
              : styles.rightCard,
          ]}
        >
          <LinearGradient
            colors={feature.gradient}
            style={styles.featureGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Image
              source={feature.image}
              style={styles.featureImage}
              resizeMode="cover"
            />
            <View style={styles.featureOverlay}>
              <Text style={styles.featureTitle}>{feature.title}</Text>
            </View>
          </LinearGradient>
        </Animated.View>
      ))}
    </View>
  );
};

// Main component
export default function Trial({ navigation, route }) {
  const { product, processingPurchase, handlePurchase } = usePurchase();
  const email = route?.params?.email || "";

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const onPurchasePress = async () => {
    try {
      const success = await handlePurchase();
      let customerInfo;
      try {
        customerInfo = await Purchases.getCustomerInfo();
      } catch (err) {
        console.error("Error getting customer info:", err);
        return;
      }
      const userId = customerInfo.originalAppUserId;
      if (success) {
        const { error } = await supabase.from("trials").insert({
          email: email,
          userid: userId,
        });
        if (error) {
          console.error("Error inserting into trials table:", error);
        }
        navigation.navigate("AccessGranted");
      }
    } catch (err) {
      console.error("Error in onPurchasePress:", err);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#101113" />

      {/* Floating background elements */}
      <FloatingOrbs />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideUpAnim }],
            },
          ]}
        >
          <View style={styles.brandContainer}>
            <Image
              source={require("../assets/Activity.png")}
              style={styles.brandLogo}
            />
            <Text style={styles.brandName}>Parlay Pal</Text>
          </View>
          {/* <TouchableOpacity style={styles.notNowButton}>
            <Text style={styles.notNowText}>Not Now</Text>
          </TouchableOpacity> */}
        </Animated.View>

        {/* Features Grid */}
        <Animated.View
          style={[
            styles.featuresSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideUpAnim }],
            },
          ]}
        ></Animated.View>

        {/* Main Content */}
        <Animated.View
          style={[
            styles.contentSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideUpAnim }],
            },
          ]}
        >
          <Text style={styles.mainTitle}>
            Turn your slips into{"\n"} winning strategies
          </Text>

          {/* <Text style={styles.subtitle}>
            Get advanced insights, win probabilities, and cover rates for your
            sports betting.
          </Text> */}

          {/* Features List */}
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={35} color="#54FF00" />
              <Text style={styles.featureText}>Advanced AI bet analysis</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={35} color="#54FF00" />
              <Text style={styles.featureText}>Deep Matchup Insights</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={35} color="#54FF00" />
              <Text style={styles.featureText}>Cover Rates for each bet </Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={35} color="#54FF00" />
              <Text style={styles.featureText}>Unlimited Bet Slip Uploads</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={35} color="#54FF00" />
              <Text style={styles.featureText}>Cancel anytime</Text>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Cancel anytime. Subscription automatically renews unless cancelled
              at least 24 hours before the end of the current period.
            </Text>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Fixed Bottom CTA Section */}
      <View style={styles.bottomCTASection}>
        {/* Pricing */}
        <View style={styles.bottomPricingContainer}>
          <Text style={styles.bottomPricingText}>
            3 days free, then $4.99/week
          </Text>
        </View>

        {/* CTA Button */}
        <TouchableOpacity
          style={[
            styles.bottomCtaButton,
            (processingPurchase || !product) && styles.ctaButtonDisabled,
          ]}
          onPress={onPurchasePress}
          disabled={processingPurchase || !product}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={
              processingPurchase || !product
                ? ["rgba(84, 255, 0, 0.3)", "rgba(84, 255, 0, 0.1)"]
                : ["#54FF00", "#32D74B"]
            }
            style={styles.bottomButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {processingPurchase ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="#101113" size="small" />
                <Text style={styles.buttonTextProcessing}>
                  Starting Trial...
                </Text>
              </View>
            ) : (
              <Text style={styles.bottomButtonText}>Try It Free</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// Key improvements for text sizing and formatting:

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#101113",
  },

  // Floating orbs
  floatingOrb: {
    position: "absolute",
    borderRadius: 100,
    backgroundColor: "#54FF00",
  },
  orb1: {
    width: 200,
    height: 200,
    top: 50,
    right: -50,
  },
  orb2: {
    width: 150,
    height: 150,
    bottom: 100,
    left: -75,
  },

  // Scroll view
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 140, // Extra padding for fixed bottom section
  },

  // Header - Improved sizing
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 10, // Reduced from 24
  },
  brandContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  brandLogo: {
    width: 28, // Reduced from 32
    height: 28, // Reduced from 32
    marginRight: 10, // Reduced from 12
    borderRadius: 6, // Reduced from 8
  },
  brandName: {
    fontSize: 20, // Reduced from 22
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.3,
  },
  notNowButton: {
    paddingHorizontal: 12, // Reduced from 16
    paddingVertical: 6, // Reduced from 8
  },
  notNowText: {
    fontSize: 16, // Reduced from 17
    color: "rgba(255, 255, 255, 0.8)", // Made slightly more subtle
    fontWeight: "500", // Reduced from 600
  },

  // Features Section
  featuresSection: {
    paddingHorizontal: 24,
    marginBottom: 32, // Reduced from 40
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    height: 240, // Reduced from 280
  },
  featureCard: {
    borderRadius: 16, // Reduced from 20
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  topRow: {
    marginBottom: 6, // Reduced from 8
  },
  bottomRow: {
    marginTop: 6, // Reduced from 8
  },
  leftCard: {
    width: (width - 64) * 0.32,
    height: 110, // Reduced from 130
  },
  middleCard: {
    width: (width - 64) * 0.36,
    height: 110, // Reduced from 130
  },
  rightCard: {
    width: (width - 64) * 0.32,
    height: 110, // Reduced from 130
  },
  featureGradient: {
    flex: 1,
    position: "relative",
  },
  featureImage: {
    width: "100%",
    height: "100%",
    opacity: 0.8,
  },
  featureOverlay: {
    position: "absolute",
    bottom: 8, // Reduced from 12
    left: 8, // Reduced from 12
    right: 8, // Reduced from 12
  },
  featureTitle: {
    fontSize: 11, // Reduced from 13
    fontWeight: "600", // Reduced from 700
    color: "#FFFFFF",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },

  // Content Section - Major improvements
  contentSection: {
    paddingHorizontal: 24,
    alignItems: "center", // Center align all content
  },
  mainTitle: {
    fontSize: 36, // Reduced from 34
    fontWeight: "800", // Increased weight for impact
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: 39, // Reduced from 42
    marginBottom: 38, // Reduced from 16
    letterSpacing: -0.4, // Slightly tighter
    maxWidth: width * 0.85, // Limit width for better readability
  },
  subtitle: {
    fontSize: 16, // Reduced from 17
    top: 10,
    color: "rgba(255, 255, 255, 0.75)", // Slightly more subtle
    textAlign: "center",
    lineHeight: 22, // Reduced from 25
    marginBottom: 40, // Reduced from 32
    paddingHorizontal: 8, // Reduced from 16
    maxWidth: width * 0.9, // Limit width
  },

  // Features List - Better spacing and sizing
  featuresList: {
    marginBottom: 10, // Increased back to 40 for more space
    width: "100%",
    maxWidth: width * 0.85, // Limit width
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30, // Increased from 14 for more spacing
    paddingLeft: 0, // Removed left padding
    paddingHorizontal: 4, // Add horizontal padding
  },
  featureText: {
    fontSize: 18, // Increased from 15 to make text bigger
    color: "rgba(255, 255, 255, 0.9)",
    marginLeft: 10, // Reduced from 12
    fontWeight: "500",
    flex: 1, // Allow text to wrap properly
    lineHeight: 24, // Increased line height for bigger text
  },

  // Footer - Better positioning
  footer: {
    paddingHorizontal: 12, // Reduced from 16
    marginBottom: 16, // Reduced from 20
    maxWidth: width * 0.9, // Limit width
  },
  footerText: {
    fontSize: 16, // Reduced from 13
    color: "rgba(255, 255, 255, 0.5)",
    textAlign: "center",
    lineHeight: 20, // Reduced from 18
  },

  // Fixed Bottom CTA Section - No changes needed, it's working well
  bottomCTASection: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(16, 17, 19, 0.98)",
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 34,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 12,
  },
  bottomPricingContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  bottomPricingText: {
    fontSize: 16,
    color: "white",
    fontWeight: "500",
  },
  bottomCtaButton: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#54FF00",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  bottomButtonGradient: {
    paddingVertical: 20,
    paddingHorizontal: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  bottomButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#101113",
    letterSpacing: 0.3,
  },
  ctaButtonDisabled: {
    opacity: 0.7,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  buttonTextProcessing: {
    fontSize: 18,
    fontWeight: "700",
    color: "#101113",
    marginLeft: 8,
  },
});
