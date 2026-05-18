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
import { calcInflationAdjustedValue, calcLumpSum, calcRequiredLumpSumForGoal } from '../logic/sip';
import { OptionChips } from '../components/OptionChips';
import { useAppStore } from '../store/appStore';
import { parseInput, isValidInput, formatINR, formatINRShort } from '../utils/format';
import { shareToWhatsApp } from '../utils/share';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../constants/theme';
import { MARKET_RETURN_WARNING } from '../constants/compliance';

export default function LumpSumScreen() {
  const [amount, setAmount] = useState('100000');
  const [rate, setRate] = useState('12');
  const [years, setYears] = useState('10');
  const [goalAmount, setGoalAmount] = useState('');
  const [inflationRate, setInflationRate] = useState('6');
  const [result, setResult] = useState<ReturnType<typeof calcLumpSum> | null>(null);
  const { incrementCalcCount, saveCalculation } = useAppStore();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const amountRef = useRef(amount);
  const rateRef = useRef(rate);
  const yearsRef = useRef(years);
  const goalRef = useRef(goalAmount);
  const inflationRef = useRef(inflationRate);

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
      inputs: {
        amount: parseInput(amountRef.current),
        rate: parseInput(rateRef.current),
        years: parseInput(yearsRef.current),
        goal: parseInput(goalRef.current),
      },
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
  const currentGoal = parseInput(goalAmount);
  const currentInflation = parseInput(inflationRate);
  const inflationAdjustedValue = result
    ? calcInflationAdjustedValue(result.futureValue, currentInflation, parseInput(yearsRef.current))
    : 0;
  const requiredLumpSum = currentGoal > 0
    ? calcRequiredLumpSumForGoal(currentGoal, parseInput(rateRef.current), parseInput(yearsRef.current))
    : 0;

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
          <InputCard
            label="Goal Corpus (Optional)"
            defaultValue={goalAmount}
            onChangeText={handleInput(setGoalAmount, goalRef)} prefix="₹" placeholder="50,00,000"
            hint="Target corpus dalo to required one-time amount niklega" />
          <InputCard
            label="Inflation Rate"
            defaultValue={inflationRate}
            onChangeText={handleInput(setInflationRate, inflationRef)} prefix="" suffix="%" placeholder="6"
            keyboardType="decimal-pad" hint="Nominal return ko today's buying power me convert karta hai" />
          {R > 0 && <RiskBadge rate={R} showDescription />}

          <OptionChips
            label="Popular Horizons"
            options={[
              { label: '5Y', value: '5' },
              { label: '10Y', value: '10' },
              { label: '15Y', value: '15' },
            ]}
            value={years}
            onChange={(value) => {
              setYears(value);
              yearsRef.current = value;
              setTimeout(() => calculate(), 100);
            }}
          />
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
                { label: 'Inflation-Adjusted Value', value: inflationAdjustedValue, color: COLORS.warning },
                { label: 'Wealth Multiplier', value: result.wealthRatio, isPercent: false, suffix: 'x', color: COLORS.accentLight },
              ]}
              disclaimer={MARKET_RETURN_WARNING}
            />

            {currentGoal > 0 && (
              <ResultCard
                title="Goal Planning"
                mainAmount={requiredLumpSum}
                mainLabel="Required One-Time Investment"
                accentColor={COLORS.warning}
                rows={[
                  { label: 'Target Corpus', value: currentGoal },
                  { label: 'Current Projection', value: result.futureValue, color: COLORS.accent },
                  { label: 'Gap / Surplus', value: result.futureValue - currentGoal, color: result.futureValue >= currentGoal ? COLORS.accent : COLORS.risk },
                ]}
                disclaimer="Goal estimate assumes the same return and tenure inputs. Actual market returns may vary."
              />
            )}
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
