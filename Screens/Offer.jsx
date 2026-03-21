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
  Linking,
} from "react-native";
import React, { useEffect, useState, useRef } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Purchases from "react-native-purchases";
import { supabase } from "../Services/supabase";
import {
  fetchAndLogPurchasesProducts,
  resolveDefaultSubscriptionPackages,
} from "../Services/fetchAndLogPurchasesProducts";

const { width, height } = Dimensions.get("window");

/* ------------------------------
   Hook: fetch offerings & packages
   ------------------------------ */
const usePurchase = () => {
  const [packages, setPackages] = useState({
    weekly: null,
    monthly: null,
  });
  const [processingPurchase, setProcessingPurchase] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const offerings = await fetchAndLogPurchasesProducts();
      const { weeklyPkg, monthlyPkg } =
        resolveDefaultSubscriptionPackages(offerings);

      setPackages({
        weekly: weeklyPkg,
        monthly: monthlyPkg,
      });

      // warning if none found
      if (!weeklyPkg && !monthlyPkg) {
        Alert.alert(
          "Error",
          "No subscription packages found. Please try again later."
        );
      }
    } catch (error) {
      console.error("Error fetching offerings:", error);
      Alert.alert(
        "Error",
        "Failed to load subscription options. Please try again."
      );
    }
  };

  const handlePurchase = async (selectedPackage) => {
    if (!selectedPackage) {
      Alert.alert("Error", "No subscription package selected.");
      return false;
    }

    try {
      setProcessingPurchase(true);
      const { customerInfo } = await Purchases.purchasePackage(selectedPackage);
      // activeSubscriptions presence check
      const isActive =
        customerInfo?.activeSubscriptions &&
        customerInfo.activeSubscriptions.length > 0;
      return isActive;
    } catch (error) {
      // RevenueCat error object shape: error.userCancelled
      if (!(error && error.userCancelled)) {
        console.error("Purchase error:", error);
        Alert.alert("Error", "Failed to process purchase. Please try again.");
      }
      return false;
    } finally {
      setProcessingPurchase(false);
    }
  };

  const restorePurchases = async () => {
    try {
      setProcessingPurchase(true);
      const info = await Purchases.restorePurchases();
      setProcessingPurchase(false);
      return info;
    } catch (err) {
      setProcessingPurchase(false);
      console.error("Restore error:", err);
      Alert.alert("Error", "Failed to restore purchases.");
      return null;
    }
  };

  return {
    packages,
    processingPurchase,
    handlePurchase,
    restorePurchases,
  };
};

/* ------------------------------
   FloatingOrbs (kept from you)
   ------------------------------ */
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

/* ------------------------------
   Utility: safe localized price extraction
   RevenueCat product fields differ by platform, try a few keys.
   ------------------------------ */
const getLocalizedPrice = (pkg) => {
  if (!pkg || !pkg.product) return "";
  const product = pkg.product;
  // common possibilities:
  if (product.localizedPrice) return product.localizedPrice;
  if (product.priceString) return product.priceString;
  if (product.price && product.currency) {
    return `${product.price} ${product.currency}`;
  }
  // fallback
  return product.title || "";
};

const getSubtitleForPackage = (pkg) => {
  if (!pkg || !pkg.product) return "";
  // best effort: use subscription period or serverDescription on offering
  const p = pkg.product;
  if (p.subscriptionPeriod) {
    return p.subscriptionPeriod;
  }
  if (pkg?.offering?.serverDescription) {
    return pkg.offering.serverDescription;
  }
  // fallback: try to infer
  return pkg.packageType ? pkg.packageType.toLowerCase() : "";
};

/* ------------------------------
   Main Component — Redesigned paywall UI
   ------------------------------ */
