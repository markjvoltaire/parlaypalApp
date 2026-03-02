import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import Auth from "./Auth/Auth";
import Home from "./Screens/Home";
import Explore from "./Screens/Explore";

export default function App() {
  return (
    <NavigationContainer>
      <Auth />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({});
