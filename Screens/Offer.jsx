import LottieView from "lottie-react-native";
import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Dimensions,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Purchases from "react-native-purchases";

const { width, height } = Dimensions.get("window");

// Configure RevenueCat
Purchases.configure({ apiKey: "appl_uPPCiaHpkTLNkrlhOikrUMWLaBH" });

// Floating decorative dots component
const FloatingDots = () => {
  const dots = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    size: Math.random() * 6 + 4,
    opacity: Math.random() * 0.6 + 0.2,
    left: Math.random() * width,
    top: Math.random() * height,
  }));

  return (
    <View style={styles.floatingDotsContainer}>
      {dots.map((dot) => (
        <View
          key={dot.id}
          style={[
            styles.floatingDot,
            {
              width: dot.size,
              height: dot.size,
              opacity: dot.opacity,
              left: dot.left,
              top: dot.top,
            },
          ]}
        />
      ))}
    </View>
  );
};

export default function Offer({ navigation }) {
  const [products, setProducts] = useState([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [processingPurchase, setProcessingPurchase] = useState(false);
  const [processingRestore, setProcessingRestore] = useState(false);
  const [hasUsedFreeTrial, setHasUsedFreeTrial] = useState(false);

  const handlePurchase = async (packageToPurchase) => {
    try {
      setProcessingPurchase(true);
      const { customerInfo } = await Purchases.purchasePackage(
        packageToPurchase
      );
      if (
        customerInfo.activeSubscriptions &&
        customerInfo.activeSubscriptions.length > 0
      ) {
        setIsSubscribed(true);
        handleNewSubscription();
      }
    } catch (error) {
      if (!error.userCancelled) {
        Alert.alert(
          "Error",
          "There was a problem with your purchase. Please try again."
        );
      }
    } finally {
      setProcessingPurchase(false);
    }
  };

  const handleNewSubscription = () => {
    Alert.alert(
      "Subscription Activated",
      "Your premium access is now unlocked. Enjoy!",
      [
        {
          text: "Continue",
          onPress: () => navigation.navigate("AccessGranted"),
        },
      ],
      { cancelable: false }
    );
  };

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

  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      try {
        setLoading(true);
        const customerInfo = await Purchases.getCustomerInfo();

        if (customerInfo.originalPurchaseDate !== null) {
          setHasUsedFreeTrial(true);
        } else {
          setHasUsedFreeTrial(false);
        }

        if (
          customerInfo.activeSubscriptions &&
          customerInfo.activeSubscriptions.length > 0
        ) {
          setIsSubscribed(true);
        } else {
          setIsSubscribed(false);
        }

        const offerings = await Purchases.getOfferings();
        if (
          offerings.current !== null &&
          offerings.current.availablePackages.length > 0
        ) {
          setProducts(offerings.current.availablePackages);
        }
      } catch (error) {
        console.error("Error fetching customer info:", error);
      } finally {
        setLoading(false);
      }
    };

    checkSubscriptionStatus();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <FloatingDots />
        <View style={styles.loadingContainer}>
          <View style={styles.loadingSpinner}>
            <ActivityIndicator size="large" color="#54FF00" />
          </View>
          <Text style={styles.loadingText}>Loading premium features...</Text>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FloatingDots />

      {/* Main Content */}
      <View style={styles.content}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>Unlock AI-Powered</Text>
          <Text style={styles.heroTitleAccent}>Betting Intelligence</Text>
          <Text style={styles.heroSubtitle}>
            Transform your betting strategy with advanced analytics
          </Text>
        </View>

        {/* Premium Features Card */}
        <View style={styles.featuresCard}>
          <LinearGradient
            colors={["rgba(84, 255, 0, 0.1)", "rgba(84, 255, 0, 0.05)"]}
            style={styles.featuresGradient}
          >
            <Text style={styles.featuresTitle}>Premium Features</Text>

            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <Text style={styles.featureIconText}>∞</Text>
                </View>
                <Text style={styles.featureText}>
                  Unlimited bet slip analysis
                </Text>
              </View>

              <View style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <Text style={styles.featureIconText}>⚡</Text>
                </View>
                <Text style={styles.featureText}>
                  Real-time odds optimization
                </Text>
              </View>

              <View style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <Text style={styles.featureIconText}>📊</Text>
                </View>
                <Text style={styles.featureText}>Advanced risk assessment</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Pricing Card */}
        <View style={styles.pricingCard}>
          <LinearGradient
            colors={["rgba(26, 24, 27, 0.9)", "rgba(16, 17, 19, 0.95)"]}
            style={styles.pricingGradient}
          >
            {!hasUsedFreeTrial && (
              <View style={styles.trialBadge}>
                <Text style={styles.trialBadgeText}>3-DAY FREE TRIAL</Text>
              </View>
            )}

            <Text style={styles.pricingAmount}>$4.99</Text>
            <Text style={styles.pricingPeriod}>per week</Text>

            <Text style={styles.pricingSubtext}>
              Billed weekly after trial • Cancel anytime
            </Text>
          </LinearGradient>
        </View>

        {/* CTA Button */}
        <TouchableOpacity
          style={[
            styles.ctaButton,
            processingPurchase && styles.ctaButtonDisabled,
          ]}
          disabled={processingPurchase}
          onPress={() => {
            if (products.length > 0) {
              handlePurchase(products[0]);
            }
          }}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={["#54FF00", "#45D400"]}
            style={styles.ctaGradient}
          >
            {processingPurchase ? (
              <View style={styles.ctaContent}>
                <ActivityIndicator size="small" color="#101113" />
                <Text style={styles.ctaTextProcessing}>Processing...</Text>
              </View>
            ) : (
              <Text style={styles.ctaText}>
                {hasUsedFreeTrial ? "Start Premium Access" : "Begin Free Trial"}
              </Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Footer Actions */}
        <View style={styles.footerActions}>
          <TouchableOpacity
            style={styles.restoreButton}
            disabled={processingRestore}
            onPress={handleRestorePurchases}
          >
            {processingRestore ? (
              <View style={styles.restoreContent}>
                <ActivityIndicator size="small" color="#54FF00" />
                <Text style={styles.restoreTextProcessing}>Restoring...</Text>
              </View>
            ) : (
              <Text style={styles.restoreText}>Restore Purchases</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.footerNote}>
            Premium features unlock instantly
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#101113",
  },

  // Floating Decorative Elements
  floatingDotsContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  floatingDot: {
    position: "absolute",
    backgroundColor: "#54FF00",
    borderRadius: 50,
  },

  // Loading State
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    zIndex: 1,
  },
  loadingSpinner: {
    backgroundColor: "rgba(26, 24, 27, 0.8)",
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(84, 255, 0, 0.2)",
  },
  loadingText: {
    marginTop: 24,
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    fontWeight: "600",
    letterSpacing: 0.5,
  },

  // Main Content
  content: {
    flex: 1,
    padding: 24,
    zIndex: 1,
  },

  // Hero Section
  heroSection: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 24,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: 32,
    letterSpacing: 0.5,
  },
  heroTitleAccent: {
    fontSize: 26,
    fontWeight: "800",
    color: "#54FF00",
    textAlign: "center",
    lineHeight: 32,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
    fontWeight: "500",
    letterSpacing: 0.3,
    marginTop: 4,
  },

  // Features Card
  featuresCard: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(84, 255, 0, 0.2)",
  },
  featuresGradient: {
    padding: 16,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  featureIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "rgba(84, 255, 0, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "rgba(84, 255, 0, 0.3)",
  },
  featureIconText: {
    fontSize: 16,
    color: "#54FF00",
    fontWeight: "600",
  },
  featureText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "500",
    letterSpacing: 0.3,
    flex: 1,
  },

  // Pricing Card
  pricingCard: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(84, 255, 0, 0.3)",
  },
  pricingGradient: {
    padding: 16,
    alignItems: "center",
  },
  trialBadge: {
    backgroundColor: "#54FF00",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  trialBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#101113",
    letterSpacing: 1,
  },
  pricingAmount: {
    fontSize: 36,
    fontWeight: "800",
    color: "#54FF00",
    letterSpacing: 0.5,
  },
  pricingPeriod: {
    fontSize: 16,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  pricingSubtext: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
    textAlign: "center",
    fontWeight: "500",
    letterSpacing: 0.2,
  },

  // CTA Button
  ctaButton: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 20,
    shadowColor: "#54FF00",
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  ctaButtonDisabled: {
    opacity: 0.7,
  },
  ctaGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  ctaContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  ctaText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#101113",
    letterSpacing: 0.5,
  },
  ctaTextProcessing: {
    fontSize: 14,
    fontWeight: "700",
    color: "#101113",
    marginLeft: 8,
    letterSpacing: 0.3,
  },

  // Footer Actions
  footerActions: {
    alignItems: "center",
    gap: 16,
  },
  restoreButton: {
    padding: 12,
  },
  restoreContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  restoreText: {
    fontSize: 16,
    color: "#54FF00",
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  restoreTextProcessing: {
    fontSize: 14,
    color: "#54FF00",
    fontWeight: "600",
    marginLeft: 8,
    letterSpacing: 0.2,
  },
  footerNote: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.5)",
    fontWeight: "500",
    letterSpacing: 0.2,
  },
});
