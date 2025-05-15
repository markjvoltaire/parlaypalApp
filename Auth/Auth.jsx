import { StyleSheet, Text, View, ActivityIndicator } from "react-native";
import React, { useEffect, useState, useRef } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Home from "../Screens/Home";
import Profile from "../Screens/Profile";
import Help from "../Screens/Help";
import Privacy from "../Screens/Privacy";
import Terms from "../Screens/Terms";
import Purchases from "react-native-purchases";
import Welcome from "../Screens/Welcome";
import Features from "../Screens/Features";
import AccessGranted from "../Screens/AccessGranted";
import Ask from "../Screens/Ask";
import How from "../Screens/How";
import Offer from "../Screens/Offer";
import { supabase } from "../Services/supabase";
import ExitSurvey from "../Screens/ExitSurvey";

export default function Auth() {
  const Stack = createNativeStackNavigator();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const isFetchingRef = useRef(false); // flag to prevent concurrent requests
  const [hasOnboarded, setHasOnboarded] = useState(false);
  const [initialScreen, setInitialScreen] = useState(null);

  const hasCompletedOnboarding = async (userId) => {
    const { data, error } = await supabase
      .from("survey") // or "surveys" if your actual table name differs
      .select("id")
      .eq("userId", userId)
      .limit(1);

    if (error) {
      console.error("Error checking onboarding status:", error);
      return false; // fallback: treat as not completed
    }

    return data.length > 0;
  };

  // Fetch products and subscription status from RevenueCat when component mounts
  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      if (isFetchingRef.current) {
        // Already fetching, so skip this call
        return;
      }
      isFetchingRef.current = true;
      try {
        setIsLoading(true); // start loading
        const customerInfo = await Purchases.getCustomerInfo();
        console.log("Customer Info!:", customerInfo);
        const userId = customerInfo.originalAppUserId;
        console.log("userId :>> ", userId);

        const completedOnboarding = await hasCompletedOnboarding(userId);
        setHasOnboarded(completedOnboarding);
        console.log("completedOnboarding :>> ", completedOnboarding);

        // Check for subscription
        const isSubscribedUser =
          customerInfo.activeSubscriptions &&
          customerInfo.activeSubscriptions.length > 0;

        setIsSubscribed(isSubscribedUser);

        // Determine initial screen
        if (isSubscribedUser) {
          setInitialScreen("Home");
        } else if (!completedOnboarding) {
          setInitialScreen("Welcome");
        } else {
          setInitialScreen("Home");
        }

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
        if (error.message && error.message.includes("already in progress")) {
          console.warn(
            "Operation already in progress. Skipping duplicate call."
          );
        } else {
          console.error("Error fetching customer info:", error);
        }
      } finally {
        isFetchingRef.current = false;
        setIsLoading(false); // end loading regardless of result
      }
    };

    checkSubscriptionStatus();
  }, []);

  // Show a loading indicator while subscription status is being checked
  if (isLoading || initialScreen === null) {
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
      <Stack.Screen
        name="Home"
        component={Home}
        options={({ route }) => ({
          tabBarVisible: false,
          title: "Chat",
          headerBackTitle: "Back",
          headerTintColor: "black",
          headerTransparent: true,
          gestureEnabled: false,
        })}
      />

      <Stack.Screen
        name="Ask"
        component={Ask}
        options={({ route }) => ({
          tabBarVisible: false,
          headerBackTitle: "Back",
          headerTintColor: "black",
          headerTransparent: true,
        })}
      />

      <Stack.Screen
        name="How"
        component={How}
        options={({ route }) => ({
          tabBarVisible: false,
          headerBackTitle: "Back",
          headerTintColor: "black",
          headerTransparent: true,
        })}
      />

      <Stack.Screen
        name="AccessGranted"
        component={AccessGranted}
        options={({ route }) => ({
          tabBarVisible: false,
          title: "Chat",
          headerBackTitle: "Back",
          headerTintColor: "black",
          headerTransparent: true,
          gestureEnabled: false,
        })}
      />

      <Stack.Screen
        name="Welcome"
        component={Welcome}
        options={({ route }) => ({
          tabBarVisible: false,
          title: "Chat",
          headerBackTitle: "Back",
          headerTintColor: "black",
          headerTransparent: true,
        })}
      />

      <Stack.Screen
        name="Offer"
        component={Offer}
        options={({ route }) => ({
          tabBarVisible: false,
          title: "Chat",
          headerBackTitle: "Back",
          headerTintColor: "black",
          headerTransparent: true,
        })}
      />

      <Stack.Screen
        name="Showcase"
        component={Features}
        options={({ route }) => ({
          tabBarVisible: false,
          title: "Chat",
          headerBackTitle: "Back",
          headerTintColor: "black",
        })}
      />

      <Stack.Screen
        name="Profile"
        component={Profile}
        options={({ route }) => ({
          tabBarVisible: false,
          title: "Profile",
          headerBackTitle: "Back",
          headerTintColor: "black",
          headerShown: false,
        })}
      />

      <Stack.Screen
        name="Help"
        component={Help}
        options={({ route }) => ({
          tabBarVisible: false,
          headerBackTitle: "Back",
          headerTintColor: "black",
          headerShown: false,
        })}
      />

      <Stack.Screen
        name="ExitSurvey"
        component={ExitSurvey}
        options={({ route }) => ({
          tabBarVisible: false,
          headerBackTitle: "Back",
          headerTintColor: "black",
          headerShown: false,
        })}
      />

      <Stack.Screen
        name="Privacy"
        component={Privacy}
        options={({ route }) => ({
          tabBarVisible: false,
          headerBackTitle: "Back",
          headerTintColor: "black",
          headerShown: false,
        })}
      />

      <Stack.Screen
        name="Terms"
        component={Terms}
        options={({ route }) => ({
          tabBarVisible: false,
          headerBackTitle: "Back",
          headerTintColor: "black",
          headerShown: false,
        })}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#101426",
  },
});
