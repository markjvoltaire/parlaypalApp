import LottieView from "lottie-react-native";
import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from "react-native";
import Purchases from "react-native-purchases";

// Configure RevenueCat (update your public API key as needed)
Purchases.configure({ apiKey: "appl_uPPCiaHpkTLNkrlhOikrUMWLaBH" });

export default function Features({ navigation }) {
  const [products, setProducts] = useState([]);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handlePurchase = async (packageToPurchase) => {
    try {
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

  // Fetch products from RevenueCat when component mounts
  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      try {
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
      }
    };

    checkSubscriptionStatus();
  }, []);

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
          <Text style={styles.boldOffer}>
            New users enjoy a 3-day free trial then only $4.99 per week.
          </Text>
        </View>

        {/* Benefits Description */}
        <Text style={styles.benefitsText}>
          Experience lightning-fast insights on your bet slips. Get detailed
          odds analysis, risk assessments, and winning predictions—all powered
          by advanced AI.
          {"\n\n"}
          Plus, enjoy unlimited uploads and share your results with friends.
        </Text>

        {/* Call-to-Action: Purchase */}
        <TouchableOpacity
          style={styles.subscribeButton}
          onPress={() => {
            if (products.length > 0) {
              handlePurchase(products[0]);
            } else {
              console.warn("No products available to purchase");
            }
          }}
        >
          <Text style={styles.buttonText}>Join Now</Text>
        </TouchableOpacity>

        {/* Restore Purchases */}
        <TouchableOpacity
          style={styles.otherPlansButton}
          onPress={async () => {
            try {
              const customerInfo = await Purchases.restorePurchases();
              if (
                customerInfo.activeSubscriptions &&
                customerInfo.activeSubscriptions.length > 0
              ) {
                setIsSubscribed(true);
              }
            } catch (error) {
              console.error("Error restoring purchases:", error);
            }
          }}
        >
          <Text style={styles.otherPlansText}>Restore Purchases</Text>
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
    fontSize: 36,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 25,
    lineHeight: 40,
  },
  boldOffer: {
    fontWeight: "bold",
    color: "white",
  },
  benefitsText: {
    fontSize: 17,
    color: "#8E8E93",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 24,
  },
  subscribeButton: {
    backgroundColor: "#0A84FF",
    width: "100%",
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  otherPlansButton: {
    padding: 10,
  },
  otherPlansText: {
    color: "#0A84FF",
    fontSize: 16,
  },
  lottie: {
    width: 300,
    height: 300,
  },
});
