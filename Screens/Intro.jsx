import React, { useState, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Image,
  FlatList,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  Animated,
} from "react-native";

const { width, height } = Dimensions.get("window");

// Onboarding screen data
const slides = [
  {
    id: "1",
    title: "Upload Your Bet Slip",
    description:
      "Take a photo of your parlay slip or manually enter your bets to get started",
    image: require("../assets/uploadSlip.png"),
  },
  {
    id: "2",
    title: "Instant Analysis",
    description:
      "Get real-time odds calculations and see the true value of your parlay bets",
    image: require("../assets/instantAnalysis.png"),
  },
  {
    id: "3",
    title: "Nail Your Bets",
    description:
      "Make smarter betting decisions with our insights and analytics",
    image: require("../assets/nailBets.png"),
  },
];

export default function Intro({ navigation }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef(null);

  const viewableItemsChanged = useRef(({ viewableItems }) => {
    setCurrentIndex(viewableItems[0].index);
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  // Handle navigation to next screen or next slide
  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      slidesRef.current.scrollToIndex({ index: currentIndex + 1 });
    } else {
      navigation.navigate("Ask"); // Changed from "MainApp" to "Ask"
    }
  };

  // Skip to the main app
  const handleSkip = () => {
    navigation.navigate("Ask"); // Changed from "MainApp" to "Ask"
  };

  // Render each slide
  const renderItem = ({ item }) => {
    return (
      <View style={styles.slide}>
        <View style={styles.imageContainer}>
          <Image source={item.image} style={styles.image} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>
      </View>
    );
  };

  // Render pagination dots
  const Paginator = () => {
    return (
      <View style={styles.paginationContainer}>
        {slides.map((_, i) => {
          const inputRange = [(i - 1) * width, i * width, (i + 1) * width];

          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [10, 20, 10],
            extrapolate: "clamp",
          });

          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: "clamp",
          });

          return (
            <Animated.View
              style={[
                styles.dot,
                { width: dotWidth, opacity },
                i === currentIndex ? styles.activeDot : styles.inactiveDot,
              ]}
              key={i.toString()}
            />
          );
        })}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Skip button */}
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Slides */}
      <FlatList
        data={slides}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        keyExtractor={(item) => item.id}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={32}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={viewConfig}
        ref={slidesRef}
      />

      {/* Pagination dots */}
      <Paginator />

      {/* Bottom buttons */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>
            {currentIndex === slides.length - 1 ? "Get Started" : "Next"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#101426",
    alignItems: "center",
    justifyContent: "center",
  },
  slide: {
    width,
    height: height * 0.8,
    alignItems: "center",
    justifyContent: "center",
  },
  imageContainer: {
    flex: 0.6,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: 24,
  },
  textContainer: {
    flex: 0.3,
    alignItems: "center",
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 10,
  },
  description: {
    fontSize: 18,
    color: "#ccc",
    textAlign: "center",
    lineHeight: 24,
  },
  paginationContainer: {
    flexDirection: "row",
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  dot: {
    height: 10,
    borderRadius: 5,
    backgroundColor: "white",
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: "#00FF7F",
  },
  inactiveDot: {
    backgroundColor: "rgba(255, 255, 255, 0.4)",
  },
  bottomContainer: {
    width: "100%",
    paddingHorizontal: 20,
    paddingBottom: 30,
    alignItems: "center",
  },
  button: {
    backgroundColor: "white",
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 30,
    width: "90%",
    alignItems: "center",
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  skipButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
  },
  skipText: {
    fontSize: 16,
    color: "white",
    fontWeight: "600",
  },
});
