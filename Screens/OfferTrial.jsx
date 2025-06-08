import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
  Alert,
  ScrollView,
} from "react-native";
import React, { useEffect, useState } from "react";
import Purchases from "react-native-purchases";

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
      console.log("All offerings:", JSON.stringify(offerings, null, 2));

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
        console.log(
          "Found weekly package:",
          JSON.stringify(weeklyPackage, null, 2)
        );
        setProduct(weeklyPackage);
      } else {
        console.log(
          "Weekly package (premium.weeklyaccess) not found in any offering."
        );
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
export default function Trial({ navigation }) {
  const { product, processingPurchase, handlePurchase } = usePurchase();

  const onPurchasePress = async () => {
    const success = await handlePurchase();
    if (success) {
      navigation.navigate("AccessGranted");
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text style={styles.offerText}>
            <Text style={styles.offerText}>We offer</Text>
            <Text> </Text>
            <Text style={styles.freeText}>3 days free</Text>
          </Text>
          <Text style={styles.subText}>so everyone can try Parlay Pal!</Text>
        </View>

        <Image
          source={require("../assets/iphone1.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.priceText}>$4.99 per week after trial</Text>
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={onPurchasePress}
          disabled={processingPurchase || !product}
        >
          {processingPurchase ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Try for $0.00</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111427",
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: height * 0.04,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  textContainer: {
    alignItems: "center",
    marginBottom: height * 0.02,
  },
  offerText: {
    color: "#fff",
    fontSize: width * 0.06,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: height * 0.005,
  },
  freeText: {
    color: "#1E90FF",
    fontSize: width * 0.06,
    fontWeight: "700",
    textAlign: "center",
  },
  subText: {
    color: "#fff",
    fontSize: width * 0.06,
    textAlign: "center",
    marginBottom: height * 0.002,
  },
  logo: {
    width: width * 1,
    height: width * 1.25,
    marginTop: height * 0.01,
    marginBottom: height * 0.01,
  },
  buttonsContainer: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: width * 0.05,
  },
  button: {
    backgroundColor: "#1E90FF",
    borderRadius: width * 0.06,
    paddingVertical: height * 0.02,
    paddingHorizontal: width * 0.1,
    marginBottom: height * 0.01,
    width: "100%",
    alignSelf: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: width * 0.045,
    fontWeight: "600",
    textAlign: "center",
  },
  priceText: {
    color: "#fff",
    fontSize: width * 0.06,
    textAlign: "center",
    marginTop: height * 0.02,
    fontWeight: "600",
    marginBottom: height * 0.02,
  },
});