export default function Trial({ navigation, route }) {
  const { packages, processingPurchase, handlePurchase, restorePurchases } =
    usePurchase();
  const email = route?.params?.email || "";

  const [selectedPlanKey, setSelectedPlanKey] = useState("per week"); // 'weekly' | 'monthly'

  // entrance animation (kept)
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // pick the package object based on selection
  const selectedPackage =
    selectedPlanKey === "per week" ? packages.weekly : packages.monthly;

  const onPurchasePress = async () => {
    try {
      // If product isn't ready
      if (!selectedPackage) {
        Alert.alert(
          "Not available",
          "Selected plan is not available right now."
        );
        return;
      }

      // Trigger purchase via hook
      const success = await handlePurchase(selectedPackage);

      // fetch customer info to get user id for DB
      let customerInfo;
      try {
        customerInfo = await Purchases.getCustomerInfo();
      } catch (err) {
        console.error("Error getting customer info after purchase:", err);
      }

      const userId = customerInfo?.originalAppUserId || null;

      if (success) {
        // store trial / subscription in supabase (existing logic)
        const { error } = await supabase.from("trials").insert({
          email: email,
          userid: userId,
        });
        if (error) {
          console.error("Error inserting into trials table:", error);
        }
        navigation.navigate("MainTabs");
      }
    } catch (err) {
      console.error("Error in onPurchasePress:", err);
    }
  };

  const onRestorePress = async () => {
    const info = await restorePurchases();
    // if active subscriptions exist, navigate
    if (info?.activeSubscriptions && info.activeSubscriptions.length > 0) {
      navigation.navigate("MainTabs");
    } else {
      Alert.alert("Restore", "No active subscriptions found.");
    }
  };

  // small helper to render a plan card
  const PlanCard = ({ pkg, title, planKey }) => {
    const localizedPrice = getLocalizedPrice(pkg);
    const headlinePrice =
      planKey === "per month" ? "$9.99" : localizedPrice || title;

    const planSubtitleText = !pkg
      ? "Not available"
      : planKey === "per week"
        ? "No free trial"
        : planKey === "per month"
          ? pkg?.product?.pricePerWeekString
            ? `${pkg.product.pricePerWeekString} avg per week`
            : "Includes 3-day free trial"
          : pkg?.packageType
            ? pkg.packageType.toLowerCase() === "annual"
              ? "Billed Annually"
              : pkg.packageType.toLowerCase()
            : getSubtitleForPackage(pkg);

    const selected = selectedPlanKey === planKey;

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        style={[
          styles.planCard,
          selected ? styles.planCardSelected : styles.planCardDefault,
        ]}
        onPress={() => setSelectedPlanKey(planKey)}
      >
        <View style={styles.planInner}>
          <View>
            <Text style={styles.planPrice}>
              {headlinePrice}{" "}
              {planKey === "per month"
                ? "Monthly with trial"
                : planKey === "per week"
                ? "PerWeekNoTrial"
                : ""}
            </Text>
            <Text style={styles.planSubtitle}>{planSubtitleText}</Text>
          </View>

          {selected && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Selected</Text>
            </View>
          )}
        </View>

        {/* Banner for Monthly with trial plan */}
        {planKey === "per month" && (
          <View style={styles.savingsBanner}>
            <Text style={styles.savingsText}>Free trial</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <FloatingOrbs />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <Image
            source={require("../assets/Activity.png")}
            style={styles.heroIcon}
          />
          <Text style={styles.heroTitle}>Unlock Unlimited Insights</Text>
          <View style={styles.benefits}>
            <View style={styles.benefitRow}>
              <Ionicons name="checkmark-circle" size={20} color="#2bb24a" />
              <Text style={styles.benefitText}>Advanced AI bet analysis</Text>
            </View>
            <View style={styles.benefitRow}>
              <Ionicons name="checkmark-circle" size={20} color="#2bb24a" />
              <Text style={styles.benefitText}>Deep Matchup Insights</Text>
            </View>
            <View style={styles.benefitRow}>
              <Ionicons name="checkmark-circle" size={20} color="#2bb24a" />
              <Text style={styles.benefitText}>Cancel anytime</Text>
            </View>
          </View>
        </View>

        <View style={styles.plansSection}>
          {/* Annual / Monthly - use your offerings */}
          <PlanCard
            pkg={packages.monthly}
            title={"$9.99"}
            planKey={"per month"}
          />

          <PlanCard
            pkg={packages.weekly}
            title={"$2.99 per week"}
            planKey={"per week"}
          />

          {/* Purchase CTA */}
          <TouchableOpacity
            style={[
              styles.ctaButton,
              (!selectedPackage || processingPurchase) && { opacity: 0.7 },
            ]}
            onPress={onPurchasePress}
            disabled={!selectedPackage || processingPurchase}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={["#2bb24a", "#1fa12b"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.ctaGradient}
            >
              {processingPurchase ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator
                    style={{ marginRight: 10 }}
                    size="small"
                    color="white"
                  />
                  <Text style={styles.ctaText}>Processing...</Text>
                </View>
              ) : (
                <Text style={styles.ctaText}>Continue</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Footer Links */}
          <View style={styles.footerLinks}>
            <TouchableOpacity onPress={onRestorePress}>
              <Text style={styles.footerLinkText}>Restore</Text>
            </TouchableOpacity>

            <View style={styles.dot} />

            <TouchableOpacity onPress={() => navigation.navigate("Terms")}>
              <Text style={styles.footerLinkText}>Terms of Use</Text>
            </TouchableOpacity>

            <View style={styles.dot} />

            <TouchableOpacity onPress={() => navigation.navigate("Privacy")}>
              <Text style={styles.footerLinkText}>Privacy Policy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ------------------------------
   Styles tuned to resemble screenshot
   ------------------------------ */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#101113",
  },

  floatingOrb: {
    position: "absolute",
    borderRadius: 100,
    backgroundColor: "#54FF00",
    opacity: 0.15,
  },
  orb1: {
    width: 100,
    height: 100,
    top: 40,
    right: -60,
  },
  orb2: {
    width: 150,
    height: 150,
    bottom: 10,
    left: -50,
  },

  scrollView: {
    flex: 1,
    margin: 5,
  },
  scrollContent: {
    paddingBottom: 48,
    paddingHorizontal: 20,
  },

  header: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  topBrand: {
    flexDirection: "row",
    alignItems: "center",
  },
  brandLogo: {
    width: 42,
    height: 42,
    borderRadius: 10,
    marginRight: 12,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  closeBtn: {
    backgroundColor: "rgba(26, 24, 27, 0.8)",
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(84, 255, 0, 0.15)",
  },

  hero: {
    alignItems: "center",
    marginTop: 20,
  },
  heroIcon: {
    width: 64,
    height: 64,
    marginBottom: 54,
    top: 10,
  },
  heroTitle: {
    fontSize: 27,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 25,
    color: "#FFFFFF",
  },
  benefits: {
    width: "100%",
    paddingHorizontal: 20,
  },
  benefitRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  benefitText: {
    marginLeft: 12,
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.7)",
    fontWeight: "600",
  },

  plansSection: {
    marginTop: 26,
    paddingHorizontal: 0,
    paddingBottom: 60,
  },

  planCard: {
    backgroundColor: "rgba(26, 24, 27, 0.8)",
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderWidth: 2,
    backdropFilter: "blur(10px)",
    position: "relative",
  },
  savingsBanner: {
    position: "absolute",
    top: -10,
    left: "80%",
    transform: [{ translateX: -40 }],
    backgroundColor: "red",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    zIndex: 1,
  },
  savingsText: {
    color: "white",
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
  },
  planCardDefault: {
    borderColor: "rgba(84, 255, 0, 0.15)",
  },
  planCardSelected: {
    borderColor: "#54FF00",
    backgroundColor: "rgba(84, 255, 0, 0.05)",
  },
  planInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  planPrice: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  planSubtitle: {
    fontSize: 18,
    color: "white",
    marginTop: 6,
    fontWeight: "500",
  },
  badge: {
    backgroundColor: "#54FF00",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 18,
  },
  badgeText: {
    color: "#101113",
    fontWeight: "700",
    fontSize: 12,
  },

  ctaButton: {
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 18,
  },
  ctaGradient: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#54FF00",
  },
  ctaText: {
    color: "white",
    fontWeight: "800",
    fontSize: 18,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  footerLinks: {
    marginTop: 18,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  footerLinkText: {
    color: "#54FF00",
    fontSize: 14,
    marginHorizontal: 6,
    fontWeight: "600",
  },
  dot: {
    width: 6,
    height: 6,
    backgroundColor: "rgba(84, 255, 0, 0.15)",
    borderRadius: 3,
    marginHorizontal: 4,
    alignSelf: "center",
  },
});
