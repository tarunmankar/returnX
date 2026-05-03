/**
 * ReturnX - Settings Screen
 * App preferences — risk thresholds, currency, display options
 */

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Switch, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { ScreenHeader } from '../components/ScreenHeader';
import Slider from '@react-native-community/slider';
import { useAppStore } from '../store/appStore';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../constants/theme';

const APP_VERSION = '1.0.0';

export default function SettingsScreen() {
  const { settings, updateSettings, clearHistory, history } = useAppStore();
  const [conservative, setConservative] = useState(settings.riskThresholds.conservative);
  const [moderate, setModerate] = useState(settings.riskThresholds.moderate);

  const saveThresholds = () => {
    updateSettings({ riskThresholds: { conservative, moderate } });
    Alert.alert('Saved! ✅', 'Risk thresholds updated successfully.');
  };

  const handleClearHistory = () => {
    Alert.alert(
      'History Mitayen?',
      `${history.length} calculations delete ho jayengi. Wapas nahi aayengi.`,
      [
        { text: 'Ruko', style: 'cancel' },
        { text: 'Haan, Mitao', style: 'destructive', onPress: clearHistory },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <ScreenHeader title="⚙️ Settings" subtitle="App Preferences" />

        {/* ── Risk Engine ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎯 Risk Engine</Text>
          <Text style={styles.sectionSubtitle}>
            Interest rate ke basis par Risk Badge ka color change hota hai. Apni pasand ke hisaab se set karein.
          </Text>

          <View style={styles.card}>
            <View style={styles.riskRow}>
              <View style={[styles.riskDot, { backgroundColor: COLORS.conservative }]} />
              <Text style={styles.riskLabel}>Conservative (Green)</Text>
              <Text style={[styles.riskValue, { color: COLORS.conservative }]}>≤ {conservative}%</Text>
            </View>
            <View style={styles.sliderContainer}>
              <Text style={styles.sliderMin}>1%</Text>
              <View style={{ flex: 1 }}>
                <View style={styles.sliderTrackBg} />
              </View>
              <Text style={styles.sliderMax}>20%</Text>
            </View>
            <Text style={styles.sliderHint}>Conservative limit: {conservative}% — Rates below this = Green badge</Text>

            <View style={[styles.riskRow, { marginTop: SPACING.base }]}>
              <View style={[styles.riskDot, { backgroundColor: COLORS.moderate }]} />
              <Text style={styles.riskLabel}>Moderate (Yellow)</Text>
              <Text style={[styles.riskValue, { color: COLORS.moderate }]}>{conservative + 1}% – {moderate}%</Text>
            </View>

            <View style={[styles.riskRow, { marginTop: SPACING.sm }]}>
              <View style={[styles.riskDot, { backgroundColor: COLORS.aggressive }]} />
              <Text style={styles.riskLabel}>Aggressive (Red)</Text>
              <Text style={[styles.riskValue, { color: COLORS.aggressive }]}>&gt; {moderate}%</Text>
            </View>

            {/* Manual buttons since Slider needs extra install */}
            <View style={styles.thresholdRow}>
              <View style={styles.thresholdControl}>
                <Text style={styles.thresholdLabel}>Conservative Limit</Text>
                <View style={styles.stepper}>
                  <TouchableOpacity style={styles.stepBtn} onPress={() => setConservative(Math.max(5, conservative - 1))}>
                    <Text style={styles.stepBtnText}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.stepValue}>{conservative}%</Text>
                  <TouchableOpacity style={styles.stepBtn} onPress={() => setConservative(Math.min(moderate - 1, conservative + 1))}>
                    <Text style={styles.stepBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.thresholdControl}>
                <Text style={styles.thresholdLabel}>Moderate Limit</Text>
                <View style={styles.stepper}>
                  <TouchableOpacity style={styles.stepBtn} onPress={() => setModerate(Math.max(conservative + 1, moderate - 1))}>
                    <Text style={styles.stepBtnText}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.stepValue}>{moderate}%</Text>
                  <TouchableOpacity style={styles.stepBtn} onPress={() => setModerate(Math.min(30, moderate + 1))}>
                    <Text style={styles.stepBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={saveThresholds}>
              <Text style={styles.saveBtnText}>Save Thresholds ✅</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Display ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🖥️ Display</Text>
          <View style={styles.card}>
            <View style={styles.toggleRow}>
              <View>
                <Text style={styles.toggleLabel}>Amortization Table Dikhao</Text>
                <Text style={styles.toggleSub}>EMI screen par table by default</Text>
              </View>
              <Switch
                value={settings.showAmortizationTable}
                onValueChange={(v) => updateSettings({ showAmortizationTable: v })}
                trackColor={{ false: COLORS.border, true: COLORS.accent + '80' }}
                thumbColor={settings.showAmortizationTable ? COLORS.accent : COLORS.gray500}
              />
            </View>
          </View>
        </View>

        {/* ── Data ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🗄️ Data</Text>
          <View style={styles.card}>
            <View style={styles.dataRow}>
              <View>
                <Text style={styles.toggleLabel}>Saved Calculations</Text>
                <Text style={styles.toggleSub}>{history.length} entries — sirf aapke phone mein</Text>
              </View>
              <TouchableOpacity
                style={styles.dangerBtn}
                onPress={handleClearHistory}
                disabled={history.length === 0}
              >
                <Text style={[styles.dangerBtnText, history.length === 0 && { opacity: 0.4 }]}>Clear</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ── App Info ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ℹ️ App Info</Text>
          <View style={styles.card}>
            {[
              { label: 'App Name', value: 'ReturnX' },
              { label: 'Version', value: APP_VERSION },
              { label: 'Package', value: 'com.returnx.calculator' },
              { label: 'Data Storage', value: '100% Local (Offline)' },
              { label: 'Cloud Data', value: 'None ✅' },
              { label: 'Ads', value: 'None (Coming Soon)' },
            ].map((item, i) => (
              <View key={i} style={[styles.infoRow, i > 0 && styles.infoRowBorder]}>
                <Text style={styles.infoLabel}>{item.label}</Text>
                <Text style={styles.infoValue}>{item.value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Quick Links ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📄 Legal</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.linkRow} onPress={() => router.push('/screens/disclaimer')}>
              <Text style={styles.linkText}>⚠️ Disclaimer</Text>
              <Text style={styles.linkArrow}>→</Text>
            </TouchableOpacity>
            <View style={styles.linkDivider} />
            <TouchableOpacity style={styles.linkRow} onPress={() => router.push('/screens/privacy')}>
              <Text style={styles.linkText}>🔒 Privacy Policy</Text>
              <Text style={styles.linkArrow}>→</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.footer}>Made with ❤️ in India 🇮🇳</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primaryDark },
  content: { paddingBottom: SPACING.xxxl },
  section: { padding: SPACING.base, paddingBottom: 0 },
  sectionTitle: { fontSize: TYPOGRAPHY.fontSize.md, fontWeight: TYPOGRAPHY.fontWeight.bold, color: COLORS.textPrimary, marginBottom: SPACING.xs },
  sectionSubtitle: { fontSize: TYPOGRAPHY.fontSize.xs, color: COLORS.textSecondary, marginBottom: SPACING.md, lineHeight: 18 },
  card: { backgroundColor: COLORS.surfaceCard, borderRadius: RADIUS.xl, padding: SPACING.base, borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.md },
  riskRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  riskDot: { width: 12, height: 12, borderRadius: RADIUS.full },
  riskLabel: { flex: 1, fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textSecondary },
  riskValue: { fontSize: TYPOGRAPHY.fontSize.sm, fontWeight: TYPOGRAPHY.fontWeight.bold },
  sliderContainer: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, marginTop: SPACING.sm },
  sliderMin: { fontSize: TYPOGRAPHY.fontSize.xs, color: COLORS.textMuted },
  sliderMax: { fontSize: TYPOGRAPHY.fontSize.xs, color: COLORS.textMuted },
  sliderTrackBg: { height: 4, backgroundColor: COLORS.border, borderRadius: RADIUS.full },
  sliderHint: { fontSize: TYPOGRAPHY.fontSize.xs, color: COLORS.textMuted, marginTop: 4 },
  thresholdRow: { flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.base },
  thresholdControl: { flex: 1 },
  thresholdLabel: { fontSize: TYPOGRAPHY.fontSize.xs, color: COLORS.textSecondary, marginBottom: SPACING.xs },
  stepper: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary, borderRadius: RADIUS.md, overflow: 'hidden' },
  stepBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.border },
  stepBtnText: { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.fontSize.xl, fontWeight: TYPOGRAPHY.fontWeight.bold },
  stepValue: { flex: 1, textAlign: 'center', color: COLORS.accent, fontWeight: TYPOGRAPHY.fontWeight.bold, fontSize: TYPOGRAPHY.fontSize.md },
  saveBtn: { backgroundColor: COLORS.accent, borderRadius: RADIUS.lg, padding: SPACING.md, alignItems: 'center', marginTop: SPACING.base },
  saveBtnText: { color: COLORS.primary, fontWeight: TYPOGRAPHY.fontWeight.bold },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  toggleLabel: { fontSize: TYPOGRAPHY.fontSize.base, color: COLORS.textPrimary, fontWeight: TYPOGRAPHY.fontWeight.medium },
  toggleSub: { fontSize: TYPOGRAPHY.fontSize.xs, color: COLORS.textSecondary, marginTop: 2 },
  dataRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dangerBtn: { backgroundColor: COLORS.risk + '22', borderRadius: RADIUS.md, paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderWidth: 1, borderColor: COLORS.risk + '55' },
  dangerBtnText: { color: COLORS.risk, fontWeight: TYPOGRAPHY.fontWeight.semibold, fontSize: TYPOGRAPHY.fontSize.sm },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: SPACING.sm },
  infoRowBorder: { borderTopWidth: 1, borderTopColor: COLORS.divider },
  infoLabel: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textSecondary },
  infoValue: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textPrimary, fontWeight: TYPOGRAPHY.fontWeight.medium },
  linkRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: SPACING.sm },
  linkText: { fontSize: TYPOGRAPHY.fontSize.base, color: COLORS.textPrimary },
  linkArrow: { color: COLORS.accent, fontSize: TYPOGRAPHY.fontSize.lg },
  linkDivider: { height: 1, backgroundColor: COLORS.divider },
  footer: { textAlign: 'center', fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textMuted, padding: SPACING.xl },
});
