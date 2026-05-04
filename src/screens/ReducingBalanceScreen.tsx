/**
 * ReturnX - Reducing Balance Screen
 */

import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { ScreenHeader } from '../components/ScreenHeader';
import { InputCard } from '../components/InputCard';
import { ResultCard } from '../components/ResultCard';
import { RiskBadge } from '../components/RiskBadge';
import { AdBannerPlaceholder } from '../components/AdBannerPlaceholder';
import { calcReducingBalance, calcReducingBalanceSummary } from '../logic/reduce';
import { useAppStore } from '../store/appStore';
import { parseInput, isValidInput, formatINR, formatINRShort } from '../utils/format';
import { shareToWhatsApp } from '../utils/share';
import { ResultActions } from '../components/ResultActions';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../constants/theme';

export default function ReducingBalanceScreen() {
  const [principal, setPrincipal] = useState('500000');
  const [rate, setRate] = useState('10');
  const [months, setMonths] = useState('24');
  const [summary, setSummary] = useState<ReturnType<typeof calcReducingBalanceSummary> | null>(null);
  const [schedule, setSchedule] = useState<ReturnType<typeof calcReducingBalance>>([]);
  const [showTable, setShowTable] = useState(false);
  const { incrementCalcCount, saveCalculation } = useAppStore();
  
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  

  const principalRef = useRef(principal);
  const rateRef = useRef(rate);
  const monthsRef = useRef(months);


  const calculate = () => {
    const P = parseInput(principalRef.current);
    const R = parseInput(rateRef.current);
    const M = parseInput(monthsRef.current);
    if (!isValidInput(P) || R < 0 || !isValidInput(M)) return;
    const sum = calcReducingBalanceSummary(P, R, M);
    const sched = calcReducingBalance(P, R, M);
    setSummary(sum);
    setSchedule(sched);
  };

  const onPressCalculate = () => { calculate(); incrementCalcCount(); };

  const handleSave = () => {
    if (!summary) return;
    saveCalculation({
      type: 'ReducingBalance',
      label: `Reduce: ${formatINRShort(parseInput(principalRef.current))}`,
      result: summary.emi,
      inputs: { principal: parseInput(principalRef.current), rate: parseInput(rateRef.current), months: parseInput(monthsRef.current) },
    });
  };

  const handleShare = () => {
    if (!summary) return;
    shareToWhatsApp('Reducing Balance', [
      `Principal: ${formatINR(parseInput(principalRef.current))}`,
      `Interest Rate: ${rateRef.current}%`,
      `Tenure: ${monthsRef.current} Months`,
      `*Monthly EMI: ${formatINR(summary.emi)}*`,
      `*Total Interest: ${formatINR(summary.totalInterest)}*`
    ]);
  };

  const handleInput = (setter: (v: string) => void, ref: React.MutableRefObject<string>) => (text: string) => {
    ref.current = text;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => calculate(), 300);
  };

  const R = parseInput(rateRef.current);

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <ScreenHeader title="📊 Reducing Balance" subtitle="Interest charged on outstanding principal" />

        <View style={styles.section}>
          <InputCard
            label="Deposit Amount"
            defaultValue={principal}
            onChangeText={handleInput(setPrincipal, principalRef)} prefix="₹" placeholder="5,00,000" />
          <InputCard
            label="Interest Rate"
            defaultValue={rate}
            onChangeText={handleInput(setRate, rateRef)} prefix="" suffix="%" placeholder="10" keyboardType="decimal-pad" />
          <InputCard
            label="Duration (Months)"
            defaultValue={months}
            onChangeText={handleInput(setMonths, monthsRef)} prefix="" suffix="Months" placeholder="24" />
          {R > 0 && <RiskBadge rate={R} showDescription />}
        </View>

        <TouchableOpacity style={styles.calcBtn} onPress={onPressCalculate} activeOpacity={0.8}>
          <Text style={styles.calcBtnText}>Calculate 📊</Text>
        </TouchableOpacity>

        {summary && (
          <View style={styles.section}>
            <ResultCard
              title="Reducing Balance Summary"
              mainAmount={summary.emi}
              mainLabel="Monthly EMI"
              rows={[
                { label: 'Total Principal', value: summary.totalPrincipal },
                { label: 'Total Interest', value: summary.totalInterest, color: COLORS.risk },
                { label: 'Interest % of Total', value: summary.interestPercentage, isPercent: true, color: COLORS.warning },
                { label: 'Effective Cost', value: summary.effectiveCost, isPercent: false, suffix: 'x', color: COLORS.accentLight },
              ]}
              disclaimer="Results are estimates. Not financial advice."
            />
            <ResultActions onSave={handleSave} onShare={handleShare} />

            {schedule.length > 0 && (
              <TouchableOpacity style={styles.tableToggle} onPress={() => setShowTable(!showTable)}>
                <Text style={styles.tableToggleText}>{showTable ? '▲ Hide' : '▼ Show'} Monthly Schedule</Text>
              </TouchableOpacity>
            )}

            {showTable && (
              <View style={styles.tableCard}>
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableHeaderText, { flex: 0.5 }]}>Mo</Text>
                  <Text style={styles.tableHeaderText}>Principal</Text>
                  <Text style={styles.tableHeaderText}>Interest</Text>
                  <Text style={styles.tableHeaderText}>Balance</Text>
                </View>
                {schedule.slice(0, 24).map((row) => (
                  <View key={row.month} style={styles.tableRow}>
                    <Text style={[styles.tableCell, { flex: 0.5, color: COLORS.textSecondary }]}>{row.month}</Text>
                    <Text style={[styles.tableCell, { color: COLORS.accent }]}>{formatINR(row.principal)}</Text>
                    <Text style={[styles.tableCell, { color: COLORS.risk }]}>{formatINR(row.interest)}</Text>
                    <Text style={styles.tableCell}>{formatINR(row.closingBalance)}</Text>
                  </View>
                ))}
                {schedule.length > 24 && (
                  <Text style={styles.truncatedNote}>Showing first 24 months of {schedule.length}</Text>
                )}
              </View>
            )}
          </View>
        )}
        <AdBannerPlaceholder size="banner" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primaryDark },
  content: { paddingBottom: SPACING.xxxl },
  section: { padding: SPACING.base },
  calcBtn: { backgroundColor: COLORS.accent, borderRadius: RADIUS.lg, marginHorizontal: SPACING.base, paddingVertical: SPACING.base, alignItems: 'center', shadowColor: COLORS.accent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6 },
  calcBtnText: { color: COLORS.primary, fontSize: TYPOGRAPHY.fontSize.md, fontWeight: TYPOGRAPHY.fontWeight.bold, letterSpacing: 0.5 },
  tableToggle: { backgroundColor: COLORS.surfaceCard, borderRadius: RADIUS.md, padding: SPACING.md, alignItems: 'center', marginTop: SPACING.sm, borderWidth: 1, borderColor: COLORS.border },
  tableToggleText: { color: COLORS.accent, fontWeight: TYPOGRAPHY.fontWeight.semibold, fontSize: TYPOGRAPHY.fontSize.sm },
  tableCard: { backgroundColor: COLORS.surfaceCard, borderRadius: RADIUS.xl, overflow: 'hidden', marginTop: SPACING.sm, borderWidth: 1, borderColor: COLORS.border },
  tableHeader: { flexDirection: 'row', backgroundColor: COLORS.primary, padding: SPACING.sm },
  tableHeaderText: { flex: 1, color: COLORS.textSecondary, fontSize: TYPOGRAPHY.fontSize.xs, fontWeight: TYPOGRAPHY.fontWeight.bold, textAlign: 'center' },
  tableRow: { flexDirection: 'row', padding: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.divider },
  tableCell: { flex: 1, fontSize: TYPOGRAPHY.fontSize.xs, color: COLORS.textPrimary, textAlign: 'center' },
  truncatedNote: { textAlign: 'center', fontSize: TYPOGRAPHY.fontSize.xs, color: COLORS.textMuted, padding: SPACING.sm },
});
