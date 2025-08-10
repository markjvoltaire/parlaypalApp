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

// Section component for terms sections
const TermsSection = ({ title, children }) => (
  <View style={styles.termsSection}>
    <Text style={styles.termsSectionTitle}>{title}</Text>
    {children}
  </View>
);

// Paragraph component for terms text
const TermsParagraph = ({ children }) => (
  <Text style={styles.termsText}>{children}</Text>
);

// Numbered list item component
const NumberedItem = ({ number, children }) => (
  <View style={styles.numberedItem}>
    <Text style={styles.numberedItemNumber}>{number}.</Text>
    <Text style={styles.numberedItemText}>{children}</Text>
  </View>
);

export default function Terms({ navigation }) {
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
        <Text style={styles.headerTitle}>Terms of Service</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.lastUpdated}>
          <Text style={styles.lastUpdatedText}>
            Last Updated: March 1, 2025
          </Text>
        </View>

        <TermsSection title="1. Acceptance of Terms">
          <TermsParagraph>
            Welcome to Parlay Pal. These Terms of Service ("Terms") govern your
            access to and use of the Parlay Pal mobile application ("the
            Service"). By accessing or using the Service, you agree to be bound
            by these Terms. If you disagree with any part of the Terms, you may
            not access the Service.
          </TermsParagraph>
        </TermsSection>

        <TermsSection title="2. Service Description">
          <TermsParagraph>
            Parlay Pal is an AI-powered bet analysis application that provides
            analysis and insights on sports betting slips. The Service allows
            users to upload images of bet slips for analysis.
          </TermsParagraph>
          <TermsParagraph>
            The Service provides probability estimates and analytical insights
            based on available data. All analyses and recommendations provided
            by the Service are for informational purposes only and should not be
            considered as financial advice.
          </TermsParagraph>
        </TermsSection>

        <TermsSection title="3. User Accounts">
          <TermsParagraph>
            When you create an account with us, you must provide information
            that is accurate, complete, and current at all times. Failure to do
            so constitutes a breach of the Terms, which may result in immediate
            termination of your account.
          </TermsParagraph>
          <TermsParagraph>
            You are responsible for safeguarding the password you use to access
            the Service and for any activities or actions under your password.
            You agree not to disclose your password to any third party.
          </TermsParagraph>
        </TermsSection>

        <TermsSection title="4. Subscription Terms">
          <TermsParagraph>
            Some features of the Service require a subscription. You can
            subscribe to these features through in-app purchases.
          </TermsParagraph>
          <TermsParagraph>
            Subscriptions automatically renew unless auto-renew is turned off at
            least 24 hours before the end of the current period. Your account
            will be charged for renewal within 24 hours prior to the end of the
            current period.
          </TermsParagraph>
          <TermsParagraph>
            You can manage and cancel your subscriptions by going to your
            account settings on the App Store or Google Play Store.
          </TermsParagraph>
        </TermsSection>

        <TermsSection title="5. Content and Conduct">
          <TermsParagraph>
            Our Service allows you to upload images of bet slips. You are
            responsible for the content of these images and for complying with
            any applicable laws or regulations.
          </TermsParagraph>
          <TermsParagraph>You agree not to use the Service:</TermsParagraph>
          <NumberedItem number="a">
            To upload any content that is illegal, harmful, threatening,
            abusive, harassing, defamatory, vulgar, obscene, or otherwise
            objectionable.
          </NumberedItem>
          <NumberedItem number="b">
            To impersonate any person or entity or misrepresent your affiliation
            with a person or entity.
          </NumberedItem>
          <NumberedItem number="c">
            To engage in any activity that interferes with or disrupts the
            Service.
          </NumberedItem>
          <NumberedItem number="d">
            To attempt to bypass any measures we may use to prevent or restrict
            access to the Service.
          </NumberedItem>
        </TermsSection>

        <TermsSection title="6. Intellectual Property">
          <TermsParagraph>
            The Service and its original content, features, and functionality
            are and will remain the exclusive property of Parlay Pal and its
            licensors. The Service is protected by copyright, trademark, and
            other laws.
          </TermsParagraph>
          <TermsParagraph>
            Our trademarks and trade dress may not be used in connection with
            any product or service without the prior written consent of Parlay
            Pal.
          </TermsParagraph>
        </TermsSection>

        <TermsSection title="7. Disclaimer of Warranties">
          <TermsParagraph>
            The Service is provided on an "AS IS" and "AS AVAILABLE" basis.
            Parlay Pal makes no warranties, expressed or implied, regarding the
            accuracy, reliability, or completeness of any analysis or
            information provided through the Service.
          </TermsParagraph>
          <TermsParagraph>
            Parlay Pal does not guarantee that the Service will meet your
            requirements, be available on an uninterrupted, timely, secure, or
            error-free basis, or that the results that may be obtained from the
            use of the Service will be accurate or reliable.
          </TermsParagraph>
        </TermsSection>

        <TermsSection title="8. Limitation of Liability">
          <TermsParagraph>
            In no event shall Parlay Pal be liable for any indirect, incidental,
            special, consequential, or punitive damages, including without
            limitation, loss of profits, data, use, goodwill, or other
            intangible losses, resulting from:
          </TermsParagraph>
          <NumberedItem number="a">
            Your access to or use of or inability to access or use the Service.
          </NumberedItem>
          <NumberedItem number="b">
            Any conduct or content of any third party on the Service.
          </NumberedItem>
          <NumberedItem number="c">
            Any betting decisions made based on the analysis provided by the
            Service.
          </NumberedItem>
        </TermsSection>

        <TermsSection title="9. Responsible Gambling">
          <TermsParagraph>
            Parlay Pal promotes responsible gambling. The Service is intended
            for adults aged 18 or over (or the legal gambling age in your
            jurisdiction, whichever is higher). Users are responsible for
            ensuring they comply with all applicable laws regarding sports
            betting in their jurisdictions.
          </TermsParagraph>
          <TermsParagraph>
            We encourage users to set limits on their gambling activities and
            seek help if they believe they may have a gambling problem.
          </TermsParagraph>
        </TermsSection>

        <TermsSection title="10. Changes to Terms">
          <TermsParagraph>
            We reserve the right, at our sole discretion, to modify or replace
            these Terms at any time. If a revision is material, we will try to
            provide at least 30 days' notice prior to any new terms taking
            effect.
          </TermsParagraph>
          <TermsParagraph>
            Your continued use of the Service after we post any modifications to
            the Terms constitutes your acknowledgment of the modifications and
            your consent to abide and be bound by the modified Terms.
          </TermsParagraph>
        </TermsSection>

        <TermsSection title="11. Governing Law">
          <TermsParagraph>
            These Terms shall be governed and construed in accordance with the
            laws of the United States, without regard to its conflict of law
            provisions.
          </TermsParagraph>
          <TermsParagraph>
            Our failure to enforce any right or provision of these Terms will
            not be considered a waiver of those rights. If any provision of
            these Terms is held to be invalid or unenforceable by a court, the
            remaining provisions of these Terms will remain in effect.
          </TermsParagraph>
        </TermsSection>

        <TermsSection title="12. Contact Us">
          <TermsParagraph>
            If you have any questions about these Terms, please contact us at:
          </TermsParagraph>
          <TermsParagraph>Parlay Pal</TermsParagraph>
          <TermsParagraph>Email: parlaypalai@gmail.com</TermsParagraph>
        </TermsSection>

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
    backgroundColor: "#101113",
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
  termsSection: {
    marginBottom: 24,
  },
  termsSectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 12,
  },
  termsText: {
    fontSize: 14,
    lineHeight: 22,
    color: "#B0B7C8",
    marginBottom: 8,
  },
  numberedItem: {
    flexDirection: "row",
    marginBottom: 8,
    paddingLeft: 8,
  },
  numberedItemNumber: {
    fontSize: 14,
    lineHeight: 22,
    color: "#B0B7C8",
    width: 20,
  },
  numberedItemText: {
    fontSize: 14,
    lineHeight: 22,
    color: "#B0B7C8",
    flex: 1,
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
