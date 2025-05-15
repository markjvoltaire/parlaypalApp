// src/Navigation/Auth.js

import { StyleSheet, View, ActivityIndicator } from "react-native";
import React, { useEffect, useState, useRef } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Purchases from "react-native-purchases";
import { supabase } from "../Services/supabase";

// Screens
import Home from "../Screens/Home";
import Profile from "../Screens/Profile";
import Help from "../Screens/Help";
import Privacy from "../Screens/Privacy";
import Terms from "../Screens/Terms";
import Welcome from "../Screens/Welcome";
import Features from "../Screens/Features";
import AccessGranted from "../Screens/AccessGranted";
import Ask from "../Screens/Ask";
import How from "../Screens/How";
import Offer from "../Screens/Offer";
import ExitSurvey from "../Screens/ExitSurvey";
import { REVENUECAT_API_KEY } from "@env";

export default function Auth() {
  const Stack = createNativeStackNavigator();
  const [isLoading, setIsLoading] = useState(true);
  const [initialScreen, setInitialScreen] = useState("Welcome"); // fallback
  const sdkInitialized = useRef(false);

  // 1) Initialize RevenueCat SDK once
  useEffect(() => {
    async function setupSDK() {
      if (sdkInitialized.current) return;
      sdkInitialized.current = true;
      try {
        console.log("→ Purchases.configure");
        await Purchases.configure({
          apiKey: REVENUECAT_API_KEY,
          // optionally: appUserID, observerMode, userDefaultsSuiteName
        });
        console.log("← Purchases.configure complete");
      } catch (e) {
        console.error("RevenueCat configure failed:", e);
      }
    }
    setupSDK();
  }, []);

  // 2) Once SDK is initialized, fetch customer info and offerings
  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        console.log("→ Purchases.getCustomerInfo");
        const info = await Purchases.getCustomerInfo();
        console.log("← got customerInfo", info);

        // check onboarding status in Supabase
        const userId = info.originalAppUserId;
        const { data, error } = await supabase
          .from("survey")
          .select("id")
          .eq("userId", userId)
          .limit(1);

        const hasOnboarded = !error && data.length > 0;
        const isSubscribed = (info.activeSubscriptions || []).length > 0;

        // decide initial screen
        if (isSubscribed) {
          setInitialScreen("Home");
        } else if (!hasOnboarded) {
          setInitialScreen("Welcome");
        } else {
          setInitialScreen("Home");
        }

        console.log("→ Purchases.getOfferings");
        const offerings = await Purchases.getOfferings();
        console.log("← got offerings", offerings);
        // you can store offerings.current.availablePackages here if needed
      } catch (err) {
        console.error("Bootstrap error:", err);
        // fallback initialScreen remains
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    if (sdkInitialized.current) {
      bootstrap();
    }

    return () => {
      cancelled = true;
    };
  }, []);

  // loading state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="white" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName={initialScreen}
    >
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="Ask" component={Ask} />
      <Stack.Screen name="How" component={How} />
      <Stack.Screen name="AccessGranted" component={AccessGranted} />
      <Stack.Screen name="Welcome" component={Welcome} />
      <Stack.Screen name="Offer" component={Offer} />
      <Stack.Screen name="Showcase" component={Features} />
      <Stack.Screen name="Profile" component={Profile} />
      <Stack.Screen name="Help" component={Help} />
      <Stack.Screen name="Privacy" component={Privacy} />
      <Stack.Screen name="ExitSurvey" component={ExitSurvey} />
      <Stack.Screen name="Terms" component={Terms} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: "#101426",
    justifyContent: "center",
    alignItems: "center",
  },
});
