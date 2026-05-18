/**
 * ReturnX - Lump Sum Calculator Screen
 */

import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { router } from 'expo-router';
import { ScreenHeader } from '../components/ScreenHeader';
import { InputCard } from '../components/InputCard';
import { ResultCard } from '../components/ResultCard';
import { ResultActions } from '../components/ResultActions';
import { RiskBadge } from '../components/RiskBadge';
import { AdBannerPlaceholder } from '../components/AdBannerPlaceholder';
import { calcLumpSum } from '../logic/sip';
import { useAppStore } from '../store/appStore';
import { parseInput, isValidInput, formatINR, formatINRShort } from '../utils/format';
import { shareToWhatsApp } from '../utils/share';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../constants/theme';

export default function LumpSumScreen() {
  const [amount, setAmount] = useState('100000');
  const [rate, setRate] = useState('12');
  const [years, setYears] = useState('10');
  const [result, setResult] = useState<ReturnType<typeof calcLumpSum> | null>(null);
  const { incrementCalcCount, saveCalculation } = useAppStore();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const amountRef = useRef(amount);
  const rateRef = useRef(rate);
  const yearsRef = useRef(years);

  const calculate = () => {
    const P = parseInput(amountRef.current);
    const R = parseInput(rateRef.current);
    const T = parseInput(yearsRef.current);
    if (!isValidInput(P) || R < 0 || !isValidInput(T)) return;
    const res = calcLumpSum(P, R, T);
    setResult(res);
  };

  const onPressCalculate = () => { calculate(); incrementCalcCount(); };

  const handleSave = () => {
    if (!result) return;
    saveCalculation({
      type: 'LumpSum',
      label: `Lumpsum ${formatINRShort(parseInput(amountRef.current))} for ${yearsRef.current}Y`,
      result: result.futureValue,
      inputs: { amount: parseInput(amountRef.current), rate: parseInput(rateRef.current), years: parseInput(yearsRef.current) },
    });
  };

  const handleShare = () => {
    if (!result) return;
    shareToWhatsApp('Lump Sum Calculation', [
      `Investment Amount: ${formatINR(parseInput(amountRef.current))}`,
      `Expected Rate: ${rateRef.current}%`,
      `Duration: ${yearsRef.current} Years`,
      `*Total Invested: ${formatINR(result.totalInvested)}*`,
      `*Expected Returns: ${formatINR(result.totalReturns)}*`,
      `*Final Value: ${formatINR(result.futureValue)}*`
    ]);
  };

  const handleInput = (setter: (v: string) => void, ref: React.MutableRefObject<string>) => (text: string) => {
    ref.current = text;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setter(text);
      calculate();
    }, 300);
  };

  const R = parseInput(rate);

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <ScreenHeader title="🪙 Lump Sum Calculator" subtitle="One-time investment growth" />

        <View style={styles.section}>
          <InputCard
            label="Investment Amount"
            defaultValue={amount}
            onChangeText={handleInput(setAmount, amountRef)} prefix="₹" placeholder="1,00,000" />
          <InputCard
            label="Interest Rate"
            defaultValue={rate}
            onChangeText={handleInput(setRate, rateRef)} prefix="" suffix="%" placeholder="12" keyboardType="decimal-pad" hint="NIFTY 50 historical: ~12% p.a." />
          <InputCard
            label="Tenure (Years)"
            defaultValue={years}
            onChangeText={handleInput(setYears, yearsRef)} prefix="" suffix="Years" placeholder="10" />
          {R > 0 && <RiskBadge rate={R} showDescription />}
        </View>

        <TouchableOpacity style={styles.calcBtn} onPress={onPressCalculate} activeOpacity={0.8}>
          <Text style={styles.calcBtnText}>Calculate Growth 🚀</Text>
        </TouchableOpacity>

        {result && (
          <View style={styles.section}>
            <ResultCard
              title="Lump Sum Growth Summary"
              mainAmount={result.futureValue}
              mainLabel="Future Value"
              principalAmount={result.totalInvested}
              interestAmount={result.totalReturns}
              rows={[
                { label: 'Total Returns', value: result.totalReturns, highlight: true, color: COLORS.accent },
                { label: 'Wealth Multiplier', value: result.wealthRatio, isPercent: false, suffix: 'x', color: COLORS.accentLight },
              ]}
              disclaimer="Results are estimates. Not financial advice."
            />
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
  section: { padding: SPACING.base },
  calcBtn: { backgroundColor: COLORS.accent, borderRadius: RADIUS.lg, marginHorizontal: SPACING.base, paddingVertical: SPACING.base, alignItems: 'center', shadowColor: COLORS.accent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6 },
  calcBtnText: { color: COLORS.primary, fontSize: TYPOGRAPHY.fontSize.md, fontWeight: TYPOGRAPHY.fontWeight.bold, letterSpacing: 0.5 },
});
