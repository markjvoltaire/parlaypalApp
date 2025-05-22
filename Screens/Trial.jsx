import { StyleSheet, Text, View, TouchableOpacity, Image } from "react-native";
import React from "react";

export default function Trial({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.freeText}>
          <Text style={styles.offerText}>We offer</Text>
          <Text> </Text>
          <Text style={styles.freeText}>7 days free</Text>
        </Text>
        <Text style={styles.subText}>so everyone can try Parlay Pal!</Text>

        <Image
          source={require("../assets/iphone1.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("OfferTrial")}
      >
        <Text style={styles.buttonText}>Try for $0.00</Text>
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
});
