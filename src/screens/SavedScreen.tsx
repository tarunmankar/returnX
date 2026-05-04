/**
 * ReturnX - Saved Calculations Screen
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { ScreenHeader } from '../components/ScreenHeader';
import { useAppStore } from '../store/appStore';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../constants/theme';
import { formatINRShort } from '../utils/format';

export default function SavedScreen() {
  const { savedCalculations, removeSavedCalculation, loadHistory } = useAppStore();

  useEffect(() => {
    loadHistory(); // Also loads saved items
  }, []);

  const getEmoji = (type: string) => {
    const map: Record<string, string> = {
      SIP: '📈', LumpSum: '🪙', FD: '🏦', RD: '💳',
      EMI: '🏠', Compare: '⚖️', NetReturn: '🧾', StockProfit: '💹',
    };
    return map[type] || '🧮';
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ScreenHeader title="💾 Saved Calculations" subtitle="Your bookmarked estimates" />

        <View style={styles.list}>
          {savedCalculations.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>📂</Text>
              <Text style={styles.emptyTitle}>No Saved Items</Text>
              <Text style={styles.emptyText}>Tap the 'Save' button on any result card to bookmark it here.</Text>
            </View>
          ) : (
            savedCalculations.map((item) => (
              <View key={item.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardType}>{getEmoji(item.type)} {item.type}</Text>
                  <Text style={styles.cardDate}>{new Date(item.date).toLocaleDateString()}</Text>
                </View>
                
                <Text style={styles.cardLabel}>{item.label}</Text>
                
                <View style={styles.resultRow}>
                  <Text style={styles.resultValue}>{formatINRShort(item.result)}</Text>
                  <TouchableOpacity 
                    style={styles.deleteBtn}
                    onPress={() => removeSavedCalculation(item.id)}
                  >
                    <Text style={styles.deleteText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primaryDark },
  content: { paddingBottom: SPACING.xxxl },
  list: { padding: SPACING.base, gap: SPACING.md },
  emptyState: { alignItems: 'center', marginTop: SPACING.xxxl * 2, padding: SPACING.xl },
  emptyEmoji: { fontSize: 48, marginBottom: SPACING.md },
  emptyTitle: { fontSize: TYPOGRAPHY.fontSize.lg, fontWeight: TYPOGRAPHY.fontWeight.bold, color: COLORS.textPrimary, marginBottom: SPACING.sm },
  emptyText: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textMuted, textAlign: 'center', lineHeight: 20 },
  card: { backgroundColor: COLORS.surfaceCard, padding: SPACING.lg, borderRadius: RADIUS.xl, borderWidth: 1, borderColor: COLORS.border },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.xs },
  cardType: { color: COLORS.accent, fontWeight: TYPOGRAPHY.fontWeight.bold, fontSize: TYPOGRAPHY.fontSize.xs },
  cardDate: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.fontSize.xs },
  cardLabel: { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.fontSize.sm, marginBottom: SPACING.md, lineHeight: 20 },
  resultRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  resultValue: { fontSize: TYPOGRAPHY.fontSize.xxl, fontWeight: TYPOGRAPHY.fontWeight.extrabold, color: COLORS.textPrimary },
  deleteBtn: { backgroundColor: 'rgba(213,0,0,0.1)', paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderRadius: RADIUS.full },
  deleteText: { color: COLORS.risk, fontSize: TYPOGRAPHY.fontSize.xs, fontWeight: TYPOGRAPHY.fontWeight.bold },
});
