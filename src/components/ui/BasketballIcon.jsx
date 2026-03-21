import React from "react";
import { View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const BasketballIcon = ({
  size = 50,
  bgColor = "#e61e2a",
  iconColor = "white",
}) => {
  const iconSize = Math.round(size * 0.55);
  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bgColor,
        },
      ]}
    >
      <Ionicons name="basketball" size={iconSize} color={iconColor} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
});

export default BasketballIcon;
