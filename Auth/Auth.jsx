import { StyleSheet, Text, View, ActivityIndicator } from "react-native";
import React, { useEffect, useState, useRef } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import Home from "../Screens/Home";
import Explore from "../Screens/Explore";
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
import Email from "../Screens/Email";
import NotificationsScreen from "../Screens/NotificationScreen";
import OfferTrial from "../Screens/OfferTrial";
import Why from "../Screens/Why";
import Discord from "../Screens/Discord";
import { ExploreDataProvider } from "../contexts/ExploreDataContext";

const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <ExploreDataProvider>
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#54FF00",
        tabBarInactiveTintColor: "rgba(255,255,255,0.5)",
        tabBarStyle: {
          backgroundColor: "#101113",
          borderTopColor: "rgba(84, 255, 0, 0.2)",
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: "600" },
      }}
    >
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Explore"
        component={Explore}
        options={{
          tabBarLabel: "Explore",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="compass" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{
          tabBarLabel: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
    </ExploreDataProvider>
  );
}

export default function Auth() {
  const Stack = createNativeStackNavigator();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const isFetchingRef = useRef(false);
  const [hasOnboarded, setHasOnboarded] = useState(false);
  const [initialScreen, setInitialScreen] = useState(null);

  const hasCompletedOnboarding = async (userId) => {
    try {
      const { data, error } = await supabase
        .from("survey")
        .select("id")
        .eq("userId", userId)
        .limit(1);

      if (error) {
        console.error("Error checking onboarding status:", error);
        return false;
      }

      return data.length > 0;
    } catch (error) {
      console.error("Error in hasCompletedOnboarding:", error);
      return false;
    }
  };

  useEffect(() => {
    let isMounted = true;

    const checkSubscriptionStatus = async () => {
      if (isFetchingRef.current) {
        return;
      }

      isFetchingRef.current = true;
      setIsLoading(true);

      try {
        const customerInfo = await Purchases.getCustomerInfo();
        if (!isMounted) return;

        const userId = customerInfo.originalAppUserId;
        const completedOnboarding = await hasCompletedOnboarding(userId);
        if (!isMounted) return;

        setHasOnboarded(completedOnboarding);

        const isSubscribedUser = customerInfo.activeSubscriptions?.length > 0;
        setIsSubscribed(isSubscribedUser);

        // Set initial screen based on subscription and onboarding status
        if (isSubscribedUser) {
          setInitialScreen("MainTabs");
        } else if (!completedOnboarding) {
          setInitialScreen("Welcome");
        } else {
          setInitialScreen("MainTabs");
        }

        // Fetch available products
        const offerings = await Purchases.getOfferings();
        if (!isMounted) return;

        if (offerings.current?.availablePackages?.length > 0) {
          setProducts(offerings.current.availablePackages);
        }
      } catch (error) {
        if (!isMounted) return;

        if (error.message?.includes("already in progress")) {
          console.warn(
            "Operation already in progress. Skipping duplicate call."
          );
          // Set a default screen if we're stuck
          setInitialScreen("Welcome");
        } else {
          console.error("Error fetching customer info:", error);
          // Set a default screen on error
          setInitialScreen("Welcome");
        }
      } finally {
        if (isMounted) {
          isFetchingRef.current = false;
          setIsLoading(false);
        }
      }
    };

    checkSubscriptionStatus();

    return () => {
      isMounted = false;
    };
  }, []);

  // Show loading indicator only when we're actually loading and don't have an initial screen
  if (isLoading && initialScreen === null) {
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
        name="MainTabs"
        component={MainTabs}
        options={{ gestureEnabled: false }}
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
        name="ExitSurvey"
        component={ExitSurvey}
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
        name="Email"
        component={Email}
        options={({ route }) => ({
          tabBarVisible: false,
          headerBackTitle: "Back",
          headerTintColor: "black",
          headerShown: false,
        })}
      />

      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={({ route }) => ({
          tabBarVisible: false,
          headerBackTitle: "Back",
          headerTintColor: "black",
          headerShown: false,
        })}
      />

      <Stack.Screen
        name="OfferTrial"
        component={OfferTrial}
        options={({ route }) => ({
          tabBarVisible: false,
          headerBackTitle: "Back",
          headerTintColor: "black",
          headerShown: false,
        })}
      />

      <Stack.Screen
        name="Why"
        component={Why}
        options={({ route }) => ({
          tabBarVisible: false,
          headerBackTitle: "Back",
          headerTintColor: "black",
          headerShown: false,
        })}
      />

      <Stack.Screen
        name="Discord"
        component={Discord}
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
    backgroundColor: "black",
  },
});
