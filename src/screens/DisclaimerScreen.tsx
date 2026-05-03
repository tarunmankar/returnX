/**
 * ReturnX - Disclaimer Screen (Play Store Legal Compliance)
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { ScreenHeader } from '../components/ScreenHeader';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../constants/theme';

export default function DisclaimerScreen() {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ScreenHeader title="⚠️ Disclaimer" subtitle="Legal information" />

        <View style={styles.warningBanner}>
          <Text style={styles.warningIcon}>⚠️</Text>
          <Text style={styles.warningText}>
            ReturnX is a <Text style={styles.highlight}>mathematical calculator only</Text>. It is NOT a financial advisor, investment platform, or lending service.
          </Text>
        </View>

        <View style={styles.section}>
          {[
            {
              title: '1. Calculator, Not Advisor',
              body: 'All calculations in ReturnX are based on standard mathematical formulas. The app does not provide investment advice, financial planning guidance, or any form of financial recommendation.',
            },
            {
              title: '2. Results Are Estimates',
              body: 'All results shown in this app are mathematical estimates based on the inputs you provide. Actual returns from investments may vary significantly due to market conditions, inflation, taxes, and other factors.',
            },
            {
              title: '3. No Guarantee of Returns',
              body: 'Showing a projected return rate does not guarantee that such returns will be achieved. Past performance of any investment instrument is not indicative of future results.',
            },
            {
              title: '4. Consult a Professional',
              body: 'Before making any financial decision — including investments, loans, or insurance — please consult a qualified SEBI-registered financial advisor or certified financial planner.',
            },
            {
              title: '5. No Affiliation',
              body: 'ReturnX is not affiliated with any bank, mutual fund company, NBFC, or financial institution. Use of any bank or fund name in examples is purely for illustrative purposes.',
            },
            {
              title: '6. Tax Implications',
              body: 'This app does not account for tax implications. Returns from investments may be subject to capital gains tax, TDS, or other applicable taxes under Indian law.',
            },
          ].map((item, idx) => (
            <View key={idx} style={styles.card}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardBody}>{item.body}</Text>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Last updated: May 2026 | ReturnX v1.0.0</Text>
          <Text style={styles.footerSub}>Made in India 🇮🇳 for Indian investors</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primaryDark },
  content: { paddingBottom: SPACING.xxxl },
  warningBanner: { margin: SPACING.base, backgroundColor: 'rgba(255, 214, 0, 0.1)', borderRadius: RADIUS.lg, padding: SPACING.base, borderWidth: 1, borderColor: COLORS.warning + '55', flexDirection: 'row', gap: SPACING.sm, alignItems: 'flex-start' },
  warningIcon: { fontSize: 24 },
  warningText: { flex: 1, fontSize: TYPOGRAPHY.fontSize.base, color: COLORS.textSecondary, lineHeight: 22 },
  highlight: { color: COLORS.warning, fontWeight: TYPOGRAPHY.fontWeight.bold },
  section: { padding: SPACING.base, gap: SPACING.md },
  card: { backgroundColor: COLORS.surfaceCard, borderRadius: RADIUS.lg, padding: SPACING.base, borderWidth: 1, borderColor: COLORS.border },
  cardTitle: { fontSize: TYPOGRAPHY.fontSize.base, fontWeight: TYPOGRAPHY.fontWeight.bold, color: COLORS.textPrimary, marginBottom: SPACING.xs },
  cardBody: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textSecondary, lineHeight: 20 },
  footer: { padding: SPACING.xl, alignItems: 'center' },
  footerText: { fontSize: TYPOGRAPHY.fontSize.xs, color: COLORS.textMuted },
  footerSub: { fontSize: TYPOGRAPHY.fontSize.xs, color: COLORS.textMuted, marginTop: 4 },
});
