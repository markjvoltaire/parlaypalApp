import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  Animated,
  SafeAreaView,
} from "react-native";
import React, { useRef } from "react";
import * as Notifications from "expo-notifications";

const { width, height } = Dimensions.get("window");

// Simple notification bell
const NotificationBell = () => {
  return (
    <View style={styles.bellContainer}>
      {/* Bell icon */}
      <View style={styles.bellIcon}>
        <View style={styles.bellBody} />
        <View style={styles.bellHandle} />
      </View>

      {/* Notification badge */}
      <View style={styles.badge}>
        <Text style={styles.badgeText}>1</Text>
      </View>
    </View>
  );
};

export default function NotificationsScreen({ navigation, route }) {
  const email = route?.params?.email;
  const buttonScale = useRef(new Animated.Value(1)).current;

  const askNotificationPermission = async () => {
    // Button animation
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.97,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    let { status } = await Notifications.getPermissionsAsync();
    let expoToken = null;
    if (status !== "granted") {
      const { status: newStatus } =
        await Notifications.requestPermissionsAsync();
      status = newStatus;
    }
    if (status === "granted") {
      const tokenData = await Notifications.getExpoPushTokenAsync();
      expoToken = tokenData.data;
      console.log("Notification permission granted! Token:", expoToken);
      navigation.navigate("Ask", { email, expoToken });
    } else {
      console.log("Notification permission denied.");
      navigation.navigate("Ask", { email, expoToken: null });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Main content */}
      <View style={styles.content}>
        <Text style={styles.headerText}>
          Stay in the loop!{"\n"}
          <Text style={styles.highlightText}>Enable notifications</Text> to get
          important updates.
        </Text>
        {/* CTA Button - moved here to be directly under the text */}
        <Animated.View
          style={{ transform: [{ scale: buttonScale }], width: "100%" }}
        >
          <TouchableOpacity
            style={styles.button}
            onPress={askNotificationPermission}
            activeOpacity={0.9}
          >
            <Text style={styles.buttonText}>Enable Notifications</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Progress indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressDot} />
        <View style={styles.progressDot} />
        <View style={[styles.progressDot, styles.progressDotActive]} />
        <View style={styles.progressDot} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#101113",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: height * 0.05,
    paddingHorizontal: width * 0.06,
  },

  // Main content
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 25,
  },

  headerText: {
    color: "#FFFFFF",
    fontSize: width * 0.055,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: height * 0.06,
    lineHeight: width * 0.07,
    letterSpacing: -0.2,
  },

  highlightText: {
    color: "#54FF00",
    fontWeight: "700",
  },

  // Simple notification bell
  bellContainer: {
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },

  bellIcon: {
    alignItems: "center",
    justifyContent: "center",
  },

  bellBody: {
    width: width * 0.25,
    height: width * 0.22,
    backgroundColor: "#54FF00",
    borderRadius: width * 0.12,
    borderBottomLeftRadius: width * 0.06,
    borderBottomRightRadius: width * 0.06,
    shadowColor: "#54FF00",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },

  bellHandle: {
    width: width * 0.05,
    height: width * 0.025,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: width * 0.025,
    marginTop: -width * 0.015,
  },

  // Notification badge
  badge: {
    position: "absolute",
    top: -width * 0.02,
    right: -width * 0.02,
    backgroundColor: "#FF3B30",
    borderRadius: width * 0.04,
    width: width * 0.08,
    height: width * 0.08,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#101113",
  },

  badgeText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: width * 0.035,
  },

  // CTA Button
  button: {
    backgroundColor: "#54FF00",
    borderRadius: 16,
    paddingVertical: height * 0.022,
    paddingHorizontal: width * 0.1,
    width: "100%",

    shadowColor: "#54FF00",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: height * 0.02,
  },

  buttonText: {
    color: "#101113",
    fontSize: width * 0.045,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  // Progress indicator
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },

  progressDotActive: {
    backgroundColor: "#54FF00",
    shadowColor: "#54FF00",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 3,
  },
});
