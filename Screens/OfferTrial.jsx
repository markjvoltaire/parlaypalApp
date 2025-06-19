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
} from "react-native";
import React, { useEffect, useState, useRef } from "react";
import { LinearGradient } from "expo-linear-gradient";
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

      // Iterate through all offerings to find the specific weekly package
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
            break; // Found the weekly package, no need to look further
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

// Main component
export default function Trial({ navigation, route }) {
  const { product, processingPurchase, handlePurchase } = usePurchase();

  const email = route?.params?.email || "";

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Start animations on mount
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
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // Start pulse animation for the button
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.03,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    return () => pulseAnimation.stop();
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
    <LinearGradient
      colors={["#0F0C29", "#24243e", "#302b63"]}
      style={styles.container}
    >
      {/* Header Section */}
      <Animated.View
        style={[
          styles.headerSection,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.badgeContainer}>
          {/* <LinearGradient
            colors={["#667eea", "#764ba2"]}
            style={styles.badge}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.badgeText}>✨ LIMITED TIME</Text>
          </LinearGradient> */}
        </View>

        <Text style={styles.mainTitle}>
          Experience <Text style={styles.brandText}>Parlay Pal</Text>
        </Text>

        <View style={styles.offerContainer}>
          <Text style={styles.offerText}>Get </Text>

          <Text style={styles.freeText}>3 days FREE</Text>
        </View>

        <Text style={styles.emailHeadline}>
          ✉️ We'll email you a day before your trial ends.
        </Text>
      </Animated.View>

      {/* Phone Image Section */}
      <Animated.View
        style={[
          styles.phoneSection,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.glassContainer}>
          <Image
            source={require("../assets/iphone1.png")}
            style={styles.phoneImage}
            resizeMode="contain"
          />
        </View>
      </Animated.View>

      {/* Bottom Section */}
      <Animated.View
        style={[
          styles.bottomSection,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.pricingContainer}>
          <Text style={styles.priceText}>Then $4.99/week</Text>
          <Text style={styles.priceSubtext}>
            Cancel anytime • No commitment
          </Text>
        </View>

        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <TouchableOpacity
            style={[
              styles.ctaButton,
              (processingPurchase || !product) && styles.ctaButtonDisabled,
            ]}
            onPress={onPurchasePress}
            disabled={processingPurchase || !product}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={
                processingPurchase || !product
                  ? ["#666", "#444"]
                  : ["#667eea", "#764ba2", "#6B73FF"]
              }
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {processingPurchase ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator color="#fff" size="small" />
                  <Text style={styles.buttonText}>Processing...</Text>
                </View>
              ) : (
                <View style={styles.buttonContent}>
                  <Text style={styles.buttonText}>Start Free Trial</Text>
                  <Text style={styles.buttonSubtext}>No charge today</Text>
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        <Text style={styles.disclaimerText}>
          Auto-renews unless cancelled 24h before trial ends
        </Text>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: height * 0.06,
    paddingBottom: height * 0.04,
    paddingHorizontal: width * 0.06,
  },
  headerSection: {
    alignItems: "center",
    flex: 0.25,
    justifyContent: "center",
  },
  badgeContainer: {
    marginBottom: height * 0.015,
  },
  badge: {
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.008,
    borderRadius: 20,
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  badgeText: {
    color: "#fff",
    fontSize: width * 0.032,
    fontWeight: "700",
    letterSpacing: 1,
  },
  mainTitle: {
    color: "#fff",
    fontSize: width * 0.07,
    fontWeight: "300",
    textAlign: "center",
    marginBottom: height * 0.01,
    lineHeight: width * 0.08,
  },
  brandText: {
    fontWeight: "700",
    color: "#667eea",
  },
  offerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  offerText: {
    color: "#fff",
    fontSize: width * 0.05,
    fontWeight: "400",
  },
  freeTextContainer: {
    paddingHorizontal: width * 0.025,
    paddingVertical: height * 0.004,
    borderRadius: 10,
    marginLeft: width * 0.015,
  },
  freeText: {
    color: "#fff",
    fontSize: width * 0.05,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  phoneSection: {
    flex: 0.5,
    alignItems: "center",
    justifyContent: "center",
  },
  glassContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 20,
    padding: width * 0.03,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  phoneImage: {
    width: width * 0.68,
    height: height * 0.38,
  },
  bottomSection: {
    flex: 0.25,
    justifyContent: "space-between",
  },
  pricingContainer: {
    alignItems: "center",
    marginBottom: height * 0.015,
  },
  priceText: {
    color: "#fff",
    fontSize: width * 0.045,
    fontWeight: "600",
    marginBottom: height * 0.005,
  },
  priceSubtext: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: width * 0.032,
    fontWeight: "400",
  },
  ctaButton: {
    width: "100%",
    marginBottom: height * 0.015,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  ctaButtonDisabled: {
    shadowOpacity: 0.2,
  },
  buttonGradient: {
    paddingVertical: height * 0.018,
    paddingHorizontal: width * 0.06,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonContent: {
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: width * 0.042,
    fontWeight: "700",
    letterSpacing: 0.5,
    paddingLeft: 10,
  },
  buttonSubtext: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: width * 0.03,
    fontWeight: "400",
    marginTop: height * 0.003,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  emailHeadline: {
    color: "#fff",
    fontSize: width * 0.038,
    fontWeight: "700",
    textAlign: "center",
    marginTop: height * 0.02,
    opacity: 0.9,
    lineHeight: width * 0.045,
    top: 15,
  },
  disclaimerText: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: width * 0.026,
    textAlign: "center",
    fontWeight: "300",
    lineHeight: width * 0.032,
  },
});
