import React, { useState, useRef, useCallback, useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  useWindowDimensions,
  Animated,
} from "react-native";

/* ──────────────────────────────────────────
 *  Constants
 * ────────────────────────────────────────── */
const IMAGES = [
  require("../assets/uploadSlip.png"),
  require("../assets/instantAnalysis.png"),
  require("../assets/nailBets.png"),
];

const HEADERS = [
  "Upload Your slip",
  "Real Time Data Analysis",
  "Analysis for every bet",
];

const ANIMATION_DURATION = 300;

/* ──────────────────────────────────────────
 *  Screen
 * ────────────────────────────────────────── */
export default function How({ navigation, route }) {
  const { width } = useWindowDimensions();
  const CARD_WIDTH = width * 0.9;

  /* ----- Cross-fade state ----- */
  const [index, setIndex] = useState(0);
  const opacity = useRef(new Animated.Value(1)).current;

  const animateOpacity = useCallback(
    (toValue, onComplete) =>
      Animated.timing(opacity, {
        toValue,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }).start(onComplete),
    [opacity]
  );

  const handleNext = useCallback(() => {
    animateOpacity(0, () => {
      setIndex((prev) => (prev + 1) % IMAGES.length);
      opacity.setValue(0); // reset instantly
      animateOpacity(1); // fade new image in
    });
  }, [animateOpacity, opacity]);

  const isLastSlide = index === IMAGES.length - 1;
  const currentImage = useMemo(() => IMAGES[index], [index]);
  const headerTitle = HEADERS[index];

  // Retrieve surveyAnswers from route.params
  const surveyAnswers = route.params?.surveyAnswers || {};
  const email = route.params?.email || "";
  const userId = route.params?.userId || "";

  /* ──────────────────────────── */
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.headerWrapper}>
        <Text style={styles.headerText}>{headerTitle}</Text>
      </View>

      {/* Image */}
      <View style={styles.imageWrapper}>
        <Animated.Image
          source={currentImage}
          resizeMode="cover"
          style={[
            styles.image,
            { width: CARD_WIDTH, height: width * 1.3, opacity },
          ]}
        />
      </View>

      {/* CTA */}
      <View style={styles.ctaSection}>
        <TouchableOpacity
          accessibilityRole="button"
          style={styles.button}
          onPress={
            isLastSlide
              ? () =>
                  navigation.navigate("Why", {
                    surveyAnswers: surveyAnswers,
                    email,
                    userId,
                  })
              : handleNext
          }
        >
          <Text style={styles.buttonText}>
            {isLastSlide ? "Continue" : "Next"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

/* ──────────────────────────────────────────
 *  Styles
 * ────────────────────────────────────────── */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#101426",
  },
  headerWrapper: {
    paddingTop: 20,
    paddingBottom: 10,
    alignItems: "center",
  },
  headerText: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "600",
    textTransform: "capitalize",
    top: 20,
  },
  imageWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  ctaSection: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  button: {
    backgroundColor: "#fff",
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 30,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
});
