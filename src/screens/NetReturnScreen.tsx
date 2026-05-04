/**
 * ReturnX - Net Return Calculator
 * Evaluates parallel Investment and Loan to find Net Profit/Loss.
 */

import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { ScreenHeader } from '../components/ScreenHeader';
import { InputCard } from '../components/InputCard';
import { ResultCard } from '../components/ResultCard';
import { AdBannerPlaceholder } from '../components/AdBannerPlaceholder';
import { calcEMI } from '../logic/loan';
import { calcSIP } from '../logic/sip';
import { useAppStore } from '../store/appStore';
import { parseInput, isValidInput, formatINR, formatINRShort } from '../utils/format';
import { shareToWhatsApp } from '../utils/share';
import { ResultActions } from '../components/ResultActions';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../constants/theme';

export default function NetReturnScreen() {
  const [sipAmount, setSipAmount] = useState('10000');
  const [sipRate, setSipRate] = useState('12');
  
  const [loanAmount, setLoanAmount] = useState('1000000');
  const [loanRate, setLoanRate] = useState('9');
  
  const [years, setYears] = useState('10');

  const [loanResult, setLoanResult] = useState<ReturnType<typeof calcEMI> | null>(null);
  const [sipResult, setSipResult] = useState<ReturnType<typeof calcSIP> | null>(null);

  const { incrementCalcCount, saveCalculation } = useAppStore();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sipAmountRef = useRef(sipAmount);
  const sipRateRef = useRef(sipRate);
  const loanAmountRef = useRef(loanAmount);
  const loanRateRef = useRef(loanRate);
  const yearsRef = useRef(years);



  const calculate = () => {
    const SA = parseInput(sipAmountRef.current);
    const SR = parseInput(sipRateRef.current);
    const LA = parseInput(loanAmountRef.current);
    const LR = parseInput(loanRateRef.current);
    const Y = parseInput(yearsRef.current);

    if (!isValidInput(SA) || !isValidInput(SR) || !isValidInput(LA) || !isValidInput(LR) || !isValidInput(Y)) return;

    const sip = calcSIP(SA, SR, Y);
    const loan = calcEMI(LA, LR, Y * 12);

    setSipResult(sip);
    setLoanResult(loan);
  };

  const onPressCalculate = () => { calculate(); incrementCalcCount(); };

  const handleSave = () => {
    if (!sipResult || !loanResult) return;
    saveCalculation({
      type: 'NetReturn',
      label: `Net: ${formatINRShort(netReturn)}`,
      result: netReturn,
      inputs: { sip: parseInput(sipAmountRef.current), loan: parseInput(loanAmountRef.current), years: parseInput(yearsRef.current) },
    });
  };

  const handleShare = () => {
    if (!sipResult || !loanResult) return;
    shareToWhatsApp('Net Return Analysis', [
      `SIP Profit: ${formatINR(sipResult.totalReturns)}`,
      `Loan Interest: ${formatINR(loanResult.totalInterest)}`,
      `Tenure: ${yearsRef.current} Years`,
      `*Final Net Return: ${formatINR(netReturn)}*`,
      isPositive ? '✅ Profit exceeds Interest!' : '❌ Interest exceeds Profit'
    ]);
  };

  const handleInput = (setter: (v: string) => void, ref: React.MutableRefObject<string>) => (text: string) => {
    ref.current = text;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => calculate(), 300);
  };

  const netReturn = sipResult && loanResult ? sipResult.totalReturns - loanResult.totalInterest : 0;
  const isPositive = netReturn >= 0;

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <ScreenHeader title="⚖️ Net Return Calculator" subtitle="Investments Profit vs Loan Interest" />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📈 Your Investments (SIP)</Text>
          <InputCard label="Monthly SIP Amount" defaultValue={sipAmount} onChangeText={handleInput(setSipAmount, sipAmountRef)} prefix="₹" placeholder="10000" />
          <InputCard label="Expected Return Rate" defaultValue={sipRate} onChangeText={handleInput(setSipRate, sipRateRef)} suffix="%" placeholder="12" keyboardType="decimal-pad" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏦 Your Active Loan</Text>
          <InputCard label="Total Loan Amount" defaultValue={loanAmount} onChangeText={handleInput(setLoanAmount, loanAmountRef)} prefix="₹" placeholder="1000000" />
          <InputCard label="Loan Interest Rate" defaultValue={loanRate} onChangeText={handleInput(setLoanRate, loanRateRef)} suffix="%" placeholder="9" keyboardType="decimal-pad" />
        </View>

        <View style={styles.section}>
          <InputCard label="Time Period (Years)" defaultValue={years} onChangeText={handleInput(setYears, yearsRef)} suffix="Yrs" placeholder="10" />
        </View>

        <TouchableOpacity style={styles.calcBtn} onPress={onPressCalculate} activeOpacity={0.8}>
          <Text style={styles.calcBtnText}>Calculate Net Return 🚀</Text>
        </TouchableOpacity>

        {sipResult && loanResult && (
          <View style={styles.section}>
            <View style={styles.resultRow}>
              <View style={[styles.resultCard, styles.investResultCard]}>
                <Text style={styles.resultCardTitle}>Investment Profit</Text>
                <Text style={[styles.resultAmount, { color: COLORS.accent }]}>+{formatINRShort(sipResult.totalReturns)}</Text>
                <Text style={styles.resultSub}>From {formatINRShort(sipResult.totalInvested)}</Text>
              </View>
              <View style={[styles.resultCard, styles.loanResultCard]}>
                <Text style={styles.resultCardTitle}>Loan Interest Paid</Text>
                <Text style={[styles.resultAmount, { color: COLORS.risk }]}>-{formatINRShort(loanResult.totalInterest)}</Text>
                <Text style={styles.resultSub}>On {formatINRShort(parseInput(loanAmount))}</Text>
              </View>
            </View>

            <View style={[styles.netFlowCard, { borderColor: isPositive ? COLORS.accent : COLORS.risk }]}>
              <Text style={styles.netFlowLabel}>Final Net Return</Text>
              <Text style={[styles.netFlowAmount, { color: isPositive ? COLORS.accent : COLORS.risk }]}>
                {isPositive ? '+' : ''}{formatINR(netReturn)}
              </Text>
              <Text style={[styles.netFlowTag, { backgroundColor: (isPositive ? COLORS.accent : COLORS.risk) + '22', color: isPositive ? COLORS.accent : COLORS.risk }]}>
                {isPositive ? '✅ Profit exceeds Interest!' : '❌ You are losing money to interest'}
              </Text>
              <Text style={styles.disclaimer}>Net = Investment Profit - Loan Interest Paid.</Text>
            </View>

            <ResultActions onSave={handleSave} onShare={handleShare} />
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
  section: { paddingHorizontal: SPACING.base, marginBottom: SPACING.base },
  sectionTitle: { fontSize: TYPOGRAPHY.fontSize.sm, fontWeight: TYPOGRAPHY.fontWeight.bold, color: COLORS.textSecondary, marginBottom: SPACING.sm, marginLeft: SPACING.xs },
  calcBtn: { backgroundColor: COLORS.accent, borderRadius: RADIUS.lg, marginHorizontal: SPACING.base, paddingVertical: SPACING.base, alignItems: 'center', shadowColor: COLORS.accent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6, marginTop: SPACING.sm },
  calcBtnText: { color: COLORS.primary, fontSize: TYPOGRAPHY.fontSize.md, fontWeight: TYPOGRAPHY.fontWeight.bold, letterSpacing: 0.5 },
  resultRow: { flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.md },
  resultCard: { flex: 1, borderRadius: RADIUS.xl, padding: SPACING.base, borderWidth: 1 },
  loanResultCard: { backgroundColor: 'rgba(213, 0, 0, 0.08)', borderColor: COLORS.risk + '44' },
  investResultCard: { backgroundColor: 'rgba(0, 200, 83, 0.08)', borderColor: COLORS.accent + '44' },
  resultCardTitle: { fontSize: TYPOGRAPHY.fontSize.xs, color: COLORS.textSecondary, marginBottom: SPACING.xs, fontWeight: TYPOGRAPHY.fontWeight.bold },
  resultAmount: { fontSize: TYPOGRAPHY.fontSize.xl, fontWeight: TYPOGRAPHY.fontWeight.extrabold, marginBottom: SPACING.xs },
  resultSub: { fontSize: TYPOGRAPHY.fontSize.xs, color: COLORS.textSecondary },
  netFlowCard: { backgroundColor: COLORS.surfaceCard, borderRadius: RADIUS.xl, padding: SPACING.xl, marginTop: SPACING.md, borderWidth: 2, alignItems: 'center' },
  netFlowLabel: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textSecondary, marginBottom: SPACING.sm },
  netFlowAmount: { fontSize: 32, fontWeight: TYPOGRAPHY.fontWeight.extrabold, letterSpacing: -1, marginBottom: SPACING.sm },
  netFlowTag: { borderRadius: RADIUS.full, paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, fontSize: TYPOGRAPHY.fontSize.sm, fontWeight: TYPOGRAPHY.fontWeight.semibold, marginBottom: SPACING.md, textAlign: 'center' },
  disclaimer: { fontSize: TYPOGRAPHY.fontSize.xs, color: COLORS.textMuted, textAlign: 'center', fontStyle: 'italic' },
});
