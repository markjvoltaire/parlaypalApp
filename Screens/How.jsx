import React, {
  useState,
  useRef,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  useWindowDimensions,
  Animated,
  Image,
} from "react-native";
import { Video } from "expo-av";

/* ──────────────────────────────────────────
 *  Constants
 * ────────────────────────────────────────── */
const MEDIA = [
  { type: "video", source: require("../assets/uploadSlip.mov") },
  { type: "image", source: require("../assets/analysis.png") },
  { type: "video", source: require("../assets/nailBets.mov") },
];

const HEADERS = [
  "Upload Your slip",
  "Real odds. Not vibes.",
  "Analysis for every bet",
];

const ANIMATION_DURATION = 300;

/* ──────────────────────────────────────────
 *  Screen
 * ────────────────────────────────────────── */
export default function How({ navigation }) {
  const { width } = useWindowDimensions();
  const CARD_WIDTH = width * 0.9;

  /* ----- Animation state ----- */
  const [index, setIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const videoRef = useRef(null);

  const fadeIn = useCallback(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: ANIMATION_DURATION,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const fadeOut = useCallback(() => {
    return new Promise((resolve) => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }).start(resolve);
    });
  }, [fadeAnim]);

  const handleNext = useCallback(async () => {
    await fadeOut();
    setIndex((prev) => (prev + 1) % MEDIA.length);
    fadeIn();
  }, [fadeOut, fadeIn]);

  // Fade in on mount
  useEffect(() => {
    fadeIn();
  }, []);

  // Handle index changes
  useEffect(() => {
    if (index > 0) {
      fadeIn();
    }
  }, [index, fadeIn]);

  const isLastSlide = index === MEDIA.length - 1;
  const currentMedia = useMemo(() => MEDIA[index], [index]);
  const headerTitle = HEADERS[index];

  /* ──────────────────────────── */
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.headerWrapper}>
        <Text style={styles.headerText}>{headerTitle}</Text>
      </View>

      {/* Media */}
      <View style={styles.mediaWrapper}>
        <Animated.View style={[styles.mediaContainer, { opacity: fadeAnim }]}>
          {currentMedia.type === "video" ? (
            <Video
              ref={videoRef}
              source={currentMedia.source}
              style={[styles.media, { width: CARD_WIDTH, height: width * 1.3 }]}
              resizeMode="cover"
              isLooping
              shouldPlay
              useNativeControls={false}
            />
          ) : (
            <Image
              source={currentMedia.source}
              style={[styles.media, { width: CARD_WIDTH, height: width * 1.3 }]}
              resizeMode="cover"
            />
          )}
        </Animated.View>
      </View>

      {/* CTA */}
      <View style={styles.ctaSection}>
        <TouchableOpacity
          accessibilityRole="button"
          style={styles.button}
          onPress={
            isLastSlide ? () => navigation.navigate("Trial") : handleNext
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
  mediaWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  mediaContainer: {
    width: "100%",
    alignItems: "center",
  },
  media: {
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
