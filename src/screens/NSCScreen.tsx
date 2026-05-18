import React, { useState, useRef } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Text } from 'react-native';
import { ScreenHeader } from '../components/ScreenHeader';
import { InputCard } from '../components/InputCard';
import { ResultCard } from '../components/ResultCard';
import { ResultActions } from '../components/ResultActions';
import { RateBanner } from '../components/RateBanner';
import { ErrorMessage, validateInputs } from '../components/ErrorMessage';
import { DonutChart } from '../components/DonutChart';
import { BarChart } from '../components/BarChart';
import { calcNSC } from '../logic/nsc';
import { useAppStore } from '../store/appStore';
import { parseInput, formatINR, formatINRShort } from '../utils/format';
import { shareToWhatsApp } from '../utils/share';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../constants/theme';
import { GOVT_RATE_REVIEWED_ON, GOVT_RATE_SOURCE, GOVT_RATE_WARNING } from '../constants/compliance';

export default function NSCScreen() {
  const [principal, setPrincipal] = useState('100000');
  const [rate, setRate] = useState('7.7');
  const [result, setResult] = useState<ReturnType<typeof calcNSC> | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { addHistory, incrementCalcCount, saveCalculation } = useAppStore();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const principalRef = useRef(principal);
  const rateRef = useRef(rate);
  principalRef.current = principal;
  rateRef.current = rate;

  const calculate = () => {
    const P = parseInput(principalRef.current);
    const R = parseInput(rateRef.current);
    const validation = validateInputs({
      principal: { value: P, label: 'Deposit Amount', min: 1000 },
      rate: { value: R, label: 'Interest Rate', min: 1, max: 15 },
    });
    setErrors(validation.errors);
    if (!validation.valid) return;
    const res = calcNSC(P, R);
    setResult(res);
  };

  const onPressCalculate = () => { calculate(); incrementCalcCount(); };

  const handleSave = () => {
    if (!result) return;
    saveCalculation({
      type: 'NSC',
      label: `NSC ${formatINRShort(parseInput(principalRef.current))}`,
      result: result.maturityAmount,
      inputs: { principal: parseInput(principalRef.current), rate: parseInput(rateRef.current) },
    });
  };

  const handleShare = () => {
    if (!result) return;
    shareToWhatsApp('NSC Calculation', [
      `Deposit Amount: ${formatINR(parseInput(principalRef.current))}`,
      `Interest Rate: ${rateRef.current}%`,
      `Tenure: 5 Years`,
      `*Interest Earned: ${formatINR(result.totalInterest)}*`,
      `*Maturity Value: ${formatINR(result.maturityAmount)}*`
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
        <ScreenHeader title="📜 NSC Calculator" subtitle="National Savings Certificate" />

        {/* Compact top banner with inline editable rate */}
        <RateBanner
          defaultRate={rate}
          onRateChange={handleInput(setRate, rateRef)}
          details={"Lock-in: 5 Years | No Max Limit\nSection 80C Eligible"}
          accentColor={COLORS.accentLight}
          sourceLabel={GOVT_RATE_SOURCE}
          reviewedOn={GOVT_RATE_REVIEWED_ON}
          warningText={GOVT_RATE_WARNING}
        />
        {errors.rate ? <Text style={styles.rateError}>{errors.rate}</Text> : null}

        <View style={styles.section}>
          <InputCard
            label="Deposit Amount"
            defaultValue={principal}
            onChangeText={handleInput(setPrincipal, principalRef)}
            prefix="₹"
            placeholder="1,00,000"
            hint="Min ₹1,000 | No max limit"
          />
          <ErrorMessage message={errors.principal || null} />

          <View style={styles.presetRow}>
            <Text style={styles.presetLabel}>Quick Fills:</Text>
            {[
              { label: '₹10K', value: '10000' },
              { label: '₹50K', value: '50000' },
              { label: '₹1.5L (80C Max)', value: '150000' }
            ].map((p) => (
              <TouchableOpacity key={p.value} style={styles.presetChip} onPress={() => { setPrincipal(p.value); principalRef.current = p.value; setTimeout(() => calculate(), 100); }}>
                <Text style={styles.presetChipText}>{p.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.calcBtn} onPress={onPressCalculate} activeOpacity={0.8}>
          <Text style={styles.calcBtnText}>Calculate Maturity</Text>
        </TouchableOpacity>

        {result && (
          <View style={styles.section}>
            <ResultCard
              title="NSC Maturity Value"
              mainAmount={result.maturityAmount}
              mainLabel="Value After 5 Years"
              accentColor={COLORS.accentLight}
              principalAmount={result.principal}
              interestAmount={result.totalInterest}
              rows={[
                { label: 'Total Interest Earned', value: result.totalInterest, highlight: true, color: COLORS.accentLight },
              ]}
              disclaimer="80C eligibility depends on prevailing tax rules. Reference rate only; verify the latest govt notification before investing. Not financial advice."
            />
            <DonutChart
              title="Deposit vs Interest"
              segments={[
                { value: result.principal, color: COLORS.primaryLight, label: 'Invested' },
                { value: result.totalInterest, color: COLORS.accentLight, label: 'Interest' },
              ]}
              centerLabel="Maturity"
              centerValue={result.maturityAmount}
            />
            <ResultActions onSave={handleSave} onShare={handleShare} />
            <BarChart
              title="Yearly Interest Accrual 📊"
              data={result.yearlyData.map(y => ({
                label: `Y${y.year}`,
                value1: 0,
                value2: y.interest,
                value1Label: 'Deposit',
                value2Label: 'Interest',
              }))}
              color1={COLORS.primaryLight}
              color2={COLORS.accentLight}
            />
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
  presetChipText: { fontSize: TYPOGRAPHY.fontSize.xs, color: COLORS.accentLight, fontWeight: TYPOGRAPHY.fontWeight.semibold },
  calcBtn: { backgroundColor: COLORS.accentLight, borderRadius: RADIUS.lg, marginHorizontal: SPACING.base, paddingVertical: SPACING.base, alignItems: 'center', shadowColor: COLORS.accentLight, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6 },
  calcBtnText: { color: COLORS.primaryDark, fontSize: TYPOGRAPHY.fontSize.md, fontWeight: TYPOGRAPHY.fontWeight.bold, letterSpacing: 0.5 },
});
