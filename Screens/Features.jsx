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
} from "react-native";
import Purchases from "react-native-purchases";

// Configure RevenueCat (update your public API key as needed)
Purchases.configure({ apiKey: "appl_uPPCiaHpkTLNkrlhOikrUMWLaBH" });

export default function Features({ navigation }) {
  const [products, setProducts] = useState([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [processingPurchase, setProcessingPurchase] = useState(false);
  const [processingRestore, setProcessingRestore] = useState(false);

  const handlePurchase = async (packageToPurchase) => {
    try {
      setProcessingPurchase(true);
      const { customerInfo } = await Purchases.purchasePackage(
        packageToPurchase
      );
      // Check if the user is now subscribed
      if (
        customerInfo.activeSubscriptions &&
        customerInfo.activeSubscriptions.length > 0
      ) {
        setIsSubscribed(true);
        // Trigger the new subscription handler
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

  // Refactored function to handle new subscription success
  const handleNewSubscription = () => {
    Alert.alert(
      "Subscription Successful",
      "Thank you for subscribing!",
      [
        {
          text: "OK",
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

  // Fetch products from RevenueCat when component mounts
  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      try {
        setLoading(true);
        const customerInfo = await Purchases.getCustomerInfo();
        console.log("Customer Info:", customerInfo);

        // Check for active subscriptions
        if (
          customerInfo.activeSubscriptions &&
          customerInfo.activeSubscriptions.length > 0
        ) {
          console.log("User is currently subscribed.");
          setIsSubscribed(true);
        } else {
          console.log("User is not subscribed.");
          setIsSubscribed(false);
        }

        // Fetch available products
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
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0A84FF" />
          <Text style={styles.loadingText}>
            Loading subscription options...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Lottie Animation */}
        <LottieView
          source={require("../assets/scanning.json")}
          autoPlay
          loop
          style={styles.lottie}
        />

        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.title}>Unlock AI-Powered Bet Analysis</Text>
          <View style={styles.offerContainer}>
            <Text style={styles.freeTrialTag}>First Time Users</Text>
            <Text style={styles.boldOffer}>
              Start with a{" "}
              <Text style={styles.highlightText}>3-DAY FREE TRIAL</Text>
            </Text>
            <Text style={styles.pricingText}>
              Then just <Text style={styles.priceHighlight}>$4.99/week</Text>
            </Text>
          </View>
        </View>

        {/* Benefits Description */}
        <View style={styles.benefitsContainer}>
          <Text style={styles.benefitsTitle}>What You'll Get:</Text>
          <View style={styles.benefitItem}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.benefitsText}>
              Lightning-fast insights on your bet slips
            </Text>
          </View>
          <View style={styles.benefitItem}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.benefitsText}>
              Detailed odds analysis and risk assessments
            </Text>
          </View>

          <View style={styles.benefitItem}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.benefitsText}>
              Unlimited uploads and result sharing
            </Text>
          </View>
        </View>

        {/* Call-to-Action: Purchase */}
        <TouchableOpacity
          style={styles.subscribeButton}
          disabled={processingPurchase}
          onPress={() => {
            if (products.length > 0) {
              handlePurchase(products[0]);
            } else {
              console.warn("No products available to purchase");
            }
          }}
        >
          {processingPurchase ? (
            <View style={styles.buttonContent}>
              <ActivityIndicator size="small" color="white" />
              <Text style={[styles.buttonText, styles.processingText]}>
                Processing...
              </Text>
            </View>
          ) : (
            <Text style={styles.buttonText}>Join Parlay Pal</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.cancelText}>
          Cancel anytime. No commitment required.
        </Text>

        {/* Restore Purchases */}
        <TouchableOpacity
          style={styles.otherPlansButton}
          disabled={processingRestore}
          onPress={handleRestorePurchases}
        >
          {processingRestore ? (
            <View style={styles.restoreContent}>
              <ActivityIndicator size="small" color="#0A84FF" />
              <Text style={[styles.otherPlansText, styles.processingText]}>
                Restoring...
              </Text>
            </View>
          ) : (
            <Text style={styles.otherPlansText}>Restore Purchases</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1C1C1E",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: "#8E8E93",
    textAlign: "center",
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    marginBottom: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 36,
  },
  offerContainer: {
    backgroundColor: "rgba(10, 132, 255, 0.1)",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    width: "100%",
    borderWidth: 1,
    borderColor: "rgba(10, 132, 255, 0.3)",
  },
  freeTrialTag: {
    color: "#0A84FF",
    fontWeight: "bold",
    fontSize: 14,
    marginBottom: 8,
  },
  boldOffer: {
    fontWeight: "bold",
    color: "white",
    fontSize: 18,
    marginBottom: 4,
  },
  highlightText: {
    color: "#0A84FF",
    fontSize: 20,
  },
  pricingText: {
    color: "#8E8E93",
    fontSize: 16,
  },
  priceHighlight: {
    color: "white",
    fontWeight: "bold",
  },
  benefitsContainer: {
    width: "100%",
    marginBottom: 25,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 12,
  },
  benefitItem: {
    flexDirection: "row",
    marginBottom: 8,
    alignItems: "flex-start",
  },
  bulletPoint: {
    color: "#0A84FF",
    fontSize: 18,
    marginRight: 8,
    lineHeight: 24,
  },
  benefitsText: {
    fontSize: 16,
    color: "#8E8E93",
    flex: 1,
    lineHeight: 24,
  },
  subscribeButton: {
    backgroundColor: "#0A84FF",
    width: "100%",
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 12,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  restoreContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  processingText: {
    marginLeft: 8,
  },
  cancelText: {
    color: "#8E8E93",
    fontSize: 14,
    marginBottom: 15,
  },
  otherPlansButton: {
    padding: 10,
  },
  otherPlansText: {
    color: "#0A84FF",
    fontSize: 16,
  },
  lottie: {
    width: 250,
    height: 250,
  },
});
