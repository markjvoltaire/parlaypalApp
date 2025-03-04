import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Home from "../Screens/Home";
import Profile from "../Screens/Profile";
import Help from "../Screens/Help";
import Privacy from "../Screens/Privacy";
import Terms from "../Screens/Terms";

export default function Auth() {
  const Stack = createNativeStackNavigator();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="Home"
        component={Home}
        options={({ route }) => ({
          tabBarVisible: false,
          title: "Chat",
          headerBackTitle: "Back",
          headerTintColor: "black",
          headerTransparent: true,
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

const styles = StyleSheet.create({});
