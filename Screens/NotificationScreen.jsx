import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import React from "react";
import * as Notifications from "expo-notifications";

const { width, height } = Dimensions.get("window");

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
    paddingVertical: height * 0.05,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerText: {
    color: "#fff",
    fontSize: width * 0.055,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: height * 0.04,
    paddingHorizontal: width * 0.05,
  },
  highlightText: {
    color: "#1E90FF",
    fontWeight: "bold",
  },
  bellContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: height * 0.01,
    marginBottom: height * 0.01,
  },
  bell: {
    width: width * 0.3,
    height: width * 0.3,
  },
  badge: {
    position: "absolute",
    top: height * 0.01,
    right: width * 0.02,
    backgroundColor: "#FF3B30",
    borderRadius: width * 0.04,
    width: width * 0.08,
    height: width * 0.08,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  badgeText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: width * 0.045,
  },
  button: {
    backgroundColor: "#1E90FF",
    borderRadius: width * 0.06,
    paddingVertical: height * 0.02,
    paddingHorizontal: width * 0.1,
    marginBottom: height * 0.01,
    width: width * 0.9,
    alignSelf: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: width * 0.045,
    fontWeight: "600",
    textAlign: "center",
  },
});
