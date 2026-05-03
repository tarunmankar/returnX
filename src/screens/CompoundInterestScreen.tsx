/**
 * ReturnX - Compound Interest Screen
 */

import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { ScreenHeader } from '../components/ScreenHeader';
import { InputCard } from '../components/InputCard';
import { ResultCard } from '../components/ResultCard';
import { RiskBadge } from '../components/RiskBadge';
import { FrequencySelector, Frequency, FREQUENCY_MAP } from '../components/FrequencySelector';
import { AdBannerPlaceholder } from '../components/AdBannerPlaceholder';
import { calcCompoundInterest } from '../logic/interest';
import { useAppStore } from '../store/appStore';
import { parseInput, isValidInput, formatPercent } from '../utils/format';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../constants/theme';

export default function CompoundInterestScreen() {
  const [principal, setPrincipal] = useState('100000');
  const [rate, setRate] = useState('12');
  const [years, setYears] = useState('10');
  const [frequency, setFrequency] = useState<Frequency>('Monthly');
  const [result, setResult] = useState<ReturnType<typeof calcCompoundInterest> | null>(null);
  
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  

  const principalRef = useRef(principal);
  const rateRef = useRef(rate);
  const yearsRef = useRef(years);
  const frequencyRef = useRef(frequency);
  principalRef.current = principal;
  rateRef.current = rate;
  yearsRef.current = years;
  frequencyRef.current = frequency;


  const calculate = () => {
    const P = parseInput(principalRef.current);
    const R = parseInput(rateRef.current);
    const T = parseInput(yearsRef.current);
    const n = FREQUENCY_MAP[frequency];
    if (!isValidInput(P) || R < 0 || !isValidInput(T)) return;
    const res = calcCompoundInterest(P, R, T, n);
    setResult(res);
  };

  const onPressCalculate = () => { calculate(); incrementCalcCount(); };

  const handleInput = (setter: (v: string) => void, ref: React.MutableRefObject<string>) => (text: string) => {
    ref.current = text;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => calculate(), 300);
  };

  const R = parseInput(rateRef.current);

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <ScreenHeader title="⚡ Compound Interest" subtitle="A = P(1 + r/n)^(nt)" />

        <View style={styles.section}>
          <InputCard
            label="Deposit Amount"
            defaultValue={principal}
            onChangeText={handleInput(setPrincipal, principalRef)} prefix="₹" placeholder="1,00,000" />
          <InputCard
            label="Interest Rate"
            defaultValue={rate}
            onChangeText={handleInput(setRate, rateRef)} prefix="" suffix="%" placeholder="12" keyboardType="decimal-pad" />
          <InputCard
            label="Tenure (Years)"
            defaultValue={years}
            onChangeText={handleInput(setYears, yearsRef)} prefix="" suffix="Years" placeholder="10" />
          <FrequencySelector label="Compounding Frequency" value={frequency} onChange={(f) => { setFrequency(f); setTimeout(() => calculate(), 100); }} options={['Monthly', 'Quarterly', 'Yearly']} />
          {R > 0 && <RiskBadge rate={R} showDescription />}
        </View>

        <TouchableOpacity style={styles.calcBtn} onPress={onPressCalculate} activeOpacity={0.8}>
          <Text style={styles.calcBtnText}>Calculate ⚡</Text>
        </TouchableOpacity>

        {result && (
          <View style={styles.section}>
            <ResultCard
              title="Compound Interest Result"
              mainAmount={result.totalAmount}
              mainLabel="Maturity Amount"
              rows={[
                { label: 'Principal (P)', value: result.principal },
                { label: 'Compound Interest', value: result.interest, highlight: true, color: COLORS.accent },
                { label: 'Nominal Rate', value: result.rate, isPercent: true },
                { label: 'Effective Annual Rate', value: result.effectiveRate, isPercent: true, color: COLORS.accentLight },
                { label: 'Compounding', value: result.frequency, isPercent: false, suffix: 'x/year' },
              ]}
              disclaimer="Results are estimates. Not financial advice."
            />
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
  screenSubtitle: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textSecondary, fontFamily: 'monospace' },
  section: { padding: SPACING.base },
  calcBtn: { backgroundColor: COLORS.accent, borderRadius: RADIUS.lg, marginHorizontal: SPACING.base, paddingVertical: SPACING.base, alignItems: 'center', shadowColor: COLORS.accent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6 },
  calcBtnText: { color: COLORS.primary, fontSize: TYPOGRAPHY.fontSize.md, fontWeight: TYPOGRAPHY.fontWeight.bold, letterSpacing: 0.5 },
});
