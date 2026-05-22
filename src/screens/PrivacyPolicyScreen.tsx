/**
 * ReturnX - Privacy Policy Screen (Play Store Legal Compliance)
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { ScreenHeader } from '../components/ScreenHeader';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../constants/theme';

export default function PrivacyPolicyScreen() {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ScreenHeader title="🔒 Privacy Policy" subtitle="Aapka data sirf aapke phone mein" />

        <View style={styles.heroBanner}>
          <Text style={styles.heroIcon}>🔒</Text>
          <Text style={styles.heroTitle}>Your Privacy is Sacred</Text>
          <Text style={styles.heroSubtitle}>
            ReturnX does <Text style={styles.highlight}>NOT collect, store, or transmit</Text> any personal data to any server.
          </Text>
        </View>

        <View style={styles.section}>
          {[
            {
              icon: '📱',
              title: 'Data Stored Locally',
              body: 'All your calculation history and app preferences are stored only on your device using AsyncStorage (a local on-device database). This data never leaves your phone.',
            },
            {
              icon: '🚫',
              title: 'No Account Required',
              body: 'ReturnX does not require you to create an account, log in, or provide any personal information such as name, email, phone number, or Aadhaar.',
            },
            {
              icon: '🌐',
              title: 'No Internet Required',
              body: 'All calculations are performed offline, entirely on your device. The app works in Airplane mode and does not make any network requests.',
            },
            {
              icon: '📊',
              title: 'No Analytics Tracking',
              body: 'We do not use Google Analytics, Firebase Analytics, or any other analytics SDK to track your usage, behavior, or interactions within the app.',
            },
            {
              icon: '📍',
              title: 'No Device Permissions',
              body: 'ReturnX does not request access to your Location, Contacts, Camera, Microphone, or any other sensitive device permissions. We only use what is needed for the calculator to function.',
            },
            {
              icon: '📢',
              title: 'About Future Advertisements',
              body: 'If advertisements are enabled in a future version, third-party ad networks (such as Google AdMob) may use cookies or device identifiers to serve relevant ads. When this happens, this policy will be updated and users will be notified. Until then, no ad SDKs are active.',
            },
            {
              icon: '🗑️',
              title: 'Deleting Your Data',
              body: 'You can clear all locally stored data (calculation history) at any time from the History screen by tapping "Clear All". Uninstalling the app also permanently removes all local data.',
            },
            {
              icon: '✉️',
              title: 'Contact Us',
              body: 'If you have any questions about this privacy policy, please contact us at contact.returnx@gmail.com. As a small independent app, we are committed to your privacy.',
            },
          ].map((item, idx) => (
            <View key={idx} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardIcon}>{item.icon}</Text>
                <Text style={styles.cardTitle}>{item.title}</Text>
              </View>
              <Text style={styles.cardBody}>{item.body}</Text>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Effective Date: May 2026</Text>
          <Text style={styles.footerText}>ReturnX v1.0.0 | Made in India 🇮🇳</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primaryDark },
  content: { paddingBottom: SPACING.xxxl },
  heroBanner: { margin: SPACING.base, backgroundColor: 'rgba(0, 200, 83, 0.08)', borderRadius: RADIUS.xl, padding: SPACING.xl, borderWidth: 1, borderColor: COLORS.accent + '44', alignItems: 'center' },
  heroIcon: { fontSize: 48, marginBottom: SPACING.sm },
  heroTitle: { fontSize: TYPOGRAPHY.fontSize.xl, fontWeight: TYPOGRAPHY.fontWeight.bold, color: COLORS.textPrimary, marginBottom: SPACING.sm },
  heroSubtitle: { fontSize: TYPOGRAPHY.fontSize.base, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22 },
  highlight: { color: COLORS.accent, fontWeight: TYPOGRAPHY.fontWeight.bold },
  section: { padding: SPACING.base, gap: SPACING.md },
  card: { backgroundColor: COLORS.surfaceCard, borderRadius: RADIUS.lg, padding: SPACING.base, borderWidth: 1, borderColor: COLORS.border },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm },
  cardIcon: { fontSize: 20 },
  cardTitle: { fontSize: TYPOGRAPHY.fontSize.base, fontWeight: TYPOGRAPHY.fontWeight.bold, color: COLORS.textPrimary, flex: 1 },
  cardBody: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textSecondary, lineHeight: 20 },
  footer: { padding: SPACING.xl, alignItems: 'center', gap: 4 },
  footerText: { fontSize: TYPOGRAPHY.fontSize.xs, color: COLORS.textMuted },
});
