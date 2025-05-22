import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import Purchases from "react-native-purchases";

const TimelineIcon = ({ type }) => {
  let icon = "🔒";
  if (type === "bell") icon = "🔔";
  if (type === "billing") icon = "💳";
  let bgColor = "#222B45";
  if (type === "bell") bgColor = "#1E90FF";
  if (type === "lock") bgColor = "#FFA726";
  return (
    <View style={[styles.timelineIcon, { backgroundColor: bgColor }]}>
      <Text style={{ fontSize: 20 }}>{icon}</Text>
    </View>
  );
};

function getBillingDateString() {
  const today = new Date();
  const billingDate = new Date(today);
  billingDate.setDate(today.getDate() + 7);
  const options = { year: "numeric", month: "short", day: "numeric" };
  return billingDate.toLocaleDateString(undefined, options);
}

export default function OfferTrial({ navigation }) {
  const [products, setProducts] = useState([]);
  const [processingPurchase, setProcessingPurchase] = useState(false);
  const [processingRestore, setProcessingRestore] = useState(false);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const offerings = await Purchases.getOfferings();
        if (
          offerings.current &&
          offerings.current.availablePackages.length > 0
        ) {
          setProducts(offerings.current.availablePackages);
        }
      } catch (e) {
        console.error(e);
      }
    }
    fetchProducts();
  }, []);

  const handlePurchase = async () => {
    if (products.length === 0) return;
    try {
      setProcessingPurchase(true);
      const { customerInfo } = await Purchases.purchasePackage(products[0]);
      if (
        customerInfo.activeSubscriptions &&
        customerInfo.activeSubscriptions.length > 0
      ) {
        navigation.navigate("AccessGranted");
      }
    } catch (e) {
      if (!e.userCancelled) {
        console.warn(e);
      }
    } finally {
      setProcessingPurchase(false);
    }
  };

  const handleRestore = async () => {
    try {
      setProcessingRestore(true);
      const customerInfo = await Purchases.restorePurchases();
      if (
        customerInfo.activeSubscriptions &&
        customerInfo.activeSubscriptions.length > 0
      ) {
        navigation.navigate("AccessGranted");
      }
    } catch (e) {
      console.warn(e);
    } finally {
      setProcessingRestore(false);
    }
  };

  const billingDateString = getBillingDateString();

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeAreaHeader}>
        <Text style={styles.headerText}>
          Start your <Text style={styles.headerHighlight}>7 day FREE</Text>{" "}
          trial to continue.
        </Text>
      </SafeAreaView>
      <View style={styles.timelineContainer}>
        <View style={styles.timelineLine} />
        <View style={styles.timelineStep}>
          <TimelineIcon type="lock" />
          <View style={styles.timelineTextContainer}>
            <Text style={styles.timelineStepTitle}>Today</Text>
            <Text style={styles.timelineStepDesc}>
              Unlock all the app's features like AI calorie scanning and more.
            </Text>
          </View>
        </View>
        <View style={styles.timelineStep}>
          <TimelineIcon type="bell" />
          <View style={styles.timelineTextContainer}>
            <Text style={styles.timelineStepTitle}>In 2 Days - Reminder</Text>
            <Text style={styles.timelineStepDesc}>
              We'll send you a reminder that your trial is ending soon.
            </Text>
          </View>
        </View>
        <View style={styles.timelineStep}>
          <TimelineIcon type="billing" />
          <View style={styles.timelineTextContainer}>
            <Text style={[styles.timelineStepTitle, { color: "#fff" }]}>
              In 7 Days - Billing Starts
            </Text>
            <Text style={[styles.timelineStepDesc, { color: "#fff" }]}>
              You'll be charged on {billingDateString} unless you cancel anytime
              before.
            </Text>
          </View>
        </View>
      </View>
      <Text style={styles.priceText}> Then $19.99 per month</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={handlePurchase}
        disabled={processingPurchase}
      >
        {processingPurchase ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Start my 7 day free trial</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.restoreButton}
        onPress={handleRestore}
        disabled={processingRestore}
      >
        {processingRestore ? (
          <ActivityIndicator color="#A0AEC0" />
        ) : (
          <Text style={styles.restoreButtonText}>Restore</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#181B2A",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  safeAreaHeader: {
    width: "100%",
    alignItems: "center",
    marginBottom: 24,
  },
  headerText: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 10,
  },
  headerHighlight: {
    color: "#1E90FF",
    fontWeight: "800",
  },
  timelineContainer: {
    width: "92%",
    backgroundColor: "#23284D",
    borderRadius: 28,
    paddingVertical: 32,
    paddingHorizontal: 18,
    marginBottom: 32,
    position: "relative",
    alignItems: "flex-start",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 2,
  },
  timelineLine: {
    position: "absolute",
    left: 28,
    top: 48,
    bottom: 48,
    width: 3,
    backgroundColor: "#1E90FF",
    zIndex: 0,
    borderRadius: 2,
  },
  timelineStep: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 32,
    position: "relative",
    zIndex: 1,
  },
  timelineIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 18,
    marginLeft: 6,
    marginTop: 2,
  },
  timelineTextContainer: {
    flex: 1,
    paddingTop: 2,
  },
  timelineStepTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 2,
  },
  timelineStepDesc: {
    fontSize: 15,
    color: "#B0B3C6",
    fontWeight: "400",
    marginBottom: 0,
  },
  priceText: {
    color: "white",
    fontSize: 19,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 28,
    marginTop: -10,
  },
  button: {
    backgroundColor: "#1E90FF",
    borderRadius: 28,
    paddingVertical: 18,
    paddingHorizontal: 40,
    marginBottom: 10,
    width: "92%",
    alignSelf: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 19,
    fontWeight: "700",
    textAlign: "center",
  },
  restoreButton: {
    backgroundColor: "transparent",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 10,
    paddingVertical: 6,
    width: "auto",
    borderWidth: 0,
    elevation: 0,
  },
  restoreButtonText: {
    color: "#A0AEC0",
    fontSize: 15,
    fontWeight: "400",
    textAlign: "center",
    letterSpacing: 0.1,
  },
});
