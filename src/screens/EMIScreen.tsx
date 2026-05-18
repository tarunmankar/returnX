/**
 * ReturnX - EMI Calculator Screen
 */

import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform, FlatList,
} from 'react-native';
import { router } from 'expo-router';
import { ScreenHeader } from '../components/ScreenHeader';
import { InputCard } from '../components/InputCard';
import { ResultCard } from '../components/ResultCard';
import { ResultActions } from '../components/ResultActions';
import { AdBannerPlaceholder } from '../components/AdBannerPlaceholder';
import { calcAmortizationYearly, calcEMI, calcLoanPrepaymentImpact, PrepaymentImpactResult } from '../logic/loan';
import { useAppStore } from '../store/appStore';
import { parseInput, isValidInput, formatINR, formatINRShort } from '../utils/format';
import { shareToWhatsApp } from '../utils/share';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../constants/theme';

export default function EMIScreen() {
  const [principal, setPrincipal] = useState('2000000');
  const [rate, setRate] = useState('8.5');
  const [tenure, setTenure] = useState('240');
  const [extraPayment, setExtraPayment] = useState('0');
  const [prepayStartMonth, setPrepayStartMonth] = useState('1');
  const [result, setResult] = useState<ReturnType<typeof calcEMI> | null>(null);
  const [yearlyBreakdown, setYearlyBreakdown] = useState<ReturnType<typeof calcAmortizationYearly>>([]);
  const [prepaymentImpact, setPrepaymentImpact] = useState<PrepaymentImpactResult | null>(null);
  const [showTable, setShowTable] = useState(false);
  const { incrementCalcCount, saveCalculation } = useAppStore();
  
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  

  const principalRef = useRef(principal);
  const rateRef = useRef(rate);
  const tenureRef = useRef(tenure);
  const extraPaymentRef = useRef(extraPayment);
  const prepayStartRef = useRef(prepayStartMonth);


  const calculate = () => {
    const P = parseInput(principalRef.current);
    const R = parseInput(rateRef.current);
    const M = parseInput(tenureRef.current);
    const extra = parseInput(extraPaymentRef.current);
    const startMonth = parseInput(prepayStartRef.current);
    if (!isValidInput(P) || R < 0 || !isValidInput(M)) return;
    const res = calcEMI(P, R, M);
    setResult(res);
    setYearlyBreakdown(calcAmortizationYearly(P, R, M));
    setPrepaymentImpact(calcLoanPrepaymentImpact(P, R, M, extra, startMonth));
  };

  const onPressCalculate = () => { calculate(); incrementCalcCount(); };

  const handleSave = () => {
    if (!result) return;
    saveCalculation({
      type: 'EMI',
      label: `EMI for ${formatINRShort(parseInput(principalRef.current))} Loan`,
      result: result.emi,
      inputs: { principal: parseInput(principalRef.current), rate: parseInput(rateRef.current), months: parseInput(tenureRef.current) },
    });
  };

  const handleShare = () => {
    if (!result) return;
    shareToWhatsApp('EMI Calculation', [
      `Loan Amount: ${formatINR(parseInput(principalRef.current))}`,
      `Interest Rate: ${rateRef.current}%`,
      `Tenure: ${tenureRef.current} Months`,
      `Extra Prepayment: ${formatINR(parseInput(extraPaymentRef.current))}/month`,
      `*Monthly EMI: ${formatINR(result.emi)}*`,
      `*Total Interest: ${formatINR(result.totalInterest)}*`,
      `*Total Payment: ${formatINR(result.totalPayment)}*`
    ]);
  };

  const handleInput = (setter: (v: string) => void, ref: React.MutableRefObject<string>) => (text: string) => {
    ref.current = text;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => calculate(), 300);
  };

  const R = parseInput(rateRef.current);

  return (
    <View style={styles.container}>
      <ScreenHeader title="🏦 EMI Calculator" subtitle="Equated Monthly Installment" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.section}>
          <InputCard
            label="Deposit Amount"
            defaultValue={principal}
            onChangeText={handleInput(setPrincipal, principalRef)} prefix="₹" placeholder="20,00,000" hint="Home, Car, Personal loan etc." />
          <InputCard
            label="Interest Rate"
            defaultValue={rate}
            onChangeText={handleInput(setRate, rateRef)} prefix="" suffix="% p.a." placeholder="8.5" keyboardType="decimal-pad" hint="Check your bank's current rate" />
          <InputCard
            label="Tenure (Years)"
            defaultValue={tenure}
            onChangeText={handleInput(setTenure, tenureRef)} prefix="" suffix="Months" placeholder="240" hint="240 months = 20 years" />
          <InputCard
            label="Extra Prepayment / Month"
            defaultValue={extraPayment}
            onChangeText={handleInput(setExtraPayment, extraPaymentRef)} prefix="₹" placeholder="0" hint="Optional EMI ke upar extra payment" />
          <InputCard
            label="Prepayment Start Month"
            defaultValue={prepayStartMonth}
            onChangeText={handleInput(setPrepayStartMonth, prepayStartRef)} prefix="" suffix="Month" placeholder="1" hint="Kis month se extra payment start hogi" />
        </View>

        <TouchableOpacity style={styles.calcBtn} onPress={onPressCalculate} activeOpacity={0.8}>
          <Text style={styles.calcBtnText}>Calculate EMI 💸</Text>
        </TouchableOpacity>

        {result && (
          <View style={styles.section}>
            <ResultCard
              title="EMI Breakdown"
              mainAmount={result.emi}
              mainLabel="Monthly EMI"
              accentColor={COLORS.warning}
              rows={[
                { label: 'Loan Amount', value: result.principal },
                { label: 'Total Interest', value: result.totalInterest, color: COLORS.risk },
                { label: 'Total Payment', value: result.totalPayment, highlight: true },
                { label: 'Tenure', value: result.months, isPercent: false, suffix: ' months' },
              ]}
              disclaimer="Results are estimates. Not financial advice."
            />

            {/* Interest vs Principal Donut-style bar */}
            <View style={styles.barCard}>
              <Text style={styles.barTitle}>Principal vs Interest</Text>
              <View style={styles.bar}>
                <View style={[styles.barFill, { flex: result.principal, backgroundColor: COLORS.accent }]} />
                <View style={[styles.barFill, { flex: result.totalInterest, backgroundColor: COLORS.risk }]} />
              </View>
              <View style={styles.barLegend}>
                <View style={styles.legendItem}>
                  <View style={[styles.dot, { backgroundColor: COLORS.accent }]} />
                  <Text style={styles.legendText}>Principal {formatINR(result.principal)}</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.dot, { backgroundColor: COLORS.risk }]} />
                  <Text style={styles.legendText}>Interest {formatINR(result.totalInterest)}</Text>
                </View>
              </View>
            </View>

            <ResultActions onSave={handleSave} onShare={handleShare} />

            {prepaymentImpact && prepaymentImpact.extraMonthly > 0 && (
              <ResultCard
                title="Prepayment Impact"
                mainAmount={prepaymentImpact.interestSaved}
                mainLabel="Estimated Interest Saved"
                accentColor={COLORS.accent}
                rows={[
                  { label: 'Extra Payment / Month', value: prepaymentImpact.extraMonthly },
                  { label: 'Revised Loan Closure', value: prepaymentImpact.revisedMonths, suffix: ' months' },
                  { label: 'Months Saved', value: prepaymentImpact.monthsSaved, suffix: ' months', color: COLORS.accent },
                  { label: 'Revised Total Interest', value: prepaymentImpact.revisedTotalInterest, color: COLORS.risk },
                ]}
                disclaimer="Prepayment estimate assumes the same interest rate through the full loan tenure."
              />
            )}

            {/* Yearly breakdown table toggle */}
            {yearlyBreakdown.length > 0 && (
              <TouchableOpacity style={styles.tableToggle} onPress={() => setShowTable(!showTable)}>
                <Text style={styles.tableToggleText}>{showTable ? '▲ Hide' : '▼ Show'} Yearly Breakdown</Text>
              </TouchableOpacity>
            )}

            {showTable && yearlyBreakdown.length > 0 && (
              <View style={styles.tableCard}>
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableHeaderText, { flex: 0.5 }]}>Yr</Text>
                  <Text style={styles.tableHeaderText}>Principal</Text>
                  <Text style={styles.tableHeaderText}>Interest</Text>
                  <Text style={styles.tableHeaderText}>Balance</Text>
                </View>
                {yearlyBreakdown.map((row) => (
                  <View key={row.year} style={styles.tableRow}>
                    <Text style={[styles.tableCell, { flex: 0.5, color: COLORS.textSecondary }]}>{row.year}</Text>
                    <Text style={[styles.tableCell, { color: COLORS.accent }]}>{formatINR(row.principalPaid)}</Text>
                    <Text style={[styles.tableCell, { color: COLORS.risk }]}>{formatINR(row.interestPaid)}</Text>
                    <Text style={styles.tableCell}>{formatINR(row.balance)}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        <AdBannerPlaceholder size="banner" />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primaryDark },
  content: { paddingBottom: SPACING.xxxl },
  section: { padding: SPACING.base },
  calcBtn: { backgroundColor: COLORS.warning, borderRadius: RADIUS.lg, marginHorizontal: SPACING.base, paddingVertical: SPACING.base, alignItems: 'center', shadowColor: COLORS.warning, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6 },
  calcBtnText: { color: COLORS.primary, fontSize: TYPOGRAPHY.fontSize.md, fontWeight: TYPOGRAPHY.fontWeight.bold, letterSpacing: 0.5 },
  barCard: { backgroundColor: COLORS.surfaceCard, borderRadius: RADIUS.xl, padding: SPACING.base, borderWidth: 1, borderColor: COLORS.border, marginTop: SPACING.sm },
  barTitle: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textSecondary, marginBottom: SPACING.md, fontWeight: TYPOGRAPHY.fontWeight.semibold },
  bar: { flexDirection: 'row', height: 16, borderRadius: RADIUS.full, overflow: 'hidden', backgroundColor: COLORS.border },
  barFill: { height: 16 },
  barLegend: { flexDirection: 'row', justifyContent: 'space-between', marginTop: SPACING.sm, flexWrap: 'wrap' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  dot: { width: 10, height: 10, borderRadius: RADIUS.full },
  legendText: { fontSize: TYPOGRAPHY.fontSize.xs, color: COLORS.textSecondary },
  tableToggle: { backgroundColor: COLORS.surfaceCard, borderRadius: RADIUS.md, padding: SPACING.md, alignItems: 'center', marginTop: SPACING.sm, borderWidth: 1, borderColor: COLORS.border },
  tableToggleText: { color: COLORS.accent, fontWeight: TYPOGRAPHY.fontWeight.semibold, fontSize: TYPOGRAPHY.fontSize.sm },
  tableCard: { backgroundColor: COLORS.surfaceCard, borderRadius: RADIUS.xl, overflow: 'hidden', marginTop: SPACING.sm, borderWidth: 1, borderColor: COLORS.border },
  tableHeader: { flexDirection: 'row', backgroundColor: COLORS.primary, padding: SPACING.sm },
  tableHeaderText: { flex: 1, color: COLORS.textSecondary, fontSize: TYPOGRAPHY.fontSize.xs, fontWeight: TYPOGRAPHY.fontWeight.bold, textAlign: 'center' },
  tableRow: { flexDirection: 'row', padding: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.divider },
  tableCell: { flex: 1, fontSize: TYPOGRAPHY.fontSize.xs, color: COLORS.textPrimary, textAlign: 'center' },
});
