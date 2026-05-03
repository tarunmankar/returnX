/**
 * ReturnX - History Screen
 * Saved calculations from AsyncStorage
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { ScreenHeader } from '../components/ScreenHeader';
import { useAppStore, HistoryEntry } from '../store/appStore';
import { formatINR, formatINRShort } from '../utils/format';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../constants/theme';

const CALC_ICONS: Record<string, string> = {
  SIP: '📈',
  LumpSum: '🪙',
  EMI: '🏦',
  SimpleInterest: '🧮',
  CompoundInterest: '⚡',
  ReducingBalance: '📊',
  Compare: '⚖️',
  SCSS: '👴',
  POMIS: '📮',
  SBIAnnuity: '🛡️',
  SSY: '👧',
  NSC: '📜',
  LIC: '💚',
};

const CALC_COLORS: Record<string, string> = {
  SIP: COLORS.accent,
  LumpSum: COLORS.accentLight,
  EMI: COLORS.warning,
  SimpleInterest: COLORS.chart2,
  CompoundInterest: COLORS.chart3,
  ReducingBalance: COLORS.chart4,
  Compare: COLORS.risk,
  SCSS: COLORS.chart2,
  POMIS: COLORS.warning,
  SBIAnnuity: COLORS.chart1,
  SSY: '#E91E63',
  NSC: COLORS.accentLight,
  LIC: '#E91E63',
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function HistoryScreen() {
  const { history, clearHistory } = useAppStore();

  const handleClear = () => {
    Alert.alert(
      'Clear History',
      'Are you sure? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: clearHistory },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ScreenHeader title="🕐 Calculation History" subtitle={`${history.length} saved calculations`} />
        {/* Clear All button */}
        {history.length > 0 && (
          <View style={styles.clearRow}>
            <TouchableOpacity onPress={handleClear} style={styles.clearBtn}>
              <Text style={styles.clearBtnText}>🗑️ Clear All</Text>
            </TouchableOpacity>
          </View>
        )}

        {history.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyTitle}>No History Yet</Text>
            <Text style={styles.emptySubtitle}>Your calculations will appear here once you start using the calculators.</Text>
            <TouchableOpacity onPress={() => router.back()} style={styles.emptyBtn}>
              <Text style={styles.emptyBtnText}>Start Calculating →</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.list}>
            {history.map((entry: HistoryEntry) => (
              <View key={entry.id} style={styles.historyCard}>
                <View style={[styles.iconBadge, { backgroundColor: (CALC_COLORS[entry.type] || COLORS.accent) + '22' }]}>
                  <Text style={styles.cardIcon}>{CALC_ICONS[entry.type] || '🧮'}</Text>
                </View>
                <View style={styles.cardBody}>
                  <Text style={styles.cardType}>{entry.type.replace(/([A-Z])/g, ' $1').trim()}</Text>
                  <Text style={styles.cardLabel} numberOfLines={1}>{entry.label}</Text>
                  <Text style={styles.cardDate}>{formatDate(entry.date)}</Text>
                </View>
                <View style={styles.cardResult}>
                  <Text style={[styles.cardAmount, { color: CALC_COLORS[entry.type] || COLORS.accent }]}>
                    {formatINRShort(entry.result)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <Text style={styles.privacyNote}>
          🔒 All data stored locally on your device. Never uploaded to any server.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primaryDark },
  content: { paddingBottom: SPACING.xxxl },
  clearRow: { paddingHorizontal: SPACING.base, paddingTop: SPACING.sm, alignItems: 'flex-end' },
  clearBtn: { backgroundColor: COLORS.risk + '22', borderRadius: RADIUS.md, paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderWidth: 1, borderColor: COLORS.risk + '55' },
  clearBtnText: { color: COLORS.risk, fontSize: TYPOGRAPHY.fontSize.sm, fontWeight: TYPOGRAPHY.fontWeight.semibold },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xxxl, marginTop: SPACING.xxxl },
  emptyIcon: { fontSize: 64, marginBottom: SPACING.base },
  emptyTitle: { fontSize: TYPOGRAPHY.fontSize.xl, fontWeight: TYPOGRAPHY.fontWeight.bold, color: COLORS.textPrimary, marginBottom: SPACING.sm },
  emptySubtitle: { fontSize: TYPOGRAPHY.fontSize.base, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22 },
  emptyBtn: { marginTop: SPACING.xl, backgroundColor: COLORS.accent, borderRadius: RADIUS.lg, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md },
  emptyBtnText: { color: COLORS.primary, fontWeight: TYPOGRAPHY.fontWeight.bold },
  list: { padding: SPACING.base, gap: SPACING.sm },
  historyCard: { backgroundColor: COLORS.surfaceCard, borderRadius: RADIUS.lg, padding: SPACING.md, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, gap: SPACING.md },
  iconBadge: { width: 44, height: 44, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center' },
  cardIcon: { fontSize: 22 },
  cardBody: { flex: 1 },
  cardType: { fontSize: TYPOGRAPHY.fontSize.xs, color: COLORS.textSecondary, fontWeight: TYPOGRAPHY.fontWeight.semibold, textTransform: 'uppercase', letterSpacing: 0.5 },
  cardLabel: { fontSize: TYPOGRAPHY.fontSize.base, color: COLORS.textPrimary, fontWeight: TYPOGRAPHY.fontWeight.medium, marginVertical: 2 },
  cardDate: { fontSize: TYPOGRAPHY.fontSize.xs, color: COLORS.textMuted },
  cardResult: { alignItems: 'flex-end' },
  cardAmount: { fontSize: TYPOGRAPHY.fontSize.lg, fontWeight: TYPOGRAPHY.fontWeight.bold },
  privacyNote: { textAlign: 'center', fontSize: TYPOGRAPHY.fontSize.xs, color: COLORS.textMuted, padding: SPACING.xl },
});
