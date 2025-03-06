import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Linking,
  Alert,
  Animated,
} from "react-native";
import React, { useState, useRef } from "react";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";

// FAQ Item Component with Animation
const FAQItem = ({ question, answer }) => {
  const [expanded, setExpanded] = useState(false);
  const animationHeight = useRef(new Animated.Value(0)).current;

  const toggleExpand = () => {
    if (expanded) {
      Animated.timing(animationHeight, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(animationHeight, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
    setExpanded(!expanded);
  };

  return (
    <View style={styles.faqItem}>
      <TouchableOpacity
        style={styles.faqQuestion}
        onPress={toggleExpand}
        activeOpacity={0.7}
      >
        <Text style={styles.faqQuestionText}>{question}</Text>
        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={20}
          color="#7789FF"
        />
      </TouchableOpacity>

      <Animated.View
        style={[
          styles.faqAnswer,
          {
            maxHeight: animationHeight.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 500],
            }),
            opacity: animationHeight,
          },
        ]}
      >
        <Text style={styles.faqAnswerText}>{answer}</Text>
      </Animated.View>
    </View>
  );
};

// Support Option Component
const SupportOption = ({ icon, title, subtitle, onPress }) => (
  <TouchableOpacity style={styles.supportOption} onPress={onPress}>
    <View style={styles.supportIconContainer}>
      <Ionicons name={icon} size={22} color="#7789FF" />
    </View>
    <View style={styles.supportTextContainer}>
      <Text style={styles.supportTitle}>{title}</Text>
      <Text style={styles.supportSubtitle}>{subtitle}</Text>
    </View>
    <Ionicons name="chevron-forward" size={20} color="#8A94B0" />
  </TouchableOpacity>
);

export default function Help({ navigation }) {
  const contactSupport = () => {
    Linking.openURL(
      "mailto:parlaypalai@gmail.com?subject=Support Request&body=Hello, I need help with"
    ).catch(() => {
      Alert.alert(
        "Cannot Open Email",
        "Please send an email to support@parlaypal.com manually."
      );
    });
  };

  const openTwitter = () => {
    Linking.openURL("https://twitter.com/parlaypal").catch(() => {
      Alert.alert(
        "Cannot Open Twitter",
        "Please visit https://twitter.com/parlaypal manually."
      );
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Contact Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <Text style={styles.sectionSubtitle}>
            Get in touch with our support team for personalized assistance
          </Text>

          <View style={styles.supportOptionsContainer}>
            <SupportOption
              icon="mail"
              title="Email Support"
              subtitle="Email us anytime"
              onPress={contactSupport}
            />
            {/* 
            <SupportOption
              icon="logo-twitter"
              title="Twitter"
              subtitle="@parlaypal"
              onPress={openTwitter}
            /> */}
          </View>
        </View>

        {/* FAQ Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>

          <FAQItem
            question="What is Parlay Pal?"
            answer="Parlay Pal is an AI-powered bet analysis app that helps you analyze bet slips by providing win probability estimates and detailed insights to make better betting decisions."
          />

          <FAQItem
            question="How do I analyze a bet slip?"
            answer="Simply take a photo of your bet slip or select an image from your gallery. Then tap the 'Analyze Bet Slip' button, and our AI will process the image and provide analysis results."
          />

          <FAQItem
            question="What information can Parlay Pal analyze?"
            answer="Parlay Pal can analyze parlay odds, stake amounts, individual bet types, and provide win probability estimates based on current odds. It works with major sports leagues including NBA, NFL, MLB and others."
          />

          <FAQItem
            question="Do I need a subscription to use Parlay Pal?"
            answer="While some basic features are available for free, a premium subscription is required to access full bet slip analysis features. Premium users get unlimited bet slip uploads and detailed insights."
          />

          <FAQItem
            question="How do I cancel my subscription?"
            answer="You can manage your subscription through your device's app store. Go to your profile, tap 'Manage Subscription', and you'll be directed to the appropriate subscription management page."
          />

          <FAQItem
            question="Is my data secure?"
            answer="Yes, we take data privacy very seriously. Your bet slips and analysis results are not shared with third parties. For more information, please review our Privacy Policy."
          />
        </View>

        {/* Troubleshooting Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Troubleshooting</Text>

          <FAQItem
            question="The app is having trouble recognizing my bet slip"
            answer="For best results, ensure your image is clear, well-lit, and the entire bet slip is visible in the frame. Try taking the photo again or selecting a clearer image from your gallery."
          />

          <FAQItem
            question="I'm experiencing connection errors"
            answer="Check your internet connection and try again. If problems persist, try closing the app completely and reopening it. Make sure you have the latest version of the app installed."
          />

          <FAQItem
            question="The analysis results seem incorrect"
            answer="Our AI strives for accuracy but may occasionally misinterpret certain elements. Double-check your bet slip details against the analysis. If you believe there's an error, you can take a new photo and try again."
          />
        </View>

        {/* About */}
        <View style={styles.versionInfo}>
          <Text style={styles.versionText}>Parlay Pal v1.0.0</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Privacy")}>
            <Text style={styles.linkText}>Privacy Policy</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("Terms")}>
            <Text style={styles.linkText}>Terms of Service</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#101426",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#8A94B0",
    marginBottom: 16,
  },
  supportOptionsContainer: {
    backgroundColor: "#1C2135",
    borderRadius: 12,
    overflow: "hidden",
  },
  supportOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  supportIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(79, 99, 232, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  supportTextContainer: {
    flex: 1,
  },
  supportTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#ffffff",
    marginBottom: 2,
  },
  supportSubtitle: {
    fontSize: 14,
    color: "#8A94B0",
  },
  faqItem: {
    backgroundColor: "#1C2135",
    borderRadius: 12,
    marginBottom: 8,
    overflow: "hidden",
  },
  faqQuestion: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  faqQuestionText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#ffffff",
    flex: 1,
    marginRight: 8,
  },
  faqAnswer: {
    paddingHorizontal: 16,
    overflow: "hidden",
  },
  faqAnswerText: {
    fontSize: 14,
    color: "#B0B7C8",
    lineHeight: 20,
    paddingBottom: 16,
  },
  versionInfo: {
    alignItems: "center",
    marginVertical: 24,
  },
  versionText: {
    fontSize: 12,
    color: "#8A94B0",
    marginBottom: 8,
  },
  linkText: {
    fontSize: 14,
    color: "#7789FF",
    marginVertical: 4,
  },
});
