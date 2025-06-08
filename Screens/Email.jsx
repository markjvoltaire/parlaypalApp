import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import React, { useState } from "react";

const { width, height } = Dimensions.get("window");

export default function Email({ navigation }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const validateEmail = (email) => {
    // Simple email regex
    const re =
      /^(([^<>()\[\]\\.,;:\s@\"]+(\.[^<>()\[\]\\.,;:\s@\"]+)*)|(".+"))@(([^<>()[\]\\.,;:\s@\"]+\.)+[^<>()[\]\\.,;:\s@\"]{2,})$/i;
    return re.test(String(email).toLowerCase());
  };

  const handleContinue = () => {
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    navigation.navigate("Notifications", { email });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>What's your email?</Text>
      <Text style={styles.subtitle}>
        We'll use this to send you important updates.
      </Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        placeholderTextColor="#888"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          if (error) setError("");
        }}
      />
      {!!error && <Text style={styles.error}>{error}</Text>}
      <TouchableOpacity style={styles.button} onPress={handleContinue}>
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111427",
    justifyContent: "center",
    alignItems: "center",
    padding: width * 0.06,
  },
  title: {
    color: "#fff",
    fontSize: width * 0.07,
    fontWeight: "700",
    marginBottom: height * 0.015,
    textAlign: "center",
  },
  subtitle: {
    color: "#aaa",
    fontSize: width * 0.04,
    marginBottom: height * 0.04,
    textAlign: "center",
  },
  input: {
    width: "100%",
    backgroundColor: "#22253A",
    color: "#fff",
    borderRadius: width * 0.03,
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.017,
    fontSize: width * 0.04,
    marginBottom: height * 0.015,
    borderWidth: 1,
    borderColor: "#333",
    bottom: height * 0.02,
  },
  error: {
    color: "#FF3B30",
    fontSize: width * 0.035,
    marginBottom: height * 0.025,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#1E90FF",
    borderRadius: width * 0.06,
    paddingVertical: height * 0.02,
    paddingHorizontal: width * 0.1,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: width * 0.045,
    fontWeight: "600",
  },
});
