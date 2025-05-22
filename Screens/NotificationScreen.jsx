import { StyleSheet, Text, View, TouchableOpacity, Image } from "react-native";
import React from "react";
import * as Notifications from "expo-notifications";

export default function NotificationsScreen({ navigation, route }) {
  // Retrieve email from params
  const email = route?.params?.email;

  // Request notification permissions on button press
  const askNotificationPermission = async () => {
    let { status } = await Notifications.getPermissionsAsync();
    let expoToken = null;
    if (status !== "granted") {
      const { status: newStatus } =
        await Notifications.requestPermissionsAsync();
      status = newStatus;
    }
    if (status === "granted") {
      // Get Expo push token
      const tokenData = await Notifications.getExpoPushTokenAsync();
      expoToken = tokenData.data;
      console.log("Notification permission granted! Token:", expoToken);
      navigation.navigate("Ask", { email, expoToken });
    } else {
      // Handle denied permission
      console.log("Notification permission denied.");
      navigation.navigate("Ask", { email, expoToken: null });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.headerText}>
          Stay in the loop!{"\n"}
          <Text style={styles.highlightText}>Enable notifications</Text> to get
          important updates about your trial, reminders, and more.
        </Text>
        <View style={styles.bellContainer}>
          <Image
            source={require("../assets/bell.png")}
            style={styles.bell}
            resizeMode="contain"
          />
          <View style={styles.badge}>
            <Text style={styles.badgeText}>1</Text>
          </View>
        </View>
      </View>
      <TouchableOpacity
        style={styles.button}
        onPress={askNotificationPermission}
      >
        <Text style={styles.buttonText}>Enable Notifications</Text>
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
    paddingVertical: 40,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 32,
  },
  highlightText: {
    color: "#1E90FF",
    fontWeight: "bold",
  },
  bellContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 10,
  },
  bell: {
    width: 120,
    height: 120,
  },
  badge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#FF3B30",
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  badgeText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
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
