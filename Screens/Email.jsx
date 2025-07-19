import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  SafeAreaView,
  Animated,
  TextInput,
  Image,
} from "react-native";
import React, { useRef, useEffect, useState } from "react";

const { width, height } = Dimensions.get("window");

export default function Email({ navigation }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const buttonScale = useRef(new Animated.Value(1)).current;

  const validateEmail = (email) => {
    // Simple email regex
    const re =
      /^(([^<>()\[\]\\.,;:\s@\"]+(\.[^<>()\[\]\\.,;:\s@\"]+)*)|(".+"))@(([^<>()[\]\\.,;:\s@\"]+\.)+[^<>()[\]\\.,;:\s@\"]{2,})$/i;
    return re.test(String(email).toLowerCase());
  };

  const handleContinue = () => {
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

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    navigation.navigate("Notifications", { email });
  };

  // Floating elements (unchanged)
  const FloatingElements = () => {
    const elements = Array.from({ length: 3 }, (_, i) => {
      const animatedValue = useRef(new Animated.Value(0)).current;

      useEffect(() => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(animatedValue, {
              toValue: 1,
              duration: 5000 + i * 1500,
              useNativeDriver: true,
            }),
            Animated.timing(animatedValue, {
              toValue: 0,
              duration: 5000 + i * 1500,
              useNativeDriver: true,
            }),
          ])
        ).start();
      }, []);

      const translateY = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -20],
      });

      const opacity = animatedValue.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0.2, 0.5, 0.2],
      });

      return (
        <Animated.View
          key={i}
          style={[
            styles.floatingDot,
            {
              left: `${15 + i * 30}%`,
              top: `${20 + i * 15}%`,
              transform: [{ translateY }],
              opacity,
            },
          ]}
        />
      );
    });

    return <>{elements}</>;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#101113" />
      <FloatingElements />
      <View style={styles.content}>
        {/* App logo image */}
        <Image
          source={require("../assets/parlayPalWhite.png")}
          style={styles.appLogo}
          resizeMode="contain"
        />
        {/* Description */}
        <Text style={styles.description}>Let's start with your email</Text>
        {/* Email input - main focus */}
        <View style={styles.emailInputContainer}>
          <TextInput
            style={styles.emailInput}
            placeholder="Enter your email address"
            placeholderTextColor="rgba(255, 255, 255, 0.4)"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (error) setError("");
            }}
            selectionColor="#54FF00"
          />
        </View>
        {!!error && <Text style={styles.error}>{error}</Text>}
        {/* Next button */}
        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleContinue}
            activeOpacity={0.9}
          >
            <Text style={styles.nextButtonText}>Continue</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#101113",
  },

  // Floating elements
  floatingDot: {
    position: "absolute",
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(84, 255, 0, 0.4)",
    shadowColor: "#54FF00",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 3,
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: width * 0.06,
    paddingTop: height * 0.02,
  },

  helpButton: {
    backgroundColor: "rgba(26, 24, 27, 0.8)",
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },

  helpText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },

  // Main content
  content: {
    flex: 1,
    top: height * 0.15,
    paddingHorizontal: width * 0.06,
  },

  appLogo: {
    width: width * 0.5,
    height: width * 0.18,
    marginBottom: height * 0.01,
    alignSelf: "center",
    right: 5,
  },

  appTitle: {
    color: "#FFFFFF",
    fontSize: width * 0.08,
    fontWeight: "700",
    marginBottom: height * 0.04,
    letterSpacing: -0.5,
  },

  // Gaming illustration
  illustrationContainer: {
    marginBottom: height * 0.04,
  },

  illustrationCircle: {
    width: width * 0.5,
    height: width * 0.5,
    borderRadius: width * 0.25,
    backgroundColor: "rgba(26, 24, 27, 0.8)",
    borderWidth: 2,
    borderColor: "rgba(84, 255, 0, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#54FF00",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
    position: "relative",
  },

  // Gaming controller
  controllerIcon: {
    alignItems: "center",
    justifyContent: "center",
  },

  controllerBody: {
    width: 60,
    height: 35,
    backgroundColor: "#54FF00",
    borderRadius: 18,
    marginBottom: 5,
  },

  controllerLeftStick: {
    position: "absolute",
    left: -15,
    top: 5,
    width: 12,
    height: 12,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 6,
  },

  controllerRightStick: {
    position: "absolute",
    right: -15,
    top: 5,
    width: 12,
    height: 12,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 6,
  },

  controllerDpad: {
    position: "absolute",
    left: -25,
    bottom: 0,
    width: 8,
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    borderRadius: 2,
  },

  controllerButtons: {
    position: "absolute",
    right: -25,
    bottom: 0,
    width: 8,
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    borderRadius: 4,
  },

  // Floating gaming elements
  floatingCoin: {
    position: "absolute",
    top: 20,
    right: 30,
    width: 24,
    height: 24,
    backgroundColor: "#54FF00",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#54FF00",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 5,
  },

  coinText: {
    color: "#101113",
    fontSize: 14,
    fontWeight: "bold",
  },

  floatingDice: {
    position: "absolute",
    bottom: 30,
    left: 25,
    width: 20,
    height: 20,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },

  diceText: {
    color: "#101113",
    fontSize: 12,
    fontWeight: "bold",
  },

  floatingCard: {
    position: "absolute",
    top: 50,
    left: 20,
    width: 16,
    height: 20,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 2,
    alignItems: "center",
    justifyContent: "center",
  },

  cardText: {
    color: "#101113",
    fontSize: 10,
    fontWeight: "bold",
  },

  // Description
  description: {
    color: "white",
    fontSize: width * 0.04,
    textAlign: "center",
    marginBottom: height * 0.04,
    lineHeight: width * 0.055,
    fontWeight: "700",
    paddingHorizontal: width * 0.04,
  },

  // Email input - main focus
  emailInputContainer: {
    backgroundColor: "rgba(26, 24, 27, 0.8)",
    borderRadius: 16,
    marginBottom: height * 0.04,
    borderWidth: 2,
    borderColor: "rgba(84, 255, 0, 0.3)",
    shadowColor: "#54FF00",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
    width: "100%",
  },

  emailInput: {
    color: "#FFFFFF",
    fontSize: width * 0.042,
    paddingHorizontal: width * 0.05,
    paddingVertical: height * 0.02,
    fontWeight: "500",
    textAlign: "center",
  },

  // Next button
  nextButton: {
    backgroundColor: "#54FF00",
    borderRadius: 16,
    paddingVertical: height * 0.02,
    paddingHorizontal: width * 0.2,
    shadowColor: "#54FF00",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
    minWidth: width * 0.8,
    alignItems: "center",
  },

  nextButtonText: {
    color: "#101113",
    fontSize: width * 0.045,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  // Bottom branding
  bottomBranding: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: width * 0.06,
    paddingBottom: height * 0.02,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
    paddingTop: height * 0.015,
  },

  brandingLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  brandIcon: {
    width: 20,
    height: 20,
    backgroundColor: "#54FF00",
    borderRadius: 4,
    marginRight: 8,
  },

  brandingText: {
    color: "#FFFFFF",
    fontSize: width * 0.035,
    fontWeight: "600",
  },

  brandingRight: {
    alignItems: "flex-end",
  },

  curatedText: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: width * 0.03,
    fontWeight: "400",
  },

  companyText: {
    color: "#FFFFFF",
    fontSize: width * 0.035,
    fontWeight: "600",
  },

  error: {
    color: "red",
    fontSize: width * 0.035,
    marginTop: height * 0.01,
    textAlign: "center",
  },
});
