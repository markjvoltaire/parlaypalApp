import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import Purchases from "react-native-purchases";

export default function Trial({ navigation }) {
  const [products, setProducts] = useState([]);
  const [processingPurchase, setProcessingPurchase] = useState(false);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const offerings = await Purchases.getOfferings();
        console.log("Offerings:", JSON.stringify(offerings, null, 2));
        if (
          offerings.current &&
          offerings.current.availablePackages.length > 0
        ) {
          // Find the weekly package
          const weeklyPackage = offerings.current.availablePackages.find(
            (pkg) => pkg.product.identifier.includes("weekly")
          );

          if (weeklyPackage) {
            console.log(
              "Selected Weekly Package:",
              JSON.stringify(weeklyPackage, null, 2)
            );
            setProducts([weeklyPackage]);
          } else {
            console.log("No weekly package found");
          }
        } else {
          console.log("No current offerings or packages available");
        }
      } catch (e) {
        console.error("Error fetching products:", e);
      }
    }
    fetchProducts();
  }, []);

  const handlePurchase = async () => {
    if (products.length === 0) {
      console.log("No products available for purchase");
      return;
    }
    console.log(
      "Attempting to purchase weekly package:",
      JSON.stringify(products[0], null, 2)
    );
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

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.freeText}>
          <Text style={styles.offerText}>We offer</Text>
          <Text> </Text>
          <Text style={styles.freeText}>3 days free</Text>
        </Text>
        <Text style={styles.subText}>so everyone can try Parlay Pal!</Text>

        <Image
          source={require("../assets/iphone1.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.priceText}>$4.99 per week after trial</Text>
      </View>
      <TouchableOpacity
        style={styles.button}
        onPress={handlePurchase}
        disabled={processingPurchase}
      >
        {processingPurchase ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Try for $0.00</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111427",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 30,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  offerText: {
    color: "#fff",
    fontSize: 25,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 4,
  },
  freeText: {
    color: "#1E90FF",
    fontSize: 25,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 4,
  },
  subText: {
    color: "#fff",
    fontSize: 25,
    textAlign: "center",
    marginBottom: 2,
  },
  logo: {
    width: 500,
    height: 500,
    marginTop: 24,
    marginBottom: 8,
  },
  button: {
    backgroundColor: "#1E90FF",
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 40,
    marginBottom: 10,
    width: "90%",
    alignSelf: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  priceText: {
    color: "#fff",
    fontSize: 20,
    textAlign: "center",
    marginTop: 18,
    top: 10,
    fontSize: 19,
    fontWeight: "600",
  },
});
