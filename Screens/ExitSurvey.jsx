import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Dimensions,
  Image,
  Platform,
  Linking,
  Alert,
} from "react-native";
import React, { useState, useRef, useEffect } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { supabase } from "../Services/supabase";
import Purchases from "react-native-purchases";

// Mock icon components - in a real app, you'd import from a library like @expo/vector-icons
const ChevronRight = () => (
  <View
    style={{
      width: 20,
      height: 20,
      borderRadius: 10,
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    <Text style={{ color: "#fff", fontWeight: "bold" }}>→</Text>
  </View>
);

const ProgressDot = ({ active, completed }) => (
  <View
    style={{
      width: completed ? 24 : 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: active
        ? "#4F78FF"
        : completed
        ? "#4F78FF"
        : "rgba(255,255,255,0.2)",
      marginHorizontal: 4,
      transition: "all 0.3s ease",
    }}
  />
);

export default function Ask({ navigation }) {
  const [step, setStep] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const screenWidth = Dimensions.get("window").width;
  const [surveyAnswers, setSurveyAnswers] = useState({});

  const questions = [
    "What is your primary reason for cancelling?",
    "How would you rate the value of the betting insights you received?",
    "Would you consider resubscribing if we…",
  ];

  const answers = [
    [
      "I no longer place parlays/bets",
      "I didn’t find the insights helpful",
      "The app is too expensive",
      "Technical issues or bugs",
    ],
    [
      "Excellent – very actionable",
      "Good – somewhat helpful",
      "Fair – limited usefulness",
      "Poor – not useful at all",
    ],
    [
      "Lowered the price",
      "Improved accuracy or added new stats",
      "Fixed the technical issues I experienced",
      "Added other feature",
    ],
  ];

  // Open OS-specific subscription settings
  const openSubscriptionSettings = async () => {
    try {
      const url = Platform.select({
        ios: "itms-apps://apps.apple.com/account/subscriptions",
        android: "https://play.google.com/store/account/subscriptions",
        default: "https://play.google.com/store/account/subscriptions",
      });

      const canOpen = await Linking.canOpenURL(url);
      if (!canOpen) throw new Error("Cannot open URL");

      await Linking.openURL(url);
    } catch (error) {
      Alert.alert(
        "Error",
        "Couldn't open subscription settings. Please check your subscriptions in your device's app store manually.",
        [{ text: "OK", onPress: () => console.log("OK Pressed") }]
      );
    }
  };

  useEffect(() => {
    // Animate in the content when component mounts or step changes
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    return () => {
      // Reset animations when step changes
      fadeAnim.setValue(0);
      slideAnim.setValue(50);
    };
  }, [step]);

  const handleAnswerPress = async (answer, answerIndex) => {
    const customerInfo = await Purchases.getCustomerInfo();
    const userId = customerInfo.originalAppUserId;
    setSelectedAnswer(answerIndex);

    // wait for the tap animation
    setTimeout(async () => {
      const questionKey = `question${step + 1}`;
      const updated = { ...surveyAnswers, [questionKey]: answer };
      setSurveyAnswers(updated);

      if (step === questions.length - 1) {
        // Final step: save to Supabase
        try {
          const { data, error } = await supabase.from("exitsurvey").insert([
            {
              primaryReason: updated.question1,
              insightRating: updated.question2,
              considerResubscribe: updated.question3,
              userId: userId,
            },
          ]);
          if (error) console.error("Error saving responses:", error.message);
          else {
            navigation.goBack();
            openSubscriptionSettings();
          }
        } catch (e) {
          console.error("Unexpected error:", e);
        }
      }

      setSelectedAnswer(null);

      if (step < questions.length - 1) {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: -50,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => setStep(step + 1));
      }
    }, 400);
  };

  const handleSkip = () => navigation.navigate("How");

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={["#101426", "#1A2240"]} style={styles.container}>
        <View style={styles.header}>
          <View style={styles.progressContainer}>
            {questions.map((_, i) => (
              <ProgressDot key={i} active={i === step} completed={i < step} />
            ))}
          </View>
          <Text style={styles.stepText}>
            Step {step + 1}/{questions.length}
          </Text>
        </View>

        <View style={styles.content}>
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
              width: "100%",
            }}
          >
            <View style={styles.headerRow}>
              <Image
                source={require("../assets/Activity.png")}
                style={{ width: 30, height: 30, marginRight: 15 }}
              />
              <Text style={styles.appTitle}>Parlay Pal</Text>
            </View>
            <Text style={styles.question}>{questions[step]}</Text>

            <View style={styles.answersContainer}>
              {answers[step].map((answer, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.answerButton,
                    selectedAnswer === idx && styles.selectedAnswer,
                  ]}
                  onPress={() => handleAnswerPress(answer, idx)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.answerText,
                      selectedAnswer === idx && styles.selectedAnswerText,
                    ]}
                  >
                    {answer}
                  </Text>
                  <View style={styles.chevronContainer}>
                    <ChevronRight />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#101426",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    alignSelf: "center",
  },
  appTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#ffffff",
  },
  container: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
  },
  header: {
    width: "100%",
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 10,
  },
  progressContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
  },
  stepText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
    fontWeight: "500",
  },
  content: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  question: {
    fontSize: 24,
    fontWeight: "600",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 32,
  },
  answersContainer: {
    width: "100%",
    marginTop: 10,
  },
  answerButton: {
    backgroundColor: "rgba(255,255,255,0.08)",
    paddingVertical: 18,
    paddingHorizontal: 22,
    borderRadius: 16,
    marginVertical: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  selectedAnswer: {
    backgroundColor: "#4F78FF",
    borderColor: "#6D8AFF",
  },
  answerText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
  },
  selectedAnswerText: {
    color: "#ffffff",
    fontWeight: "700",
  },
  chevronContainer: {
    opacity: 0.6,
  },
});
