import React, { useState, useRef } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Text } from 'react-native';
import { ScreenHeader } from '../components/ScreenHeader';
import { InputCard } from '../components/InputCard';
import { ResultCard } from '../components/ResultCard';
import { RateBanner } from '../components/RateBanner';
import { ErrorMessage, validateInputs } from '../components/ErrorMessage';
import { DonutChart } from '../components/DonutChart';
import { calcSCSS } from '../logic/scss';
import { useAppStore } from '../store/appStore';
import { parseInput } from '../utils/format';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../constants/theme';

export default function SCSSScreen() {
  const [principal, setPrincipal] = useState('1500000');
  const [rate, setRate] = useState('8.2');
  const [result, setResult] = useState<ReturnType<typeof calcSCSS> | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { addHistory, incrementCalcCount } = useAppStore();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const principalRef = useRef(principal);
  const rateRef = useRef(rate);
  principalRef.current = principal;
  rateRef.current = rate;

  const calculate = () => {
    const P = parseInput(principalRef.current);
    const R = parseInput(rateRef.current);
    const validation = validateInputs({
      principal: { value: P, label: 'Deposit Amount', min: 1000, max: 3000000 },
      rate: { value: R, label: 'Interest Rate', min: 1, max: 15 },
    });
    setErrors(validation.errors);
    if (!validation.valid) return;
    const res = calcSCSS(P, R);
    setResult(res);
  };

  const onPressCalculate = () => { calculate(); incrementCalcCount(); };

  const handleInput = (setter: (v: string) => void, ref: React.MutableRefObject<string>) => (text: string) => {
    ref.current = text;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => calculate(), 300);
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <ScreenHeader title="👴 SCSS Calculator" subtitle="Senior Citizen Savings Scheme" />

        {/* Compact top banner with inline editable rate */}
        <RateBanner
          defaultRate={rate}
          onRateChange={handleInput(setRate, rateRef)}
          details={"Max Limit: ₹30 Lakh\nTenure: 5 Years\nPayout: Quarterly"}
          accentColor={COLORS.chart2}
        />
        {errors.rate ? <Text style={styles.rateError}>{errors.rate}</Text> : null}

        <View style={styles.section}>
          <InputCard
            label="Deposit Amount"
            defaultValue={principal}
            onChangeText={handleInput(setPrincipal, principalRef)}
            prefix="₹"
            placeholder="15,00,000"
            hint="Min ₹1,000 | Max ₹30,00,000"
          />
          <ErrorMessage message={errors.principal || null} />

          <View style={styles.presetRow}>
            <Text style={styles.presetLabel}>Quick Fills:</Text>
            {[
              { label: '₹5L', value: '500000' },
              { label: '₹15L', value: '1500000' },
              { label: '₹30L (Max)', value: '3000000' }
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
              title="SCSS Earnings"
              mainAmount={result.quarterlyPayout}
              mainLabel="Quarterly Payout (Every 3 Months)"
              accentColor={COLORS.chart2}
              rows={[
                { label: 'Initial Deposit', value: result.principal },
                { label: 'Total Interest (5 Yrs)', value: result.totalInterestEarned, highlight: true, color: COLORS.chart2 },
              ]}
              disclaimer="Interest is fully taxable. TDS may be deducted if interest exceeds ₹50,000/year under Sec 80TTB."
            />
            <DonutChart
              title="Principal vs Interest"
              segments={[
                { value: result.principal, color: COLORS.primaryLight, label: 'Deposit' },
                { value: result.totalInterestEarned, color: COLORS.chart2, label: 'Interest Earned' },
              ]}
              centerLabel="Total Value"
              centerValue={result.totalReturns}
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
  presetChipText: { fontSize: TYPOGRAPHY.fontSize.xs, color: COLORS.chart2, fontWeight: TYPOGRAPHY.fontWeight.semibold },
  calcBtn: { backgroundColor: COLORS.chart2, borderRadius: RADIUS.lg, marginHorizontal: SPACING.base, paddingVertical: SPACING.base, alignItems: 'center', shadowColor: COLORS.chart2, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6 },
  calcBtnText: { color: COLORS.white, fontSize: TYPOGRAPHY.fontSize.md, fontWeight: TYPOGRAPHY.fontWeight.bold, letterSpacing: 0.5 },
});
