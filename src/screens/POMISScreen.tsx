import React, { useState, useRef } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Text } from 'react-native';
import { ScreenHeader } from '../components/ScreenHeader';
import { InputCard } from '../components/InputCard';
import { ResultCard } from '../components/ResultCard';
import { ResultActions } from '../components/ResultActions';
import { RateBanner } from '../components/RateBanner';
import { ErrorMessage, validateInputs } from '../components/ErrorMessage';
import { DonutChart } from '../components/DonutChart';
import { calcPOMIS } from '../logic/pomis';
import { useAppStore } from '../store/appStore';
import { parseInput, formatINR, formatINRShort } from '../utils/format';
import { shareToWhatsApp } from '../utils/share';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../constants/theme';

export default function POMISScreen() {
  const [principal, setPrincipal] = useState('900000');
  const [rate, setRate] = useState('7.4');
  const [result, setResult] = useState<ReturnType<typeof calcPOMIS> | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { incrementCalcCount, saveCalculation } = useAppStore();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const principalRef = useRef(principal);
  const rateRef = useRef(rate);
  principalRef.current = principal;
  rateRef.current = rate;

  const calculate = () => {
    const P = parseInput(principalRef.current);
    const R = parseInput(rateRef.current);
    const validation = validateInputs({
      principal: { value: P, label: 'Deposit Amount', min: 1000, max: 1500000 },
      rate: { value: R, label: 'Interest Rate', min: 1, max: 15 },
    });
    setErrors(validation.errors);
    if (!validation.valid) return;
    const res = calcPOMIS(P, R);
    setResult(res);
  };

  const onPressCalculate = () => { calculate(); incrementCalcCount(); };

  const handleSave = () => {
    if (!result) return;
    saveCalculation({
      type: 'POMIS',
      label: `POMIS ${formatINRShort(parseInput(principalRef.current))}`,
      result: result.monthlyPayout,
      inputs: { amount: parseInput(principalRef.current), rate: parseInput(rateRef.current) },
    });
  };

  const handleShare = () => {
    if (!result) return;
    shareToWhatsApp('POMIS Calculation', [
      `Deposit Amount: ${formatINR(parseInput(principalRef.current))}`,
      `Interest Rate: ${rateRef.current}%`,
      `Tenure: 5 Years`,
      `*Monthly Payout: ${formatINR(result.monthlyPayout)}*`,
      `*Total Interest: ${formatINR(result.totalInterestEarned)}*`
    ]);
  };

  const handleInput = (setter: (v: string) => void, ref: React.MutableRefObject<string>) => (text: string) => {
    ref.current = text;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => calculate(), 300);
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <ScreenHeader title="📮 POMIS Calculator" subtitle="Post Office Monthly Income Scheme" />

        {/* Compact top banner with inline editable rate */}
        <RateBanner
          defaultRate={rate}
          onRateChange={handleInput(setRate, rateRef)}
          details={"Max: ₹9L (Single) / ₹15L (Joint)\nTenure: 5 Years | Payout: Monthly"}
          accentColor={COLORS.warning}
        />
        {errors.rate ? <Text style={styles.rateError}>{errors.rate}</Text> : null}

        <View style={styles.section}>
          <InputCard
            label="Deposit Amount"
            defaultValue={principal}
            onChangeText={handleInput(setPrincipal, principalRef)}
            prefix="₹"
            placeholder="9,00,000"
            hint="Max ₹9L for Single, ₹15L for Joint Account"
          />
          <ErrorMessage message={errors.principal || null} />

          <View style={styles.presetRow}>
            <Text style={styles.presetLabel}>Quick Fills:</Text>
            {[
              { label: '₹5L', value: '500000' },
              { label: '₹9L (Single Max)', value: '900000' },
              { label: '₹15L (Joint Max)', value: '1500000' }
            ].map((p) => (
              <TouchableOpacity key={p.value} style={styles.presetChip} onPress={() => { setPrincipal(p.value); principalRef.current = p.value; setTimeout(() => calculate(), 100); }}>
                <Text style={styles.presetChipText}>{p.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.calcBtn} onPress={onPressCalculate} activeOpacity={0.8}>
          <Text style={styles.calcBtnText}>Calculate Payout</Text>
        </TouchableOpacity>

        {result && (
          <View style={styles.section}>
            <ResultCard
              title="POMIS Earnings"
              mainAmount={result.monthlyPayout}
              mainLabel="Monthly Payout (Every Month)"
              accentColor={COLORS.warning}
              principalAmount={result.principal}
              interestAmount={result.totalInterestEarned}
              rows={[
                { label: 'Total Interest (5 Yrs)', value: result.totalInterestEarned },
                { label: '💰 Total Return (Principal + Interest)', value: result.totalReturns, highlight: true, color: COLORS.warning },
              ]}
              disclaimer="Interest earned is taxable as per your income tax slab. No TDS is deducted by Post Office."
            />
            <DonutChart
              title="Principal vs Interest"
              segments={[
                { value: result.principal, color: COLORS.primaryLight, label: 'Deposit' },
                { value: result.totalInterestEarned, color: COLORS.warning, label: 'Interest Earned' },
              ]}
              centerLabel="Total Value"
              centerValue={result.totalReturns}
            />

            <ResultActions onSave={handleSave} onShare={handleShare} />
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primaryDark },
  content: { paddingBottom: SPACING.xxxl },
  section: { padding: SPACING.base },
  rateError: { fontSize: TYPOGRAPHY.fontSize.xs, color: COLORS.risk, marginHorizontal: SPACING.base, marginTop: 4 },
  presetRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, flexWrap: 'wrap', marginTop: SPACING.xs },
  presetLabel: { fontSize: TYPOGRAPHY.fontSize.xs, color: COLORS.textMuted },
  presetChip: { backgroundColor: COLORS.surfaceCard, borderRadius: RADIUS.full, paddingHorizontal: SPACING.md, paddingVertical: 4, borderWidth: 1, borderColor: COLORS.border },
  presetChipText: { fontSize: TYPOGRAPHY.fontSize.xs, color: COLORS.warning, fontWeight: TYPOGRAPHY.fontWeight.semibold },
  calcBtn: { backgroundColor: COLORS.warning, borderRadius: RADIUS.lg, marginHorizontal: SPACING.base, paddingVertical: SPACING.base, alignItems: 'center', shadowColor: COLORS.warning, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6 },
  calcBtnText: { color: COLORS.primaryDark, fontSize: TYPOGRAPHY.fontSize.md, fontWeight: TYPOGRAPHY.fontWeight.bold, letterSpacing: 0.5 },
});
