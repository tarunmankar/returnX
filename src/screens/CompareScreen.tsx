/**
 * ReturnX - Loan vs Investment Compare Screen (Hero Feature)
 * Split view: EMI Out vs Investment In
 */

import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { ScreenHeader } from '../components/ScreenHeader';
import { InputCard } from '../components/InputCard';
import { AdBannerPlaceholder } from '../components/AdBannerPlaceholder';
import { calcEMI } from '../logic/loan';
import { calcSIP } from '../logic/sip';
import { useAppStore } from '../store/appStore';
import { parseInput, isValidInput, formatINR, formatINRShort } from '../utils/format';
import { shareToWhatsApp } from '../utils/share';
import { ResultActions } from '../components/ResultActions';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../constants/theme';

export default function CompareScreen() {
  // Loan side
  const [loanAmount, setLoanAmount] = useState('2000000');
  const [loanRate, setLoanRate] = useState('8.5');
  const [loanMonths, setLoanMonths] = useState('240');

  // Investment side
  const [investRate, setInvestRate] = useState('12');

  // Results
  const [loanResult, setLoanResult] = useState<ReturnType<typeof calcEMI> | null>(null);
  const [sipResult, setSipResult] = useState<ReturnType<typeof calcSIP> | null>(null);
  const { incrementCalcCount, saveCalculation } = useAppStore();
  
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  

  const loanAmountRef = useRef(loanAmount);
  const loanRateRef = useRef(loanRate);
  const loanMonthsRef = useRef(loanMonths);
  const investRateRef = useRef(investRate);


  const calculate = () => {
    const P = parseInput(loanAmountRef.current);
    const LR = parseInput(loanRateRef.current);
    const M = parseInput(loanMonthsRef.current);
    const IR = parseInput(investRateRef.current);
    const T = M / 12;

    if (!isValidInput(P) || LR < 0 || !isValidInput(M) || IR < 0) return;

    const loan = calcEMI(P, LR, M);
    const sip = calcSIP(loan.emi, IR, T);

    setLoanResult(loan);
    setSipResult(sip);
  };

  const onPressCalculate = () => { calculate(); incrementCalcCount(); };

  const handleSave = () => {
    if (!sipResult || !loanResult) return;
    saveCalculation({
      type: 'Compare',
      label: `Compare: ${formatINRShort(parseInput(loanAmountRef.current))} Loan`,
      result: netFlow,
      inputs: { loan: parseInput(loanAmountRef.current), rate: parseInput(loanRateRef.current), months: parseInput(loanMonthsRef.current) },
    });
  };

  const handleShare = () => {
    if (!sipResult || !loanResult) return;
    shareToWhatsApp('Loan vs Investment Compare', [
      `Loan Amount: ${formatINR(parseInput(loanAmountRef.current))}`,
      `Total Repayment: ${formatINR(loanResult.totalPayment)}`,
      `EMI Investment Value: ${formatINR(sipResult.futureValue)}`,
      `*Net Difference: ${formatINR(netFlow)}*`,
      isProfit ? '✅ Investing beats loan cost!' : '❌ Loan cost exceeds investment'
    ]);
  };

  const handleInput = (setter: (v: string) => void, ref: React.MutableRefObject<string>) => (text: string) => {
    ref.current = text;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => calculate(), 300);
  };

  // Net cash flow analysis
  const netFlow = sipResult && loanResult ? sipResult.futureValue - loanResult.totalPayment : 0;
  const isProfit = netFlow > 0;

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <ScreenHeader title="⚖️ Loan vs Invest" subtitle="What if you invested your EMI instead?" />

        {/* Two-column input section */}
        <View style={styles.splitRow}>
          {/* Loan Side */}
          <View style={[styles.splitCard, styles.loanCard]}>
            <Text style={styles.splitCardTitle}>🏦 LOAN OUT</Text>
          <InputCard
            label="Loan Amount"
            defaultValue={loanAmount}
            onChangeText={handleInput(setLoanAmount, loanAmountRef)} prefix="₹" placeholder="20,00,000" />
          <InputCard
            label="Loan Interest Rate"
            defaultValue={loanRate}
            onChangeText={handleInput(setLoanRate, loanRateRef)} prefix="" suffix="%" placeholder="8.5" keyboardType="decimal-pad" />
          <InputCard
            label="Loan Tenure (Months)"
            defaultValue={loanMonths}
            onChangeText={handleInput(setLoanMonths, loanMonthsRef)} prefix="" suffix="mo" placeholder="240" />
          </View>

          {/* Investment Side */}
          <View style={[styles.splitCard, styles.investCard]}>
            <Text style={styles.splitCardTitle}>📈 INVEST IN</Text>
            <Text style={styles.investNote}>What if EMI amount was invested in SIP?</Text>
          <InputCard
            label="Expected Return Rate"
            defaultValue={investRate}
            onChangeText={handleInput(setInvestRate, investRateRef)} prefix="" suffix="%" placeholder="12" keyboardType="decimal-pad" />
            <Text style={styles.investSubNote}>Duration = Loan tenure</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.calcBtn} onPress={onPressCalculate} activeOpacity={0.8}>
          <Text style={styles.calcBtnText}>Compare Now ⚖️</Text>
        </TouchableOpacity>

        {/* Results */}
        {loanResult && sipResult && (
          <View style={styles.section}>
            {/* Split result cards */}
            <View style={styles.resultRow}>
              <View style={[styles.resultCard, styles.loanResultCard]}>
                <Text style={styles.resultCardTitle}>💸 Loan Cost</Text>
                <Text style={[styles.resultAmount, { color: COLORS.risk }]}>{formatINRShort(loanResult.totalPayment)}</Text>
                <Text style={styles.resultSub}>EMI: {formatINR(loanResult.emi)}/mo</Text>
                <Text style={styles.resultSub}>Interest paid: {formatINRShort(loanResult.totalInterest)}</Text>
              </View>

              <View style={[styles.resultCard, styles.investResultCard]}>
                <Text style={styles.resultCardTitle}>🌱 SIP Value</Text>
                <Text style={[styles.resultAmount, { color: COLORS.accent }]}>{formatINRShort(sipResult.futureValue)}</Text>
                <Text style={styles.resultSub}>Invested: {formatINRShort(sipResult.totalInvested)}</Text>
                <Text style={styles.resultSub}>Returns: {formatINRShort(sipResult.totalReturns)}</Text>
              </View>
            </View>

            {/* Net Cash Flow */}
            <View style={[styles.netFlowCard, { borderColor: isProfit ? COLORS.accent : COLORS.risk }]}>
              <Text style={styles.netFlowLabel}>Net Cash Flow (Invest - Loan Cost)</Text>
              <Text style={[styles.netFlowAmount, { color: isProfit ? COLORS.accent : COLORS.risk }]}>
                {isProfit ? '+' : ''}{formatINR(netFlow)}
              </Text>
              <Text style={[styles.netFlowTag, { backgroundColor: (isProfit ? COLORS.accent : COLORS.risk) + '22', color: isProfit ? COLORS.accent : COLORS.risk }]}>
                {isProfit ? '✅ Investing beats loan cost!' : '❌ Loan cost exceeds investment value'}
              </Text>
              <Text style={styles.disclaimer}>Results are estimates. Not financial advice.</Text>
            </View>

            {/* Insight */}
            <View style={styles.insightCard}>
              <Text style={styles.insightTitle}>💡 Key Insight</Text>
              <Text style={styles.insightText}>
                If you invest your EMI of {formatINR(loanResult.emi)}/month at {investRate}% annual return for {Math.round(parseInput(loanMonthsRef.current) / 12)} years, you'd have{' '}
                <Text style={{ color: COLORS.accent, fontWeight: TYPOGRAPHY.fontWeight.bold }}>{formatINRShort(sipResult.futureValue)}</Text>
                {' '}vs paying{' '}
                <Text style={{ color: COLORS.risk, fontWeight: TYPOGRAPHY.fontWeight.bold }}>{formatINRShort(loanResult.totalPayment)}</Text>
                {' '}in loan repayments.
              </Text>
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
  splitRow: { flexDirection: 'row', padding: SPACING.md, gap: SPACING.md },
  splitCard: { flex: 1, borderRadius: RADIUS.xl, padding: SPACING.md, borderWidth: 1 },
  loanCard: { backgroundColor: 'rgba(213, 0, 0, 0.06)', borderColor: COLORS.risk + '44' },
  investCard: { backgroundColor: 'rgba(0, 200, 83, 0.06)', borderColor: COLORS.accent + '44' },
  splitCardTitle: { fontSize: TYPOGRAPHY.fontSize.xs, fontWeight: TYPOGRAPHY.fontWeight.extrabold, color: COLORS.textSecondary, letterSpacing: 1, marginBottom: SPACING.sm },
  investNote: { fontSize: TYPOGRAPHY.fontSize.xs, color: COLORS.textMuted, marginBottom: SPACING.sm, lineHeight: 16 },
  investSubNote: { fontSize: TYPOGRAPHY.fontSize.xs, color: COLORS.textMuted, marginTop: -SPACING.sm },
  calcBtn: { backgroundColor: COLORS.accent, borderRadius: RADIUS.lg, marginHorizontal: SPACING.base, paddingVertical: SPACING.base, alignItems: 'center', shadowColor: COLORS.accent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6 },
  calcBtnText: { color: COLORS.primary, fontSize: TYPOGRAPHY.fontSize.md, fontWeight: TYPOGRAPHY.fontWeight.bold, letterSpacing: 0.5 },
  section: { padding: SPACING.base },
  resultRow: { flexDirection: 'row', gap: SPACING.md },
  resultCard: { flex: 1, borderRadius: RADIUS.xl, padding: SPACING.base, borderWidth: 1 },
  loanResultCard: { backgroundColor: 'rgba(213, 0, 0, 0.08)', borderColor: COLORS.risk + '44' },
  investResultCard: { backgroundColor: 'rgba(0, 200, 83, 0.08)', borderColor: COLORS.accent + '44' },
  resultCardTitle: { fontSize: TYPOGRAPHY.fontSize.xs, color: COLORS.textSecondary, marginBottom: SPACING.xs, fontWeight: TYPOGRAPHY.fontWeight.bold },
  resultAmount: { fontSize: TYPOGRAPHY.fontSize.xxl, fontWeight: TYPOGRAPHY.fontWeight.extrabold, marginBottom: SPACING.xs },
  resultSub: { fontSize: TYPOGRAPHY.fontSize.xs, color: COLORS.textSecondary },
  netFlowCard: { backgroundColor: COLORS.surfaceCard, borderRadius: RADIUS.xl, padding: SPACING.xl, marginTop: SPACING.md, borderWidth: 2, alignItems: 'center' },
  netFlowLabel: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textSecondary, marginBottom: SPACING.sm },
  netFlowAmount: { fontSize: 36, fontWeight: TYPOGRAPHY.fontWeight.extrabold, letterSpacing: -1, marginBottom: SPACING.sm },
  netFlowTag: { borderRadius: RADIUS.full, paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, fontSize: TYPOGRAPHY.fontSize.sm, fontWeight: TYPOGRAPHY.fontWeight.semibold, marginBottom: SPACING.md },
  disclaimer: { fontSize: TYPOGRAPHY.fontSize.xs, color: COLORS.textMuted, textAlign: 'center', fontStyle: 'italic' },
  insightCard: { backgroundColor: COLORS.surfaceCard, borderRadius: RADIUS.xl, padding: SPACING.base, marginTop: SPACING.md, borderWidth: 1, borderColor: COLORS.border, borderLeftWidth: 3, borderLeftColor: COLORS.accent },
  insightTitle: { fontSize: TYPOGRAPHY.fontSize.sm, fontWeight: TYPOGRAPHY.fontWeight.bold, color: COLORS.textPrimary, marginBottom: SPACING.xs },
  insightText: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textSecondary, lineHeight: 20 },
});
