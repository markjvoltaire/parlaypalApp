import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
  Animated,
  Platform,
  Linking,
  StatusBar,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
// import Purchases from "react-native-purchases";

const ANIMATION_DURATION = 500;
const ANIMATION_DELAY = 100;

const AnimatedSection = ({ children, index }) => {
  const slideAnim = useRef(new Animated.Value(50)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: ANIMATION_DURATION,
        delay: index * ANIMATION_DELAY,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: ANIMATION_DURATION,
        delay: index * ANIMATION_DELAY,
        useNativeDriver: true,
      }),
    ]).start();
  }, [slideAnim, fadeAnim, index]);

  return (
    <Animated.View
      style={{
        transform: [{ translateY: slideAnim }],
        opacity: fadeAnim,
      }}
    >
      {children}
    </Animated.View>
  );
};

export default function Profile({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [subscriptionInfo, setSubscriptionInfo] = useState(null);

  // useEffect(() => {
  //   fetchSubscriptionInfo();
  // }, []);

  // // Fetch subscription details from RevenueCat
  // const fetchSubscriptionInfo = async () => {
  //   try {
  //     const customerInfo = await Purchases.getCustomerInfo();
  //     setSubscriptionInfo({
  //       status:
  //         customerInfo.activeSubscriptions.length > 0 ? "Active" : "Inactive",
  //       plan: customerInfo.activeSubscriptions[0] || "No active plan",
  //       renewalDate: customerInfo.latestExpirationDate
  //         ? new Date(customerInfo.latestExpirationDate).toLocaleDateString()
  //         : "N/A",
  //     });
  //   } catch (error) {
  //     Alert.alert("Error", "Failed to fetch subscription information");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // // Restore Purchases logic
  // const handleRestorePurchases = async () => {
  //   try {
  //     setLoading(true);
  //     const customerInfo = await Purchases.restorePurchases();

  //     if (
  //       customerInfo.activeSubscriptions &&
  //       customerInfo.activeSubscriptions.length > 0
  //     ) {
  //       // Navigate or unlock premium features
  //       navigation.navigate("AccessGranted");
  //       Alert.alert("Success", "Your purchases have been restored!");
  //     } else {
  //       Alert.alert(
  //         "No Purchases Found",
  //         "No active subscriptions were found to restore."
  //       );
  //     }
  //   } catch (error) {
  //     Alert.alert("Error", "Failed to restore purchases. Please try again.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // Open OS-specific subscription settings
  const openSubscriptionSettings = async () => {
    try {
      const url = Platform.select({
        ios: "itms-apps://apps.apple.com/account/subscriptions",
        android: "https://play.google.com/store/account/subscriptions",
        default: "https://play.google.com/store/account/subscriptions",
      });

      const canOpen = await Linking.canOpenURL(url);
      if (!canOpen) throw new Error("Cannot open URL");

      await Linking.openURL(url);
    } catch (error) {
      Alert.alert(
        "Error",
        "Couldn't open subscription settings. Please check your subscriptions in your device's app store manually.",
        [{ text: "OK", onPress: () => console.log("OK Pressed") }]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#101426" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Content */}
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Section */}
        <AnimatedSection index={0}>
          <View style={styles.profileContainer}>
            <View style={styles.profileImageContainer}>
              <Ionicons name="person" size={40} color="#fff" />
            </View>
            <Text style={styles.welcomeText}>Welcome to Parlay Pal</Text>
            {subscriptionInfo?.status === "Active" ? (
              <View style={styles.premiumBadge}>
                <MaterialCommunityIcons
                  name="crown"
                  size={16}
                  color="#FFD700"
                />
                <Text style={styles.premiumText}>Premium</Text>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => navigation.navigate("Showcase")}
                style={styles.upgradeBadge}
              >
                <MaterialCommunityIcons
                  name="crown-outline"
                  size={16}
                  color="#FFD700"
                />
                <Text style={styles.upgradeText}>Upgrade to Premium</Text>
              </TouchableOpacity>
            )}
          </View>
        </AnimatedSection>

        {/* Subscription Section */}
        <AnimatedSection index={1}>
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Subscription Details</Text>

            {loading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>
                  Loading subscription info...
                </Text>
              </View>
            ) : (
              <>
                <View style={styles.row}>
                  <View style={styles.rowIconContainer}>
                    <Ionicons
                      name="bookmark-outline"
                      size={20}
                      color="#7789FF"
                    />
                  </View>
                  <View style={styles.rowContent}>
                    <Text style={styles.rowLabel}>Status</Text>
                    <Text
                      style={[
                        styles.rowValue,
                        {
                          color:
                            subscriptionInfo?.status === "Active"
                              ? "#52C41A"
                              : "#FF4D4F",
                        },
                      ]}
                    >
                      {subscriptionInfo?.status}
                    </Text>
                  </View>
                </View>
                <View style={styles.row}>
                  <View style={styles.rowIconContainer}>
                    <Ionicons name="gift-outline" size={20} color="#7789FF" />
                  </View>
                  <View style={styles.rowContent}>
                    <Text style={styles.rowLabel}>Current Plan</Text>
                    <Text style={styles.rowValue}>
                      {subscriptionInfo?.plan}
                    </Text>
                  </View>
                </View>

                {/* Manage Subscription Row */}
                <TouchableOpacity
                  style={styles.row}
                  onPress={openSubscriptionSettings}
                >
                  <View style={styles.rowIconContainer}>
                    <Ionicons name="card-outline" size={20} color="#7789FF" />
                  </View>
                  <View style={styles.rowContent}>
                    <Text style={styles.rowLabel}>Manage Subscription</Text>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="#8A94B0"
                    />
                  </View>
                </TouchableOpacity>

                {/* Restore Purchase Row */}
                <TouchableOpacity
                  style={styles.row}
                  onPress={handleRestorePurchases}
                >
                  <View style={styles.rowIconContainer}>
                    <Ionicons
                      name="refresh-circle-outline"
                      size={20}
                      color="#7789FF"
                    />
                  </View>
                  <View style={styles.rowContent}>
                    <Text style={styles.rowLabel}>Restore Purchase</Text>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="#8A94B0"
                    />
                  </View>
                </TouchableOpacity>
              </>
            )}
          </View>
        </AnimatedSection>

        {/* Account Settings */}
        <AnimatedSection index={2}>
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Account Settings</Text>

            <TouchableOpacity
              onPress={() => navigation.navigate("Help")}
              style={styles.row}
            >
              <View style={styles.rowIconContainer}>
                <Ionicons
                  name="help-circle-outline"
                  size={20}
                  color="#7789FF"
                />
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.rowLabel}>Help & Support</Text>
                <Ionicons name="chevron-forward" size={20} color="#8A94B0" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate("Privacy")}
              style={styles.row}
            >
              <View style={styles.rowIconContainer}>
                <Ionicons
                  name="document-text-outline"
                  size={20}
                  color="#7789FF"
                />
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.rowLabel}>Privacy Policy</Text>
                <Ionicons name="chevron-forward" size={20} color="#8A94B0" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate("Terms")}
              style={styles.row}
            >
              <View style={styles.rowIconContainer}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={20}
                  color="#7789FF"
                />
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.rowLabel}>Terms of Service</Text>
                <Ionicons name="chevron-forward" size={20} color="#8A94B0" />
              </View>
            </TouchableOpacity>
          </View>
        </AnimatedSection>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Parlay Pal v1.0.0</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#101426",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  profileContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  profileImageContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#4F63E8",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 12,
  },
  premiumBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 215, 0, 0.1)",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  premiumText: {
    color: "#FFD700",
    fontWeight: "600",
    marginLeft: 5,
  },
  upgradeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 215, 0, 0.1)",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  upgradeText: {
    color: "#FFD700",
    fontWeight: "600",
    marginLeft: 5,
  },
  sectionCard: {
    backgroundColor: "#1C2135",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 16,
  },
  loadingContainer: {
    alignItems: "center",
    padding: 16,
  },
  loadingText: {
    color: "#8A94B0",
    fontSize: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  rowIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(79, 99, 232, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  rowContent: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rowLabel: {
    fontSize: 16,
    color: "#ffffff",
  },
  rowValue: {
    fontSize: 16,
    color: "#8A94B0",
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
    paddingVertical: 16,
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    color: "#8A94B0",
  },
});
