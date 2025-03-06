import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import React from "react";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";

// Section component for policy sections
const PolicySection = ({ title, children }) => (
  <View style={styles.policySection}>
    <Text style={styles.policySectionTitle}>{title}</Text>
    {children}
  </View>
);

// Paragraph component for policy text
const PolicyParagraph = ({ children }) => (
  <Text style={styles.policyText}>{children}</Text>
);

export default function Privacy({ navigation }) {
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
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.lastUpdated}>
          <Text style={styles.lastUpdatedText}>
            Last Updated: March 1, 2025
          </Text>
        </View>

        <PolicySection title="Introduction">
          <PolicyParagraph>
            Welcome to Parlay Pal. We respect your privacy and are committed to
            protecting your personal data. This Privacy Policy explains how we
            collect, use, and safeguard your information when you use our mobile
            application.
          </PolicyParagraph>
          <PolicyParagraph>
            By using Parlay Pal, you consent to the data practices described in
            this policy. Please read this Privacy Policy carefully to understand
            our policies and practices regarding your information.
          </PolicyParagraph>
        </PolicySection>

        <PolicySection title="Information We Collect">
          <PolicyParagraph>
            We collect several types of information from and about users of our
            application, including:
          </PolicyParagraph>

          <Text style={styles.policySubtitle}>Personal Data</Text>
          <PolicyParagraph>
            • Contact information (email address) when you create an account
          </PolicyParagraph>
          <PolicyParagraph>
            • Payment information when you purchase a subscription (processed
            securely by third-party payment processors)
          </PolicyParagraph>

          <Text style={styles.policySubtitle}>Usage Data</Text>
          <PolicyParagraph>
            • Information about how you use our application
          </PolicyParagraph>
          <PolicyParagraph>
            • Device information, including device type, operating system, and
            browser type
          </PolicyParagraph>

          <Text style={styles.policySubtitle}>Bet Slip Data</Text>
          <PolicyParagraph>
            • Images of bet slips that you upload for analysis
          </PolicyParagraph>
          <PolicyParagraph>
            • Information extracted from bet slips including odds, stake
            amounts, and bet details
          </PolicyParagraph>
        </PolicySection>

        <PolicySection title="How We Use Your Information">
          <PolicyParagraph>
            We use the information we collect to:
          </PolicyParagraph>
          <PolicyParagraph>
            • Provide, maintain, and improve our application
          </PolicyParagraph>
          <PolicyParagraph>
            • Process transactions and manage your account
          </PolicyParagraph>
          <PolicyParagraph>
            • Analyze bet slips and provide statistical analysis and insights
          </PolicyParagraph>
          <PolicyParagraph>
            • Respond to your comments, questions, and requests
          </PolicyParagraph>
          <PolicyParagraph>• Develop new features and services</PolicyParagraph>
          <PolicyParagraph>
            • Monitor and analyze usage patterns and trends
          </PolicyParagraph>
        </PolicySection>

        <PolicySection title="Sharing Your Information">
          <PolicyParagraph>
            We do not sell or rent your personal information to third parties.
            We may share your information in the following circumstances:
          </PolicyParagraph>
          <PolicyParagraph>
            • With service providers who perform services on our behalf (e.g.,
            payment processing, data analysis)
          </PolicyParagraph>
          <PolicyParagraph>• To comply with legal obligations</PolicyParagraph>
          <PolicyParagraph>
            • To protect and defend our rights and property
          </PolicyParagraph>
          <PolicyParagraph>
            • With your consent or at your direction
          </PolicyParagraph>
        </PolicySection>

        <PolicySection title="Data Security">
          <PolicyParagraph>
            We implement appropriate technical and organizational measures to
            protect the security of your personal information. However, please
            be aware that no method of transmission over the internet or
            electronic storage is 100% secure.
          </PolicyParagraph>
        </PolicySection>

        <PolicySection title="Your Data Rights">
          <PolicyParagraph>
            Depending on your location, you may have certain rights regarding
            your personal information, including:
          </PolicyParagraph>
          <PolicyParagraph>• Access to your personal data</PolicyParagraph>
          <PolicyParagraph>• Correction of inaccurate data</PolicyParagraph>
          <PolicyParagraph>• Deletion of your data</PolicyParagraph>
          <PolicyParagraph>• Restriction of processing</PolicyParagraph>
          <PolicyParagraph>• Data portability</PolicyParagraph>
          <PolicyParagraph>
            To exercise these rights, please contact us at parlaypalai@gmail.com
          </PolicyParagraph>
        </PolicySection>

        <PolicySection title="Children's Privacy">
          <PolicyParagraph>
            Our application is not intended for children under 18 years of age.
            We do not knowingly collect personal information from children under
            18. If you are a parent or guardian and believe your child has
            provided us with personal information, please contact us.
          </PolicyParagraph>
        </PolicySection>

        <PolicySection title="Changes to Our Privacy Policy">
          <PolicyParagraph>
            We may update our Privacy Policy from time to time. We will notify
            you of any changes by posting the new Privacy Policy on this page
            and updating the "Last Updated" date. You are advised to review this
            Privacy Policy periodically for any changes.
          </PolicyParagraph>
        </PolicySection>

        <PolicySection title="Contact Us">
          <PolicyParagraph>
            If you have any questions about this Privacy Policy, please contact
            us at:
          </PolicyParagraph>
          <PolicyParagraph>Parlay Pal</PolicyParagraph>
          <PolicyParagraph>Email: parlaypalai@gmail.com</PolicyParagraph>
        </PolicySection>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © 2025 Parlay Pal. All rights reserved.
          </Text>
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
  lastUpdated: {
    marginBottom: 16,
  },
  lastUpdatedText: {
    fontSize: 14,
    fontStyle: "italic",
    color: "#8A94B0",
    textAlign: "center",
  },
  policySection: {
    marginBottom: 24,
  },
  policySectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 12,
  },
  policySubtitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#7789FF",
    marginTop: 12,
    marginBottom: 8,
  },
  policyText: {
    fontSize: 14,
    lineHeight: 22,
    color: "#B0B7C8",
    marginBottom: 8,
  },
  footer: {
    marginTop: 16,
    marginBottom: 40,
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    color: "#8A94B0",
  },
});
