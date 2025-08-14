import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import Auth from "./Auth/Auth";
import Home from "./Screens/Home";
import Purchases from "react-native-purchases";
import { config } from "./config";

export default function App() {
  // Configure RevenueCat once at app start
  if (config.REVENUECAT_API_KEY) {
    try {
      Purchases.configure({ apiKey: config.REVENUECAT_API_KEY });
    } catch (e) {
      // Ignore if already configured or in a race during fast refresh
    }
  } else {
    console.warn("REVENUECAT_API_KEY is not set. RevenueCat will be disabled.");
  }
  return (
    <NavigationContainer>
      <Auth />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({});
