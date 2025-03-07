import { StyleSheet, Text, View, ActivityIndicator } from "react-native";
import React, { useEffect, useState } from "react";
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

export default function Auth() {
  const Stack = createNativeStackNavigator();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Add loading state

  // Fetch products from RevenueCat when component mounts
  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      try {
        setIsLoading(true); // Start loading
        const customerInfo = await Purchases.getCustomerInfo();
        console.log("Customer Info!:", customerInfo);

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
        setIsLoading(false); // End loading regardless of result
      }
    };

    checkSubscriptionStatus();
  }, []);

  console.log("isSubscribed! :>> ", isSubscribed);

  // Show a loading indicator while subscription status is being checked
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName={isSubscribed ? "Home" : "Welcome"}
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
