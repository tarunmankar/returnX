/**
 * ReturnX - Simple Interest Screen
 */

import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { ScreenHeader } from '../components/ScreenHeader';
import { InputCard } from '../components/InputCard';
import { ResultCard } from '../components/ResultCard';
import { ResultActions } from '../components/ResultActions';
import { AdBannerPlaceholder } from '../components/AdBannerPlaceholder';
import { calcSimpleInterest } from '../logic/interest';
import { useAppStore } from '../store/appStore';
import { parseInput, isValidInput, formatINR, formatINRShort } from '../utils/format';
import { shareToWhatsApp } from '../utils/share';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../constants/theme';

export default function SimpleInterestScreen() {
  const [principal, setPrincipal] = useState('100000');
  const [rate, setRate] = useState('8');
  const [years, setYears] = useState('5');
  const [result, setResult] = useState<ReturnType<typeof calcSimpleInterest> | null>(null);
  const { incrementCalcCount, saveCalculation } = useAppStore();
  
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  

  const principalRef = useRef(principal);
  const rateRef = useRef(rate);
  const yearsRef = useRef(years);
  principalRef.current = principal;
  rateRef.current = rate;
  yearsRef.current = years;


  const calculate = () => {
    const P = parseInput(principalRef.current);
    const R = parseInput(rateRef.current);
    const T = parseInput(yearsRef.current);
    if (!isValidInput(P) || R < 0 || !isValidInput(T)) return;
    const res = calcSimpleInterest(P, R, T);
    setResult(res);
  };

  const onPressCalculate = () => { calculate(); incrementCalcCount(); };

  const handleSave = () => {
    if (!result) return;
    saveCalculation({
      type: 'SimpleInterest',
      label: `SI ${formatINRShort(parseInput(principalRef.current))} @ ${rateRef.current}%`,
      result: result.totalAmount,
      inputs: { 
        principal: parseInput(principalRef.current), 
        rate: parseInput(rateRef.current), 
        years: parseInput(yearsRef.current) 
      },
    });
  };

  const handleShare = () => {
    if (!result) return;
    shareToWhatsApp('Simple Interest', [
      `Principal: ${formatINR(parseInput(principalRef.current))}`,
      `Rate: ${rateRef.current}%`,
      `Time: ${yearsRef.current} Years`,
      `*Simple Interest: ${formatINR(result.interest)}*`,
      `*Total Amount: ${formatINR(result.totalAmount)}*`
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
        <ScreenHeader title="🧮 Simple Interest" subtitle="SI = (P × R × T) / 100" />

        <View style={styles.section}>
          <InputCard
            label="Deposit Amount"
            defaultValue={principal}
            onChangeText={handleInput(setPrincipal, principalRef)} prefix="₹" placeholder="1,00,000" />
          <InputCard
            label="Interest Rate"
            defaultValue={rate}
            onChangeText={handleInput(setRate, rateRef)} prefix="" suffix="% p.a." placeholder="8" keyboardType="decimal-pad" />
          <InputCard
            label="Tenure (Years)"
            defaultValue={years}
            onChangeText={handleInput(setYears, yearsRef)} prefix="" suffix="Years" placeholder="5" />
        </View>

        <TouchableOpacity style={styles.calcBtn} onPress={onPressCalculate} activeOpacity={0.8}>
          <Text style={styles.calcBtnText}>Calculate Interest 🧮</Text>
        </TouchableOpacity>

        {result && (
          <View style={styles.section}>
            <ResultCard
              title="Simple Interest Result"
              mainAmount={result.totalAmount}
              mainLabel="Total Amount"
              principalAmount={result.principal}
              interestAmount={result.interest}
              rows={[
                { label: 'Simple Interest (SI)', value: result.interest, highlight: true, color: COLORS.accent },
                { label: 'Rate (R)', value: result.rate, isPercent: true },
                { label: 'Time (T)', value: result.time, isPercent: false, suffix: ' years' },
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
  screenSubtitle: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textSecondary, fontFamily: 'monospace' },
  section: { padding: SPACING.base },
  calcBtn: { backgroundColor: COLORS.accent, borderRadius: RADIUS.lg, marginHorizontal: SPACING.base, paddingVertical: SPACING.base, alignItems: 'center', shadowColor: COLORS.accent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6 },
  calcBtnText: { color: COLORS.primary, fontSize: TYPOGRAPHY.fontSize.md, fontWeight: TYPOGRAPHY.fontWeight.bold, letterSpacing: 0.5 },
});
